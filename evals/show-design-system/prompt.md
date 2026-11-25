---
name: show-design-system
tags: [spring, show]
plugins: [../../skills/spring]
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write]
---

Write these two files to a directory under $TMPDIR (the shell is read-only here; use your Write tool), then show me this project's design system. They are the whole project; there is nothing else to find.

```css
/* app/globals.css */
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #8a8a93;
  --accent: #f4f4f5;
  --destructive: #dc2626;
  --border: #e4e4e7;
  --ring: #2563eb;
  --radius: 0.5rem;
}
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #111113;
  --card-foreground: #fafafa;
  --primary: #3b82f6;
  --primary-foreground: #0a0a0a;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --destructive: #ef4444;
  --border: #27272a;
  --ring: #3b82f6;
}
```

```tsx
// components/banner.tsx
export function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-500 p-4 rounded-lg">
      <p className="text-muted-foreground bg-muted">{children}</p>
      <span style={{ color: "#ff0000" }}>Error</span>
    </div>
  );
}
```
