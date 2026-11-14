/**
 * Site-wide identity and copy.
 *
 * Every section exists twice on the page: the dark layer (the real one) and the red layer,
 * revealed through a circular mask that tracks the cursor. Fields prefixed `red` are the
 * alternate-layer copy — the punchline you find by moving the mouse over a paragraph.
 */

export const site = {
  name: 'Devasish Mishra',
  role: 'Full-Stack & AI Engineer',
  description:
    'I build production web and AI systems with TypeScript, Python, React, Next.js and LLMs, ' +
    'and consult on automation and AI integration for businesses.',
  /* The deployed origin, for the canonical and og:url tags. If emptied, renderHead() omits both
   * tags rather than pointing them somewhere wrong. */
  url: 'https://techgendm.vercel.app/',

  nav: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Contact', href: '#contact' },
  ],

  hero: {
    subtitle: 'Devasish Mishra',
    /*
     * One line per entry; `strong` entries are set in the accent red.
     *
     * CHARACTER COUNT IS NOT WIDTH. Measured in Jost at this size, "good" is 349px and "vibe" is
     * 248px, both four letters: G, O, O and D are four wide round glyphs and VIBE contains an I.
     * "building" is 522px against "clauding" at 578px. So matching the copy by counting letters,
     * which is what this file used to do, guarantees nothing.
     *
     * The layers are made to register in code instead. matchLayerWidths() in reveals.ts measures
     * each line pair after the split and scales the red one horizontally onto the dark one's exact
     * width, so any two words line up and the copy here is free to say whatever it should say.
     *
     * Both layers are set uppercase by CSS, so the case here is only a file convention.
     */
    lines: [
      { text: 'shipping' },
      { text: 'real', strong: true },
      { text: 'products', strong: true },
      { text: 'since' },
      { text: '2025' },
    ],
    redLines: [
      { text: 'selling' },
      { text: 'real', strong: true },
      { text: 'products', strong: true },
      { text: 'since' },
      { text: '2016' },
    ],
  },

  about: {
    label: 'About me',
    /*
     * `strong` spans get the accent red in the dark layer and the heavier display weight in the red
     * one, which is how the reference sets its own emphasised phrase.
     *
     * The two layers share no distinctive phrase. The engineer is only ever in the dark copy; the
     * nine years behind a sales counter are only ever in the spotlight. A phrase that appears in
     * both is not a reveal, it is just repetition.
     *
     * Length-matched by RENDERED LINE COUNT, not by character count. Both sides come to four lines
     * in the 940px column at this type size; measured, because 90 characters can be three lines and
     * 102 can be four depending entirely on where the words happen to break.
     */
    html:
      "I'm a <strong>full-stack engineer</strong> building production web and AI systems " +
      'that survive real users.',
    redHtml:
      "I'm a <strong>career switcher</strong> who sold tech across a counter for nine years " +
      'before building any of it.',
  },

  experience: {
    label: 'Experience',
    /*
     * The dark layer flaunts, the spotlight admits. That is the rule for every red/dark pair on the
     * page, and this is the clearest case of it: the claim is the reference's own construction, and
     * the reveal turns the admission into the reason for it rather than an apology for it.
     *
     * "A year" is the self-employed engineering work, from April 2025. The nine years are Telelink,
     * January 2016 to July 2025, and they belong to the spotlight.
     * "A year" rather than "one year" because the reference's construction is "Over a decade" and the
     * article reads better after "over".
     */
    html:
      'Over <strong>a year</strong> of shipping full-stack and AI products for independent ' +
      'clients, end to end.',
    redHtml:
      'Plus <strong>nine years</strong> in sales, where I learned what users want long before ' +
      'I could build it.',
  },

  motto: {
    label: 'My motto',
    lines: ['Make it work,', 'make it right,', 'make it fast'],
    attribution: 'Kent Beck',
    redLines: ['Make it work,', 'then never', 'touch it again'],
    redAttribution: 'Devasish Mishra',
  },

  contact: {
    label: 'Connect',
    email: 'devasishmishra74@gmail.com',
    emailNote: '100% chance I read it',
    phone: '+91 79036 36328',
    phoneNote: '90% chance I don’t pick up',
  },
};
