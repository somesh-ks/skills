# Audit

Load when: the user asks to audit, review, or find problems in UI code, a component, a diff, or a whole project. The audit reports what is broken or missing in the mechanics this skill covers. It never edits code unless the user asks for the fixes.

Contents:
- Procedure
- Severity
- Finding format
- Signals
- Report

## Procedure

1. **Scope.** Audit what the user named: a file, a diff, a folder, or the project. With no scope, take the UI source under the current directory. Skip `node_modules`, build output (`dist`, `build`, `.next`, `out`), coverage, vendored code, and minified files. No UI source: say so and stop.
2. **Profile.** Read `package.json` and the CSS entry. Note the framework, the styling (Tailwind v4 imports `tailwindcss` in CSS), the motion library, and the primitives (Radix, Base UI, React Aria, native `<dialog>`). Primitives already solve some signals: a Radix dialog manages focus, Tailwind v4 `hover:` is already gated behind `(hover: hover)`.
3. **Scan.** Run the Look for column of each signal below with `rg -n` (or `grep -rnE`). A hit is a lead, not a finding.
4. **Confirm.** Read about ten lines around each lead. Drop it when the code already handles the case, for example `outline-none` next to a `focus-visible:` ring. Signals marked *read* have no reliable pattern: open the components of that kind and check them by hand.
5. **Grade** each confirmed finding with the severity table.
6. **Report** in the format below. Report only what is wrong or missing; say nothing about what is fine. Zero findings is a valid result: say "No findings" and list what was checked.

## Severity

| Severity | Rule | Examples |
| --- | --- | --- |
| High | Someone is blocked or loses their place | Focus escapes a modal or vanishes on close, no visible focus, content clipped or unreachable on a phone, a drag that drops when the pointer leaves, a large motion effect with no reduced-motion path |
| Medium | A visible glitch on a path people use | Hover flicker, a button that changes size, a theme smear, a pop-out with no exit, layout shift, jank while scrolling, iOS zoom on focus |
| Low | Cost or polish most people will not notice | A permanent `will-change`, duplicated dark colors, jittering digits on a secondary screen, a tap flash |

Raise a finding one level when it sits on the main path of the product (sign-up, checkout, the primary nav). Never raise above High.

## Finding format

One line per finding, grouped by severity, High first:

```
path:line · Severity · signal · what breaks, for whom · fix: references/<file>.md › <section>
```

- `path:line` is the first line of the problem. Several lines in one file for the same signal stay one finding: `src/nav.tsx:12,18,31`.
- "What breaks" names the effect a person sees, not the rule: "hover drops between tabs", not "uses gap".
- The fix names the section that holds the technique. Under the findings, list each technique used once, with its Support and Source lines.

## Signals

Area codes: MOT motion, INT input, PRF performance, A11 accessibility, TYP typography, COL color, LAY layout, MOB mobile, CMP components.

| Area | Signal | Look for | Breaks | Fix |
| --- | --- | --- | --- | --- |
| MOT | transition-all | `transition-all`, `transition:\s*all`, `transition-property:\s*all` | Animates properties nobody chose, layout ones included, and every color on a theme switch | Name the properties; `color.md` › Theme switch without a transition smear |
| MOT | layout-props | `transition` or `@keyframes` on `width`, `height`, `top`, `left`, `margin`, `padding`; `animate=\{\{\s*height` | Layout runs every frame | `css-animation.md` › Animate to height: auto; `dom-transitions.md` › Layout changes with FLIP |
| MOT | no-exit | `\{\w+ && <(Dialog\|Modal\|Popover\|Menu\|Drawer\|Tooltip\|Toast)` next to an enter animation | Slides in, pops out | `css-animation.md` › Enter and exit through display: none and the top layer |
| MOT | no-reduced-motion | Animations present and no `prefers-reduced-motion`, `motion-reduce:`, or `useReducedMotion` anywhere | Vestibular users get every movement | `accessibility.md` › Reduced motion |
| MOT | will-change-static | `will-change` in a static rule or on many elements | Permanent layers cost memory and blur text | `motion.md` › Promote a layer only while it can move |
| MOT | theme-smear | A theme toggle (`setTheme`, `data-theme`, `classList.toggle\(.dark`) with color transitions and no `disableTransitionOnChange` or transition override | Every color animates at once | `color.md` › Theme switch without a transition smear |
| MOT | hover-moves | `:hover` or `hover:` that applies `scale`, `translate`, or a size change to the hovered element itself | The element moves away from the pointer and flickers | `css-animation.md` › Hover states that flicker |
| INT | dead-zones | `gap-`, `gap:`, `space-x-` between siblings that carry `hover:` or `onClick` (nav, tabs, rows, chips) | Hover flickers across the gap and clicks land on nothing | `dom-input.md` › Hit areas with no dead zones |
| INT | mouse-drag | `onMouseMove`, `mousemove`, `touchmove` drag code with no `setPointerCapture` | Drag drops when the pointer leaves; no pen or touch parity | `dom-input.md` › Drag that survives leaving the window |
| INT | list-keyboard | *read*: menus, listboxes, toolbars where every item is a tab stop and arrows do nothing | Keyboard users tab through every item | `dom-input.md` › Roving tabindex |
| PRF | blur-layers | `backdrop-filter`, `backdrop-blur` on fixed, sticky, or animating layers | Repaints on every scroll or animation frame | `performance.md` › Keep backdrop blur off the animating surface |
| PRF | nonpassive | `addEventListener\(['"](scroll\|touchmove\|wheel)` with no `passive` and no `preventDefault` | Scrolling waits on the main thread | `performance.md` › Keep input responsive |
| PRF | offscreen-loops | `requestAnimationFrame` loops, canvas, video, or infinite animations with no visibility check | Burns CPU and battery offscreen | `performance.md` › Pause looping animations offscreen |
| PRF | long-lists | *read*: lists that can pass about 100 items with no virtualization or `content-visibility` | Cost grows with the list | `performance.md` › Skip offscreen rendering |
| A11 | outline-none | `outline-none`, `outline:\s*(none\|0)` with no `focus-visible` replacement | Keyboard users lose their place | `accessibility.md` › Focus ring that reads on any background |
| A11 | modal-focus | *read*: a custom modal or drawer (not `<dialog>` or a primitive) with no `inert` on the background or no focus restore | Focus escapes behind the overlay and is lost on close | `accessibility.md` › Lock the background with inert |
| A11 | silent-status | Toasts, async results, form outcomes with no `aria-live` or `role="status"` | Screen readers never hear it | `accessibility.md` › Screen reader announcements |
| A11 | forced-colors | Focus or selection shown only by `box-shadow` or background, no `forced-colors` query | Invisible in Windows contrast themes | `accessibility.md` › Forced-colors mode |
| TYP | button-reflow | `\? <(Spinner\|Loader)`, `&& <(Spinner\|Loader\|Check)` inside a button; a label string that changes with state | The button changes size and shoves its neighbors | `components.md` › Buttons that keep their size |
| TYP | bold-hover | `hover:font-`, `font-weight` inside `:hover` or `:active` | Text shoves its neighbors | `css-visual.md` › Bold on hover without layout shift |
| TYP | tabular | Changing numbers (prices, counters, timers, table columns) without `tabular-nums` | Digits jitter as they change | `typography.md` › Numbers that do not jitter |
| TYP | font-swap | `@font-face` with no `size-adjust` or metric overrides (`next/font` already adds them) | Text reflows when the web font arrives | `typography.md` › Zero-shift font fallback |
| COL | dark-duplication | Most colors paired with a `dark:` or `.dark` twin across components | Twice the color code to keep in sync | `color.md` › Dark mode in one declaration with light-dark() |
| COL | opacity-hover | `hover:opacity-`, or a second hard-coded shade for hover and active | States drift from the base token | `color.md` › Derive states from one token |
| COL | native-controls | A dark theme with no `color-scheme` | Light scrollbars, checkboxes, and date pickers inside a dark UI | `css-visual.md` › Native control colors |
| LAY | tooltip-clip | Tooltips or popovers with `position: absolute` and static offsets (`left: 100%`, `top: -8px`) or hand-rolled JS positioning | Clips at the viewport edge | `css-animation.md` › Tooltips that flip on clipping |
| LAY | radius-nesting | *read*: nested rounded elements sharing one radius | The inner corner looks pinched | `css-visual.md` › Concentric radius as tokens |
| LAY | scroll-edges | Overflow containers with no `overscroll-behavior` inside drawers and sheets | Scroll chains to the page behind | `mobile.md` › Keep a drawer's scroll inside the drawer |
| LAY | icon-px-size | Inline SVG with fixed pixel `width` and `height` beside text that scales | Icons stop matching the text size | `css-visual.md` › Icon sizing relative to text with 1cap |
| MOB | vh-mobile | `100vh`, `h-screen` on full-height layouts | Cut off behind the mobile browser toolbars | `mobile.md` › Native feel in a browser tab |
| MOB | input-zoom | Inputs, selects, textareas under 16px (`text-xs`, `text-sm`, `font-size:\s*1[0-5]px`) | iOS Safari zooms the page on focus | `mobile.md` › Stop iOS zooming into inputs |
| MOB | safe-area | Fixed top or bottom bars with no `env(safe-area-inset-*)` | Controls under the notch or home indicator | `mobile.md` › Native feel in a browser tab |
| MOB | touch-action | Draggable or zoomable surfaces with no `touch-action` | The page scrolls while dragging | `mobile.md` › Native feel in a browser tab |
| CMP | tabs-aria | *read*: tabs without `role="tablist"`, `role="tab"`, `aria-selected`, and arrow keys | Not operable as tabs | `components.md` › Tabs styled from data attributes |
| CMP | controlled-only | Components that take `value` and not `defaultValue` | Every consumer must wire state | `components.md` › Controlled and uncontrolled in one hook |
| CMP | char-limit | `maxLength` with no visible count | Typing stops with no reason given | `components.md` › Character limits that do not block typing |

Skip MOB when the project is desktop only and say so in the report.

## Report

```markdown
# Interface mechanics audit: <scope>

<date> · <framework>, <styling>, <motion library>, <primitives>

## Findings

### High
- `src/components/modal.tsx:14` · High · modal-focus · focus stays on the page behind the modal and is lost on close · fix: references/accessibility.md › Lock the background with inert and restore focus

### Medium
### Low

## Techniques

<each technique named above, with its Support and Source lines>

## Checked

<areas scanned; areas skipped and why>
```

Write "None" under an empty severity so reports line up when the user audits again. Offer the fixes as one batch per reference file, and apply a batch only when the user picks it.
