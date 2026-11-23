# Evals

Cases for `claude plugin eval`. Each case is a folder with `prompt.md` (the task, with any code inline and declared complete) and `graders/` (one pass condition per file).

| Cases | What they test |
| --- | --- |
| `build-*` | The skill loads on its own while building UI, and the code avoids the trap the skill names (dead zones, size jumps, theme smear, missing exit, clipping) |
| `answer-*` | A named problem gets the skill's fix |
| `audit-*` | `/sk-interface-audit` reports `path:line` findings with a severity, a signal and a fix, and a clean pattern is not flagged |
| `craft-*` | `design-craft` gives the platform value a model guesses wrong (hairline per density, per-platform type sizes, dark elevation) |
| `no-*` | The skill stays out of nearby tasks it does not own |

Every model-invoked case has a `skill-fired` grader (did the skill load; slash commands load without a Skill call, so audit cases grade the format instead) and a `result` grader on the outcome. Most also have `support-line`, because a browser support line plus a source is what a model without the skill rarely gives.

## Run

From the repo root:

```bash
# while editing: the touched case, 2 runs, no baseline
claude plugin eval . --case build-tab-bar --runs 2 --ablation none

# before a release: every case, 3 runs, with the no-skill baseline
claude plugin eval . --runs 3 -j 8
```

Results go to `evals/results/` (ignored by git). Each run is a real agent run on your account, so it costs money: the full suite is about $3.

## Add a case

1. Put the code in the prompt and say it is the whole input, so neither arm wanders off to look for files.
2. Pick a trap a model without the skill gets wrong. If both arms pass, the case measures nothing; replace it.
3. Write the `result` grader as one PASS and one FAIL sentence about the outcome, not the wording.
4. Copy `skill-fired.md` from another case. For a should-not-trigger case, copy `no-skill.md`.
