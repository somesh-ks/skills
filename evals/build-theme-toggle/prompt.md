---
name: build-theme-toggle
tags: [build, proactive]
plugins: [../../skills/interface-mechanics]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a dark mode toggle button to the header of our Next.js app using next-themes. Our globals.css already has this rule so hover states feel smooth:

```css
* { transition: background-color 200ms, color 200ms, border-color 200ms; }
```

That rule and the header below are the only relevant code. Reply with the code changes and do not write files.

```tsx
export function Header() {
  return <header className="flex items-center justify-between p-4">Acme</header>;
}
```
