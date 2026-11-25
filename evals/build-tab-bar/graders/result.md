---
type: llm
---

PASS if the hover targets leave no dead zone between tabs: the tabs sit flush or the spacing moves inside each tab (padding, or a pseudo-element hit area), so the pointer never crosses a gap that belongs to no tab, and the bold selected state does not change the tab's width.
FAIL if the tabs keep a plain gap between hover targets, or the bold state changes the tab width with nothing reserving it.
