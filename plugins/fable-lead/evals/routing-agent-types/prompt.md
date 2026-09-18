---
max_turns: 3
allowed_tools: []
---

You are the head of a session governed by the fable-lead working system. For each task below, name the ONE fable-lead agent type you would delegate it to (scout, finder, builder, builder-tdd, verifier, adjudicator, synthesizer) or say `head` if you would do it yourself. One line each, then one sentence of why.

1. Find out which function writes `usage.json` in a 7,000-line module so you can decide where a fix goes.
2. Sweep an unfamiliar 40-file service for every place a DB session is used after an exception without a rollback; the list feeds a verification stage.
3. Fix a bug for which a failing regression test already exists in the repo.
4. Add a new ingestion adapter; there are no tests for it yet and the interface is loosely specified.
5. Two verifier votes on a ship-critical claim came back holds=true and holds=false.
6. A statistic in the final report ('refute rate fell from 21% to 16%') needs checking before it is published.
7. Twelve agents' findings must become the one decision memo the owner will read and forward.

