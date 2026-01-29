import os from "node:os";
import path from "node:path";
/**
 * Nix mode detection: When CLAWDFUN_NIX_MODE=1, the gateway is running under Nix.
 * In this mode:
 * - No auto-install flows should be attempted
 * - Missing dependencies should produce actionable Nix-specific error messages
 * - Config is managed externally (read-only from Nix perspective)
 */
export function resolveIsNixMode(env = process.env) {
    return env.CLAWDFUN_NIX_MODE === "1";
}
export const isNixMode = resolveIsNixMode();
/**
 * State directory for mutable data (sessions, logs, caches).
 * Can be overridden via CLAWDFUN_STATE_DIR environment variable.
 * Default: ~/.clawdfun
 */
export function resolveStateDir(env = process.env, homedir = os.homedir) {
    const override = env.CLAWDFUN_STATE_DIR?.trim();
    if (override)
        return resolveUserPath(override);
    return path.join(homedir(), ".clawdfun");
}
function resolveUserPath(input) {
    const trimmed = input.trim();
    if (!trimmed)
        return trimmed;
    if (trimmed.startsWith("~")) {
        const expanded = trimmed.replace(/^~(?=$|[\\/])/, os.homedir());
        return path.resolve(expanded);
    }
    return path.resolve(trimmed);
}
export const STATE_DIR_CLAWDFUN = resolveStateDir();
/**
 * Config file path (JSON5).
 * Can be overridden via CLAWDFUN_CONFIG_PATH environment variable.
 * Default: ~/.clawdfun/clawdfun.json (or $CLAWDFUN_STATE_DIR/clawdfun.json)
 */
export function resolveConfigPath(env = process.env, stateDir = resolveStateDir(env, os.homedir)) {
    const override = env.CLAWDFUN_CONFIG_PATH?.trim();
    if (override)
        return resolveUserPath(override);
    return path.join(stateDir, "clawdfun.json");
}
export const CONFIG_PATH_CLAWDFUN = resolveConfigPath();
export const DEFAULT_GATEWAY_PORT = 18789;
/**
 * Gateway lock directory (ephemeral).
 * Default: os.tmpdir()/clawdfun-<uid> (uid suffix when available).
 */
export function resolveGatewayLockDir(tmpdir = os.tmpdir) {
    const base = tmpdir();
    const uid = typeof process.getuid === "function" ? process.getuid() : undefined;
    const suffix = uid != null ? `clawdfun-${uid}` : "clawdfun";
    return path.join(base, suffix);
}
const OAUTH_FILENAME = "oauth.json";
/**
 * OAuth credentials storage directory.
 *
 * Precedence:
 * - `CLAWDFUN_OAUTH_DIR` (explicit override)
 * - `CLAWDFUN_STATE_DIR/credentials` (canonical server/default)
 * - `~/.clawdfun/credentials` (legacy default)
 */
export function resolveOAuthDir(env = process.env, stateDir = resolveStateDir(env, os.homedir)) {
    const override = env.CLAWDFUN_OAUTH_DIR?.trim();
    if (override)
        return resolveUserPath(override);
    return path.join(stateDir, "credentials");
}
export function resolveOAuthPath(env = process.env, stateDir = resolveStateDir(env, os.homedir)) {
    return path.join(resolveOAuthDir(env, stateDir), OAUTH_FILENAME);
}
export function resolveGatewayPort(cfg, env = process.env) {
    const envRaw = env.CLAWDFUN_GATEWAY_PORT?.trim();
    if (envRaw) {
        const parsed = Number.parseInt(envRaw, 10);
        if (Number.isFinite(parsed) && parsed > 0)
            return parsed;
    }
    const configPort = cfg?.gateway?.port;
    if (typeof configPort === "number" && Number.isFinite(configPort)) {
        if (configPort > 0)
            return configPort;
    }
    return DEFAULT_GATEWAY_PORT;
}
