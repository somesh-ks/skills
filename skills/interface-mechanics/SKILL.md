---
name: interface-mechanics
description: "Verified CSS, DOM, motion, performance, and accessibility mechanics, each with browser support and a source. Use when building or reviewing anchor positioning, tooltip clipping, popovers, dialogs, @starting-style, height auto animation, :has(), scroll-driven effects, view transitions, FLIP, drag, hover flicker or dead zones between targets, command palettes, icon swaps, a button or toolbar that shifts when a spinner, icon, or label swaps, blur cost, light-dark(), relative color, theme switching without a smear, container units, font loading, text-box-trim, inert and focus, forced colors, or native mobile feel. Not for visual style or deciding whether to animate."
license: MIT
metadata:
  author: somesh-ks
  version: "1.0.0"
  verified: "2026-09-10"
---

# Interface mechanics

Router only. Find the row, load that one file, apply the technique together with its Support line. Load a second file only when the task spans domains.

| Need | File |
| --- | --- |
| Height auto and collapse, anchors and fallbacks, tooltip auto-flipping, dialog and popover entry/exit, @property, hover flicker, details accordion, scroll-state, pop overshoot | `references/css-animation.md` |
| :has() quantity and parent state, scroll edge fades, subgrid, text-wrap, table highlighting, concentric radius tokens, field-sizing, bold hover, layered shadows, blur-to-offset ratio, container border contrast, shadow ring, image outline, icon stroke, 1cap icon sizing, native control colors, @layer, custom select, squircles, shape() | `references/css-visual.md` |
| View transitions (reveal, directional), shared layout transitions (layoutId), FLIP, analytical spring solver | `references/dom-transitions.md` |
| Pointer-capture drag, cursor velocity, drag lift, click sound and haptics, hit areas with no dead zones, roving tabindex, command palette, hold-to-repeat, pointer position custom properties, scroll snap events, actionable form errors | `references/dom-input.md` |
| Interruptible velocity springs, scroll-linked progress, icon morph, icon swap cross-fade, will-change lifecycle, stagger, number ticker, linear() spring curves, overlap choreography | `references/motion.md` |
| content-visibility, contain, blurry text and layer promotion, passive listeners and yielding, backdrop blur placement, fast-scroll blur, offscreen loops | `references/performance.md` |
| Container units, font metric overrides, full-bleed grid, @scope, optical sizing and weight transitions, text-box icon anchoring, custom string truncation, descender-safe underlines, anchor scroll offset, macOS font smoothing, tabular numbers | `references/typography.md` |
| light-dark(), theme switch without a smear, relative color, perceptual gradient interpolation (oklab/oklch), SVG noise and grain tiles, color-mix overlays, P3, plus-lighter, contrast-color() | `references/color.md` |
| inert with focus restore, focus rings, reduced motion, sr-only, live announcements, forced colors | `references/accessibility.md` |
| Tap highlight, touch-action, rubber-band overscroll canvas, dvh, safe area, input zoom, scrollbars | `references/mobile.md` |
| Slot and asChild, controlled plus uncontrolled state, tabs with ARIA, distance-aware tab motion, dropdown sizing and truncation, optical padding for icon buttons, buttons that keep their size across loading, icon, and label states, character limits | `references/components.md` |

## Rules

- Every technique carries a **Support** line and a **Source** line. Carry both into your answer, directly under the code that uses the technique, so the reader can check them. Support lines were verified against MDN on the date in each file header; if that date is more than six months old, re-check support on MDN before relying on it.
- This skill supplies mechanisms only. Take durations, easings, radii, and scales from the project's own tokens. When the project has none, use the defaults below.
- Features marked as one browser only are progressive enhancement. The fallback must look intentional, not broken.

## Default tokens

Use these only when the project defines no motion tokens of its own.

```css
:root {
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);  /* easeOutQuint: entering and exiting UI */
  --ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);  /* easeInOutQuart: movement on screen */
}
```

Entering or exiting uses `--ease-out`, on-screen movement `--ease-in-out`, hover and color `ease`, constant motion `linear`. Skip `ease-in` on UI: it spends its first frames barely moving, right when the user is looking.

Duration scales with how far the element travels and how much of the screen it covers:

- Feedback on the element itself (press, hover, toggle): about 100–150ms.
- Something small appearing next to it (tooltip, menu, popover): about 150–200ms.
- A surface covering part of the page (modal, drawer, sheet): about 200–300ms.
- Lists entering one by one: offset each item by 30–50ms and cap the total.

Stay under 300ms to the moment the new state can be read and used. Under `prefers-reduced-motion: reduce`, keep short opacity fades and drop movement.

Curves: [easings.net](https://easings.net/). Durations: [Material Design 3: easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs).
