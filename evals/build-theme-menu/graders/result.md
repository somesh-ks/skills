---
type: llm
---

PASS if the code skips the transition when the page's look would not change, for example by comparing the resolved theme before and after (Dark to System while the OS is dark, or picking the theme that is already active) and calling setTheme directly without `startViewTransition` in that case.
FAIL if every menu pick runs the View Transition, including picks that resolve to the same theme.
