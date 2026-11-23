# Pixels, hairlines and glyphs

Load when: drawing separators, borders or strokes on high-density screens, exporting raster assets, placing icons beside text, using icons below 20px, aligning a column of glyphs, or sizing round and pointed shapes against square ones.
Values verified on 2026-11-22. The Chromium measurement below was taken on Chromium 157.

Contents:
- Hairline is one device pixel
- Web hairlines: borders snap, shadows do not
- Snap shapes to whole points at 1x
- Icons look heavier than the text beside them
- Simplify glyphs below 20px
- Negative side margins for badged glyphs
- Optical overshoot for round and pointed shapes

## Hairline is one device pixel

A hairline is the thinnest line the screen can draw: one physical pixel. In points it is `1 / scale`, so it changes with the display:

| Scale | Device pixels per point | Hairline |
| --- | --- | --- |
| 1x | 1 | 1pt |
| 2x | 2 | 0.5pt |
| 3x | 3 | 0.33pt |

A separator specified as "1pt" is three device pixels on a 3x iPhone and reads as a rule, not a hairline. Specify separators as a hairline token and resolve it per screen.

```swift
// SwiftUI
@Environment(\.displayScale) private var displayScale
Rectangle().frame(height: 1 / displayScale)
```

```kotlin
// Jetpack Compose: Dp.Hairline always draws one physical pixel
Modifier.border(Dp.Hairline, MaterialTheme.colorScheme.outlineVariant)
```

On the web, use the recipe in the next section; a `0.5px` border does not do this.

**Support:** Any platform. iOS ships @2x and @3x screens, iPadOS and watchOS @2x, macOS and tvOS @1x and @2x.
**Source:** [Apple HIG: Images](https://developer.apple.com/design/human-interface-guidelines/images) (scale factors). Mechanism: one point spans `scale` device pixels, so one device pixel is `1 / scale` points.

## Web hairlines: borders snap, shadows do not

Chromium rounds a border width between 0 and 1 up to one CSS pixel, so `border-top: 0.5px` paints two device pixels at 2x and `0.333px` paints three at 3x. A box-shadow offset is not rounded that way: an inset shadow with a `0.5px` offset paints exactly one device pixel at 2x, and `calc(1px / 3)` paints one at 3x. Gate the fractions on resolution, because at 1.5x a half-pixel line falls between pixels and blurs.

```css
.row {
  box-shadow: inset 0 -1px 0 var(--color-separator);
}
@media (resolution >= 2dppx) {
  .row { box-shadow: inset 0 -0.5px 0 var(--color-separator); }
}
@media (resolution >= 3dppx) {
  .row { box-shadow: inset 0 calc(-1px / 3) 0 var(--color-separator); }
}
```

A shadow takes no layout space, so the hairline never shifts content when the density changes. Safari and Firefox were not measured; check one device of each before relying on the fraction there.

**Support:** `box-shadow` and the `resolution` media feature are Baseline widely available; range syntax (`>=`) in media queries is Baseline 2023.
**Source:** Measurement: Chromium 157, a 40px-wide line screenshot at device scale 1, 1.5, 2 and 3, counting dark pixel rows. `border-top-width: 0.5px` computed to `1px` and painted 2 rows at 2x; the inset shadow painted 1 row at 2x and at 3x. [MDN: resolution](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/resolution)

## Snap shapes to whole points at 1x

Put vector points and edges on whole values at 1x. Because 2x and 3x are whole multiples of 1x, every edge then lands on a device pixel at every scale, and nothing is antialiased into a grey smear. A 1pt stroke centered on a whole coordinate is the common trap: half of it falls on each neighbouring pixel at 1x, so it paints as a 2px grey line. Move the path by half a point, or draw the stroke inside the shape.

**Support:** Any vector tool or renderer: Figma, SF Symbols templates, SVG, Canvas, Core Graphics.
**Source:** [Apple HIG: Images](https://developer.apple.com/design/human-interface-guidelines/images) (control points at whole values). Mechanism: a centered stroke extends `width / 2` either side of the path.

## Icons look heavier than the text beside them

A glyph packs its ink into a small, dense square, while the letters beside it are thin strokes with open counters. At the same color the icon looks a step heavier and pulls the eye from the label. Give an icon paired with text the next quieter foreground (secondary instead of primary), and keep it at 3:1 against its background so it still counts as a meaningful graphic. A standalone icon button keeps the primary color.

**Support:** Any platform.
**Source:** Mechanism: perceived weight follows ink density, and a filled or outlined glyph has more ink per area than a word at the same size. [WCAG 2.2: Non-text contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast) (the 3:1 floor).

## Simplify glyphs below 20px

Icons are drawn for a size. A glyph designed on a 24 grid and shown at 16 loses a third of every stroke and gap, so fine detail (gear teeth, small counters, double lines) closes up into noise. Below 20px, use a glyph drawn for that size, or a simpler sibling with fewer parts. Going up has the opposite problem: a 16px glyph shown at 48 looks chunky and empty; put it at its real size inside a larger shape instead.

**Support:** Any icon set. Libraries that ship size-specific drawings or optical-size axes (Material Symbols `opsz`) solve it at the source.
**Source:** Mechanism: scaling a drawing by 16/24 scales strokes and gaps by the same 0.67, and gaps under about 1 device pixel stop rendering as gaps. Adam Wathan and Steve Schoger, *Refactoring UI* ("everything has an intended size").

## Negative side margins for badged glyphs

A glyph with a badge, an arrow or a plus sticking out of one side has a wider bounding box than its plain sibling. Aligned by box, a column of folder icons zig-zags. Give the wider glyph a negative side margin equal to the extra width, so every glyph in the column aligns on its main shape.

**Support:** SF Symbols supports this per weight and scale (margins named like `left-margin-Regular-M`). Anywhere else, set the margin on the glyph's container.
**Source:** [Apple HIG: SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) (negative side margins).

## Optical overshoot for round and pointed shapes

A circle, a triangle or a diamond the same height as a square looks smaller, because less of its area reaches the bounding edges. Type designers let round letters (o, c) overshoot the baseline and cap height for this reason. Draw round and pointed marks a few percent past the box (start around 2–4% each side and judge it at size), and move a play triangle toward its point until its mass, not its box, sits in the center of its button.

**Support:** Any platform; most icon sets already overshoot. Apply it to marks you draw yourself: avatars beside square thumbnails, custom play and status shapes.
**Source:** Mechanism: a shape's apparent size follows its area near the edges; a circle fills about 79% of its bounding square and a triangle 50%.
