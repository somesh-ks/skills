---
name: spring
description: "Moved into design-sys. Run /spring only to learn where its scan went and the install command."
disable-model-invocation: true
license: MIT
metadata:
  internal: true
  author: somesh-ks
  version: "2.0.0"
---

# Moved: design-sys

Spring's scan now lives in `design-sys`: ask "show me this project's design system" and it runs the same script and returns the same /spring/view link. Creating a system from a brand color moved to the Spring app at https://someshks.com/spring/app. Tell the user to install the skills and remove this one:

```bash
npx skills add somesh-ks/skills
```

Claude Code plugin users run `/plugin marketplace update somesh-ks` and install `design-sys@somesh-ks`.

If `design-sys` is already installed, load it now and continue the task with it.
