# Color values

Load when: building or reviewing a color ramp, styling status badges, adding increased-contrast colors, picking a contrast target for small text on brand colors, or assigning semantic color roles.
Values verified on 2026-11-22. Gradient interpolation, relative color and `color-mix()` are in `design-eng` › `color.md`.

Contents:
- Status pills flip contrast
- Ramp ends need more saturation
- Shift hue to lighten or darken
- Increased contrast is a variant per appearance
- Small text on custom colors aims for 7:1
- Use a color only in its role

## Status pills flip contrast

White text on a saturated status color needs a very dark background to reach 4.5:1, and a page of dark saturated badges shouts. Flip it: dark text from the hue's darkest step on a pale tint of the same hue. It keeps the meaning, passes contrast easily and sits quietly in the hierarchy. Pair the color with a word or an icon so it does not carry the meaning alone.

**Support:** Any platform.
**Source:** Adam Wathan and Steve Schoger, *Refactoring UI* ("flip the contrast"). [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (do not rely on color alone).

## Ramp ends need more saturation

At the same saturation number, a color looks greyer as it nears white or black, so a ramp built at one saturation fades at both ends. Raise saturation (or chroma, within gamut) for the lightest and darkest steps compared with the middle one. Tinted greys follow the same rule, or the palest and darkest greys drift back to neutral next to the mid-tones.

**Support:** Any platform and color space. In OKLCH the darkest and lightest steps are also where sRGB gamut runs out, so check the clipped value.
**Source:** Adam Wathan and Steve Schoger, *Refactoring UI* ("don't let lightness kill your saturation").

## Shift hue to lighten or darken

Hues differ in how bright they look at the same lightness: yellow, cyan and magenta read bright, and red, green and blue read dark. To lighten a step without washing it out, rotate its hue toward the nearest bright one; to darken, toward the nearest dark one. Cap the shift at about 20–30 degrees across the whole ramp, or the step reads as a different color. This is why a good yellow ramp darkens toward orange, not toward olive.

**Support:** Any platform and color space.
**Source:** Adam Wathan and Steve Schoger, *Refactoring UI* ("perceived brightness"). Mechanism: luminance weights green most and blue least, so hue alone moves perceived brightness.

## Increased contrast is a variant per appearance

When the user asks for more contrast, a color moves away from its background: darker in the light theme, lighter in the dark one. One shared high-contrast override cannot do both, so it lowers contrast in one of the themes. Define four values for each custom color that matters: light, dark, light with increased contrast, dark with increased contrast. Apple's system colors ship exactly these four.

**Support:** iOS, iPadOS, macOS and visionOS (Increase Contrast); the web through `prefers-contrast: more` combined with `prefers-color-scheme`; Windows through contrast themes.
**Source:** Mechanism: contrast increases in opposite directions on light and dark grounds. [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (system colors with default and increased contrast values for light and dark).

## Small text on custom colors aims for 7:1

4.5:1 is the floor, and custom brand colors are where text drifts toward it. For small text on custom foreground and background pairs, aim for 7:1, and give the 4.5:1 floor only to large text and to cases where the brand color cannot move.

**Support:** Any platform.
**Source:** [Apple HIG: Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) (strive for 7:1 for custom colors, especially in small text).

## Use a color only in its role

A semantic color means its role, not its look. A separator color used as caption text, or a secondary-label color used as a fill, looks right until the next theme or contrast mode moves it, and then both uses break. If a role is missing, add a role; do not borrow one that happens to match today.

**Support:** Any platform.
**Source:** [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) (avoid redefining the semantic meanings of dynamic system colors, for example separator as text).
