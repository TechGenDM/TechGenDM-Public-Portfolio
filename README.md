# Devasish Mishra [TechGenDM], portfolio

A rebuild of the interaction design of [minhpham.design](https://minhpham.design) with my own
content. Vite + TypeScript + GSAP + Lenis + Three.js, no framework.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + static build to dist/
```

## The idea

The page exists **twice**. `.layer__dark` is the real site; `.layer__red` is a complete
duplicate with alternate copy, sitting directly on top and revealed only through a circle that
follows the cursor. Move the pointer over a paragraph and the circle opens to read the other
version through it.

Everything else is a wipe rather than a fade: text is rendered twice, once dimmed and once
clipped to nothing, and the animation opens the clip.

| Effect | Where |
|---|---|
| Cursor-tracked red spotlight | [`src/modules/masker.ts`](src/modules/masker.ts) |
| Row hover band (skills, projects, contact) | [`heading-mask.ts`](src/modules/heading-mask.ts) + `masks.css` |
| Per-line paragraph wipe, char/line reveals | [`reveals.ts`](src/modules/reveals.ts) |
| Smooth scroll + element parallax | [`smooth-scroll.ts`](src/modules/smooth-scroll.ts) |
| Procedural backgrounds and the orb | [`webgl.ts`](src/modules/webgl.ts) |

## Editing content

All copy lives in [`src/data/`](src/data/) as plain data. Sections are generated from it at
**build time** and injected into `index.html`, so the shipped page is static HTML and the
animations are enhancement rather than a requirement.

Adding a project is one appended object in [`projects.mjs`](src/data/projects.mjs); the rows,
the orb parallax and the dots all count off that array.

### The one rule when editing copy

Both layers are generated from the same templates, so they always have the same *structure*.
Alignment also needs the same *shape*: a `red` field must wrap to the same number of lines as
the field it sits on top of. That is why the hero says "breaking" rather than "debugging", it
is the same eight characters as "shipping", so the two headlines land exactly on each other.

Run `npm run parity` after any copy change. It measures every corresponding block in both
layers and fails if anything drifts more than 2px or gets clipped:

```
layer height   dark 9742px   red 9742px   drift 0.0px
worst drift 0.0px · 0 block(s) over 2px · 0 clipped
```

The clipping half matters: two blocks cropped to the same wrong height measure as perfectly
aligned, which is exactly the bug that hid half of every paragraph during development.

## Tooling

| Command | Purpose |
|---|---|
| `npm run parity` | Layer alignment + clipping audit (the important one) |
| `npm run check` | Typecheck + parity |
| `npm run sections` | Screenshot every section to `/tmp/sec` for review |
| `npm run verify` | Shoot the local build and diff it against `reference/` |
| `npm run capture` | Re-record `reference/` from the original site |

`verify` and `capture` share one routine ([`shoot.mjs`](tools/shoot.mjs)) so both runs frame
identical shots, which is what makes the side-by-side contact sheet worth reading.

## Notes

- **Fonts.** The original sets ITC Avant Garde Gothic, which is licensed and not mine to
  redistribute. Jost has the same geometric, wide-round character at display sizes. Nunito Sans
  is what the original actually uses for body text and is freely available.
- **Imagery.** Every image slot is generated in a fragment shader: nothing to license, nothing
  to download, resolution-independent. Three.js is code-split and loads after the page is
  interactive.
- **Reduced motion.** `prefers-reduced-motion` disables the spotlight, the scrubs and the
  staggers, and reveals all masked text statically.
- **Touch.** There is no cursor to follow, so the spotlight is replaced by a hold-to-reveal
  ring button, as in the original.
- `reference/` is local measurement material, not shipped.