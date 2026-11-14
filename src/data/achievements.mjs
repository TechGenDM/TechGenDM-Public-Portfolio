/**
 * Achievements, in the slot the reference gives testimonials: a vertical slider driven by
 * scroll, with a thumb rail down the right edge.
 *
 * `lines` are pre-broken because the display type is set large enough that automatic wrapping
 * lands badly — the reference hard-breaks these too.
 */

/** @type {{lines: string[], redLines: string[], label: string, org: string, badge: string}[]} */
export const achievements = [
  {
    lines: ['Airtel Young', 'Achievement Award'],
    redLines: ['Yes, that Airtel.', 'The telecom one'],
    label: '2023',
    org: 'Airtel',
    badge: 'AIR',
  },
  {
    lines: ['5th at the Anvil', 'Hackathon, SST'],
    redLines: ['Fifth. Four teams', 'slept less than us'],
    label: 'Hackathon',
    org: 'SST, Bengaluru',
    badge: '5TH',
  },
  {
    lines: ['Maths Excellence', 'Award winner'],
    redLines: ['In class three.', 'Not the Olympiad'],
    label: '2015',
    org: 'School competition',
    badge: 'MATH',
  },
];
