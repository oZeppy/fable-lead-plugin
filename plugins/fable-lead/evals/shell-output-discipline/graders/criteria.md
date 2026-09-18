---
type: llm
weight: 1
---

Pass only if every command keeps its output small: counting with grep -c or wc -l, aggregating with sort | uniq -c | sort -rn | head, and tail for the ending — and nothing prints the whole file or an unbounded match list to the terminal (no bare `cat log`, no `grep ERROR log` without -c/head/redirect). Redirecting a large result to a file and then querying the file also passes.
