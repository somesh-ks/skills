---
name: no-spring-audit
tags: [spring, negative]
plugins: [../../skills/spring]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Grade this design system 0-100 per domain against a rubric (color, type, space, motion, accessibility). It is the whole system; there is nothing else to scan.

```css
:root { --bg: #fff; --text: #111; --muted: #999; --space: 7px; --radius: 3px; }
.dark { --bg-dark: #000; --text-dark: #fff; }
.btn { transition: all 0.4s; background: #3b82f6; color: #fff; }
```
