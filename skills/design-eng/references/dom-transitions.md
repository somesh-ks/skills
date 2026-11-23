# DOM transitions and physics

Load when: theme toggles or page changes with the View Transition API, shared layout animations with `layoutId`, layout and reorder animations (FLIP), or spring physics without a library.
Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
Support lines verified against MDN on 2026-09-10.

Contents:
- Circular reveal with the View Transition API
- Directional transitions with view transition types
- Layout changes with FLIP and the Web Animations API
- Analytical damped spring
- Shared layout transitions with layoutId

## Circular reveal with the View Transition API

Expands the new state from the click point instead of crossfading, which is what makes a theme toggle feel physical. Skip it when the user prefers reduced motion. The Web Animations API `easing` option does not resolve `var()`, so the sample reads the easing token from the root.

```javascript
const token = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

export function toggleThemeWithTransition(event) {
  const toggle = () => document.documentElement.classList.toggle('dark');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) return toggle();

  const x = event?.clientX ?? innerWidth / 2;
  const y = event?.clientY ?? innerHeight / 2;
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(toggle);
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 300, easing: token('--ease-out', 'ease-out'), pseudoElement: '::view-transition-new(root)' }
    );
  });
}
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
```

**Support:** Chrome 111+, Edge 111+, Safari 18+, Firefox 144+.
**Source:** [Chrome for Developers: same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document), [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)

## Directional transitions with view transition types

Slides forward and backward navigations in opposite directions by tagging the transition with a type and targeting it in CSS.

```javascript
export function navigateWithDirection(updateDom, direction = 'forward') {
  if (!document.startViewTransition) return updateDom();
  document.startViewTransition({ update: updateDom, types: ['slide', direction] });
}
```

```css
html:active-view-transition-type(forward) {
  &::view-transition-old(content) { animation: slide-out-to-left 300ms var(--ease-out); }
  &::view-transition-new(content) { animation: slide-in-from-right 300ms var(--ease-out); }
}

html:active-view-transition-type(backward) {
  &::view-transition-old(content) { animation: slide-out-to-right 300ms var(--ease-out); }
  &::view-transition-new(content) { animation: slide-in-from-left 300ms var(--ease-out); }
}
```

**Support:** Baseline newly available January 2026 (Chrome 125+, Safari 18.2+, Firefox 147+).
**Source:** [Chrome for Developers: view transition types](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#handle_multiple_view_transition_styles_with_view_transition_types), [MDN: ViewTransition.types](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/types)

## Layout changes with FLIP and the Web Animations API

Measures before and after a DOM change, then plays the inverse transform back to zero on the compositor. Reordered cards keep their identity instead of popping into new slots.

```javascript
const token = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

export function animateFlip(element, mutateDom, { duration = 300, easing = token('--ease-in-out', 'ease-in-out') } = {}) {
  const first = element.getBoundingClientRect();
  mutateDom();
  const last = element.getBoundingClientRect();

  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / Math.max(last.width, 1);
  const sy = first.height / Math.max(last.height, 1);
  if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return null;

  return element.animate(
    [
      { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transformOrigin: 'top left', transform: 'none' },
    ],
    { duration, easing, fill: 'both' }
  );
}
```

**Support:** Baseline widely available.
**Source:** [FLIP animation technique](https://aerotwist.com/blog/flip-your-animations/), [MDN: Element.animate()](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

## Analytical damped spring

Solves the damped harmonic oscillator in closed form, so a spring costs one function call per frame and needs no library. The three damping regimes have different solutions; a solver that ignores the overdamped case decays wrongly for `zeta > 1`.

```javascript
/**
 * @param {number} zeta  damping ratio: <1 bouncy, 1 critically damped, >1 overdamped
 * @param {number} omega natural frequency in rad/s (roughly 10 to 40 for UI)
 * @returns {(t: number) => number} progress from 0 to 1 at time t in seconds
 */
export function createSpringSolver(zeta = 0.85, omega = 20) {
  if (zeta < 1) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    const k = zeta / Math.sqrt(1 - zeta * zeta);
    return (t) => 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + k * Math.sin(wd * t));
  }
  if (zeta === 1) {
    return (t) => 1 - Math.exp(-omega * t) * (1 + omega * t);
  }
  const we = omega * Math.sqrt(zeta * zeta - 1);
  const k = zeta / Math.sqrt(zeta * zeta - 1);
  return (t) => 1 - Math.exp(-zeta * omega * t) * (Math.cosh(we * t) + k * Math.sinh(we * t));
}

export function animateSpring(from, to, onUpdate, { zeta = 0.82, omega = 22, maxMs = 1500 } = {}) {
  const solve = createSpringSolver(zeta, omega);
  const start = performance.now();
  let raf = 0;

  const frame = (now) => {
    const t = (now - start) / 1000;
    const value = from + (to - from) * solve(t);
    onUpdate(value);
    if ((Math.abs(value - to) < 0.001 && t > 0.3) || now - start > maxMs) return onUpdate(to);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
```

For interruptible motion that inherits velocity from the current animation, use the integrating spring in `motion.md` instead.

**Support:** Baseline widely available.
**Source:** [Damped spring physics](https://www.ryanjuckett.com/damped-springs/), [Apple WWDC 2018: Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)

## Shared layout transitions with layoutId

When using Framer Motion or Motion for React, `layoutId` enables smooth morphing between elements across separate DOM trees or component states (e.g. expanding a card into a modal or sliding an active pill indicator).

Two critical invariants prevent layout distortion and transform conflicts:

### 1. Wrap conditional expanded views in AnimatePresence without conflicting exit transforms

To animate an expanded view smoothly back to its source element when dismissed, wrap the conditional surface in `AnimatePresence`. This ensures Motion retains the unmounting component until the reverse shared layout interpolation finishes.

Do not assign explicit conflicting exit properties (such as `exit={{ opacity: 0, scale: 0.8 }}`) to the shared `layoutId` element itself. Additional exit transforms fight the FLIP interpolation, causing position jumps and opacity flashes. Let `layoutId` drive the shared layout geometry, while fading only the surrounding non-shared backdrop.

Use native button triggers for keyboard accessibility, manage dialog labeling and focus, and ensure backdrop dismissals ignore bubbled clicks:

```tsx
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

interface GalleryItem {
  id: string;
  title: string;
}

interface CardGalleryProps {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  items: GalleryItem[];
}

function CardGallery({ activeId, setActiveId, items }: CardGalleryProps) {
  const activeItem = items.find((item) => item.id === activeId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!activeItem) {
      triggerRef.current?.focus();
      return;
    }
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, setActiveId]);

  return (
    <>
      <div className="grid" aria-hidden={Boolean(activeItem)}>
        {items.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            layoutId={`card-${item.id}`}
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setActiveId(item.id);
            }}
            className="card"
          >
            <motion.h3 layoutId={`title-${item.id}`}>{item.title}</motion.h3>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveId(null);
            }}
          >
            <motion.div
              layoutId={`card-${activeItem.id}`}
              className="modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
            >
              <motion.h3 id="dialog-title" layoutId={`title-${activeItem.id}`}>
                {activeItem.title}
              </motion.h3>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setActiveId(null)}
                aria-label="Close dialog"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 2. Pass borderRadius explicitly to preserve corner curvature

Framer Motion calculates layout transitions via CSS `transform: matrix3d()`. Scaling an element with CSS border-radius distorts the corners: a 16px corner stretches into an oval when width and height scale at different rates.

Pass `borderRadius` directly to the `animate` or `style` prop of the `motion` component so Framer Motion animates border curvature independently from scale:

```tsx
<motion.div
  layoutId={`card-${item.id}`}
  style={{ borderRadius: isExpanded ? 24 : 12 }}
  transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
/>
```

**Support:** Framer Motion 6+, Motion for React 11+.
**Source:** [Motion Documentation: Shared layout animations](https://motion.dev/docs/react-layout-animations#shared-layout-animations)

