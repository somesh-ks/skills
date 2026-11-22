# Component primitives

Load when: building a slot or `asChild` API, a component that must work controlled and uncontrolled, accessible tabs styled from data attributes, distance-based tab indicator motion, dropdown sizing and truncation, optical padding for icon buttons, buttons that must not change size when a spinner, icon, or label changes, or character-limited inputs.
Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
About 320 lines. React examples target React 18 and 19.

## The asChild slot

Merges the component's props, class names, handlers, and ref onto its child instead of wrapping it, so a Button can render as a link without an extra element breaking flex or grid layout.

```tsx
import { forwardRef, cloneElement, isValidElement } from 'react';

function composeRefs(...refs) {
  return (node) => refs.forEach((ref) => {
    if (!ref) return;
    typeof ref === 'function' ? ref(node) : (ref.current = node);
  });
}

export const Slot = forwardRef(({ children, ...slotProps }, forwardedRef) => {
  if (!isValidElement(children)) return children;
  const childRef = children.props.ref ?? children.ref; // React 19 exposes ref as a prop
  return cloneElement(children, {
    ...slotProps,
    ...children.props,
    className: [slotProps.className, children.props.className].filter(Boolean).join(' '),
    onClick: (...args) => {
      children.props.onClick?.(...args);
      slotProps.onClick?.(...args);
    },
    ref: composeRefs(forwardedRef, childRef),
  });
});
```

```tsx
<Button asChild>
  <a href="/login">Log in</a>
</Button>
```

**Support:** React 18+.
**Source:** [Radix Primitives: Slot](https://github.com/radix-ui/primitives/tree/main/packages/react/slot), [Radix docs: composition](https://www.radix-ui.com/primitives/docs/guides/composition)

## Controlled and uncontrolled in one hook

Lets a component accept `value` plus `onValueChange`, or `defaultValue`, with one code path. The change callback is read through a ref so a new function each render does not retrigger effects.

```javascript
import { useState, useCallback, useRef } from 'react';

export function useControllableState({ prop, defaultProp, onChange }) {
  const [uncontrolled, setUncontrolled] = useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolled;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(value) : next;
    if (!isControlled) setUncontrolled(resolved);
    onChangeRef.current?.(resolved);
  }, [isControlled, value]);

  return [value, setValue];
}
```

**Support:** React 18+.
**Source:** [Radix Primitives: use-controllable-state](https://github.com/radix-ui/primitives/tree/main/packages/react/use-controllable-state)

## Tabs styled from data attributes

State lives in `data-state`, so styling works in any CSS approach. The ARIA wiring is what makes it a tab widget: `aria-selected`, `aria-controls`, `aria-labelledby`, and one tab stop with arrow-key movement (see `dom.md`, roving tabindex).

```html
<div class="tabs">
  <div role="tablist" aria-label="Example">
    <button role="tab" id="tab-preview" aria-selected="true" aria-controls="panel-preview" tabindex="0" data-state="active">Preview</button>
    <button role="tab" id="tab-code" aria-selected="false" aria-controls="panel-code" tabindex="-1" data-state="inactive">Code</button>
  </div>
  <div role="tabpanel" id="panel-preview" aria-labelledby="tab-preview" data-state="active">Preview content</div>
  <div role="tabpanel" id="panel-code" aria-labelledby="tab-code" data-state="inactive" hidden>Code content</div>
</div>
```

```css
[role="tab"] {
  position: relative;
  padding: 8px 16px;
  color: var(--text-secondary);
  transition: color 150ms ease;
}

[role="tab"][data-state="active"] {
  color: var(--text-primary);
}

[role="tab"][data-state="active"]::after {
  content: '';
  position: absolute;
  inset: auto 0 -1px;
  height: 2px;
  background: var(--accent);
}
```

Toggle `aria-selected`, `tabindex`, `data-state`, and the panel's `hidden` attribute together when the active tab changes.

**Support:** Baseline widely available.
**Source:** [WAI-ARIA APG: Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [Base UI: styling with data attributes](https://base-ui.com/react/handbook/styling)

## Distance-aware tab indicator motion

When animating an active tab indicator (underline, capsule, or pill), choose the transition mechanic by the physical Euclidean distance between tabs rather than sliding blindly across arbitrary distances:
- **Adjacent or close tabs:** Slide the indicator across with a smooth spring or ease (`transform: translate3d()`).
- **Distant tabs (3+ positions away):** Crossfade instead of sweeping across intermediate tabs. A bar sweeping across six items creates visual noise and feels sluggish.
- **Wrapped tab rows:** When tabs wrap onto multiple lines, distant items in the array may land vertically adjacent. Measuring physical bounding box distance automatically resolves whether to slide or crossfade with no special-case layout code.

```javascript
/* Requires tablist: position: relative.
   Indicator: position: absolute; top: 0; left: 0; width: 100px; height: 100px; transform-origin: 0 0;
   The fixed base size is scaled to each tab, so only transform and opacity animate (the compositor-only performance budget). */
const BASE = 100; // px, matches the indicator's CSS width and height

function placeIndicator(indicator, x, y, rect) {
  indicator.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${rect.width / BASE}, ${rect.height / BASE})`;
}

export function updateTabIndicator(indicator, fromRect, toRect) {
  const container = indicator.offsetParent ?? indicator.parentElement;
  const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const targetX = toRect.left - containerRect.left;
  const targetY = toRect.top - containerRect.top;
  const distance = Math.hypot(toRect.left - fromRect.left, toRect.top - fromRect.top);
  const DISTANCE_THRESHOLD = 180; // px

  clearTimeout(indicator._timeoutId);

  if (distance < DISTANCE_THRESHOLD) {
    indicator.style.transition = 'transform 200ms var(--ease-in-out)';
    placeIndicator(indicator, targetX, targetY, toRect);
    indicator.style.opacity = '1';
  } else {
    indicator.style.transition = 'opacity 100ms var(--ease-out)';
    indicator.style.opacity = '0';
    indicator._timeoutId = setTimeout(() => {
      indicator.style.transition = 'opacity 100ms var(--ease-out)';
      placeIndicator(indicator, targetX, targetY, toRect);
      indicator.style.opacity = '1';
    }, 100);
  }
}
```

Scaling stretches a rounded pill's `border-radius` and any border. Keep the indicator a flat bar or a radius small enough that the stretch is invisible over 200ms; for a large pill, crossfade at every distance instead.

**Support:** Baseline widely available.
**Source:** [Tab motion by distance](https://x.com/salleedesign/status/2118085564151021998)

## Character limits that do not block typing

Freezing keystrokes at the limit interrupts a thought mid-word. Let the text run over, show a negative counter, and disable submit until it fits.

```jsx
export function LimitedTextarea({ max = 280 }) {
  const [text, setText] = useState('');
  const remaining = max - text.length;
  const over = remaining < 0;

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} aria-describedby="count" />
      <span id="count" data-over={over || undefined} aria-live="polite">{remaining}</span>
      <button type="submit" disabled={over}>Post</button>
    </div>
  );
}
```

```css
[data-over] {
  color: var(--danger);
  font-variant-numeric: tabular-nums;
}
```

**Support:** Baseline widely available.
**Source:** [Block the submit, not the typing](https://x.com/detaildotdesign/status/2072311761273794686)

## Dropdown sizing and label truncation

Let the widest item set the dropdown menu's width rather than hardcoding a fixed size. Hug the longest label, add 16px padding to the edge, set a `min-width` so short lists do not shrink into cramped tap targets, and enforce a `max-width` with truncation for edge cases.

```css
.dropdown-menu {
  width: max-content;
  min-width: 140px;
  max-width: 320px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.dropdown-item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- **Tighter than 16px** feels cramped against borders.
- **Fixed width** leaves dead negative space on short items and clips unexpectedly.
- **Min/max bounds** protect both ends: quick selections stay clickable, and long titles never push the menu off-screen.

**Support:** Baseline widely available.
**Source:** [Let the widest item set dropdown width](https://x.com/keviduk/status/2117975138541146303)

## Asymmetric optical padding for icon buttons

Align buttons optically rather than geometrically. When a button contains both an icon and text, symmetrical horizontal padding makes the button look off-center because the icon's square bounding box already includes internal whitespace and visual density.

Reduce padding on the icon's side by 20% to 25%:

```css
/* Symmetrical padding: looks off-center */
.button-bad {
  padding-inline: 16px;
  gap: 8px;
}

/* Asymmetric optical padding: balanced center of mass */
.button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-block: 8px;
  padding-inline: 16px;
}

.button[data-icon-start] {
  padding-inline-start: 12px;
  padding-inline-end: 16px;
}

.button[data-icon-end] {
  padding-inline-start: 16px;
  padding-inline-end: 12px;
}
```

The tighter inset on the icon side compensates for the icon's negative margins, centering the combined label and icon mass optically inside the button container.

**Support:** Baseline widely available.
**Source:** [Details that make interfaces feel better](https://interfaces.dev/magazine/issues/details-that-make-interfaces-feel-better)

## Buttons that keep their size

A button's box is set by its largest state, never by its current one. When a spinner replaces the label, a check icon appears after saving, or "Save" becomes "Saving...", a box sized by its content jumps, and so does everything beside it. Every state lives in the DOM from the start; state changes visibility, not layout. `visibility: hidden` keeps an element's size and removes it from the accessibility tree, so hidden labels are not read twice.

| Jerk | Cause | Fix |
| :--- | :--- | :--- |
| Width jumps when loading starts | `{loading ? <Spinner /> : label}` unmounts the label | Keep the label in flow with `visibility: hidden`; overlay the spinner in the same grid cell |
| Width jumps as the label changes | Each label has its own width | Stack every label in one grid cell; the widest sets the width |
| Width jumps when an icon appears or disappears | `{done && <Check />}` adds a child and a gap | Keep a fixed icon slot in every state; swap what is inside it |
| Width jumps when one icon replaces another | Icons with different intrinsic sizes or `viewBox` | Size the slot in CSS (`1em` square, `flex: none`); the SVG fills the slot |
| Button grows or pops when the icon loads | Sprite, icon font, or lazy component has no size until it arrives | The slot's CSS size holds the space; give inline SVGs `width` and `height` attributes |
| Height grows by a few pixels with an icon | Icon taller than the text line | Fix `min-block-size`; keep the icon at or under the line height |
| Digits jitter in a counter label | Proportional figures | `tabular-nums` and a `ch` min width (`typography.md`) |

```html
<button class="btn" data-state="idle" aria-busy="false">
  <span class="btn-face">
    <span class="btn-icon" aria-hidden="true">
      <svg data-for="idle" width="16" height="16"><!-- save --></svg>
      <svg data-for="saved" width="16" height="16"><!-- check --></svg>
    </span>
    <span class="btn-labels">
      <span data-for="idle">Save changes</span>
      <span data-for="saving">Saving...</span>
      <span data-for="saved">Saved</span>
    </span>
  </span>
  <span class="btn-spinner" aria-hidden="true"></span>
</button>
```

```css
.btn {
  display: inline-grid;          /* face and spinner share one cell */
  place-items: center;
  min-block-size: 36px;
  padding-inline: 16px;
}
.btn > * { grid-area: 1 / 1; }

.btn-face { display: inline-flex; align-items: center; gap: 8px; }

.btn-icon,
.btn-labels { display: grid; }
.btn-icon { inline-size: 1em; block-size: 1em; flex: none; }
.btn-icon > *,
.btn-labels > * { grid-area: 1 / 1; visibility: hidden; }
.btn-icon svg { inline-size: 100%; block-size: 100%; }

/* Show only the current state; the hidden ones still hold the size. */
.btn[data-state="idle"]   [data-for="idle"],
.btn[data-state="saving"] .btn-labels [data-for="saving"],
.btn[data-state="saved"]  [data-for="saved"] { visibility: visible; }

/* Spinner pattern (opt in with data-spinner): the face keeps its width while the
   spinner covers it. Hide descendants too: a visible child shows through a hidden parent. */
.btn-spinner { visibility: hidden; inline-size: 1em; block-size: 1em; }
.btn[data-spinner][data-state="saving"] .btn-face,
.btn[data-spinner][data-state="saving"] .btn-face * { visibility: hidden; }
.btn[data-spinner][data-state="saving"] .btn-spinner { visibility: visible; }
```

Without `data-spinner`, saving shows the "Saving..." label; with it, a spinner covers the face and the label width holds. Drop the markup the button does not use. Set `aria-busy="true"` while loading and announce the outcome through a live region; the accessible name stays the visible label. For a cross-fade between the stacked icons instead of an instant swap, use the icon swap in `motion.md`.

When the size should change by design, such as an icon-only button expanding to show its label, animate it with `grid-template-columns: 0fr` to `1fr` or `interpolate-size: allow-keywords`; never let it snap.

**Support:** Baseline widely available (`interpolate-size` is Chromium only; without it the width snaps, which is acceptable).
