---
name: audit-nav
tags: [audit, trigger]
plugins: [../../skills/sk-interface-audit, ../../skills/interface-mechanics]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/sk-interface-audit These two files, then tell me what to fix first. They are the whole UI; there is nothing else to scan.

`src/components/nav.tsx`
```tsx
1  export function Nav({ items }) {
2    return (
3      <nav className="flex gap-2">
4        {items.map((i) => (
5          <a key={i.id} href={i.href} className="px-3 py-1 transition-all duration-500 hover:bg-zinc-100 focus:outline-none">
6            {i.label}
7          </a>
8        ))}
9      </nav>
10   );
11 }
```

`src/components/search.tsx`
```tsx
1  export function Search() {
2    return (
3      <div className="h-screen">
4        <input className="text-sm px-2 py-1" placeholder="Search" />
5        <button className="rounded px-3 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">Go</button>
6      </div>
7    );
8  }
```
