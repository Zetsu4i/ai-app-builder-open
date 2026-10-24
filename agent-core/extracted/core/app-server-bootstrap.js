                            }, w)
                        }, "scheduleReannounce");
                    T()
                }
            })
        }
        resolveClientRequest(t, n) {
            let o = String(t),
                s = this.pendingClientRequests.get(o);
            if (s) {
                this.cleanupClientRequest(s);
                try {
                    s.resolve(s.resultSchema.parse(n))
                } catch (a) {
                    s.reject(a instanceof Error ? a : new Error(`Invalid response: ${s.method}`))
                }
            }
        }
        rejectClientRequest(t, n) {
            let o = String(t),
                s = this.pendingClientRequests.get(o);
            s && (this.cleanupClientRequest(s), s.reject(n))
        }
        cleanupClientRequest(t) {
            t.timeout && clearTimeout(t.timeout), t.reannounceTimer && clearTimeout(t.reannounceTimer), t.abortHandler && t.signal?.removeEventListener("abort", t.abortHandler);
            for (let n of t.requestKeys) this.pendingClientRequests.delete(n);
            t.requestKeys.clear()
        }
    }
});
var PYa, xxt, JKo = Y(() => {
    "use strict";
    gs();
    PYa = 100, xxt = class {
        static {
            r(this, "ZCodeProtocolNdjsonConnection")
        }
        options;
        buffer = "";
        processing = Promise.resolve();
        lastQueuedMessageStarted = Promise.resolve();
        closedPromise;
        resolveClosed;
        rejectClosed;
        terminal = !1;
        transportCloseNotified = !1;
        draining = !1;
        drainTimer;
        constructor(t) {
            this.options = t, this.closedPromise = new Promise((n, o) => {
                this.resolveClosed = n, this.rejectClosed = o
            })
        }
        start() {
            this.options.input.on("data", this.onData), this.options.input.once("end", this.onClose), this.options.input.once("close", this.onClose), this.options.input.on("error", this.onError), this.options.output.on("error", this.onError), this.options.signal?.addEventListener("abort", this.onAbort, {
                once: !0
            }), this.options.signal?.aborted && this.onAbort()
        }
        waitForClose() {
            return this.closedPromise
        }
        send(t) {
            if (!this.terminal) try {
                this.options.output.write(`${JSON.stringify(t)}
`)
            } catch (n) {
                this.onError(n instanceof Error ? n : new Error(String(n)))
            }
        }
        onData = r(t => {
            if (this.terminal || this.draining) return;
            this.buffer += typeof t == "string" ? t : t.toString("utf8");
            let n = this.buffer.indexOf(`
`);
            for (; n >= 0;) {
                let o = this.buffer.slice(0, n).trim();
                this.buffer = this.buffer.slice(n + 1), o.length > 0 && this.dispatchLine(o), n = this.buffer.indexOf(`
`)
            }
        }, "onData");
        onClose = r(() => {
            if (this.terminal || this.draining) return;
            let t = this.buffer.trim();
            t.length > 0 && (this.dispatchLine(t), this.buffer = ""), this.draining = !0, this.notifyTransportClosed(new Error("ZCode Protocol client connection closed")), this.drainTimer = setTimeout(() => this.finish(), PYa), this.processing.then(() => this.finish(), n => this.fail(n))
        }, "onClose");
        onAbort = r(() => {
            this.notifyTransportClosed(new Error("ZCode Protocol runtime stopping")), this.finish()
        }, "onAbort");
        onError = r(t => {
            this.notifyTransportClosed(t), this.fail(t)
        }, "onError");
        notifyTransportClosed(t) {
            this.transportCloseNotified || (this.transportCloseNotified = !0, this.options.onTransportClosed?.(t))
        }
        finish() {
            this.terminal || (this.terminal = !0, this.detachInput(), this.options.clearPostResponseMessages?.(), this.resolveClosed())
        }
        fail(t) {
            this.terminal || (this.terminal = !0, this.notifyTransportClosed(t), this.detachInput(), this.options.clearPostResponseMessages?.(), this.rejectClosed(t))
        }
        detachInput() {
            this.drainTimer && clearTimeout(this.drainTimer), this.options.input.off("data", this.onData), this.options.input.off("end", this.onClose), this.options.input.off("close", this.onClose), this.options.signal?.removeEventListener("abort", this.onAbort)
        }
        dispatchLine(t) {
            if (this.terminal) return;
            let n = this.decodeLine(t);
            if (!n) return;
            if ("id" in n && ("result" in n || "error" in n)) {
                this.handleMessage(n).catch(a => {
                    this.fail(a instanceof Error ? a : new Error(String(a)))
                });
                return
            }
            if (this.shouldBypassProcessingQueue(n)) {
                this.lastQueuedMessageStarted.then(() => this.handleMessage(n)).catch(a => {
                    this.fail(a instanceof Error ? a : new Error(String(a)))
                });
                return
            }
            let o, s = new Promise(a => {
                o = a
            });
            this.lastQueuedMessageStarted = s, this.processing = this.processing.then(async () => {
                let a = this.handleMessage(n);
                o(), await a
            }).catch(a => {
                o(), this.fail(a instanceof Error ? a : new Error(String(a)))
            })
        }
        decodeLine(t) {
            let n;
            try {
                n = JSON.parse(t)
            } catch (s) {
                return this.options.logger?.warn("ZCode Protocol JSON parse failed", {
                    error: s instanceof Error ? s.message : String(s),
                    event: "zcode_protocol.parse.failed",
                    module: "bootstrap.zcode_protocol",
                    status: "failed"
                }), this.sendError("parse-error", -32700, "Parse error"), null
            }
            let o = XVt.safeParse(n);
            return o.success ? o.data : (this.sendError("invalid-message", -32600, "Invalid ZCode Protocol message", {
                issues: o.error.issues
            }), null)
        }
        shouldBypassProcessingQueue(t) {
            return "id" in t && "method" in t && (t.method === va.sessionStop || t.method === va.workspaceCancelGenerateText)
        }
        async handleMessage(t) {
            if (this.terminal) return;
            let n = await this.options.handleMessage(t);
            if (n) {
                let o = "id" in n && ("result" in n || "error" in n) ? this.options.takePostResponseBatch?.(n.id) ?? {
                    messages: this.options.takePostResponseMessages?.(n.id) ?? [],
                    commit: r(() => !0, "commit")
                } : {
                    messages: [],
                    commit: r(() => !0, "commit")
                };
                if (this.terminal) return;
                this.send(n);
                for (let s of o.messages) this.send(s);
                this.terminal || o.commit()
            }
        }
        sendError(t, n, o, s) {
            this.send({
                error: {
                    code: n,
                    data: s,
                    message: o
                },
                id: t
            })
        }
    }
});
async function KKo(e) {
    let t = e.deadlineAt ?? Date.now() + RYa,
        n = r(async (o, s) => {
            let a;
            try {
                await Promise.race([Promise.resolve().then(s), new Promise((l, u) => {
                    a = setTimeout(() => u(new Error("Protocol cleanup timed out")), Math.max(0, Math.min(DYa, t - Date.now())))
                })])
            } catch (l) {
                e.logger.warn(`ZCode Protocol ${o} shutdown failed`, {
                    errorType: l instanceof Error ? l.name : typeof l,
                    event: `zcode_protocol.${o}.shutdown.failed`,
                    module: "bootstrap.zcode_protocol"
                })
            } finally {
                a && clearTimeout(a)
            }
        }, "step");
    await Promise.all([n("sampler", () => e.processResourceSampler?.stop()), n("mcp_telemetry", () => e.mcpTelemetryTracker?.stop())]), await n("sessions", () => e.server?.shutdown()), await n("projections", () => e.server?.disposeProjections()), await Promise.all([n("node_repl_browser_broker", () => e.nodeReplBrowserBroker?.close()), n("mcp", () => e.mcpPort?.close()), n("mcp_pool", () => e.mcpConnectionPool?.close())]), await Promise.all([n("session_store", () => {
        e.sessionStore && KSt(e.sessionStore)
    }), n("provider_registry", () => e.providerRegistryRuntime?.dispose()), n("telemetry", () => $St())])
}
var RYa, DYa, ZKo = Y(() => {
    "use strict";
    qSt();
    obe();
    RYa = 1200, DYa = 400;
    r(KKo, "cleanupProtocolRuntime")
});

function MYa() {
    return YKo ??= (0, QKo.randomBytes)(8).toString("hex"), YKo
}

function Txt(e) {
    return Math.round(e * 1e4) / 1e4
}

function XKo(e, t) {
    return Number.isFinite(e) && e >= 0 ? Math.round(e / t) : void 0
}

function eZo(e) {
    let t = e.platform ?? process.platform,
        n = e.arch ?? process.arch,
        o = Math.max(1, Math.min(4096, Math.trunc(e.logicalCpuCount ?? (0, Ixt.availableParallelism)()))),
        s = e.readCpuUsage ?? (() => process.cpuUsage()),
        a = e.readMonotonicTimeNs ?? (() => process.hrtime.bigint()),
        l = e.readMemoryUsage ?? (() => process.memoryUsage()),
        u = e.readUptimeSeconds ?? (() => process.uptime()),
        f = e.instanceToken ?? MYa(),
        g = XKo((e.readTotalMemoryBytes ?? (() => (0, Ixt.totalmem)()))(), 1024 ** 3),
        _ = e.timer ?? NYa,
        b, w, T = r(() => ({
            cpu: s(),
            monotonicTimeNs: a()
        }), "readBaseline"),
        I = r(() => {
            try {
                let A = T();
                if (!b) {
                    b = A;
                    return
                }
                let R = A.monotonicTimeNs - b.monotonicTimeNs,
                    L = A.cpu.user - b.cpu.user + (A.cpu.system - b.cpu.system);
                if (R <= 0n || L < 0) {
                    b = A;
                    return
                }
                let U = Math.round(Number(R) / 1e6);
                if (U <= 0) {
                    b = A;
                    return
                }
                let j = L / (Number(R) / 1e3),
                    z = l(),
                    $ = z.rss / 1024,
                    K = XKo(u(), 60);
                b = A;
                let q = {
                    platform: t,
                    arch: n,
                    logicalCpuCount: o,
                    intervalMs: U,
                    cpuCores: Txt(j),
                    cpuPercent: Txt(j / o * 100),
                    rssKb: Txt($),
                    heapUsedKb: Txt(z.heapUsed / 1024),
                    instanceToken: f,
                    ...K === void 0 ? {} : {
                        uptimeMinutes: K
                    },
                    ...g === void 0 ? {} : {
                        totalMemoryGb: g
                    }
                };
                try {
                    e.onSample(q, z)
                } catch {}
            } catch {}
        }, "sample");
    return {
        start() {
            if (!w) {
                try {
                    b = T()
                } catch {
                    b = void 0
                }
                try {
                    w = _.setInterval(I, OYa)
                } catch {
                    w = void 0;
                    return
                }
                try {
                    w.unref?.()
                } catch {}
            }
        },
        stop() {
            if (!w) return;
            let A = w;
            w = void 0, b = void 0;
            try {
                _.clearInterval(A)
            } catch {}
        }
    }
}
var QKo, Ixt, OYa, YKo, NYa, tZo = Y(() => {
    "use strict";
    QKo = require("node:crypto"), Ixt = require("node:os");
    gs();
    OYa = 6e4;
    r(MYa, "resolveProcessInstanceToken");
    NYa = {
        setInterval(e, t) {
            return setInterval(e, t)
        },
        clearInterval(e) {
            clearInterval(e)
        }
    };
    r(Txt, "roundResourceMetric");
    r(XKo, "toRoundedUnit");
    r(eZo, "createZCodeProcessResourceSampler")
});

function nZo(e, t, n) {
    try {
        let o = lqt(),
            s = eZo({
                onSample: r((a, l) => {
                    t({
                        method: OR.processResourceSample,
                        params: a
                    }), e.rebalanceResidentSessions();
                    try {
                        e.pruneSessionEventStores(), e.pruneDetachedChildPublishers()
                    } catch {}
                    try {
                        let u = {
                                role: "agent_node",
                                ...uqt(l),
                                counters: e.collectMemoryDiagnostics()
                            },
                            f = o.evaluate(u, Date.now());
                        if (f) {
                            let {
                                role: g,
                                counters: _,
                                ...b
                            } = u;
                            n.info("Process memory sample", {
                                event: "zcode_protocol.process.memory_sample",
                                reason: f,
                                ...b,
                                counters: _
                            })
                        }
                    } catch {}
                }, "onSample")
            });
        return s.start(), s
    } catch {
        return
    }
}
var rZo = Y(() => {
    "use strict";
    gs();
    tZo();
    r(nZo, "startProtocolResourceSampler")
});
async function u3e(e) {
    let {
        signal: t
    } = e;
    return t?.throwIfAborted(), t ? new Promise((n, o) => {
        let s = r(() => o(t.reason), "abort");
        t.addEventListener("abort", s, {
            once: !0
        }), Promise.resolve().then(() => (t.throwIfAborted(), e.create())).then(async a => {
            if (t.removeEventListener("abort", s), !t.aborted) return n(a);
            try {
                await e.disposeLate?.(a)
            } catch (l) {
                e.logger.warn("Late protocol startup resource cleanup failed", {
                    errorType: l instanceof Error ? l.name : typeof l,
                    event: "zcode_protocol.startup.late_cleanup.failed"
                })
            }
        }, a => {
            t.removeEventListener("abort", s), o(a)
        })
    }) : e.create()
}
var oZo = Y(() => {
    "use strict";
    r(u3e, "acquireProtocolStartupResource")
});
async function Cxt(e = process.env, t = {}) {
    let o = (await O5o({
        ...QBt(),
        ...e
    }, {
        ...t,
        productVersion: t.productVersion ?? e.ZCODE_APP_VERSION
    })).ZCODE_TELEMETRY_DEVICE_MID;
    return o ? {
        ...e,
        ZCODE_TELEMETRY_DEVICE_MID: o
    } : e
}
async function Ext() {
    await $St()
}
var jPn = Y(() => {
    "use strict";
    gs();
    qSt();
    r(Cxt, "prepareZCodeTelemetryEnv");
    r(Ext, "shutdownZCodeTelemetry")
});

function LYa(e, t) {
    return {
        ...e,
        runtimeConfig: {
            ...e.runtimeConfig,
            presentationSurface: t
        }
    }
}

function FYa(e, t, n) {
    return {
        ...e,
        providerRegistry: t,
        ...n ? {
            configuredDefaultModelSelection: n
        } : {}
    }
}
async function iZo(e = {}) {
    if (e.prepareStorageOnly) {
        let j = K0({
            env: e.env
        });
        await pWo({
            dbPath: Iie(j, e.cwd),
            input: e.input ?? process.stdin,
            output: e.output ?? process.stdout
        });
        return
    }
    let t = y4(),
        n = e.presentationSurface ?? "terminal",
        o = e.input ?? process.stdin,
        s = e.output ?? process.stdout,
        a = Z3({
            env: e.env
        }),
        l = hA({
            attributes: {
                entrypoint: "zcode_protocol"
            }
        }),
        u = a.createLogger("zcode").child({
            ...Xa(l),
            module: "bootstrap.zcode_protocol"
        });
    mWo(u);
    let f = new SK(u, {
        ...Xa(l),
        module: "bootstrap.zcode_protocol",
        startupKind: "zcode_protocol_agent"
    }, t);
    f.start("ZCode Protocol agent startup started", {
        context: {
            version: e.version
        },
        event: "zcode_protocol.startup.started",
        stage: "start"
    });
    let g, _, b, w, T, I, A, R, L, U;
    try {
        let j = K0({
            env: e.env
        });
        g = await u3e({
            signal: e.lifecycle?.signal,
            logger: u,
            disposeLate: r(Fe => KSt(Fe), "disposeLate"),
            create: r(() => XEn({
                dbPath: Iie(j),
                output: s,
                onProgress: r(Fe => u.info("SQLite startup state", {
                    event: "zcode_protocol.startup.storage_state",
                    ...Fe
                }), "onProgress")
            }), "create")
        });
        let z = e.env ?? process.env;
        e.lifecycle?.signal.throwIfAborted(), U = await u3e({
            signal: e.lifecycle?.signal,
            logger: u,
            create: r(() => lkt(z), "create"),
            disposeLate: r(Fe => Fe.dispose(), "disposeLate")
        }), e.lifecycle?.signal.throwIfAborted(), u.info("Worker Provider Registry \u5DF2\u5C31\u7EEA", {
            accountRevision: U.snapshot.sourceRevisions.account,
            configRevision: U.snapshot.sourceRevisions.config,
            event: "zcode_protocol.provider_registry.ready",
            module: "bootstrap.zcode_protocol",
            providerCount: U.snapshot.registry.providers.length
        });
        let $ = jYa(z),
            K = await u3e({
                signal: e.lifecycle?.signal,
                logger: u,
                disposeLate: r(() => Ext(), "disposeLate"),
                create: r(() => Cxt(z, {
                    cliVersion: e.version,
                    productVersion: e.env?.ZCODE_APP_VERSION,
                    runtimeSurface: $
                }), "create")
            }),
            q = K.ZCODE_TELEMETRY_DEVICE_MID;
        I = j.config.features.mcp === !1 ? void 0 : xfn({
            idSalt: q ?? l.traceId,
            onEvent: r(Fe => R?.(Fe), "onEvent"),
            onResourceSamples: r(Fe => A?.(Fe), "onResourceSamples")
        });
        let ie = e.providerEndpointRoutingPort ?? Rje({
                appVersion: e.version,
                env: e.env,
                logger: u,
                network: j.config.network,
                sourceTitle: "electron"
            }),
            ae, Ce = r(() => c1(e.env ?? process.env), "resolveZCodeApiOrigin"),
            pe = (e.env ?? process.env)[zVt]?.trim(),
            ze = {
                authHeadersPort: _Wo({
                    resolveContext: r(() => ae, "resolveContext"),
                    resolveWorkspace: r(({
                        workspaceIdentity: Fe,
                        workspacePath: kt
                    }) => {
                        let St = kt ?? e.cwd;
                        if (!St) return;
                        let ct = Fe?.trim();
                        return {
                            ...ct ? {
                                workspaceIdentity: ct
                            } : {},
                            workspaceKey: ct || St,
                            workspacePath: St
                        }
                    }, "resolveWorkspace")
                }),
                resolveZCodeApiOrigin: Ce,
                ...pe ? {
                    workspaceIdentity: pe
                } : {},
                trustedOrigins: qVt({
                    devTrustedOriginsRaw: (e.env ?? process.env)[UVt],
                    resolveZCodeApiOrigin: Ce
                })
            };
        w = j.config.features.mcp === !1 ? void 0 : jQr({
            clientVersion: e.version ?? "0.0.0",
            env: e.env,
            logger: u,
            network: {
                httpProxy: j.config.network.httpProxy,
                noProxy: j.config.network.noProxy,
                caCertFile: j.config.network.caCertFile
            },
            officialMcpAuth: ze,
            telemetry: I,
            workingDirectory: e.cwd
        }), T = w?.acquireLease({
            leaseId: "protocol-settings"
        });
        let rt = U,
            Ae = ifr(rt.runtime.registryService);
        e.lifecycle?.signal.throwIfAborted();
        let bt = _ = new kxt({
            createZCodeApp: r((Fe = {}) => jEn({
                ...FYa(LYa(Fe, n), rt.runtime.registryService, rt.configuredDefaultModelSelection),
                resolveEffectiveModelSelection: r(kt => {
                    let St = Ae.getView(void 0, void 0, {
                        selection: kt
                    });
                    return {
                        effectiveSelection: St.effectiveSelection ?? null,
                        selectionIssue: St.selectionIssue
                    }
                }, "resolveEffectiveModelSelection"),
                env: {
                    ...K,
                    ...Fe.env,
                    ...q ? {
                        ZCODE_TELEMETRY_DEVICE_MID: q
                    } : {}
                },
                ...b ? {
                    nodeReplBrowserBroker: b
                } : {},
                ...w ? {
                    mcpPortFactory: r(() => w.acquireLease({
                        leaseId: Fe.sessionId,
                        sessionId: Fe.sessionId
                    }), "mcpPortFactory")
                } : {},
                providerEndpointRoutingPort: ie,
                sourceTitle: "electron",
                onToolExecResource: r(kt => Ye.send({
                    method: OR.toolExecResource,
                    params: kt
                }), "onToolExecResource")
            }), "createZCodeApp"),
            cwd: e.cwd,
            env: e.env,
            loggerFactory: a,
            mcpPort: T,
            mcpTelemetry: I,
            sessionStore: g,
            syncAccountProviderConfig: rt.syncAccountProviderConfig,
            refreshProviderRegistry: r(async Fe => {
                await rt.runtime.registryService.refresh(Fe)
            }, "refreshProviderRegistry"),
            version: e.version
        });
        if (ae = bt.officialMcpAuthRequestContext, j.config.features.mcp !== !1) {
            b = Jwt({
                browserControlPort: bt.browserControlPort,
                logger: u,
                platform: process.platform
            });
            let Fe = b;
            await u3e({
                signal: e.lifecycle?.signal,
                logger: u,
                create: r(() => Fe.ready, "create")
            })
        }
        let Ye = new xxt({
            signal: e.lifecycle?.signal,
            clearPostResponseMessages: r(() => bt.clearPostResponseMessages(), "clearPostResponseMessages"),
            handleMessage: r(Fe => bt.handleMessage(Fe), "handleMessage"),
            input: o,
            logger: u,
            onTransportClosed: r(Fe => bt.disconnectClient(Fe), "onTransportClosed"),
            output: s,
            takePostResponseBatch: r(Fe => bt.takePostResponseBatch(Fe), "takePostResponseBatch")
        });
        bt.setNotificationSink(Fe => Ye.send(Fe)), A = r(Fe => Ye.send({
            method: OR.mcpResourceSamples,
            params: Fe
        }), "mcpResourceSink"), R = r(Fe => {
            Fe.kind !== "memory" && Ye.send({
                method: OR.mcpTelemetry,
                params: Fe
            })
        }, "mcpTelemetrySink"), Ye.start(), I?.start(), L = nZo(bt, Fe => Ye.send(Fe), u), f.complete("ZCode Protocol agent startup completed", {
            event: "zcode_protocol.startup.completed",
            stage: "total"
        }), GSt(a, u), await Ye.waitForClose()
    } catch (j) {
        throw e.lifecycle?.requestShutdown(j instanceof Error ? j : new Error("Protocol runtime failed", {
            cause: j
        })), f.fail("ZCode Protocol agent startup failed", j, {
            event: "zcode_protocol.startup.failed",
            stage: "total"
        }), j
    } finally {
        e.lifecycle?.requestShutdown(), await KKo({
            logger: u,
            deadlineAt: e.lifecycle?.deadlineAt,
            server: _,
            processResourceSampler: L,
            mcpTelemetryTracker: I,
            nodeReplBrowserBroker: b,
            mcpPort: T,
            mcpConnectionPool: w,
            sessionStore: g,
            providerRegistryRuntime: U
        }), u.info("ZCode Protocol agent shutdown completed", {
            ...Xa(l),
            event: "zcode_protocol.shutdown.completed",
            module: "bootstrap.zcode_protocol",
            status: "completed"
        })
    }
}

function jYa(e) {
    return e.ZCODE_TELEMETRY_RUNTIME_SURFACE?.trim() === "remote_workspace_host" ? "remote_workspace_host" : "desktop_local_host"
}
var sZo = Y(() => {
    "use strict";
    yw();
    efe();
    E0e();
    Cut();
    gs();
    ar();
    BEn();
    OEn();
    fWo();
    obe();
    ukt();
    _Cn();
    YEn();
    HSt();
    hWo();
    yWo();
    gs();
    GKo();
    JKo();
    ZKo();
    rZo();
    oZo();
    jPn();
    r(LYa, "applyProtocolPresentationSurface");
    r(FYa, "applyProtocolProviderRegistry");
    r(iZo, "runZCodeProtocolAgent");
    r(jYa, "resolveProtocolRuntimeSurface")
});
async function aZo(e) {
    let t = e.sessionStore === void 0,
        n = e.sessionStore;
    if (!n) {
        let o = K0({
            env: e.env
        });
        n = Det({
            dbPath: Iie(o)
        })
