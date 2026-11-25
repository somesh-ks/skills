---
type: llm
---

PASS if the menu really fades out on close (it stays rendered until the exit finishes, or uses `@starting-style` with `transition-behavior: allow-discrete`, the popover API, or an equivalent exit path) and the menu cannot clip past the right edge of the viewport (it aligns to the button's right edge, or uses anchor positioning with a fallback).
FAIL if the menu unmounts on close with no exit animation, or is placed with a left-aligned static offset that can overflow the right edge.
