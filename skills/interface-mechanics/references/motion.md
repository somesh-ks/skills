# Motion techniques

Load when: an animation must be interruptible or retargetable mid-flight, progress should follow scroll, icons morph between shapes or swap on a state change, layers need promoting for the duration of an interaction, items enter with a stagger, or numbers roll like an odometer.
Whether and how much to animate is a design decision; this file holds mechanisms only. Motion samples use the `--ease-out` and `--ease-in-out` tokens and durations from the Default tokens section of `SKILL.md`; a project's own tokens win over both.
Support lines verified against MDN on 2026-09-10; the icon swap entry on 2026-10-10.

Contents:
- Velocity-preserving spring for interruptible motion
- Progress that follows scroll
- Icon morph with d: path()
- Icon swap cross-fade
- Promote a layer only while it can move
- Staggered entrance with a custom property
- Rolling number ticker
- Spring curves in pure CSS with linear()
- Choreography when layers overlap

## Velocity-preserving spring for interruptible motion

CSS keyframes restart from 0% when retriggered, so a drawer tapped mid-animation snaps. An integrating spring keeps position and velocity as state, so a new target blends from wherever the element is and however fast it is moving.

```javascript
export class VelocitySpring {
  constructor(element, { stiffness = 220, damping = 24 } = {}) {
    this.element = element;
    this.stiffness = stiffness;
    this.damping = damping;
    this.value = 0;
    this.target = 0;
    this.velocity = 0;
    this.raf = 0;
  }

  to(target) {
    this.target = target;
    if (this.raf) return;               // already running: it will follow the new target
    let last = performance.now();

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.032); // clamp after a background tab
      last = now;

      const displacement = this.value - this.target;
      const acceleration = -this.stiffness * displacement - this.damping * this.velocity;
      this.velocity += acceleration * dt;
      this.value += this.velocity * dt;

      if (Math.abs(displacement) < 0.1 && Math.abs(this.velocity) < 0.1) {
        this.value = this.target;
        this.velocity = 0;
        this.raf = 0;
      } else {
        this.raf = requestAnimationFrame(step);
      }
      this.element.style.transform = `translate3d(0, ${this.value}px, 0)`;
    };

    this.raf = requestAnimationFrame(step);
  }
}
```

**Support:** Baseline widely available.
**Source:** [Apple WWDC: Animate with springs](https://developer.apple.com/videos/play/wwdc2023/10158/)

## Progress that follows scroll

A named scroll timeline drives an animation from the scroller's position, so a carousel indicator or reading-progress bar needs no scroll listener.

```css
.carousel-viewport {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-timeline: --carousel inline;
}

.carousel-progress {
  height: 4px;
  background: var(--accent);
  transform-origin: left center;
  animation: grow linear;
  animation-timeline: --carousel;
}

@keyframes grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

The timeline must be findable from the animated element: it is a preceding sibling or ancestor, or the two are connected with `timeline-scope`.

**Support:** Chrome 115+, Edge 115+, Safari 26+. Firefox in development.
**Source:** [Chrome for Developers: scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [MDN: animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)

## Icon morph with d: path()

The `d` property is transitionable, so a hamburger can become a close icon in CSS alone. Both paths must have the same number and types of commands; here each is three `M` `L` pairs, with the middle line collapsing to a point.

```css
.icon-path {
  d: path("M4 6 L20 6 M4 12 L20 12 M4 18 L20 18");
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  transition: d 250ms var(--ease-in-out);
}

.button[aria-expanded="true"] .icon-path {
  d: path("M5 5 L19 19 M12 12 L12 12 M5 19 L19 5");
}
```

**Support:** Chrome 52+, Firefox 97+. Safari parses `d` without effect, so keep the SVG `d` attribute as the fallback.
**Source:** [MDN: d](https://developer.mozilla.org/en-US/docs/Web/CSS/d)

## Icon swap cross-fade

For an infrequent state swap such as copy to copied or play to pause, keep both icons mounted in one grid cell, so enter and exit both animate and nothing shifts. Tab icons and row actions revealed on hover swap instantly.

```css
.swap {
  display: grid;
  place-items: center;
}

.swap > * {
  grid-area: 1 / 1;
  opacity: 0;
  scale: 0.25;
  filter: blur(4px);
  transition: opacity 200ms, scale 200ms, filter 200ms;
  transition-timing-function: var(--ease-out);
}

.swap > [data-active] {
  opacity: 1;
  scale: 1;
  filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {
  .swap > * { scale: 1; filter: none; }
}
```

With Motion, key a `motion.span` inside `<AnimatePresence initial={false} mode="popLayout">` and use the same values on a spring with `bounce: 0`. `initial={false}` stops the default icon animating in on mount; never set it around an intentional entrance, which it would skip.

**Support:** The individual `scale` property is Baseline widely available (across browsers since August 2022). Tailwind 4 `scale-*` utilities write `scale`; Tailwind 3 writes `transform`, so name that in the transition.
**Source:** [MDN: scale](https://developer.mozilla.org/en-US/docs/Web/CSS/scale)

## Promote a layer only while it can move

`will-change` reserves compositor memory, so set it when motion becomes likely and clear it when the transition ends. Never leave it on large or text-heavy elements. A promoted element also becomes the containing block for its `position: fixed` descendants and a new stacking context, so a fixed tooltip inside it stops tracking the viewport.

```javascript
export function promoteWhileInteractive(element) {
  const promote = () => { element.style.willChange = 'transform, opacity'; };
  const release = () => {
    if (!element.matches(':hover, :focus-visible, [data-animating]')) element.style.willChange = 'auto';
  };

  element.addEventListener('pointerenter', promote, { passive: true });
  element.addEventListener('focusin', promote);
  element.addEventListener('pointerleave', release, { passive: true });
  element.addEventListener('focusout', release);
  element.addEventListener('transitionend', (e) => { if (e.target === element) release(); });
}
```

**Support:** Baseline widely available.
**Source:** [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change), [web.dev: compositor-only properties and layer count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)

## Staggered entrance with a custom property

An index on each item drives its delay, so a list, a menu, or nested cards cascade in without per-item delay classes. Animate the hierarchy: container first, then children.

```html
<ul class="stagger">
  <li style="--i: 0">Item 1</li>
  <li style="--i: 1">Item 2</li>
  <li style="--i: 2">Item 3</li>
</ul>
```

```css
.stagger > * {
  animation: enter 250ms var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * 45ms + 50ms);
}

@keyframes enter {
  from { opacity: 0; transform: translateY(12px); }
}
```

The hidden state lives in the `from` keyframe and `both` holds it through the delay, so an item whose animation never runs stays visible. `opacity: 0` in the base rule would leave it hidden.

**Support:** Baseline widely available.
**Source:** [Apple HIG: Motion design principles](https://developer.apple.com/design/human-interface-guidelines/motion)

## Rolling number ticker

Each digit is a column of 0 to 9 translated by the current digit, masked at the top and bottom. Tabular numerals keep columns aligned. For production use with sign changes and locale formatting, NumberFlow implements the same idea.

```html
<div class="ticker" aria-label="148">
  <span class="ticker-col" style="--digit: 1"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></span>
  <span class="ticker-col" style="--digit: 4"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></span>
  <span class="ticker-col" style="--digit: 8"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></span>
</div>
```

```css
.ticker {
  display: inline-flex;
  height: 1em;
  line-height: 1;
  overflow: hidden;
  font-variant-numeric: tabular-nums;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
}

.ticker-col {
  display: flex;
  flex-direction: column;
  width: 1ch;
  transform: translateY(calc(var(--digit, 0) * -1em));
  transition: transform 300ms var(--ease-in-out);
}

.ticker-col > span {
  height: 1em;
  display: grid;
  place-items: center;
  user-select: none;
}
```

**Support:** Baseline widely available (`mask-image` unprefixed: Chrome 120+, Safari 15.4+, Firefox 53+).
**Source:** [MDN: mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image), [NumberFlow](https://number-flow.barvian.me/)

## Spring curves in pure CSS with linear()

`linear()` takes sampled points, so a spring or bounce runs as a CSS transition on the compositor with no JavaScript per frame. Generate the points from stiffness and damping; the curve below is a light overshoot. The duration stays inside the Duration table in `SKILL.md`; only a settle tail that leaves the element interactive may run past it.

```css
:root {
  --ease-spring: linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%,
    0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50.1%, 1.015 55%, 1.017 63.9%, 1.001
  );
}

.sheet {
  transition: transform 300ms var(--ease-spring);
}
```

**Support:** Baseline widely available (Chrome 113+, Safari 17.2+, Firefox 112+).
**Source:** [MDN: linear()](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear), [linear() easing generator](https://linear-easing-generator.netlify.app/)

## Choreography when layers overlap

Two layers animating in the same space read as confusion. In ascending order of craft: delay the incoming layer until the outgoing one finishes, blur the outgoing layer so the overlap reads as depth, or stagger a blur fade so each layer resolves in turn.

```css
.layer-out { animation: out 150ms var(--ease-out) forwards; }
.layer-in  { animation: in 200ms 80ms var(--ease-out) both; }

@keyframes out { to   { opacity: 0; filter: blur(6px); } }
@keyframes in  { from { opacity: 0; filter: blur(6px); } }
```

**Support:** Baseline widely available.
**Source:** [Apple HIG: Designing fluid interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)
