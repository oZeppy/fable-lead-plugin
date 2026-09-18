export const meta = {
  name: 'verify-claims',
  description: 'The fable-lead verification procedure: deterministic evidence check, two independent refuter votes per claim, frontier adjudication only where the votes split',
  whenToUse: 'Before anything ships: findings, statistics, a diff\'s claimed behaviour. Pass claims (and optionally a claim-check file) via args.',
  phases: [
    { title: 'Evidence', detail: 'claim-check re-runs machine-checkable evidence — no model judgment' },
    { title: 'Refute', detail: 'two independent refuters per claim (one when quota is tight and the claim is not ship-critical)' },
    { title: 'Adjudicate', detail: 'vote splits only' },
  ],
}

// args: { task: string, claims: [{id, claim, where?, critical?, mechanical?}], claimsFile?: path, roots?: [dir], quotaTight?: bool }
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
if (!Array.isArray(A.claims) || !A.claims.length || !A.task) return { error: 'args.task and args.claims are required' }

// role table, ~/.claude/CLAUDE.md (calibrated 2026-09-18) — every agent() goes through one of these
const mech = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'low',  ...o })
const chk  = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'high', ...o })
const lead = (p, o = {}) => agent(p, { model: 'fable',  effort: 'max',  ...o })

const VERDICT = {
  type: 'object',
  properties: {
    holds: { type: 'boolean' },
    premise_holds: { type: 'boolean' },
    evidence: { type: 'string' },
    caveat: { type: 'string' },
  },
  required: ['holds', 'premise_holds', 'evidence', 'caveat'],
}
const MECH = {
  type: 'object',
  properties: {
    ran: { type: 'boolean' },
    statuses: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' }, observed: { type: 'string' } }, required: ['id', 'status', 'observed'] } },
  },
  required: ['ran', 'statuses'],
}

// ---- layer 0: deterministic. A script decides; the agent only runs it and copies the result. ----
phase('Evidence')
let mechanical = {}
if (A.claimsFile) {
  const roots = (A.roots || []).map(r => `--root ${JSON.stringify(r)}`).join(' ')
  const m = await mech(`Run exactly this command and report its JSON output faithfully; do not judge, fix or re-run anything:
  claim-check ${JSON.stringify(A.claimsFile)} --json ${roots}
Return ran=true and, for every entry of the JSON array it prints, its id, its status, and the first check's "observed" text (empty string if none). If the command cannot run, return ran=false and an empty list.`,
    { label: 'claim-check', phase: 'Evidence', schema: MECH })
  if (m && m.ran) for (const s of m.statuses) mechanical[s.id] = s
  log(`claim-check: ${Object.values(mechanical).map(s => s.status).join(', ') || 'did not run'}`)
}

const refute = (c, vote) => `Try to REFUTE one claim. If it does not reproduce, it does not hold.
task: ${A.task}
CLAIM ${c.id}: ${c.claim}${c.where ? `\nWHERE TO LOOK: ${c.where}` : ''}
${mechanical[c.id] ? `A script already re-ran the claim's cited evidence: ${mechanical[c.id].status} — ${mechanical[c.id].observed}. That settles whether the ANCHORS exist, not whether the reasoning from them is right.` : ''}
Re-derive rather than re-read: run the command, open the file, fetch the page, reproduce the number. Comments, docs, reports and memory files are claims too, not evidence. Strictly read-only outside a scratch directory; no service, credential, git-mutating or destructive operations — if refuting would need one, say so in the caveat and judge on what you can reach.
Keep the premise and its consequence apart: premise_holds = the factual basis is true; holds = the claim AS WORDED is true (a true basis wearing an overstated consequence is holds=false, premise_holds=true).
evidence = the decisive command, file:line or URL and what it showed, <= 80 words. caveat = what a reader must know, or "none".
vote: ${vote}`

phase('Refute')
const judged = await pipeline(
  A.claims,
  async (c) => {
    const m = mechanical[c.id]
    if (m && (m.status === 'FAILED' || m.status === 'UNSUPPORTED'))
      return { id: c.id, verdict: 'REFUTED', by: 'evidence', evidence: m.observed, caveat: 'the cited evidence does not say what the claim says', votes: [] }
    if (m && c.mechanical && (m.status === 'VERIFIED'))
      return { id: c.id, verdict: 'CONFIRMED', by: 'evidence', evidence: m.observed, caveat: 'mechanical claim; anchors re-executed', votes: [] }
    const n = (A.quotaTight && !c.critical) ? 1 : 2
    const votes = (await parallel(Array.from({ length: n }, (_, i) => () =>
      chk(refute(c, `v${i + 1}`), { label: `${c.id}:v${i + 1}`, phase: 'Refute', schema: VERDICT })))).filter(Boolean)
    return { id: c.id, votes, requested: n }
  },
  async (r, c) => {
    if (!r || r.verdict) return r
    if (!r.votes.length) return { id: c.id, verdict: 'UNVERIFIED', by: 'none', evidence: '', caveat: 'no refuter returned', votes: [] }
    const got = r.votes.length
    const split = got === 2 && r.votes[0].holds !== r.votes[1].holds
    // agreeing on the claim but not on its PREMISE is the boundary case the doctrine separates them for:
    // adjudicate it when the claim is ship-critical, and never AND it away silently
    const premiseSplit = got === 2 && !split && r.votes[0].premise_holds !== r.votes[1].premise_holds
    if (!split && !(premiseSplit && c.critical)) {
      const v = r.votes[0]
      const by = got === 2 ? 'two agreeing votes' : (r.requested === 1 ? 'one vote (quota-tight, not ship-critical)' : 'ONE vote — the second refuter did not return')
      return { id: c.id, verdict: v.holds ? 'CONFIRMED' : 'REFUTED', by,
               premise_holds: premiseSplit ? null : v.premise_holds, premise_disputed: premiseSplit, evidence: v.evidence, caveat: r.votes.map(x => x.caveat).filter(x => x && x !== 'none').join(' | ') || 'none', votes: r.votes }
    }
    // disagreement is where the uncertainty is — the only place the frontier model is spent
    const a = await lead(`Two independent refuters disagree about one claim${split ? '' : ' — not on whether it holds as worded, but on whether its PREMISE is true'}. Decide it by re-deriving the decisive point yourself — their notes tell you where to look, not what is true.
task: ${A.task}
CLAIM ${c.id}: ${c.claim}${c.where ? `\nWHERE TO LOOK: ${c.where}` : ''}
REFUTER 1: holds=${r.votes[0].holds} — ${r.votes[0].evidence} (caveat: ${r.votes[0].caveat})
REFUTER 2: holds=${r.votes[1].holds} — ${r.votes[1].evidence} (caveat: ${r.votes[1].caveat})
Splits usually come from wording at a boundary (a latent hazard stated as present, a premise wearing a consequence). Say which it is in the caveat, and how the claim should be reworded if that is the cause. Strictly read-only outside scratch.`,
      { label: `${c.id}:split`, phase: 'Adjudicate', schema: VERDICT })
    return { id: c.id, verdict: a ? (a.holds ? 'CONFIRMED' : 'REFUTED') : 'UNVERIFIED', by: split ? 'split → frontier adjudication' : 'premise split → frontier adjudication', split: true,
             premise_holds: a ? a.premise_holds : null, evidence: a ? a.evidence : '', caveat: a ? a.caveat : 'adjudicator did not return', votes: r.votes }
  },
)

// The returned ledger command is run in a SHELL by the head. JSON.stringify leaves backticks and $(...) live inside
// double quotes (audit round 2: a task string built from a PR title could execute). Single-quote it instead.
const shq = (t) => "'" + String(t).replace(/[\u0000-\u001f]/g, ' ').replace(/'/g, "'\\''") + "'"
const out = judged.filter(Boolean)
const n = k => out.filter(x => x.verdict === k).length
const splits = out.filter(x => x.split).length
const ledger = `catch-ledger add --task ${shq(`${A.task}; evidence=claim-check, lead=fable/max on ${splits} split(s)`)} --config sonnet-5/high --stage verify --claims-in ${A.claims.length} --refuted ${n('REFUTED')} --confirmed ${n('CONFIRMED')}`
log(`${n('CONFIRMED')} confirmed · ${n('REFUTED')} refuted · ${n('UNVERIFIED')} unverified · ${splits} split(s)`)
return { results: out, ledger }
