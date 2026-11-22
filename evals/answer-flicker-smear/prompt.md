---
name: answer-flicker-smear
tags: [answer, trigger]
plugins: [../../skills/interface-mechanics]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Two bugs in our web app, fix both. The hover highlight on our tab bar flickers off as the pointer crosses between tabs, which are spaced with gap-2. And when someone toggles dark mode, every colour animates at once and the page smears for a moment. There is no code to read; answer from this description.
