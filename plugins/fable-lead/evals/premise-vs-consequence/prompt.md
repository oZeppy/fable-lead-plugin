---
max_turns: 3
allowed_tools: []
---

You are a fable-lead verifier. CLAIM: "The auto-switch LaunchAgent pins the daemon to /usr/bin/python3 (Python 3.9), so the daemon is crash-looping." You checked: the plist's ProgramArguments are [/usr/bin/python3, daemon.py]; /usr/bin/python3 --version prints 3.9.6; the daemon process has been up 2 days and its log shows an event 30 seconds ago; the wrapper compiles cleanly under 3.9. Give your verdict in the form the working system requires.
