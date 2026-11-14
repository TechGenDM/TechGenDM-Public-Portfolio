/**
 * Inline social glyphs.
 *
 * Inlined rather than fetched: four icons are smaller than the request overhead, and they need
 * to inherit `currentColor` so the footer's hover transition applies to them.
 */

const ICONS = {
  github:
    'M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.75.09-.73.09-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18a4.6 4.6 0 0 1 1.24 3.22c0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.83.57A12 12 0 0 0 12 .5Z',
  linkedin:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
  /*
   * CodeChef has no standard mark, so this is a neutral "code brackets" glyph rather than an
   * approximation of their branding. Drawn as a stroke, not a fill: the thin filled chevrons it
   * replaced read far lighter than the solid GitHub and mail glyphs beside it.
   */
  codechef: { d: 'M9 7 4 12l5 5M15 7l5 5-5 5', stroke: 2.5 },
  leetcode:
    'M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z',
  mail:
    'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-8 4.76-8-4.76V6l8 4.75L20 6v2.24Z',
  resume:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z',
  byos:
    'M12 2 2 7l10 5 10-5-10-5Zm0 7.5L4.2 6 12 4l7.8 2L12 9.5ZM2 12l10 5 10-5-1.8-.9L12 15.1 3.8 11.1 2 12Zm0 5 10 5 10-5-1.8-.9L12 20.1 3.8 16.1 2 17Z',
};

/**
 * @param {string} name
 * @returns {string} an inline `<svg>`, or an empty string if unknown.
 */
export const icon = (name) => {
  const entry = ICONS[name];
  if (!entry) return '';

  // Stroked glyphs need the fill suppressed and the join rounded to sit alongside the solid
  // ones without looking like a different icon set.
  if (typeof entry === 'object') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" `
      + `stroke-width="${entry.stroke}" stroke-linecap="round" stroke-linejoin="round">`
      + `<path d="${entry.d}"/></svg>`;
  }

  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${entry}"/></svg>`;
};
