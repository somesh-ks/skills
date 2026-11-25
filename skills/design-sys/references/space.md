# Space, targets and placement

Load when: sizing tap and click targets for a platform, specifying a focus indicator, spacing adjacent controls, padding a text button, judging spacing by eye, placing buttons near screen edges, spacing buttons in visionOS, or building a fluid space scale.
Apple values verified against the HIG on 2026-11-22. The CSS for hit areas larger than their glyph and for icon-side button padding is in `design-eng` (`dom-input.md`, `components.md`).

Contents:
- Target sizes per platform
- Space around bezeled and borderless controls
- Text button padding is about 2 to 1
- Measure space between points of high contrast
- Inset edge buttons from the screen edge
- visionOS buttons sit 60pt apart
- Focus indicator size and contrast
- Fluid space comes from the type base

## Target sizes per platform

| Platform | Default control | Minimum |
| --- | --- | --- |
| iOS, iPadOS | 44×44pt | 28×28pt |
| macOS | 28×28pt | 20×20pt |
| watchOS | 44×44pt | 28×28pt |
| visionOS | 60×60pt | 28×28pt |
| tvOS | 66×66pt | 56×56pt |
| Android (Material 3) | 48×48dp (about 9mm), 8dp between targets | |
| Web, WCAG 2.2 AA (2.5.8) | 24×24 CSS px, or smaller if a 24px circle centered on each target overlaps no other target or circle | |
| Web, WCAG 2.2 AAA (2.5.5) | 44×44 CSS px | |

The glyph can stay small; the target cannot. A 20px icon in a 44pt button is normal. A pointer-only desktop app can sit near the macOS numbers; anything touched sits near 44.

**Support:** Any platform.
**Source:** [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) (control sizes table), [Material 3: Accessibility designing](https://m3.material.io/foundations/designing/structure) (48dp targets, 8dp apart), [WCAG 2.2: Target size (minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum).

## Space around bezeled and borderless controls

Leave about 12pt around a control with a visible bezel (a filled or outlined button, an input) and about 24pt around the visible edge of a borderless one (a text button, a bare icon). With no bezel, the space is the only thing that tells the eye, and the finger, where one target ends and the next begins.

**Support:** Any platform. Keep an established dense layout dense; these are starting points for new layouts.
**Source:** [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) (about 12 points of padding around bezeled elements, about 24 around borderless ones).

## Text button padding is about 2 to 1

A text button reads as a button when its horizontal padding is about twice its vertical padding (12 by 6, 16 by 8). Square padding makes it look like a tag or a chip. With an icon, trim the icon side by the glyph's built-in whitespace; an icon-only button is square. The CSS for the icon side is in `design-eng` › `components.md` › Asymmetric optical padding for icon buttons.

**Support:** Any platform.
**Source:** Mechanism: a word is wider than it is tall, and padding proportional to the label keeps the pill shape the eye has learned for buttons.

## Measure space between points of high contrast

Spacing that looks equal is measured between the edges the eye sees, not between bounding boxes. A line box adds space above the cap height and below the baseline, so 16px between a heading's box and a card edge looks like more than 16px of air. Measure from the cap height, the baseline, or the edge of a filled shape, and correct the box values to match.

**Support:** Any platform. On the web, `text-box: trim-both cap alphabetic` removes the extra line box space; see `design-eng` › `typography.md` › Optical text alignment and icon anchoring with text-box.
**Source:** Mechanism: a line box includes the font's ascent and descent, which sit outside the visible letters.

## Inset edge buttons from the screen edge

A button pressed against three edges of the screen reads as system chrome, and on phones it clips against the rounded display corners and the home indicator. Inset it by about 16pt on each side plus the safe area, and let it span the content width inside those margins. Backgrounds and media may bleed to the edges; controls stay inside.

**Support:** Any platform. On the web, add `env(safe-area-inset-*)` with `viewport-fit=cover`; see `design-eng` › `mobile.md`.
**Source:** [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) (respect safe areas, margins and guides; extend background content to the edges).

## visionOS buttons sit 60pt apart

Gaze targeting is less precise than a finger, and the hover highlight grows around the button. Place buttons so their centers are at least 60pt apart, and add 4pt of clear space around buttons of 60pt or more. Avoid rows or stacks of mini and small buttons.

**Support:** visionOS.
**Source:** [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) (visionOS: centers at least 60 pts apart, 4 pts of padding).

## Focus indicator size and contrast

A focus ring must be big enough and change enough to be seen. The strong standard (WCAG 2.2 AAA, 2.4.13) asks for an indicator with at least the area of a 2 CSS px thick line around the component, changing by at least 3:1 between focused and unfocused pixels. At AA, 1.4.11 asks for 3:1 between the indicator and the colors next to it. A 2px solid ring offset 2px from the component, in a color that passes 3:1 on every surface it can sit on, meets both. A 1px ring, or a background tint alone, usually meets neither.

**Support:** Any platform with keyboard focus: web, macOS, iPadOS with a keyboard, tvOS focus, Android with a keyboard.
**Source:** [WCAG 2.2 Understanding: Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), [WCAG 2.2: Non-text contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast).

## Fluid space comes from the type base

Derive every space step as a multiple of the fluid body size, so space and type grow at the same rate and a layout keeps its proportions at every width. Where a gap should grow faster than the type, such as page gutters or section padding, interpolate between two steps (small at the narrowest screen, large at the widest) instead of adding a breakpoint.

**Support:** The web. On native platforms, use the platform's fixed spacing and let Dynamic Type or font scale drive text.
**Source:** [Smashing Magazine: Meet Utopia](https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/) (space value pairs), [CSS-Tricks: Consistent, fluidly scaling type and spacing](https://css-tricks.com/consistent-fluidly-scaling-type-and-spacing/)
