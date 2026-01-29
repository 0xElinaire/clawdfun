---
summary: "CLI reference for `clawdfun plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
---

# `clawdfun plugins`

Manage Gateway plugins/extensions (loaded in-process).

Related:
- Plugin system: [Plugins](/plugin)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
clawdfun plugins list
clawdfun plugins info <id>
clawdfun plugins enable <id>
clawdfun plugins disable <id>
clawdfun plugins doctor
clawdfun plugins update <id>
clawdfun plugins update --all
```

Bundled plugins ship with Clawdfun but start disabled. Use `plugins enable` to
activate them.

All plugins must ship a `clawdfun.plugin.json` file with an inline JSON Schema
(`configSchema`, even if empty). Missing/invalid manifests or schemas prevent
the plugin from loading and fail config validation.

### Install

```bash
clawdfun plugins install <path-or-spec>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
clawdfun plugins install -l ./my-plugin
```

### Update

```bash
clawdfun plugins update <id>
clawdfun plugins update --all
clawdfun plugins update <id> --dry-run
```

Updates only apply to plugins installed from npm (tracked in `plugins.installs`).
