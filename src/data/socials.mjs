/**
 * Contact links. `redLabel` replaces the platform name when the red band opens, so the column
 * reads as a list of platforms until you hover it, then as a list of confessions.
 */

/*
 * `redLabel` is kept short on purpose. It is revealed inside a fixed-height row band, and at
 * .h3 in a quarter-width column anything past ~18 characters wraps to a second line, which
 * used to make the rows different heights and the list look unevenly spaced.
 */

/*
 * A row with no `href` renders as plain text rather than a link: a placeholder that is not a dead
 * link to a pointer, a screen reader or the keyboard.
 */

/** @type {{label: string, redLabel: string, href?: string, icon?: string, inFooter?: boolean}[]} */
export const socials = [
  {
    label: 'Github',
    redLabel: 'The commits',
    href: 'https://github.com/TechGenDM',
    icon: 'github',
    inFooter: true,
  },
  {
    label: 'Linkedin',
    redLabel: 'Serious me',
    href: 'https://www.linkedin.com/in/devasish-mishra-62546a34a/',
    icon: 'linkedin',
    inFooter: true,
  },
  {
    label: 'LeetCode',
    redLabel: 'The grind',
    href: 'https://leetcode.com/u/TechGenDM/',
    icon: 'leetcode',
    inFooter: true,
  },
  /* Placeholder for the next big thing (the 3D portfolio). Give it an `href` when it ships. */
  {
    label: 'Coming soon',
    redLabel: 'Still building it',
  },
  {
    label: 'Resume',
    redLabel: 'One page',
    href: '/resume.pdf',
    icon: 'resume',
  },
  {
    label: 'Email',
    redLabel: 'I do read it',
    href: 'mailto:devasishmishra74@gmail.com',
    icon: 'mail',
    inFooter: true,
  },
];
