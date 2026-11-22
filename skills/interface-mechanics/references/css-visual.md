# CSS layout and visual details

Load when: styling from child count or nested state with `:has()`, scroll edge fades, subgrid alignment, `text-wrap`, table highlighting, concentric radii, auto-growing inputs, bold-on-hover, layered shadows, blur-to-offset ratio, one depth idiom, shadow rings in place of borders, container border contrast, image outlines, icon stroke width, native control colors, cascade layers, customizable select, squircles, or clip-path shapes.
About 430 lines. Support lines verified against MDN on 2026-09-10; the shadow ring, image outline, and icon stroke entries on 2026-10-10.

## Quantity queries with :has()

Changes a container's layout based on how many children it has, without counting in JavaScript.

```css
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.media-grid:has(> :nth-child(5)) {
  grid-template-columns: repeat(3, 1fr); /* five or more items */
}

.media-grid:has(> :only-child) {
  grid-template-columns: 1fr;
}
```

**Support:** Baseline widely available (Chrome 105+, Safari 15.4+, Firefox 121+).
**Source:** [CSS :has() guide](https://ishadeed.com/article/css-has-guide/)

## Parent state with :has()

Styles a wrapper from the state of a nested input, or dims siblings of a hovered card.

```css
.form-field {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.form-field:has(input:focus-visible) {
  border-color: var(--focus-ring);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--focus-ring) 25%, transparent);
}

.card-stack:has(.card:hover) .card:not(:hover) {
  opacity: 0.6;
  transform: scale(0.98);
  transition: opacity 200ms ease, transform 200ms ease;
}
```

**Support:** Baseline widely available (Chrome 105+, Safari 15.4+, Firefox 121+).
**Source:** [MDN: :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)

## Scroll edge fades with scroll-driven masks

Fades the overflow edges of a scroller only while there is more content in that direction. No overlay elements, no scroll listeners.

```css
@property --left-mask {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --right-mask {
  syntax: "<length>";
  inherits: false;
  initial-value: 40px;
}

.scroll-container {
  overflow-x: auto;
  mask-image: linear-gradient(to right, transparent 0px, black var(--left-mask), black calc(100% - var(--right-mask)), transparent 100%);
  animation: scroll-fade linear;
  animation-timeline: scroll(self inline);
}

@keyframes scroll-fade {
  0%   { --left-mask: 0px;  --right-mask: 40px; }
  10%  { --left-mask: 40px; --right-mask: 40px; }
  90%  { --left-mask: 40px; --right-mask: 40px; }
  100% { --left-mask: 40px; --right-mask: 0px; }
}
```

shadcn/ui ships this as a `scroll-fade` utility if the project already uses it.

**Support:** Chrome 115+, Edge 115+, Safari 26+. Firefox in development.
**Source:** [CSS-Tricks: scroll shadows with scroll-driven animations](https://css-tricks.com/modern-scroll-shadows-using-scroll-driven-animations/), [shadcn/ui: scroll-fade](https://ui.shadcn.com/docs/utils/scroll-fade)

## Equal-height card internals with subgrid

Aligns headers, bodies, and footers across cards of different lengths by sharing the parent's row tracks.

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: auto auto 1fr auto; /* header, subtitle, body, footer */
  gap: 16px;
}

.card {
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
}
```

**Support:** Baseline newly available 2023 (Chrome 117+, Safari 16+, Firefox 71+).
**Source:** [web.dev: CSS subgrid](https://web.dev/articles/css-subgrid)

## Balanced headings, pretty paragraphs

```css
h1, h2, h3 { text-wrap: balance; }  /* even line lengths */
p, li      { text-wrap: pretty; }   /* no single-word last lines */
```

**Support:** `balance` Baseline 2024 (Chrome 114+, Safari 17.5+, Firefox 121+). `pretty` Chrome 117+, Safari 26+; Firefox in development.
**Source:** [Chrome for Developers: text-wrap: balance](https://developer.chrome.com/blog/css-text-wrap-balance), [MDN: text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)

## Row and column highlighting with :has()

Highlights the hovered row, the hovered column, and the intersecting cell with no cell indexing in JavaScript. Column rules are per index, so emit one per column or generate them for wide tables.

```css
tr:hover td {
  background: var(--surface-hover);
}

td:has(~ td:hover) {
  background: var(--surface-subtle); /* cells before the hovered one */
}

table:has(td:nth-child(1):hover) td:nth-child(1),
table:has(td:nth-child(2):hover) td:nth-child(2),
table:has(td:nth-child(3):hover) td:nth-child(3),
table:has(td:nth-child(4):hover) td:nth-child(4) {
  background: var(--surface-subtle); /* the hovered column */
}

td:hover {
  background: var(--surface-active);
}
```

**Support:** Baseline widely available (Chrome 105+, Safari 15.4+, Firefox 121+).
**Source:** [MDN: :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)

## Concentric radius as tokens

The rule: inner radius = outer radius minus padding, floored at zero. This is the mechanism that keeps nested elements in sync when either token changes. A border on the outer surface is part of the inset, so subtract it too. Past about 24px of padding, or where the padding is uneven, the two read as separate surfaces and each keeps its own radius token.

```css
.card {
  --radius: 20px;
  --pad: 12px;
  --border: 1px;
  border: var(--border) solid var(--border-subtle);
  border-radius: var(--radius);
  padding: var(--pad);
}

.card > .inner {
  border-radius: max(0px, calc(var(--radius) - var(--pad) - var(--border)));
}
```

**Support:** Baseline widely available.
**Source:** [MDN: border-radius](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius)

## Auto-growing inputs with field-sizing

Lets a textarea grow with its content instead of scrolling inside itself, so people can read their whole thought.

```css
textarea.auto-grow {
  field-sizing: content;
  min-height: 2.5rem;
  max-height: 20rem;
  resize: none;
}
```

Fallback for older browsers: the replicated-content grid trick, where a `::after` pseudo-element mirrors the value to size the box.

**Support:** Baseline newly available June 2026 (Chrome 123+, Safari 26.2+, Firefox 152+).
**Source:** [MDN: field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing), [Auto-growing textareas](https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/)

## Bold on hover without layout shift

A hidden bold copy of the label reserves the widest width, so swapping the weight on hover moves nothing around it.

```html
<a href="#" class="nav-item" data-text="Dashboard">Dashboard</a>
```

```css
.nav-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  font-weight: 400;
}

.nav-item::after {
  content: attr(data-text);
  font-weight: 700;
  height: 0;
  visibility: hidden;
  overflow: hidden;
  user-select: none;
  pointer-events: none;
}

.nav-item:hover {
  font-weight: 700;
}
```

**Support:** Baseline widely available.
**Source:** [Bold on hover without layout shift](https://css-tricks.com/bold-on-hover-without-the-layout-shift/)

## Layered, tinted shadows

One shadow reads as a cardboard cutout. Stack a tight contact shadow, a mid shadow, and a diffuse ambient one, and tint them with the hue of the surface underneath rather than pure black.

```css
:root {
  --shadow-color: 220 25% 45%; /* hue and saturation from the page background */
}

.elevated {
  box-shadow:
    0 1px 2px hsl(var(--shadow-color) / 0.08),
    0 4px 8px hsl(var(--shadow-color) / 0.08),
    0 12px 24px hsl(var(--shadow-color) / 0.10);
}
```

Darker or more saturated backgrounds want a darker, more saturated shadow token; adjust the token, not each layer.

Keep each layer's blur at twice its Y offset (4px down, 8px blur). The closer an element sits to the viewer, the blurrier its shadow, so lower the shadow opacity as elevation rises. Commit to one depth idiom per interface: soft shadows, hard offset shadows, or none. Mixing them in one view reads as inconsistent.

**Support:** Baseline widely available.
**Source:** [Designing Beautiful Shadows in CSS](https://www.joshwcomeau.com/css/designing-shadows/)

## Shadow ring instead of a border

A border that exists only to suggest depth becomes a 1px shadow ring plus a small lift, so the edge blends with whatever sits behind it. Keep real borders on dividers, table cells, form inputs, and selected states. Depth shadows vanish on dark surfaces, so the dark value is one light ring. The transparent border is what forced-colors mode paints (see `accessibility.md`), and it keeps the box the size of the border it replaced.

```css
:root {
  color-scheme: light dark;
  --ring: light-dark(oklch(0 0 0 / 0.06), oklch(1 0 0 / 0.08));
  --lift: light-dark(oklch(0 0 0 / 0.06), transparent);
}

.card {
  border: 1px solid transparent;
  box-shadow: 0 0 0 1px var(--ring), 0 1px 2px -1px var(--lift), 0 2px 4px var(--lift);
}
```

**Support:** `light-dark()` is Baseline newly available 2024 (Chrome 123+, Safari 17.5+, Firefox 120+); redefine the two tokens under the project's dark selector for older browsers.
**Source:** [MDN: box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)

## Container border against both surfaces

A 1px border on a card has to contrast with the card and with the page behind it. In a dark theme it is lighter than both; in a light theme it is darker than both. A border whose lightness falls between the two blurs the edge instead of sharpening it. Check the ordering when you define the tokens.

```css
:root {
  color-scheme: light dark;
  /* light: --border-card darker than both. dark: lighter than both. */
  --bg-page: light-dark(var(--page-light), var(--page-dark));
  --bg-card: light-dark(var(--card-light), var(--card-dark));
  --border-card: light-dark(var(--border-light), var(--border-dark));
}
```

**Support:** `light-dark()` as in the shadow ring entry above.
**Source:** [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)

## Image outline that reads in both themes

A 1px outline set just inside the edge separates an image from a surface of the same colour. Use pure black or pure white only: a tinted neutral or a palette near-black shows as a coloured fringe. Skip transparent artwork such as logos and illustrations. `outline` never changes the image's size, which `border` does.

```css
img.content {
  outline: 1px solid light-dark(oklch(0 0 0 / 0.1), oklch(1 0 0 / 0.1));
  outline-offset: -1px;
}
```

**Support:** `outline` with `border-radius` corners is Baseline widely available (across browsers since March 2023). `light-dark()` as above.
**Source:** [MDN: outline](https://developer.mozilla.org/en-US/docs/Web/CSS/outline)

## Icon stroke that survives scaling

A 24px-grid icon drawn at 16px scales its stroke by 16/24, so `stroke-width="2"` paints about 1.33px and looks thin beside its label. Pin the rendered width, then match it to the adjacent text weight: about 1.5px beside regular text, 2px beside medium or semibold, 2.5px beside bold. Draw with `currentColor` so hover, selected, and disabled states come from CSS, never from a second asset.

```css
.icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

.icon * {
  vector-effect: non-scaling-stroke; /* stroke-width is now in rendered pixels */
}
```

In lucide-react 1.x, the `nonScalingStroke` prop does the same thing: it sets `vector-effect="non-scaling-stroke"` on every shape inside the icon. `absoluteStrokeWidth` is deprecated in its favour, as of October 2026 ([Lucide: stroke width](https://lucide.dev/guide/react/basics/stroke-width); lucide-react 1.55.0 marks it `@deprecated`).

**Support:** Baseline widely available.
**Source:** [MDN: vector-effect](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/vector-effect)

## Icon sizing relative to text with 1cap

Stop hardcoding icon sizes in pixels (`width: 16px; height: 16px`). Set the icon block size to `1cap` instead. The `cap` unit equals the height of a capital letter in the current font, so the icon automatically matches adjacent text at any font size and aligns naturally on the baseline.

```css
.label {
  display: flex;
  align-items: baseline;
}

.label svg {
  block-size: 1cap;
}
```

**Support:** Baseline widely available (Chrome 118+, Safari 17.2+, Firefox 120+).
**Source:** [MDN: CSS length units (cap)](https://developer.mozilla.org/en-US/docs/Web/CSS/length#cap), [W3C CSS Values and Units Module Level 4](https://www.w3.org/TR/css-values-4/#cap)

## Native control colors

Three properties make native inputs, checkboxes, and text carets match the product instead of the OS.

```css
:root {
  color-scheme: light dark;   /* native controls, scrollbars, and form chrome follow the theme */
  accent-color: var(--accent); /* checkboxes, radios, range, progress */
}

.command-input {
  caret-color: var(--accent);
}
```

**Support:** Baseline widely available (`accent-color`: Chrome 93+, Safari 15.4+, Firefox 92+). `caret-shape` is Chrome 144+ only; treat it as decoration.
**Source:** [MDN: accent-color](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color), [MDN: caret-color](https://developer.mozilla.org/en-US/docs/Web/CSS/caret-color), [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)

## Cascade layers

Layer order decides precedence between resets, vendor styles, the design system, and utilities. A low-specificity rule in a later layer beats a high-specificity rule in an earlier one, which is what makes `!important` unnecessary.

```css
@layer reset, vendor, design-system, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer vendor {
  .prose h2 { margin-top: 1.5em; }
}

@layer design-system {
  .card-heading { font-size: 1.25rem; font-weight: 600; }
}

@layer utilities {
  .m-0 { margin: 0; } /* wins by layer order, not specificity */
}
```

**Support:** Baseline widely available (Chrome 99+, Safari 15.4+, Firefox 97+).
**Source:** [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

## Customizable select

`appearance: base-select` opts a native `<select>` and its picker into full CSS styling while keeping keyboard and screen reader behavior.

```css
select,
::picker(select) {
  appearance: base-select;
}

::picker(select) {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 4px;
}

option:checked {
  background: var(--brand-subtle);
}
```

**Support:** Chrome 135+ only; other browsers render the native picker, which is the fallback.
**Source:** [Customize a select with CSS](https://nerdy.dev/customize-a-select)

## Squircle corners with corner-shape

Continuous-curvature corners, the shape iOS icons use, from one property layered on `border-radius`.

```css
.app-icon {
  border-radius: 28%;
  corner-shape: squircle;
}
```

**Support:** Chrome 139+ only; other browsers show the round corner, which is the fallback.
**Source:** [MDN: corner-shape](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape)

## Cut and notched shapes with shape()

`clip-path: shape()` draws with path-like commands in CSS units, so a chamfered or notched card is one element with responsive geometry.

```css
.ticket {
  clip-path: shape(from 24px 0, hline to 100%, vline to 100%, hline to 0, vline to 24px, close);
}
```

**Support:** Baseline newly available February 2026 (Chrome 135+, Safari 18.4+, Firefox 148+).
**Source:** [MDN: shape()](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/shape)
