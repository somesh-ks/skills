---
type: llm
---

PASS if it says Android 14 scales font sizes non-linearly, so large text such as the 34sp and 57sp styles grows by much less than 2x (well under 68sp and 114sp), while small body text grows close to 2x, and that layouts must not assume uniform scaling.
FAIL if it says the headline and hero number double to about 68sp and 114sp.
