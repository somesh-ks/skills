---
name: audit-theme-pairs
tags: [audit, color]
plugins: [../../skills/sk-design-eng, ../../skills/design-eng]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/sk-design-eng These two files. They are the whole UI; there is nothing else to scan.

`src/app/globals.css`
```css
@import "tailwindcss";
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --muted: #f5f5f5;
}
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #fafafa;
  --muted: #262626;
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
}
```

`src/components/toolbar.tsx`
```tsx
export function Toolbar({ onExport }: { onExport: () => void }) {
  return (
    <div className="flex items-center justify-between bg-background px-4 py-2">
      <span className="bg-muted text-black px-2 text-xs">Draft</span>
      <button onClick={onExport} className="h-9 px-4 bg-primary text-primary-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2">Export</button>
      <button className="h-9 px-4 bg-[#635bff] text-white focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2">Upgrade</button>
    </div>
  );
}
```
