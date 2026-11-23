---
type: llm
---

PASS if the findings cover at least five of these: physical left/right classes (pl-4, ml-2) that do not mirror in RTL; Enter sending during IME composition (no isComposing / keyCode 229 check); the author name interpolated without bidi isolation (<bdi>); letter-spacing (tracking-widest) breaking Arabic joining or uppercase meaningless for Arabic/Japanese; hand formatting price with $ and /100 toFixed(2) instead of Intl with the locale; fixed width with truncate clipping translated text; fixed height with overflow-hidden and tight leading clipping scripts or content.
FAIL if fewer than five are found.
