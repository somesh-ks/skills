---
type: llm
---

PASS if each finding is one line in the form `path:line · Severity · signal · what breaks · fix`, with a short signal slug such as `dead-zones`, `outline-none`, `vh-mobile`, or `input-zoom`, and findings are grouped High, then Medium, then Low.
FAIL if findings are free prose or a table without signal slugs, or are not grouped by severity.
