# Working system v3 (all projects) — head model, agents, verification, record-keeping

Source of truth: the `fable-lead` plugin, `resources/global-CLAUDE.md`
(v3.0.0, 2026-09-18). Every other copy — this file in `~/.claude/`, the
portable doc in a project — is regenerated from it, never hand-edited: v2
drifted because there were four hand-edited copies.
Project CLAUDE.md files override this where they conflict.

## Confirm you are looking at the present

Sessions run in parallel and ship. Before trusting any doc or concluding work
does not exist: `git fetch`, fast-forward, check open PRs and recent branches
(`gh pr list`, `git log --all --since='2 days'`). A dated filename in a doc is a
claim about the past — glob for the latest, never trust a hardcoded name.

## What costs quota (measured — optimise this, not the price list)

On a Max plan the usage meters charge for tokens WRITTEN — uncached input,
cache writes, output — weighted by tier (Fable 2 : Opus 1 : Sonnet 0.4 :
Haiku 0.2), and do not charge cache reads at list price (MEASURED_IN_SAMPLE
2026-09-18, n=14+6 runs, two independent refuters; identified on Opus
traffic, Fable 5.1 untested). Re-reading a large cached context is close to
free; growing one is not. The head's context is the most expensive in the
system: it writes at the frontier rate AND the 1-hour cache TTL (8× a Sonnet
scout's write), and it was 44% of all quota, three quarters of that ingestion
(ESTIMATED component split). So:

- **The head reads conclusions, not material.** A read likely to exceed ~150
  lines, a search across more than a few files, a log trawl, or any long
  command output goes to a `scout`, which writes the detail to a file and
  returns a short answer with `file:line` pointers. Redirect big outputs to a
  file and print the summary.
- **Read the decisive lines yourself** before acting on anything a scout or
  finder reports — ten lines at the pointer, not the file.
- **Hand-backs are ingested at the head's rate too**: subagents return the
  conclusion (≤ ~400 words) and the path of the full report.
- Spawning is cheap (spawn preamble ≈ 8% of subagent quota, MEASURED); do
  not merge unrelated tasks into one long agent to "save" on it.

## Roles and allocation (calibrated 2026-09-18 against claude-fable-5-1, claude-opus-5, claude-sonnet-5, claude-haiku-4-5)

Subagents are **named deliberately**, never inherited: inheritance bills
every stage at the head's rate and silently follows a session-level
`/effort`. Tier by two questions — do this role's misses ship, and are this
model's errors independent across votes — not by "bulk vs head".

| role | model / effort | use for | status |
|---|---|---|---|
| head | session model (`fable` today) | judgment, decisions, the owner | — |
| `scout` | sonnet / medium | the head's reading delegate: locate, read, summarise | new in v3; low blast radius because the head re-reads the decisive lines |
| `sub` (finder) | opus / high | bulk search, measurement, dataset building — recall matters and no verifier can restore a miss | unchanged until tier-ab-004 Part B measures Sonnet's recall |
| `chk` (verifier) | **sonnet / high** | refutation; its misses ship | MEASURED 2026-09-18, on live trial to 2026-10-02 — tag the ledger `chk=sonnet-5/high` |
| `lead` | fable / xhigh (synthesis), max (vote splits) | synthesis that ships verbatim; verification that turns on novel reasoning; split escalation | unchanged — effort above high is unmeasured for these, and they are rare |
| mechanical | sonnet / low | edits a test or compiler makes loud when wrong | — |

**Haiku is barred from any role whose output ships or gates a decision**
(MEASURED: 26/32 as a verifier, and on 2 of its 4 wrong claims BOTH votes were
wrong, agreed, and carried confidence 4–5 — it defeats the vote-split safety
net; it was not cheaper than Sonnet either, 20.6 turns vs 8.2).

```js
const scout = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'medium', ...o })
const sub   = (p, o = {}) => agent(p, { model: 'opus',   effort: 'high',   ...o })
const chk   = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'high',   ...o })
const lead  = (p, o = {}) => agent(p, { model: 'fable',  effort: 'xhigh',  ...o })
```

Calibration record. 003 (2026-08-12, n=16 adjudicated claims × 3 arms × 2
blind votes): opus/high 32/32 at the lowest cost; xhigh bought +38% tool
calls and +75% output for a worse score. 004 (2026-09-18, same 16 claims
re-adjudicated, 4 arms × 2 votes, 128 agents): opus-5/high 32/32;
**sonnet-5/high 32/32, zero flips, −66% quota per verdict, ~half the
wall-clock**; fable-5.1/medium 32/32, fastest, +37% quota; haiku 26/32.
CEILING: three arms were perfect, so this set cannot rank them (Wilson lower
bound 89%) — harder boundary claims are owed before the trial ends. Extra
rigor comes from VOTES, not effort: ship-critical claims get TWO independent
`chk` votes; a v1≠v2 split escalates to `lead` at effort max (003:
disagreement flagged 2/2 errors; agreement was 46/46 correct; wrong verdicts
carried confidence 4–5, so confidence is NOT a signal — disagreement is, and
only for models whose errors are independent).

**Calibration is a component, not an event.** The table names the model ids
it was measured against. When a transcript shows a role being served by a
different id — a release, an alias that moved — the row is stale: rerun the
tier A/B (`~/.claude/experiments/tier-ab-004/`, ~5M tokens, ~8 min) before
trusting it. That is how v2 went out of date.

Before running: every `agent(` call goes through a wrapper or names BOTH a
model and an effort. That grep is the entire enforcement mechanism. Agent-tool
calls have no effort field — use the plugin's agent types (`fable-lead:scout`
/ `finder` / `verifier` / `synthesizer`), which pin both. Name the config that
RAN in every catch-ledger `--task` so per-config quality accumulates passively.

Inheriting (omitting `model`) is the tool's capability-safe default and never a
violation — it is simply not this system's choice. Prompting for capable
models: describe the outcome, the constraints, and the evidence standard — not
the steps. Step-enumeration tuned for smaller models measurably degrades the
capable ones.

## When to orchestrate — route by the goal of the pass (measured)

Orchestration buys COVERAGE, not correctness. Shadow-runs 001–002
(MEASURED_IN_SAMPLE, n=2 domains — a lean, not a law): on neutral ground the
orchestrated arm cost 3.8× the tokens for 1.9× the severity-weighted yield,
both arms shipped zero false claims, solo was better calibrated on its top
findings, and the union out-found either arm in both runs. Default to solo;
escalate deliberately:

- **Orchestrate** (finder fleet + refuter stage) when the pass is
  coverage-shaped: audits, "find everything", unknown-size discovery, an
  unfamiliar or many-surface target, or when one miss costs more than the
  token premium.
- **Stay solo** (head + scouts + one verifier pass) when the pass is
  precision-shaped: the top defects, a known surface, a targeted fix or
  question, or cost-per-finding matters.
- **Escalate on thinness**: a solo pass returning thin results on a surface
  believed rich is a coverage failure signal — rerun orchestrated. The
  reverse holds too: an orchestrated pass whose findings need ranking, not
  more eyes, hands to the head.
- Never orchestrate to re-verify a precise finding — one refuter with tools
  beats a fleet re-reading.
- **Route by quota too**: when the active account's binding window has under
  ~25% headroom, shrink the fleet and take one vote on claims that are not
  ship-critical — and say so in the report. A run that dies at the limit
  verifies nothing.

## Verification doctrine

Verification quality is bounded by **evidence access, not model capability** —
real catches come from re-deriving, not re-reading. So:

- Verifiers are **refuters**, with tools: "try to refute this; if it does not
  reproduce, drop it." Agents asked merely to check catch far less.
- **Claim phrasing decides boundary verdicts** (measured three times: 001
  .orig, 003 C03/C07, the 2026-09-18 meter claim): state PRESENT defects as
  present, LATENT hazards as hazards, and keep a claim's premise separate from
  its consequence — refuters legitimately kill a true premise wearing an
  overstated consequence, and legitimately pass a basis while failing its
  decimal places.
- Every claim carries an **evidence class**: `MEASURED_OOS` /
  `MEASURED_IN_SAMPLE` / `CITED` / `ESTIMATED` / `SPECULATIVE`. In-sample
  results dressed as out-of-sample is the single most flattering, most
  survivable error.
- **The command, not the claim**: every number names the query, `file:line`, or
  URL that produced it. That is what makes refutation possible.
- **n and a confidence interval, demanded up front.** n=15 is not a finding.
  A perfect score is a ceiling, not a ranking — report the interval's lower
  bound.
- A statistic from a report is a claim until re-run. Documents do not remove
  themselves when they become wrong — keep a Corrections section that names
  what the repo still asserts falsely.
- Market/vendor research fabricates: any output naming companies or prices
  needs a verifier that fetches every one.
- Third-party code headed for a credential path, a daemon, or anything that
  runs unattended gets an adversarial read of the diff before it is carried —
  "applies clean and tests pass" is not a security review.
- Every verification pass lands in the catch ledger — `catch-ledger add
  --task ... --claims-in N --refuted N --confirmed N` (reversals via
  `catch-ledger reverse`; `catch-ledger report` for rates). A catch without
  a denominator is an anecdote.

## The record

Whoever picks the work up next — another account, another model, the owner
weeks later — has only what is committed. Every session leaves:

- **What was measured, and the command that produced it** (an execution log or
  equivalent, appended at every milestone, ending with an
  IN-FLIGHT / NEXT / OWNER footer).
- **A memory file of Decisions / Corrections / Constraints** — things a query
  cannot rediscover. Not book state, not row counts: those go stale and crowd
  out what matters.
- Docs in the same commit as the code they describe. If deliverable paths are
  gitignored, `git add -f` them.

## Standing quality gates

- Run the project's test suites before every commit and check exit codes
  directly — piping to `tail`/`grep` masks failures.
- Merge only what is verified: suites green, CI green, adversarial pass done
  (or docs-only). If merging deploys, treat the merge gate as the deploy gate.
- Numbers never come from memory — only from a query or file read in the
  current session.
