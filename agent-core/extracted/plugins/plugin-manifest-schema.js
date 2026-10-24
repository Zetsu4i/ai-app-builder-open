        return (0, UWr.realpathSync)(e)
    } catch {
        return
    }
}
async function B4s(e, t) {
    let n = await (0, eB.open)(e, "r");
    try {
        let o = Buffer.alloc(Math.max(0, t)),
            {
                bytesRead: s
            } = await n.read(o, 0, o.byteLength, 0);
        return o.subarray(0, s)
    } finally {
        await n.close()
    }
}

function xln(e) {
    return typeof e == "object" && e !== null && "code" in e && e.code === "ENOENT"
}

function Vst(e) {
    if (e?.signal?.aborted) throw new Error("Skill operation cancelled")
}
var UWr, eB, kC, k4s, x4s, T4s, I4s, C4s, kln, O0e = Y(() => {
    "use strict";
    UWr = require("node:fs"), eB = require("node:fs/promises"), kC = require("node:path");
    OWr();
    Wst();
    k4s = 1024, x4s = new Set(["name", "description", "when_to_use", "license", "metadata"]), T4s = 1e5, I4s = 5, C4s = [".zcode-plugin/plugin.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json"], kln = class {
        static {
            r(this, "NodeSkillAdapter")
        }
        options;
        disabledPaths;
        pluginNameBySkillRoot = new Map;
        constructor(t = {}) {
            this.options = t, this.disabledPaths = new Set(Array.from(t.disabledPaths ?? []).flatMap(n => {
                let o = (0, kC.resolve)(n),
                    s = j4s(o);
                return s && s !== o ? [o, s] : [o]
            }))
        }
        async discoverSkills(t, n) {
            Vst(n);
            let o = (0, kC.resolve)(t.workingDirectory),
                s = t.roots ?? await DWr(o, this.options),
                a = [],
                l = new Map,
                u = 0;
            for (let f of s.toSorted((g, _) => g.priority - _.priority)) {
                Vst(n);
                let g = await this.skillFilesUnderRoot(f, a);
                for (let _ of g) {
                    Vst(n);
                    let b = await this.parseSkill(_, f, a);
                    b && (await this.isDisabledSkillPath(b.path) || (u++, !l.has(b.path) && l.set(b.path, b)))
                }
            }
            return {
                skills: Array.from(l.values()).toSorted((f, g) => f.name.localeCompare(g.name)),
                diagnostics: a,
                totalDiscovered: u
            }
        }
        async loadSkill(t, n) {
            Vst(n);
            let s = (await this.discoverSkills({
                workingDirectory: t.workingDirectory,
                roots: t.roots
            }, n)).skills.find(b => N4s(b, t.name));
            if (!s) throw new Error(`Skill not found: ${t.name}`);
            let a = t.maxBytes ?? T4s,
                l = await (0, eB.stat)(s.path),
                u = l.size > a,
                f = u ? await B4s(s.path, a) : await (0, eB.readFile)(s.path),
                g = f.toString("utf8"),
                _ = A4s(g).trim();
            return {
                metadata: s,
                content: _,
                baseDirectory: s.directory,
                bytesRead: f.byteLength,
                sizeBytes: l.size,
                truncated: u
            }
        }
        async skillFilesUnderRoot(t, n) {
            try {
                return await LWr(t.path, {
                    followSymbolicLinks: t.source !== "plugin"
                })
            } catch (o) {
                return xln(o) ? [] : (n.push({
                    code: "skill_scan_failed",
                    severity: "warning",
                    message: o instanceof Error ? o.message : `Failed to scan skill root: ${t.path}`,
                    path: t.path
                }), [])
            }
        }
        async parseSkill(t, n, o) {
            let s;
            try {
                s = await (0, eB.readFile)(t, "utf8")
            } catch (b) {
                return xln(b) || o.push({
                    code: "skill_read_failed",
                    severity: "warning",
                    message: b instanceof Error ? b.message : `Failed to read skill: ${t}`,
                    path: t
                }), null
            }
            let a = E4s(s),
                l = a ? P4s(a, t, o) : {
                    values: {},
                    keys: []
                },
                u = wln(l.values.name) ?? (a ? void 0 : (0, kC.basename)((0, kC.dirname)(t)));
            if (!u) return o.push({
                code: "skill_missing_name",
                severity: "error",
                message: `Skill frontmatter must include a name: ${t}`,
                path: t
            }), null;
            let f = wln(l.values.description);
            if (!f && a) return o.push({
                code: "skill_missing_description",
                severity: "error",
                message: `Skill frontmatter must include a description: ${t}`,
                path: t,
                skillName: u
            }), null;
            let g = f ?? "";
            if (g.length > k4s) return o.push({
                code: "skill_description_too_long",
                severity: "error",
                message: `Skill description is too long: ${u}`,
                path: t,
                skillName: u
            }), null;
            let _ = await this.resolvePluginSkillAlias(u, n);
            return {
                name: u,
                description: g,
                whenToUse: wln(l.values.when_to_use),
                ..._,
                path: t,
                directory: (0, kC.dirname)(t),
                rootPath: n.path,
                scope: n.scope,
                source: n.source,
                safeToAutoLoad: l.keys.every(b => x4s.has(b)),
                frontmatterKeys: l.keys,
                policy: {
                    allowImplicitInvocation: !0
                }
            }
        }
        async isDisabledSkillPath(t) {
            let n = (0, kC.resolve)(t);
            if (this.disabledPaths.has(n)) return !0;
            let o = await (0, eB.realpath)(n).catch(() => n);
            return this.disabledPaths.has(o)
        }
        async resolvePluginSkillAlias(t, n) {
            if (n.source !== "plugin") return;
            let o = await this.resolvePluginName(n.path);
            if (o) return {
                ...n.pluginId ? {
                    pluginId: n.pluginId
                } : {},
                pluginName: o,
                qualifiedName: `${o}:${t}`
            }
        }
        async resolvePluginName(t) {
            let n = (0, kC.resolve)(t),
                o = this.pluginNameBySkillRoot.get(n);
            return o || (o = L4s(n), this.pluginNameBySkillRoot.set(n, o)), o
        }
    };
    r(iG, "createNodeSkillAdapter");
    r(E4s, "extractFrontmatter");
    r(A4s, "stripFrontmatter");
    r(P4s, "parseFlatYaml");
    r(R4s, "parseBlockScalarStyle");
    r(D4s, "readBlockScalar");
    r(O4s, "leadingWhitespaceLength");
    r(M4s, "foldBlockScalarLines");
    r(wln, "parseScalar");
    r(N4s, "matchesSkillRequest");
    r(L4s, "readPluginNameForSkillRoot");
    r(F4s, "readPluginNameFromManifest");
    r(j4s, "safeRealpathSync");
    r(B4s, "readFirstBytes");
    r(xln, "isNotFoundError");
    r(Vst, "throwIfAborted")
});
async function HWr(e, t = {}) {
    let n = (0, xC.resolve)(e),
        o = [],
        s = t.includeZcodeCommands ?? !0,
        a = t.homeDirectory ?? (0, VWr.homedir)(),
        l = 0,
        u = r(() => (l += z4s, l), "nextPriority");
    for (let g of t.extraRoots ?? []) o.push(Tln(G4s(g, n, a), "project", "zcode", u()));
    s && o.push(...qWr(a, "user", u));
    let f = await W4s(n);
    for (let g of f) s && o.push(...qWr(g, "project", u));
    return o.push(...t.extraResolvedRoots ?? []), o
}
async function W4s(e) {
    let t = await V4s(e);
    if (!t) return [e];
    let n = [],
        o = e;
    for (; n.push(o), !(o === t || o === (0, xC.dirname)(o));) o = (0, xC.dirname)(o);
    return n
}
async function V4s(e) {
    let t = e;
    for (;;) {
        if (await H4s((0, xC.join)(t, U4s))) return t;
        let n = (0, xC.dirname)(t);
        if (n === t) return null;
        t = n
    }
}
async function H4s(e) {
    try {
        return await (0, WWr.stat)(e), !0
    } catch {
        return !1
    }
}

function qWr(e, t, n) {
    return [Tln((0, xC.join)(e, $4s, zWr), t, "zcode", n()), Tln((0, xC.join)(e, q4s, zWr), t, "agents", n())]
}

function Tln(e, t, n, o) {
    return {
        path: (0, xC.resolve)(e),
        scope: t,
        source: n,
        priority: o
    }
}

function G4s(e, t, n) {
    let o = e.startsWith($Wr) ? (0, xC.join)(n, e.slice($Wr.length)) : e;
    return (0, xC.isAbsolute)(o) ? o : (0, xC.resolve)(t, o)
}
var WWr, VWr, xC, zWr, U4s, $Wr, z4s, $4s, q4s, GWr = Y(() => {
    "use strict";
    WWr = require("node:fs/promises"), VWr = require("node:os"), xC = require("node:path"), zWr = "commands", U4s = ".git", $Wr = "~/", z4s = 10, $4s = ".zcode", q4s = ".agents";
    r(HWr, "resolveDefaultCustomCommandRoots");
    r(W4s, "resolveProjectDirectories");
    r(V4s, "findWorktreeRoot");
    r(H4s, "pathExists");
    r(qWr, "commandRootsForBase");
    r(Tln, "root");
    r(G4s, "resolveConfiguredRoot")
});

function QWr(e = {}) {
    return new Iln(e)
}
async function eVr(e, t, n = 0) {
    if (n > Z4s) return [];
    try {
        let o = await (0, DF.readdir)(e, {
                withFileTypes: !0
            }),
            s = [];
        for (let a of o) {
            let l = (0, M7.resolve)(e, a.name),
                u = a.isDirectory(),
                f = a.isFile();
            if (a.isSymbolicLink()) try {
                let g = await (0, DF.stat)(l);
                u = g.isDirectory(), f = g.isFile()
            } catch {
                continue
            }
            u ? s.push(...await eVr(l, t, n + 1)) : f && a.name.toLowerCase().endsWith(YWr) && s.push(l)
        }
        return s
    } catch (o) {
        return t.push({
            code: "custom_command_scan_failed",
            message: o instanceof Error ? o.message : `Failed to scan command directory: ${e}`,
            path: e,
            severity: "warning"
        }), []
    }
}

function X4s(e, t) {
    let o = (0, M7.relative)(t, e).slice(0, -YWr.length);
    return tVr(o.split(/[\\/]+/).join(":"))
}

function tVr(e) {
    return e.trim().replace(/^\/+/, "").toLowerCase()
}

function Q4s(e) {
    let t = e.replace(/^\uFEFF/, "");
    if (!t.startsWith("---")) return null;
    let n = t.split(/\r?\n/);
    if (n[0]?.trim() !== "---") return null;
    let o = n.findIndex((s, a) => a > 0 && s.trim() === "---");
    return o <= 0 ? null : n.slice(1, o).join(`
`)
}

function JWr(e) {
    let t = e.replace(/^\uFEFF/, "");
    if (!t.startsWith("---")) return e;
    let n = t.split(/\r?\n/),
        o = n.findIndex((s, a) => a > 0 && s.trim() === "---");
    return o <= 0 ? e : n.slice(o + 1).join(`
`)
}

function e6s() {
    return {
        keys: [],
        values: {}
    }
}

function t6s(e, t, n) {
    let o = {},
        s = [];
    for (let [a, l] of e.split(/\r?\n/).entries()) {
        if (l.trim().length === 0 || l.trim().startsWith("#") || /^\s/.test(l)) continue;
        let u = l.indexOf(":");
        if (u <= 0) {
            n.push({
                code: "custom_command_invalid_frontmatter",
                message: `Invalid frontmatter line ${a+1} in ${(0,M7.basename)(t)}`,
                path: t,
                severity: "warning"
            });
            continue
        }
        let f = l.slice(0, u).trim();
        s.push(f), o[f] = l.slice(u + 1).trim()
    }
    return {
        keys: s,
        values: o
    }
}

function oOe(e) {
    if (e === void 0) return;
    let t = e.trim();
    if (t.length !== 0) return t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'") ? t.slice(1, -1).trim() : t
}

function n6s(e) {
    let t = oOe(e)?.toLowerCase();
    return t === "true" || t === "yes"
}

function KWr(e) {
    let t = oOe(e);
    return t ? t.replace(/^\[/, "").replace(/\]$/, "").split(",").map(o => o.trim()).filter(Boolean) : []
}

function r6s(e) {
    let t = e.split(/\r?\n/).map(n => n.replace(/^#+\s*/, "").replace(/^[-*]\s*/, "").trim()).find(Boolean);
    return t ? nVr(t, XWr) : void 0
}

function nVr(e, t) {
    return e.length > t ? e.slice(0, t) : e
}
async function o6s(e, t) {
    let n = await (0, DF.open)(e, "r");
    try {
        let o = Buffer.alloc(Math.max(0, t)),
            {
                bytesRead: s
            } = await n.read(o, 0, o.byteLength, 0);
        return o.subarray(0, s)
    } finally {
        await n.close()
    }
}

function ZWr(e) {
    return typeof e == "object" && e !== null && "code" in e && e.code === "ENOENT"
}

function Hst(e) {
    if (e?.signal?.aborted) throw new Error("Custom command operation cancelled")
}
var DF, M7, YWr, J4s, K4s, XWr, Z4s, Y4s, Iln, Cln = Y(() => {
    "use strict";
    DF = require("node:fs/promises"), M7 = require("node:path");
    GWr();
    YWr = ".md", J4s = /^[a-z0-9][a-z0-9_:-]{0,63}$/, K4s = 1e5, XWr = 1024, Z4s = 12, Y4s = new Set(["allowed-tools", "argument-hint", "description", "disable-noninteractive", "model", "skills"]), Iln = class {
        static {
            r(this, "NodeCustomCommandAdapter")
        }
        options;
        disabledPaths;
        constructor(t = {}) {
            this.options = t, this.disabledPaths = new Set(Array.from(t.disabledPaths ?? [], n => (0, M7.resolve)(n)))
        }
        async discoverCommands(t, n) {
            Hst(n);
            let o = (0, M7.resolve)(t.workingDirectory),
                s = t.roots ?? await HWr(o, this.options),
                a = [],
                l = new Map,
                u = 0;
            for (let f of s.toSorted((g, _) => g.priority - _.priority)) {
                Hst(n);
                let g = await this.commandFilesUnderRoot(f, a);
                for (let _ of g) {
                    Hst(n);
                    let b = await this.parseCommand(_, f, a);
                    if (b && !this.disabledPaths.has((0, M7.resolve)(b.path))) {
                        if (u++, l.has(b.name)) {
                            a.push({
                                code: "custom_command_duplicate_name",
                                commandName: b.name,
                                message: `Duplicate custom command ignored: ${b.name}`,
                                path: _,
                                severity: "warning"
                            });
                            continue
                        }
                        l.set(b.name, b)
                    }
                }
            }
            return {
                commands: Array.from(l.values()).toSorted((f, g) => f.name.localeCompare(g.name)),
                diagnostics: a,
                totalDiscovered: u
            }
        }
        async loadCommand(t, n) {
            Hst(n);
            let o = await this.discoverCommands({
                    roots: t.roots,
                    workingDirectory: t.workingDirectory
                }, n),
                s = tVr(t.name),
                a = o.commands.find(_ => _.name === s);
            if (!a) throw new Error(`Custom command not found: ${t.name}`);
            let l = t.maxBytes ?? K4s,
                u = await (0, DF.stat)(a.path),
                f = u.size > l,
                g = f ? await o6s(a.path, l) : await (0, DF.readFile)(a.path);
            return {
                metadata: a,
                bytesRead: g.byteLength,
                content: JWr(g.toString("utf8")).trim(),
                sizeBytes: u.size,
                truncated: f
            }
        }
        async commandFilesUnderRoot(t, n) {
            try {
                return (await (0, DF.stat)(t.path)).isDirectory() ? await eVr(t.path, n) : []
            } catch (o) {
                return ZWr(o) ? [] : (n.push({
                    code: "custom_command_scan_failed",
                    message: o instanceof Error ? o.message : `Failed to scan command root: ${t.path}`,
                    path: t.path,
                    severity: "warning"
                }), [])
            }
        }
        async parseCommand(t, n, o) {
            let s;
            try {
                s = await (0, DF.readFile)(t, "utf8")
            } catch (_) {
                return ZWr(_) || o.push({
                    code: "custom_command_read_failed",
                    message: _ instanceof Error ? _.message : `Failed to read custom command: ${t}`,
                    path: t,
                    severity: "warning"
                }), null
            }
            let a = X4s(t, n.path);
            if (!J4s.test(a)) return o.push({
                code: "custom_command_invalid_name",
                commandName: a,
                message: `Invalid custom command name: ${a}`,
                path: t,
                severity: "error"
            }), null;
            let l = Q4s(s),
                u = l ? t6s(l, t, o) : e6s(),
                f = JWr(s).trim(),
                g = oOe(u.values.description) ?? r6s(f);
            if (!g) return o.push({
                code: "custom_command_invalid_frontmatter",
                commandName: a,
                message: `Custom command must include a description or non-empty body: ${t}`,
                path: t,
                severity: "error"
            }), null;
            for (let _ of u.keys) Y4s.has(_) || o.push({
                code: "custom_command_unknown_frontmatter",
                commandName: a,
                message: `Unknown custom command frontmatter key: ${_}`,
                path: t,
                severity: "warning"
            });
            return {
                allowedTools: KWr(u.values["allowed-tools"]),
                argumentHint: oOe(u.values["argument-hint"]),
                description: nVr(g, XWr),
                disableNonInteractive: n6s(u.values["disable-noninteractive"]),
                frontmatterKeys: u.keys,
                model: oOe(u.values.model),
                name: a,
                path: t,
                plugin: n.plugin,
                rootPath: n.path,
                scope: n.scope,
                skills: KWr(u.values.skills),
                source: n.source
            }
        }
    };
    r(QWr, "createNodeCustomCommandAdapter");
    r(eVr, "scanMarkdownFiles");
    r(X4s, "commandNameFromPath");
    r(tVr, "normalizeCommandName");
    r(Q4s, "extractFrontmatter");
    r(JWr, "stripFrontmatter");
    r(e6s, "emptyFrontmatter");
    r(t6s, "parseFlatYaml");
    r(oOe, "parseScalar");
    r(n6s, "parseBoolean");
    r(KWr, "parseList");
    r(r6s, "extractDescription");
    r(nVr, "truncate");
    r(o6s, "readFirstBytes");
    r(ZWr, "isNotFoundError");
    r(Hst, "throwIfAborted")
});

function Yx(e, t) {
    if ((0, sG.isAbsolute)(t)) return null;
    let n = (0, sG.resolve)(e, t),
        o = (0, sG.relative)(e, n);
    return o === "" || !o.startsWith("..") && !o.includes(`..${sG.sep}`) ? n : null
}

function N7(e) {
    return e.replace(/[^a-zA-Z0-9_.@-]/g, "-")
}

function Eln(e) {
    return typeof e == "string" ? [e] : Array.isArray(e) ? e.filter(t => typeof t == "string") : []
}

function rVr(e) {
    return typeof e == "string" || typeof e == "number" || typeof e == "boolean"
}

function fu(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function $v(e) {
    try {
        return (0, Gst.statSync)(e).isDirectory()
    } catch {
        return !1
    }
}

function oVr(e) {
    try {
        return (0, Gst.statSync)(e), !1
    } catch (t) {
        let n = t.code;
        return n === "ENOENT" || n === "ENOTDIR"
    }
}

function vw(e) {
    try {
        return (0, Gst.statSync)(e).isFile()
    } catch {
        return !1
    }
}

function Jst(e) {
    return typeof e == "object" && e !== null && "code" in e && e.code === "ENOENT"
}
async function zg(e, t = i6s) {
    if (!e) return;
    let n;
    for (let o of t) {
        o > 0 && await new Promise(s => setTimeout(s, o));
        try {
            await e();
            return
        } catch (s) {
            n = s
        }
    }
    return n
}

function TC(e, t) {
    if (t === void 0 || !(e instanceof Error)) return e;
    let n = t instanceof Error ? t.message : String(t);
    return e.message = `${e.message}; plugin source cleanup also failed: ${n}`, e
}

function Kst(e) {
    if (e?.signal?.aborted) throw new Error("Plugin operation cancelled")
}
var Gst, sG, i6s, L7 = Y(() => {
    "use strict";
    Gst = require("node:fs"), sG = require("node:path"), i6s = [0, 25, 100];
    r(Yx, "resolveInside");
    r(N7, "sanitizePluginId");
    r(Eln, "parsePathList");
    r(rVr, "isPluginOptionValue");
    r(fu, "isRecord");
    r($v, "directoryExists");
    r(oVr, "isMissingPath");
    r(vw, "fileExists");
    r(Jst, "isNotFoundError");
    r(zg, "cleanupPluginSourceBestEffort");
    r(TC, "appendPluginSourceCleanupError");
    r(Kst, "throwIfAborted")
});

function s6s(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function iVr(e, t) {
    if (e !== void 0) {
        if (!s6s(e)) throw new Error(`MCP server ${t}: auth must be an object`);
        if (e.type !== "zcode_official") throw new Error(`MCP server ${t}: unsupported auth type: ${String(e.type)}`);
        if (e.provider !== "jwt_token") throw new Error(`MCP server ${t}: unsupported auth provider: ${String(e.provider)}`);
        return {
            type: "zcode_official",
            provider: "jwt_token"
        }
    }
}

function Aln(e) {
    return {
        mcpKey: e.mcpKey,
        pluginId: e.pluginId,
        source: "plugin"
    }
}
var sVr = Y(() => {
    "use strict";
    r(s6s, "isRecord");
    r(iVr, "parseZCodeOfficialAuth");
    r(Aln, "buildOfficialProvenance")
});

function ore(e) {
    let t = dVr((0, lVr.join)(e.loaded.rootPath, ".mcp.json"), e),
        n = uVr(e.loaded.manifest.mcpServers, e);
    return {
        ...t,
        ...n
    }
}

function Yst(e) {
    let t = e.definitions ?? ore(e),
        n = d6s(e),
        o = {};
    for (let [s, a] of Object.entries(t)) try {
        o[u6s(e.loaded, s)] = f6s(a, n, {
            mcpKey: s,
            pluginId: e.loaded.id
        })
    } catch (l) {
        e.diagnostics.push({
            code: l instanceof F7 ? "plugin_variable_missing" : "plugin_mcp_server_disabled",
            message: l instanceof Error ? l.message : `Invalid MCP server: ${s}`,
            path: e.loaded.manifestPath,
            pluginId: e.loaded.id,
            severity: "error"
        })
    }
    return o
}

function u6s(e, t) {
    return `plugin:${e.manifest.name}:${t}`
}

function uVr(e, t) {
    if (e === void 0) return {};
    if (typeof e == "string") {
        let n = Yx(t.loaded.rootPath, e);
        return n ? dVr(n, t) : (t.diagnostics.push({
            code: "plugin_component_path_invalid",
            message: `Plugin mcpServers path escapes plugin root: ${e}`,
            path: t.loaded.manifestPath,
            pluginId: t.loaded.id,
            severity: "error"
        }), {})
    }
    return Array.isArray(e) ? Object.assign({}, ...e.map(n => uVr(n, t))) : pVr(e, t)
}

function dVr(e, t) {
    try {
        return pVr(JSON.parse((0, cVr.readFileSync)(e, "utf8")), t)
    } catch (n) {
        return Jst(n) ? {} : (t.diagnostics.push({
            code: "plugin_mcp_read_failed",
            message: n instanceof Error ? n.message : `Failed to read MCP config: ${e}`,
            path: e,
            pluginId: t.loaded.id,
            severity: "error"
        }), {})
    }
}

function pVr(e, t) {
    if (!fu(e)) return t.diagnostics.push({
        code: "plugin_mcp_invalid",
        message: "Plugin MCP config must be an object",
        path: t.loaded.manifestPath,
        pluginId: t.loaded.id,
        severity: "error"
    }), {};
    let n = fu(e.mcpServers) ? e.mcpServers : e;
    return Object.fromEntries(Object.entries(n).filter(([, o]) => fu(o)))
}

function d6s(e) {
    return {
        dataPath: e.dataPath,
        env: e.env,
        loaded: e.loaded,
        options: e.options,
        userConfigDefaults: p6s(e.loaded.manifest),
        workingDirectory: e.workingDirectory
    }
}

function p6s(e) {
    let t = {};
    for (let [n, o] of Object.entries(e.userConfig ?? {})) rVr(o.default) && (t[n] = o.default);
    return t
}

function f6s(e, t, n) {
    if (!fu(e)) throw new Error("MCP server config must be an object");
    let o = typeof e.type == "string" ? e.type : h6s(e);
    if (!a6s.has(o)) throw new Error(`Unsupported MCP transport: ${o}`);
    let s = {
            kind: t.loaded.marketplace === Yp ? "builtin" : "plugin"
        },
        a = iVr(e.auth, n.mcpKey);
    if (a && o !== "http" && o !== "stdio") throw new Error(`MCP server ${n.mcpKey}: ${a.type} auth requires type "http" or "stdio", got "${o}"`);
    if (o === "stdio") {
        let g = Zst(e.command, "stdio MCP server requires command");
        if (a && e.oauth !== void 0) throw new Error(`MCP server ${n.mcpKey}: ${a.type} auth cannot be combined with oauth`);
        let _ = aVr({
            CLAUDE_PROJECT_DIR: t.workingDirectory,
            ZCODE_PLUGIN_DATA: t.dataPath,
            ZCODE_PLUGIN_ROOT: t.loaded.rootPath,
            ZCODE_PROJECT_DIR: t.workingDirectory,
            CLAUDE_PLUGIN_DATA: t.dataPath,
            CLAUDE_PLUGIN_ROOT: t.loaded.rootPath,
            ...fu(e.env) ? e.env : {}
        }, t, {
            allowSensitive: !0
        });
        return _[xR] = t.loaded.id, {
            type: "stdio",
            command: IC(g, t, {
                allowSensitive: !1
            }),
            args: Array.isArray(e.args) ? e.args.filter(b => typeof b == "string").map(b => IC(b, t, {
                allowSensitive: !1
            })) : void 0,
            cwd: typeof e.cwd == "string" ? IC(e.cwd, t, {
                allowSensitive: !1
            }) : void 0,
            enabled: typeof e.enabled == "boolean" ? e.enabled : void 0,
            env: _,
            source: s,
            timeoutMs: typeof e.timeoutMs == "number" ? e.timeoutMs : void 0,
            ...a ? {
                auth: a,
                official: Aln(n)
            } : {}
        }
    }
    let l = Zst(e.url, `${o} MCP server requires url`),
        u = fu(e.headers) ? aVr(e.headers, t, {
            allowSensitive: !0
        }) : void 0,
        f = m6s(e.oauth, t);
    if (a) {
        if (f) throw new Error(`MCP server ${n.mcpKey}: ${a.type} auth cannot be combined with oauth`);
        let g = UZe(u);
        if (g.length > 0) throw new Error(`MCP server ${n.mcpKey}: static headers must not contain reserved header(s): ${g.join(", ")}`);
        return {
            type: "http",
            url: IC(l, t, {
                allowSensitive: !1
            }),
            enabled: typeof e.enabled == "boolean" ? e.enabled : void 0,
            headers: u,
            auth: a,
            source: s,
            official: Aln(n),
            timeoutMs: typeof e.timeoutMs == "number" ? e.timeoutMs : void 0
        }
    }
    return {
        type: o,
        url: IC(l, t, {
            allowSensitive: !1
        }),
        enabled: typeof e.enabled == "boolean" ? e.enabled : void 0,
        headers: u,
        oauth: f,
        source: s,
        timeoutMs: typeof e.timeoutMs == "number" ? e.timeoutMs : void 0
    }
}

function m6s(e, t) {
    if (fu(e)) {
        if (e.type === "client_credentials") return {
            type: "client_credentials",
            clientId: IC(Zst(e.clientId, "MCP OAuth client_credentials requires clientId"), t, {
                allowSensitive: !1
            }),
            clientSecret: IC(Zst(e.clientSecret, "MCP OAuth client_credentials requires clientSecret"), t, {
                allowSensitive: !0
            }),
            ...typeof e.clientName == "string" ? {
                clientName: IC(e.clientName, t, {
                    allowSensitive: !1
                })
            } : {},
            ...typeof e.scope == "string" ? {
                scope: IC(e.scope, t, {
                    allowSensitive: !1
                })
            } : {}
        };
        if (e.type === "authorization_code") return {
            type: "authorization_code",
            ...typeof e.clientId == "string" ? {
                clientId: IC(e.clientId, t, {
                    allowSensitive: !1
                })
            } : {},
            ...typeof e.clientSecret == "string" ? {
                clientSecret: IC(e.clientSecret, t, {
                    allowSensitive: !0
                })
            } : {},
            ...typeof e.clientName == "string" ? {
                clientName: IC(e.clientName, t, {
                    allowSensitive: !1
                })
            } : {},
            ...typeof e.redirectPath == "string" ? {
                redirectPath: IC(e.redirectPath, t, {
                    allowSensitive: !1
                })
            } : {},
            ...typeof e.scope == "string" ? {
                scope: IC(e.scope, t, {
                    allowSensitive: !1
                })
            } : {}
        };
        throw new Error(`Unsupported MCP OAuth type: ${String(e.type)}`)
    }
}

function h6s(e) {
    return typeof e.command == "string" ? "stdio" : "http"
}

function Zst(e, t) {
    if (typeof e == "string" && e.length > 0) return e;
    throw new Error(t)
}

function aVr(e, t, n) {
    let o = {};
    for (let [s, a] of Object.entries(e)) typeof a == "string" && (o[s] = IC(a, t, n));
    return o
}

function IC(e, t, n) {
    return e.replace(c6s, (o, s) => {
        switch (s) {
            case "CLAUDE_PLUGIN_ROOT":
            case "ZCODE_PLUGIN_ROOT":
                return t.loaded.rootPath;
            case "CLAUDE_PLUGIN_DATA":
            case "ZCODE_PLUGIN_DATA":
                return t.dataPath;
            case "CLAUDE_PROJECT_DIR":
            case "ZCODE_PROJECT_DIR":
                return t.workingDirectory;
            case "CLAUDE_CODE_SESSION_ID":
            case "CLAUDE_SESSION_ID":
            case "ZCODE_SESSION_ID":
                throw new F7(`Plugin variable requires a runtime session context: ${s}`);
            case "CLAUDE_SKILL_DIR":
            case "ZCODE_SKILL_DIR":
                throw new F7(`Plugin variable requires a skill context: ${s}`);
            default:
                break
        }
        if (s.startsWith("user_config.")) {
            let a = s.slice(12);
            if (t.loaded.manifest.userConfig?.[a]?.sensitive === !0 && !n.allowSensitive) throw new F7(`Sensitive plugin user_config value cannot be used in this field: ${a}`);
            let l = t.options[a] ?? t.userConfigDefaults[a];
            if (l === void 0) throw new F7(`Missing plugin user_config value: ${a}`);
            return String(l)
        }
        if (s.startsWith("ZCODE_")) {
            let a = t.env[s];
            if (a === void 0) throw new F7(`Missing environment variable: ${s}`);
            return a
        }
        if (n.allowSensitive && l6s.test(s)) {
            let a = t.env[s];
            if (a === void 0) throw new F7(`Missing environment variable: ${s}`);
            return a
        }
        return o
    })
}
var cVr, lVr, a6s, c6s, l6s, F7, Xst = Y(() => {
    "use strict";
    cVr = require("node:fs"), lVr = require("node:path");
    gs();
    ar();
    gs();
    L7();
    sVr();
    a6s = new Set(["stdio", "http", "sse"]), c6s = /\$\{([^}]+)\}/g, l6s = /^[A-Za-z_][A-Za-z0-9_]*$/;
    r(ore, "loadPluginMcpServerDefinitions");
    r(Yst, "resolvePluginMcpServers");
    r(u6s, "toNamespacedServerName");
    r(uVr, "loadMcpServersFromSpec");
    r(dVr, "loadMcpServersFromFile");
    r(pVr, "normalizeMcpServersShape");
    r(d6s, "createVariableContext");
    r(p6s, "getUserConfigDefaults");
    r(f6s, "resolveMcpServerConfig");
    r(m6s, "resolveMcpOAuthConfig");
    r(h6s, "inferMcpType");
    r(Zst, "requireString");
    r(aVr, "resolveStringRecord");
    r(IC, "resolveTemplate");
    F7 = class extends Error {
        static {
            r(this, "PluginVariableError")
        }
    }
});

function Rln(e) {
    let t = [],
        n = new Set,
        o = (0, Pln.join)(e.loaded.rootPath, g6s);
    if (vw(o)) {
        let l = fVr({
            diagnostics: e.diagnostics,
            loaded: e.loaded,
            path: o
        });
        l && (t.push(l), n.add(mVr(o)))
    }
    let s = e.loaded.manifest.hooks;
    if (s === void 0) return t;
    let a = Array.isArray(s) ? s : [s];
    for (let l of a) {
        if (typeof l == "string") {
            let u = Yx(e.loaded.rootPath, l);
            if (!u) {
                e.diagnostics.push({
                    code: "plugin_component_path_invalid",
                    message: `Plugin hooks path escapes plugin root: ${l}`,
                    path: e.loaded.manifestPath,
                    pluginId: e.loaded.id,
                    severity: "error"
                });
                continue
            }
            if (!vw(u)) {
                e.diagnostics.push({
                    code: "plugin_hook_read_failed",
                    message: `Plugin hooks file not found: ${l}`,
                    path: u,
                    pluginId: e.loaded.id,
                    severity: "error"
                });
                continue
            }
            let f = mVr(u);
            if (n.has(f)) {
                e.diagnostics.push({
                    code: "plugin_hook_invalid",
                    message: `Duplicate plugin hooks file ignored: ${l}`,
                    path: u,
                    pluginId: e.loaded.id,
                    severity: "warning"
                });
                continue
            }
            let g = fVr({
                diagnostics: e.diagnostics,
                loaded: e.loaded,
                path: u
            });
            g && (t.push(g), n.add(f));
            continue
        }
        t.push({
            rawHooks: l,
            sourcePath: e.loaded.manifestPath,
            wrapper: !1
        })
    }
    return t
}

function hVr(e) {
    let t = [],
        n = new Set;
    for (let o of Rln(e)) {
        let s = o.wrapper ? fu(o.rawHooks) ? o.rawHooks.hooks : void 0 : o.rawHooks;
        if (!fu(s)) {
            e.diagnostics.push({
                code: "plugin_hook_invalid",
                message: o.wrapper ? "Plugin hooks file must contain a hooks object" : "Plugin manifest hooks entry must be an object, a path, or an array",
                path: o.sourcePath,
                pluginId: e.loaded.id,
                severity: "error"
            });
            continue
        }
        for (let a of Object.keys(s)) {
            if (!_6s.has(a)) {
                e.diagnostics.push({
                    code: "plugin_hook_unsupported_event",
                    message: `Plugin hook event is not supported by this ZCode runtime: ${a}`,
                    path: o.sourcePath,
                    pluginId: e.loaded.id,
                    severity: "warning"
                });
                continue
            }
            n.has(a) || (n.add(a), t.push(a))
        }
    }
    return t
}

function fVr(e) {
    try {
        return {
            rawHooks: JSON.parse((0, Qst.readFileSync)(e.path, "utf8")),
            sourcePath: e.path,
            wrapper: !0
        }
    } catch (t) {
        return e.diagnostics.push({
            code: "plugin_hook_read_failed",
            message: t instanceof Error ? t.message : `Failed to read plugin hooks: ${e.path}`,
            path: e.path,
            pluginId: e.loaded.id,
            severity: "error"
        }), null
    }
}

function mVr(e) {
    try {
        return (0, Qst.realpathSync)(e)
    } catch {
        return e
    }
}
var Qst, Pln, g6s, _6s, Dln = Y(() => {
    "use strict";
    Qst = require("node:fs"), Pln = require("node:path");
    ar();
    L7();
    g6s = (0, Pln.join)("hooks", "hooks.json"), _6s = new Set(Object.values(xl));
    r(Rln, "listPluginHookSources");
    r(hVr, "listPluginHookEventNames");
    r(fVr, "loadPluginHookSource");
    r(mVr, "realpathOrSelf")
});

function Oln(e) {
    let t;
    try {
        t = (0, _Vr.readFileSync)(e, "utf8")
    } catch {
        return {}
    }
    return y6s(t)
}

function y6s(e) {
    let t = v6s(e);
    if (t === null) return {};
    let n = b6s(t),
        o = {},
        s = gVr(n.name);
    s && (o.name = s);
    let a = gVr(n.description);
    return a && (o.description = a), o
}

function v6s(e) {
    let t = e.replace(/^﻿/, "");
    if (!t.startsWith("---")) return null;
    let n = t.split(/\r?\n/);
    if (n[0]?.trim() !== "---") return null;
    let o = n.findIndex((s, a) => a > 0 && s.trim() === "---");
    return o <= 0 ? null : n.slice(1, o).join(`
`)
}

function b6s(e) {
    let t = {},
        n = e.split(/\r?\n/);
    for (let o = 0; o < n.length; o += 1) {
        let s = n[o] ?? "";
        if (s.trim().length === 0 || s.trim().startsWith("#") || /^\s/.test(s)) continue;
        let a = s.indexOf(":");
        if (a <= 0) continue;
        let l = s.slice(0, a).trim(),
            u = s.slice(a + 1).trim();
        if (l in t) continue;
        let f = S6s(u);
        if (f) {
            let g = w6s(n, o + 1, f);
            t[l] = g.value, o = g.nextIndex - 1
        } else t[l] = u
    }
    return t
}

function S6s(e) {
    return /^>[+-]?$/.test(e) ? "folded" : /^\|[+-]?$/.test(e) ? "literal" : null
}

function w6s(e, t, n) {
    let o = [],
        s = t;
    for (; s < e.length;) {
        let u = e[s] ?? "";
        if (u.trim().length > 0 && !/^\s/.test(u)) break;
        o.push(u), s += 1
    }
    let a = o.reduce((u, f) => {
            if (f.trim().length === 0) return u;
            let g = k6s(f);
            return u === null ? g : Math.min(u, g)
        }, null),
        l = o.map(u => u.trim().length === 0 ? "" : u.slice(a ?? 0));
    return {
        value: n === "folded" ? x6s(l) : l.join(`
`).trim(),
        nextIndex: s
    }
}

function k6s(e) {
    return /^(\s*)/.exec(e)?.[1]?.length ?? 0
}

function x6s(e) {
    let t = [],
        n = [];
    for (let o of e) {
        let s = o.trim();
        if (s.length === 0) {
            n.length > 0 && (t.push(n.join(" ")), n = []);
            continue
        }
        n.push(s)
    }
    return n.length > 0 && t.push(n.join(" ")), t.join(`
`).trim()
}

function gVr(e) {
    if (e === void 0) return;
    let t = e.trim();
    if (t.length !== 0) return t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'") ? t.slice(1, -1).trim() : t
}
var _Vr, yVr = Y(() => {
    "use strict";
    _Vr = require("node:fs");
    r(Oln, "readMarkdownFrontmatter");
    r(y6s, "parseMarkdownFrontmatter");
    r(v6s, "extractFrontmatter");
    r(b6s, "parseFlatYamlScalars");
    r(S6s, "parseBlockScalarStyle");
    r(w6s, "readBlockScalar");
    r(k6s, "leadingWhitespaceLength");
    r(x6s, "foldBlockScalarLines");
    r(gVr, "parseScalar")
});

function eat(e, t, n = {}) {
    let o = [],
        s = vVr(e, t?.agents, "agents");
    s.length > 0 && o.push({
        kind: "agent",
        items: s
    });
    let a = vVr(e, t?.commands, "commands");
    a.length > 0 && o.push({
        kind: "command",
        items: a
    });
    let l = T6s(e, t?.skills);
    l.length > 0 && o.push({
        kind: "skill",
        items: l
    });
    let u = I6s(t, n);
    u.length > 0 && o.push({
        kind: "hook",
        items: u
    });
    let f = C6s(t, n);
    return f.length > 0 && o.push({
        kind: "mcp",
        items: f
    }), o
}

function vVr(e, t, n) {
    let o = [],
        s = new Set;
    if (fu(t))
        for (let [l, u] of Object.entries(t)) {
            let f = l.trim();
            if (!f || s.has(f)) continue;
            s.add(f);
            let g = fu(u) && typeof u.description == "string" ? u.description.trim() : void 0;
            o.push(g ? {
                name: f,
                description: g
            } : {
                name: f
            })
        }
    let a = SVr(e, t, n);
    for (let l of a) {
        let u;
        try {
            u = (0, bVr.readdirSync)(l, {
                withFileTypes: !0
            }).filter(f => f.isFile() && f.name.endsWith(".md")).map(f => f.name)
        } catch {
            continue
        }
        for (let f of u) {
            let g = f.slice(0, -3),
                _ = Oln((0, ire.join)(l, f)),
                b = _.name ?? g;
            s.has(b) || (s.add(b), o.push(_.description ? {
                name: b,
                description: _.description
            } : {
                name: b
            }))
        }
    }
    return o
}

function T6s(e, t) {
    let n = [],
        o = new Set,
        s = new Set,
        a = SVr(e, t, "skills");
    for (let l of a) {
        let u;
        try {
            u = rOe(l, {
                followSymbolicLinks: !1
            })
        } catch {
            continue
        }
        for (let f of u) {
            if (o.has(f)) continue;
            o.add(f);
            let g = (0, ire.basename)((0, ire.dirname)(f)),
                _ = Oln(f),
                b = _.name ?? g;
            s.has(b) || (s.add(b), n.push(_.description ? {
                name: b,
                description: _.description
            } : {
                name: b
            }))
        }
    }
    return n
}

function I6s(e, t) {
    return t.loaded ? hVr({
        diagnostics: t.diagnostics ?? [],
        loaded: t.loaded
    }).map(n => ({
        name: n
    })) : e ? E6s(e.hooks).map(n => ({
        name: n
    })) : []
}

function C6s(e, t) {
    return t.loaded ? Object.keys(ore({
        diagnostics: t.diagnostics ?? [],
        loaded: t.loaded
    })).map(n => n.trim()).filter(n => n.length > 0).map(n => ({
        name: n
    })) : !e || !fu(e.mcpServers) ? [] : Object.keys(e.mcpServers).map(n => n.trim()).filter(n => n.length > 0).map(n => ({
        name: n
    }))
}

function E6s(e) {
    let t = fu(e) && fu(e.hooks) ? e.hooks : e;
    if (!fu(t)) return [];
    let n = new Set,
        o = [];
    for (let s of Object.keys(t)) {
        let a = s.trim();
        !a || n.has(a) || (n.add(a), o.push(a))
    }
    return o
}

function SVr(e, t, n) {
    let o = [],
        s = new Set,
        a = r(u => {
            let f = Yx(e, u.replace(/^\.\//, ""));
            !f || s.has(f) || (s.add(f), o.push(f))
        }, "add"),
        l = (0, ire.join)(e, n);
    if ($v(l) && a(n), typeof t == "string") a(t);
    else if (Array.isArray(t))
        for (let u of t) typeof u == "string" && a(u);
    return o
}
var bVr, ire, Mln = Y(() => {
    "use strict";
    bVr = require("node:fs"), ire = require("node:path");
    L7();
    Dln();
    yVr();
    Xst();
    Wst();
    r(eat, "enumeratePluginComponents");
    r(vVr, "collectMarkdownComponents");
    r(T6s, "collectSkillComponents");
    r(I6s, "collectHookComponents");
    r(C6s, "collectMcpComponents");
    r(E6s, "collectInlineHookEvents");
    r(SVr, "collectComponentDirs")
});

function Fln(e) {
    return EVr(e.manifest), Bln(iOe(e.storageRoot, kVr), {
        manifest: e.manifest,
        version: 1
    }), IVr(e.storageRoot)
}

function jln(e) {
    return EVr(e.manifest), Bln(iOe(e.storageRoot, xVr), e.manifest), IVr(e.storageRoot)
}

function TVr(e) {
    let t = CVr(e);
    if (!t) return;
    let n = (0, PA.resolve)(e, "cache", Yp);
    return Nln(t.manifest).flatMap(o => {
        let s = Lln(o),
            a = typeof o.cachePath == "string" ? o.cachePath : void 0;
        if (!s || !a) return [];
        let l = (0, PA.resolve)(n, s),
            u = (0, PA.resolve)(a);
        return !wVr(n, l) || !wVr(l, u) ? [] : [u]
    })
}

function IVr(e) {
    let t = CVr(e),
        n = AVr(iOe(e, xVr)),
        o = t?.manifest,
        s = Nln(n),
        a = new Set(s.map(Lln).filter(P6s)),
        l = Nln(o).filter(f => {
            let g = Lln(f);
            return g !== void 0 && !a.has(g)
        }),
        u = {
            ...o ?? {},
            ...n ?? {},
            name: Yp,
            plugins: [...s, ...l]
        };
    return Bln(iOe(e, A6s), u), u
}

function CVr(e) {
    let t = AVr(iOe(e, kVr));
    if (!(!t || t.version !== 1 || !Uln(t.manifest))) return {
        manifest: t.manifest,
        version: 1
    }
}

function Nln(e) {
    return Array.isArray(e?.plugins) ? e.plugins.filter(Uln) : []
}

function Lln(e) {
    return typeof e.name == "string" && e.name.length > 0 ? e.name : void 0
}

function P6s(e) {
    return e !== void 0
}

function wVr(e, t) {
    let n = (0, PA.relative)(e, t);
    return n.length > 0 && !(0, PA.isAbsolute)(n) && n !== ".." && !n.startsWith(`..${PA.sep}`)
}

function EVr(e) {
    if (e.name !== Yp) throw new Error(`Official marketplace manifest must be named ${Yp}`)
}

function iOe(e, t) {
    return (0, PA.join)(e, "marketplaces", Yp, t)
}

function AVr(e) {
    try {
        let t = JSON.parse((0, sre.readFileSync)(e, "utf8"));
        return Uln(t) ? t : void 0
    } catch {
        return
    }
}

function Bln(e, t) {
    let n = `${JSON.stringify(t,null,2)}
`;
    (0, sre.mkdirSync)((0, PA.dirname)(e), {
        recursive: !0
    });
    try {
        if ((0, sre.readFileSync)(e, "utf8") === n) return
    } catch {}(0, sre.writeFileSync)(e, n, "utf8")
}

function Uln(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}
var sre, PA, kVr, xVr, A6s, tat = Y(() => {
    "use strict";
    sre = require("node:fs"), PA = require("node:path");
    ar();
    kVr = "bundled-marketplace.json", xVr = "cdn-marketplace.json", A6s = "marketplace.json";
    r(Fln, "writeBundledOfficialMarketplacePartitionSync");
    r(jln, "writeCdnOfficialMarketplacePartitionSync");
    r(TVr, "loadBundledOfficialPluginRootsSync");
    r(IVr, "rebuildOfficialMarketplaceSync");
    r(CVr, "readBundledPartition");
    r(Nln, "readPluginEntries");
    r(Lln, "readPluginName");
    r(P6s, "isDefined");
    r(wVr, "isStrictDescendant");
    r(EVr, "assertOfficialManifest");
    r(iOe, "partitionPath");
    r(AVr, "readJsonRecord");
    r(Bln, "writeJsonFileSync");
    r(Uln, "isRecord")
});
var OVr = At((kfl, DVr) => {
    DVr.exports = nat;

    function nat() {
        this.pending = 0, this.max = 1 / 0, this.listeners = [], this.waiting = [], this.error = null
    }
    r(nat, "Pend");
    nat.prototype.go = function(e) {
        this.pending < this.max ? RVr(this, e) : this.waiting.push(e)
    };
    nat.prototype.wait = function(e) {
        this.pending === 0 ? e(this.error) : this.listeners.push(e)
    };
    nat.prototype.hold = function() {
        return PVr(this)
    };

    function PVr(e) {
        e.pending += 1;
        var t = !1;
        return n;

        function n(s) {
            if (t) throw new Error("callback called twice");
            if (t = !0, e.error = e.error || s, e.pending -= 1, e.waiting.length > 0 && e.pending < e.max) RVr(e, e.waiting.shift());
            else if (e.pending === 0) {
                var a = e.listeners;
                e.listeners = [], a.forEach(o)
            }
        }

        function o(s) {
            s(e.error)
        }
    }
    r(PVr, "pendHold");

    function RVr(e, t) {
        t(PVr(e))
    }
    r(RVr, "pendGo")
});
var NVr = At(aOe => {
    var sOe = require("fs"),
        rat = require("util"),
        zln = require("stream"),
        MVr = zln.Readable,
        $ln = zln.Writable,
        R6s = zln.PassThrough,
        D6s = OVr(),
        oat = require("events").EventEmitter;
    aOe.createFromBuffer = O6s;
    aOe.createFromFd = M6s;
    aOe.BufferSlicer = B7;
    aOe.FdSlicer = j7;
    rat.inherits(j7, oat);

    function j7(e, t) {
        t = t || {}, oat.call(this), this.fd = e, this.pend = new D6s, this.pend.max = 1, this.refCount = 0, this.autoClose = !!t.autoClose
    }
    r(j7, "FdSlicer");
    j7.prototype.read = function(e, t, n, o, s) {
        var a = this;
        a.pend.go(function(l) {
            sOe.read(a.fd, e, t, n, o, function(u, f, g) {
                l(), s(u, f, g)
            })
        })
    };
    j7.prototype.write = function(e, t, n, o, s) {
        var a = this;
        a.pend.go(function(l) {
            sOe.write(a.fd, e, t, n, o, function(u, f, g) {
                l(), s(u, f, g)
            })
        })
    };
    j7.prototype.createReadStream = function(e) {
        return new iat(this, e)
    };
    j7.prototype.createWriteStream = function(e) {
        return new sat(this, e)
    };
    j7.prototype.ref = function() {
        this.refCount += 1
    };
    j7.prototype.unref = function() {
        var e = this;
        if (e.refCount -= 1, e.refCount > 0) return;
        if (e.refCount < 0) throw new Error("invalid unref");
        e.autoClose && sOe.close(e.fd, t);

        function t(n) {
            n ? e.emit("error", n) : e.emit("close")
        }
        r(t, "onCloseDone")
    };
    rat.inherits(iat, MVr);

    function iat(e, t) {
        t = t || {}, MVr.call(this, t), this.context = e, this.context.ref(), this.start = t.start || 0, this.endOffset = t.end, this.pos = this.start, this.destroyed = !1
    }
    r(iat, "ReadStream");
    iat.prototype._read = function(e) {
        var t = this;
        if (!t.destroyed) {
            var n = Math.min(t._readableState.highWaterMark, e);
            if (t.endOffset != null && (n = Math.min(n, t.endOffset - t.pos)), n <= 0) {
                t.destroyed = !0, t.push(null), t.context.unref();
                return
            }
            t.context.pend.go(function(o) {
                if (t.destroyed) return o();
                var s = Buffer.allocUnsafe(n);
                sOe.read(t.context.fd, s, 0, n, t.pos, function(a, l) {
                    a ? t.destroy(a) : l === 0 ? (t.destroyed = !0, t.push(null), t.context.unref()) : (t.pos += l, t.push(s.slice(0, l))), o()
                })
            })
        }
    };
    iat.prototype.destroy = function(e) {
        this.destroyed || (e = e || new Error("stream destroyed"), this.destroyed = !0, this.emit("error", e), this.context.unref())
    };
    rat.inherits(sat, $ln);

    function sat(e, t) {
        t = t || {}, $ln.call(this, t), this.context = e, this.context.ref(), this.start = t.start || 0, this.endOffset = t.end == null ? 1 / 0 : +t.end, this.bytesWritten = 0, this.pos = this.start, this.destroyed = !1, this.on("finish", this.destroy.bind(this))
    }
    r(sat, "WriteStream");
    sat.prototype._write = function(e, t, n) {
        var o = this;
        if (!o.destroyed) {
            if (o.pos + e.length > o.endOffset) {
                var s = new Error("maximum file length exceeded");
                s.code = "ETOOBIG", o.destroy(), n(s);
                return
            }
            o.context.pend.go(function(a) {
                if (o.destroyed) return a();
                sOe.write(o.context.fd, e, 0, e.length, o.pos, function(l, u) {
                    l ? (o.destroy(), a(), n(l)) : (o.bytesWritten += u, o.pos += u, o.emit("progress"), a(), n())
                })
            })
        }
    };
    sat.prototype.destroy = function() {
        this.destroyed || (this.destroyed = !0, this.context.unref())
    };
    rat.inherits(B7, oat);

    function B7(e, t) {
        oat.call(this), t = t || {}, this.refCount = 0, this.buffer = e, this.maxChunkSize = t.maxChunkSize || Number.MAX_SAFE_INTEGER
    }
    r(B7, "BufferSlicer");
    B7.prototype.read = function(e, t, n, o, s) {
        if (!(0 <= t && t <= e.length)) throw new RangeError("offset outside buffer: 0 <= " + t + " <= " + e.length);
        if (o < 0) throw new RangeError("position is negative: " + o);
        if (t + n > e.length && (n = e.length - t), o + n > this.buffer.length && (n = this.buffer.length - o), n <= 0) {
            setImmediate(function() {
                s(null, 0)
            });
            return
        }
        this.buffer.copy(e, t, o, o + n), setImmediate(function() {
            s(null, n)
        })
    };
    B7.prototype.write = function(e, t, n, o, s) {
        e.copy(this.buffer, o, t, t + n), setImmediate(function() {
            s(null, n, e)
        })
    };
    B7.prototype.createReadStream = function(e) {
        e = e || {};
        var t = new R6s(e);
        t.destroyed = !1, t.start = e.start || 0, t.endOffset = e.end, t.pos = t.endOffset || this.buffer.length;
        for (var n = this.buffer.slice(t.start, t.pos), o = 0;;) {
            var s = o + this.maxChunkSize;
            if (s >= n.length) {
                o < n.length && t.write(n.slice(o, n.length));
                break
            }
            t.write(n.slice(o, s)), o = s
        }
        return t.end(), t.destroy = function() {
            t.destroyed = !0
        }, t
    };
    B7.prototype.createWriteStream = function(e) {
        var t = this;
        e = e || {};
        var n = new $ln(e);
        return n.start = e.start || 0, n.endOffset = e.end == null ? this.buffer.length : +e.end, n.bytesWritten = 0, n.pos = n.start, n.destroyed = !1, n._write = function(o, s, a) {
            if (!n.destroyed) {
                var l = n.pos + o.length;
                if (l > n.endOffset) {
                    var u = new Error("maximum file length exceeded");
                    u.code = "ETOOBIG", n.destroyed = !0, a(u);
                    return
                }
                o.copy(t.buffer, n.pos, 0, o.length), n.bytesWritten += o.length, n.pos = l, n.emit("progress"), a()
            }
        }, n.destroy = function() {
            n.destroyed = !0
        }, n
    };
    B7.prototype.ref = function() {
        this.refCount += 1
    };
    B7.prototype.unref = function() {
        if (this.refCount -= 1, this.refCount < 0) throw new Error("invalid unref")
    };

    function O6s(e, t) {
        return new B7(e, t)
    }
    r(O6s, "createFromBuffer");

    function M6s(e, t) {
        return new j7(e, t)
    }
    r(M6s, "createFromFd")
});
var jVr = At((Cfl, FVr) => {
    var aG = require("buffer").Buffer,
        qln = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
    typeof Int32Array < "u" && (qln = new Int32Array(qln));

    function LVr(e) {
        if (aG.isBuffer(e)) return e;
        var t = typeof aG.alloc == "function" && typeof aG.from == "function";
        if (typeof e == "number") return t ? aG.alloc(e) : new aG(e);
        if (typeof e == "string") return t ? aG.from(e) : new aG(e);
        throw new Error("input must be buffer, number, or string, received " + typeof e)
    }
    r(LVr, "ensureBuffer");

    function N6s(e) {
        var t = LVr(4);
        return t.writeInt32BE(e, 0), t
    }
    r(N6s, "bufferizeInt");

    function Wln(e, t) {
        e = LVr(e), aG.isBuffer(t) && (t = t.readUInt32BE(0));
        for (var n = ~~t ^ -1, o = 0; o < e.length; o++) n = qln[(n ^ e[o]) & 255] ^ n >>> 8;
        return n ^ -1
    }
    r(Wln, "_crc32");

    function Vln() {
        return N6s(Wln.apply(null, arguments))
    }
    r(Vln, "crc32");
    Vln.signed = function() {
        return Wln.apply(null, arguments)
    };
    Vln.unsigned = function() {
        return Wln.apply(null, arguments) >>> 0
    };
    FVr.exports = Vln
});
var JVr = At(v2 => {
    var Hln = require("fs"),
        L6s = require("zlib"),
        BVr = NVr(),
        F6s = jVr(),
        lat = require("util"),
        uat = require("events").EventEmitter,
        UVr = require("stream").Transform,
        Jln = require("stream").PassThrough,
        j6s = require("stream").Writable;
    v2.open = B6s;
    v2.fromFd = zVr;
    v2.fromBuffer = U6s;
    v2.fromRandomAccessReader = Kln;
    v2.dosDateTimeToDate = WVr;
    v2.getFileNameLowLevel = VVr;
    v2.validateFileName = HVr;
    v2.parseExtraFields = GVr;
    v2.ZipFile = nB;
    v2.Entry = L0e;
    v2.LocalFileHeader = qVr;
    v2.RandomAccessReader = cG;

    function B6s(e, t, n) {
        typeof t == "function" && (n = t, t = null), t == null && (t = {}), t.autoClose == null && (t.autoClose = !0), t.lazyEntries == null && (t.lazyEntries = !1), t.decodeStrings == null && (t.decodeStrings = !0), t.validateEntrySizes == null && (t.validateEntrySizes = !0), t.strictFileNames == null && (t.strictFileNames = !1), n == null && (n = cat), Hln.open(e, "r", function(o, s) {
            if (o) return n(o);
            zVr(s, t, function(a, l) {
                a && Hln.close(s, cat), n(a, l)
            })
        })
    }
    r(B6s, "open");

    function zVr(e, t, n) {
        typeof t == "function" && (n = t, t = null), t == null && (t = {}), t.autoClose == null && (t.autoClose = !1), t.lazyEntries == null && (t.lazyEntries = !1), t.decodeStrings == null && (t.decodeStrings = !0), t.validateEntrySizes == null && (t.validateEntrySizes = !0), t.strictFileNames == null && (t.strictFileNames = !1), n == null && (n = cat), Hln.fstat(e, function(o, s) {
            if (o) return n(o);
            var a = BVr.createFromFd(e, {
                autoClose: !0
            });
            Kln(a, s.size, t, n)
        })
    }
    r(zVr, "fromFd");

    function U6s(e, t, n) {
        typeof t == "function" && (n = t, t = null), t == null && (t = {}), t.autoClose = !1, t.lazyEntries == null && (t.lazyEntries = !1), t.decodeStrings == null && (t.decodeStrings = !0), t.validateEntrySizes == null && (t.validateEntrySizes = !0), t.strictFileNames == null && (t.strictFileNames = !1);
        var o = BVr.createFromBuffer(e, {
            maxChunkSize: 65536
        });
        Kln(o, e.length, t, n)
    }
    r(U6s, "fromBuffer");

    function Kln(e, t, n, o) {
        typeof n == "function" && (o = n, n = null), n == null && (n = {}), n.autoClose == null && (n.autoClose = !0), n.lazyEntries == null && (n.lazyEntries = !1), n.decodeStrings == null && (n.decodeStrings = !0);
        var s = !!n.decodeStrings;
        if (n.validateEntrySizes == null && (n.validateEntrySizes = !0), n.strictFileNames == null && (n.strictFileNames = !1), o == null && (o = cat), typeof t != "number") throw new Error("expected totalSize parameter to be a number");
        if (t > Number.MAX_SAFE_INTEGER) throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
        e.ref();
        var a = 22,
            l = 20,
            u = 65535,
            f = Math.min(l + a + u, t),
            g = U7(f),
            _ = t - g.length;
        N0e(e, g, 0, f, _, function(b) {
            if (b) return o(b);
            for (var w = f - a; w >= 0; w -= 1)
                if (g.readUInt32LE(w) === 101010256) {
                    var T = g.subarray(w),
                        I = T.readUInt16LE(4),
                        A = T.readUInt16LE(10),
                        R = T.readUInt32LE(16),
                        L = T.readUInt16LE(20),
                        U = T.length - a;
                    if (L !== U) return o(new Error("Invalid comment length. Expected: " + U + ". Found: " + L + ". Are there extra bytes at the end of the file? Or is the end of central dir signature `PK\u263A\u263B` in the comment?"));
                    var j = s ? aat(T.subarray(22), !1) : T.subarray(22);
                    if (w - l >= 0 && g.readUInt32LE(w - l) === 117853008) {
                        var z = g.subarray(w - l, w - l + l),
                            $ = M0e(z, 8),
                            K = U7(56);
                        return N0e(e, K, 0, K.length, $, function(q) {
                            return q ? o(q) : K.readUInt32LE(0) !== 101075792 ? o(new Error("invalid zip64 end of central directory record signature")) : (I = K.readUInt32LE(16), I !== 0 ? o(new Error("multi-disk zip files are not supported: found disk number: " + I)) : (A = M0e(K, 32), R = M0e(K, 48), o(null, new nB(e, R, t, A, j, n.autoClose, n.lazyEntries, s, n.validateEntrySizes, n.strictFileNames))))
                        })
                    }
                    return I !== 0 ? o(new Error("multi-disk zip files are not supported: found disk number: " + I)) : o(null, new nB(e, R, t, A, j, n.autoClose, n.lazyEntries, s, n.validateEntrySizes, n.strictFileNames))
                } o(new Error("End of central directory record signature not found. Either not a zip file, or file is truncated."))
        })
    }
    r(Kln, "fromRandomAccessReader");
    lat.inherits(nB, uat);

    function nB(e, t, n, o, s, a, l, u, f, g) {
        var _ = this;
        uat.call(_), _.reader = e, _.reader.on("error", function(b) {
            $Vr(_, b)
        }), _.reader.once("close", function() {
            _.emit("close")
        }), _.readEntryCursor = t, _.fileSize = n, _.entryCount = o, _.comment = s, _.entriesRead = 0, _.autoClose = !!a, _.lazyEntries = !!l, _.decodeStrings = !!u, _.validateEntrySizes = !!f, _.strictFileNames = !!g, _.isOpen = !0, _.emittedError = !1, _.lazyEntries || _._readEntry()
    }
    r(nB, "ZipFile");
    nB.prototype.close = function() {
        this.isOpen && (this.isOpen = !1, this.reader.unref())
    };

    function tB(e, t) {
        e.autoClose && e.close(), $Vr(e, t)
    }
    r(tB, "emitErrorAndAutoClose");

    function $Vr(e, t) {
        e.emittedError || (e.emittedError = !0, e.emit("error", t))
    }
    r($Vr, "emitError");
    nB.prototype.readEntry = function() {
        if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
        this._readEntry()
    };
    nB.prototype._readEntry = function() {
        var e = this;
        if (e.entryCount === e.entriesRead) {
            setImmediate(function() {
                e.autoClose && e.close(), !e.emittedError && e.emit("end")
            });
            return
        }
        if (!e.emittedError) {
            var t = U7(46);
            N0e(e.reader, t, 0, t.length, e.readEntryCursor, function(n) {
                if (n) return tB(e, n);
                if (!e.emittedError) {
                    var o = new L0e,
                        s = t.readUInt32LE(0);
                    if (s !== 33639248) return tB(e, new Error("invalid central directory file header signature: 0x" + s.toString(16)));
                    if (o.versionMadeBy = t.readUInt16LE(4), o.versionNeededToExtract = t.readUInt16LE(6), o.generalPurposeBitFlag = t.readUInt16LE(8), o.compressionMethod = t.readUInt16LE(10), o.lastModFileTime = t.readUInt16LE(12), o.lastModFileDate = t.readUInt16LE(14), o.crc32 = t.readUInt32LE(16), o.compressedSize = t.readUInt32LE(20), o.uncompressedSize = t.readUInt32LE(24), o.fileNameLength = t.readUInt16LE(28), o.extraFieldLength = t.readUInt16LE(30), o.fileCommentLength = t.readUInt16LE(32), o.internalFileAttributes = t.readUInt16LE(36), o.externalFileAttributes = t.readUInt32LE(38), o.relativeOffsetOfLocalHeader = t.readUInt32LE(42), o.generalPurposeBitFlag & 64) return tB(e, new Error("strong encryption is not supported"));
                    e.readEntryCursor += 46, t = U7(o.fileNameLength + o.extraFieldLength + o.fileCommentLength), N0e(e.reader, t, 0, t.length, e.readEntryCursor, function(a) {
                        if (a) return tB(e, a);
                        if (!e.emittedError) {
                            o.fileNameRaw = t.subarray(0, o.fileNameLength);
                            var l = o.fileNameLength + o.extraFieldLength;
                            o.extraFieldRaw = t.subarray(o.fileNameLength, l), o.fileCommentRaw = t.subarray(l, l + o.fileCommentLength);
                            try {
                                o.extraFields = GVr(o.extraFieldRaw)
                            } catch (A) {
                                return tB(e, A)
                            }
                            if (e.decodeStrings) {
                                var u = (o.generalPurposeBitFlag & 2048) !== 0;
                                o.fileComment = aat(o.fileCommentRaw, u), o.fileName = VVr(o.generalPurposeBitFlag, o.fileNameRaw, o.extraFields, e.strictFileNames);
                                var f = HVr(o.fileName);
                                if (f != null) return tB(e, new Error(f))
                            } else o.fileComment = o.fileCommentRaw, o.fileName = o.fileNameRaw;
                            o.comment = o.fileComment, e.readEntryCursor += t.length, e.entriesRead += 1;
                            for (var g = 0; g < o.extraFields.length; g++) {
                                var _ = o.extraFields[g];
                                if (_.id === 1) {
                                    var b = _.data,
                                        w = 0;
                                    if (o.uncompressedSize === 4294967295) {
                                        if (w + 8 > b.length) return tB(e, new Error("zip64 extended information extra field does not include uncompressed size"));
                                        o.uncompressedSize = M0e(b, w), w += 8
                                    }
                                    if (o.compressedSize === 4294967295) {
                                        if (w + 8 > b.length) return tB(e, new Error("zip64 extended information extra field does not include compressed size"));
                                        o.compressedSize = M0e(b, w), w += 8
                                    }
                                    if (o.relativeOffsetOfLocalHeader === 4294967295) {
                                        if (w + 8 > b.length) return tB(e, new Error("zip64 extended information extra field does not include relative header offset"));
                                        o.relativeOffsetOfLocalHeader = M0e(b, w), w += 8
                                    }
                                    break
                                }
                            }
                            if (e.validateEntrySizes && o.compressionMethod === 0) {
                                var T = o.uncompressedSize;
                                if (o.isEncrypted() && (T += 12), o.compressedSize !== T) {
                                    var I = "compressed/uncompressed size mismatch for stored file: " + o.compressedSize + " != " + o.uncompressedSize;
                                    return tB(e, new Error(I))
                                }
                            }
                            e.emit("entry", o), e.lazyEntries || e._readEntry()
                        }
                    })
                }
            })
        }
    };
    nB.prototype.openReadStream = function(e, t, n) {
        var o = this,
            s = 0,
            a = e.compressedSize;
        if (n == null && (n = t, t = null), t == null) t = {};
        else {
            if (t.decodeFileData === !1) {
                if (t.decrypt != null) throw new Error("cannot use options.decrypt when options.decodeFileData === false");
                if (t.decompress != null) throw new Error("cannot use options.decompress when options.decodeFileData === false")
            } else {
                if (t.decrypt != null) {
                    if (!e.isEncrypted()) throw new Error("options.decrypt can only be specified for encrypted entries. See also option decodeFileData.");
                    if (t.decrypt !== !1) throw new Error("invalid options.decrypt value: " + t.decrypt);
                    if (e.isCompressed() && t.decompress !== !1) throw new Error("entry is encrypted and compressed, and options.decompress !== false. See also option decodeFileData.")
                }
                if (t.decompress != null) {
                    if (!e.isCompressed()) throw new Error("options.decompress can only be specified for compressed entries. See also option decodeFileData.");
                    if (!(t.decompress === !1 || t.decompress === !0)) throw new Error("invalid options.decompress value: " + t.decompress);
                    u = t.decompress
                }
            }
            if (t.start != null) {
                if (s = t.start, s < 0) throw new Error("options.start < 0");
                if (s > e.compressedSize) throw new Error("options.start > entry.compressedSize")
            }
            if (t.end != null) {
                if (a = t.end, a < 0) throw new Error("options.end < 0");
                if (a > e.compressedSize) throw new Error("options.end > entry.compressedSize");
                if (a < s) throw new Error("options.end < options.start")
            }
        }
        var l = t.decodeFileData === !1 || (e.compressionMethod === 0 || e.compressionMethod === 8 && t.decompress === !1) && (!e.isEncrypted() || t.decrypt === !1);
        if ((t.start != null || t.end != null) && !l) throw new Error("start/end range require options.decodeFileData === false for non-trivial encoded entries.");
        if (!o.isOpen) return n(new Error("closed"));
        if (e.isEncrypted() && !l && t.decrypt !== !1) return n(new Error("entry is encrypted, and options.decodeFileData !== false"));
        var u;
        if (l) u = !1;
        else if (e.compressionMethod === 8) u = t.decodeFileData !== !0;
        else return n(new Error("unsupported compression method: " + e.compressionMethod));
        o.readLocalFileHeader(e, {
            minimal: !0
        }, function(f, g) {
            if (f) return n(f);
            o.openReadStreamLowLevel(g.fileDataStart, e.compressedSize, s, a, u, e.uncompressedSize, n)
        })
    };
    nB.prototype.openReadStreamLowLevel = function(e, t, n, o, s, a, l) {
        var u = this,
            f = e + t,
            g = u.reader.createReadStream({
                start: e + n,
                end: e + o
            }),
            _ = g;
        if (s) {
            var b = !1,
                w = L6s.createInflateRaw();
            g.on("error", function(T) {
                setImmediate(function() {
                    b || w.emit("error", T)
                })
            }), g.pipe(w), u.validateEntrySizes ? (_ = new cOe(a), w.on("error", function(T) {
                setImmediate(function() {
                    b || _.emit("error", T)
                })
            }), w.pipe(_)) : _ = w, Gln(_, function() {
                b = !0, w !== _ && w.unpipe(_), g.unpipe(w), g.destroy()
            })
        }
        l(null, _)
    };
    nB.prototype.readLocalFileHeader = function(e, t, n) {
        var o = this;
        n == null && (n = t, t = null), t == null && (t = {}), o.reader.ref();
        var s = U7(30);
        N0e(o.reader, s, 0, s.length, e.relativeOffsetOfLocalHeader, function(a) {
            try {
                if (a) return n(a);
                var l = s.readUInt32LE(0);
                if (l !== 67324752) return n(new Error("invalid local file header signature: 0x" + l.toString(16)));
                var u = s.readUInt16LE(26),
                    f = s.readUInt16LE(28),
                    g = e.relativeOffsetOfLocalHeader + 30 + u + f;
                if (g + e.compressedSize > o.fileSize) return n(new Error("file data overflows file bounds: " + g + " + " + e.compressedSize + " > " + o.fileSize));
                if (t.minimal) return n(null, {
                    fileDataStart: g
                });
                var _ = new qVr;
                _.fileDataStart = g, _.versionNeededToExtract = s.readUInt16LE(4), _.generalPurposeBitFlag = s.readUInt16LE(6), _.compressionMethod = s.readUInt16LE(8), _.lastModFileTime = s.readUInt16LE(10), _.lastModFileDate = s.readUInt16LE(12), _.crc32 = s.readUInt32LE(14), _.compressedSize = s.readUInt32LE(18), _.uncompressedSize = s.readUInt32LE(22), _.fileNameLength = u, _.extraFieldLength = f, s = U7(u + f), o.reader.ref(), N0e(o.reader, s, 0, s.length, e.relativeOffsetOfLocalHeader + 30, function(b) {
                    try {
                        return b ? n(b) : (_.fileName = s.subarray(0, u), _.extraField = s.subarray(u), n(null, _))
                    } finally {
                        o.reader.unref()
                    }
                })
            } finally {
                o.reader.unref()
            }
        })
    };

    function L0e() {}
    r(L0e, "Entry");
    L0e.prototype.getLastModDate = function(e) {
        if (e == null && (e = {}), !e.forceDosFormat)
            for (var t = 0; t < this.extraFields.length; t++) {
                var n = this.extraFields[t];
                if (n.id === 21589) {
                    var o = n.data;
                    if (o.length < 5) continue;
                    var s = o[0],
                        a = 1;
                    if (!(s & a)) continue;
                    var l = o.readInt32LE(1);
                    return new Date(l * 1e3)
                } else if (n.id === 10) {
                    var o = n.data;
                    if (o.length !== 32 || o.readUInt16LE(4) !== 1 || o.readUInt16LE(6) !== 24) continue;
                    var u = o.readUInt32LE(8) + 4294967296 * o.readInt32LE(12),
                        f = u / 1e4 - 116444736e5;
                    return new Date(f)
                }
            }
        return WVr(this.lastModFileDate, this.lastModFileTime, e.timezone)
    };
    L0e.prototype.canDecodeFileData = function() {
        return !this.isEncrypted() && (this.compressionMethod === 0 || this.compressionMethod === 8)
    };
    L0e.prototype.isEncrypted = function() {
        return (this.generalPurposeBitFlag & 1) !== 0
    };
    L0e.prototype.isCompressed = function() {
        return this.compressionMethod === 8
    };

    function qVr() {}
    r(qVr, "LocalFileHeader");

    function WVr(e, t, n) {
        var o = e & 31,
            s = (e >> 5 & 15) - 1,
            a = (e >> 9 & 127) + 1980,
            l = 0,
            u = (t & 31) * 2,
            f = t >> 5 & 63,
            g = t >> 11 & 31;
        if (n == null || n === "local") return new Date(a, s, o, g, f, u, l);
        if (n === "UTC") return new Date(Date.UTC(a, s, o, g, f, u, l));
        throw new Error("unrecognized options.timezone: " + options.timezone)
    }
    r(WVr, "dosDateTimeToDate");

    function VVr(e, t, n, o) {
        for (var s = null, a = 0; a < n.length; a++) {
            var l = n[a];
            if (l.id === 28789) {
                if (l.data.length < 6 || l.data.readUInt8(0) !== 1) continue;
                var u = l.data.readUInt32LE(1);
                if (F6s.unsigned(t) !== u) continue;
                s = aat(l.data.subarray(5), !0);
                break
            }
        }
        if (s == null) {
            var f = (e & 2048) !== 0;
            s = aat(t, f)
        }
        return o || (s = s.replace(/\\/g, "/")), s
    }
    r(VVr, "getFileNameLowLevel");

    function HVr(e) {
        return e.indexOf("\\") !== -1 ? "invalid characters in fileName: " + e : /^[a-zA-Z]:/.test(e) || /^\//.test(e) ? "absolute path: " + e : e.split("/").indexOf("..") !== -1 ? "invalid relative path: " + e : null
    }
    r(HVr, "validateFileName");

    function GVr(e) {
        for (var t = [], n = 0; n < e.length - 3;) {
            var o = e.readUInt16LE(n + 0),
                s = e.readUInt16LE(n + 2),
                a = n + 4,
                l = a + s;
            if (l > e.length) throw new Error("extra field length exceeds extra field buffer size");
            var u = e.subarray(a, l);
            t.push({
                id: o,
                data: u
            }), n = l
        }
        return t
    }
    r(GVr, "parseExtraFields");

    function N0e(e, t, n, o, s, a) {
        if (o === 0) return setImmediate(function() {
            a(null, U7(0))
        });
        e.read(t, n, o, s, function(l, u) {
            if (l) return a(l);
            if (u < o) return a(new Error("unexpected EOF"));
            a()
        })
    }
    r(N0e, "readAndAssertNoEof");
    lat.inherits(cOe, UVr);

    function cOe(e) {
        UVr.call(this), this.actualByteCount = 0, this.expectedByteCount = e
    }
    r(cOe, "AssertByteCountStream");
    cOe.prototype._transform = function(e, t, n) {
        if (this.actualByteCount += e.length, this.actualByteCount > this.expectedByteCount) {
            var o = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
            return n(new Error(o))
        }
        n(null, e)
    };
    cOe.prototype._flush = function(e) {
        if (this.actualByteCount < this.expectedByteCount) {
            var t = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
            return e(new Error(t))
        }
        e()
    };
    lat.inherits(cG, uat);

    function cG() {
        uat.call(this), this.refCount = 0
    }
    r(cG, "RandomAccessReader");
    cG.prototype.ref = function() {
        this.refCount += 1
    };
    cG.prototype.unref = function() {
        var e = this;
        if (e.refCount -= 1, e.refCount > 0) return;
        if (e.refCount < 0) throw new Error("invalid unref");
        e.close(t);

        function t(n) {
            if (n) return e.emit("error", n);
            e.emit("close")
        }
        r(t, "onCloseDone")
    };
    cG.prototype.createReadStream = function(e) {
        e == null && (e = {});
        var t = e.start,
            n = e.end;
        if (t === n) {
            var o = new Jln;
            return setImmediate(function() {
                o.end()
            }), o
        }
        var s = this._readStreamForRange(t, n),
            a = !1,
            l = new dat(this);
        s.on("error", function(f) {
            setImmediate(function() {
                a || l.emit("error", f)
            })
        }), Gln(l, function() {
            s.unpipe(l), l.unref(), s.destroy()
        });
        var u = new cOe(n - t);
        return l.on("error", function(f) {
            setImmediate(function() {
                a || u.emit("error", f)
            })
        }), Gln(u, function() {
            a = !0, l.unpipe(u), l.destroy()
        }), s.pipe(l).pipe(u)
    };
    cG.prototype._readStreamForRange = function(e, t) {
        throw new Error("not implemented")
    };
    cG.prototype.read = function(e, t, n, o, s) {
        var a = this.createReadStream({
                start: o,
                end: o + n
            }),
            l = new j6s,
            u = 0;
        l._write = function(f, g, _) {
            f.copy(e, t + u, 0, f.length), u += f.length, _()
        }, l.on("finish", s), a.on("error", function(f) {
            s(f)
        }), a.pipe(l)
    };
    cG.prototype.close = function(e) {
        setImmediate(e)
    };
    lat.inherits(dat, Jln);

    function dat(e) {
        Jln.call(this), this.context = e, this.context.ref(), this.unreffedYet = !1
    }
    r(dat, "RefUnrefFilter");
    dat.prototype._flush = function(e) {
        this.unref(), e()
    };
    dat.prototype.unref = function(e) {
        this.unreffedYet || (this.unreffedYet = !0, this.context.unref())
    };
    var z6s = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0";

    function aat(e, t) {
        if (t) return e.toString("utf8");
        for (var n = "", o = 0; o < e.length; o++) n += z6s[e[o]];
        return n
    }
    r(aat, "decodeBuffer");

    function M0e(e, t) {
        var n = e.readUInt32LE(t),
            o = e.readUInt32LE(t + 4);
        return o * 4294967296 + n
    }
    r(M0e, "readUInt64LE");
    var U7;
    typeof Buffer.allocUnsafe == "function" ? U7 = r(function(e) {
        return Buffer.allocUnsafe(e)
    }, "newBuffer") : U7 = r(function(e) {
        return new Buffer(e)
    }, "newBuffer");

    function Gln(e, t) {
        typeof e.destroy == "function" ? e._destroy = function(n, o) {
            t(), o?.(n)
        } : e.destroy = t
    }
    r(Gln, "installDestroyFn");

    function cat(e) {
        if (e) throw e
    }
    r(cat, "defaultCallback")
});
async function rHr(e) {
    return H6s(e), await Yln({
        headers: e.headers,
        path: e.path,
        sha256: e.sha256,
        signal: e.signal,
        stripRoot: e.stripRoot,
        url: e.url
    })
}
async function Yln(e) {
    if (Qln(e.url), iHr(e.headers), e.path !== void 0 && pat(e.path), e.sha256 !== void 0 && !nHr.test(e.sha256.toLowerCase())) throw new Error("Plugin zip source sha256 must be a 64 character hex string");
    let t = await (0, OF.mkdtemp)((0, Hy.join)((0, QVr.tmpdir)(), W6s)),
        n = (0, Hy.join)(t, "source.zip"),
        o = (0, Hy.join)(t, "extract"),
        s = r(async () => {
            await (0, OF.rm)(t, {
                force: !0,
                recursive: !0
            })
        }, "cleanup");
    try {
        eun(e.signal);
        let a = await G6s({
                headers: e.headers,
                signal: e.signal,
                url: e.url
            }),
            l = (0, XVr.createHash)("sha256").update(a).digest("hex");
        if (e.sha256 !== void 0 && l !== e.sha256.toLowerCase()) throw new Error(`Plugin zip sha256 mismatch: expected=${e.sha256.toLowerCase()}, actual=${l}`);
        await (0, OF.writeFile)(n, a);
        let u = await J6s({
                archivePath: n,
                signal: e.signal,
                targetRoot: o
            }),
            f = K6s({
                extractRoot: o,
                path: e.path,
                requireSingleRoot: e.requireSingleRoot,
                stripRoot: e.stripRoot,
                topLevelSegments: u.topLevelSegments
            });
        return {
            cleanup: s,
            path: f
        }
    } catch (a) {
        let l = await zg(s);
        throw TC(a, l)
    }
}

function oHr(e) {
    if (Xln(e)) return e.sha256
}

function Xln(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) && "source" in e && e.source === "url" && e.type === "zip" && typeof e.url == "string" && typeof e.sha256 == "string"
}

function H6s(e) {
    if (Qln(e.url), !nHr.test(e.sha256.toLowerCase())) throw new Error("Plugin zip source sha256 must be a 64 character hex string");
    iHr(e.headers), e.path !== void 0 && pat(e.path)
}
async function G6s(e) {
    let t = b3({
            env: process.env,
            maxResponseBytes: KVr,
            timeoutMs: q6s
        }),
        n = e.url,
        o = e.headers;
    for (let s = 0; s <= $6s; s += 1) {
        eun(e.signal), Qln(n);
        let a = await t.request({
            headers: o,
            maxResponseBytes: KVr,
            method: "GET",
            redirect: "manual",
            url: n
        }, {
            signal: e.signal
        });
        if (njs(a.status)) {
            let l = a.headers.location;
            if (!l) throw new Error(`Plugin zip download redirect is missing Location header: ${n}`);
            let u = new URL(l, n);
            u.origin !== new URL(n).origin && (o = void 0), n = u.toString();
            continue
        }
        if (a.status < 200 || a.status >= 300) throw new lOe(`Failed to download plugin zip: ${a.status} ${a.statusText}`, n, a.status);
        return a.body
    }
    throw new Error(`Plugin zip download exceeded redirect limit: ${e.url}`)
}
async function J6s(e) {
    let t = (0, Hy.resolve)(e.targetRoot);
    await (0, OF.mkdir)(t, {
        recursive: !0
    });
    let n = await Y6s(e.archivePath),
        o = new Set,
        s = 0,
        a = 0;
    try {
        await new Promise((l, u) => {
            let f = r(g => {
                n.close(), u(g)
            }, "rejectOnce");
            n.once("error", f), n.once("end", () => {
                n.removeListener("error", f), l()
            }), n.on("entry", g => {
                (async () => {
                    try {
                        if (eun(e.signal), s += 1, s > YVr) throw new Error(`Plugin zip has too many entries: ${s}/${YVr}`);
                        let _ = pat(g.fileName);
                        o.add(_.split("/")[0] ?? _);
                        let b = Zln(t, _);
                        if (Q6s(g) === "directory") {
                            await (0, OF.mkdir)(b, {
                                recursive: !0
                            }), n.readEntry();
                            return
                        }
                        if (g.uncompressedSize > tHr) throw new Error(`Plugin zip entry exceeds single file limit: ${g.fileName}`);
                        let T = await X6s(n, g, e.signal);
                        if (a += T.byteLength, a > ZVr) throw new Error(`Plugin zip extracted content exceeds limit: ${a}/${ZVr}`);
                        await (0, OF.mkdir)((0, Hy.dirname)(b), {
                            recursive: !0
                        }), await (0, OF.writeFile)(b, T), n.readEntry()
                    } catch (_) {
                        f(_)
                    }
                })()
            }), n.readEntry()
        })
    } finally {
        n.close()
    }
    return {
        topLevelSegments: o
    }
}

function K6s(e) {
    let t = (0, Hy.resolve)(e.extractRoot);
    if (e.requireSingleRoot && e.topLevelSegments.size !== 1) throw new Error(`Plugin zip must contain exactly one top-level directory: ${e.topLevelSegments.size}`);
    if (e.path !== void 0) {
        let n = Zln(t, pat(e.path));
        if (!$v(n)) throw new Error(`Plugin zip source subdirectory does not exist: ${e.path}`);
        return n
    }
    if (Z6s(t)) return t;
    if (e.stripRoot !== !1 && e.topLevelSegments.size === 1) {
        let [n] = [...e.topLevelSegments];
        if (n) {
            let o = Zln(t, n);
            if ($v(o)) return o
        }
    }
    if (!$v(t)) throw new Error("Plugin zip did not extract a plugin root directory");
    return t
}

function Z6s(e) {
    return vw((0, Hy.join)(e, ".zcode-plugin", "plugin.json")) || vw((0, Hy.join)(e, ".claude-plugin", "plugin.json")) || vw((0, Hy.join)(e, ".codex-plugin", "plugin.json"))
}

function Y6s(e) {
    return new Promise((t, n) => {
        eHr.open(e, {
            lazyEntries: !0,
            validateEntrySizes: !0
        }, (o, s) => {
            if (o) {
                n(o);
                return
            }
            if (!s) {
                n(new Error("Failed to open plugin zip archive"));
                return
            }
            t(s)
        })
    })
}

function X6s(e, t, n) {
    return new Promise((o, s) => {
        e.openReadStream(t, (a, l) => {
            if (a) {
                s(a);
                return
            }
            if (!l) {
                s(new Error(`Failed to read plugin zip entry: ${t.fileName}`));
                return
            }
            let u = [],
                f = 0,
                g = r(() => {
                    n?.removeEventListener("abort", _)
                }, "cleanup"),
                _ = r(() => {
                    l.destroy(new Error("Plugin operation cancelled"))
                }, "onAbort");
            n?.addEventListener("abort", _, {
                once: !0
            }), l.on("data", b => {
                let w = Buffer.isBuffer(b) ? b : Buffer.from(b);
                if (f += w.byteLength, f > tHr) {
                    l.destroy(new Error(`Plugin zip entry exceeds single file limit: ${t.fileName}`));
                    return
                }
                u.push(w)
            }), l.once("error", b => {
                g(), s(b)
            }), l.once("end", () => {
                g(), o(Buffer.concat(u))
            })
        })
    })
}

function Q6s(e) {
    let t = e.fileName.endsWith("/");
    if ((e.generalPurposeBitFlag & 1) !== 0) throw new Error(`Encrypted plugin zip entries are not supported: ${e.fileName}`);
    let o = e.externalFileAttributes >>> 16 & 65535 & 61440;
    if (o === 40960) throw new Error(`Plugin zip entry symlinks are not supported: ${e.fileName}`);
    if (o !== 0 && o !== 32768 && o !== 16384) throw new Error(`Unsupported plugin zip entry type: ${e.fileName}`);
    return o === 16384 || t ? "directory" : "file"
}

function pat(e) {
    if (e.includes("\0")) throw new Error(`Unsafe plugin zip path: ${e}`);
    let t = e.replace(/\/+$/u, "");
    if (!t || e.includes("\\") || (0, Hy.isAbsolute)(e) || Hy.posix.isAbsolute(e) || /^[a-zA-Z]:/u.test(e)) throw new Error(`Unsafe plugin zip path: ${e}`);
    if (t.split("/").some(o => !o || o === "." || o === "..")) throw new Error(`Unsafe plugin zip path: ${e}`);
    return t
}

function Zln(e, t) {
    let n = (0, Hy.resolve)(e),
        o = (0, Hy.resolve)(n, ...t.split("/")),
        s = (0, Hy.relative)(n, o);
    if (s === "" || s === ".." || s.startsWith(`..${Hy.sep}`) || (0, Hy.isAbsolute)(s)) throw new Error(`Unsafe plugin zip path: ${t}`);
    return o
}

function iHr(e) {
    if (e)
        for (let [t, n] of Object.entries(e)) {
            if (V6s.has(t.toLowerCase())) throw new Error(`Plugin zip source header is not allowed: ${t}`);
            if (typeof n != "string") throw new Error(`Plugin zip source header must be a string: ${t}`)
        }
}

function Qln(e) {
    let t;
    try {
        t = new URL(e)
    } catch {
        throw new Error(`Plugin zip source URL is invalid: ${e}`)
    }
    if (t.protocol !== "https:" && !(t.protocol === "http:" && ejs(t.hostname))) throw new Error(`Plugin zip source URL must be HTTPS: ${e}`)
}

function ejs(e) {
    let t = e.toLowerCase();
    return t === "localhost" || t === "::1" || t === "[::1]" || tjs(t)
}

function tjs(e) {
    return /^127(?:\.(\d{1,3})){3}$/u.exec(e) ? e.split(".").every(n => Number.parseInt(n, 10) >= 0 && Number.parseInt(n, 10) <= 255) : !1
}

function njs(e) {
    return e === 301 || e === 302 || e === 303 || e === 307 || e === 308
}

function eun(e) {
    if (e?.aborted) {
        let t = new Error("Plugin operation cancelled");
        throw t.name = "AbortError", t
    }
}
var XVr, OF, QVr, Hy, eHr, KVr, ZVr, YVr, tHr, $6s, q6s, W6s, V6s, nHr, lOe, tun = Y(() => {
    "use strict";
    XVr = require("node:crypto"), OF = require("node:fs/promises"), QVr = require("node:os"), Hy = require("node:path"), eHr = Ii(JVr(), 1);
