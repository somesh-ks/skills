# Typography and layout mechanics

Load when: sizing type to its container, avoiding layout shift from web fonts, editorial full-bleed grids, scoping styles to a component, optical sizing and weight transitions, aligning text optically in buttons, anchoring icons to multi-line titles, custom string truncation, descender-safe underlines, anchor scroll offset with scroll-margin-top, dark mode font smoothing on macOS, or keeping changing numbers from jittering.
Type scale, measure, and hierarchy belong to the project's design system; this file holds mechanisms.
Support lines verified against MDN on 2026-09-10.

Contents:
- Type that scales with its container
- Zero-shift font fallback with metric overrides
- Full-bleed editorial grid
- Scope styles to a component with @scope
- Optical sizing and weight transitions
- Optical text alignment and icon anchoring with text-box
- Custom string truncation with text-overflow
- Numbers that do not jitter
- Descender-safe typographic underlines
- Anchor scroll offset with scroll-margin-top
- Dark mode font smoothing on macOS

## Type that scales with its container

Container query units size type to the card or column, not the viewport, so the same component works in a sidebar and a hero.

```css
.card-container {
  container-type: inline-size;
}

.card-title {
  font-size: clamp(1.125rem, 0.9rem + 3cqi, 1.75rem);
  line-height: 1.25;
}

.card-body {
  font-size: clamp(0.875rem, 0.8rem + 1cqi, 1rem);
  line-height: 1.5;
}
```

**Support:** Baseline widely available (Chrome 105+, Safari 16+, Firefox 110+).
**Source:** [MDN: container query length units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries#container_query_length_units)

## Zero-shift font fallback with metric overrides

A local fallback tuned to the web font's metrics occupies the same lines, so text does not reflow when the font arrives. Generate the numbers with a tool such as Fontaine or next/font rather than guessing.

```css
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107.5%;
  ascent-override: 90%;
  descent-override: 22.5%;
  line-gap-override: 0%;
}

:root {
  font-family: 'Inter', 'Inter Fallback', sans-serif;
}
```

**Support:** Baseline widely available (Chrome 92+, Safari 17+, Firefox 92+).
**Source:** [web.dev: size-adjust](https://web.dev/articles/css-size-adjust), [MDN: size-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust)

## Full-bleed editorial grid

One grid with named lines gives a reading column, a wide breakout, and edge-to-edge sections without wrapper elements.

```css
.editorial {
  display: grid;
  grid-template-columns:
    [full-start] minmax(16px, 1fr)
    [wide-start] minmax(0, 80px)
    [content-start] min(100% - 32px, 68ch) [content-end]
    minmax(0, 80px) [wide-end]
    minmax(16px, 1fr) [full-end];
}

.editorial > * { grid-column: content; }
.editorial > .wide { grid-column: wide; }
.editorial > .full-bleed { grid-column: full; }
```

**Support:** Baseline widely available.
**Source:** [Full-bleed layout](https://www.joshwcomeau.com/css/full-bleed/)

## Scope styles to a component with @scope

Styles apply inside the root and stop at the lower boundary, so a component's rules never leak into slotted content.

```css
@scope (.media-card) to (.article-slot) {
  img { border-radius: 8px; object-fit: cover; }
  p   { color: var(--text-secondary); }
}
```

**Support:** Baseline newly available March 2026 (Chrome 118+, Safari 17.4+, Firefox 146+).
**Source:** [MDN: @scope](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope)

## Optical sizing and weight transitions

Variable fonts with an `opsz` axis adjust stroke contrast and spacing to the size automatically. When animating weight, tighten tracking at the heavier weight so the text keeps its width.

```css
.display {
  font-family: 'Inter Variable', sans-serif;
  font-size: 3.5rem;
  font-optical-sizing: auto;
  letter-spacing: -0.035em;
}

.animated-weight {
  font-weight: 400;
  transition: font-weight 200ms ease, letter-spacing 200ms ease;
}

.animated-weight:hover {
  font-weight: 700;
  letter-spacing: -0.018em;
}
```

For fonts without an `opsz` axis, the bold-on-hover width trick in `css-visual.md` reserves the wider width instead.

**Support:** Baseline widely available.
**Source:** [MDN: font-optical-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/font-optical-sizing)

## Optical text alignment and icon anchoring with text-box

Trims the space above cap height and below the baseline, so text centers optically in buttons and pills and icons line up with it without nudging.

```css
.button {
  text-box: trim-both cap alphabetic;
  padding-block: 8px; /* now measured from the glyphs, not the line box */
}
```

On multi-line card headers or list items with leading icons, combine `text-box: trim-both cap alphabetic` with `align-items: start`. The leading icon or badge hangs flush from the first line's capital letters and stays anchored when the copy wraps, eliminating awkward leading gaps and center-drift.

```css
.card-header {
  display: flex;
  align-items: start;
  gap: 12px;
}

.card-title {
  text-box: trim-both cap alphabetic;
  font-size: 1.125rem;
  line-height: 1.4;
}
```

**Support:** Baseline newly available 2026 (Chrome 133+, Safari 18.2+, Firefox 154+).
**Source:** [Chrome for Developers: CSS text-box-trim](https://developer.chrome.com/blog/css-text-box-trim), [MDN: text-box-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim)

## Custom string truncation with text-overflow

`text-overflow` accepts any custom string, not only `ellipsis`. The browser cuts the text at the overflow edge and draws your string immediately after the last character that fits.

```css
.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* fallback for engines without string support */
  text-overflow: " (more)";
}
```

**Support:** Custom string syntax is Firefox-only (Firefox 9+). Chromium and WebKit discard the string declaration and safely retain the preceding standard `ellipsis` declaration.
**Source:** [MDN: text-overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow)

## Numbers that do not jitter

Tabular numerals give every digit the same width, so timers and live metrics stop dancing. Fix the colon width in timers and reserve a character count for values that change length.

```css
.metric,
.timer {
  font-variant-numeric: tabular-nums;
}

.timer-colon {
  display: inline-block;
  width: 0.6ch;
  text-align: center;
}

.latency-badge {
  min-width: 7ch;          /* "1,240ms" */
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

**Support:** Baseline widely available.
**Source:** [MDN: font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)

## Descender-safe typographic underlines

Default browser underlines slice awkwardly through descending glyphs (`g`, `y`, `p`, `q`, `j`). Use `text-underline-position: from-font` combined with `text-decoration-skip-ink: auto` and an optical `text-underline-offset` to drop the underline clear of descenders while matching font-specific metrics.

```css
.prose a {
  text-decoration-line: underline;
  text-decoration-color: var(--color-border-subtle);
  text-decoration-thickness: 1.5px;
  text-underline-position: from-font;
  text-underline-offset: 3px;
  text-decoration-skip-ink: auto;
  transition: text-decoration-color 150ms ease;
}

.prose a:hover {
  text-decoration-color: var(--color-accent);
}
```

`text-underline-position: from-font` uses underline metrics embedded in the font file itself when available, preventing the underline from colliding with glyph tails. `text-underline-offset` guarantees visual separation from baseline ink without manual border-bottom hacks that break inline text wrapping.

**Support:** Baseline widely available (Chrome 87+, Safari 12.1+, Firefox 70+).
**Source:** [MDN: text-underline-position](https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-position), [MDN: text-decoration-skip-ink](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-skip-ink)

## Anchor scroll offset with scroll-margin-top

When navigating to in-page hash anchors (`#pricing`, `#faq`) or focusing an element via script, sticky headers, banners, or floating navigation bars obscure the target heading.

Apply `scroll-margin-top` to all headings or target sections to reserve clearance equal to the header height plus optical breathing room:

```css
:root {
  --header-height: 64px;
}

/* Headings with hash anchors clear the sticky navbar */
h1[id],
h2[id],
h3[id],
section[id] {
  scroll-margin-top: calc(var(--header-height) + 24px);
}
```

Unlike padding-top hacks, `scroll-margin-top` affects only the scroll snapping and jumping target box. It leaves component layouts, bounding borders, and visual background fills completely untouched.

**Support:** Baseline widely available (Chrome 69+, Safari 14.1+, Firefox 68+).
**Source:** [MDN: scroll-margin-top](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top)

## Dark mode font smoothing on macOS

On macOS, default font rendering thickens glyph edges using legacy subpixel antialiasing algorithms. While imperceptible on light backgrounds, this subpixel bloom causes white text on dark surfaces to render noticeably heavier and fuzzier than intended: a 400-weight heading in code suddenly looks like 500 or 600 in the design file.

Applying `-webkit-font-smoothing: antialiased` switches the renderer to plain grayscale antialiasing, rendering glyphs at their true design weight on dark surfaces:

```css
[data-theme="dark"] {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; /* legacy Firefox */
}

/* Exempt thin weights or low-contrast light panels if needed */
.light-contrast-box {
  -webkit-font-smoothing: subpixel-antialiased;
  -moz-osx-font-smoothing: auto;
}
```

### Critical caveats and restraint

1. **Platform scope:** These properties apply exclusively to macOS and WebKit/Blink desktop browsers. Windows (ClearType), Linux, Android, and iOS disregard them.
2. **Thin weights caution:** Weights of 300 or lighter on dark backgrounds can become overly frail or spindly on non-Retina (1x) displays when grayscale antialiasing is forced. For body copy between 400 and 700 weights, grayscale antialiasing provides crisp, razor-sharp legibility.

**Support:** Non-standard WebKit and Gecko property; macOS only.
**Source:** [MDN: font-smooth](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth), [Webkit font smoothing guide](https://dbushell.com/2024/11/05/webkit-font-smoothing/)


