---
name: fable-head
description: >
  Bootstrap the Fable-headed working system into the current session and
  project: verify/install the global working-system files (user CLAUDE.md +
  finder/verifier/synthesizer agents), scaffold the project's CLAUDE.md and
  PROJECT_MEMORY if absent, confirm model/effort defaults, and report status.
  Invoke in any new project, on any new machine, or whenever unsure the
  system is active.
---

You are activating the Fable-headed working system. Resources are bundled in
this skill's `resources/` directory. Do each step, then report one compact
status block. Never overwrite a file that already exists and differs — say
so and show the diff summary instead; the user decides.

1. **Global files** (apply on this machine, all projects):
   - `~/.claude/CLAUDE.md` — if absent, install from `resources/global-CLAUDE.md`.
     If present but different, report the drift; do not clobber. (In Cowork,
     `~/.claude` is not read: tell the user to paste the doctrine into the
     Cowork project's Instructions instead.)
   - Agents: this plugin already ships `fable-head:finder` /
     `fable-head:verifier` / `fable-head:synthesizer` with model+effort
     pinned (opus/high, opus/xhigh, fable/xhigh) — nothing to install, and
     they auto-update with the plugin. If same-named USER-LEVEL copies exist
     (`~/.claude/agents/{finder,verifier,synthesizer}.md`), warn that they
     OVERRIDE the plugin's when invoked un-namespaced and will go stale as
     the plugin updates; offer to remove them (with the user's confirmation)
     so the plugin stays canonical. Only offer to INSTALL user-level copies
     if the user explicitly wants un-namespaced names and accepts the sync
     duty.
   - In Cowork specifically: also offer the paste-ready doctrine block
     (`resources/cowork-instructions.md`) and tell the user to paste it into
     the Cowork project's Instructions — that is the only way it survives
     into their next Cowork session.

2. **Session defaults**: read `~/.claude/settings.json`. Confirm `model` is a
   Fable id and `effortLevel` is `xhigh`. If either is missing, tell the user
   the exact one-line fix (`/model` to save a default; add
   `"effortLevel": "xhigh"` to settings.json) — settings are the user's; do
   not edit them silently.

3. **Project scaffolding** (only inside a project directory; skip cleanly if
   the cwd is not a git repo and say so):
   - If no `CLAUDE.md` in the repo root: create one from
     `resources/project-CLAUDE-skeleton.md`, filling the project name/summary
     from what the repo itself shows (README, package metadata) — facts only,
     no invented constraints.
   - If no `docs/PROJECT_MEMORY.md`: create it from
     `resources/project-MEMORY-skeleton.md`.
   - Do NOT create a campaign log preemptively — logs start with the first
     milestone, per the system's own "state goes stale" rule.

4. **Adopt the doctrine for this session**, whether or not any files were
   installed: subagents are named deliberately (bulk on opus via the finder/
   verifier agents, fable spent only on synthesis or reasoning-bound
   verification, with the label saying why); verifiers refute rather than
   check; every number carries its producing command and n; suites/exit codes
   before commits; confirm-you-are-in-the-present before trusting any doc.

5. **Report**: one block — what was installed vs already present vs drifted,
   the model/effort status, what was scaffolded, and (if in a repo) the one
   or two most load-bearing gaps you noticed in its existing docs. Then
   continue with whatever the user actually asked.

To carry this system to another machine or person: install the plugin
(`/plugin marketplace add oZeppy/fable-head-plugin`, then
`/plugin install fable-head@fable-head`; in Cowork: Customize → Plugins →
Add marketplace) and invoke `/fable-head` — step 1 installs the rest.
