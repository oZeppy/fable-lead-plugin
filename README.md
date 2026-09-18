# Fable Lead — a working system for Claude Code and Cowork

A plugin that turns any Claude session into a **Fable-led system**: the
expensive, capable model runs the head; bulk work is delegated deliberately to
pinned agents; verification means *refuting*, not checking; and every number
carries the command that produced it.

## What you get

- **`/fable-lead`** (also `/fable-lead:fable-lead`) — one command that
  bootstraps the system into the current session and project: verifies the
  working-doctrine files, scaffolds a lean project `CLAUDE.md` and a
  Decisions/Corrections/Constraints memory file if the project has none, and
  adopts the doctrine for the session. Never overwrites anything that exists.
- **Six agents with model + effort pinned** (calibrated 2026-09-18 against
  Fable 5.1 / Opus 5 / Sonnet 5; used automatically when the head delegates):
  - `fable-lead:scout` — the head's reading delegate: locate, read, summarise
    to a file, return pointers (Sonnet, medium)
  - `fable-lead:finder` — bulk search/measurement (Opus, high)
  - `fable-lead:builder` — delegated implementation, built and demonstrated
    (Opus, high) — use instead of `general-purpose`, which inherits effort
  - `fable-lead:builder-tdd` — implementation where failing tests define done
    (Sonnet, high — measured equal to Opus at 44% of the quota)
  - `fable-lead:verifier` — adversarial refutation, two votes on
    ship-critical claims (Sonnet, high — measured equal to Opus at a third of
    the quota)
  - `fable-lead:synthesizer` — the one head-class agent whose output ships
    verbatim (Fable, xhigh)
- **The doctrine** (bundled, installable to `~/.claude/CLAUDE.md`): staleness
  checks before trusting any doc, evidence classes on every claim, n and CIs
  demanded up front, suites-before-commit with exit codes checked directly.

## Install — Claude Code (CLI / desktop / web)

```
/plugin marketplace add oZeppy/fable-lead-plugin
/plugin install fable-lead@fable-lead
```

Then in any project: `/fable-lead`

Recommended session defaults (yours to set, the skill will remind you):
save a Fable model default via `/model`, and add `"effortLevel": "xhigh"` to
`~/.claude/settings.json`.

Try it without installing:

```
claude --plugin-dir ./plugins/fable-lead
```

## Install — Cowork

**Customize → Plugins → Add marketplace** → enter `oZeppy/fable-lead-plugin`
→ install **fable-lead**.

Two Cowork caveats (from the official docs, current as of 2026-08):

1. Cowork does **not** read `~/.claude` on your machine — the plugin is the
   delivery vehicle there, and it works. But the "install the global
   CLAUDE.md" step doesn't apply: instead, paste the doctrine (the
   `resources/global-CLAUDE.md` content) into your Cowork **project
   Instructions**.
2. Whether Cowork honors the `model`/`effort` frontmatter on plugin agents is
   not yet documented. The agents still load and carry their instructions;
   treat the model pinning as CLI-verified only.

## For teams

Commit this to a repo's `.claude/settings.json` and members get prompted to
install on folder trust:

```json
{
  "extraKnownMarketplaces": {
    "fable-lead": { "source": { "source": "github", "repo": "oZeppy/fable-lead-plugin" } }
  },
  "enabledPlugins": { "fable-lead@fable-lead": true }
}
```

## Design notes

- The skill is **idempotent and non-destructive**: existing files are never
  clobbered; drift is reported for you to decide.
- Inheriting the session model for subagents is the platform default and is
  never "wrong" — this system *deliberately* names models per delegation
  class so an expensive head doesn't silently bill every bulk stage at its
  own rate, and so verification effort scales with what a miss costs
  (a finder's miss is caught downstream; a verifier's miss ships).
- Born in a production trading-model repo where refuter-style verification
  overturned six headline statistics in one day. The doctrine is the residue
  of what actually caught things.

MIT licensed. Issues and PRs welcome.

## Migrating from fable-head (≤ v1.1.0)

The plugin, marketplace, and repo were renamed to **fable-lead** at v2.0.0.
A rename is a new identity — updates will not flow to the old name. Once:

```
/plugin uninstall fable-head@fable-head
/plugin marketplace remove fable-head
/plugin marketplace add oZeppy/fable-lead-plugin
/plugin install fable-lead@fable-lead
```

(Cowork: Customize → Plugins — remove the old plugin and marketplace, add the
new marketplace, install fable-lead.) Old GitHub URLs redirect, so a stale
marketplace keeps *working* — it just never sees new versions under the old
plugin name.
