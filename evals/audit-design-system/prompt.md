---
name: audit-design-system
tags: [audit]
plugins: [../../skills/sk-design-sys, ../../skills/design-sys]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

/sk-design-sys audit this theme file. It is the whole design system; there is nothing else to scan.

```css
/* theme.css */
:root {
  --gray-500: #6b7280;
  --blue-500: #3b82f6;
  --bg: #ffffff;
  --card: #ffffff;
  --text: #111827;
  --muted: var(--gray-500);
  --border: 1px solid #e5e7eb;
  --font-body: 15px;
  --weight-caption: 300;
  --caption: 12px;
}
.dark {
  --bg-dark: #000000;
  --card-dark: #000000;
  --text-dark: #ffffff;
}
.card { background: var(--card); box-shadow: 0 4px 12px rgb(0 0 0 / .3); }
.dark .card { background: var(--card-dark); }
.badge { background: var(--blue-500); color: white; }
```
