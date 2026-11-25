---
name: sk-design-eng
description: "Audits web UI code for broken interface mechanics: hover dead zones, buttons that change size, theme smears, missing exit animations, clipped tooltips, lost focus, 100vh and iOS input zoom, scroll jank, multilingual and right-to-left traps, and about 30 more signals. Reports path:line findings graded High, Medium, or Low, each with the design-eng technique that fixes it. A modernize lens instead finds script and dependencies the platform now replaces (JS positioning, exit animations, height measuring, autosize, focus traps), graded by browser support. Run it as /sk-design-eng on a file, a diff, a folder, or the project; add modernize for that lens."
disable-model-invocation: true
license: MIT
metadata:
  author: somesh-ks
  version: "2.0.0"
---

# Design engineering audit

Finds what is broken or missing in a UI's mechanics and says how bad each problem is. It never edits code unless the user picks a fix. The fixes live in the `design-eng` skill; this skill only finds and grades.

Needs `design-eng` installed beside it. If it is missing, still report the findings and name the fix in words, then say the skill gives the code with its Support and Source lines.

## Lens

| Lens | When | Use |
| --- | --- | --- |
| broken (default) | Find what is wrong | The procedure below |
| modernize | The user adds `modernize`, or asks to simplify or drop dependencies | The same procedure, with `references/modernize.md` for signals, readiness, and format in place of the signals, severity, and finding format below |

Run both only when the user asks for both, and report them in separate sections.

## Procedure

1. **Scope.** Audit what the user named: a file, a diff, a folder, or the project. With no scope, take the UI source under the current directory. Skip `node_modules`, build output (`dist`, `build`, `.next`, `out`), coverage, vendored code, and minified files. No UI source: say so and stop.
2. **Profile.** Read `package.json` and the CSS entry. Note the framework, the styling (Tailwind v4 imports `tailwindcss` in CSS), the motion library, and the primitives (Radix, Base UI, React Aria, native `<dialog>`). Primitives already solve some signals: a Radix dialog manages focus, Tailwind v4 `hover:` is already gated behind `(hover: hover)`.
3. **Scan.** Load `references/signals.md` and run the Look for column of each signal with `rg -n` (or `grep -rnE`). A hit is a lead, not a finding.
4. **Confirm.** Read about ten lines around each lead. Drop it when the code already handles the case, for example `outline-none` next to a `focus-visible:` ring. Signals marked *read* have no reliable pattern: open the components of that kind and check them by hand.
5. **Grade** each confirmed finding with the severity table.
6. **Report** in the format below. Report only what is wrong or missing; say nothing about what is fine. Zero findings is a valid result: say "No findings" and list what was checked.

## Severity

| Severity | Rule | Examples |
| --- | --- | --- |
| High | Someone is blocked or loses their place | Focus escapes a modal or vanishes on close, no visible focus, a label that disappears in one theme, content clipped or unreachable on a phone, a drag that drops when the pointer leaves, a large motion effect with no reduced-motion path |
| Medium | A visible glitch on a path people use | Hover flicker, a button that changes size, a theme smear, a pop-out with no exit, layout shift, jank while scrolling, iOS zoom on focus |
| Low | Cost or polish most people will not notice | A permanent `will-change`, duplicated dark colors, jittering digits on a secondary screen, a tap flash |

Raise a finding one level when it sits on the main path of the product (sign-up, checkout, the primary nav). Never raise above High.

## Finding format

One line per finding, grouped by severity, High first:

```
path:line · Severity · signal · what breaks, for whom · fix: <file>.md › <section>
```

- `path:line` is the first line of the problem. Several lines in one file for the same signal stay one finding: `src/nav.tsx:12,18,31`.
- Severity is the bare word High, Medium or Low. When a finding was raised for sitting on the main path, say so at the end of "what breaks" ("…, on the primary nav"), not beside the severity.
- "What breaks" names the effect a person sees, not the rule: "hover drops between tabs", not "uses gap".
- The fix is the pointer to the `design-eng` reference and section that holds the technique, plus at most a short code hint in parentheses; the line ends there. Load that file when you apply it. Under the findings, list each technique used once, with its Support and Source lines. When the signal's Fix column names no reference file, write that fix in words and end it with `· principle`, so the reader knows no `design-eng` section backs it.

## Report

```markdown
# Design engineering audit: <scope>

<date> · <framework>, <styling>, <motion library>, <primitives>

## Findings

### High
- `src/components/modal.tsx:14` · High · modal-focus · focus stays on the page behind the modal and is lost on close · fix: accessibility.md › Lock the background with inert and restore focus

### Medium
### Low

## Techniques

<each technique named above, with its Support and Source lines>

## Checked

<areas scanned; areas skipped and why>
```

Write "None" under an empty severity so reports line up when the user audits again. Offer the fixes as one batch per reference file, and apply a batch only when the user picks it.
