---
summary: "CLI reference for `clawdfun logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
---

# `clawdfun logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:
- Logging overview: [Logging](/logging)

## Examples

```bash
clawdfun logs
clawdfun logs --follow
clawdfun logs --json
clawdfun logs --limit 500
```

