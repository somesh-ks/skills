---
name: sk-design-sys
description: "Audits a design system against an 18-domain rubric (color, type, space, shape, elevation, motion, icons, layout, states, accessibility, content, themes, tokens, density, platform conventions, data viz, internationalization, governance) and scores each domain with evidence, or builds a starter system from the same rubric. Each finding names the design-sys value that fixes it. Run it as /sk-design-sys audit on tokens, a theme file, a DESIGN.md or a component folder, or /sk-design-sys build for a new system."
disable-model-invocation: true
license: MIT
metadata:
  author: somesh-ks
  version: "1.0.0"
---

# Design system audit and build

Scores a design system domain by domain, or drafts one. It never edits files in audit mode unless the user picks a fix. The values come from the `design-sys` skill; this skill only checks and assembles.

Needs `design-sys` installed beside it, and `design-eng` for the CSS. If either is missing, still report, name the fix in words, and say which skill holds the value.

## Mode

| Mode | When | Use |
| --- | --- | --- |
| audit (default) | The user names tokens, a theme, a DESIGN.md, a Figma export or a component folder | The audit procedure below |
| build | The user adds `build`, or there is no system yet | The build procedure below |

## Audit

1. **Scope.** Read what the user named. With no scope, look for token files (`*.tokens.json`, `tokens/`), the CSS entry or theme file, `DESIGN.md`, and the component folder. Skip build output and vendored code. Nothing found: say so and offer `build`.
2. **Profile.** Note the platforms (web, iOS, Android), the styling system, the token format, and which modes exist (light, dark, increased contrast, density).
3. **Check.** Load `references/rubric.md` and work through every domain in order. Before judging a check that has a Fix pointer, open that `design-sys` reference section and judge against its value, not the rubric line alone. For each check, find the evidence (`path:line`, a token name, or "not found"). A check with no evidence is Missing, not Pass.
4. **Score** each domain: **Pass** (every check met), **Partial** (some), **Missing** (none, or the domain is absent). Mark a domain **N/A** only when the product cannot need it (no charts, no second language), and say why.
5. **Report** in the format below. Lead with the three findings that would most change what users see.

### Report

```markdown
# Design system audit: <scope>

<date> · <platforms> · <styling> · <token format> · modes: <list>

## Scorecard

| Domain | Score | Evidence |
| --- | --- | --- |
| Color | Partial | `tokens/color.json:12` one hue in two roles |

<Pass count> pass · <Partial count> partial · <Missing count> missing

## Fix first

1. <domain> · <what users see> · fix: <design-sys file>.md › <section>

## All findings

### <Domain>
- `path:line` · <check> · <what is wrong> · fix: <file>.md › <section>

## Not checked

<anything out of reach, such as Figma files or native code>
```

Every domain appears in the scorecard, even N/A. All findings lists only checks that fail: a met check goes in the scorecard evidence, not here. Give each domain with a failure its own heading, in rubric order, and never merge domains under one heading. Every line follows the finding format, starting with `path:line`, a token name, or `not found`. A check with no Fix pointer in the rubric gets `fix: <what to change> · principle` instead of a file pointer, so the reader knows no design-sys value backs it. Offer fixes as one batch per domain, and apply a batch only when the user picks it.

## Build

1. **Ask once**, in one message: platforms, brand color (or none), primary typeface (or the system font), density (one or several), and which modes ship. Take defaults for anything unanswered: web plus the system font, one density, light and dark.
2. **Draft** the system domain by domain in rubric order, taking each value from `design-sys` and each mechanism from `design-eng`. Write tokens in three tiers: primitives (raw scales), semantic roles (`text-primary`, `surface-raised`, `border-subtle`), and component tokens only where a component needs its own.
3. **Write** the tokens in the project's format: CSS custom properties by default, DTCG JSON when the project has token tooling. Put every mode in the same file.
4. **Self-audit.** Run the audit procedure on the draft and fix anything below Pass that the brief covers. Report the scorecard with the draft.

## Rules

- A value in this skill's output comes from `design-sys` with its Source, from the project's own tokens, or from the user. Never invent a number to fill a gap; leave it Missing and say what would set it.
- Governance and content are checked from docs and copy, not code. Say so when neither is in scope.
