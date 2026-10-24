                    signal: t.signal,
                    traceContext: t.traceContext,
                    workingDirectory: t.workingDirectory ?? process.cwd()
                });
            return yYt({
                argumentCount: s.argumentCount,
                body: a,
                command: o,
                usedArgumentsPlaceholder: s.usedArgumentsPlaceholder
            }).prompt
        }
        return kgr({
            args: n.args,
            command: o
        }).prompt
    } catch (o) {
        if (o instanceof Error && nqa.test(o.message)) return;
        throw o
    }
}

function oqa(e) {
    let t = rqa.exec(e.trim());
    return t?.[1] ? {
        args: t[2]?.trim() ?? "",
        name: t[1].toLowerCase()
    } : null
}
var nqa, rqa, kqo = Y(() => {
    "use strict";
    ar();
    Ywt();
    vqo();
    Xwt();
    nqa = /not found/i, rqa = /^\/([^\s]+)(?:\s+([\s\S]*))?$/;
    r(wqo, "resolveZCodeCustomCommandPrompt");
    r(oqa, "parsePromptCustomCommandInvocation")
});

function xqo(e, t = {}) {
    let n = sqa(e);
    if (!n || n.name !== "init") return;
    let o = t.workingDirectory ?? process.cwd();
    return aqa({
        args: n.args,
        targetPath: (0, Qwt.join)(o, "AGENTS.md"),
        workingDirectory: o
    })
}

function sqa(e) {
    let t = iqa.exec(e.trim());
    return t?.[1] ? {
        args: t[2]?.trim() ?? "",
        name: t[1].toLowerCase()
    } : null
}

function aqa(e) {
    let t = e.args ? ["", "Additional user instructions supplied with /init:", "```text", e.args, "```"].join(`
`) : "";
    return ["You are running ZCode's built-in /init command.", "", "Your task is to create or update a concise workspace instruction file for future ZCode agents.", "", "Target:", `- Workspace directory: ${e.workingDirectory}`, `- Instruction file: ${e.targetPath}`, `- Existing hidden instruction candidates: ${(0,Qwt.join)(e.workingDirectory,".zcode","AGENTS.md")} and ${(0,Qwt.join)(e.workingDirectory,".agents","AGENTS.md")}`, "- File name must be exactly AGENTS.md.", "- This command targets the current workspace only. Do not write ~/.zcode/AGENTS.md.", t, "", "Process:", "1. First check whether .zcode/AGENTS.md or .agents/AGENTS.md exists in the workspace. If either exists, tell the user they already have an instructions file, mention the path found, and stop without creating a new AGENTS.md.", "2. Inspect the repository before writing. Prefer Read, Glob, Grep, and safe Bash commands such as ls, find, git status, and package-manager script inspection.", "3. If AGENTS.md already exists, read it first and update it with Edit instead of replacing it wholesale.", "4. If AGENTS.md does not exist, create it at the workspace root.", "5. Keep the file practical and short enough for future agents to read quickly.", "6. Include only project-specific facts future ZCode agents would otherwise miss.", "7. Ask the user only if a repository-specific decision cannot be inferred and would materially change the file.", "", "Recommended AGENTS.md content:", "- Repository purpose and major directories.", "- Build, typecheck, lint, and focused test commands discovered from the repo.", "- Architecture boundaries and layer rules that matter for edits.", "- Coding conventions, import/path rules, logging rules, UI/design rules, and platform compatibility constraints if present.", "- Known gotchas for desktop app, web, remote, stdio, protocols, or agent runtime if this repo has them.", "- Any documentation files that agents should read before changing sensitive areas.", "", "After creating or editing AGENTS.md, summarize the main sections you wrote and mention the file path."].join(`
`)
}
var Qwt, iqa, Tqo = Y(() => {
    "use strict";
    Qwt = require("node:path"), iqa = /^\/([^\s]+)(?:\s+([\s\S]*))?$/;
    r(xqo, "resolveZCodeBuiltinPromptCommand");
    r(sqa, "parseBuiltinPromptCommandInvocation");
    r(aqa, "buildInitAgentsPrompt")
});
async function Iqo(e) {
    let t = await aqt((0, PK.join)(e.storageRoot, "agents"));
    await sqt((0, PK.join)(e.storageRoot, "v2", "agents-state.json"));
    let n = [{
            path: (0, PK.join)(e.storageRoot, "agents"),
            source: "user"
        }, {
            path: (0, PK.join)(e.workingDirectory, ".zcode", "agents"),
            source: "project"
        }],
        o = [];
    for (let l of t.failures) o.push({
        code: "agent_read_failed",
        message: "Subagent Markdown migration failed; original file preserved",
        path: l.path
    }), e.logger?.warn("Subagent Markdown migration failed", {
        module: "bootstrap.subagents",
        path: l.path,
        error: String(l.error)
    });
    let s = mqa(e.storageRoot),
        a = [];
    for (let l of n)
        for (let u of Eqo(l.path)) {
            let f = (0, T8.readFileSync)(u, "utf8"),
                g = $yn({
                    content: f,
                    path: u,
                    source: l.source
                });
            if (g.diagnostic && (o.push(g.diagnostic), e.logger?.warn("Agent profile diagnostic", {
                    code: g.diagnostic.code,
                    message: g.diagnostic.message,
                    module: "bootstrap.subagents",
                    path: u
                })), g.profile) {
                let _ = lqa(g.profile);
                if (gqa(_, s.disabledAgentIds)) continue;
                a.push(_)
            }
        }
    return e.logger?.debug("Agent profiles loaded", {
        diagnosticCount: o.length,
        module: "bootstrap.subagents",
        profileCount: a.length
    }), {
        builtInModelSelectionOverrides: s.builtInModelSelectionOverrides,
        pluginAgentModelSelectionOverrides: s.pluginAgentModelSelectionOverrides,
        diagnostics: o,
        profiles: a
    }
}

function lqa(e) {
    if (e.source !== "project" || e.permissionMode === void 0) return e;
    let {
        permissionMode: t,
        ...n
    } = e;
    return n
}

function Cqo(e) {
    let t = [],
        n = [],
        o = new Set([...cqa, ...e.reservedProfileNames ?? []]);
    for (let l of e.plugins) {
        if (!l.enabled) continue;
        let u = l.components.find(f => f.kind === "agent")?.items ?? [];
        for (let f of u) {
            let g = (0, PK.join)(l.rootPath, "agents", `${f.name}.md`),
                _ = uqa({
                    filePath: g,
                    logger: e.logger,
                    plugin: l
                });
            _.diagnostic && t.push(_.diagnostic), _.parsed && n.push(_.parsed)
        }
    }
    let s = fqa(n),
        a = [];
    for (let l of n) {
        let u = e.modelSelectionOverrides?.[tqt(l.plugin.id, l.bareName)],
            f = {
                ...dqa(l),
                ...u ? {
                    modelSelection: u
                } : {}
            };
        a.push(f);
        let g = l.bareName.trim();
        s.get(g) === 1 && !o.has(g) ? a.push({
            ...f,
            name: g
        }) : o.has(g) ? t.push({
            code: "agent_ambiguous_name",
            message: `Plugin agent bare name conflicts with an existing profile; use ${f.name}: ${g}`,
            path: f.path
        }) : (s.get(g) ?? 0) > 1 && t.push({
            code: "agent_ambiguous_name",
            message: `Plugin agent bare name is ambiguous; use ${f.name}: ${g}`,
            path: f.path
        })
    }
    return e.logger?.debug("Plugin agent profiles loaded", {
        diagnosticCount: t.length,
        module: "bootstrap.subagents",
        profileCount: a.length
    }), {
        builtInModelSelectionOverrides: {},
        pluginAgentModelSelectionOverrides: {},
        diagnostics: t,
        profiles: a
    }
}

function uqa(e) {
    try {
        let t = (0, T8.readFileSync)(e.filePath, "utf8"),
            n = $yn({
                content: t,
                path: e.filePath,
                source: "user"
            });
        return n.diagnostic && (e.logger?.warn("Plugin agent profile diagnostic", {
            code: n.diagnostic.code,
            message: n.diagnostic.message,
            module: "bootstrap.subagents",
            path: e.filePath,
            pluginId: e.plugin.id
        }), !n.profile) ? {
            diagnostic: n.diagnostic
        } : n.profile ? {
            ...n.diagnostic ? {
                diagnostic: n.diagnostic
            } : {},
            parsed: {
                bareName: n.profile.name,
                plugin: e.plugin,
                profile: n.profile
            }
        } : {}
    } catch (t) {
        return {
            diagnostic: {
                code: "agent_read_failed",
                message: t instanceof Error ? t.message : `Failed to read plugin agent: ${e.filePath}`,
                path: e.filePath
            }
        }
    }
}

function dqa(e) {
    return {
        ...e.profile,
        name: `${e.plugin.name}:${e.bareName}`
    }
}

function pqa(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function fqa(e) {
    let t = new Map;
    for (let n of e) {
        let o = n.bareName.trim();
        t.set(o, (t.get(o) ?? 0) + 1)
    }
    return t
}

function mqa(e) {
    try {
        let t = (0, T8.readFileSync)((0, PK.join)(e, "v2", "agents-state.json"), "utf8"),
            n = JSON.parse(t);
        return {
            pluginAgentModelSelectionOverrides: FEe(n.pluginAgentModelSelectionOverrides),
            builtInModelSelectionOverrides: hqa(n.builtInModelSelectionOverrides),
            disabledAgentIds: new Set(Array.isArray(n.disabledAgentIds) ? n.disabledAgentIds.filter(o => typeof o == "string" && o.trim().length > 0) : [])
        }
    } catch {
        return {
            builtInModelSelectionOverrides: {},
            pluginAgentModelSelectionOverrides: {},
            disabledAgentIds: new Set
        }
    }
}

function hqa(e) {
    let t = {},
        n = pqa(e) ? e : {},
        o = Pu.safeParse(n["general-purpose"]),
        s = Pu.safeParse(n.Explore);
    return o.success && (t["general-purpose"] = o.data), s.success && (t.Explore = s.data), t
}

function gqa(e, t) {
    return e.source !== "user" ? !1 : t.has(nqt({
        name: e.name,
        scope: "user",
        source: "user"
    }))
}

function Eqo(e) {
    if (!(0, T8.existsSync)(e)) return [];
    if (!(0, T8.statSync)(e).isDirectory()) return [];
    let t = [];
    for (let n of (0, T8.readdirSync)(e, {
            withFileTypes: !0
        })) {
        let o = (0, PK.join)(e, n.name);
        if (n.isDirectory()) {
            t.push(...Eqo(o));
            continue
        }
        n.isFile() && /\.(md|markdown)$/iu.test(n.name) && t.push(o)
    }
    return t.sort((n, o) => n.localeCompare(o))
}
var T8, PK, cqa, Aqo = Y(() => {
    "use strict";
    T8 = require("node:fs"), PK = require("node:path");
    mz();
    Y0();
    gs();
    cqa = new Set(["general-purpose", "Explore"]);
    r(Iqo, "loadZCodeAgentProfiles");
    r(lqa, "sanitizeProjectAgentProfile");
    r(Cqo, "loadPluginAgentProfiles");
    r(uqa, "parsePluginAgentProfile");
    r(dqa, "namespacePluginAgentProfile");
    r(pqa, "isRecord");
    r(fqa, "countBareProfileNames");
    r(mqa, "readAgentState");
    r(hqa, "normalizeBuiltInSelectionOverrides");
    r(gqa, "isDisabledUserProfile");
    r(Eqo, "listMarkdownFiles")
});

function Pqo() {
    let e = Lie(process.platform),
        t = Lie((0, ekt.arch)()),
        n = Lie((0, ekt.release)());
    return {
        ...e && t ? {
            "X-Platform": `${e}-${t}`
        } : {},
        "X-Os-Category": yqa(process.platform),
        ...n ? {
            "X-Os-Version": n
        } : {}
    }
}

function Lie(e) {
    let t = e?.trim();
    if (!(!t || !_qa.test(t))) return t
}

function yqa(e) {
    switch (e) {
        case "darwin":
            return "macos";
        case "win32":
            return "windows";
        default:
            return "linux"
    }
}
var ekt, _qa, Rqo = Y(() => {
    "use strict";
    ekt = require("node:os"), _qa = /^[\x20-\x7e]+$/;
    r(Pqo, "createRuntimePlatformHeaders");
    r(Lie, "normalizePrintableHeaderValue");
    r(yqa, "normalizeOsCategory")
});

function Dqo(e = process.env, t = {}) {
    let n = bqa(t.network);
    return {
        defaultHeaders: Oqo(e, t),
        codingPlanSignature: vqa(e, t),
        env: e,
        ...n ? {
            network: n
        } : {},
        ...t.endpointRoutingPort ? {
            endpointRoutingPort: t.endpointRoutingPort
        } : {}
    }
}

function vqa(e, t) {
    return {
        configUrl: MAe(e, rJt),
        headers: Oqo(e, t)
    }
}

function bqa(e) {
    if (!(!e?.caCertFile && !e?.httpProxy && !e?.noProxy)) return {
        ...e.caCertFile ? {
            caCertFile: e.caCertFile
        } : {},
        ...e.httpProxy ? {
            httpProxy: e.httpProxy
        } : {},
        ...e.noProxy ? {
            noProxy: e.noProxy
        } : {}
    }
}

function Oqo(e, t = {}) {
    let n = t.sourceTitle ?? wqa(),
        o = Sqa(e, t),
        s = Lie(Intl.DateTimeFormat().resolvedOptions().locale),
        a = Lie(Intl.DateTimeFormat().resolvedOptions().timeZone);
    return {
        "HTTP-Referer": c1(e),
        "User-Agent": `ZCode/${o??"unknown"}`,
        ...o ? {
            "X-ZCode-App-Version": o
        } : {},
        "X-Title": `Z Code@${n}`,
        "X-Release-Channel": UL(e),
        "X-Client-Language": s ?? "unknown",
        "X-Client-Timezone": a ?? "unknown",
        "X-ZCode-Agent": "glm",
        ...Pqo()
    }
}

function Sqa(e, t) {
    return Lie(e[hpe] ?? t.appVersion)
}

function wqa() {
    return process.argv.includes("app-server") || process.argv.includes("agent-server") ? "electron" : "cli"
}
var Mqo = Y(() => {
    "use strict";
    gs();
    Rqo();
    r(Dqo, "createRuntimeAiSdkModelExecutionConfig");
    r(vqa, "createCodingPlanSignatureConfig");
    r(bqa, "normalizeAiSdkNetworkConfig");
    r(Oqo, "buildCliZCodeSourceHeaders");
    r(Sqa, "resolveAppVersionForHeaders");
    r(wqa, "detectDefaultProviderSourceTitle")
});
var tkt, Nqo = Y(() => {
    "use strict";
    IK();
    tkt = class {
        static {
            r(this, "ApiProviderModelRuntime")
        }
        #e;
        #t;
        #n = !1;
        constructor(t) {
            this.#e = t.registry, this.#t = t.modelAdapter
        }
        modelFactory = r(t => {
            if (!this.#n) throw new Error("ApiProviderModelRuntime \u5FC5\u987B\u5148 start() \u518D\u521B\u5EFA Model");
            let n = this.#e.validateSelection(t.selection);
            if (!n.ok) throw LCn(n);
            let o = t.selection.providerId,
                s = t.selection.modelId,
                a = this.#e.getProvider(o);
            if (!a) throw new Error("Registry Selection \u6821\u9A8C\u4E0E Provider \u7D22\u5F15\u7ED3\u679C\u4E0D\u4E00\u81F4");
            let l = this.#e.getModel(o, s);
            if (!l) throw new Error("Registry Selection \u6821\u9A8C\u4E0E Model \u7D22\u5F15\u7ED3\u679C\u4E0D\u4E00\u81F4");
            return this.#r(a, l, t)
        }, "modelFactory");
        start() {
            this.#n || (this.#n = !0)
        }
        dispose() {
            this.#n = !1
        }
        #r(t, n, o) {
            let s = n.config,
                a = o.selection.options.reasoningLevel;
            return this.#t.createModel({
                providerId: t.providerId,
                modelId: n.modelId,
                providerConfig: t.config,
                modelConfig: s,
                ...t.config.access.type === "zhipu-account" && t.config.access.mode === "off-peak" ? {
                    requestDependencies: {
                        requestAuth: {
                            source: o.requestDependencies?.requestAuth?.source
                        }
                    }
                } : {},
                options: {
                    reasoningLevel: a
                }
            })
        }
    }
});

function nkt(e) {
    let t = e.options.pluginStorageRoot ?? nbe(e.cliStorageRoot),
        n = qat({
            config: e.configResult.config.plugins,
            env: e.env ?? process.env,
            officialPluginRoots: sje({
                extraRoots: e.options.officialPluginRoots,
                logger: e.logger,
                storageRoot: t,
                suppressedBuiltins: new Set(e.configResult.config.plugins.suppressedBuiltins)
            }),
            officialPluginsEnabledByDefault: owt,
            storageRoot: t,
            workingDirectory: e.workingDirectory
        });
    return e.startupTimer.mark("ZCode plugins resolved", {
        context: {
            commandRootCount: n.commandRoots.length,
            diagnosticCount: n.diagnostics.length,
            enabledPluginCount: n.plugins.filter(o => o.enabled).length,
            hookCount: Object.values(n.hooks ?? {}).reduce((o, s) => o + (s ?? []).reduce((a, l) => a + l.hooks.length, 0), 0),
            mcpServerCount: Object.keys(n.mcpServers).length,
            pluginCount: n.plugins.length,
            pluginStorageRoot: t,
            skillRootCount: n.skillRoots.length
        },
        event: "bootstrap.app.startup.plugins.completed",
        stage: "resolve_plugins"
    }), n
}

function Lqo(e) {
    e.startupTimer.start("ZCode app startup started", {
        context: {
            hasInjectedModelAdapter: e.hasInjectedModelAdapter,
            resume: e.resume
        },
        event: "bootstrap.app.startup.started",
        stage: "start"
    })
}

function Fqo(e) {
    e.startupTimer.mark("ZCode app configuration loaded", {
        context: {
            configSourceEnv: e.configResult.sources.env,
            configSourceProject: e.configResult.sources.project.loaded,
            configSourceUser: e.configResult.sources.user.loaded
        },
        event: "bootstrap.app.startup.config.completed",
        stage: "load_config"
    })
}

function jqo(e) {
    e.startupTimer.mark("ZCode storage adapters initialized", {
        context: {
            hasInjectedArtifactStore: e.hasInjectedArtifactStore,
            hasInjectedSessionStore: e.hasInjectedSessionStore,
            cliStorageRoot: e.cliStorageRoot,
            storageRoot: e.storageRoot
        },
        event: "bootstrap.app.startup.storage.completed",
        stage: "initialize_storage"
    })
}

function Bqo(e) {
    e.startupTimer.mark("ZCode MCP adapter initialized", {
        context: {
            hasInjectedMcpPort: e.hasInjectedMcpPort,
            mcpEnabled: e.mcpEnabled,
            mcpServerCount: Object.keys(e.configuredMcpServers).length,
            trustedMcpServerCount: e.trustedMcpServerCount
        },
        event: "bootstrap.app.startup.mcp.completed",
        stage: "initialize_mcp"
    })
}

function Uqo(e) {
    e.startupTimer.mark("ZCode runtime constructed", {
        context: {
            hasInjectedModelAdapter: e.hasInjectedModelAdapter,
            sessionId: e.sessionId
        },
        event: "bootstrap.app.startup.runtime.completed",
        stage: "create_runtime"
    })
}

function zqo(e) {
    e.startupTimer.complete("ZCode app startup completed", {
        context: {
            sessionId: e.sessionId,
            workingDirectory: e.workingDirectory
        },
        event: "bootstrap.app.startup.completed",
        stage: "total"
    })
}

function $qo(e) {
    e.logger.debug("Runtime config resolved", {
        mode: e.runtimeConfig.mode,
        module: "bootstrap",
        permissionAllowedToolCount: e.configResult.config.permission.allowedTools.length,
        permissionDisallowedToolCount: e.configResult.config.permission.disallowedTools.length,
        permissionSourceEnv: e.configResult.sources.env,
        permissionSourceUserConfig: e.configResult.sources.user.loaded
    })
}
var FEn = Y(() => {
    "use strict";
    IOe();
    PCn();
    TK();
    kK();
    r(nkt, "resolveStartupPlugins");
    r(Lqo, "startAppStartup");
    r(Fqo, "markConfigurationLoaded");
    r(jqo, "markStorageAdaptersInitialized");
    r(Bqo, "markMcpAdapterInitialized");
    r(Uqo, "markRuntimeConstructed");
    r(zqo, "completeAppStartup");
    r($qo, "debugRuntimeConfigResolved")
});

function kqa(e, t, n) {
    let o = e.indexOf(","),
        s = e.slice(0, 5).toLowerCase() === "data:" && o >= 0 ? e.slice(5, o).split(";") : [],
        a = (s.shift()?.trim() || t).split(";", 1)[0].toLowerCase(),
        l = o >= 0 ? e.slice(o + 1) : "";
    if (s.at(-1)?.trim().toLowerCase() !== "base64" || !/^[A-Za-z0-9+/]*={0,2}$/u.test(l) || l.length % 4 !== 0) throw new Error("fault.attachment.previewArtifactInvalid");
    if (!a.startsWith("image/") && !a.startsWith("video/") && a !== "application/pdf") throw new Error("fault.attachment.previewNotMedia");
    let u = Buffer.from(l, "base64");
    if (u.byteLength > n) throw new Error("fault.attachment.previewTooLarge");
    return {
        bytes: u,
        mediaType: a
    }
}
async function jEn(e) {
    if (!e?.providerRegistry) throw new Error("createZCodeApp requires a Provider Registry");
    let t = y4(),
        n = e.version ?? "0.0.0",
        o = e.sessionId ?? Ov(),
        s = e.traceContext ?? hA({
            sessionId: o
        }),
        a = (0, S4.resolve)(e.runtimeConfig?.workingDirectory ?? process.cwd()),
        l = z5o(K0({
            env: e.env,
            projectConfigPath: e.projectConfigPath,
            workingDirectory: a,
            workspaceIdentity: e.runtimeConfig?.memory?.workspaceIdentity,
            skipUserConfig: e.skipUserConfig,
            userConfigPath: e.userConfigPath,
            cliOverrides: U5o(e)
        }), e),
        u = e.loggerFactory ?? Z3({
            env: e.env
        }),
        f = u.createLogger("zcode").child({
            ...Xa(s),
            module: "bootstrap"
        }),
        g = new SK(f, {
            ...Xa(s),
            module: "bootstrap",
            startupKind: "zcode_app"
        }, t);
    Lqo({
        hasInjectedModelAdapter: e.modelAdapter !== void 0,
        resume: e.resume === !0,
        startupTimer: g
    }), Fqo({
        configResult: l,
        startupTimer: g
    });
    let _ = u.createLogger("zcode").child({
            ...Xa(s),
            module: "adapters.model"
        }),
        b = D5o({
            owner: e.telemetryOwner,
            sessionId: o
        }),
        w, T, I;
    try {
        let A = iy(l.config.storage.dir),
            R = wK(A),
            L = q5o(R, gCe(e.env ?? process.env) === "development"),
            U = await Iqo({
                logger: f,
                storageRoot: A,
                workingDirectory: a
            }),
            j = U.profiles,
            z = nkt({
                cliStorageRoot: R,
                configResult: l,
                env: e.env,
                logger: f,
                options: e,
                startupTimer: g,
                workingDirectory: a
            }),
            $ = Cqo({
                logger: f,
                plugins: z.plugins,
                reservedProfileNames: j.map(Qn => Qn.name),
                modelSelectionOverrides: U.pluginAgentModelSelectionOverrides
            }).profiles,
            K = QUo(z),
            q = uqo({
                pluginOutcome: z,
                workingDirectory: a
            }),
            ie = [...j, ...$],
            ae = e.sessionStore === void 0,
            Ce = e.sessionStore ?? await K5o(l, g),
            pe = H5o(Ce),
            ze = rbe(a),
            rt = e.runtimeConfig?.mode ? void 0 : G5o(pe, ze),
            {
                configuredMcpServers: Ae,
                runtimeConfig: bt,
                untrustedProjectMcpServers: Ye
            } = yzo({
                cliStorageRoot: R,
                configResult: l,
                options: e,
                persistedMode: rt,
                pluginHooks: z.hooks,
                pluginMcpServers: z.mcpServers,
                builtInMcpServers: q,
                pluginRuntimeFeatures: K,
                builtInSubagentModelSelectionOverrides: U.builtInModelSelectionOverrides,
                subagentOutputRootDir: (0, S4.join)(R, "agents"),
                subagentProfiles: ie,
                storageRoot: A,
                workingDirectory: a,
                workspaceIdentity: e.runtimeConfig?.memory?.workspaceIdentity
            }),
            Fe = e.browserControlPort;
        Fe && K.browserUse === !0 && bt.mcp?.servers?.node_repl?.type === "stdio" && (w = e.nodeReplBrowserBroker ?? (T = Jwt({
            browserControlPort: Fe,
            logger: f,
            platform: e.platform
        })), Ae = DEn(Ae, w), bt.mcp = {
            ...bt.mcp,
            servers: DEn(bt.mcp.servers ?? {}, w)
        }), g.mark("ZCode runtime configuration resolved", {
            context: vzo(bt, a),
            event: "bootstrap.app.startup.runtime_config.completed",
            stage: "resolve_runtime_config"
        });
        let kt = wye(z.plugins);
        bt.pluginReferenceCatalog = kt;
        let St, ct = jzo({
                appVersion: n,
                logger: f,
                projectConfigPath: e.projectConfigPath,
                policy: e.workspaceHookPolicy,
                policyProvider: e.workspaceHookPolicyProvider,
                reviewHost: e.workspaceHookReviewHost,
                workspaceHookTrustEnabled: e.workspaceHookTrustEnabled,
                runtimeRoot: l.sources.project.workspaceHookRuntimeRoot ?? {
                    enabled: bt.hooks?.enabled === !0,
                    timeoutMs: bt.hooks?.timeoutMs ?? 6e4,
                    maxOutputBytes: bt.hooks?.maxOutputBytes ?? 32768
                },
                sessionId: o,
                snapshot: l.sources.project.workspaceHookSnapshot,
                userConfigPath: l.sources.user.path,
                workingDirectory: a,
                ...e.workspaceHookReviewHost ? {
                    emitReviewEvent: r(async Qn => {
                        if (!St) throw new Error("ZCode runtime is not initialized yet.");
                        await St.appendEvent(om(Qn.type, o, Qn.payload, {
                            traceId: s.traceId
                        }), s)
                    }, "emitReviewEvent"),
                    emitAdmissionEvent: r(async Qn => {
                        if (!St) throw new Error("ZCode runtime is not initialized yet.");
                        await St.appendEvent(om(Qn.type, o, Qn.payload, {
                            traceId: s.traceId
                        }), s)
                    }, "emitAdmissionEvent")
                } : {}
            }),
            $e = new RM({
                allowedTools: new Set(l.config.permission.allowedTools),
                autoApproveHighRisk: l.config.permission.autoApproveHighRisk,
                disallowedTools: new Set(l.config.permission.disallowedTools),
                allowMediumRiskInAutoMode: l.config.permission.allowMediumRiskInAuto
            }),
            Bt = e.inputHistoryStore ?? V5o(Ce),
            Ve = e.artifactStore ?? Iwr({
                imageCacheRootDir: (0, S4.join)(A, "cli", "image-cache"),
                pdfCacheRootDir: (0, S4.join)(A, "cli", "pdf-cache"),
                rootDir: (0, S4.join)(A, "cli", "artifacts"),
                videoCacheRootDir: (0, S4.join)(A, "cli", "video-cache")
            }),
            et = e.imageProcessorPort ?? I6r(),
            _t = B5o(e.env ?? process.env),
            Dt = e.sessionMailboxPort ?? (_t ? PPo({
                rootDir: iy((e.env ?? process.env).ZCODE_MAILBOX_ROOT ?? "~/.zcode/mailbox")
            }) : void 0);
        jqo({
            cliStorageRoot: R,
            hasInjectedArtifactStore: e.artifactStore !== void 0,
            hasInjectedSessionStore: e.sessionStore !== void 0,
            startupTimer: g,
            storageRoot: A
        });
        let gn = e.mcpPort ?? (bt.mcp?.enabled === !1 ? void 0 : e.mcpPortFactory?.({
                workingDirectory: a
            }) ?? Afn({
                clientVersion: n,
                env: e.env,
                logger: f,
                network: {
                    httpProxy: l.config.network.httpProxy,
                    noProxy: l.config.network.noProxy,
                    caCertFile: l.config.network.caCertFile
                },
                workingDirectory: a
            })),
            un = e.mcpPort === void 0 && gn !== void 0,
            On = e.executionPort ?? Jte({
                onToolExecResource: e.onToolExecResource,
                network: {
                    httpProxy: l.config.network.httpProxy,
                    noProxy: l.config.network.noProxy,
                    caCertFile: l.config.network.caCertFile
                },
                outputRootDir: (0, S4.join)(A, "cli", "exec"),
                processEnv: e.env ?? process.env
            }),
            sn = e.executionPort === void 0,
            dt = e.pdfDocumentPort ?? A6r({
                executionPort: On
            }),
            we = e.fileSystemPort ?? sH(),
            _e = e.httpClientPort ?? b3({
                env: e.env ?? process.env,
                timeoutMs: l.config.network.timeout,
                proxyUrl: l.config.network.httpProxy,
                noProxy: l.config.network.noProxy,
                caCertFile: l.config.network.caCertFile
            }),
            Pt = e.providerEndpointRoutingPort;
        Bqo({
            configuredMcpServers: Ae,
            hasInjectedMcpPort: e.mcpPort !== void 0,
            mcpEnabled: bt.mcp?.enabled !== !1,
            startupTimer: g,
            trustedMcpServerCount: Object.keys(bt.mcp?.servers ?? {}).length
        }), $qo({
            configResult: l,
            logger: f,
            runtimeConfig: bt
        });
        let it = r(() => {
                if (!St) throw new Error("ZCode runtime is not initialized yet.");
                return St
            }, "getRuntime"),
            Nn = !1,
            Mr = r(() => zte({
                env: e.env ?? process.env,
                platform: e.platform ?? process.platform
            }).selection, "resolveDefaultShellSelection"),
            gr, no = r(() => (gr ??= (async () => await e.resolveInitialBashShellSelection?.() ?? Mr())(), gr), "resolveInitialShellSelection"),
            eo = r(async () => {
                it().initializeSessionShellEnvironmentIfNeeded(await no())
            }, "initializeSessionShellEnvironment"),
            co = r(async () => {
                let Qn = e.providerRegistry,
                    _r;
                try {
                    _r = await J5o(Ce, o)
                } catch (qr) {
                    f.warn("Session model selection restore failed", {
                        error: qr instanceof Error ? qr.message : String(qr),
                        event: "session.model_selection.restore_failed",
                        sessionId: o
                    })
                }
                let Vn = _r && Qn.validateSelection(_r);
                return it().setSessionModelSelection(Vn?.ok ? _r : void 0), _r
            }, "restorePersistedModelSelection"),
            ro = r(async Qn => {
                let _r = it(),
                    Vn = Qn?.onEvent ? _r.subscribeEvents({
                        onSessionEvent: Qn.onEvent
                    }) : void 0;
                try {
                    let qr = Qn?.traceContext ?? s,
                        si = await co();
                    await eo();
                    let qe = await _r.resumeFromStore({
                        ...Qn?.abortSignal ? {
                            abortSignal: Qn.abortSignal
                        } : {},
                        modeOverride: e.runtimeConfig?.mode,
                        persistedMessages: Qn?.persistedMessages,
                        traceContext: qr
                    });
                    return await _r.activatePausedTargetAfterResume(qr), Nn = !0, {
                        ...qe,
                        modelSelection: si
                    }
                } finally {
                    Vn?.()
                }
            }, "resumeFromStore"),
            Hi = r(async (Qn, _r) => {
                !e.resume || Nn || (await ro({
                    ..._r ? {
                        abortSignal: _r
                    } : {},
                    traceContext: Qn ?? s
                }), Nn = !0)
            }, "prepareResume"),
            ri = r(async Qn => {
                await eo(), await Hi(Qn?.traceContext, Qn?.abortSignal)
            }, "prepareUserExecutionBoundary"),
            Yi = Dqo(e.env, {
                appVersion: n,
                endpointRoutingPort: Pt,
                network: l.config.network,
                sourceTitle: e.sourceTitle
            }),
            yi = e.modelAdapter ?? WSt({
                env: e.env,
                logger: _,
                modelIoDir: L,
                modelIoFullRetentionEnabled: e.modelIoFullRetentionEnabled,
                executionConfig: Yi,
                statusSink: b.statusSink,
                streamIdleTimeoutMs: l.config.modelStream.idleTimeoutMs
            });
        e.modelAdapter && b.statusSink && yi.addStatusSink(b.statusSink);
        let Ls = I$o();
        yi.setModelIoFullRetentionEnabled(e.modelIoFullRetentionEnabled ?? !1), I = new tkt({
            registry: e.providerRegistry,
            modelAdapter: yi
        }), I.start();
        let ht = I.modelFactory,
            mr = I7o({
                agentTelemetry: b.agentExecution,
                appOptions: e,
                appVersion: n,
                artifactStore: Ve,
                configResult: l,
                fileSystemPort: we,
                httpClientPort: _e,
                imageProcessorPort: et,
                pdfDocumentPort: dt,
                logger: f,
                mcpPort: gn,
                modelFactory: ht,
                permissionService: $e,
                prepareUserExecutionBoundary: ri,
                getRuntime: it,
                runtimeConfig: bt,
                sessionId: o,
                sessionStore: Ce,
                storageRoot: A,
                traceContext: s,
                workingDirectory: a
            }),
            hi = Eje(Ce, f),
            hr = hi === void 0 ? void 0 : W9o({
                concurrency: Ls,
                createActorRuntime: r(({
                    persona: Qn,
                    pinnedModel: _r,
                    runSubagentModel: Vn,
                    sessionId: qr,
                    submitPort: si,
                    submitProfile: qe,
                    escalatePort: Qt,
                    modelRequestAdmission: Jt
                }) => wwt({
                    childSessionId: qr,
                    configOverrides: {
                        workflowActor: {
                            ...Qn.name === void 0 ? {} : {
                                name: Qn.name
                            },
                            ...Qn.system === void 0 ? {} : {
                                persona: Qn.system
                            }
                        },
                        ...nqo(),
                        ...eqo({
                            parentSelection: it().getSessionModelSelection(),
                            ...Vn === void 0 ? {} : {
                                runSelection: Vn
                            }
                        }, _r).configOverrides
                    },
                    deps: {
                        agentTelemetry: b.agentExecution,
                        appOptions: e,
                        appVersion: n,
                        artifactStore: Ve,
                        configResult: l,
                        fileSystemPort: we,
                        httpClientPort: _e,
                        imageProcessorPort: et,
                        logger: f,
                        mcpPort: gn,
                        modelFactory: ht,
                        permissionService: $e,
                        runtime: it(),
                        runtimeConfig: bt,
                        sessionId: o,
                        sessionStore: Ce,
                        storageRoot: A,
                        workingDirectory: a
                    },
                    request: {
                        opts: {}
                    },
                    traceContext: s,
                    ...qe.kind === "untyped" ? {} : {
                        workflowSubmitPort: si
                    },
                    ...qe.kind === "mono" ? {
                        workflowSubmitSchema: {
                            ...qe.schema
                        }
                    } : {},
                    workflowEscalatePort: Qt,
                    ...Jt === void 0 ? {} : {
                        modelRequestAdmission: Jt
                    }
                }), "createActorRuntime"),
                actorTranscriptStore: Ce,
                artifactStore: Ve,
                executionPort: On,
                fileSystemPort: we,
                journal: hi,
                logger: f,
                onRunEvent: X9o({
                    getRuntime: it,
                    logger: f,
                    sessionId: o
                }),
                parentSessionId: o,
                registerResidencyBlockingWork: r(Qn => {
                    it().trackResidencyBlockingWork(Qn)
                }, "registerResidencyBlockingWork"),
                resolveLaunchInputId: r(Qn => {
                    let _r = it().getActiveTurnInfo();
                    return _r !== void 0 && _r.turnId === Qn.turnId ? _r.inputId : void 0
                }, "resolveLaunchInputId"),
                ...TEn(Ce) ? {
                    taskLinkStore: Ce
                } : {}
            }),
            ds = J9o({
                executionPort: On,
                fileSystemPort: we,
                logger: f
            }),
            Js = Z9o({
                registry: e.providerRegistry,
                currentSelection: r(() => it().getSessionModelSelection(), "currentSelection")
            });
        St = new F2(o, bt, {
            agentTelemetry: b.agentExecution,
            modelRequestAdmission: Ls.observer(),
            eventStore: e.eventStore ?? Oz(),
            sessionStore: Ce,
            sessionMailboxPort: Dt,
            logger: f,
            executionPort: On,
            workspaceHookAdmission: ct?.admission,
            workspaceHookSnapshot: ct?.snapshot,
            browserControlPort: Fe,
            fileSystemPort: we,
            httpClientPort: _e,
            imageProcessorPort: et,
            pdfDocumentPort: dt,
            artifactStore: Ve,
            contextSourcePort: e.contextSourcePort ?? ome({
                env: e.env
            }),
            skillPort: l.config.features.skill && l.config.skills.enabled ? e.skillPort ?? iG({
                extraRoots: l.config.skills.roots,
                extraResolvedRoots: z.skillRoots,
                disabledPaths: [...y8(l.config.skillOverrides), ...bt.dynamicWorkflowEnabled === !1 ? kzo(z.skillRoots) : []]
            }) : void 0,
            mcpPort: gn,
            eventSink: e.eventSink,
            modelFactory: ht,
            modelIoDir: L,
            providerRuntimeHeadersPort: e.providerRuntimeHeadersPort,
            resolveEffectiveModelSelection: e.resolveEffectiveModelSelection,
            isRemoteWorkspace: r(() => sJt(bt.memory?.workspaceIdentity ?? ""), "isRemoteWorkspace"),
            permissionBroker: e.permissionBroker,
            permissionService: $e,
            workflowPort: mr.workflowPort,
            dynamicWorkflowRunPort: hr,
            dynamicWorkflowSnippetPort: ds,
            modelCatalogPort: Js,
            automationPort: e.automationPort,
            offPeakPort: e.offPeakPort,
            appVersion: n,
            traceContext: s
        }), Uqo({
            hasInjectedModelAdapter: e.modelAdapter !== void 0,
            sessionId: o,
            startupTimer: g
        }), zqo({
            sessionId: o,
            startupTimer: g,
            workingDirectory: a
        }), GSt(u, f);
        let $a = oUo({
                artifactStore: Ve,
                customCommandPromptResolver: r(async (Qn, _r) => {
                    let Vn = xqo(Qn, {
                        workingDirectory: a
                    });
                    return Vn !== void 0 ? Vn : await wqo(Qn, {
                        ...bt.dynamicWorkflowEnabled === !1 ? {
                            disabledCommandNames: wzo
                        } : {},
                        env: e.env,
                        executionPort: On,
                        logger: f,
                        projectConfigPath: e.projectConfigPath,
                        sessionId: o,
                        signal: _r?.abortSignal,
                        skipUserConfig: e.skipUserConfig,
                        traceContext: _r?.traceContext ?? s,
                        userConfigPath: e.userConfigPath,
                        workingDirectory: a
                    })
                }, "customCommandPromptResolver"),
                inputHistoryStore: Bt,
                logger: f,
                prepareUserExecutionBoundary: ri,
                runtime: St,
                sessionId: o,
                traceContext: s
            }),
            di = X5o({
                agentTelemetry: b.agentExecution,
                appOptions: e,
                appVersion: n,
                artifactStore: Ve,
                cliStorageRoot: R,
                configResult: l,
                eventSink: e.eventSink,
                imageProcessorPort: et,
                pdfDocumentPort: dt,
                logger: f,
                mcpPort: gn,
                modelFactory: ht,
                permissionService: $e,
                prepareUserExecutionBoundary: ri,
                runtime: St,
                runtimeConfig: bt,
                sessionId: o,
                sessionStore: Ce,
                storageRoot: A,
                traceContext: s,
                workingDirectory: a
            }),
            ta = mzo({
                ...hr === void 0 ? {} : {
                    closeDynamicWorkflowRuns: r(() => hr.close(), "closeDynamicWorkflowRuns")
                },
                configResult: l,
                configuredMcpServers: Ae,
                ...e.configuredDefaultModelSelection ? {
                    configuredDefaultModelSelection: e.configuredDefaultModelSelection
                } : {},
                executionPort: On,
                localSettingStore: pe,
                logger: f,
                loggerFactory: u,
                mcpPort: gn,
                ownsExecutionPort: sn,
                ownsMcpPort: un,
                closeNodeReplBrowserBroker: r(async () => {
                    await T?.close()
                }, "closeNodeReplBrowserBroker"),
                ownsSessionStore: ae,
                prepareUserExecutionBoundary: ri,
                prepareResume: Hi,
                projectID: ze,
                providerRegistry: e.providerRegistry,
                resolveUiLocale: r(Qn => yCn(Qn, e), "resolveUiLocale"),
                runtime: St,
                sessionId: o,
                sessionStore: Ce,
                traceContext: s,
                untrustedProjectMcpServers: Ye,
                workingDirectory: a
            }),
            Us = ta.close,
            Ko = r(async Qn => {
                let _r = Qn.ref,
                    Vn = Qn.mime,
                    qr;
                if (Qn.messageId && Qn.attachmentIndex !== void 0) {
                    let qe = (await Ce.messageWithParts({
                        sessionID: o,
                        messageID: Qn.messageId
                    }))?.parts.filter(Qt => Qt.type === "file")[Qn.attachmentIndex];
                    qe?.type === "file" && (Vn = qe.mime, qr = qe.metadata?.artifactUri ?? (qe.url.startsWith("zcode-artifact://") ? qe.url : void 0), _r = qr ?? (qe.url.startsWith("data:") ? Qn.ref : qe.url))
                }
                return {
                    ref: _r,
                    mediaType: Vn,
                    ...qr ? {
                        artifactUri: qr
                    } : {}
                }
            }, "resolvePromptAttachment");
        return {
            sessionId: o,
            traceId: s.traceId,
            runtime: St,
            respondWorkspaceHookReview: r(Qn => ct?.respond({
                sessionId: Qn.sessionId,
                taskId: Qn.taskId,
                runId: Qn.runId,
                ...Qn.remoteSessionId ? {
                    remoteSessionId: Qn.remoteSessionId
                } : {},
                workspaceIdentity: Qn.workspaceIdentity,
                bundleDigest: Qn.bundleDigest,
                reviewFlowId: Qn.reviewFlowId,
                generation: Qn.generation,
                interactionId: Qn.interactionId
            }, Qn.decision) ?? Promise.resolve({
                accepted: !1,
                reasonCode: "workspace_hooks_require_trust_capable_host"
            }), "respondWorkspaceHookReview"),
            toggleWorkspaceHookReviewItem: r(Qn => ct?.toggle({
                sessionId: Qn.sessionId,
                taskId: Qn.taskId,
                runId: Qn.runId,
                ...Qn.remoteSessionId ? {
                    remoteSessionId: Qn.remoteSessionId
                } : {},
                workspaceIdentity: Qn.workspaceIdentity,
                bundleDigest: Qn.bundleDigest,
                reviewFlowId: Qn.reviewFlowId,
                generation: Qn.generation,
                interactionId: Qn.interactionId
            }, Qn.reviewItemId, Qn.enabled) ?? Promise.resolve({
                accepted: !1,
                reasonCode: "workspace_hooks_require_trust_capable_host"
            }), "toggleWorkspaceHookReviewItem"),
            revokeWorkspaceHookTrust: r(Qn => ("hookDeclarationDigests" in Qn ? ct?.revokeCurrent(Qn) : ct?.revoke({
                sessionId: Qn.sessionId,
                taskId: Qn.taskId,
                runId: Qn.runId,
                ...Qn.remoteSessionId ? {
                    remoteSessionId: Qn.remoteSessionId
                } : {},
                workspaceIdentity: Qn.workspaceIdentity,
                bundleDigest: Qn.bundleDigest,
                reviewFlowId: Qn.reviewFlowId,
                generation: Qn.generation,
                interactionId: Qn.interactionId
            }, Qn.reviewItemIds)) ?? Promise.resolve({
                accepted: !1,
                reasonCode: "workspace_hooks_require_trust_capable_host"
            }), "revokeWorkspaceHookTrust"),
            requestWorkspaceHookReview: r(Qn => ct?.requestReview({
                workspaceIdentity: Qn.workspaceIdentity,
                bundleDigest: Qn.bundleDigest
            }) ?? Promise.resolve({
                accepted: !1,
                reasonCode: "workspace_hooks_require_trust_capable_host"
            }), "requestWorkspaceHookReview"),
            reloadWorkspaceHookTrust: r(() => ct?.reloadTrust() ?? Promise.resolve(), "reloadWorkspaceHookTrust"),
            setModelIoFullRetentionEnabled: r(Qn => yi.setModelIoFullRetentionEnabled(Qn), "setModelIoFullRetentionEnabled"),
            readToolResultArtifact: r(Qn => Ve.readToolResultArtifact({
                uri: Qn,
                trace: s
            }), "readToolResultArtifact"),
            writePromptAttachment: r(async Qn => {
                let _r = await Ve.writeToolResultArtifact({
                    content: `data:${Qn.mime};base64,${Buffer.from(Qn.bytes).toString("base64")}`,
                    contentType: "text/plain",
                    retention: "session",
                    sessionId: o,
                    toolCallId: `prompt-attachment-upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,
                    toolName: "prompt-attachment:upload",
                    trace: s
                });
                return (Qn.mime.startsWith("image/") || Qn.mime.startsWith("video/") || Qn.mime.split(";", 1)[0]?.trim().toLowerCase() === "application/pdf") && Ve.primeMediaAttachmentPath?.({
                    bytes: Qn.bytes,
                    mediaType: Qn.mime,
                    uri: _r.uri
                }).catch(() => {}), {
                    ref: _r.uri
                }
            }, "writePromptAttachment"),
            readPromptAttachment: r(async Qn => {
                let {
                    ref: _r,
                    mediaType: Vn
                } = await Ko(Qn);
                if (_r.startsWith("zcode-artifact://")) {
                    let si = await Ve.readToolResultArtifact({
                        uri: _r,
                        trace: s
                    });
                    return kqa(si.content, Vn, Qn.maxBytes)
                }
                return {
                    bytes: (await we.readBinaryFile({
                        path: _r,
                        maxBytes: Qn.maxBytes,
                        trace: s
                    })).content,
                    mediaType: Vn
                }
            }, "readPromptAttachment"),
            statPromptAttachment: r(async Qn => {
                let {
                    ref: _r,
                    mediaType: Vn,
                    artifactUri: qr
                } = await Ko(Qn);
                if (qr) {
                    if (!Ve.statToolResultArtifact) throw new u1(QI.statUnsupported);
                    let qe = await Ve.statToolResultArtifact({
                        uri: qr,
                        trace: s
                    });
                    return {
                        totalBytes: qe.bytes,
                        mediaType: qe.contentType || Vn,
                        ...qe.mtimeMs === void 0 ? {} : {
                            mtimeMs: qe.mtimeMs
                        }
                    }
                }
                let si = await we.stat({
                    path: _r,
                    trace: s
                });
                if (si.kind !== "file") throw new u1(QI.statNotFile);
                return {
                    totalBytes: si.sizeBytes,
                    mediaType: Vn,
                    ...si.mtimeMs === void 0 ? {} : {
                        mtimeMs: si.mtimeMs
                    }
                }
            }, "statPromptAttachment"),
            resolvePromptAttachmentPreviewSource: r(async Qn => {
                let _r = await Ko(Qn);
                if (!_r.mediaType.startsWith("video/")) return {
                    kind: "chunked"
                };
                if (_r.artifactUri) {
                    if (!Ve.ensureMediaAttachmentPath) return {
                        kind: "chunked"
                    };
                    try {
                        let Vn = await Ve.ensureMediaAttachmentPath({
                            uri: _r.artifactUri,
                            mediaType: _r.mediaType
                        });
                        if (Vn.status === "ready" && Vn.path.trim()) return {
                            kind: "local_path",
                            path: Vn.path,
                            mediaType: _r.mediaType
                        }
                    } catch {}
                    return {
                        kind: "chunked"
                    }
                }
                return (0, S4.isAbsolute)(_r.ref) ? {
                    kind: "local_path",
                    path: _r.ref,
                    mediaType: _r.mediaType
                } : {
                    kind: "chunked"
                }
            }, "resolvePromptAttachmentPreviewSource"),
            ...ta,
            close: r(async () => {
                try {
                    await Us?.()
                } finally {
                    try {
                        I?.dispose()
                    } finally {
                        await b.shutdown()
                    }
                }
            }, "close"),
            ...di,
            ...mr,
            ...hr === void 0 ? {} : {
                listDynamicWorkflowRunEvents: r(async Qn => hr.listEvents(Qn.runId, {
                    ...Qn.afterSequence === void 0 ? {} : {
                        afterSequence: Qn.afterSequence
                    },
                    ...Qn.limit === void 0 ? {} : {
                        limit: Qn.limit
                    }
                }), "listDynamicWorkflowRunEvents")
            },
            ...hr === void 0 || typeof hr.listArtifacts != "function" || typeof hr.listArtifactItems != "function" || typeof hr.readArtifact != "function" ? {} : {
                listDynamicWorkflowRunArtifacts: r(async Qn => hr.listArtifacts(Qn.runId), "listDynamicWorkflowRunArtifacts"),
                listDynamicWorkflowRunArtifactItems: r(async Qn => hr.listArtifactItems(Qn.runId, Qn.artifactId, {
                    ...Qn.afterSequence === void 0 ? {} : {
                        afterSequence: Qn.afterSequence
                    },
                    limit: Qn.limit
                }), "listDynamicWorkflowRunArtifactItems"),
                readDynamicWorkflowRunArtifact: r(async Qn => hr.readArtifact(Qn.runId, Qn.artifactId, Qn.version), "readDynamicWorkflowRunArtifact")
            },
            ...hr === void 0 || typeof hr.listWorkspaceNodes != "function" || typeof hr.readWorkspaceNodeResult != "function" ? {} : {
                listDynamicWorkflowRunWorkspaceNodes: r(async Qn => hr.listWorkspaceNodes(Qn.runId), "listDynamicWorkflowRunWorkspaceNodes"),
                readDynamicWorkflowRunNodeResult: r(async Qn => hr.readWorkspaceNodeResult(Qn.runId, Qn.siteId, Qn.ordinal, {
                    maxBytes: Qn.maxBytes
                }), "readDynamicWorkflowRunNodeResult")
            },
            ...hr === void 0 ? {} : {},
            ...hr === void 0 || typeof hr.listRunsForSession != "function" ? {} : {
                listDynamicWorkflowRuns: r(async Qn => hr.listRunsForSession(Qn.limit), "listDynamicWorkflowRuns")
            },
            ...hr === void 0 || typeof hr.replayProgressForSession != "function" ? {} : {
                replayDynamicWorkflowRuns: r(async Qn => hr.replayProgressForSession(Qn), "replayDynamicWorkflowRuns")
            },
            ...hr === void 0 || typeof hr.resume != "function" ? {} : {
                resumeWorkflowRun: r(async Qn => {
                    let _r = await hr.resume(Qn.workId);
                    return _r.ok && await it().trackResumedDynamicWorkflowRun({
                        runId: _r.runId,
                        ..._r.toolCallId === void 0 ? {} : {
                            toolCallId: _r.toolCallId
                        },
                        ...Qn.name === void 0 ? {} : {
                            name: Qn.name
                        },
                        traceContext: s
                    }), _r
                }, "resumeWorkflowRun")
            },
            ...hr === void 0 ? {} : {
                startSavedWorkflow: r(async Qn => (await ri({
                    traceContext: s
                }), await it().startSavedWorkflowRun({
                    ...Qn,
                    traceContext: s
                })), "startSavedWorkflow")
            },
            ...hr === void 0 || typeof hr.amend != "function" || typeof hr.getScript != "function" ? {} : {
                amendWorkflowRunSettings: r(async Qn => (await ri({
                    traceContext: s
                }), await it().amendWorkflowRunSettings({
                    ...Qn,
                    traceContext: s
                })), "amendWorkflowRunSettings")
            },
            ...ZUo({
                configResult: l,
                options: e,
                workingDirectory: a
            }),
            getPluginReferenceCatalog: r(() => kt, "getPluginReferenceCatalog"),
            getSkillCatalog: r(async () => (await ri({
                traceContext: s
            }), await it().getSkillCatalog(s)), "getSkillCatalog"),
            resume: ro,
            ...$a
        }
    } catch (A) {
        throw I?.dispose(), b.shutdown().catch(() => {}), T?.close(), g.fail("ZCode app startup failed", A, {
            context: {
                sessionId: o,
                workingDirectory: a
            },
            event: "bootstrap.app.startup.failed",
            stage: "total"
        }), A
    }
}
var S4, BEn = Y(() => {
    "use strict";
    S4 = require("node:path");
    s3();
    E0e();
    yw();
    pme();
    nme();
    e7();
    Min();
    Fin();
    RPo();
    rRe();
    O0e();
    Cut();
    Y0();
    qSt();
    ar();
    gs();
    G0();
    gCn();
    HSt();
    _Cn();
    $5o();
    kK();
    obe();
    Q5o();
    iUo();
    YUo();
    ezo();
    hzo();
    bzo();
    xzo();
    Bzo();
    C7o();
    PEn();
    dEn();
    K9o();
    Y9o();
    Q9o();
    VCn();
    tqo();
    rqo();
    OEn();
    dqo();
    kqo();
    Tqo();
    ibe();
    Aqo();
    Mqo();
    Nqo();
    FEn();
    r(kqa, "decodePromptAttachmentDataUrl");
    r(jEn, "createZCodeApp")
});

function $En(e) {
    let t = Cqa.parse(e),
        n = t.model,
        o = okt(typeof n == "string" ? n : n?.main),
        s = typeof n == "object" ? okt(n?.lite) : void 0,
        a = o || s ? {
            ...o ? {
                main: o
            } : {},
            ...s ? {
                lite: s
            } : {}
        } : void 0;
    return {
        ...a ? {
            model: a
        } : {},
        ...t.provider ? {
            provider: t.provider
        } : {}
    }
}

function okt(e) {
    if (!e) return;
    let t = e.indexOf("/");
    if (t <= 0 || t === e.length - 1) return;
    let n = e.slice(0, t).trim(),
        o = e.slice(t + 1).trim();
    if (!(!n || !o)) return {
        provider: n,
        model: o
    }
}
var zEn, qqo, rkt, xqa, Tqa, Iqa, UEn, Cqa, Wqo = Y(() => {
    "use strict";
    Fa();
    zEn = m.record(m.string(), m.string()), qqo = m.record(m.string(), m.unknown()), rkt = m.number().finite().positive(), xqa = m.object({
        enabled: m.boolean().optional(),
        levels: m.array(m.string().min(1)).optional(),
        defaultLevel: m.string().min(1).optional(),
        providerOptionsByLevel: m.record(m.string(), qqo).optional()
    }), Tqa = m.object({
        id: m.string().min(1).optional(),
        name: m.string().min(1).optional(),
        attachment: m.boolean().optional(),
        reasoning: m.union([m.boolean(), xqa]).optional(),
        tool_call: m.boolean().optional(),
        structured_output: m.boolean().optional(),
        supportsImages: m.boolean().optional(),
        supportsPdf: m.boolean().optional(),
        supportsVideo: m.boolean().optional(),
        supportsToolCall: m.boolean().optional(),
        supportsJsonSchemaOutput: m.boolean().optional(),
        contextWindow: rkt.optional(),
        maxOutputTokens: rkt.optional(),
        limit: m.object({
            context: rkt.optional(),
            output: rkt.optional()
        }).optional(),
        modalities: m.object({
            input: m.array(m.enum(["text", "audio", "image", "video", "pdf"])).optional(),
            output: m.array(m.enum(["text", "audio", "image", "video", "pdf"])).optional()
        }).optional(),
        options: qqo.optional(),
        headers: zEn.optional()
    }).passthrough(), Iqa = m.object({
        kind: m.enum(["anthropic", "openai", "openai-compatible"]),
        name: m.string().min(1).optional(),
        npm: m.never().optional(),
        options: m.object({
            apiKey: m.string().optional(),
            baseURL: m.string().min(1).optional(),
            apiKeyRequired: m.boolean().optional(),
            headers: zEn.optional()
        }).passthrough().optional(),
        headers: zEn.optional(),
        models: m.record(m.string(), Tqa).optional()
    }).passthrough(), UEn = m.string().refine(e => okt(e) !== void 0, {
        message: "Model references must use provider/model format"
    }), Cqa = m.object({
        provider: m.record(m.string(), Iqa).optional(),
        model: m.union([UEn, m.object({
            main: UEn.optional(),
            lite: UEn.optional()
        }).strict().refine(e => e.main !== void 0 || e.lite !== void 0)]).optional(),
        small_model: m.never().optional()
    }).passthrough();
    r($En, "parseLegacyCliModelConfig");
    r(okt, "parseModelTarget")
});

function Aqa(e) {
    switch (e) {
        case "anthropic":
            return "anthropic-messages";
        case "openai":
            return "openai-responses";
        case "openai-compatible":
        case void 0:
            return "openai-chat-completions"
    }
    return "openai-chat-completions"
}

function Pqa(e) {
    let t = $En(e.input),
        n = lw.empty(),
        o = aA.empty();
    for (let [a, l] of Object.entries(t.provider ?? {})) {
        let u = a.trim();
        if (!u) continue;
        let f = u === "builtin:bigmodel" ? XQ.bigmodel : u === "builtin:zai" ? XQ.zai : void 0;
        if (f) {
            let w = l.options?.apiKey?.trim();
            w && (n = n.setRule({
                providerId: f,
                templateId: f,
                config: new kk({
                    group: "standard-personal",
                    access: new yz({
                        apiKey: w
                    })
                })
            }));
            continue
        }
