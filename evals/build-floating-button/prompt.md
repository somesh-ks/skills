---
name: build-floating-button
tags: [build, proactive]
plugins: [../../skills/design-eng]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a floating "Tune" button fixed to the bottom-right corner of our homepage; it opens a small settings panel. Near the bottom of the page there's an embedded game whose footer row has a FULLSCREEN button at its right end, and on phones the floating button would sit right on top of it. Make sure the floating button never gets in the way of the game's controls. The page below is the only relevant code. Reply with the code (React, TypeScript, Tailwind) and do not write files.

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4">
      <Hero />
      <Work />
      <section id="game"><Runner /><footer className="flex justify-between"><button>CHANGE CHARACTER</button><button>FULLSCREEN</button></footer></section>
      <Footer />
    </main>
  );
}
```
