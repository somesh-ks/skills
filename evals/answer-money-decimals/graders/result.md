---
type: llm
---

PASS if the helper does not hard-code 2 decimals or divide by 100 for every currency: it derives the minor-unit digits per currency (for example from Intl.NumberFormat resolvedOptions().maximumFractionDigits, or a table with JPY 0 and KWD 3) and formats with Intl.NumberFormat currency style.
FAIL if it divides by 100 for all currencies or keeps toFixed(2) for JPY or KWD.
