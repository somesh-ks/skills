# Signals

Load when: running the scan (SKILL.md step 3). Each row is a lead to confirm by reading the code, not a rule. Fix paths point into the `design-eng` skill's `references/` folder.

Area codes: MOT motion, INT input, PRF performance, A11 accessibility, TYP typography, COL color, LAY layout, MOB mobile, CMP components, I18 international. Run the I18 rows only when the project ships more than one language or any right-to-left one.

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
| COL | split-theme-pair | *read*: find theme blocks with `rg -n '\.dark\|\[data-theme\|prefers-color-scheme: dark'`, then compare the tokens each block overrides: a fill such as `--primary` set without its text pair (`--primary-foreground`, `--on-primary`). Measure the inherited pair on the new fill and drop the lead if it still reaches 4.5:1. Cite the theme block's line | The label keeps its old colour on the new fill and disappears in that theme | Override the fill and its text token together in every theme block |
| COL | raw-label-on-token | `text-(white\|black)\b`, `text-\[#`, or `color:\s*(#\|white\|black)`; confirm the same element's fill is a theme token (`bg-primary`, `bg-muted`, `background: var(--…)`) that changes between themes | The fill flips with the theme and the fixed label lands on a fill of its own colour | Take the label from the fill's text token (`text-primary-foreground`); a raw label is fine only on a fill that never changes with the theme |
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
| I18 | physical-sides | `margin-left`, `padding-right`, `left:`, `text-align:\s*left`, `\bml-`, `\bpr-`, `\bleft-` in components | Layout does not mirror in Arabic or Hebrew | Logical properties (`margin-inline-start`, Tailwind `ms-` and `pe-`); `layout.md` › Mirror direction, not meaning |
| I18 | ime-enter | `key === ['"]Enter` on a text field that submits, with no `isComposing` and no `keyCode === 229` | Enter that confirms a Japanese or Chinese conversion sends half-typed text | Skip Enter while `event.isComposing` or `keyCode === 229` (Safari reports the confirming Enter after composition ends) |
| I18 | no-bidi-isolate | *read*: user names, titles or other user text interpolated into a translated string with no `<bdi>` or `dir="auto"` | A Latin name inside Arabic text reorders the sentence and its punctuation | Wrap each user value in `<bdi>` |
| I18 | tracked-script | `letter-spacing`, `tracking-` on text that can render Arabic, with no `:lang(ar)` reset | Spacing pulls joined Arabic letters apart | Reset `letter-spacing: 0` under `:lang(ar)` and other joined scripts |
| I18 | fixed-label | Fixed `width` or `w-` on buttons, tabs or chips with text; `truncate` on labels under about 20 characters | Translated labels clip or ellipsize | Let width follow content; `layout.md` › Short labels grow most in translation |
| I18 | tight-line-box | Fixed `height` or `h-` with `overflow-hidden`, or line-height under 1.3, on text labels | Thai, Vietnamese and Devanagari marks above and below the line get clipped | `min-height` instead of `height`, line-height of at least 1.5 for those scripts |
| I18 | hand-formatted | `toFixed\(`, `/ 100`, `toLocaleString\(\)` or `toLocaleDateString\(\)` with no locale, currency symbols concatenated into strings | Wrong decimals, separators and date order per locale | `Intl` with the user's locale; `numbers.md` › Currency decimals come from the currency |
| I18 | missing-lang | `<html` with no `lang`, or content in another language with no `lang` on its element | Wrong CJK glyph forms, no hyphenation, wrong case mapping and screen reader voice | Set `lang` on the document and on every passage in another language |

Skip MOB when the project is desktop only, and I18 when it ships one left-to-right language; say so in the report.
