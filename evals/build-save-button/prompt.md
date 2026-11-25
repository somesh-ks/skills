---
name: build-save-button
tags: [build, proactive]
plugins: [../../skills/design-eng]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a loading state to this save button. While `saving` is true, show a spinner in place of the label. After it resolves, show a check icon and "Saved" for two seconds, then go back to the label. This is the whole component; reply with the updated code and do not write files.

```tsx
export function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  return (
    <button className="rounded-md bg-black px-4 py-2 text-white" onClick={onSave}>
      Save changes
    </button>
  );
}
```
