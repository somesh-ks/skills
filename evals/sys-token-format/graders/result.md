---
type: llm
---

PASS if no token name contains a dot (the 6px step is named like `1-5`, `1_5` or `150`, not `1.5`), every dimension `$value` is an object with a numeric `value` and a `unit` of `px` or `rem`, and `gap.card` references the 16px step with curly-brace syntax.
FAIL if any name contains a dot, or any dimension value is a string such as "16px".
