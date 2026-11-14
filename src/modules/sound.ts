/**
 * Sound: an ambient soundtrack and interface sounds, all synthesised. No audio files.
 *
 * Off by default, because a portfolio that makes noise uninvited is a portfolio people close. The
 * choice persists, because being re-asked on every visit is its own kind of rude. Nothing is created
 * until the visitor opts in, and browsers will not start audio before a real gesture anyway, so a
 * remembered "on" waits for the first click or key (in practice, the loader's start button).
 *
 * Everything is in one key, D major, so the interface sounds sit inside the music instead of on top
 * of it: hovering down a list of rows plays up a pentatonic scale, and the receipt's ding is a note
 * the pad is already holding.
 *
 * The graph:
 *
 *   pad voices -> padFilter (LFO on cutoff) -+
 *   bass voices -----------------------------+-> musicBus (the on/off fade) -+-> master -> limiter -> out
 *   bells -> bellBus -+-> echo (feedback) ---+                               |
 *                     +----------------------+          musicBus --> reverb -+
 *   interface sounds -------------------------------------> sfxBus ---------+
 */

const STORAGE_KEY = 'sv:sound';

/* ------------------------------------------------------------------ music theory */

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** D major pentatonic from D5: the pool every melodic interface sound draws from. */
const PENTA = [74, 76, 78, 81, 83];

interface Chord {
  bass: number;
  pad: number[];
  /** Bell notes that sit well over this chord, low to high. The melody walks these. */
  bells: number[];
}

/*
 * Dmaj9 -> Bm11 -> Gmaj7 -> Asus2, nine seconds each. Open voicings with the third or the seventh on
 * top, so it never resolves hard and never stops sounding like it is about to: the right shape for
 * something meant to sit underneath reading.
 */
const CHORDS: Chord[] = [
  { bass: 38, pad: [50, 57, 61, 64, 66], bells: [74, 76, 78, 81, 86] },
  { bass: 35, pad: [47, 54, 57, 62, 64], bells: [71, 74, 76, 78, 83] },
  { bass: 31, pad: [43, 50, 54, 59, 61], bells: [71, 74, 78, 81, 83] },
  { bass: 33, pad: [45, 52, 59, 61, 64], bells: [69, 71, 76, 81, 83] },
];
const CHORD_LEN = 9;
/** Seconds of scheduling done ahead of the clock, so timer jitter never makes a gap. */
const LOOKAHEAD = 1.2;

/* ------------------------------------------------------------------ the engine */

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let sfxBus: GainNode;
let padFilter: BiquadFilterNode;
let bellBus: GainNode;
let noise: AudioBuffer;

let enabled = false;
let playing = false;
let timer: number | undefined;
let nextChordAt = 0;
let chordIdx = 0;
let nextBellAt = 0;
let bellStep = 2;

/** A stereo reverb tail, generated: decaying noise, so there is no impulse file to fetch. */
function makeImpulse(c: AudioContext, seconds = 3.6, decay = 2.6): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

/** Created lazily, and only from inside a gesture, per autoplay policy. */
function build(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const c = new Ctor();
  ctx = c;

  /* A gentle limiter last, so a stack of overlapping chords and a bell can never clip. */
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -16;
  limiter.knee.value = 12;
  limiter.ratio.value = 6;
  limiter.attack.value = 0.01;
  limiter.release.value = 0.4;
  limiter.connect(c.destination);

  master = c.createGain();
  master.gain.value = 0.85;
  master.connect(limiter);

  const reverb = c.createConvolver();
  reverb.buffer = makeImpulse(c);
  const wet = c.createGain();
  wet.gain.value = 0.42;
  reverb.connect(wet).connect(master);

  /* The music's own volume, which is what the toggle fades. The reverb send hangs off it, so the
   * tail fades with it rather than ringing on after the music has gone. */
  musicBus = c.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);
  musicBus.connect(reverb);

  /* The pad breathes: a very slow LFO opens and closes its low-pass, about once every 25 seconds. */
  padFilter = c.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 1000;
  padFilter.Q.value = 0.6;
  padFilter.connect(musicBus);
  const lfo = c.createOscillator();
  const depth = c.createGain();
  lfo.frequency.value = 0.04;
  depth.gain.value = 480;
  lfo.connect(depth).connect(padFilter.frequency);
  lfo.start();

  /* Bells get a dark, dotted echo, filtered inside the loop so each repeat is softer and duller. */
  bellBus = c.createGain();
  bellBus.connect(musicBus);
  const echo = c.createDelay(2);
  echo.delayTime.value = 0.48;
  const feedback = c.createGain();
  feedback.gain.value = 0.34;
  const dull = c.createBiquadFilter();
  dull.type = 'lowpass';
  dull.frequency.value = 2400;
  bellBus.connect(echo);
  echo.connect(dull).connect(feedback).connect(echo);
  dull.connect(musicBus);

  sfxBus = c.createGain();
  sfxBus.gain.value = 1;
  sfxBus.connect(master);
  const sfxSend = c.createGain();
  sfxSend.gain.value = 0.3;
  sfxBus.connect(sfxSend).connect(reverb);

  noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const n = noise.getChannelData(0);
  for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;

  return c;
}

/* ------------------------------------------------------------------ voices */

interface ToneOpts {
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  gain?: number;
  at?: number;
  dest?: AudioNode;
  detune?: number;
}

/** One enveloped oscillator: fast or slow attack, exponential tail. Cleans itself up. */
function tone(freq: number, o: ToneOpts = {}): void {
  if (!ctx) return;
  const { type = 'sine', attack = 0.006, decay = 0.2, gain = 0.03, dest = sfxBus, detune = 0 } = o;
  const t = o.at ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  /* A hard start clicks, so both ends ramp. */
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  osc.connect(env).connect(dest);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
  osc.onended = () => env.disconnect();
}

/** A sustained voice for the pad and bass: slow swell in, hold, slow release. */
function held(freq: number, at: number, hold: number, peak: number, dest: AudioNode, type: OscillatorType, detune = 0): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  const attack = 3;
  const release = 4.5;
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(peak, at + attack);
  env.gain.setValueAtTime(peak, at + hold);
  env.gain.linearRampToValueAtTime(0, at + hold + release);
  osc.connect(env).connect(dest);
  osc.start(at);
  osc.stop(at + hold + release + 0.1);
  osc.onended = () => env.disconnect();
}

function playChord(ch: Chord, at: number): void {
  /* Two slightly detuned oscillators per note: the slow beating between them is the "pad". */
  for (const m of ch.pad) {
    held(hz(m), at, CHORD_LEN, 0.022, padFilter, 'triangle', -6);
    held(hz(m), at, CHORD_LEN, 0.016, padFilter, 'sine', 7);
  }
  held(hz(ch.bass), at, CHORD_LEN, 0.07, padFilter, 'sine');
  held(hz(ch.bass + 12), at, CHORD_LEN, 0.018, padFilter, 'sine');
}

/** A soft bell: a sine and a quiet inharmonic partial, which is what makes it read as struck. */
function bell(midi: number, at: number, gain = 0.03, dest: AudioNode = bellBus): void {
  const f = hz(midi);
  tone(f, { at, attack: 0.004, decay: 2.4, gain, dest });
  tone(f * 2.76, { at, attack: 0.002, decay: 0.6, gain: gain * 0.18, dest });
}

/* ------------------------------------------------------------------ the scheduler */

function schedule(): void {
  if (!ctx || !playing) return;
  const horizon = ctx.currentTime + LOOKAHEAD;

  while (nextChordAt < horizon) {
    playChord(CHORDS[chordIdx % CHORDS.length], nextChordAt);
    chordIdx += 1;
    nextChordAt += CHORD_LEN;
  }

  /*
   * The melody is a random walk over the current chord's bell notes: mostly a step either way,
   * sometimes a rest. A walk rather than random picks, so it has a shape and does not sound like a
   * wind chime.
   */
  while (nextBellAt < horizon) {
    const current = CHORDS[(chordIdx - 1 + CHORDS.length) % CHORDS.length];
    if (Math.random() < 0.55) {
      bellStep = Math.max(0, Math.min(current.bells.length - 1, bellStep + [-1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 6)]));
      bell(current.bells[bellStep], nextBellAt, 0.022 + Math.random() * 0.012);
    }
    nextBellAt += [1.2, 1.6, 2.4, 3.2][Math.floor(Math.random() * 4)];
  }
}

function startMusic(): void {
  const c = build();
  if (!c || playing) return;
  void c.resume();
  playing = true;
  const now = c.currentTime;
  nextChordAt = Math.max(nextChordAt, now + 0.05);
  nextBellAt = Math.max(nextBellAt, now + 2.5);
  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(musicBus.gain.value, now);
  musicBus.gain.linearRampToValueAtTime(1, now + 2.5);
  schedule();
  timer = window.setInterval(schedule, 300);
}

function stopMusic(suspend = true): void {
  if (!ctx || !playing) return;
  playing = false;
  window.clearInterval(timer);
  const now = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(musicBus.gain.value, now);
  musicBus.gain.linearRampToValueAtTime(0, now + 1.2);
  /* Suspended once the fade is done: an idle AudioContext still costs battery. */
  if (suspend) {
    window.setTimeout(() => { if (!playing && ctx?.state === 'running') void ctx.suspend(); }, 1600);
  }
}

/* ------------------------------------------------------------------ interface sounds */

export type Sfx =
  | 'hover' | 'click' | 'on' | 'off'
  | 'tap' | 'submit' | 'row' | 'reject' | 'send' | 'ding' | 'verify';

/**
 * Play an interface sound. A no-op while sound is off, so callers never need to check.
 * `n` picks the note for `hover`, so neighbouring rows sound neighbouring pitches.
 */
export function sfx(name: Sfx, n = 0): void {
  if (!enabled || !ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;

  switch (name) {
    case 'hover':
      tone(hz(PENTA[((n % PENTA.length) + PENTA.length) % PENTA.length]), { decay: 0.16, gain: 0.02 });
      break;
    case 'click':
      tone(hz(86), { type: 'triangle', decay: 0.06, gain: 0.025 });
      tone(hz(81), { type: 'triangle', decay: 0.08, gain: 0.018, at: now + 0.03 });
      break;
    case 'on':
      [69, 74, 78, 81].forEach((m, i) => bell(m, now + i * 0.08, 0.035, sfxBus));
      break;
    case 'off':
      [78, 74, 69].forEach((m, i) => tone(hz(m), { at: now + i * 0.08, decay: 0.3, gain: 0.03 }));
      break;
    case 'tap':
      tone(hz(93), { type: 'triangle', decay: 0.04, gain: 0.014 });
      break;
    case 'submit':
      tone(hz(50), { decay: 0.22, gain: 0.07 });
      tone(hz(86), { type: 'triangle', decay: 0.05, gain: 0.015 });
      break;
    case 'row':
      tone(hz(81), { type: 'triangle', decay: 0.5, gain: 0.025 });
      tone(hz(88), { decay: 0.35, gain: 0.012, at: now + 0.06 });
      break;
    case 'reject':
      tone(hz(58), { type: 'triangle', decay: 0.18, gain: 0.04 });
      tone(hz(55), { type: 'triangle', decay: 0.28, gain: 0.04, at: now + 0.14 });
      break;
    case 'send': {
      /* A filtered noise swoop: the receipt leaving for WhatsApp. */
      const src = ctx.createBufferSource();
      const bp = ctx.createBiquadFilter();
      const env = ctx.createGain();
      src.buffer = noise;
      bp.type = 'bandpass';
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(500, now);
      bp.frequency.exponentialRampToValueAtTime(3800, now + 0.28);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.05, now + 0.06);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      src.connect(bp).connect(env).connect(sfxBus);
      src.start(now);
      src.stop(now + 0.35);
      break;
    }
    case 'ding':
      bell(86, now, 0.04, sfxBus);
      break;
    case 'verify':
      bell(81, now, 0.035, sfxBus);
      bell(86, now + 0.11, 0.035, sfxBus);
      break;
  }
}

/* ------------------------------------------------------------------ the toggle */

export function initSound(root: ParentNode = document): void {
  const button = root.querySelector<HTMLButtonElement>('.js-footer_sound');
  if (!button) return;

  try {
    enabled = localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    // Private browsing or blocked storage: default off and carry on.
  }

  const paint = () => {
    button.dataset.state = enabled ? 'on' : 'off';
    button.setAttribute('aria-pressed', String(enabled));
  };

  button.addEventListener('click', () => {
    enabled = !enabled;
    paint();
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
      // Non-fatal: the toggle still works for this session.
    }
    if (enabled) {
      startMusic();
      sfx('on');
    } else {
      /* Played before the flag drops would be too late: sfx() is gated on `enabled`. */
      if (ctx) [78, 74, 69].forEach((m, i) => tone(hz(m), { at: ctx!.currentTime + i * 0.08, decay: 0.3, gain: 0.03 }));
      stopMusic();
    }
  });

  /*
   * A remembered "on" can only start inside a gesture. The first one anywhere will do; on this site
   * that is almost always the loader's start button, so the music arrives with the page.
   */
  const wake = () => {
    window.removeEventListener('pointerdown', wake, true);
    window.removeEventListener('keydown', wake, true);
    if (enabled) startMusic();
  };
  window.addEventListener('pointerdown', wake, true);
  window.addEventListener('keydown', wake, true);

  /* Quiet in a background tab, and back where it was on return. */
  document.addEventListener('visibilitychange', () => {
    if (!enabled || !ctx) return;
    if (document.hidden) stopMusic();
    else startMusic();
  });

  /*
   * Interactive rows get a note each. Indexed within their own list, so sweeping down the projects or
   * the contact links plays up the scale rather than jumping around it.
   */
  root.querySelectorAll<HTMLElement>('.js-cursor-contract').forEach((el) => {
    if (el === button) return;
    const siblings = el.parentElement ? Array.from(el.parentElement.children) : [el];
    const i = siblings.indexOf(el);
    el.addEventListener('pointerenter', () => sfx('hover', i));
  });

  /* A soft click on anything that is actually a control. The toggle has its own chime. */
  document.addEventListener('click', (e) => {
    const t = (e.target as Element | null)?.closest('a[href], button');
    if (t && t !== button && !button.contains(t)) sfx('click');
  });

  paint();
}

/**
 * Assemble the email address at runtime.
 *
 * Kept out of the served markup so it isn't harvested straight out of the HTML, while staying
 * a real, clickable mailto for anyone using the page.
 */
export function initEmail(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.js-email').forEach((el) => {
    const { user, domain } = el.dataset;
    if (!user || !domain) return;
    const address = `${user}@${domain}`;
    el.textContent = address;
    const link = el.closest('a');
    if (link) link.setAttribute('href', `mailto:${address}`);
  });
}
