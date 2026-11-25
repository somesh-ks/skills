---
type: llm
---

PASS if the reply gives a someshks.com/spring/view link (or tells the user to drop a saved JSON file on that page) AND names the low-contrast pair (muted-foreground on muted in the light theme) with a contrast ratio near 3 to 4.5:1, AND mentions the raw `#ff0000` color with its file and line in components/banner.tsx (the `bg-blue-500` class is a bonus).
FAIL if the reply has no viewer link or file, no low-contrast pair with a ratio, or no raw color with a file:line.
