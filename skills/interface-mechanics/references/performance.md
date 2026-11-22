# Rendering performance

Load when: long lists or feeds render slowly, a widget's updates re-layout the page, animated text looks blurry, interactions feel laggy under load (INP), glass or blur surfaces stutter, or looping animations burn CPU offscreen.
Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
Support lines verified against MDN on 2026-09-10.

Contents:
- Skip offscreen rendering with content-visibility
- Isolate heavy widgets with contain
- Promote layers without blurring text
- Keep input responsive: passive listeners and yielding
- Keep backdrop blur off the animating surface
- Reduce blur while scrolling fast
- Pause looping animations offscreen

## Skip offscreen rendering with content-visibility

Defers layout and paint for sections outside the viewport until they approach it, while find-in-page and tab order keep working. The intrinsic size reserves space so the scrollbar does not jump.

```css
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 320px; /* remembered size once rendered, 320px before */
}
```

**Support:** Baseline newly available 2024 (Chrome 85+, Safari 18+, Firefox 125+).
**Source:** [web.dev: content-visibility is Baseline](https://web.dev/blog/css-content-visibility-baseline)

## Isolate heavy widgets with contain

Tells the engine that changes inside the widget cannot affect the rest of the page, so a data table or editor re-laying out stays local.

```css
.dashboard-widget {
  contain: layout paint style;
  overflow: hidden; /* paint containment clips anyway; make it explicit */
}
```

**Support:** Baseline widely available (Chrome 52+, Safari 15.4+, Firefox 69+).
**Source:** [MDN: contain](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)

## Promote layers without blurring text

`transform: translateZ(0)` and `translate3d(0, 0, 0)` force a permanent layer whose text is rasterized once and then scaled, which is where blurry text comes from. Promote only for the duration of an interaction, keep text-bearing layers on whole pixels at rest, and never scale a layer that contains text you expect to stay crisp.

```css
.card {
  transition: transform 200ms ease;
}

.card:hover,
.card:focus-visible,
.card[data-animating] {
  will-change: transform; /* promoted only while it can move */
}

.card:not(:hover):not([data-animating]) {
  transform: none;        /* rest on integer pixels; no lingering fractional transform */
}
```

For scripted control of the promotion window, see `motion.md`.

**Support:** Baseline widely available.
**Source:** [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change), [web.dev: compositor-only properties and layer count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)

## Keep input responsive: passive listeners and yielding

Passive touch and wheel listeners let scrolling start before the handler runs. Long handlers yield to the scheduler so the next paint is not blocked, which is what INP measures.

```javascript
window.addEventListener('touchstart', onTouchStart, { passive: true });
window.addEventListener('wheel', onWheel, { passive: true });

export async function processInChunks(items, work) {
  for (const item of items) {
    work(item);
    if ('scheduler' in window && 'yield' in scheduler) await scheduler.yield();
    else await new Promise((r) => setTimeout(r, 0));
  }
}
```

**Support:** Passive listeners Baseline widely available. `scheduler.yield()` Chrome 129+, Firefox 142+; not in Safari, hence the fallback.
**Source:** [web.dev: optimize INP](https://web.dev/articles/optimize-inp), [MDN: Scheduler.yield()](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield)

## Keep backdrop blur off the animating surface

A `backdrop-filter` on a surface that is scaling or fading recomputes the blur every frame. Put the blur on a static pseudo-element behind the surface and animate the surface alone.

```css
.modal {
  position: relative;
  transform: scale(var(--scale));
  transition: transform 200ms var(--ease-out);
  background: color-mix(in oklab, var(--bg-surface) 85%, transparent);
}

.modal::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  backdrop-filter: blur(16px);
  pointer-events: none;
}
```

**Support:** Baseline newly available 2024 (`backdrop-filter` unprefixed: Chrome 76+, Safari 18+, Firefox 103+).
**Source:** [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)

## Reduce blur while scrolling fast

Heavy blur behind content that is moving quickly costs GPU time exactly when frames matter most, and the eye cannot read the blur anyway. Drop the radius while scroll velocity is high and restore it when the page settles.

```javascript
let lastY = scrollY;
let lastT = performance.now();
let settle = 0;

addEventListener('scroll', () => {
  const now = performance.now();
  const velocity = Math.abs(scrollY - lastY) / Math.max(now - lastT, 1); // px per ms
  lastY = scrollY;
  lastT = now;
  if (velocity > 2) document.documentElement.setAttribute('data-fast-scroll', '');
  clearTimeout(settle);
  settle = setTimeout(() => document.documentElement.removeAttribute('data-fast-scroll'), 150);
}, { passive: true });
```

```css
.glass {
  backdrop-filter: blur(16px);
  transition: backdrop-filter 150ms var(--ease-out);
}

:root[data-fast-scroll] .glass {
  backdrop-filter: blur(4px);
}
```

**Support:** Baseline widely available.
**Source:** [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)

## Pause looping animations offscreen

Spinners and pulses keep the compositor busy while hidden. Pause them when they leave the viewport, and disconnect the observer when the component unmounts.

```javascript
export function pauseOffscreenAnimations(selector = '.looping', threshold = 0.1) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    }
  }, { threshold });

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}
```

`content-visibility: auto` on the containing section achieves the same for whole regions without script.

**Support:** Baseline widely available.
**Source:** [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver), [MDN: animation-play-state](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state)
