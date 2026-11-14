/**
 * Career/education history rows. The year column stays put while the role swaps under the
 * red band — `redRole` is the honest job title.
 *
 * `year` is the anchor token and `range` the precise span, deliberately split. The year column is
 * 2/12 of the grid, sized for four characters: it is 220px wide at 1440 and 72px at 375, so a
 * range like "NOV 2025 - NOW" (276px at 1440, 183px at 375) would need 8.8px type to fit the
 * narrowest case. Even "2024-2028" overflows it by 44px there. So the column keeps the short token
 * and the full range rides the small line with the org, where there is room at every width.
 */

/** @type {{year: string, role: string, redRole: string, org: string, range: string}[]} */
export const history = [
  {
    year: 'NOW',
    role: 'Full Stack Engineer',
    redRole: 'The Whole Engineering Team',
    org: 'Self-employed',
    range: 'Apr 2025 - now',
  },
  {
    year: '2025',
    role: 'BSc in Computer Science',
    redRole: 'Student, At Last',
    org: 'BITS Pilani',
    range: '2025 - 2028',
  },
  {
    year: '2025',
    role: 'GDG Member',
    redRole: 'Here for the Code Labs',
    org: 'Google Developer Groups',
    /* Year only: with the month, this line wraps to two at 375px and the row grows taller than
     * its neighbours. */
    range: '2025 - now',
  },
  {
    year: '2023',
    role: 'Head Boy',
    redRole: 'Chief Event Wrangler',
    org: 'Karim City College',
    range: 'Aug 2023 - Jan 2025',
  },
  {
    year: '2016',
    role: 'Sales & Marketing',
    redRole: 'Nine Years of Listening',
    org: 'Telelink Communication',
    range: 'Jan 2016 - Jul 2025',
  },
];
