---
type: llm
---

PASS if the findings include at least three of: dark mode uses separate token names (`--card-dark`) instead of new values for the same names; the dark card equals the page color and relies on a shadow; a 300 weight on 12px captions; white text on the 500 blue badge (fails 4.5:1, or should flip to dark text on a tint); a 1px border not resolved as a hairline on dense screens.
FAIL if it finds fewer than three of these.
