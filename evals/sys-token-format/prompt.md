---
name: sys-token-format
tags: [build, trigger]
plugins: [../../skills/design-sys]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a DTCG design tokens file for our spacing scale: 2px, 4px, 6px, 8px, 12px and 16px, named on a 4px base unit (so 6px is step 1.5), plus a semantic `gap.card` token that points at the 16px step. Reply with the JSON only; do not write files.
