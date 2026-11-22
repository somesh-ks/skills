# Color mechanics

Load when: wiring dark mode, switching themes without a smear, deriving hover and active shades from one token, blending overlays, using wide-gamut color, perceptual gradient interpolation, color hints, procedural noise and grain texture, blending text over dynamic backgrounds, or picking readable text on an arbitrary background.
Palette and token architecture belong to the project's design system; this file holds mechanisms.
About 130 lines. Support lines verified against MDN on 2026-09-10.

## Dark mode in one declaration with light-dark()

Each token carries both values; `color-scheme` decides which one applies and also themes native controls and scrollbars.

```css
:root {
  color-scheme: light dark;
  --bg-canvas: light-dark(oklch(0.98 0.005 240), oklch(0.14 0.01 260));
  --bg-surface: light-dark(oklch(1 0 0), oklch(0.18 0.012 260));
  --text-primary: light-dark(oklch(0.15 0.015 260), oklch(0.96 0.005 240));
}

[data-theme="dark"]  { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }
```

**Support:** Baseline newly available 2024 (Chrome 123+, Safari 17.5+, Firefox 120+).
**Source:** [web.dev: color themes with Baseline CSS](https://web.dev/articles/baseline-in-action-color-theme), [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)

## Theme switch without a transition smear

When the theme flips, every colour transition fires at once and the page smears. Turn transitions off for the flip, force a style flush so the new colours commit, then restore them after the next paint.

```javascript
export function switchTheme(apply) {
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none !important}';
  document.head.append(style);
  apply();                              // set data-theme or the class; a no-op for OS-level changes
  void document.body.offsetHeight;      // synchronous style flush
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => switchTheme(() => {}));
```

`next-themes` ships the same steps as `disableTransitionOnChange`.

**Support:** Baseline widely available.
**Source:** [next-themes](https://github.com/pacocoursey/next-themes)

## Derive states from one token with relative color

Hover, active, subtle, and border shades come from the brand color, so changing one token changes them all.

```css
:root {
  --brand: oklch(0.6 0.22 260);
  --brand-hover: oklch(from var(--brand) calc(l + 0.08) calc(c + 0.02) h);
  --brand-active: oklch(from var(--brand) calc(l - 0.1) c h);
  --brand-subtle: oklch(from var(--brand) l c h / 0.15);
  --brand-border: oklch(from var(--brand) calc(l + 0.15) 0.06 h / 0.4);
}
```

**Support:** Baseline newly available 2024 (Chrome 119+, Safari 16.4+, Firefox 128+).
**Source:** [MDN: relative colors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)

## Overlays with color-mix()

Blends the current text color into a transparent background for hover and pressed states that work on any surface.

```css
.button-ghost:hover  { background: color-mix(in oklab, currentColor 10%, transparent); }
.button-ghost:active { background: color-mix(in oklab, currentColor 18%, transparent); }
```

**Support:** Baseline widely available (Chrome 111+, Safari 16.2+, Firefox 113+).
**Source:** [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)

## Wide gamut on capable displays

Keeps an sRGB fallback and upgrades accents to Display P3 where the screen can show it.

```css
:root {
  --accent: rgb(0 102 255);
}

@media (color-gamut: p3) {
  :root {
    --accent: color(display-p3 0 0.42 1);
  }
}
```

**Support:** Baseline widely available (`color()`: Chrome 111+, Safari 15+, Firefox 113+).
**Source:** [MDN: color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color)

## Text over dynamic backgrounds with plus-lighter

`mix-blend-mode: plus-lighter` adds the text's light to whatever moves behind it, so type stays readable and luminous over animated gradients or video without a scrim.

```css
.hero-title {
  color: white;
  mix-blend-mode: plus-lighter;
  isolation: auto; /* must not be isolated from the background it blends with */
}
```

**Support:** Baseline widely available (`plus-lighter`: Chrome 100+, Safari 15.4+, Firefox 100+).
**Source:** [MDN: mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)

## Readable text on any background with contrast-color()

Returns black or white, whichever contrasts more with the given color, for badges and swatches whose background is user-chosen or data-driven.

```css
.tag {
  background: var(--tag-color);
  color: contrast-color(var(--tag-color));
}

@supports not (color: contrast-color(red)) {
  .tag { color: var(--text-primary); }
}
```

**Support:** Baseline newly available April 2026 (Chrome 147+, Safari 26+, Firefox 146+).
**Source:** [MDN: contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color)

## Perceptual gradient interpolation and color hints

CSS gradients default to sRGB, which blends colors along a straight Cartesian line. This causes the infamous "gray dead zone", where intermediate colors lose saturation and look muddy. Modern CSS allows specifying the interpolation color space directly in the gradient function:

- **`in oklab` (recommended default):** Blends linearly through perceptual lightness and chroma. Eliminates the gray dead zone while maintaining consistent brightness and preventing unwanted hue shifts. Tailwind CSS v4 defaults to `oklab` for gradients.
- **`in oklch` (vibrant rainbow and glows):** Blends along the angular hue circle. Produces radiant, saturated intermediate colors across distant hues, but can introduce unexpected intermediate colors if the hue arc crosses other colors.

```css
/* Eliminates muddy gray midtones */
.surface-gradient {
  background: linear-gradient(in oklab, var(--primary), var(--secondary));
}

/* Radiant wide-gamut accent blend */
.glow-gradient {
  background: radial-gradient(circle in oklch, oklch(0.8 0.22 140), oklch(0.6 0.25 280));
}
```

Use **color hints** (a single percentage or length between two color stops) to control where the 50/50 midpoint blend falls without creating artificial stop boundaries:

```css
/* Red stays dominant for 70% of the span before transitioning */
.callout {
  background: linear-gradient(to right in oklab, var(--brand-red), 70%, var(--brand-blue));
}
```

**Support:** Baseline newly available 2023 (Chrome 111+, Safari 16.2+, Firefox 113+).
**Source:** [MDN: linear-gradient() color interpolation](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#interpolation)

## Procedural noise and grain texture with SVG

Noise breaks up visual banding on gradients and injects tactile physical texture into digital surfaces. An SVG `feTurbulence` filter blended with `mix-blend-mode: overlay` at 8% opacity provides subtle grain without loading external bitmap assets.

For small cards and focused elements, use a live SVG filter:

```html
<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</svg>

<div class="surface">
  <div class="grain-overlay" aria-hidden="true"></div>
  <div class="content">...</div>
</div>
```

```css
.surface {
  position: relative;
  isolation: isolate; /* keeps blend-mode confined to this surface */
  overflow: hidden;
  background: linear-gradient(in oklab, var(--color-surface-start), var(--color-surface-end));
}

.grain-overlay {
  position: absolute;
  inset: 0;
  filter: url(#grain);
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

Container `isolation: isolate` is essential: without it, `mix-blend-mode: overlay` bleeds through the container and blends with whatever background sits behind the component.

### Performance optimization for large areas and scrolling heroes

Generating `feTurbulence` on every frame recalculates noise per pixel during scroll and paint passes, which can severely drop frame rates on mobile devices or large hero sections.

The fix is to rasterize the noise once into a 200px repeatable SVG data URI tile. The browser renders the 200px square once into GPU memory and repeats it seamlessly at near-zero runtime cost:

```css
.hero-surface {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.hero-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  background-repeat: repeat;
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

Rule of thumb: use live SVG filters on small interactive widgets. Use tiled data URIs anywhere the surface is larger than 400px or animates/scrolls.

**Support:** Baseline widely available.
**Source:** [MDN: feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence), [MDN: mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)

