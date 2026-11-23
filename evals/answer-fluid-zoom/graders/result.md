---
type: llm
---

PASS if the declaration's preferred value mixes rem (or another zoom-scaling unit) with vw rather than bare vw, AND the response flags that 72px is three times 24px, more than about 2.5 times, so text may not reach 200% at maximum browser zoom (WCAG 1.4.4), and suggests narrowing the range (max at or below about 60px) or raising the min.
FAIL if it uses bare vw as the preferred value, or calls the range fine without the zoom ratio problem.
