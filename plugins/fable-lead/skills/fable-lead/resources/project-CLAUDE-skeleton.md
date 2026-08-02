# <Project name>

<One paragraph: what this is, where it runs, who owns it.>

The owner may run this across multiple Claude Code accounts/sessions — the
repo is the shared memory. Documentation here is load-bearing, not courtesy.

## Before reading anything: confirm you are looking at the present

`git fetch` + fast-forward; check open PRs and recent branches
(`gh pr list`, `git log --all --since='2 days'`). A dated filename in a doc
is a claim about the past — glob for the latest.

## What exists, and why you'd read it

- `docs/PROJECT_MEMORY.md` — Decisions / Corrections / Constraints. Items
  marked DECIDED were argued once; do not reopen without the owner.
- The latest execution/campaign log — where work stopped, with an
  IN-FLIGHT / NEXT / OWNER footer.

## Leave the next session able to continue

Record what was measured and the command that produced it, at every
milestone. Docs commit WITH the code they describe. Numbers never come from
memory — only from a query or file read in the current session.

## Constraints

<Each entry exists because of a specific incident — name it. Examples of
shape: "Suites before every commit, exit codes checked directly"; "X is
owner-run"; "never print credential Y". Delete this comment; add real ones
as incidents occur.>
