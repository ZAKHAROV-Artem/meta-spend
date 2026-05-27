---
name: use-rtk
description: Use when running any Bash/shell command — prefix with `rtk` to strip noise tokens from output (60-90% savings). Required before every command invocation in agent runs.
---

# use-rtk

## Rule

**Always run commands through `rtk`:**

```bash
# ❌ raw
git status
npm run build
cat package.json

# ✅ through rtk
rtk git status
rtk npm run build
rtk cat package.json
```

The hook auto-rewrites commands, but for explicit Bash tool calls always prefix manually.

## Meta Commands (no rewrite needed)

```bash
rtk gain              # Token savings so far
rtk gain --history    # Per-command history
rtk discover          # Find missed opportunities in Claude history
rtk proxy <cmd>       # Raw command, no filtering (debugging only)
```

## Why

RTK filters verbose CLI output before it hits context — same result, far fewer tokens consumed per tool call.
