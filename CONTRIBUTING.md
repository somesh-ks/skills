# Contributing

Thanks for helping. This repo holds skills that people install into their agents, so every change is reviewed by the owner before it ships.

## Issues welcome

The most useful contribution is an issue:

- A technique that is wrong, outdated, or missing a browser caveat
- A broken **Support** line or **Source** link
- A task where the skill did not trigger, or loaded the wrong reference

Include the browser and version, or the agent and prompt, so it can be reproduced.

## Pull requests

Small fixes (typos, a dead link, a corrected support version) are welcome as pull requests. For anything larger, such as a new technique or reference file, open an issue first so we can agree on scope.

Every technique needs:

- Working code
- A **Support** line checked against MDN or caniuse
- A **Source** link to a primary source: the spec, MDN, a browser vendor, or a named author's article. No social media posts and no other skill repos.
- In `design-craft`, a tacit value with no published source may cite `Mechanism:` (the reason, in one line) or `Measurement:` (what was measured, where, and the result) instead of a link.

All pull requests are reviewed by [@somesh-ks](https://github.com/somesh-ks). CI runs only after approval for outside contributors. Not every pull request will be merged; the skill stays small on purpose.

## License

By contributing you agree that your work is licensed under the [MIT License](LICENSE).
