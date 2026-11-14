/**
 * "What I do" rows.
 *
 * Names are kept short: set in the display face at 74.7px they wrap easily, and a wrapped name
 * breaks the uniform band rhythm the section depends on. Measured, "RL Environments" is 665px in a
 * 720px column, which is the practical ceiling; anything longer needs the type stepped down.
 *
 * Same `heading-mask` mechanic as projects: the name is always visible, the description arrives with
 * the red band on hover.
 *
 * These read identically in both layers. In the reference the skill descriptions are the one place
 * the alternate layer does not crack a joke, so the humour stays rationed; here the jokes are in the
 * descriptions themselves, which is the same trade made once instead of twice.
 */

/** @type {{name: string, desc: string}[]} */
export const skills = [
  {
    name: 'Full-stack',
    desc:
      'TypeScript and Python, React and Next.js to FastAPI and MongoDB. Architecture to ' +
      'deployment, with nobody to hand the hard part to.',
  },
  {
    name: 'AI Systems',
    desc:
      'LLMs, RAG and voice wired into real products. Fallbacks included, because the demo ' +
      'always works and production never asks first.',
  },
  {
    name: 'Automation',
    desc: 'n8n, Apps Script and a spreadsheet doing a database’s job. Reliably, which is the surprising part.',
  },
  {
    name: 'Consulting',
    desc: 'Showing traditional businesses where AI helps, and, less popular, where it does not.',
  },
];
