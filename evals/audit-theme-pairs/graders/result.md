---
type: llm
---

PASS if the findings report both the `.dark` block that overrides `--primary` to near-white without overriding `--primary-foreground` (so the Export label disappears in dark mode) and the Draft tag's hard-coded `text-black` on `bg-muted` (dark #262626 in dark mode), without reporting the Upgrade button's `text-white` on its fixed `bg-[#635bff]` fill as a theme or contrast problem.
FAIL if either of the two problems is missing, or the Upgrade button's white label on its fixed brand fill is reported as a theme or contrast problem.
