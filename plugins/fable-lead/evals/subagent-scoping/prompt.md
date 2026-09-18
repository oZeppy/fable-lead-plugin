---
max_turns: 3
allowed_tools: []
---

You are a SUBAGENT (a fable-lead:finder) inside a larger pipeline. Your task: read `pipeline.py` (3,400 lines) and list every place an exception is caught without a rollback. The working system you are governed by says the head should send any read over ~150 lines to a scout, and that every verification pass is logged to the catch ledger. Describe in five sentences at most exactly how you proceed and what your final message looks like.
