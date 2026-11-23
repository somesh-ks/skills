# Depth, surfaces and color roles

Load when: elevating surfaces in a dark theme, choosing dark surface steps, tuning accents and body text for dark mode, placing images with white backgrounds in dark mode, shading raised and inset elements, deciding how many colored actions a view gets, styling status pills, adding increased-contrast colors, or picking a contrast target for small text on brand colors.
Values verified on 2026-11-22. Palette generation belongs to the project's color skill; the CSS for layered shadows, `light-dark()` and smear-free theme switches is in `interface-mechanics` (`css-visual.md`, `color.md`).

Contents:
- Dark mode elevates with lighter surfaces
- Dark surface steps
- Dark accents and dark body text
- Soften white images in dark mode
- Light comes from above
- Contact shadows fade as elevation rises
- One or two prominent actions per view
- Status pills flip contrast
- Increased contrast is a variant per appearance
- Small text on custom colors aims for 7:1

## Dark mode elevates with lighter surfaces

A shadow darkens what is behind it, and a near-black page has almost nothing left to darken. A 20% black shadow over white drops OKLCH lightness by 0.155; over `#0a0a0a` it drops it by 0.01, which nobody can see. So in a dark theme each raised layer is the next lighter surface (page, card, popover, menu), and shadows only add an edge. Apple's dark mode works the same way: dimmer base backgrounds recede, brighter elevated backgrounds come forward, and a sheet or popover switches to the elevated set.

**Support:** Any platform.
**Source:** Measurement: OKLCH L of `#ffffff` is 1.000 and of `#cccccc` (white under 20% black) 0.845; `#0a0a0a` is 0.145 and `#080808` 0.134. [Apple HIG: Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) (base and elevated background colors).

## Dark surface steps

The steps of a color ramp that work for text (about 0.07 L apart at the dark end) are too coarse for stacked surfaces. Generate separate surface steps: page around L 0.15–0.22, then each layer about 0.03–0.04 L lighter, and never closer than 0.02 between layers that touch. Adjacent dark surfaces are a thin cue even then, so a raised one usually also gets a hairline border lighter than both surfaces.

**Support:** Any platform.
**Source:** Measurement: `#0a0a0a` is L 0.145 and `#121212` L 0.182. Mechanism: about 0.02 OKLCH L is the smallest lightness difference most people notice between large adjacent areas.

## Dark accents and dark body text

Light on dark reads stronger than dark on light at the same contrast ratio. Two consequences: an accent tuned for a white page looks neon on near-black, so lower its chroma by 10–20% in the dark theme; and body text wants to be a step dimmer than the mirrored light value (a light grey rather than the lightest step), while headings and primary labels can stay at the top step.

**Support:** Any platform. Remeasure every pair in the dark theme; contrast does not carry over from the light one.
**Source:** Mechanism: irradiation, where bright areas on a dark ground appear larger and brighter than the same shapes reversed.

## Soften white images in dark mode

A content image with a white background (a product shot, a diagram, a logo on white) becomes the brightest thing on a dark screen and glows. Darken it slightly in the dark theme, for example to 90% brightness, or give it a surface-colored backdrop where the asset allows.

**Support:** Any platform. On the web, `filter: brightness(0.9)` under the dark theme.
**Source:** [Apple HIG: Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) (soften the color of white backgrounds).

## Light comes from above

People look slightly down at screens, and UI light is drawn from above, so they see the top edge of raised things and the bottom edge of sunken ones. A raised element (button, card) gets a lit top edge and a shadow below. An inset element (input, well, checkbox) gets a shadow inside its top edge and a bottom lip that is lighter than its own face. Check the lip against the face: on a near-white input there is no room to go lighter, so drop the lip and let the top shadow carry it, or the lip paints as a stray dark border.

**Support:** Any platform. Keep the blur tiny; these edges are sharp.
**Source:** Adam Wathan and Steve Schoger, *Refactoring UI* ("emulate a light source").

## Contact shadows fade as elevation rises

A resting object has a dark, tight contact shadow where no light reaches; lifted, that contact shadow fades first and the soft cast shadow grows. So in an elevation scale the tight shadow is the darker of the two at the lowest level and disappears by the highest, while the cast shadow grows in offset and blur. Fixing both alphas across the scale makes every level look like the same object at a different size. The CSS for stacking the layers is in `interface-mechanics` › `css-visual.md` › Layered, tinted shadows.

**Support:** Any platform that draws shadows.
**Source:** Mechanism: ambient occlusion under an object shrinks as its distance from the surface grows, while its direct shadow spreads and softens.

## One or two prominent actions per view

A prominent, color-filled button marks the action people most likely want. Use one, at most two, per view; when every action is filled, none is primary. Put the accent on the button's background, not on its label or symbol, and leave other buttons neutral. A destructive action that is not the main one gets the quiet style, then becomes the filled red button inside its own confirmation.

**Support:** Any platform.
**Source:** [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) (one or two prominent buttons per view), [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (color the background of primary actions; do not color the background of many controls).

## Status pills flip contrast

White text on a saturated status color needs a very dark background to reach 4.5:1, and a page of dark saturated badges shouts. Flip it: dark text from the hue's darkest step on a pale tint of the same hue. It keeps the meaning, passes contrast easily and sits quietly in the hierarchy. Pair the color with a word or an icon so it does not carry the meaning alone.

**Support:** Any platform.
**Source:** Adam Wathan and Steve Schoger, *Refactoring UI* ("flip the contrast"). [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (do not rely on color alone).

## Increased contrast is a variant per appearance

When the user asks for more contrast, a color moves away from its background: darker in the light theme, lighter in the dark one. One shared high-contrast override cannot do both, so it lowers contrast in one of the themes. Define four values for each custom color that matters: light, dark, light with increased contrast, dark with increased contrast. Apple's system colors ship exactly these four.

**Support:** iOS, iPadOS, macOS and visionOS (Increase Contrast); the web through `prefers-contrast: more` combined with `prefers-color-scheme`; Windows through contrast themes.
**Source:** Mechanism: contrast increases in opposite directions on light and dark grounds. [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (system colors with default and increased contrast values for light and dark).

## Small text on custom colors aims for 7:1

4.5:1 is the floor, and custom brand colors are where text drifts toward it. For small text on custom foreground and background pairs, aim for 7:1, and give the 4.5:1 floor only to large text and to cases where the brand color cannot move.

**Support:** Any platform.
**Source:** [Apple HIG: Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) (strive for 7:1 for custom colors, especially in small text).
