---
name: make-tokens
tags: [spring, make]
plugins: [../../skills/spring]
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write]
---

Make me a Tailwind v4 + shadcn theme from brand color #e11d48 with Geist, and give me a link to tune it. There is no existing code to read. The shell is read-only here, so save just the Tailwind theme file with your Write tool under $TMPDIR/tokens and tell me the path.
