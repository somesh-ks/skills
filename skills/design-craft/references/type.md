# Type values

Load when: choosing default or minimum text sizes for a platform, setting tracking per size, picking weights for small text, setting leading for text that wraps, adding emphasis inside a text role, deciding which text counts as large for contrast, or laying out for accessibility text sizes.
Apple values verified against the HIG on 2026-11-22. The CSS for applying them (unitless line-height, `text-box`, tabular numbers) lives in `interface-mechanics` and the project's type skill.

Contents:
- Default and minimum text per platform
- Tracking depends on size
- Light weights need size
- Wrapped text never gets tight leading
- Emphasis is a weight step, not a size step
- Large text starts at different sizes
- Layouts at accessibility text sizes

## Default and minimum text per platform

| Platform | Default body | Minimum |
| --- | --- | --- |
| iOS, iPadOS | 17pt | 11pt |
| macOS | 13pt | 10pt |
| watchOS | 16pt | 12pt |
| visionOS | 17pt | 12pt |
| tvOS | 29pt | 23pt |
| Web | 16px (the browser default) | 12px for UI labels, rarely |

A web design system shared with an iOS app should not copy 17pt into CSS: browser text at 16px is the reader's setting, and `rem` keeps it. A custom font with thin strokes needs more than the minimum.

**Support:** Any platform; the Apple values are the platform text styles at the default (Large) text size.
**Source:** [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) (default and minimum sizes table).

## Tracking depends on size

Small text needs room between letters to stay legible; large text needs less, or the word falls apart. San Francisco tracks itself at every size, and its table is a good model for any sans: +6 (1/1000 em) at 11pt, 0 at 12pt, −26 at 17pt, then back above zero from 24pt (+3) to about +14 at 28–30pt, and 0 again from 80pt. Use the system font's own tracking rather than adding letter-spacing to it.

For a web sans with no published table: `-0.01em` to `-0.02em` on headings at 24px and up, `0` on body text, and `+0.05em` on uppercase labels at 14px or smaller (caps have no ascenders or descenders to separate them).

**Support:** Any platform. In CSS, set `letter-spacing` in `em` so it scales with the size.
**Source:** [Apple HIG: Typography, tracking values](https://developer.apple.com/design/human-interface-guidelines/typography#Tracking-values) (SF Pro table).

## Light weights need size

Thin strokes lose contrast first: at small sizes a Light weight renders as a few grey pixels per stroke. Keep UI text at Regular, Medium, Semibold or Bold. Use Ultralight, Thin and Light only for large display text, from about 28px, and check its contrast there too.

**Support:** Any platform.
**Source:** [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) (avoid Ultralight, Thin and Light). Mechanism: stroke width scales with weight, and a stroke under one device pixel is antialiased toward the background color.

## Wrapped text never gets tight leading

Tight leading is fine for one or two lines in a cramped row. Once text wraps to three or more lines, the eye needs space to find the start of the next line: keep line height at about 1.4 or more, even where height is limited. For reference, iOS body text is 17pt on 22pt (1.29) at one or two lines, and long-form body copy sits at 1.5–1.6.

**Support:** Any platform. In CSS, use a unitless line-height so it scales with the font size.
**Source:** [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) (avoid tight leading for three or more lines; Body 17/22 at the Large size).

## Emphasis is a weight step, not a size step

To emphasize words inside a text role, raise the weight one or two steps and keep the size. Changing size breaks the line's rhythm and makes the emphasized words look like a different role. Apple defines an emphasized weight per text style: Body goes from Regular to Semibold, titles from Regular to Bold.

**Support:** Any platform; the face needs the heavier weight loaded, or the renderer synthesizes a smeared bold.
**Source:** [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) (emphasized weights in the Dynamic Type tables).

## Large text starts at different sizes

The relaxed 3:1 contrast for large text applies from different sizes on each standard:

| Standard | Large text | 4.5:1 below that |
| --- | --- | --- |
| WCAG 2.2 | 18pt (24 CSS px) regular, or 14pt (about 18.66px) bold | Yes |
| Apple HIG | 18pt and up, or any bold text | Yes, up to 17pt |

So 18px regular web text is normal text under WCAG, and 13pt bold passes at 3:1 in the HIG but not in WCAG. A system shared across web and native uses the stricter rule for each pair: WCAG's.

**Support:** Any platform.
**Source:** [WCAG 2.2: large scale](https://www.w3.org/TR/WCAG22/#dfn-large-scale), [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) (minimum contrast table).

## Layouts at accessibility text sizes

At the largest text sizes (iOS AX1 to AX5 take body text from 28pt to 53pt), side-by-side layouts run out of width. Stack them: the title goes above the secondary value, a row grows to several lines, and the trailing timestamp or chevron moves under the text. Icons that carry meaning grow with the text. The order of importance stays the same at every size.

**Support:** iOS, iPadOS, watchOS and visionOS Dynamic Type; Android font scale; browser zoom and text size on the web (WCAG 1.4.4 asks for 200%).
**Source:** [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) (Supporting Dynamic Type; AX sizes table).
