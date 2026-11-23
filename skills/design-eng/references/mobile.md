# Mobile and touch mechanics

Load when: a web app should feel native on a phone, taps flash gray, document canvas reveals during overscroll, text gets selected while scrubbing, a drawer scrolls the page behind it, the page zooms when an input is focused, or `100vh` overflows behind browser chrome.
Support lines verified against MDN on 2026-09-10.

Contents:
- Native feel in a browser tab
- Keep a drawer's scroll inside the drawer
- Stop iOS zooming into inputs
- Scrollbars that do not look like 2005
- Document canvas background for rubber-band overscroll

## Native feel in a browser tab

The small set of properties that removes the "web page" tells on iOS and Android.

```css
button, [role="button"], .draggable, .tab {
  -webkit-tap-highlight-color: transparent; /* no gray flash on tap */
  user-select: none;                        /* no text selection while scrubbing or double-tapping */
  touch-action: manipulation;               /* no double-tap zoom, so taps fire immediately */
}

html {
  -webkit-text-size-adjust: 100%;           /* no font inflation on orientation change */
  overscroll-behavior-y: none;              /* no rubber-band or pull-to-refresh behind an app shell */
}

.app-shell {
  min-height: 100dvh;                       /* tracks the visible viewport as browser chrome shows and hides */
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Support:** `touch-action`, `user-select`, dynamic viewport units, and `env()` are Baseline widely available. `-webkit-tap-highlight-color` is WebKit and Blink only, which is where it matters. `overscroll-behavior`: Chrome 63+, Firefox 59+, Safari 16+.
**Source:** [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action), [MDN: overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior), [MDN: viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport)

## Keep a drawer's scroll inside the drawer

Scroll chaining lets a sheet's scroll leak to the page once it hits the end. Containing it keeps the page still and the gesture predictable.

```css
.sheet-content {
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable; /* no width jump when the scrollbar appears */
}
```

**Support:** `overscroll-behavior`: Chrome 63+, Firefox 59+, Safari 16+. `scrollbar-gutter`: Baseline newly available (Chrome 94+, Safari 18.2+, Firefox 97+).
**Source:** [MDN: overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior), [MDN: scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter)

## Stop iOS zooming into inputs

iOS Safari zooms the page when a focused input's font size is under 16px. Keep inputs at 16px and scale visually if a smaller look is required. This is an accessibility feature, so do not disable zoom with the viewport meta tag.

```css
input, select, textarea {
  font-size: max(16px, 1rem);
}

.input-compact {
  font-size: 16px;
  transform: scale(0.875);
  transform-origin: left center;
}
```

**Support:** iOS Safari behavior.
**Source:** [MDN: font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size)

## Scrollbars that do not look like 2005

Thin, translucent scrollbars that match the theme, and a stable gutter so content does not shift when they appear.

```css
.scroll-area {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklab, currentColor 30%, transparent) transparent;
  scrollbar-gutter: stable;
}
```

**Support:** Baseline newly available December 2024 (`scrollbar-color`: Chrome 121+, Safari 18.2+, Firefox 64+).
**Source:** [MDN: scrollbar-color](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color)

## Document canvas background for rubber-band overscroll

When users pull past the edge of a page on iOS Safari or macOS, the browser rubber-bands and reveals the document canvas behind the page. If the page background is styled only on `<body>` or an inner `<main>` container, elastic overscroll exposes an unstyled white canvas strip, causing an eye-straining flash in dark mode.

Paint the document canvas by setting the theme background directly on `<html>`, and synchronize the browser chrome via the `theme-color` meta tag:

```css
:root, html {
  --background: #ffffff;
  --foreground: #09090b;
}

html[data-theme="dark"] {
  --background: #09090b;
  --foreground: #f4f4f5;
}

/* Paint the canvas behind elastic overscroll */
html {
  background-color: var(--background);
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

```html
<!-- Match mobile browser status bar and window chrome to canvas declaratively -->
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090b">
```

Setting `background-color` on `html` guarantees that elastic overscroll, pull-to-refresh boundaries, and viewport orientation shifts retain the theme surface instead of revealing the default browser viewport canvas.

**Support:** Canvas background via `html` is Baseline widely available. `<meta name="theme-color">` is supported in Chromium browsers and Android; Safari 26 supports it for installed web apps; Firefox does not support it.
**Source:** [W3C CSS Backgrounds: Canvas Backgrounds](https://www.w3.org/TR/css-backgrounds-3/#special-backgrounds), [MDN: theme-color](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color)

