---
name: audit-modernize
tags: [audit, modernize]
plugins: [../../skills/sk-interface-audit, ../../skills/interface-mechanics]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/sk-interface-audit modernize these three files. They are the whole UI; there is nothing else to scan, and there is no browserslist.

`src/Tooltip.tsx`
```tsx
1  import { useLayoutEffect, useRef, useState } from 'react';
2  export function Tooltip({ anchor, children }) {
3    const tip = useRef(null);
4    const [pos, setPos] = useState({ top: 0, left: 0 });
5    useLayoutEffect(() => {
6      const r = anchor.current.getBoundingClientRect();
7      setPos({ top: r.bottom + 8, left: r.left });
8    }, [anchor]);
9    return <div ref={tip} role="tooltip" style={{ position: 'fixed', ...pos }}>{children}</div>;
10 }
```

`src/Collapse.tsx`
```tsx
1  import { useEffect, useRef, useState } from 'react';
2  export function Collapse({ open, children }) {
3    const inner = useRef(null);
4    const [h, setH] = useState(0);
5    useEffect(() => { setH(open ? inner.current.scrollHeight : 0); }, [open]);
6    return <div style={{ height: h, overflow: 'hidden', transition: 'height 250ms' }}><div ref={inner}>{children}</div></div>;
7  }
```

`src/Notes.tsx`
```tsx
1  import TextareaAutosize from 'react-textarea-autosize';
2  export function Notes() {
3    return <TextareaAutosize minRows={2} className="w-full rounded border p-2" />;
4  }
```
