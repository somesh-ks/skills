---
name: answer-money-decimals
tags: [answer, trigger]
plugins: [../../skills/design-eng]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our checkout stores prices as integer minor units (cents) and shows them with `(cents / 100).toFixed(2)` plus the currency symbol. We are adding JPY and KWD. Write the formatting helper in JavaScript. Reply with the code and two lines of explanation; do not write files.
