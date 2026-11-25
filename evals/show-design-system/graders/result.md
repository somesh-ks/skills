---
type: llm
---

PASS if the reply gives a someshks.com/spring/view link (or tells the user to drop a saved JSON file on that page) AND mentions the raw `#ff0000` color with its file and line in components/banner.tsx (the `bg-blue-500` class is a bonus), AND does not say the system passes contrast overall.
FAIL if the reply has no viewer link or file, no raw color with a file:line, or presents the contrast check as a pass for the whole system.
