---
type: llm
---

PASS if the response proposes all three replacements: CSS anchor positioning with a collision fallback (`position-try-fallbacks` or `position-try`) for the tooltip; a CSS height animation for the collapse (`grid-template-rows` from `0fr` to `1fr`, or `interpolate-size` / `calc-size()` with such a fallback) that removes the `scrollHeight` measuring; and `field-sizing: content` for the notes textarea in place of the dependency.
FAIL if any of the three is missing, or the collapse relies on `interpolate-size` alone with no fallback.
