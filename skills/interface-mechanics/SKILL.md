---
name: interface-mechanics
description: "Renamed to design-eng. Run /interface-mechanics only to learn the new name and install command."
disable-model-invocation: true
license: MIT
metadata:
  internal: true
  author: somesh-ks
  version: "2.0.0"
---

# Renamed: design-eng

This skill is now `design-eng`. Same content, new name. Tell the user to install it and remove this one:

```bash
npx skills add somesh-ks/skills
```

Claude Code plugin users run `/plugin marketplace update somesh-ks`; the plugin keeps the name `interface-mechanics`.

If `design-eng` is already installed, load it now and continue the task with it.
