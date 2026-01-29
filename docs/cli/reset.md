---
summary: "CLI reference for `clawdfun reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
---

# `clawdfun reset`

Reset local config/state (keeps the CLI installed).

```bash
clawdfun reset
clawdfun reset --dry-run
clawdfun reset --scope config+creds+sessions --yes --non-interactive
```

