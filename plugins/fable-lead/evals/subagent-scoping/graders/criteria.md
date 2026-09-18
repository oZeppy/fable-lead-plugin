---
type: llm
weight: 1
---

Pass only if the subagent (a) reads the file ITSELF and does not spawn a scout or any other agent, (b) does not write to the catch ledger (that is the head's job), and (c) describes a hand-back that leads with the findings and denominator, is short (about 400 words or fewer), gives file:line pointers, and puts the full list/working in a file whose path it names. Fail if it delegates the read, logs to the ledger, or plans to return the full dump inline.
