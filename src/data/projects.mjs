/**
 * Projects, rendered as `heading-mask` rows: the name sits in the dark layer, and hovering
 * opens a red band from the centre line outward to reveal the description.
 *
 * `desc` shows in the band. `redDesc` is the alternate-layer copy for the same row.
 * Adding a project is one appended object — the rows, the WebGL orb parallax and the dots
 * pagination all count off this array.
 *
 * Exactly one entry should be `featured`: it is the project the showcase panel rebuilds and links
 * to. If none is, the first entry is used.
 */

/**
 * @typedef {object} Project
 * @property {string} name    Display name, set in the big display face.
 * @property {string} desc    One line, revealed by the hover band.
 * @property {string} redDesc Alternate-layer line.
 * @property {string} stack   Technologies, shown small alongside the date.
 * @property {string} date    Human-readable month/year.
 * @property {string} [repo]  Source URL.
 * @property {string} [live]  Deployed URL.
 * @property {boolean} [featured] The showcase panel's project.
 */

/** @type {Project[]} */
export const projects = [
  {
    name: 'GPMS',
    desc:
      'A Ganesh Puja committee’s receipt book, rebuilt as a mobile-first ledger: QR-verifiable ' +
      'PDF receipts shared on WhatsApp, with atomic, idempotent writes so a double-tap on bad ' +
      'signal never counts twice.',
    redDesc: 'My first real users were a Puja committee. They audit harder than any code review.',
    stack: 'Next.js, NextAuth.js, Apps Script, Google Sheets',
    date: 'Aug. 2026',
    repo: 'https://github.com/TechGenDM/GPMS',
    live: 'https://gpms-ksn.vercel.app',
    featured: true,
  },
  {
    name: 'Dead Air',
    desc:
      'A first-person 3D mystery in an abandoned radio observatory, with an AI assistant running ' +
      'Gemma 4 entirely in your browser on WebGPU, and every answer checked against the evidence ' +
      'you have found.',
    redDesc: 'I made a game where the AI is not allowed to make things up. It still tries.',
    stack: 'TypeScript, Three.js, WebGPU, Transformers.js',
    date: 'Nov. 2026',
    repo: 'https://github.com/TechGenDM/DEAD-AIR',
    live: 'https://techgendm.github.io/DEAD-AIR/',
  },
  {
    name: 'LeakLens',
    desc:
      'A bank-statement auditor that finds silent subscription creep with TabPFN, forecasts a ' +
      '90-day cash runway, and drafts the cancellation letters for you.',
    redDesc: 'Software that reads your bank statement and gets judgemental about it.',
    stack: 'Next.js 15, FastAPI, TabPFN, Pandas',
    date: 'Oct. 2026',
    repo: 'https://github.com/TechGenDM/LeakLens',
    live: 'https://leaklens-web.onrender.com',
  },
  {
    name: 'VidSnap AI',
    desc:
      'An AI video studio that turns a script and a handful of photos into a narrated, captioned ' +
      '9:16 reel, with scenes timed to the voice and music that ducks under it.',
    redDesc: 'Video editing, minus the part where you edit the video.',
    stack: 'FastAPI, Next.js, FFmpeg, ElevenLabs',
    date: 'Sep. 2026',
    repo: 'https://github.com/TechGenDM/VidSnap_AI',
    live: 'https://creative-energy-production-094d.up.railway.app',
  },
  {
    name: 'Portfolio',
    desc:
      'This page. A ground-up build on GSAP, Lenis and Three.js: two complete copies of it, one ' +
      'revealed through a mask that follows your cursor.',
    redDesc: 'Two copies of every sentence, and you are reading the honest one.',
    stack: 'Vite, TypeScript, GSAP, Three.js',
    date: 'Aug. 2026',
    repo: 'https://github.com/TechGenDM/TechGenDM-Public-Portfolio',
  },
];

/** The showcase panel's project. */
export const featured = projects.find((p) => p.featured) ?? projects[0];
