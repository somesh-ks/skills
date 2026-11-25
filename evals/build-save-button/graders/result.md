---
type: llm
---

PASS if the button keeps the same width and height in all three states (idle, saving, saved): every label and icon slot stays in the layout and only its visibility changes, or the box is sized by its largest state, and the spinner overlays the hidden label instead of replacing it.
FAIL if the code swaps elements with a conditional such as `{saving ? <Spinner /> : 'Save changes'}` or `{saved && <Check />}` and nothing holds the button's size.
