---
name: design-craft
description: "Platform-neutral design values with the reason and a source: hairline weight per pixel density (0.33pt on 3x), text, target and spacing sizes per platform from Apple's HIG, Material and WCAG, tracking by size, dark mode elevation without shadows, and space for translated labels. Use for web, iOS, Android or Figma when asked 'how thin should a separator be', 'what body size on iOS', 'cards vanish in dark mode' or 'how much room for German labels'. Not for CSS or DOM code (use interface-mechanics), palettes, token files or motion."
license: MIT
metadata:
  author: somesh-ks
  version: "1.0.0"
  verified: "2026-11-22"
---

# Design craft

Router only. Find the row, load that one file, give the value with its reason and its Support and Source lines.

| Mode | When | Do |
| --- | --- | --- |
| Answer | The user asks what value to use, or why something looks off | Find the row below and give the value, the mechanism behind it, and the platform it applies to |
| Build | You are setting sizes, borders, type or surfaces for a screen or a design system and nobody asked for this skill | Run the build check below before you finish |

## Build check

Check each one that applies:

- A 1px separator or border on a high-density screen: it should be one device pixel. `pixels.md` › Hairline is one device pixel.
- Small UI text in a light weight, or body text below the platform default: `type.md` › Light weights need size.
- A tap target set by the glyph's size: `space.md` › Target sizes per platform.
- A dark theme that elevates cards with shadows only: `depth.md` › Dark mode elevates with lighter surfaces.
- More than two filled, colored buttons in one view: `depth.md` › One or two prominent actions per view.

Fix them. End the reply with a short **Craft** list: one line per value you set or changed, with its Source line. Skip checks that do not apply.

## Find the file

| Need | File |
| --- | --- |
| Hairlines and device pixels, pixel-grid snapping, web hairlines that survive rounding, icon weight and contrast beside text, glyphs below 20px, side margins for badged glyphs, optical overshoot | `references/pixels.md` |
| Default and minimum text sizes per platform, tracking by size, light weights, leading for wrapped text, emphasis by weight, large-text contrast thresholds, layouts at accessibility text sizes | `references/type.md` |
| Target sizes per platform (Apple, Android, WCAG), space around bezeled and borderless controls, text button padding ratio, optical spacing, inset edge buttons, visionOS button spacing, focus indicator size and contrast | `references/space.md` |
| Breakpoints by window width, same features at every size, text expansion in translation, which icons mirror in right-to-left | `references/layout.md` |
| Dark mode elevation and surface steps, dark accents and text, white images in dark mode, light direction for raised and inset, contact shadows, prominent actions, status pills, saturation and hue shifts along a ramp, increased contrast per appearance, 7:1 for small text | `references/depth.md` |

## Rules

- Each technique carries a **Support** line (where it applies: platforms, plus browser support when code is shown) and a **Source** line. Carry both into the answer. A Source that reads `Mechanism:` or `Measurement:` states the reason or the measured result instead of a link; say so when you use it.
- The project's own tokens and platform conventions win. These values are starting points and floors.
- Give pt for Apple platforms, dp for Android, CSS px for the web. 1pt = 1dp = 1 CSS px at 1x.
- For code that applies a value in CSS, point to `interface-mechanics` and its section rather than writing a mechanism from memory.
