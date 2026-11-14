/**
 * Section templates.
 *
 * Every function takes a `layer` of 'dark' | 'red' and returns markup for that layer. The two
 * layers must occupy identical geometry — the red one is revealed through a mask positioned in
 * document space, so any height difference would make the reveal slide out of register.
 *
 * Where the reference has nothing to say in the red layer it keeps the block present but at
 * `op-0`: invisible, still holding its height. That is why several sections below render their
 * inner list twice with only an opacity class differing.
 */

import { site } from '../data/site.mjs';
import { skills } from '../data/skills.mjs';
import { history } from '../data/history.mjs';
import { projects, featured } from '../data/projects.mjs';
import { achievements } from '../data/achievements.mjs';
import { socials } from '../data/socials.mjs';
import { cx, esc, linkTarget, headingMask, scrollParagraph, label, displayLines } from './helpers.mjs';

const isRed = (layer) => layer === 'red';

/* ---------------------------------------------------------------- hero */

export function hero(layer) {
  const red = isRed(layer);
  const lines = red ? site.hero.redLines : site.hero.lines;

  // The dark layer carries a full-bleed WebGL canvas behind the type, parallaxed at half
  // scroll speed. The red layer has no background of its own — it *is* the background.
  const bg = red
    ? ''
    : `
      <div class="hero_bg" data-lenis-parallax=".5">
        <div class="w-100 h-100 js-anim--scale" data-screen-offset="0.3">
          <canvas class="hero_canvas js-webgl" data-webgl="hero" aria-hidden="true"></canvas>
        </div>
      </div>`;

  return `
    <div class="${cx('hero', red && 'hero__red')}">
      ${bg}
      <div class="hero_content">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-sm-10 col-12 hero_content_inner ${red ? '' : 'js-cursor-extend'}">
            <p class="${cx('text-center', 'h6', 'hero_content_inner_subtitle', 'js-anim--lines--sim', red && 'text-dark')}" data-screen-offset="0.8"${red ? ' data-no-anim' : ''}>${esc(site.hero.subtitle)}</p>
            ${displayLines(lines, { animate: !red })}
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- about + what i do */

export function about(layer) {
  const red = isRed(layer);

  const skillRows = skills
    .map((s, i) =>
      headingMask({
        first: i === 0,
        interactive: !red,
        /*
          The two copies get DIFFERENT column widths on purpose, which is how the reference does it.
          Nothing competes with the name until you hover, so the resting copy is given the full
          measure and shows in one piece. The revealed copy has to share the row with a description,
          so its column is narrower and clips: a long name is cut mid-letter at the boundary, exactly
          where the description starts. That cut is the effect, not a failure of it.

          Both name columns keep `offset-lg-2`, so the left edge is identical and the name does not
          move as the band opens over it. Only the right-hand boundary changes.
        */
        deep: `
          <div class="row align-items-center">
            <div class="col-lg-10 col-sm-8 offset-lg-2 offset-sm-1 col-12">
              <div class="simple-masking">
                <div class="simple-masking_el js-simple-masking_el">
                  <h3 class="h1 mb-0 none-break">${esc(s.name)}</h3>
                </div>
              </div>
            </div>
          </div>`,
        masking: `
          <div class="row align-items-center">
            <div class="col-lg-5 col-sm-8 offset-lg-2 offset-sm-1 col-12 heading-mask_clip">
              <div class="simple-masking">
                <div class="simple-masking_el">
                  <span class="h1 mb-0 text-dark none-break">${esc(s.name)}</span>
                </div>
              </div>
            </div>
            <div class="col-lg-5 col-sm-4 col-12 text-dark d-sm-block d-none">
              <p class="mb-0 desc">${esc(s.desc)}</p>
            </div>
          </div>`,
      }),
    )
    .join('');

  return `
    <div class="${cx('about', red ? 'about__red' : 'js-about')}">
      <div class="row about_me">
        <div class="col-lg-8 col-sm-10 col-12 offset-lg-2 offset-sm-1">
          <div class="about_content container_content ${red ? '' : 'js-cursor-extend'}">
            ${label(site.about.label, red ? 'text-dark' : '')}
            <div class="about_content_desc h2">
              ${scrollParagraph(red ? site.about.redHtml : site.about.html, { animate: !red })}
            </div>
          </div>
        </div>
      </div>

      <div class="${cx('about_ido', red && 'op-0')}"${red ? ' aria-hidden="true"' : ''}>
        ${red ? '' : `
        <div class="js-about_ido_coffee about_ido_coffee" aria-hidden="true">
          <div class="js-about_ido_inner about_ido_inner" data-lenis-speed="-.1">
            <canvas class="js-object3d" data-object="cup" data-model="/assets/models/cup.glb"></canvas>
          </div>
        </div>
`}
        <div class="row">
          <div class="col-lg-8 col-sm-10 offset-lg-2 offset-sm-1 col-12">
            ${label('What i do', cx('container_content', red && 'text-dark'))}
          </div>
        </div>
        ${skillRows}
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- experience + history */

export function work(layer) {
  const red = isRed(layer);

  const historyRows = history
    .map((h, i) =>
      headingMask({
        first: i === 0,
        interactive: !red,
        className: 'container_content',
        deep: `
          <div class="row">
            <div class="col-sm-2 offset-lg-2 offset-sm-1 col-3">
              <div class="simple-masking"><div class="simple-masking_el">
                <span class="h3 mb-1">${esc(h.year)}</span>
              </div></div>
            </div>
            <div class="col-lg-6 col-sm-8 col-9">
              <div class="simple-masking_el js-simple-masking_el">
                <p class="h3 mb-1">${esc(h.role)}</p>
                <p class="mb-0 desc font-400">${esc(h.org)}, ${esc(h.range)}</p>
              </div>
            </div>
          </div>`,
        masking: `
          <div class="row">
            <div class="col-sm-2 offset-lg-2 offset-sm-1 col-3">
              <div class="simple-masking"><div class="simple-masking_el">
                <span class="h3 mb-1 text-dark">${esc(h.year)}</span>
              </div></div>
            </div>
            <div class="col-lg-6 col-sm-8 col-9">
              <div class="simple-masking_el">
                <p class="h3 mb-1 text-dark">${esc(h.redRole)}</p>
                <p class="mb-0 desc font-400 text-dark">${esc(h.org)}, ${esc(h.range)}</p>
              </div>
            </div>
          </div>`,
      }),
    )
    .join('');

  return `
    <div class="${cx('work', red && 'work__red')}">
      <!--
        No cursor zone on the row itself. The spotlight's extend stop is 375px, which is sized for
        reading a paragraph through the hole, and this row is a full-width 855px photo band: putting
        the zone here opened a big red disc over empty photograph where there was nothing to reveal.
        The work_content block below already carries it, scoped to the text that has a red twin.
      -->
      <div class="row work_experience">
        <!--
          Backdrop for the whole row: the eyebrow and headline sit ON it, and it runs down to meet
          the History list, which is what the reference does in this exact slot.

          Present in BOTH layers, each graded to where its own type stays legible - see bandRamp()
          and BAND_TUNING in webgl.ts.
        -->
        <div class="work_bg js-band" aria-hidden="true">
          <div class="band_media" data-lenis-speed=".25">
            <!--
              Same two-part treatment as the hero backdrop, which is what makes the reference's band
              read as being uncovered rather than sitting there: a parallax so it lags the page, and
              a scale that scrubs 1.18 down to 1 as the section crosses the screen.

              The scale is what does most of the work, and it needs no room to move in: scaling up
              crops against the band's own overflow and can never pull an edge into frame. The
              parallax does need room, which is why it stays modest. The media is 130% tall, so there
              is about 138px of slack per side and 0.12 spends 110px of it.
            -->
            <div class="w-100 h-100 js-anim--scale" data-screen-offset="0.3">
              <canvas class="js-webgl" data-webgl="${red ? 'band-red' : 'band'}" data-photo="/assets/bands/office.jpg"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-8 col-sm-10 offset-lg-2 offset-sm-1 col-12">
          <div class="work_content container_content ${red ? '' : 'js-cursor-extend'}">
            ${label(site.experience.label, red ? 'text-dark' : '')}
            <div class="work_content_desc h2">
              ${scrollParagraph(red ? site.experience.redHtml : site.experience.html, { animate: !red })}
            </div>
          </div>
        </div>
      </div>

      <div class="${cx('work_history', red && 'op-0')}"${red ? ' aria-hidden="true"' : ''}>
        <div class="row work_heading work_history_heading">
          <div class="col-lg-8 col-sm-10 offset-lg-2 offset-sm-1 col-12">
            ${label('History', cx('container_content', 'mb-0', red && 'text-dark'))}
          </div>
        </div>
        ${historyRows}
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- projects */

export function projectList(layer) {
  const red = isRed(layer);

  // Dark layer: the name rests, and the hover band reveals the real description.
  // Red layer: the rows carry the alternate one-liner, so the spotlight has a payoff here
  // too — a small, deliberate improvement on the reference, which hides this list entirely.
  const rows = projects
    .map((p, i) =>
      headingMask({
            first: i === 0,
            interactive: !red,
            deep: `
              <div class="row align-items-center">
                <div class="col-lg-10 offset-lg-2 col-sm-11 offset-sm-1 col-12">
                  <div class="simple-masking overflow-hidden">
                    <div class="simple-masking_el js-simple-masking_el">
                      <!--
                        The deployed app wins over the source, and a project with neither is plain
                        text rather than an anchor.

                        Live first because the row name is the thing a visitor clicks to see the
                        project, and a repository is the answer to a different question; the
                        showcase link resolves the same way, so the two cannot disagree. Rows with
                        no deployment fall through to their source.

                        The no-link case used to fall back to href="#", which still reads as a link
                        to a pointer, a screen reader and the keyboard, and then jumps the page to
                        the top when activated. Omitting both fields is how a row opts out.
                      -->
                      <h3 class="h1 mb-0 container_content none-break">${
                        red || !(p.live ?? p.repo)
                          ? esc(p.name)
                          : `<a href="${esc(p.live ?? p.repo)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>`
                      }</h3>
                    </div>
                  </div>
                </div>
              </div>`,
            masking: `
              <div class="row align-items-center">
                <div class="col-lg-5 col-sm-8 offset-lg-2 offset-sm-1 col-12">
                  <div class="simple-masking"><div class="simple-masking_el">
                    <span class="h1 mb-0 text-dark none-break">${esc(p.name)}</span>
                  </div></div>
                </div>
                <div class="col-lg-5 col-sm-4 col-12 text-dark d-sm-block d-none">
                  <p class="mb-0 desc project_blurb">${esc(red ? p.redDesc : p.desc)}</p>
                  <p class="mb-0 sub-content">${esc(p.stack)} · ${esc(p.date)}</p>
                </div>
              </div>`,
          }),
    )
    .join('');

  return `
    <div class="${cx('client', red ? 'client__red' : 'js-client')}">
      <div class="row client_info">
        <div class="col-lg-10 col-sm-10 offset-lg-2 offset-sm-1 col-12">
          <div class="client_content container_content ${red ? '' : 'js-cursor-extend'}">
            ${label('Projects', red ? 'text-dark' : '')}
            <div class="client_content_desc h2">
              ${scrollParagraph(
                red
                  ? 'Out of all of them only <strong>five qualified</strong> as worth showing. And I only ended up using them, no one else.'
                  : 'I have built a lot of <strong>real world projects</strong>, and every one of them because I faced the problem myself.',
                { animate: !red },
              )}
            </div>
          </div>
        </div>
      </div>

      <div class="client_list">
        ${red ? '' : `
        <div class="client_list_3d" data-lenis-speed=".1" aria-hidden="true">
          <div class="js-client_list_3d client_list_3d_inner">
            <canvas class="js-object3d" data-object="earth"></canvas>
          </div>
        </div>`}
        <div class="client_list_inner">${rows}</div>
        <div class="row">
          <div class="col-lg-10 offset-lg-2 col-sm-11 offset-sm-1 col-12">
            <div class="dots container_content" aria-hidden="true">
              ${projects.map(() => '<span></span>').join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- showcase (was: reel) */

/**
 * A receipt QR, drawn at build time.
 *
 * Not a scannable code, and it does not need to be: it is decoration inside an aria-hidden mock. It
 * has the three finder squares and a seeded scatter, so it reads as a QR at a glance and is the same
 * on every build.
 */
function qrSvg(seed = 11) {
  const n = 21;
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const finder = (x, y) => {
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      const dx = x - ox;
      const dy = y - oy;
      /* The 8x8 corner region: the 7x7 finder plus its one-cell quiet border. */
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return 0;
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring === 3 || ring <= 1 ? 1 : 0;
      }
    }
    return -1;
  };
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const f = finder(x, y);
      if (f === 1 || (f === -1 && rnd() < 0.48)) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return `<svg class="gpms_qr" viewBox="-1 -1 23 23" shape-rendering="crispEdges"><path d="${d}"/></svg>`;
}

/** A phone's status bar. `sig` marks the one whose signal the demo varies. */
const phoneStatus = (sig = false) => `
  <span class="gpms_status">
    <span>7:12</span>
    <span class="${cx('gpms_sig', sig && 'js-gpms-sig')}"><i></i><i></i><i></i><i></i></span>
  </span>`;

/*
 * GPMS's own interface, rebuilt from its components and running its real flow, across the three
 * places it actually happens.
 *
 * Not a screen recording and not screenshots: built from components it is a few KB, stays sharp at
 * any scale, and can show the system working end to end, which no single screen of the app does.
 *
 *   01  A volunteer's phone in the crowd, recording a donation on the real form: name, preset amount
 *       chips, purpose pills, Cash/UPI, then the success card with PDF and WhatsApp.
 *   02  The Google Sheets ledger, which is the database. The write happens under LockService, and the
 *       transaction ID makes a double-tap on bad signal land once and the retry get rejected.
 *   03  The donor scanning the receipt's QR, which opens /verify/[receiptId]: "Valid GPMS Receipt".
 *
 * Every label, ID format (RCT-YYYYMMDD-NNNNN), preset and colour is from the GPMS repository. Its
 * typefaces (Playfair Display, DM Sans) are substituted, as elsewhere in this rebuild. The donors are
 * invented.
 *
 * Decorative: the panel link carries the accessible name.
 */
function gpmsDemo() {
  const presets = ['51', '101', '251', '501', '1001'];
  const purposes = ['General', 'Murti', 'Decoration', 'Prasad', 'Cultural'];

  return `
    <div class="gpms js-gpms" aria-hidden="true">
      <div class="gpms_scale">
      <div class="gpms_win">
        <div class="gpms_bar">
          <span class="gpms_brand"><span class="gpms_seal">G</span>GPMS<em>Ganesh Puja 2026</em></span>
          <span class="gpms_url">gpms-ksn.vercel.app</span>
        </div>

        <div class="gpms_cols">
          <div class="gpms_col gpms_col__vol">
            <span class="gpms_cap"><b>01</b>Volunteer, at the gate</span>
            <div class="gpms_phone">
              ${phoneStatus(true)}
              <div class="gpms_screens">
                <div class="gpms_screen js-gpms-form">
                  <span class="gpms_hd"><span class="gpms_back">&larr;</span>New Donation</span>
                  <div class="gpms_body">
                    <span class="gpms_lbl">Donor Name <b>*</b></span>
                    <span class="gpms_in"><span class="js-gpms-name"></span><span class="gpms_caret js-gpms-caret"></span></span>

                    <span class="gpms_lbl">Amount <b>*</b></span>
                    <span class="gpms_in gpms_in__amt"><span class="gpms_rs">&#8377;</span><span class="js-gpms-amt">0</span></span>
                    <span class="gpms_pills js-gpms-presets">
                      ${presets.map((p) => `<span class="gpms_pill" data-v="${p}">&#8377;${p}</span>`).join('')}
                    </span>

                    <span class="gpms_lbl">Purpose <i>(optional)</i></span>
                    <span class="gpms_pills js-gpms-purposes">
                      ${purposes.map((p) => `<span class="gpms_pill" data-v="${p}">${p}</span>`).join('')}
                    </span>

                    <span class="gpms_lbl">Payment Mode <b>*</b></span>
                    <span class="gpms_modes js-gpms-modes">
                      <span class="gpms_mode" data-v="Cash">Cash</span>
                      <span class="gpms_mode" data-v="UPI">UPI</span>
                    </span>

                    <span class="gpms_submit js-gpms-submit">Record Donation</span>
                  </div>
                </div>

                <div class="gpms_screen gpms_screen__done js-gpms-done">
                  <span class="gpms_hd">Donation recorded</span>
                  <div class="gpms_body gpms_body__center">
                    <span class="gpms_tick"></span>
                    <span class="gpms_h2">Success!</span>
                    <span class="gpms_card">
                      <span class="gpms_k">Receipt ID</span>
                      <span class="gpms_rid js-gpms-rid"></span>
                      <span class="gpms_rule"></span>
                      <span class="gpms_donor js-gpms-donor"></span>
                      <span class="gpms_sum js-gpms-sum"></span>
                    </span>
                    <span class="gpms_btns">
                      <span class="gpms_btn">PDF</span>
                      <span class="gpms_btn gpms_btn__wa js-gpms-wa">WhatsApp</span>
                    </span>
                    <span class="gpms_toast js-gpms-toast">Receipt shared on WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="gpms_col gpms_col__ledger">
            <span class="gpms_cap"><b>02</b>The ledger, in Google Sheets</span>
            <div class="gpms_sheet">
              <span class="gpms_sheet_top">
                <span class="gpms_sheet_name"><span class="gpms_sheet_ico"></span>GPMS &middot; Donations</span>
                <span class="gpms_lock js-gpms-lock">LockService</span>
              </span>
              <span class="gpms_row gpms_row__head">
                <span>Receipt ID</span><span>Donor</span><span>Amount</span><span>Mode</span><span>Purpose</span><span>Status</span>
              </span>
              <div class="gpms_rows js-gpms-rows"></div>
              <span class="gpms_log js-gpms-log"></span>
              <span class="gpms_tabs">
                <span class="is-on">Donations</span><span>Expenses</span><span>Users</span><span>AuditLogs</span>
              </span>
            </div>
          </div>

          <div class="gpms_col gpms_col__verify">
            <span class="gpms_cap"><b>03</b>Donor, scanning the QR</span>
            <div class="gpms_phone">
              ${phoneStatus()}
              <div class="gpms_screens">
                <div class="gpms_screen gpms_screen__scan js-gpms-scan">
                  <span class="gpms_frame">${qrSvg()}<span class="gpms_beam js-gpms-beam"></span></span>
                  <span class="gpms_hint">Point at the receipt&rsquo;s QR</span>
                </div>
                <div class="gpms_screen gpms_screen__valid js-gpms-valid">
                  <div class="gpms_body gpms_body__center">
                    <span class="gpms_tick"></span>
                    <span class="gpms_h2">Valid GPMS Receipt</span>
                    <span class="gpms_sub">Ganesh Puja 2026</span>
                    <span class="gpms_dl js-gpms-dl"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>`;
}

export function showcase(layer) {
  const red = isRed(layer);
  const flagship = featured;

  return `
    <div class="${cx('video', red && 'video__red')}">
      <div class="${cx('videoPlayer', !red && 'js-videoPlayer')}">
        <!--
          The spotlight's own label: it rides the cursor disc, the way the reference's "PLAY REEL"
          does. A child of the SECTION rather than of the sticky window inside it, because that is
          what makes the positioning possible in CSS alone - see the note on .videoPlayer_cta.
        -->
        <span class="videoPlayer_cta" aria-hidden="true">Open<br>live app</span>
        <div class="${cx('videoPlayer_inner', red ? 'videoPlayer_inner__red' : 'js-videoPlayer_inner')}">
          <!--
            The whole panel is the link, which is how the reference behaves: its reel has no button,
            the panel itself is the target and the cursor spotlight becomes the label.

            An anchor rather than a click handler on the div, so it works from the keyboard and shows
            its destination in the status bar for free. The red layer's copy is inert, because two
            anchors over the same pixels would be two tab stops to the same place.
          -->
          <a
            class="videoPlayer_link"
            href="${esc(flagship.live ?? flagship.repo)}"
            target="_blank"
            rel="noopener noreferrer"
            ${red ? 'tabindex="-1" aria-hidden="true"' : ''}
          ><span class="visually-hidden">Open ${esc(flagship.name)}, live</span></a>

          ${red ? '' : gpmsDemo()}
        </div>
      </div>

    </div>`;
}

/* ---------------------------------------------------------------- achievements */

export function achievementList(layer) {
  const red = isRed(layer);

  const items = achievements
    .map(
      (a, i) => `
      <div class="${cx('testimonial', !red && 'js-testimonial')}">
        <div class="testimonial_inner container_content ${red ? '' : 'js-cursor-extend'}">
          <span class="${cx('testimonial_index', red && 'text-dark')}" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <div class="testimonial_content h2">
            ${scrollParagraph(
              (red ? a.redLines : a.lines).map(esc).join('<br>'),
              { animate: !red },
            )}
          </div>
          <div class="testimonial_info">
            <p class="${cx('testimonial_info_name', 'desc', 'mb-1', red && 'text-dark')}">${esc(a.org)}</p>
            <p class="${cx('testimonial_info_position', 'sub-content', red && 'text-dark')}">${esc(a.label)}</p>
          </div>
        </div>
      </div>`,
    )
    .join('');

  return `
    <div class="${cx('testimonials', red ? 'testimonials__red' : 'js-testimonials')}">
      <div class="row">
        <div class="col-lg-8 col-sm-10 col-12 offset-lg-2 offset-sm-1">
          ${label('What I have won', cx('container_content', red && 'text-dark'))}
        </div>
      </div>
      <!--
        The rail is a column of THIS row, alongside the items, not a row of its own above them.
        A sticky element only travels within its containing block, so the rail has to share a
        parent that spans the whole list; in its own short row it had nowhere to stick to.
      -->
      <div class="${cx('testimonial_lists', !red && 'js-testimonial_lists', 'row')}">
        <div class="col-lg-8 col-sm-10 col-12 offset-lg-2 offset-sm-1">${items}</div>
        <div class="col-lg-1 col-2 testimonials_thumbs_col">
          <div class="testimonials_thumbs">
            <div class="${cx('testimonials_thumbs_list', red ? 'js-testimonials_thumbs_list__red' : 'js-testimonials_thumbs_list')}">
              <div class="testimonials_thumbs_inner">
                <ul class="testimonials_thumbs_list_list ul__reset">
                  ${achievements
                    .map(
                      (a, i) => `
                    <li class="thumb-item ${i === 0 ? 'is-active' : ''}">
                      <span class="thumb-item_inner">${esc(a.badge)}</span>
                    </li>`,
                    )
                    .join('')}
                </ul>
                <span class="testimonials_thumbs_flash js-testimonials_thumbs_flash"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- motto */

export function motto(layer) {
  const red = isRed(layer);
  const lines = red ? site.motto.redLines : site.motto.lines;
  const who = red ? site.motto.redAttribution : site.motto.attribution;

  return `
    <div class="${cx('motto', red && 'motto__red')}">
      <!--
        The photo band. In BOTH layers so the cursor spotlight swaps the photograph between the
        two grades rather than wiping it to a flat field; absolutely positioned, so it adds no
        flow height and cannot pull the layers out of alignment.
      -->
      <div class="motto_bg js-band" aria-hidden="true">
        <div class="band_media" data-lenis-speed=".08">
          <canvas class="js-webgl" data-webgl="${red ? 'band-red' : 'band'}" data-photo="/assets/bands/beach.jpg"></canvas>
        </div>
      </div>
      <div class="motto_content container_content">
        <div class="row justify-content-center align-items-center">
          <div class="col-lg-8 col-12 motto_content_inner ${red ? '' : 'js-cursor-extend'}">
            <div>
              <p class="${cx('text-center', 'mb-0', 'h6', 'js-anim--lines--sim', red && 'text-dark')}" data-offset=".88"${red ? ' data-no-anim' : ''}>${esc(site.motto.label)}</p>
              <p class="${cx('text-center', 'motto_content_heading', 'h1', 'mb-0', 'js-anim--chars', red && 'text-dark')}" data-offset=".88"${red ? ' data-no-anim' : ''}>${lines.map(esc).join('<br>')}</p>
              <p class="${cx('desc', 'text-center', 'mb-0', 'js-anim--lines--sim', red && 'text-dark')}" data-offset=".88"${red ? ' data-no-anim' : ''}>${esc(who)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- contact */

export function contact(layer) {
  const red = isRed(layer);
  const half = Math.ceil(socials.length / 2);
  const columns = [socials.slice(0, half), socials.slice(half)];

  const linkList = (group) => `
    <ul class="ul__reset">
      ${group
        .map((s) =>
          headingMask({
            first: true,
            interactive: !red,
            className: 'social-link h3',
            deep: s.href
              ? `<a class="contact_link" href="${esc(s.href)}"${linkTarget(s.href)}>${esc(s.label)}</a>`
              : `<span class="contact_link">${esc(s.label)}</span>`,
            masking: `<span class="text-dark contact_link">${esc(s.redLabel)}</span>`,
          }),
        )
        .join('')}
    </ul>`;

  // Email is assembled at runtime so it isn't sitting in the markup for scrapers.
  const emailParts = site.contact.email.split('@');

  const infoBlock = (title, note, value, href, extraClass = '') => `
    <div class="${cx('heading-mask', 'contact_info', extraClass, !red && 'js-cursor-contract', 'heading-mask__now', red && 'contact_info__red')}">
      <div class="heading-mask_el heading-mask_el__deep">
        <span class="h4 d-block">${esc(title)}</span>
        <a class="sub-content" href="${esc(href)}">${value}</a>
      </div>
      <div class="heading-mask_el heading-mask_el__masking" aria-hidden="true">
        <span class="h4 d-block text-dark">${esc(note)}</span>
        <span class="sub-content text-dark">${value}</span>
      </div>
    </div>`;

  return `
    <div class="${cx('contact', red && 'contact__red', 'container_content', red && 'op-0')}"${red ? ' aria-hidden="true"' : ''}>
      <div class="row">
        <div class="col-lg-8 col-sm-10 col-12 offset-lg-2 offset-sm-1">
          ${label(site.contact.label, red ? 'text-dark' : '')}
        </div>
      </div>
      <div class="row">
        <div class="col-lg-3 col-sm-5 offset-lg-2 offset-sm-1 col-12">${linkList(columns[0])}</div>
        <div class="col-lg-3 col-sm-5 col-12">${linkList(columns[1])}</div>
        <div class="col-lg-3 col-12 contact_content">
          <div class="row">
            <div class="col-lg-12 col-sm-5 offset-lg-0 offset-sm-1 col-12">
              ${infoBlock(
                'Email',
                site.contact.emailNote,
                `<span class="js-email" data-user="${esc(emailParts[0])}" data-domain="${esc(emailParts[1])}"></span>`,
                '#',
                'contact_info__top',
              )}
            </div>
            <div class="col-lg-12 col-sm-5 col-12">
              ${infoBlock('Phone', site.contact.phoneNote, esc(site.contact.phone), `tel:${site.contact.phone.replace(/\s/g, '')}`)}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
