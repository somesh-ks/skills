# Skills

Agent skills for design engineering. They follow the open [Agent Skills](https://agentskills.io) format, so they work in Claude Code, Cursor, Codex, Gemini CLI, and other agents that read `SKILL.md`.

Four skills in two pairs. The model loads `design-eng` and `design-sys` on its own when a task needs them; you run `sk-design-eng` and `sk-design-sys` yourself.

| Skill | Invoked by | What it does |
| --- | --- | --- |
| `design-eng` | the model | CSS, DOM, motion and accessibility mechanics with working code |
| `design-sys` | the model | Platform-neutral design system values with the reason and a source, and a scan that shows a repo's tokens as a page |
| `sk-design-eng` | you | Audits UI code for the traps `design-eng` fixes |
| `sk-design-sys` | you | Scores a design system against an 18-domain rubric, or builds one |

Renamed on 2026-11-23: `interface-mechanics` is now `design-eng`, and `sk-interface-audit` is now `sk-design-eng`. The old names stay as stubs that point to the new ones, and the Claude Code plugin keeps the name `interface-mechanics` so existing installs update in place. On 2026-11-25 `spring` folded into `design-sys` (its scan) and the [Spring app](https://someshks.com/spring/app) (creating a system); `spring` stays as a stub.

## design-eng

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
npx skills add somesh-ks/skills --skill design-eng --skill sk-design-eng
```

Add `-g` to install for every project, or `-a claude-code` to target one agent.

Claude Code, as a plugin:

```
/plugin marketplace add somesh-ks/skills
/plugin install interface-mechanics@somesh-ks
```

Manually: copy `skills/design-eng` and `skills/sk-design-eng` into `~/.claude/skills/` (or your agent's skills folder).

### Update

Skills CLI: `npx skills update design-eng`. Claude Code plugin: `/plugin marketplace update somesh-ks`. If you installed the old names with the skills CLI, add the new ones with the install line above and remove `interface-mechanics` and `sk-interface-audit`.

### Use

It works in two modes:

- **Build.** When an agent writes UI with overlays, tabs, toggles, loading buttons, drag, theme switching, or transitions, the skill loads on its own and checks the traps agents ship most often: hover dead zones, buttons that change size, theme smears, pop-outs with no exit, clipped tooltips, `100vh` and iOS input zoom. The reply ends with a short **Mechanics** list of what it fixed.
- **Answer.** Name a problem ("the hover flickers between tabs") and it loads the one reference that fixes it.

You can also call it directly:

```
/design-eng the tab bar hover flickers between tabs and the dark mode toggle smears
```

Installed as a Claude Code plugin, the command is namespaced: `/interface-mechanics:design-eng`.

Answers include the Support and Source lines under each snippet, so you can check them. Support was verified on 2026-09-10; the skill tells the agent to re-check MDN once that date is more than six months old.

### Audit

`sk-design-eng` is a separate skill you run yourself; the model never starts it on its own:

```
/sk-design-eng src/components
```

It scans for 44 signals, including 8 for multilingual and right-to-left apps, confirms each by reading the code, and reports `path:line · severity · signal · what breaks · fix`, High first, with the Support and Source for each technique. It finds and grades; the fixes come from `design-eng`, so install both. It does not edit code until you pick a fix batch. As a Claude Code plugin: `/interface-mechanics:sk-design-eng`.

Add `modernize` to find script and dependencies the platform now replaces: JS tooltip positioning, exit animations, measured height, textarea autosize, focus traps, and more. Each finding is graded Now, Enhance, or Wait from its browser support, and says what it removes:

```
/sk-design-eng modernize src
```

### Tokens

The skill uses your project's easing, duration, and radius tokens. If the project has none, it falls back to the defaults in [`SKILL.md`](skills/design-eng/SKILL.md#default-tokens).

## design-sys

Platform-neutral design system values for web, iOS, Android and Figma, each with the reason and a **Source**. 50 values in eight small reference files, loaded one at a time. Most come from Apple's Human Interface Guidelines, Material, WCAG and the Design Tokens format. Others are tacit, and they cite the mechanism or a measurement in place of a link.

It covers the numbers agents usually guess:

- Hairlines are one device pixel: 0.33pt on a 3x iPhone. On the web, a fractional `border` rounds up to a full pixel (measured in Chromium), so the skill uses an inset shadow gated by resolution
- Default and minimum text sizes, target sizes and control spacing per platform, breakpoints, and room for translated labels
- Tracking by size, light weights only at display sizes, leading for text that wraps
- Color ramps and roles, status pills, increased contrast per appearance
- Token tiers, role names, modes, and the DTCG file format rules
- Component principles: prominent actions, shared control heights, disabled and busy states
- Dark mode elevation with lighter surface steps instead of shadows, with the arithmetic
- Icons that out-weigh their labels, badged glyph margins, optical overshoot

It gives the value and stops. The CSS that applies a value lives in `design-eng`.

**Show.** "Show me this project's design system" runs a zero-dependency Node script (Spring's scan) over CSS variables per theme, DTCG and Tailwind config. It returns a link to [someshks.com/spring/view](https://someshks.com/spring/view) with colors, contrast of named pairs, type, and `path:line` for raw colors and off-system classes. The tokens travel in the link's `#` fragment, not to a server. It counts and measures; it does not grade. To create a system from a brand color, use the [Spring app](https://someshks.com/spring/app).

```bash
npx skills add somesh-ks/skills --skill design-sys --skill sk-design-sys
```

Claude Code, as a plugin: `/plugin install design-sys@somesh-ks`.

### Audit and build

`sk-design-sys` scores a design system against an 18-domain rubric (color, type, space, shape, elevation, motion, icons, layout, states, accessibility, content, themes, tokens, density, platform conventions, data viz, internationalization, governance). Each domain gets Pass, Partial, Missing or N/A with evidence, and each finding names the `design-sys` section that fixes it:

```
/sk-design-sys tokens/
/sk-design-sys build
```

`build` asks once for platforms, brand color, typeface, density and modes, drafts a three-tier token set, then audits its own draft.

## Evals

`evals/` holds a runnable suite for `claude plugin eval` (Claude Code): build, answer, and audit cases graded on what the skill adds, plus should-not-trigger cases near its boundary (palettes, copy, whether to animate). See [`evals/README.md`](evals/README.md).

## Credits

Techniques cite their sources inline: MDN, web.dev, Chrome for Developers, W3C, WebKit, and the articles linked from each entry. Thanks to their authors.

## License

[MIT](LICENSE)
