# Accessibility mechanics

Load when: locking the page behind a drawer or overlay, drawing focus rings that survive any background, honoring reduced motion without breaking transition events, hiding text visually, announcing status to screen readers, or supporting forced-colors mode.
Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
Support lines verified against MDN on 2026-09-10.

Contents:
- Lock the background with inert and restore focus
- Focus ring that reads on any background
- Reduced motion without breaking transition events
- Visually hidden text
- Screen reader announcements that never drop
- Forced-colors mode

## Lock the background with inert and restore focus

`inert` removes the background tree from tab order, clicks, and the accessibility tree while a drawer is open. Remember what had focus and give it back on close, or keyboard users are stranded.

```javascript
let restoreFocusTo = null;

export function openDrawer() {
  const main = document.getElementById('app-content');
  const drawer = document.getElementById('side-drawer');
  restoreFocusTo = document.activeElement;
  main.setAttribute('inert', '');
  drawer.classList.add('is-open');
  drawer.querySelector('#close-btn')?.focus();
}

export function closeDrawer() {
  const main = document.getElementById('app-content');
  const drawer = document.getElementById('side-drawer');
  main.removeAttribute('inert');
  drawer.classList.remove('is-open');
  restoreFocusTo?.focus();
  restoreFocusTo = null;
}
```

Native `<dialog>` with `showModal()` does both for you; use it unless the overlay must not be modal.

**Support:** Baseline widely available (Chrome 102+, Safari 15.5+, Firefox 112+).
**Source:** [web.dev: the inert attribute](https://web.dev/articles/inert), [MDN: inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)

## Focus ring that reads on any background

Two rings: an inner one the color of the surface, an outer one in the focus color. It contrasts against white, dark, and image backgrounds and adds no layout size.

```css
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--bg-surface),
    0 0 0 4px var(--focus-color);
  border-radius: inherit;
}

@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid transparent; /* forced to a visible system color */
    outline-offset: 2px;
  }
}
```

**Support:** Baseline widely available.
**Source:** [Designing accessible focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/)

## Reduced motion without breaking transition events

A near-zero animation duration keeps `animationend` firing, so JavaScript that waits for it still runs. Scope the global reset to animations and scrolling. A global `transition-duration: 0.01ms !important` would also zero the short opacity fades that reduced motion keeps (fewer and gentler, not zero), so transitions are handled per component with the opt-in form below.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

The reset still flattens keyframe fades. Write entrance fades as opacity transitions, or exempt a fade-only keyframe inside the same query with a more specific `!important` rule, such as `.fade-in { animation-duration: var(--duration-fast) !important; }`. Where third-party CSS you cannot edit moves elements with transitions, scope a `transition-duration: 0.01ms !important` reset to that widget's container, never to `*`.

Prefer replacing motion over removing it where it carries meaning: a crossfade instead of a slide, no parallax, no autoplaying loops. The opt-in form does that per component: the opacity fade runs for everyone, and movement, scale, and blur join only without the preference.

```css
.panel {
  transition: opacity 150ms var(--ease-out);
}

@media (prefers-reduced-motion: no-preference) {
  .panel {
    transition-property: opacity, translate, scale, filter;
    transition-duration: 300ms;
  }
}
```

Under `reduce`, the panel moves with no transition, so no `transitionend` fires for `translate`. Code that waits for the end of the change should check `event.propertyName === 'opacity'`, which fires in both modes.

In Motion, `<MotionConfig reducedMotion="user">` drops transform and layout animation and keeps opacity. `filter` still runs there, so branch on `useReducedMotion()` where a recipe animates blur.

**Support:** Baseline widely available.
**Source:** [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Visually hidden text

Keeps text in the accessibility tree while removing it from view, without the scrollbar glitches of older clip techniques.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

**Support:** Baseline widely available.
**Source:** [The A11Y Project: how to hide content](https://www.a11yproject.com/posts/how-to-hide-content/)

## Screen reader announcements that never drop

A single live region updated twice in one frame announces once. Two regions used alternately, each cleared before reuse, guarantee every message is observed.

```javascript
const regions = [];
let turn = 0;

function region() {
  if (regions.length) return regions[turn++ % 2];
  for (let i = 0; i < 2; i++) {
    const el = document.createElement('div');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    document.body.appendChild(el);
    regions.push(el);
  }
  return regions[turn++ % 2];
}

export function announce(message) {
  const el = region();
  el.textContent = '';
  setTimeout(() => { el.textContent = message; }, 50);
}
```

**Support:** Baseline widely available.
**Source:** [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)

## Forced-colors mode

In Windows high contrast mode the browser replaces colors with system colors and drops backgrounds and shadows. Transparent borders become visible because `border-color` is forced, so a transparent border is how a card or button keeps its edge. Use system color keywords where you must style explicitly, and `forced-color-adjust: none` only for swatches whose color is the content.

```css
.card {
  background: var(--surface);
  border: 1px solid transparent; /* invisible normally, visible in forced colors */
}

@media (forced-colors: active) {
  .icon { color: CanvasText; }
  .button-primary { border-color: ButtonText; }
  .color-swatch { forced-color-adjust: none; }
}
```

Test in Chrome DevTools: Rendering panel, "Emulate CSS media feature forced-colors".

**Support:** Baseline widely available (Chrome 89+, Safari 16+, Firefox 89+).
**Source:** [MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
