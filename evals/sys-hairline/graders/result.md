---
type: llm
---

PASS if the response says a hairline is one device pixel, gives 0.33pt (1/3) for the 3x iPhone and 1 / displayScale in SwiftUI, and for CSS on retina either avoids a fractional `border` width or says it rounds up to 1px, using a fractional inset box-shadow (or another method it says paints one device pixel) gated by resolution.
FAIL if it answers 1pt or 0.5pt for the iPhone without mentioning 3x, or recommends `border: 0.5px` in CSS as a working hairline.
