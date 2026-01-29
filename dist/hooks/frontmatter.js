import JSON5 from "json5";
import { parseFrontmatterBlock } from "../markdown/frontmatter.js";
import { parseBooleanValue } from "../utils/boolean.js";
export function parseFrontmatter(content) {
    return parseFrontmatterBlock(content);
}
function normalizeStringList(input) {
    if (!input)
        return [];
    if (Array.isArray(input)) {
        return input.map((value) => String(value).trim()).filter(Boolean);
    }
    if (typeof input === "string") {
        return input
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
    }
    return [];
}
function parseInstallSpec(input) {
    if (!input || typeof input !== "object")
        return undefined;
    const raw = input;
    const kindRaw = typeof raw.kind === "string" ? raw.kind : typeof raw.type === "string" ? raw.type : "";
    const kind = kindRaw.trim().toLowerCase();
    if (kind !== "bundled" && kind !== "npm" && kind !== "git") {
        return undefined;
    }
    const spec = {
        kind: kind,
    };
    if (typeof raw.id === "string")
        spec.id = raw.id;
    if (typeof raw.label === "string")
        spec.label = raw.label;
    const bins = normalizeStringList(raw.bins);
    if (bins.length > 0)
        spec.bins = bins;
    if (typeof raw.package === "string")
        spec.package = raw.package;
    if (typeof raw.repository === "string")
        spec.repository = raw.repository;
    return spec;
}
function getFrontmatterValue(frontmatter, key) {
    const raw = frontmatter[key];
    return typeof raw === "string" ? raw : undefined;
}
function parseFrontmatterBool(value, fallback) {
    const parsed = parseBooleanValue(value);
    return parsed === undefined ? fallback : parsed;
}
export function resolveClawdfunMetadata(frontmatter) {
    const raw = getFrontmatterValue(frontmatter, "metadata");
    if (!raw)
        return undefined;
    try {
        const parsed = JSON5.parse(raw);
        if (!parsed || typeof parsed !== "object")
            return undefined;
        const clawdfun = parsed.clawdfun;
        if (!clawdfun || typeof clawdfun !== "object")
            return undefined;
        const clawdfunObj = clawdfun;
        const requiresRaw = typeof clawdfunObj.requires === "object" && clawdfunObj.requires !== null
            ? clawdfunObj.requires
            : undefined;
        const installRaw = Array.isArray(clawdfunObj.install) ? clawdfunObj.install : [];
        const install = installRaw
            .map((entry) => parseInstallSpec(entry))
            .filter((entry) => Boolean(entry));
        const osRaw = normalizeStringList(clawdfunObj.os);
        const eventsRaw = normalizeStringList(clawdfunObj.events);
        return {
            always: typeof clawdfunObj.always === "boolean" ? clawdfunObj.always : undefined,
            emoji: typeof clawdfunObj.emoji === "string" ? clawdfunObj.emoji : undefined,
            homepage: typeof clawdfunObj.homepage === "string" ? clawdfunObj.homepage : undefined,
            hookKey: typeof clawdfunObj.hookKey === "string" ? clawdfunObj.hookKey : undefined,
            export: typeof clawdfunObj.export === "string" ? clawdfunObj.export : undefined,
            os: osRaw.length > 0 ? osRaw : undefined,
            events: eventsRaw.length > 0 ? eventsRaw : [],
            requires: requiresRaw
                ? {
                    bins: normalizeStringList(requiresRaw.bins),
                    anyBins: normalizeStringList(requiresRaw.anyBins),
                    env: normalizeStringList(requiresRaw.env),
                    config: normalizeStringList(requiresRaw.config),
                }
                : undefined,
            install: install.length > 0 ? install : undefined,
        };
    }
    catch {
        return undefined;
    }
}
export function resolveHookInvocationPolicy(frontmatter) {
    return {
        enabled: parseFrontmatterBool(getFrontmatterValue(frontmatter, "enabled"), true),
    };
}
export function resolveHookKey(hookName, entry) {
    return entry?.clawdfun?.hookKey ?? hookName;
}
