---
name: spring
description: "Shows a repo's design system as a visual page and generates a new one with exact color and type math, using Spring's offline script. Reads CSS custom properties per theme (light, dark, Tailwind v4 @theme, shadcn), DTCG or Style Dictionary JSON, Tailwind v3 configs and DESIGN.md; counts token use, unused tokens, raw color literals and off-system Tailwind classes with path:line; computes contrast of named text and background pairs. Builds OKLCH scales and contrast-checked roles from one brand color, exported as CSS variables, DTCG tokens.json, a Tailwind v4 theme, DESIGN.md and an agent skill. Use when asked to show, visualize, map, extract or explain the colors, type and tokens a project uses, to make a palette, tokens or theme from a brand color, or to rebuild a messy system cleanly. Not for scoring a design system against a rubric (use sk-design-sys) or for UI code mechanics (use design-eng)."
license: MIT
metadata:
  author: somesh-ks
  version: "1.0.0"
---

# Spring

`scripts/spring.mjs` is Spring's engine as one Node 18+ script with no dependencies. It reads files and prints; it sends nothing over the network. The web app is https://someshks.com/spring/app and the viewer is https://someshks.com/spring/view.

Run it with the path to this skill, for example `node <skill-dir>/scripts/spring.mjs scan .`.

## Show a repo's design system

1. Run `node <skill-dir>/scripts/spring.mjs scan <repo>`. Add `--json` to read the full token map and findings yourself, or `--open` to open the View link in the user's browser.
2. Give the user the `View:` link. It opens a page with every color per theme, contrast pairs, type, space, radius, shadows and usage. The tokens travel in the link's `#` fragment, so the page's server never receives them. When the link would be too long, the script saves a JSON file instead: tell the user to open /spring/view and drop that file on it.
3. If you have a browser tool or Playwright, open the link and take a screenshot to check it rendered and to show it in the reply.
4. Report the facts the summary printed, briefly: sources, themes, token counts, pairs under 4.5:1, never-referenced tokens, color literals and off-system classes with their `path:line`, and the findings (each fail or warning, and how many checks pass). They are counts, not a grade: never invent one. Say what the script could not read (its `Note:` lines), such as a Tailwind config that uses code.

Read the token files yourself only to answer a question the summary doesn't cover. Never invent a value the script didn't print.

## Make a design system

1. Write `spring.json` (schema: `node <skill-dir>/scripts/spring.mjs schema`), or pass flags. The usual inputs are a brand color, a font and a name:
   `node <skill-dir>/scripts/spring.mjs build --primary "#e11d48" --font "Geist" --name Acme --out <dir>`
2. It writes `tokens.css`, `tokens.json` (DTCG), `theme.css` (Tailwind v4, with shadcn's variable names), `DESIGN.md`, `skills/<name>-design-system/SKILL.md`, `AGENTS.md`, `palette.js` and `spring.json`. `--only tokens.css,theme.css` writes a subset; `--print tokens.css` prints one file; if the shell can't write to `--out`, print each file and save it with your file-writing tool.
3. Use the files as written. Don't round, re-derive or hand-tune the colors: the script already picked steps that meet the contrast target (`--contrast aa|aaa|apca`), and it prints any pair that misses.
4. Give the user the `Edit:` link so they can tune it by eye in Spring. If they send back a spring.json exported from Spring, run `build` on that file.

## Rebuild a messy system

1. `node <skill-dir>/scripts/spring.mjs infer <repo> --out spring.json` writes the closest Spring input to the current system: brand color, grays, fonts, base size, ratio and radius. It's a starting point, not a conversion.
2. Show the user the scan's `View:` link next to the new system's `Edit:` link from `build spring.json`.
3. After they agree, replace the old token file and migrate references. Use the scan's `path:line` lists for the raw literals and off-system classes to change.
