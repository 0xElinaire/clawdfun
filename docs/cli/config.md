---
summary: "CLI reference for `clawdfun config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
---

# `clawdfun config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `clawdfun configure`).

## Examples

```bash
clawdfun config get browser.executablePath
clawdfun config set browser.executablePath "/usr/bin/google-chrome"
clawdfun config set agents.defaults.heartbeat.every "2h"
clawdfun config set agents.list[0].tools.exec.node "node-id-or-name"
clawdfun config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
clawdfun config get agents.defaults.workspace
clawdfun config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
clawdfun config get agents.list
clawdfun config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
clawdfun config set agents.defaults.heartbeat.every "0m"
clawdfun config set gateway.port 19001 --json
clawdfun config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
