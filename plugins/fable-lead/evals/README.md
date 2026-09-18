# fable-lead behaviour evals

Six judgment-only cases (no tools, <= 3 turns) that check a model governed by the working
system does what the doctrine says at its decision points: agent routing, the Haiku bar,
premise vs consequence, quota-tight routing, shell-output discipline, subagent scoping.

    cd ~/Documents/fable-lead-plugin/plugins/fable-lead
    claude plugin eval . --no-publish --judge-model sonnet --runs 3 -j 4

`--no-publish` keeps the report local (the owner's tooling is local-first). The default
ablation also runs each case WITHOUT the plugin; note the doctrine itself lives in
~/.claude/CLAUDE.md, which both arms load, so the delta isolates the plugin's agents and
skill, not the doctrine. Run after any change to the doctrine, an agent description, or a
model release. Results land in evals/results/ (gitignored).
