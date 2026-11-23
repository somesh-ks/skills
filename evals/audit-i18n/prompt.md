---
name: audit-i18n
tags: [audit, trigger, i18n]
plugins: [../../skills/sk-design-eng, ../../skills/design-eng]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/sk-design-eng This file. We ship in English, Arabic, Japanese and German. It is the whole UI; there is nothing else to scan.

`src/components/comment-box.tsx`
```tsx
import { t } from "../i18n";

export function CommentBox({ author, price, onSend }: { author: string; price: number; onSend: (s: string) => void }) {
  return (
    <div className="flex items-center gap-3 pl-4">
      <span className="text-xs uppercase tracking-widest text-muted">{t("tip")}</span>
      <p className="ml-2">{t("replyingTo")} {author}</p>
      <span className="w-20 truncate">${(price / 100).toFixed(2)}</span>
      <textarea
        className="h-8 overflow-hidden leading-4"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
}
```
