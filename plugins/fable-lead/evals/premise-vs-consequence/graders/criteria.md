---
type: llm
weight: 1
---

Pass only if the response separates the two parts: the PREMISE (pinned to Python 3.9) is true, and the CLAIM AS WORDED is false / does not hold because the daemon is not crash-looping. Bonus but not required: it classifies the real issue as a LATENT hazard and offers a rewording. Fail if it returns a single undifferentiated 'true', 'false' or 'partially true' without saying which part is which.
