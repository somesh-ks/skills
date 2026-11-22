# Modernize

Load when: the user asks to modernize, simplify, or drop dependencies, or runs the audit with the `modernize` lens. The broken-mechanics audit asks what is wrong; this lens asks what the platform now does for you. Each finding replaces script or a dependency with a feature from `interface-mechanics`, and carries that feature's Support line, so the user can see what it costs to adopt.

## Readiness

Grade each finding by its Support line, never from memory. If the reference's verified date is more than six months old, re-check the feature on MDN first.

| Readiness | Rule | Do |
| --- | --- | --- |
| Now | Baseline widely available, or newly available and the project's browser targets include it | Replace the code |
| Enhance | Missing in one engine, with a fallback that still looks intentional | Add the feature, keep or write the fallback, delete the script once the fallback is plain CSS |
| Wait | Missing in an engine the project targets, with no acceptable fallback | Report it, change nothing |

Read the project's targets from `browserslist` in `package.json` or `.browserslistrc`. With none, treat "newly available" as Enhance.

## Finding format

```
path:line · Now | Enhance | Wait · today: <what the code does> → <platform feature> · removes: <dependency or about N lines> · fix: <file>.md › <section>
```

List each feature once under the findings with its Support and Source lines, and the fallback for Enhance rows. Order: Now first, then by what it removes, largest first.

## Signals

| Signal | Look for | Platform feature | Fix |
| --- | --- | --- | --- |
| js-anchor | `@floating-ui`, `popper`, `getBoundingClientRect` feeding `style.top` or `left` of a tooltip, popover, or menu | Anchor positioning with collision fallbacks | `css-animation.md` › Anchor a popover with position-area; `css-animation.md` › Collision fallbacks with position-try-fallbacks |
| js-exit | `AnimatePresence`, `motion.div` with `exit=` that only fades or scales a dialog, popover, or toast | Entry and exit through `display: none` and the top layer | `css-animation.md` › Enter and exit through display: none and the top layer |
| js-height | `scrollHeight` or a measured height animated in JS, `react-collapse`, `animate={{ height: 'auto'` | `interpolate-size`, with the grid-rows fallback | `css-animation.md` › Animate to height: auto with interpolate-size; `css-animation.md` › Animate height everywhere with grid rows |
| js-accordion | Accordion state in JS with `aria-expanded` toggles on plain divs | `<details>` and `::details-content` | `css-animation.md` › Accordion with details and ::details-content |
| js-autosize | `react-textarea-autosize`, `autosize`, `scrollHeight` on `input` events | `field-sizing: content` | `css-visual.md` › Auto-growing inputs with field-sizing |
| js-scroll-progress | `scroll` listeners that write a progress width or a "scrolled" class | Scroll-driven animation, `scroll-state()` | `motion.md` › Progress that follows scroll; `css-animation.md` › Sticky header state with scroll-state() |
| js-parent-state | JS that adds a class to a parent when a child is checked, focused, or invalid | `:has()` | `css-visual.md` › Parent state with :has() |
| js-focus-trap | `focus-trap`, `focus-trap-react`, hand-rolled Tab loops in a modal | `inert` on the background with focus restore, or `<dialog>` | `accessibility.md` › Lock the background with inert and restore focus |
| js-balance | `react-wrap-balancer`, `balance-text` | `text-wrap: balance` and `pretty` | `css-visual.md` › Balanced headings, pretty paragraphs |
| js-select | A custom select built only to style the native one | Customizable select | `css-visual.md` › Customizable select |
| js-container | `ResizeObserver` that sets classes or font sizes from a component's width | Container units and queries | `typography.md` › Type that scales with its container |
| dark-twins | Most colors paired with a `dark:` or `.dark` twin | `light-dark()` | `color.md` › Dark mode in one declaration with light-dark() |
| shade-math | Sass `darken()` or `lighten()`, `polished`, `chroma-js`, or hand-picked hover shades | Relative color, `color-mix()` | `color.md` › Derive states from one token with relative color; `color.md` › Overlays with color-mix() |
| js-flip | A FLIP library or manual measure-and-invert for route or list changes | View transitions | `dom-transitions.md` › Circular reveal with the View Transition API; `dom-transitions.md` › Layout changes with FLIP and the Web Animations API |
| svg-corners | SVG masks or `clip-path` paths drawn only for squircle corners | `corner-shape` | `css-visual.md` › Squircle corners with corner-shape |
