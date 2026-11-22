# Pointer, keyboard, and input mechanics

Load when: drag or scrub interactions, cursor-velocity effects, drag lift feedback, click sounds or haptics, hover that flickers or gaps that do not click between spaced targets, keyboard navigation in lists and menus, command palettes, hold-to-repeat controls, pointer-driven glow or parallax, scroll snap events, or actionable form errors with first-invalid scroll.
Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
Support lines verified against MDN on 2026-09-10.

Contents:
- Drag that survives leaving the window
- Cursor velocity for tactile drags
- Drag lift feedback
- Click sound and haptic feedback
- Hit areas with no dead zones
- Roving tabindex for lists and menus
- Command palette mechanics
- Hold-to-repeat steppers
- Pointer position as custom properties
- React to scroll snap changes
- Actionable form errors and first-invalid scroll

## Drag that survives leaving the window

`setPointerCapture` keeps delivering moves to the handle after the pointer leaves it or the viewport. `touch-action: none` on the handle stops the browser from turning a touch drag into a scroll. Returns a cleanup so listeners never accumulate.

```javascript
export function attachPointerDrag(handle, onDrag) {
  let dragging = false;
  let startX = 0;
  let startY = 0;

  const down = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
    handle.classList.add('is-dragging');
  };
  const move = (e) => {
    if (!dragging) return;
    onDrag({ deltaX: e.clientX - startX, deltaY: e.clientY - startY, clientX: e.clientX, clientY: e.clientY });
  };
  const stop = (e) => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('is-dragging');
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
  };

  handle.style.touchAction = 'none';
  handle.addEventListener('pointerdown', down);
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);

  return () => {
    handle.removeEventListener('pointerdown', down);
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', stop);
    handle.removeEventListener('pointercancel', stop);
  };
}
```

**Support:** Baseline widely available (Chrome 55+, Safari 13+, Firefox 59+).
**Source:** [MDN: Element.setPointerCapture()](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture), [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)

## Cursor velocity for tactile drags

Track pointer velocity, not only position. A fast move adds a little rotation or stretch for a moment; a slow one adds nothing. Keep the tracking state inside the closure so two drags never share it.

```javascript
export function createVelocityTilt(element, { maxTilt = 15, gain = 5 } = {}) {
  let lastX = 0;
  let lastTime = performance.now();

  return function onDrag(e) {
    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    const vx = (e.clientX - lastX) / dt;          // px per ms
    lastX = e.clientX;
    lastTime = now;

    const tilt = Math.max(-maxTilt, Math.min(maxTilt, vx * gain));
    element.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) rotate(${tilt}deg)`;
  };
}
```

Stretching along the direction of travel (`scaleX` proportional to `|vx|`) is the same idea for elements that move rather than tilt.

**Support:** Baseline widely available.
**Source:** [Cursor velocity dynamics](https://x.com/gabriell_lab/status/2062232102515675385)

## Drag lift feedback

When an item is picked up, it should leave the surface: a small scale-up, a degree or two of rotation toward the drag direction, a deeper shadow, and a visible handle. Set the tilt from the velocity function above.

```css
.item {
  --tilt: 0deg;
  transition: transform 150ms var(--ease-out), box-shadow 150ms var(--ease-out);
}

.item[data-dragging] {
  transform: scale(1.03) rotate(var(--tilt));
  box-shadow: 0 12px 24px hsl(var(--shadow-color) / 0.18);
  cursor: grabbing;
}
```

**Support:** Baseline widely available.
**Source:** [Drag interaction dynamics](https://x.com/alyx_so/status/2071064251037520255)

## Click sound and haptic feedback

Synthesizes a short click with the Web Audio API so no asset loads, and vibrates briefly where the platform allows it. Both must follow a user gesture.

```javascript
let audioCtx = null;

export function playClick({ pitch = 1800, duration = 0.015, volume = 0.08 } = {}) {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const t = audioCtx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(t + duration);
  } catch {
    /* audio blocked: stay silent */
  }
  navigator.vibrate?.(8);
}
```

**Support:** Web Audio is Baseline widely available. `navigator.vibrate` works in Chrome for Android only; Safari never shipped it and Firefox removed it in 129.
**Source:** [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [MDN: Navigator.vibrate()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)

## Hit areas with no dead zones

Spacing between interactive siblings (tabs, list rows, nav items, chart bars, calendar cells, icon buttons) must live inside each target, never between them. A `gap` or margin is empty DOM with no handler, so hover blinks off and clicks land on nothing while the pointer crosses it. Make each target fill its whole slot, flush with its neighbours, and recreate the spacing inside it with padding or a narrower centred child.

```tsx
<div className="flex items-stretch">                       {/* gap-0: the strip is one continuous target */}
  {bars.map((bar, i) => (
    <div
      key={bar.id}
      className="flex flex-1 flex-col items-center justify-end"   /* one full slot, full height */
      onPointerEnter={() => setHovered(i)}
      onPointerLeave={() => setHovered(null)}
    >
      <div className="w-full max-w-9" style={{ height: bar.value * UNIT }} />   {/* the narrower bar is the spacing */}
    </div>
  ))}
</div>
```

- Lists and menus: put the rhythm on each row as `py-*`, not between rows as `space-y-*` or `gap-*`.
- Rows that must stay column-aligned, such as bars and their labels, share the same flush layout, or their centres drift apart.
- The same move grows a small glyph to the minimum target size: pad the hit area, keep the glyph.
- Test by sweeping the pointer slowly across the component. The active state must never drop out inside its bounds.
- Leave `gap` alone where the items are discrete and the space between them is meant to be inert, such as cards or unrelated buttons.

**Support:** Baseline widely available.
**Source:** [Interactive hit area techniques](https://github.com/millionco/skills/tree/main/skills/interactive-hit-areas)

## Roving tabindex for lists and menus

One tab stop per widget, arrows move inside it. Items marked `aria-disabled` are skipped; checking `.disabled` only works on form controls.

```javascript
export function setupRovingTabindex(container, itemSelector = '[role="option"]') {
  const items = () => [...container.querySelectorAll(itemSelector)].filter((el) => el.getAttribute('aria-disabled') !== 'true');

  container.addEventListener('keydown', (e) => {
    const list = items();
    const current = list.indexOf(document.activeElement);
    if (current === -1) return;

    let next = current;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (current + 1) % list.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (current - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    else return;

    e.preventDefault();
    list.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
    list[next].focus();
  });
}
```

**Support:** Baseline widely available.
**Source:** [WAI-ARIA APG: roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)

## Command palette mechanics

A palette opened by a hotkey must appear on the next frame, keep the first result highlighted with the list scrolled to the top on every query change, and let Escape clear the query before it closes the palette.

```javascript
export function wirePalette({ root, input, list, render, close }) {
  const open = () => {
    root.hidden = false;                 // no entry animation: opened 100+ times a day
    requestAnimationFrame(() => input.focus());
  };

  input.addEventListener('input', () => {
    render(input.value);
    list.scrollTop = 0;
    list.querySelector('[data-selected]')?.removeAttribute('data-selected');
    list.firstElementChild?.setAttribute('data-selected', '');
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    if (input.value) { input.value = ''; render(''); return; }
    close();
  });

  return open;
}
```

**Support:** Baseline widely available.
**Source:** [cmdk command palette library](https://github.com/pacocoursey/cmdk)

## Hold-to-repeat steppers

A stepper that bumps once per click makes people click twenty times. After a short hold, repeat and speed up: the interval shrinks by a constant factor each tick, so acceleration is exponential.

```javascript
export function createHoldStepper(onStep, { initialDelay = 500, startRate = 200, minRate = 20, factor = 0.85 } = {}) {
  let timer = 0;
  let rate = startRate;

  const tick = () => {
    onStep();
    rate = Math.max(minRate, rate * factor);
    timer = setTimeout(tick, rate);
  };

  const start = () => {
    onStep();
    rate = startRate;
    timer = setTimeout(tick, initialDelay);
  };
  const stop = () => clearTimeout(timer);

  return { start, stop }; // bind start to pointerdown, stop to pointerup, pointercancel, and pointerleave
}
```

**Support:** Baseline widely available.
**Source:** [Hold-to-repeat steppers](https://x.com/alyx_so/status/2071657203887636725)

## Pointer position as custom properties

One `pointermove` listener writes the pointer's position into custom properties; CSS turns it into a glow that follows the cursor, a spotlight border, or layered parallax. No per-frame JavaScript styling.

```javascript
export function trackPointer(element) {
  const onMove = (e) => {
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--px', ((e.clientX - rect.left) / rect.width).toFixed(3));
    element.style.setProperty('--py', ((e.clientY - rect.top) / rect.height).toFixed(3));
  };
  element.addEventListener('pointermove', onMove, { passive: true });
  return () => element.removeEventListener('pointermove', onMove);
}
```

```css
.card {
  --px: 0.5;
  --py: 0.5;
  background:
    radial-gradient(240px circle at calc(var(--px) * 100%) calc(var(--py) * 100%), oklch(0.9 0.05 260 / 0.35), transparent 70%),
    var(--bg-surface);
}

.card .layer {
  translate: calc((var(--px) - 0.5) * var(--depth, 1) * -16px) calc((var(--py) - 0.5) * var(--depth, 1) * -16px);
  transition: translate 120ms var(--ease-out);
}
```

**Support:** Baseline widely available.
**Source:** [Context-aware card glow with pointermove](https://x.com/jh3yy/status/1992003440579662211)

## React to scroll snap changes

`scrollsnapchange` fires when the snapped child changes and `scrollsnapchanging` while a gesture is heading toward a new one, so carousel indicators update without measuring.

```javascript
carousel.addEventListener('scrollsnapchange', (e) => {
  const index = [...carousel.children].indexOf(e.snapTargetInline);
  dots.querySelector('[aria-current]')?.removeAttribute('aria-current');
  dots.children[index]?.setAttribute('aria-current', 'true');
});
```

**Support:** Chrome 129+ only; fall back to an IntersectionObserver elsewhere.
**Source:** [Chrome for Developers: scroll snap events](https://developer.chrome.com/blog/scroll-snap-events), [MDN: scrollsnapchange event](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollsnapchange_event)

## Actionable form errors and first-invalid scroll

Never rely solely on a generic top-of-form error alert banner. When form submission fails validation, identify the specific offending control, scroll it smoothly into view with clearance for sticky navigation, transfer keyboard focus, and attach clear remediation copy with `aria-describedby` and `aria-invalid="true"`.

```javascript
export function handleFormSubmitError(form) {
  const firstInvalid = form.querySelector(':invalid:not(fieldset), [aria-invalid="true"]:not(fieldset)');
  if (!firstInvalid) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  firstInvalid.scrollIntoView({
    behavior: prefersReducedMotion ? 'instant' : 'smooth',
    block: 'center',
  });
  firstInvalid.focus({ preventScroll: true });

  const describedBy = firstInvalid.getAttribute('aria-describedby');
  const errorId = describedBy?.split(/\s+/).find((id) => document.getElementById(id));
  const errorEl = errorId ? document.getElementById(errorId) : null;
  if (errorEl && !prefersReducedMotion) {
    errorEl.classList.add('is-shaking');
    errorEl.addEventListener('animationend', () => errorEl.classList.remove('is-shaking'), { once: true });
  }
}
```

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.is-shaking {
  animation: shake 240ms var(--ease-in-out);
}
```

**Support:** Baseline widely available.
**Source:** [Form submission error remediation patterns](https://x.com/gabriell_lab/status/2117241828378292550)
