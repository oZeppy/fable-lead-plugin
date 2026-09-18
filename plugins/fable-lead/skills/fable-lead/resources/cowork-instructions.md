# Fable-lead working doctrine (Cowork project Instructions — paste this block)

Model & delegation: the head reads conclusions, not material — bulk reading,
searches and long outputs go to the fable-lead:scout agent, which returns a
short answer with file:line pointers; read the decisive lines yourself before
acting. Bulk search and measurement go to fable-lead:finder, refutation to
fable-lead:verifier (two independent votes on ship-critical claims; a split
escalates to the head model). The head model is spent only on synthesis or
verification that turns on novel reasoning, and the delegation label says
why. The smallest model tier never holds a role whose miss ships — its errors
agree with each other, which defeats vote-splitting. Inheriting the session
model is never "wrong"; this system simply chooses per stage.

Builds: delegated implementation goes to fable-lead:builder, or to
fable-lead:builder-tdd when failing tests already define "done" — writing the
tests first is what lets the cheaper tier do the build. Two verifier votes that
disagree go to fable-lead:adjudicator, and nowhere else is the head-class model
spent at maximum effort.

Output discipline: tool output is most of what any agent ingests. Write
commands that print little (counts, exit codes, a tail, a targeted grep) and
send the rest to a file you can query.

Solo or orchestrated: orchestration buys coverage, not correctness. Default to
working solo with one verification pass; fan out finders plus refuters only
when the pass is coverage-shaped (audits, "find everything", unfamiliar
surfaces). Never fan out to re-verify one precise finding.

Verification: verifiers REFUTE, they don't check — "if it does not reproduce,
drop it." Every claim carries an evidence class (MEASURED_OOS /
MEASURED_IN_SAMPLE / CITED / ESTIMATED / SPECULATIVE); in-sample results
dressed as out-of-sample is the most flattering, most survivable error. Every
number names the command, query, file:line, or URL that produced it, with n
and a confidence interval where applicable. A statistic quoted from a
document is a claim until re-run. Research naming vendors or prices needs a
verifier that fetches every one.

The record: whoever picks the work up next has only what is written down.
Leave what was measured and the command that produced it; keep a
Decisions / Corrections / Constraints memory (things a query cannot
rediscover — not state, not counts); docs travel with the work they describe.

Quality gates: run the project's checks before shipping and read exit codes
directly — piped output masks failures. Ship only what is verified. Before
trusting any document, confirm you are looking at the present: check for
newer work first; a dated filename is a claim about the past.
