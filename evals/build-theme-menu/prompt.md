---
name: build-theme-menu
tags: [build, proactive]
plugins: [../../skills/design-eng]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a theme menu with Light, Dark and System to our Next.js app using next-themes, and make the theme change feel polished with a short View Transition crossfade between the old and new look. Our ThemeProvider already uses `attribute="class"` and `enableSystem`. That is the only relevant code. Reply with the code (React, TypeScript) and do not write files.
