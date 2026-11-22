# CSS animation and anchoring

Load when: animating to `height: auto`, expanding or collapsing content, anchoring popovers and tooltips with collision fallbacks, entry and exit through `display: none` or the top layer, animating gradients or custom properties, hover states that flicker, native accordions, sticky-state styling, or discrete badge pops with keyframe overshoot.
Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
About 280 lines. Support lines verified against MDN on 2026-09-10.

## Animate to height: auto with interpolate-size

Transitions between a length and an intrinsic keyword (`auto`, `min-content`, `fit-content`) without measuring in JavaScript or faking it with `max-height`.

```css
:root {
  interpolate-size: allow-keywords; /* one-time opt-in, inherited */
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 300ms var(--ease-out);
}

.accordion[open] .accordion-content {
  height: auto;
}
```

**Support:** Chrome 129+, Edge 129+. Not in Safari or Firefox; pair with the grid-rows fallback below.
**Source:** [Chrome for Developers: Animate to height: auto](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)

## Animate height everywhere with grid rows

The cross-browser way to expand and collapse content: animate `grid-template-rows` between `0fr` and `1fr`. The child needs `min-height: 0` because grid items default to `min-height: auto`.

```css
.expander {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms var(--ease-out);
}

.expander[data-open="true"] {
  grid-template-rows: 1fr;
}

.expander > .inner {
  min-height: 0;
  overflow: hidden;
}
```

**Support:** Baseline widely available (Chrome 107+, Safari 16+, Firefox 66+ for animatable `fr` tracks).
**Source:** [Chrome for Developers: grid-template-rows technique](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)

## Intrinsic size math with calc-size()

Computes a value relative to an intrinsic size. `calc-size()` results are interpolable, so no `interpolate-size` opt-in is needed.

```css
.drawer {
  height: 0;
  overflow: hidden;
  transition: height 250ms var(--ease-out);
}

.drawer[open] {
  /* 80% of the content's auto height */
  height: calc-size(auto, size * 0.8);
}
```

**Support:** Chrome 129+, Edge 129+. Not in Safari or Firefox.
**Source:** [Chrome for Developers: calc-size()](https://developer.chrome.com/docs/css-ui/animate-to-height-auto#animate_to_and_from_intrinsic_sizing_keywords_with_calc-size)

## Anchor a popover with position-area

Positions a floating element relative to a named anchor on a 3x3 grid around it, replacing coordinate math and positioning libraries for the common cases.

```css
.trigger-button {
  anchor-name: --nav-trigger;
}

.tooltip {
  position: fixed;
  position-anchor: --nav-trigger;
  position-area: top center;
  margin-bottom: 8px;
}
```

**Support:** Baseline newly available January 2026 (Chrome 129+, Safari 26+, Firefox 147+).
**Source:** [Chrome for Developers: CSS Anchor Positioning API](https://developer.chrome.com/docs/css-ui/anchor-positioning-api), [MDN: position-area](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area)

## Collision fallbacks with position-try-fallbacks

Declares where an anchored element may move when it would overflow the viewport. The built-in `flip-block` and `flip-inline` keywords cover most menus; `@position-try` defines custom fallbacks.

```css
.popover-menu {
  position: fixed;
  position-anchor: --action-menu;
  position-area: bottom span-right;
  margin-top: 6px;
  position-try-fallbacks: flip-block, --align-left;
}

@position-try --align-left {
  position-area: bottom span-left;
}
```

**Support:** Baseline newly available January 2026 (Chrome 125+, Safari 26+, Firefox 147+).
**Source:** [Chrome for Developers: position-try fallbacks](https://developer.chrome.com/docs/css-ui/anchor-positioning-api#adjust_anchor_positions_with_position-try)

## Tooltips that flip on clipping with anchor positioning

Tooltips positioned with legacy `position: absolute; left: 100%; translate: 0 -50%` get cut off near viewport boundaries. Modern CSS anchor positioning detects collisions and flips automatically using `position-try-fallbacks: flip-inline, flip-block`.

```css
.trigger {
  anchor-name: --tip;
}

.tooltip {
  position: fixed;
  position-anchor: --tip;
  position-area: right;
  position-try-fallbacks: flip-inline, flip-block;
}

/* Legacy way (gets cut off near edges):
.tooltip {
  position: absolute;
  left: 100%;
  translate: 0 -50%;
}
*/
```

**Support:** Baseline newly available January 2026 (Chrome 125+, Safari 26+, Firefox 147+).
**Source:** [Chrome for Developers: CSS Anchor Positioning API](https://developer.chrome.com/docs/css-ui/anchor-positioning-api), [MDN: position-try-fallbacks](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks)

## Enter and exit through display: none and the top layer

`@starting-style` gives the entry keyframe; `transition-behavior: allow-discrete` on `display` and `overlay` keeps the element rendered until the exit transition ends. Declare the transition on the base rule, not only on the open state, or closing snaps.

```css
dialog {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out),
    display 200ms allow-discrete,
    overlay 200ms allow-discrete;
}

dialog[open] {
  opacity: 1;
  transform: none;
}

@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
}
```

The same pattern fades hidden panels on resize instead of popping them: transition `display` with `allow-discrete` inside the media query.

**Support:** Baseline newly available 2024 (Chrome 117+, Safari 17.5+, Firefox 129+).
**Source:** [MDN: @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style), [Chrome Blog: entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations)

## Animate gradients and custom properties with @property

Registering a custom property with a type lets the browser interpolate it, so gradient angles and stops transition instead of jumping.

```css
@property --gradient-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@property --stop-color {
  syntax: "<color>";
  inherits: false;
  initial-value: oklch(0.65 0.24 260);
}

.gradient-card {
  background: conic-gradient(from var(--gradient-angle), var(--stop-color), oklch(0.7 0.18 180), var(--stop-color));
  transition: --gradient-angle 250ms ease, --stop-color 250ms ease;
}

.gradient-card:hover {
  --gradient-angle: 180deg;
  --stop-color: oklch(0.75 0.28 320);
}
```

**Support:** Baseline newly available 2024 (Chrome 85+, Safari 16.4+, Firefox 128+).
**Source:** [web.dev: @property is Baseline](https://web.dev/blog/at-property-baseline)

## Hover states that flicker

When the hovered element itself moves, scales, or shrinks on hover, the pointer can leave it mid-animation and the state flips back and forth. Listen for hover on a stable trigger and apply the effect to a child.

```css
/* flickers: the hovered element shrinks away from the pointer */
.card:hover { transform: scale(0.98); }

/* stable: the wrapper stays put, the inner surface moves */
.card-trigger:hover .card-surface { transform: scale(0.98); }
```

The same separation fixes "focus by demotion" lists: `.list:hover > :not(:hover) { opacity: 0.5; }` dims siblings without `:has()`.

**Support:** Baseline widely available.
**Source:** [Fix flickering hover states](https://nerdy.dev/hover-not-hover-sorry-not-sorry)

## Accordion with details and ::details-content

The native disclosure element exposes an animatable content box. With `interpolate-size: allow-keywords` set, it transitions to `auto` height; the accordion needs no JavaScript.

```css
details::details-content {
  block-size: 0;
  overflow-y: clip;
  transition: block-size 250ms var(--ease-out), content-visibility 250ms allow-discrete;
}

details[open]::details-content {
  block-size: auto;
}
```

`hidden="until-found"` on collapsed content keeps it searchable with find-in-page and opens the section on a match.

**Support:** `::details-content` Baseline newly available September 2025 (Chrome 131+, Safari 18.4+, Firefox 143+). `hidden="until-found"` Chrome 105+, Safari 26+, Firefox 139+.
**Source:** [MDN: ::details-content](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content), [MDN: hidden](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden)

## Sticky header state with scroll-state()

Styles a sticky element's contents differently once it is stuck, or a snapped item once it is snapped, with no IntersectionObserver. The query applies to descendants of the container.

```css
.header {
  position: sticky;
  top: 0;
  container-type: scroll-state;
}

@container scroll-state(stuck: top) {
  .header-inner {
    box-shadow: 0 1px 0 var(--border-subtle);
    backdrop-filter: blur(12px);
  }
}
```

**Support:** Chrome 133+ only. Progressive enhancement; the unstuck style is the fallback.
**Source:** [Chrome for Developers: scroll-state() queries](https://developer.chrome.com/blog/css-scroll-state-queries)

## Micro-interaction pop with overshoot

For discrete badges, emoji reactions, and confirmation checkmarks, a keyframe scale curve with a brief overshoot gives the arrival tangible physical weight without loading spring physics libraries.

```css
@keyframes pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  70% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.reaction-pop {
  animation: pop 220ms var(--ease-out) forwards;
}
```

The 8% overshoot (`scale(1.08)`) at 70% of duration adds perceived physical settlement. Combining with a non-zero starting scale (`scale(0.6)`) avoids the artificial appearance of popping out of nothingness while preserving snappiness.

**Support:** Baseline widely available.
**Source:** [Overshoot curves for scale animations](https://x.com/aviralj02/status/2116100296233652706)
