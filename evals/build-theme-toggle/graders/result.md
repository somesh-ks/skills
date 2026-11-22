---
type: llm
---

PASS if the response stops the global color transition from animating the theme switch itself, for example `disableTransitionOnChange` on the ThemeProvider or a class that sets `transition: none` during the switch and is removed after the next paint, so the page changes theme in one frame instead of smearing.
FAIL if the toggle flips the theme while the global transition rule still animates every color.
