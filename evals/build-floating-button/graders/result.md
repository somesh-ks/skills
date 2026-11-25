---
type: llm
---

PASS if the floating button stays visible and reachable while the user scrolls, and the collision with the game's footer is solved by layout (for example reserving space or padding at the footer's end on phones, or moving the button out of the way) or, if it hides, it hides only while it actually overlaps the footer and is guaranteed to come back as soon as it no longer does (an IntersectionObserver that both hides and restores).
FAIL if the button hides on scroll (scroll direction, any scroll, or "while scrolling"), or hides based on a flag that is set and never reliably reset, so it can disappear and stay gone.
