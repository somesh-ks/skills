# Skills

Agent skills for design engineering. They follow the open [Agent Skills](https://agentskills.io) format, so they work in Claude Code, Cursor, Codex, Gemini CLI, and other agents that read `SKILL.md`.

## interface-mechanics

Verified CSS, DOM, motion, performance, and accessibility mechanics. About 100 techniques, each with working code, a **Support** line (browser versions, checked against MDN) and a **Source** link. The skill is a router: one small table points the agent at the one reference file it needs, so a task loads a few kilobytes, not the whole library.

It covers the details agents usually get wrong:

- Hover that flickers across the `gap` between tabs, and clicks that land on nothing
- Buttons and toolbars that change size when a spinner, icon, or label swaps in
- Tooltips clipped at the viewport edge, fixed with anchor positioning and fallbacks
- Dark mode toggles that smear every color, and theme switches that reveal from the click point
- Animating to `height: auto`, `@starting-style` entry and exit, view transitions, FLIP
- `inert` with focus restore, focus rings on any background, reduced motion, forced colors
- Native mobile feel: `touch-action`, `dvh`, safe areas, input zoom

### Install

Any agent, with the [skills CLI](https://github.com/vercel-labs/skills) (Node 22.20 or later):

```bash
npx skills add somesh-ks/skills --skill interface-mechanics
```

Add `-g` to install for every project, or `-a claude-code` to target one agent.

Claude Code, as a plugin:

```
/plugin marketplace add somesh-ks/skills
/plugin install interface-mechanics@somesh-ks
```

Manually: copy `skills/interface-mechanics` into `~/.claude/skills/` (or your agent's skills folder).

### Update

Skills CLI: `npx skills update interface-mechanics`. Claude Code plugin: `/plugin marketplace update somesh-ks`.

### Use

It triggers on its own when a task touches one of its techniques. You can also call it directly:

```
/interface-mechanics the tab bar hover flickers between tabs and the dark mode toggle smears
```

Installed as a Claude Code plugin, the command is namespaced: `/interface-mechanics:interface-mechanics`.

Answers include the Support and Source lines under each snippet, so you can check them. Support was verified on 2026-09-10; the skill tells the agent to re-check MDN once that date is more than six months old.

### Tokens

The skill uses your project's easing, duration, and radius tokens. If the project has none, it falls back to the defaults in [`SKILL.md`](skills/interface-mechanics/SKILL.md#default-tokens).

## Credits

Techniques cite their sources inline: MDN, web.dev, Chrome for Developers, W3C, WebKit, and the articles linked from each entry. Thanks to their authors.

## License

[MIT](LICENSE)
