# Component principles

Load when: deciding how many buttons in a view get emphasis, sizing controls that sit in one row, styling a disabled control, showing progress inside a button, or choosing button shapes for visionOS.
Values verified on 2026-11-22. The CSS for buttons that keep their size across states is in `design-eng` › `components.md`.

Contents:
- One or two prominent actions per view
- Controls in a row share one height
- Disabled controls are exempt, not invisible
- Progress inside the button that started it
- visionOS button shapes follow their content

## One or two prominent actions per view

A prominent, color-filled button marks the action people most likely want. Use one, at most two, per view; when every action is filled, none is primary. Put the accent on the button's background, not on its label or symbol, and leave other buttons neutral. A destructive action that is not the main one gets the quiet style, then becomes the filled red button inside its own confirmation.

**Support:** Any platform.
**Source:** [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) (one or two prominent buttons per view), [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (color the background of primary actions; do not color the background of many controls).

## Controls in a row share one height

A button beside an input, a select beside a search field, a segmented control in a toolbar: when they sit on one line, they need one height, or their edges and labels misalign by a few pixels and the row looks broken. Define a short control-height scale (small, regular, large) that every control uses, and size icon-only buttons as squares of the same height. The visible height can be under the target size; the hit area still meets it.

**Support:** Any platform. visionOS defines button heights of 28, 32, 44, 52 and 64pt; Apple and Material controls each share a height per size.
**Source:** Mechanism: aligned tops, bottoms and baselines read as one group (proximity and similarity); a 2px height difference breaks all three at once. [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) (visionOS sizes).

## Disabled controls are exempt, not invisible

Contrast minimums do not apply to the text of an inactive control, so a disabled button may sit below 4.5:1. That is permission, not a target: it still has to read as a control people could use later, and nothing tells them why it is off. Where the reason matters (a form that is not complete), keep the control enabled and explain on press, or say beside it what unlocks it.

**Support:** Any platform.
**Source:** [WCAG 2.2: Contrast (minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum) (text in an inactive user interface component has no contrast requirement).

## Progress inside the button that started it

For an action that takes a moment, show the activity indicator inside the button, on the leading side of the label, and change the label to say what is happening ("Checking out"). The progress sits where the person is looking, and the button cannot be pressed twice. Keep the button's size fixed across idle, busy and done.

**Support:** Any platform. On the web, see `design-eng` › `components.md` › Buttons that keep their size.
**Source:** [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) (activity indicator in a button, with a label such as Checking out).

## visionOS button shapes follow their content

An icon-only button is a circle, a text-only button a rounded rectangle or capsule, and an icon-plus-text button a capsule. In a horizontal row of text buttons use capsules; in a vertical stack use rounded rectangles. White fill with black content is reserved for the toggled state.

**Support:** visionOS. The same content-to-shape rule is a reasonable default elsewhere.
**Source:** [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) (visionOS shapes; capsules in rows, rounded rectangles in stacks; white background reserved for toggled).
