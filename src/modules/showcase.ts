/**
 * The featured-project panel.
 *
 * Occupies the slot the reference gives a video reel. Instead of footage it holds the flagship
 * project's own interface, rebuilt from its components and animated. It grows as it scrolls into
 * view, which is the reference's behaviour, and the whole panel links through to the live app,
 * because there is nothing here to play or pause.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './env';
import { sfx } from './sound';

/* ------------------------------------------------------------------ the data */

interface Donation {
  name: string;
  amount: string;
  /** One of the form's purpose pills, by its short label. */
  purpose: string;
  mode: 'Cash' | 'UPI';
  time: string;
  /** The idempotency key the client generates. Shown truncated, the way a log would. */
  txn: string;
  /** Weak signal: the volunteer taps Submit twice, and the retry is the one the ledger refuses. */
  weak?: boolean;
}

/** The pill labels are shortened to fit the phone; the ledger and the verify page use the full names. */
const PURPOSE: Record<string, string> = {
  General: 'General Donation',
  Cultural: 'Cultural Program',
};
const purposeName = (p: string) => PURPOSE[p] ?? p;

/** Ganesh Chaturthi 2026. GPMS receipt IDs are RCT-YYYYMMDD-NNNNN (ReceiptService.gs). */
const DAY_ID = '20260914';
const DAY = '14 Sept 2026';
const COLLECTOR = 'Amit S.';

const rid = (n: number) => `RCT-${DAY_ID}-${String(n).padStart(5, '0')}`;
const inr = (a: string) => `₹${Number(a).toLocaleString('en-IN')}`;

/*
 * The evening so far. Ballast for the ledger, so the write lands in a sheet that already has a night's
 * collection in it rather than in an empty grid. Invented donors; real formats.
 */
const EARLIER: Array<[string, string, Donation['mode'], string]> = [
  ['Priya Sharma', '101', 'UPI', 'General'],
  ['Mohan Lal', '51', 'Cash', 'Prasad'],
  ['Kavita Singh', '251', 'UPI', 'Decoration'],
  ['Rajesh Gupta', '1001', 'Cash', 'Murti'],
  ['Neha Jha', '101', 'Cash', 'General'],
  ['Suresh Yadav', '501', 'UPI', 'Cultural'],
  ['Pooja Mishra', '51', 'Cash', 'Prasad'],
  ['Deepak Roy', '251', 'Cash', 'General'],
  ['Anjali Das', '101', 'UPI', 'Murti'],
];
const FIRST_NEW = 133 + EARLIER.length;

/** Three donations, in order, into one ledger that keeps every row the previous ones wrote. */
const TURNS: Donation[] = [
  { name: 'Ramesh Kumar', amount: '501', purpose: 'Murti', mode: 'Cash', time: '7:12 pm', txn: '3f9a' },
  { name: 'Sunita Devi', amount: '1001', purpose: 'Prasad', mode: 'UPI', time: '7:14 pm', txn: '7c21', weak: true },
  { name: 'Anil Verma', amount: '251', purpose: 'Decoration', mode: 'Cash', time: '7:17 pm', txn: 'b84e' },
];

/** Rows the sheet shows before the oldest one scrolls off the top. */
const MAX_ROWS = 13;

/* ------------------------------------------------------------------ the demo */

/**
 * The featured panel's demo: one donation's whole trip through GPMS, on a loop.
 *
 * The volunteer fills in the real form; the ledger takes the row under the script lock; the receipt
 * goes out on WhatsApp; the donor scans its QR and gets the verify page. The second turn is the case
 * the system was hardened for: one bar of signal, Submit tapped twice, and the transaction ID lets the
 * first write land and turns the retry away. The ledger is never re-rendered between turns, so every
 * row written stays written, which is the point of a ledger.
 */
function initReel(root: ParentNode): void {
  const stage = root.querySelector<HTMLElement>('.js-gpms');
  if (!stage) return;

  const q = <T extends HTMLElement = HTMLElement>(sel: string) => stage.querySelector<T>(sel);
  const form = q('.js-gpms-form');
  const done = q('.js-gpms-done');
  const nameEl = q('.js-gpms-name');
  const amtEl = q('.js-gpms-amt');
  const presets = q('.js-gpms-presets');
  const purposes = q('.js-gpms-purposes');
  const modes = q('.js-gpms-modes');
  const submit = q('.js-gpms-submit');
  const ridEl = q('.js-gpms-rid');
  const donorEl = q('.js-gpms-donor');
  const sumEl = q('.js-gpms-sum');
  const wa = q('.js-gpms-wa');
  const toast = q('.js-gpms-toast');
  const lock = q('.js-gpms-lock');
  const rowsBox = q('.js-gpms-rows');
  const log = q('.js-gpms-log');
  const scan = q('.js-gpms-scan');
  const beam = q('.js-gpms-beam');
  const valid = q('.js-gpms-valid');
  const dl = q('.js-gpms-dl');
  const sig = q('.js-gpms-sig');
  if (
    !form || !done || !nameEl || !amtEl || !presets || !purposes || !modes || !submit || !ridEl
    || !donorEl || !sumEl || !wa || !toast || !lock || !rowsBox || !log || !scan || !beam || !valid
    || !dl
  ) return;

  const nameIn = nameEl.parentElement as HTMLElement;
  const amtIn = amtEl.parentElement as HTMLElement;
  const pick = (box: HTMLElement, v: string) => box.querySelector<HTMLElement>(`[data-v="${v}"]`);

  /* --- the ledger --- */

  const makeRow = (n: number, name: string, amount: string, mode: string, purpose: string, opts: { fresh?: boolean; dup?: boolean } = {}) => {
    const el = document.createElement('span');
    el.className = `gpms_row${opts.fresh || opts.dup ? ' gpms_row__new' : ''}${opts.dup ? ' gpms_row__dup' : ''}`;
    el.innerHTML = `
      <span class="gpms_id">${rid(n)}</span>
      <span>${opts.dup ? 'retry, same txn' : name}</span>
      <span class="gpms_amt">${inr(amount)}</span>
      <span>${mode}</span>
      <span>${purposeName(purpose)}</span>
      <span class="gpms_badge">${opts.dup ? 'Rejected' : 'Active'}</span>`;
    return el;
  };

  EARLIER.forEach(([name, amount, mode, purpose], i) => {
    rowsBox.append(makeRow(133 + i, name, amount, mode, purpose));
  });

  const ROW_H = 38;
  /** Opens a row that was created collapsed. */
  const open = (tl: gsap.core.Timeline, row: HTMLElement, at: number) =>
    tl.to(row, {
      height: ROW_H, opacity: 1, borderBottomColor: '#f0ebdf', duration: 0.45, ease: 'power2.out',
      onComplete: () => row.classList.remove('gpms_row__new'),
    }, at);
  const close = (tl: gsap.core.Timeline, row: HTMLElement, at: number) =>
    tl.to(row, {
      height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => row.remove(),
    }, at);

  /* --- the two receipts --- */

  const fillReceipt = (d: Donation, n: number) => {
    ridEl.textContent = rid(n);
    donorEl.textContent = d.name;
    sumEl.textContent = inr(d.amount);
    dl.innerHTML = ([
      ['Receipt ID', rid(n), ''],
      ['Donor Name', d.name, ''],
      ['Amount', inr(d.amount), ' gpms_dt__amt'],
      ['Purpose', purposeName(d.purpose), ''],
      ['Collected By', COLLECTOR, ''],
      ['Date', `${DAY}, ${d.time}`, ''],
    ] as const).map(([k, v, c]) => `<span class="gpms_dt${c}"><span>${k}</span><span>${v}</span></span>`).join('');
  };

  /** The form as a volunteer opens it: empty, nothing selected. */
  const resetForm = (d: Donation) => {
    nameEl.textContent = '';
    amtEl.textContent = '0';
    stage.querySelectorAll('.gpms_pill.is-on, .gpms_mode.is-on').forEach((p) => p.classList.remove('is-on'));
    nameIn.classList.add('is-focus');
    amtIn.classList.remove('is-focus');
    sig?.classList.toggle('is-weak', !!d.weak);
    lock.classList.remove('is-on');
    gsap.set(toast, { opacity: 0, y: 6 });
    gsap.set(beam, { opacity: 0, y: 0 });
  };

  /*
   * Reduced motion gets the first donation already made: the receipt on the volunteer's phone, the
   * row in the ledger, the verify page on the donor's. Everything the loop says, with nothing moving.
   */
  if (prefersReducedMotion()) {
    const d = TURNS[0];
    rowsBox.append(makeRow(FIRST_NEW, d.name, d.amount, d.mode, d.purpose));
    fillReceipt(d, FIRST_NEW);
    log.textContent = `appendRow ${rid(FIRST_NEW)} · txn ${d.txn}… · ok`;
    gsap.set([done, valid], { opacity: 1 });
    nameIn.classList.remove('is-focus');
    return;
  }

  let turn = 0;
  let seq = FIRST_NEW;
  let live: gsap.core.Timeline | null = null;
  let onScreen = false;

  const play = () => {
    const d = TURNS[turn % TURNS.length];
    const n = seq;
    const first = turn === 0;

    const tl = gsap.timeline({ onComplete: () => { turn += 1; seq += 1; if (onScreen) play(); } });

    /* Back to an empty form and an idle scanner. The ledger is left exactly as it stands. */
    tl.to([done, valid], { opacity: 0, duration: first ? 0 : 0.4, ease: 'power2.in' }, 0)
      .add(() => resetForm(d), first ? 0 : 0.4);

    /*
     * The name, typed. A tween on a plain counter, sliced into the node, with the step count set to the
     * character count so it lands exactly on the last letter.
     */
    const t0 = first ? 0.5 : 0.8;
    const typeFor = 0.06 * d.name.length;
    const cur = { i: 0 };
    tl.to(cur, {
      i: d.name.length,
      duration: typeFor,
      ease: `steps(${d.name.length})`,
      onUpdate: () => { nameEl.textContent = d.name.slice(0, Math.round(cur.i)); },
    }, t0);

    /* Amount by preset chip, then purpose, then mode: the order the form asks for them. */
    const t1 = t0 + typeFor + 0.35;
    const preset = pick(presets, d.amount);
    const purpose = pick(purposes, d.purpose);
    const mode = pick(modes, d.mode);
    tl.add(() => {
      nameIn.classList.remove('is-focus');
      amtIn.classList.add('is-focus');
      preset?.classList.add('is-on');
      amtEl.textContent = Number(d.amount).toLocaleString('en-IN');
    }, t1);
    /* immediateRender off: built up front, a fromTo would otherwise shrink the chip straight away. */
    const pop = (el: HTMLElement | null, at: number, from = 0.9) => {
      if (el) tl.fromTo(el, { scale: from }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, at);
      tl.add(() => sfx('tap'), at);
    };
    pop(preset, t1);

    const t2 = t1 + 0.6;
    tl.add(() => { amtIn.classList.remove('is-focus'); purpose?.classList.add('is-on'); }, t2);
    pop(purpose, t2);

    const t3 = t2 + 0.55;
    tl.add(() => mode?.classList.add('is-on'), t3);
    pop(mode, t3, 0.95);

    /* Submit. On one bar of signal it gets tapped again before the first tap has come back. */
    const t4 = t3 + 0.65;
    const press = (at: number) =>
      tl.to(submit, { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, at)
        .add(() => sfx('submit'), at);
    press(t4);
    if (d.weak) press(t4 + 0.32);

    /* The write: lock taken, row appended, lock released. */
    const t5 = t4 + 0.25;
    tl.add(() => {
      lock.classList.add('is-on');
      lock.textContent = 'LockService · held';
      log.textContent = `appendRow ${rid(n)} · txn ${d.txn}…`;
    }, t5);

    const t6 = t5 + 0.5;
    const row = makeRow(n, d.name, d.amount, d.mode, d.purpose, { fresh: true });
    tl.add(() => { rowsBox.append(row); sfx('row'); }, t6);
    open(tl, row, t6);
    tl.fromTo(row, { backgroundColor: '#fdf3dc' }, { backgroundColor: 'rgba(253, 243, 220, 0)', duration: 1.8, ease: 'power1.in' }, t6 + 0.45);

    /* Keep the sheet to one screen: the oldest row leaves the top as the newest joins the bottom. */
    tl.add(() => {
      const rows = Array.from(rowsBox.children).filter((r) => !r.classList.contains('gpms_row__dup'));
      if (rows.length > MAX_ROWS) {
        const oldest = rows[0] as HTMLElement;
        gsap.to(oldest, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => oldest.remove() });
      }
    }, t6 + 0.05);

    let t7 = t6 + 0.65;
    tl.add(() => { log.textContent = `appendRow ${rid(n)} · txn ${d.txn}… · ok`; }, t6 + 0.4);

    if (d.weak) {
      /* The retry arrives with the same transaction ID, and is shown being turned away. */
      const dup = makeRow(n, d.name, d.amount, d.mode, d.purpose, { dup: true });
      const at = t6 + 0.7;
      tl.add(() => {
        rowsBox.append(dup);
        sfx('reject');
        log.textContent = `retry · txn ${d.txn}… already written · rejected`;
      }, at);
      open(tl, dup, at);
      close(tl, dup, at + 1.6);
      t7 = at + 1.1;
    }

    tl.add(() => {
      lock.classList.remove('is-on');
      lock.textContent = 'LockService';
    }, t7);

    /* The volunteer's success card, then the receipt out over WhatsApp. */
    const t8 = t7 + 0.15;
    tl.add(() => { fillReceipt(d, n); sfx('ding'); }, t8)
      .to(done, { opacity: 1, duration: 0.4, ease: 'power2.out' }, t8);

    const t9 = t8 + 0.9;
    tl.to(wa, { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t9)
      .add(() => sfx('send'), t9 + 0.1)
      .to(toast, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t9 + 0.15);

    /* The donor scans it, and the verify page confirms the receipt against the ledger. */
    const t10 = t9 + 0.5;
    tl.set(beam, { opacity: 1, y: 0 }, t10)
      .to(beam, { y: 148, duration: 0.55, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t10)
      .set(beam, { opacity: 0 }, t10 + 1.1);

    const t11 = t10 + 1.2;
    tl.add(() => sfx('verify'), t11)
      .to(valid, { opacity: 1, duration: 0.4, ease: 'power2.out' }, t11)
      /* Its rows were only written by fillReceipt() above, so they are looked up when this runs. */
      .add(() => {
        gsap.from(Array.from(dl.children), { opacity: 0, y: 4, duration: 0.3, stagger: 0.07, ease: 'power2.out' });
      }, t11 + 0.15);

    /* Hold on the finished state long enough to read it. */
    tl.to({}, { duration: 3 }, t11 + 0.6);

    live = tl;
  };

  /*
   * Only runs while it is on screen, which for a chained loop means gating the handoff as well as
   * pausing the current turn: without `onScreen` the onComplete would keep queueing turns forever
   * behind six other sections.
   */
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          if (live) live.play();
          else play();
        } else {
          live?.pause();
        }
      }
    },
    { threshold: 0.2 },
  );
  io.observe(stage);
}

export function initShowcase(root: ParentNode = document): void {
  const panel = root.querySelector<HTMLElement>('.js-videoPlayer');
  if (!panel) return;

  /*
   * The window grows as the section rises, which is what the reference does with its reel: it enters
   * inset to the content column and expands as it scrolls up. Measured on the reference at a 1440
   * viewport, from x238-1201 to x0-1440.
   *
   * A scale rather than the clip-path reveal this used to do. A clip-path uncovers more of a
   * fixed-size thing; the reference's reel actually gets bigger.
   */
  const stage = root.querySelector<HTMLElement>('.js-gpms');

  /*
   * The two ends of the scale, measured rather than guessed, because they depend on the viewport in a
   * way calc() cannot express. Recomputed on resize.
   */
  const scaler = root.querySelector<HTMLElement>('.gpms_scale');
  /* These MUST match the .gpms_win rules in sections.css, including the narrow breakpoint. */
  const WIDE = { w: 1280, h: 800 };
  const NARROW = { w: 420, h: 640 };
  const measure = () => {
    if (!scaler) return;
    const d = window.matchMedia('(max-width: 767px)').matches ? NARROW : WIDE;
    /*
     * Stops short of the edges. A margin on every side keeps it reading as a window onto the project
     * rather than as the page having been replaced by it, and it leaves the fixed chrome sitting on
     * the page instead of on top of the interface.
     *
     * Bounded on BOTH axes, so the inset is honoured whichever one runs out first, and derived from
     * the smaller viewport dimension so it stays proportionate on a phone.
     */
    const pad = Math.max(20, Math.min(window.innerWidth, window.innerHeight) * 0.045);
    /*
     * Wider at the sides on the wide layout, to clear the fixed chrome: the logo and socials rail on
     * the left and the nav on the right sit about 9.5vw in from each edge (they are sized in rem, which
     * this site scales with vw). Without it the nav landed on the app bar's URL.
     */
    const padX = d === WIDE ? Math.max(pad, window.innerWidth * 0.095) : pad;
    const fit = Math.min((window.innerWidth - padX * 2) / d.w, (window.innerHeight - pad * 2) / d.h);
    scaler.style.setProperty('--s1', fit.toFixed(4));
    scaler.style.setProperty('--s0', (fit * 0.6).toFixed(4));
  };

  /*
   * The section's own offset down the document, so the spotlight label can convert the masker's
   * document-space `--y` into a local one. Layout-dependent but not scroll-dependent, so it is
   * measured here rather than every frame.
   *
   * Written to every copy of the section: the label lives in the red layer, but keeping the rule
   * layer-agnostic means neither has to know which one it is.
   */
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.videoPlayer'));
  const locate = () => {
    for (const el of sections) {
      el.style.setProperty('--sec-top', `${Math.round(el.getBoundingClientRect().top + window.scrollY)}px`);
    }
  };
  measure();
  locate();
  window.addEventListener('resize', () => { measure(); locate(); }, { passive: true });
  /* Re-measured after ScrollTrigger settles, since pinning and font swaps move everything below. */
  ScrollTrigger.addEventListener('refresh', locate);

  if (stage && !prefersReducedMotion()) {
    gsap.fromTo(
      stage,
      { '--grow': 0 },
      {
        '--grow': 1,
        ease: 'none',
        /*
         * Finished growing by the time the section's top reaches the top of the viewport, which is
         * exactly when the window starts sticking. So it expands on the way in and then holds at full
         * screen for the rest of the runway, rather than still growing while it is stuck.
         */
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top top', scrub: 0.7 },
      },
    );
  }

  initReel(root);

  /* No click handler: the panel is an anchor in the markup, which works from the keyboard too. */
  ScrollTrigger.refresh();
}
