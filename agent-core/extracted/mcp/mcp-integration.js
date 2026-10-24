                }), this._process.stdout?.on("data", n => {
                    try {
                        this._readBuffer.append(n), this.processReadBuffer()
                    } catch (o) {
                        this.onerror?.(o), this.close().catch(() => {})
                    }
                }), this._process.stdout?.on("error", n => {
                    this.onerror?.(n)
                }), this._stderrStream && this._process.stderr && this._process.stderr.pipe(this._stderrStream)
            })
        }
        get stderr() {
            return this._stderrStream ? this._stderrStream : this._process?.stderr ?? null
        }
        get pid() {
            return this._process?.pid ?? null
        }
        processReadBuffer() {
            for (;;) try {
                let e = this._readBuffer.readMessage();
                if (e === null) break;
                this.onmessage?.(e)
            } catch (e) {
                this.onerror?.(e)
            }
        }
        async _dispose() {
            let e = this._process;
            if (this._process = void 0, e && e.exitCode === null && e.signalCode === null) {
                let t = new Promise(n => e.once("exit", () => n()));
                try {
                    e.stdin?.end()
                } catch {}
                try {
                    e.kill("SIGTERM")
                } catch {}
                if (await Promise.race([t, new Promise(n => setTimeout(n, 1e3).unref())]), e.exitCode === null && e.signalCode === null) try {
                    e.kill("SIGKILL")
                } catch {}
                await t
            }
            try {
                e?.stdout?.destroy()
            } catch {}
            try {
                e?.stdin?.destroy()
            } catch {}
            try {
                e?.stderr?.destroy()
            } catch {}
            this._readBuffer.clear()
        }
        async close() {
            if (this._process) {
                let e = this._process;
                this._process = void 0;
                let t = new Promise(n => {
                    e.once("close", () => {
                        n()
                    })
                });
                try {
                    e.stdin?.end()
                } catch {}
                if (await Promise.race([t, new Promise(n => setTimeout(n, 2e3).unref())]), e.exitCode === null) {
                    try {
                        e.kill("SIGTERM")
                    } catch {}
                    await Promise.race([t, new Promise(n => setTimeout(n, 2e3).unref())])
                }
                if (e.exitCode === null) try {
                    e.kill("SIGKILL")
                } catch {}
            }
            this._readBuffer.clear()
        }
        send(e) {
            return new Promise(t => {
                if (!this._process?.stdin) throw new nl(Ec.NotConnected, "Not connected");
                let n = lpn(e);
                this._process.stdin.write(n) ? t() : this._process.stdin.once("drain", t)
            })
        }
    }
});

function FXr(e, t, n, o) {
    let s = RMe(t) ? t : {},
        a = typeof s.name == "string" ? s.name : "unknown";
    return {
        serverName: e,
        toolName: a,
        name: `mcp__${LXr(e)}__${LXr(a)}`,
        description: typeof s.description == "string" ? s.description : void 0,
        timeoutMs: n,
        inputSchema: cqs(s.inputSchema),
        outputSchema: RMe(s.outputSchema) ? s.outputSchema : void 0,
        annotations: lqs(s.annotations),
        ...o ? {
            official: !0
        } : {}
    }
}

function cqs(e) {
    return RMe(e) ? {
        ...e,
        type: "object",
        properties: RMe(e.properties) ? e.properties : {}
    } : {
        type: "object",
        properties: {},
        additionalProperties: !0
    }
}

function lqs(e) {
    if (RMe(e)) return {
        readOnlyHint: typeof e.readOnlyHint == "boolean" ? e.readOnlyHint : void 0,
        destructiveHint: typeof e.destructiveHint == "boolean" ? e.destructiveHint : void 0,
        idempotentHint: typeof e.idempotentHint == "boolean" ? e.idempotentHint : void 0,
        openWorldHint: typeof e.openWorldHint == "boolean" ? e.openWorldHint : void 0
    }
}

function LXr(e) {
    let t = e.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
    return t.length > 0 ? t : "unknown"
}

function RMe(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}
var jXr = Y(() => {
    "use strict";
    r(FXr, "normalizeMcpToolDescriptor");
    r(cqs, "normalizeInputSchema");
    r(lqs, "normalizeAnnotations");
    r(LXr, "sanitizeMcpName");
    r(RMe, "isRecord")
});

function $Xr(e) {
    let t = BXr(e.url),
        n = r((s, a) => (e.onAuthFailure?.(s), new bge(s, a)), "failWith");
    return r(async (s, a) => {
        let l = hqs(s),
            u = BXr(l);
        if (!u || !t || u !== t) throw n("official_mcp_origin_untrusted", `official MCP request origin does not match the configured endpoint: ${e.serverName}`);
        let f = await e.trustedOrigins.isTrusted({
            mcpKey: e.official.mcpKey,
            origin: u,
            pluginId: e.official.pluginId
        });
        if (!f.trusted) throw n("official_mcp_origin_untrusted", `official MCP origin is not trusted (${f.detail??"unknown"}): ${e.serverName} origin=${u} pluginId=${e.official.pluginId}`);
        let g = vqs(a?.body),
            _ = {
                event: "mcp.official_auth.request",
                mcpKey: e.official.mcpKey,
                mcpServerName: e.serverName,
                module: "adapters.mcp.official_auth",
                requestBodyBytes: yqs(a?.body),
                urlPath: _qs(l),
                ...g.method ? {
                    rpcMethod: g.method
                } : {},
                ...g.id !== void 0 ? {
                    rpcId: g.id
                } : {},
                ...g.toolName ? {
                    rpcToolName: g.toolName
                } : {},
                ...g.traceId ? {
                    mcpTraceId: g.traceId
                } : {}
            },
            b = r(async I => {
                let A = {},
                    R;
                if (e.authHeadersPort) {
                    let z = Date.now(),
                        $ = await e.authHeadersPort.resolveHeaders({
                            mcpKey: e.official.mcpKey,
                            pluginId: e.official.pluginId,
                            targetOrigin: u,
                            ...e.workspaceIdentity ? {
                                workspaceIdentity: e.workspaceIdentity
                            } : {},
                            ...e.workspacePath ? {
                                workspacePath: e.workspacePath
                            } : {},
                            ...a?.signal ? {
                                signal: a.signal
                            } : {}
                        });
                    R = Date.now() - z, $.ok ? A = $.headers : e.logger?.warn("Official MCP auth headers unavailable for request", {
                        ..._,
                        attempt: I,
                        event: "mcp.official_auth.resolve",
                        fallback: "anonymous",
                        reason: $.reason,
                        resolveDurationMs: R,
                        status: "failed"
                    })
                } else e.logger?.warn("Official MCP auth port unavailable for request", {
                    ..._,
                    attempt: I,
                    event: "mcp.official_auth.resolve",
                    fallback: "anonymous",
                    reason: "official_auth_unavailable",
                    status: "failed"
                });
                let L = $Vt(A),
                    U = mqs(a?.headers, A);
                U.delete(zXr), U.delete(uqs), e.logger?.debug("Official MCP request sending", {
                    ..._,
                    attempt: I,
                    resolveDurationMs: R,
                    status: "started",
                    timeoutHint: bqs(a?.signal),
                    ...L
                });
                let j = Date.now();
                try {
                    let z = await e.baseFetch(s, {
                            ...a,
                            headers: U,
                            redirect: "manual"
                        }),
                        $ = qXr(z),
                        K = g.method === "tools/call" ? void 0 : await pqs(z);
                    ($ || K) && e.onServerResponse?.({
                        httpStatus: z.status,
                        ...K ? {
                            failureKind: K
                        } : {},
                        ...$ ? {
                            serverRequestId: $
                        } : {},
                        ...g.method ? {
                            rpcMethod: g.method
                        } : {},
                        ...g.toolName ? {
                            rpcToolName: g.toolName
                        } : {},
                        ...g.spanId ? {
                            spanId: g.spanId
                        } : {},
                        ...g.traceId ? {
                            traceId: g.traceId
                        } : {}
                    });
                    let q = {
                        ..._,
                        attempt: I,
                        httpStatus: z.status,
                        responseBodyBytes: WXr(z.headers.get("content-length")),
                        sendDurationMs: Date.now() - j,
                        ...$ ? {
                            serverRequestId: $
                        } : {}
                    };
                    return z.ok ? e.logger?.debug("Official MCP response received", {
                        ...q,
                        status: "completed"
                    }) : e.logger?.warn("Official MCP response failed", {
                        ...q,
                        status: "failed"
                    }), {
                        authApplied: Object.keys(A).length > 0,
                        response: z
                    }
                } catch (z) {
                    let $ = Date.now() - j;
                    throw e.logger?.warn("Official MCP request did not complete", {
                        ..._,
                        aborted: Sqs(z),
                        attempt: I,
                        error: z instanceof Error ? z.message : String(z),
                        errorName: z instanceof Error ? z.name : "unknown",
                        sendDurationMs: $,
                        status: "failed"
                    }), z
                }
            }, "send"),
            w = await b(1),
            T = w.response;
        if (T.status === 401 && w.authApplied && (e.logger?.info("Official MCP retrying once after 401", {
                ..._,
                attempt: 2,
                status: "started"
            }), await put(T), w = await b(2), T = w.response), T.status === 401) {
            let I = "official MCP rejected the current credential",
                A = g.method === "tools/call" ? Xpn(I, T) : I;
            throw await put(T), n("official_auth_rejected", A)
        }
        if (T.status === 403) {
            let I = "official MCP denied access for the current plan",
                A = g.method === "tools/call" ? Xpn(I, T) : I;
            throw await put(T), n("official_auth_forbidden", A)
        }
        if (gqs(T.status)) {
            let I = `official MCP responded with a blocked redirect (${T.status})`,
                A = g.method === "tools/call" ? Xpn(I, T) : I;
            throw await put(T), n("official_auth_redirect_blocked", A)
        }
        return T
    }, "authFetch")
}
async function pqs(e) {
    if (e.status === 429) return "rate_limited";
    if (e.status >= 500) return "server_internal_error";
    if (!(e.headers.get("content-type")?.toLowerCase() ?? "").includes("json")) return e.ok ? void 0 : "connection_failed";
    let n = await fqs(e, dqs);
    if (!n) return e.ok ? void 0 : "connection_failed";
    try {
        let o = JSON.parse(n);
        if (!o || typeof o != "object" || Array.isArray(o)) return e.ok ? void 0 : "connection_failed";
        let s = o;
        if (s.code === 3001) return "server_not_found";
        if (s.code === 1e3) return "server_unavailable";
        if (s.jsonrpc === "2.0" && s.error !== void 0) {
            let a = s.error;
            if (a && typeof a == "object" && !Array.isArray(a)) {
                let l = a.code;
                if (l === 1006) return "not_authenticated";
                if (l === 3101) return "coding_plan_required"
            }
            return "protocol_error"
        }
    } catch {
        return e.ok ? void 0 : "connection_failed"
    }
    return e.ok ? void 0 : "connection_failed"
}
async function fqs(e, t) {
    let n = WXr(e.headers.get("content-length"));
    if (n !== void 0 && n > t) return;
    let o = e.clone().body;
    if (!o) return;
    let s = o.getReader(),
        a = new TextDecoder,
        l = 0,
        u = "";
    try {
        for (;;) {
            let f = await s.read();
            if (f.done) break;
            if (l += f.value.byteLength, l > t) {
                await s.cancel();
                return
            }
            u += a.decode(f.value, {
                stream: !0
            })
        }
        return u += a.decode(), u
    } finally {
        s.releaseLock()
    }
}

function mqs(e, t) {
    let n = new Headers,
        o = new Set(Object.keys(t).map(s => s.toLowerCase()));
    new Headers(e ?? {}).forEach((s, a) => {
        let l = a.toLowerCase();
        o.has(l) || jVt(l) && l !== "mcp-session-id" && l !== "mcp-protocol-version" || n.set(a, s)
    });
    for (let [s, a] of Object.entries(t)) n.set(s, a);
    return n
}

function hqs(e) {
    return typeof e == "string" ? e : e instanceof URL ? e.toString() : e.url
}

function BXr(e) {
    try {
        let t = new URL(e);
        return t.username !== "" || t.password !== "" ? void 0 : t.origin
    } catch {
        return
    }
}

function gqs(e) {
    return e >= 300 && e < 400
}

function qXr(e) {
    let t = e.headers.get(zXr)?.trim();
    return t || void 0
}

function Xpn(e, t) {
    let n = qXr(t);
    return n ? `${e} - ${n}` : e
}

function _qs(e) {
    try {
        return new URL(e).pathname
    } catch {
        return "(unparsable)"
    }
}

function yqs(e) {
    if (typeof e == "string") return Buffer.byteLength(e, "utf8");
    if (e instanceof Uint8Array) return e.byteLength
}

function WXr(e) {
    if (!e) return;
    let t = Number(e);
    return Number.isFinite(t) ? t : void 0
}

function vqs(e) {
    if (typeof e != "string" || e.length === 0) return {};
    try {
        let t = JSON.parse(e);
        if (!t || typeof t != "object" || Array.isArray(t)) return {};
        let n = t,
            o = typeof n.method == "string" ? n.method : void 0,
            s = typeof n.id == "number" || typeof n.id == "string" ? n.id : void 0,
            a = UXr(n.params) ? n.params : void 0,
            l = a && typeof a.name == "string" ? a.name : void 0,
            u = a && UXr(a._meta) ? a._meta : void 0,
            f = u && typeof u.trace_id == "string" ? u.trace_id : void 0,
            g = u && typeof u.span_id == "string" ? u.span_id : void 0;
        return {
            ...s !== void 0 ? {
                id: s
            } : {},
            ...o ? {
                method: o
            } : {},
            ...g ? {
                spanId: g
            } : {},
            ...l ? {
                toolName: l
            } : {},
            ...f ? {
                traceId: f
            } : {}
        }
    } catch {
        return {}
    }
}

function UXr(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function bqs(e) {
    return e ? e.aborted ? "already-aborted" : "armed" : "none"
}

function Sqs(e) {
    return e instanceof Error && (e.name === "AbortError" || e.name === "TimeoutError")
}
async function put(e) {
    try {
        await e.body?.cancel()
    } catch {}
}
var bge, zXr, uqs, dqs, VXr = Y(() => {
    "use strict";
    gs();
    bge = class extends Error {
        static {
            r(this, "OfficialMcpAuthError")
        }
        kind;
        constructor(t, n) {
            super(n), this.kind = t, this.name = "OfficialMcpAuthError"
        }
    }, zXr = "x-request-id", uqs = "x-trace-id";
    r($Xr, "createOfficialMcpAuthFetch");
    dqs = 64 * 1024;
    r(pqs, "classifyOfficialMcpResponse");
    r(fqs, "readBoundedResponseText");
    r(mqs, "mergeOfficialAuthHeaders");
    r(hqs, "resolveRequestUrl");
    r(BXr, "safeOrigin");
    r(gqs, "isRedirect");
    r(qXr, "readServerRequestId");
    r(Xpn, "withServerRequestId");
    r(_qs, "safePath");
    r(yqs, "byteLength");
    r(WXr, "numericHeader");
    r(vqs, "describeJsonRpc");
    r(UXr, "isPlainRecord");
    r(bqs, "describeAbortSignal");
    r(Sqs, "isAbortError");
    r(put, "discardBody")
});

function HXr(e) {
    let t = e.env ?? process.env;
    return xqs(sme(CQ(wqs(t)), {
        network: e.network,
        sourceEnv: t
    }))
}

function DMe(e) {
    return nit({
        caCertFile: e.network?.caCertFile,
        env: e.env ?? process.env,
        httpProxy: e.network?.httpProxy,
        noProxy: e.network?.noProxy
    })
}

function wqs(e) {
    let t = {};
    for (let [n, o] of Object.entries(e)) typeof o == "string" && (t[n] = o);
    return t
}

function xqs(e, t = kqs) {
    let n = t.platform === "win32" ? SG.win32 : SG.posix,
        o = t.platform === "win32" ? ";" : SG.delimiter,
        s = n.basename(t.execPath).toLowerCase();
    if (s !== "node" && s !== "node.exe") return e;
    let a = Object.keys(e).find(_ => _.toLowerCase() === "path") ?? "PATH",
        l = e[a] ?? "",
        u = n.dirname(t.execPath),
        f = l.split(o).filter(Boolean);
    if (f.some(_ => Tqs(_, u, t.platform))) return e;
    let g = t.platform === "win32" ? "node.exe" : "node";
    return f.some(_ => t.isExecutable(n.join(_, g))) ? e : {
        ...e,
        [a]: l ? `${u}${o}${l}` : u
    }
}

function Tqs(e, t, n) {
    let o = n === "win32" ? SG.win32 : SG.posix,
        s = r(a => {
            let l = o.normalize(a);
            return n === "win32" ? l.toLowerCase() : l
        }, "normalize");
    return s(e) === s(t)
}

function Iqs(e) {
    try {
        return (0, fut.accessSync)(e, fut.constants.X_OK), !0
    } catch {
        return !1
    }
}
var fut, SG, kqs, GXr = Y(() => {
    "use strict";
    fut = require("node:fs"), SG = require("node:path");
    gs();
    jsn();
    att();
    r(HXr, "buildMcpStdioEnv");
    r(DMe, "createMcpTransportFetch");
    r(wqs, "filterStringEnv");
    kqs = {
        execPath: process.execPath,
        isExecutable: Iqs,
        platform: process.platform
    };
    r(xqs, "prependRunningNodeDirectory");
    r(Tqs, "arePathEntriesEqual");
    r(Iqs, "isExecutableFile")
});

function efn(e) {
    let t = new Map,
        n = e.idleGraceMs ?? Cqs,
        o = e.logger?.child({
            module: "adapters.mcp.pool"
        }),
        s = !1,
        a = 0,
        l = r(async _ => {
            let b = Date.now();
            _.closeTimer && clearTimeout(_.closeTimer), _.closeTimer = void 0, t.get(_.key) === _ && t.delete(_.key);
            try {
                await _.adapter.close(), o?.info("MCP pooled connection closed", {
                    ..._.connectionContext,
                    durationMs: Date.now() - b,
                    event: "mcp.pool.connection.closed",
                    mcpServerName: _.serverName,
                    status: "completed"
                })
            } catch (w) {
                o?.warn("MCP pooled connection close failed", {
                    ..._.connectionContext,
                    error: w instanceof Error ? w.message : String(w),
                    event: "mcp.pool.connection.close.failed",
                    mcpServerName: _.serverName
                })
            } finally {
                e.telemetry?.unregisterConnection({
                    connectionId: _.connectionContext.mcpConnectionId
                })
            }
        }, "closeEntry"),
        u = r(_ => {
            if (!_.closeTimer) {
                if (n <= 0) {
                    l(_);
                    return
                }
                _.closeTimer = setTimeout(() => {
                    _.closeTimer = void 0, _.refs.size === 0 && l(_)
                }, n), _.closeTimer.unref?.()
            }
        }, "scheduleClose"),
        f = r(async (_, b, w) => {
            if (_.revalidating) {
                await _.revalidating;
                return
            }
            let T = (async () => {
                let A = await _.connecting.then(() => !0, () => !1) ? (await _.adapter.status())[_.serverName]?.status : void 0;
                if (!(A === "connecting" || A === "disabled" || A === "untrusted")) {
                    if (A === "connected" && (await _.adapter.pingServer?.(_.serverName) ?? !0)) {
                        o?.debug("MCP pooled connection revalidated", {
                            ..._.connectionContext,
                            event: "mcp.pool.connection.revalidated",
                            mcpServerName: _.serverName,
                            status: "completed"
                        });
                        return
                    }
                    o?.warn("MCP pooled connection is stale; reconnecting", {
                        ..._.connectionContext,
                        event: "mcp.pool.connection.stale",
                        mcpConnectionState: A ?? "unknown",
                        mcpServerName: _.serverName,
                        status: "started"
                    }), _.connecting = _.adapter.connectServer(_.serverName, b, w), await _.connecting.catch(() => {})
                }
            })();
            _.revalidating = T.finally(() => {
                _.revalidating = void 0
            }), await _.revalidating
        }, "revalidateEntry");
    return {
        acquireLease: r((_ = {}) => {
            if (s) throw new Error("MCP connection pool is closed");
            let b = `${++a}:${_.leaseId??"lease"}`,
                w = _.sessionId?.trim() || void 0,
                T = new Map,
                I = new Map,
                A = !1,
                R = !1,
                L = r($ => {
                    let K = T.get($),
                        q = K ? t.get(K) : void 0;
                    if (!q) throw new Error(`MCP server is not leased by this session: ${$}`);
                    return q
                }, "requireEntry"),
                U = r($ => {
                    let K = T.get($);
                    if (!K) return;
                    T.delete($);
                    let q = t.get(K);
                    q && q.refs.delete(b) && (e.telemetry?.releaseOwner({
                        connectionId: q.connectionContext.mcpConnectionId,
                        ownerId: b
                    }), o?.info("MCP connection lease released", {
                        ...q.connectionContext,
                        event: "mcp.pool.lease.released",
                        mcpLeaseId: b,
                        mcpServerName: $,
                        refCount: q.refs.size,
                        ...w ? {
                            sessionId: w
                        } : {}
                    }), q.refs.size === 0 && u(q))
                }, "release"),
                j = r(async ($, K, q = {}) => {
                    let ie = Aqs({
                            config: K,
                            connectOptions: q,
                            leaseId: b,
                            serverName: $
                        }),
                        ae = T.get($),
                        Ce = t.get(ie),
                        pe = !1;
                    if (Ce) {
                        Ce.closeTimer && clearTimeout(Ce.closeTimer), Ce.closeTimer = void 0;
                        let ze = Ce.refs.size;
                        Ce.refs.add(b), pe = Ce.refs.size !== ze, q.revalidate && await f(Ce, K, q)
                    } else {
                        let ze = Eqs({
                            config: K,
                            connectOptions: q,
                            sessionId: w
                        });
                        e.telemetry?.registerConnection({
                            connectionId: ze.mcpConnectionId,
                            isolation: ze.mcpIsolation,
                            serverName: $,
                            ...K.source ? {
                                source: K.source.kind
                            } : {}
                        });
                        let rt = e.createAdapter({
                            connectionContext: ze,
                            config: K,
                            serverName: $,
                            workingDirectory: q.workingDirectory
                        });
                        Ce = {
                            adapter: rt,
                            connectionContext: ze,
                            connecting: rt.connectServer($, K, q),
                            key: ie,
                            refs: new Set([b]),
                            serverName: $
                        }, t.set(ie, Ce), pe = !0, o?.info("MCP pooled connection created", {
                            ...ze,
                            event: "mcp.pool.connection.created",
                            mcpServerName: $,
                            transport: K.type
                        })
                    }
                    if (ae && ae !== ie) {
                        let ze = t.get(ae);
                        ze && ze.refs.delete(b) && (e.telemetry?.releaseOwner({
                            connectionId: ze.connectionContext.mcpConnectionId,
                            ownerId: b
                        }), o?.info("MCP connection lease released", {
                            ...ze.connectionContext,
                            event: "mcp.pool.lease.released",
                            mcpLeaseId: b,
                            mcpServerName: $,
                            refCount: ze.refs.size,
                            ...w ? {
                                sessionId: w
                            } : {}
                        }), ze.refs.size === 0 && u(ze))
                    }
                    return T.set($, ie), pe && e.telemetry?.acquireOwner({
                        connectionId: Ce.connectionContext.mcpConnectionId,
                        ownerId: b,
                        ...w ? {
                            sessionId: w
                        } : {}
                    }), ae !== ie && o?.info("MCP connection lease acquired", {
                        ...Ce.connectionContext,
                        event: "mcp.pool.lease.acquired",
                        mcpLeaseId: b,
                        mcpServerName: $,
                        refCount: Ce.refs.size,
                        ...w ? {
                            sessionId: w
                        } : {}
                    }), await Ce.connecting
                }, "acquire"),
                z = r(async () => {
                    let $ = {},
                        K = [];
                    for (let [q, ie] of T) {
                        let ae = t.get(ie);
                        if (!ae) continue;
                        let Ce = (await ae.adapter.status())[q];
                        Ce && ($[q] = Ce), K.push(...await ae.adapter.listTools())
                    }
                    if (w && !R) {
                        R = !0;
                        let q = [...I].filter(([, ae]) => ae.enabled !== !1),
                            ie = q.filter(([ae]) => $[ae]?.status === "connected").length;
                        e.telemetry?.recordSessionStartup({
                            configuredCount: q.length,
                            connectedCount: ie,
                            failedCount: q.length - ie,
                            processCount: q.filter(([ae, Ce]) => Ce.type === "stdio" && $[ae]?.status === "connected").length,
                            sessionId: w
                        })
                    }
                    return {
                        statuses: $,
                        tools: K
                    }
                }, "snapshot");
            return {
                async callTool($, K) {
                    return await L($.serverName).adapter.callTool($, K)
                },
                async close() {
                    if (!A) {
                        A = !0;
                        for (let $ of [...T.keys()]) U($)
                    }
                },
                async connectConfiguredServers($, K = {}) {
                    I.clear();
                    for (let [ie, ae] of Object.entries($)) I.set(ie, ae);
                    let q = new Set(Object.keys($));
                    for (let ie of [...T.keys()]) q.has(ie) || U(ie);
                    return await Promise.all(Object.entries($).map(([ie, ae]) => j(ie, ae, K))), await z()
                },
                async connectServer($, K, q = {}) {
                    return await j($, K, q)
                },
                async disconnectServer($) {
                    let K = T.get($),
                        q = K ? t.get(K) : void 0,
                        ie = q ? (await q.adapter.status())[$] : void 0;
                    return U($), ie ? {
                        ...ie,
                        status: "disconnected",
                        toolCount: 0,
                        updatedAt: new Date().toISOString()
                    } : void 0
                },
                async listTools() {
                    return (await z()).tools
                },
                async pingServer($, K) {
                    let q = T.get($),
                        ie = q ? t.get(q) : void 0;
                    return ie ? await ie.adapter.pingServer?.($, K) ?? !0 : !1
                },
                async status() {
                    return (await z()).statuses
                }
            }
        }, "acquireLease"),
        async close() {
            s = !0;
            let _ = [...t.values()];
            t.clear(), await Promise.all(_.map(l))
        },
        stats() {
            return {
                activeConnections: t.size,
                pendingCloseConnections: [...t.values()].filter(_ => _.refs.size === 0).length
            }
        }
    }
}

function Eqs(e) {
    let t = e.config.isolation === "workspace" ? "workspace" : "session",
        n = KXr(e.connectOptions);
    return {
        mcpConnectionId: (0, JXr.randomUUID)(),
        mcpIsolation: t,
        ...n ? {
            workspaceKey: n
        } : {},
        ...t === "session" && e.sessionId ? {
            sessionId: e.sessionId
        } : {}
    }
}

function KXr(e) {
    return e.workspaceIdentity?.trim() || e.workingDirectory?.trim() || void 0
}

function Aqs(e) {
    let t = e.config.isolation === "workspace" ? KXr(e.connectOptions) ?? "" : e.leaseId;
    return [e.serverName, t, Qpn(e.config)].join("\0")
}

function Qpn(e) {
    if (e === null || typeof e != "object") return JSON.stringify(e) ?? "null";
    if (Array.isArray(e)) return `[${e.map(Qpn).join(",")}]`;
    let t = e;
    return `{${Object.keys(t).toSorted().filter(n=>t[n]!==void 0).map(n=>`${JSON.stringify(n)}:${Qpn(t[n])}`).join(",")}}`
}
var JXr, Cqs, tfn = Y(() => {
    "use strict";
    JXr = require("node:crypto"), Cqs = 3e4;
    r(efn, "createMcpConnectionPool");
    r(Eqs, "createConnectionContext");
    r(KXr, "resolveWorkspaceKey");
    r(Aqs, "connectionKey");
    r(Qpn, "stableStringify")
});

function Qx(e, t) {
    return `${e}:${t}`
}

function Pqs() {
    return (0, hut.randomBytes)(16).toString("hex")
}

function XXr(e, t) {
    return typeof e.generation == "string" && e.generation.length > 0 ? e.generation : `legacy-${(0,hut.createHash)("sha256").update(t).digest("hex").slice(0,32)}`
}

function ifn(e) {
    return !n$(e) || typeof e.version != "number" || !YXr.has(e.version) || typeof e.published_by != "string" || e.published_by.length === 0 || !n$(e.client_information) || !n$(e.tokens) ? !1 : typeof e.client_information.client_id == "string" && typeof e.tokens.access_token == "string" && typeof e.tokens.token_type == "string"
}
async function MMe(e, t) {
    let n = Qx(t, OMe),
        o = await e.load(n);
    if (!o) return;
    let s;
    try {
        s = JSON.parse(o)
    } catch {
        return
    }
    if (ifn(s)) return {
        clientInformation: s.client_information,
        ...s.expires_at === void 0 ? {} : {
            expiresAt: s.expires_at
        },
        generation: XXr(s, o),
        ...s.issuer === void 0 ? {} : {
            issuer: s.issuer
        },
        ...s.obtained_at === void 0 ? {} : {
            obtainedAt: s.obtained_at
        },
        raw: o,
        tokens: s.tokens
    }
}
async function NMe(e, t, n) {
    let o = n.obtainedAt ?? Date.now(),
        s = typeof n.tokens.expires_in == "number" && Number.isFinite(n.tokens.expires_in) ? o + n.tokens.expires_in * 1e3 : void 0,
        a = Pqs(),
        l = {
            client_information: n.clientInformation,
            ...s === void 0 ? {} : {
                expires_at: s
            },
            generation: a,
            ...n.issuer === void 0 ? {} : {
                issuer: n.issuer
            },
            obtained_at: o,
            published_by: n.publishedBy,
            tokens: n.tokens,
            version: ZXr
        },
        u = JSON.stringify(l),
        f = JSON.stringify(n.clientInformation),
        g = JSON.stringify(n.tokens);
    return await e.saveMany({
        [Qx(t, OMe)]: u,
        [Qx(t, rfn)]: f,
        [Qx(t, ofn)]: g
    }), {
        canonical: l,
        generation: a,
        legacyClientRaw: f,
        legacyTokensRaw: g,
        raw: u
    }
}

function n$(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function QXr(e, t = Date.now(), n = Rqs) {
    return e.expiresAt === void 0 ? !0 : t >= e.expiresAt - n
}
async function sfn(e, t, n, o) {
    let s = Qx(t, OMe),
        a = [s, Qx(t, ofn)];
    return o === "all" && a.push(Qx(t, rfn)), await e.deleteManyIfValue(s, n, a)
}
async function r$(e, t) {
    let n = Qx(t, OMe),
        o = Qx(t, rfn),
        s = Qx(t, ofn),
        a = await e.loadMany([n, o, s]);
    return eQr({
        canonicalRaw: a[n] ?? void 0,
        legacyClientRaw: a[o] ?? void 0,
        legacyTokensRaw: a[s] ?? void 0
    })
}

function eQr(e) {
    let t = nfn(e.canonicalRaw),
        n = t !== void 0 && ifn(t) ? t : void 0,
        o = nfn(e.legacyClientRaw),
        s = nfn(e.legacyTokensRaw);
    if (n && e.canonicalRaw) {
        let a = {
            clientInformation: n.client_information,
            ...n.expires_at === void 0 ? {} : {
                expiresAt: n.expires_at
            },
            generation: XXr(n, e.canonicalRaw),
            ...n.issuer === void 0 ? {} : {
                issuer: n.issuer
            },
            ...n.obtained_at === void 0 ? {} : {
                obtainedAt: n.obtained_at
            },
            raw: e.canonicalRaw,
            source: "canonical",
            tokens: n.tokens
        };
        return n.version === 1 ? s !== void 0 && (!o || (0, mut.isDeepStrictEqual)(o, n.client_information)) ? {
            clientInformation: o ?? n.client_information,
            source: "legacy",
            tokens: s
        } : a : s ? (0, mut.isDeepStrictEqual)(s, n.tokens) ? o ? a : {
            source: "legacy",
            tokens: s
        } : o && (0, mut.isDeepStrictEqual)(o, n.client_information) ? {
            clientInformation: o,
            source: "legacy",
            tokens: s
        } : {
            clientInformation: o,
            source: "legacy"
        } : {
            clientInformation: o,
            source: "legacy"
        }
    }
    if (!(!o && !s)) return {
        clientInformation: o,
        source: "legacy",
        ...s ? {
            tokens: s
        } : {}
    }
}

function nfn(e) {
    if (e) try {
        return JSON.parse(e)
    } catch {
        return
    }
}
var hut, mut, OMe, rfn, ofn, ZXr, YXr, Rqs, wG = Y(() => {
    "use strict";
    hut = require("node:crypto"), mut = require("node:util"), OMe = "authorization_credentials", rfn = "client_information", ofn = "tokens", ZXr = 2, YXr = new Set([1, ZXr]);
    r(Qx, "mcpOAuthCredentialKey");
    r(Pqs, "createCredentialGeneration");
    r(XXr, "resolveCredentialGeneration");
    r(ifn, "isCanonicalCredentials");
    r(MMe, "loadCanonicalCredentials");
    r(NMe, "publishCanonicalCredentials");
    r(n$, "isRecord");
    Rqs = 3e4;
    r(QXr, "isCanonicalTokenNearExpiry");
    r(sfn, "invalidateCanonicalCredentials");
    r(r$, "loadCredentialPair");
    r(eQr, "deriveCredentialPair");
    r(nfn, "parseJson")
});

function kG(e) {
    let t = new Error(`MCP server ${e.serverName} requires interactive OAuth authorization (${e.reason})`, e.cause === void 0 ? void 0 : {
        cause: e.cause
    });
    return Object.defineProperty(t, tQr, {
        configurable: !0,
        value: !0
    }), t.code = Dqs, t.reason = e.reason, e.requiredScope && (t.requiredScope = e.requiredScope), e.resourceMetadataUrl && (t.resourceMetadataUrl = e.resourceMetadataUrl), t
}

function afn(e) {
    let t = new Error(`MCP server ${e.serverName} OAuth token refresh failed temporarily`, e.cause === void 0 ? void 0 : {
        cause: e.cause
    });
    return Object.defineProperty(t, nQr, {
        configurable: !0,
        value: !0
    }), t.code = Oqs, t
}

function Mqs(e) {
    return rQr(e, tQr)
}

function Nqs(e) {
    return rQr(e, nQr)
}

function gut(e) {
    if (Nqs(e)) return;
    if (Mqs(e)) return {
        reason: e.reason,
        ...e.requiredScope ? {
            requiredScope: e.requiredScope
        } : {},
        ...e.resourceMetadataUrl ? {
            resourceMetadataUrl: e.resourceMetadataUrl
        } : {}
    };
    if (e instanceof cut) return {
        reason: "insufficient_scope",
        ...e.requiredScope ? {
            requiredScope: e.requiredScope
        } : {},
        ...e.resourceMetadataUrl ? {
            resourceMetadataUrl: String(e.resourceMetadataUrl)
        } : {}
    };
    if (e instanceof R1) return {
        reason: "unauthorized"
    };
    if (Lqs(e)) return {
        reason: "unauthorized"
    };
    let t = e?.cause;
    if (t !== void 0 && t !== e) return gut(t)
}

function Lqs(e) {
    return typeof e != "object" || e === null ? !1 : e.code === Ec.ClientHttpAuthentication
}

function rQr(e, t) {
    return typeof e == "object" && e !== null || typeof e == "function" ? e[t] === !0 : !1
}
var tQr, nQr, Dqs, Oqs, LMe = Y(() => {
    "use strict";
    AMe();
    tQr = Symbol.for("zcode.mcp.oauth.interactiveAuthorizationRequired"), nQr = Symbol.for("zcode.mcp.oauth.temporaryRefreshFailure"), Dqs = "MCP_OAUTH_INTERACTIVE_REQUIRED", Oqs = "MCP_OAUTH_TEMPORARY_REFRESH_FAILURE";
    r(kG, "createInteractiveAuthorizationRequiredError");
    r(afn, "createTemporaryRefreshFailureError");
    r(Mqs, "isInteractiveAuthorizationRequiredError");
    r(Nqs, "isTemporaryRefreshFailureError");
    r(gut, "classifyInteractiveAuthorizationTrigger");
    r(Lqs, "isSdkAuthenticationHttpError");
    r(rQr, "hasBrand")
});
async function FMe(e, t, n, o = Date.now()) {
    await e.saveMany({
        [Qx(t, iQr)]: JSON.stringify(n),
        [Qx(t, sQr)]: String(o)
    })
}
async function jMe(e, t, n = {}) {
    let o = n.now ?? Date.now(),
        s = n.ttlMs ?? Fqs,
        a = Qx(t, iQr),
        l = Qx(t, sQr),
        u = await e.loadMany([a, l]),
        f = u[a];
    if (!f) return;
    let g = Number(u[l]);
    if (!Number.isFinite(g) || o - g >= s) return;
    let _;
    try {
        _ = JSON.parse(f)
    } catch {
        return
    }
    if (!n$(_) || typeof _.authorizationServerUrl != "string") return;
    let b = _;
    if (!(n.expectedIssuer && !jqs(b, n.expectedIssuer))) return b
}

function jqs(e, t) {
    let n = e.authorizationServerMetadata?.issuer ?? e.authorizationServerUrl;
    return n ? oQr(n) === oQr(t) : !1
}

function oQr(e) {
    return e.endsWith("/") ? e.slice(0, -1) : e
}
var iQr, sQr, Fqs, _ut = Y(() => {
    "use strict";
    wG();
    iQr = "discovery_state", sQr = "discovery_state_fetched_at", Fqs = 1440 * 60 * 1e3;
    r(FMe, "saveDiscoveryRecord");
    r(jMe, "loadDiscoveryRecord");
    r(jqs, "issuersMatch");
    r(oQr, "normalizeIssuer")
});

function lfn(e, t, n) {
    return `mcp:oauth:${(0,cfn.createHash)("sha256").update([e,t,n.clientId??"",n.scope??"",n.redirectPath??""].join(`
`)).digest("hex").slice(0,24)}`
}
var cfn, Xyl, aQr = Y(() => {
    "use strict";
    cfn = require("node:crypto");
    Hat();
    Kat();
    wG();
    LMe();
    _ut();
    Xyl = 300 * 1e3;
    r(lfn, "createCredentialKeyPrefix")
});

function qqs(e, t) {
    return (0, yut.join)((0, yut.dirname)(e), `${ufn(t)}.authz`)
}

function ufn(e) {
    return e.replaceAll(/[^a-zA-Z0-9-]/g, "-")
}
async function lQr(e) {
    let t = qqs(e.credentialsFilePath, e.keyPrefix);
    try {
        let n = await REe(t, zqs, $qs, Uqs);
        return {
            attemptId: (0, cQr.randomBytes)(16).toString("hex"),
            release: n
        }
    } catch (n) {
        if (Wqs(n) === Xde) return;
        throw n
    }
}
async function uQr(e, t, n) {
    let o = {
        attempt_id: n.attemptId,
        authorization_url: n.authorizationUrl,
        ...n.baselineGeneration === void 0 ? {} : {
            baseline_generation: n.baselineGeneration
        },
        expires_at: n.expiresAt,
        state: n.state
    };
    await e.save(dfn(t), JSON.stringify(o))
}
async function dQr(e, t, n = Date.now()) {
    let o = await e.load(dfn(t));
    if (!o) return;
    let s;
    try {
        s = JSON.parse(o)
    } catch {
        return
    }
    if (!(!n$(s) || typeof s.attempt_id != "string" || typeof s.authorization_url != "string" || typeof s.state != "string" || typeof s.expires_at != "number") && !(s.expires_at <= n)) return {
        attemptId: s.attempt_id,
        authorizationUrl: s.authorization_url,
        ...typeof s.baseline_generation == "string" ? {
            baselineGeneration: s.baseline_generation
        } : {},
        expiresAt: s.expires_at,
        state: s.state
    }
}
async function pQr(e, t, n) {
    let o = dfn(t),
        s = await e.load(o);
    if (!s) return !1;
    let a;
    try {
        a = JSON.parse(s)
    } catch {
        return await e.deleteIfValue(o, s)
    }
    return !n$(a) || a.attempt_id !== n ? !1 : await e.deleteIfValue(o, s)
}

function dfn(e) {
    return Qx(e, Bqs)
}

function Wqs(e) {
    if (typeof e != "object" || e === null || !("code" in e)) return;
    let t = e.code;
    return typeof t == "string" ? t : void 0
}
var cQr, yut, Bqs, Uqs, zqs, $qs, pfn = Y(() => {
    "use strict";
    cQr = require("node:crypto"), yut = require("node:path");
    mz();
    gs();
    wG();
    Bqs = "pending_authorization", Uqs = 250, zqs = [25], $qs = 100;
    r(qqs, "resolveAuthorizationLeasePath");
    r(ufn, "sanitizeKeyPrefix");
    r(lQr, "tryAcquireAuthorizationLease");
    r(uQr, "publishPendingAuthorization");
    r(dQr, "loadPendingAuthorization");
    r(pQr, "deletePendingAuthorizationIfOwned");
    r(dfn, "pendingKey");
    r(Wqs, "getErrorCode")
});

function fQr(e) {
    let t = Math.max(0, Math.floor(e));
    return {
        expiresAt: Date.now() + t,
        timeoutMs: t
    }
}

function BMe(e, t) {
    let n = e.expiresAt - Date.now();
    if (n <= 0) throw new Sge(t);
    return n
}

function UMe(e, t, n, o) {
    return wge(e, BMe(t, n), n, o)
}

function wge(e, t, n, o) {
    return new Promise((s, a) => {
        if (o?.aborted) {
            a(o.reason instanceof Error ? o.reason : new Error("Operation aborted"));
            return
        }
        let l = !1,
            u = setTimeout(() => {
                l || (l = !0, f(), a(new Sge(n)))
            }, t),
            f = r(() => {
                clearTimeout(u), o?.removeEventListener("abort", g)
            }, "cleanup"),
            g = r(() => {
                l || (l = !0, f(), a(o?.reason instanceof Error ? o.reason : new Error("Operation aborted")))
            }, "abortHandler");
        o?.addEventListener("abort", g), e.then(_ => {
            l || (l = !0, f(), s(_))
        }, _ => {
            l || (l = !0, f(), a(_))
        })
    })
}
var Sge, ffn = Y(() => {
    "use strict";
    Sge = class extends Error {
        static {
            r(this, "McpTimeoutError")
        }
        constructor(t) {
            super(t), this.name = "McpTimeoutError"
        }
    };
    r(fQr, "createMcpDeadline");
    r(BMe, "remainingMcpDeadlineMs");
    r(UMe, "waitWithinMcpDeadline");
    r(wge, "withTimeout")
});
async function mQr(e) {
    let t = e.transactionTtlMs ?? hfn,
        o = (await MMe(e.credentialStore, e.keyPrefix))?.generation,
        s = await lQr({
            credentialsFilePath: e.credentialStore.filePath,
            keyPrefix: e.keyPrefix
        });
    if (!s) return await Gqs(e, o, t);
    try {
        let a = await MMe(e.credentialStore, e.keyPrefix);
        return gfn(a, o) ? {
            status: "already-authorized"
        } : await Hqs(e, {
            attemptId: s.attemptId,
            baselineGeneration: o,
            transactionTtlMs: t
        })
    } finally {
        await pQr(e.credentialStore, e.keyPrefix, s.attemptId).catch(() => {}), await s.release()
    }
}
async function Hqs(e, t) {
    let n = (0, kge.randomBytes)(24).toString("base64url"),
        o = Jqs(e.config.redirectPath, e.serverName),
        s;
    try {
        s = await POe({
            callbackPath: o,
            state: n
        })
    } catch (l) {
        return e.logger?.warn("MCP OAuth callback listener failed", {
            event: "mcp.oauth.callback_listener.failed",
            ...vut(e, n),
            error: l instanceof Error ? l.message : String(l),
            status: "failed"
        }), {
            status: "failed",
            error: l
        }
    }
    let a = new mfn({
        attemptId: t.attemptId,
        baselineGeneration: t.baselineGeneration,
        callbackServer: s,
        config: e.config,
        credentialStore: e.credentialStore,
        keyPrefix: e.keyPrefix,
        logger: e.logger,
        onAuthorizationRequired: e.onAuthorizationRequired,
        openAuthorizationUrl: e.openAuthorizationUrl,
        requestedScope: e.requestedScope,
        serverName: e.serverName,
        state: n,
        transactionTtlMs: t.transactionTtlMs
    });
    try {
        if (await Are(a, {
                serverUrl: e.serverUrl,
                ...e.requestedScope ? {
                    scope: e.requestedScope
                } : {},
                ...e.resourceMetadataUrl ? {
                    resourceMetadataUrl: e.resourceMetadataUrl
                } : {},
                ...e.fetchFn ? {
                    fetchFn: e.fetchFn
                } : {},
                ...e.forceReauthorization ? {
                    forceReauthorization: !0
                } : {}
            }) === "AUTHORIZED") return {
            status: "authorized"
        };
        let u = await wge(s.waitForCallback(), t.transactionTtlMs, `MCP server ${e.serverName} OAuth authorization timed out`, e.signal),
            f = new URL(u.url).searchParams,
            g = f.get("code") ?? u.code,
            _ = f.get("iss");
        return await Are(a, {
            serverUrl: e.serverUrl,
            authorizationCode: g,
            ..._ ? {
                iss: _
            } : {},
            ...e.requestedScope ? {
                scope: e.requestedScope
            } : {},
            ...e.resourceMetadataUrl ? {
                resourceMetadataUrl: e.resourceMetadataUrl
            } : {},
            ...e.fetchFn ? {
                fetchFn: e.fetchFn
            } : {}
        }), e.logger?.info("MCP OAuth authorization completed", {
            event: "mcp.oauth.authorization.completed",
            ...vut(e, n),
            status: "completed"
        }), {
            status: "authorized"
        }
    } catch (l) {
        let u = await MMe(e.credentialStore, e.keyPrefix);
        return gfn(u, t.baselineGeneration) ? {
            status: "already-authorized"
        } : (e.logger?.warn("MCP OAuth authorization failed", {
            event: "mcp.oauth.authorization.failed",
            ...vut(e, n),
            error: l instanceof Error ? l.message : String(l),
            status: "failed"
        }), {
            status: "failed",
            error: l
        })
    } finally {
        await s.close().catch(() => {})
    }
}
async function Gqs(e, t, n) {
    let o = Date.now() + n,
        s;
    for (e.logger?.info("MCP OAuth authorization is already in progress elsewhere", {
            event: "mcp.oauth.authorization.following",
            ...vut(e),
            status: "waiting"
        }); Date.now() < o && !e.signal?.aborted;) {
        let a = await MMe(e.credentialStore, e.keyPrefix);
        if (gfn(a, t)) return {
            status: "already-authorized"
        };
        let l = await dQr(e.credentialStore, e.keyPrefix);
        l && l.authorizationUrl !== s && (s = l.authorizationUrl, await e.onAuthorizationRequired?.({
            authorizationUrl: l.authorizationUrl,
            redirectUrl: "",
            serverName: e.serverName
        })), await Zqs(Vqs, e.signal)
    }
    return {
        status: "pending",
        ...s ? {
            authorizationUrl: s
        } : {}
    }
}

function gfn(e, t) {
    return !!(e?.tokens && e.generation !== t)
}

function Jqs(e, t) {
    let n = `/oauth/callback/mcp/${encodeURIComponent(t)}`;
    return e ? e.startsWith("/") ? e : `/${e}` : n
}

function vut(e, t) {
    return {
        adapterInstanceId: e.adapterInstanceId,
        credentialKeyPrefix: e.keyPrefix,
        mcpServerName: e.serverName,
        ...t ? {
            oauthStateId: (0, kge.createHash)("sha256").update(t).digest("hex").slice(0, 16)
        } : {},
        processId: process.pid
    }
}

function Kqs(e) {
    if (e) return (0, kge.createHash)("sha256").update(e).digest("hex").slice(0, 12)
}

function Zqs(e, t) {
    return new Promise(n => {
        let o = setTimeout(() => {
                t?.removeEventListener("abort", s), n()
            }, e),
            s = r(() => {
                clearTimeout(o), n()
            }, "onAbort");
        t?.addEventListener("abort", s, {
            once: !0
        })
    })
}
var kge, hfn, Vqs, mfn, hQr = Y(() => {
    "use strict";
    kge = require("node:crypto");
    AMe();
    Hat();
    wG();
    pfn();
    _ut();
    ffn();
    hfn = 300 * 1e3, Vqs = 500;
    r(mQr, "runMcpInteractiveAuthorization");
    r(Hqs, "leadAuthorization");
    r(Gqs, "followAuthorization");
    mfn = class {
        static {
            r(this, "InteractiveAuthorizationProvider")
        }
        attemptId;
        baselineGeneration;
        callbackServer;
        config;
        credentialStore;
        keyPrefix;
        logger;
        onAuthorizationRequired;
        openAuthorizationUrl;
        requestedScope;
        serverName;
        stateValue;
        transactionId;
        transactionTtlMs;
        issuer;
        memoryCodeVerifier;
        memoryDiscoveryState;
        transactionClientInformation;
        constructor(t) {
            this.attemptId = t.attemptId, this.baselineGeneration = t.baselineGeneration, this.callbackServer = t.callbackServer, this.config = t.config, this.credentialStore = t.credentialStore, this.keyPrefix = t.keyPrefix, this.logger = t.logger, this.onAuthorizationRequired = t.onAuthorizationRequired, this.openAuthorizationUrl = t.openAuthorizationUrl, this.requestedScope = t.requestedScope, this.serverName = t.serverName, this.stateValue = t.state, this.transactionId = (0, kge.createHash)("sha256").update(t.state).digest("hex"), this.transactionTtlMs = t.transactionTtlMs
        }
        get redirectUrl() {
            return this.callbackServer.callbackUrl
        }
        get clientMetadata() {
            return {
                client_name: this.config.clientName ?? `ZCode ${this.serverName}`,
                grant_types: ["authorization_code", "refresh_token"],
                redirect_uris: [this.redirectUrl],
                response_types: ["code"],
                ...this.config.clientSecret ? {
                    token_endpoint_auth_method: "client_secret_basic"
                } : {},
                ...this.requestedScope ?? this.config.scope ? {
                    scope: this.requestedScope ?? this.config.scope
                } : {}
            }
        }
        state() {
            return this.stateValue
        }
        clientInformation() {
            return this.config.clientId ? {
                client_id: this.config.clientId,
                ...this.config.clientSecret ? {
                    client_secret: this.config.clientSecret
                } : {}
            } : this.transactionClientInformation
        }
        saveClientInformation(t) {
            this.transactionClientInformation = t
        }
        tokens() {}
        async saveTokens(t) {
            let n = this.clientInformation();
            if (!n) throw new Error(`Missing MCP OAuth client information for ${this.serverName}`);
            let o = await NMe(this.credentialStore, this.keyPrefix, {
                clientInformation: n,
                ...this.issuer ? {
                    issuer: this.issuer
                } : {},
                publishedBy: this.transactionId,
                tokens: t
            });
            this.logger?.info("MCP OAuth credentials published", {
                event: "mcp.oauth.credentials.published",
                ...this.logContext(),
                clientIdHash: Kqs(n.client_id),
                grantKind: "authorization_code",
                hasRefreshToken: !!t.refresh_token,
                publishedGeneration: o.generation.slice(0, 12),
                status: "completed",
                tokenExpiresInSeconds: t.expires_in
            })
        }
        async redirectToAuthorization(t) {
            let n = {
                authorizationUrl: t.toString(),
                redirectUrl: this.redirectUrl,
                serverName: this.serverName
            };
            await uQr(this.credentialStore, this.keyPrefix, {
                attemptId: this.attemptId,
                authorizationUrl: n.authorizationUrl,
                ...this.baselineGeneration ? {
                    baselineGeneration: this.baselineGeneration
                } : {},
                expiresAt: Date.now() + this.transactionTtlMs,
                state: this.stateValue
            }), this.logger?.info("MCP OAuth authorization required", {
                event: "mcp.oauth.authorization.required",
                ...this.logContext(),
                callbackPort: Number(new URL(this.redirectUrl).port),
                status: "waiting"
            }), await this.onAuthorizationRequired?.(n), await this.openAuthorizationUrl?.(n)
        }
        saveCodeVerifier(t) {
            this.memoryCodeVerifier = t
        }
        codeVerifier() {
            if (!this.memoryCodeVerifier) throw new Error(`Missing MCP OAuth PKCE verifier for ${this.serverName}`);
            return this.memoryCodeVerifier
        }
        saveAuthorizationServerUrl(t) {
            this.issuer = t
        }
        authorizationServerUrl() {
            return this.issuer
        }
        async saveDiscoveryState(t) {
            this.memoryDiscoveryState = t, await FMe(this.credentialStore, this.keyPrefix, t)
        }
        async discoveryState() {
            return this.memoryDiscoveryState ? this.memoryDiscoveryState : await jMe(this.credentialStore, this.keyPrefix)
        }
        logContext() {
            return {
                credentialKeyPrefix: this.keyPrefix,
                mcpServerName: this.serverName,
                oauthAttemptId: this.attemptId.slice(0, 12),
                oauthStateId: this.transactionId.slice(0, 16),
                processId: process.pid
            }
        }
    };
    r(gfn, "hasNewerCredentials");
    r(Jqs, "normalizeCallbackPath");
    r(vut, "logContext");
    r(Kqs, "hashIdentifier");
    r(Zqs, "sleep")
});
async function _fn(e) {
    let t = (await r$(e.credentialStore, e.keyPrefix))?.generation,
        n = tWs(e.credentialStore.filePath, e.keyPrefix);
    try {
        return await cw(n, async () => await Xqs(e, t), {
            lockMaxWaitMs: Yqs
        })
    } catch (o) {
        if (!V9t(o)) throw o;
        let s = await r$(e.credentialStore, e.keyPrefix);
        if (s?.tokens && s.generation !== t) return s.tokens.access_token;
        throw afn({
            cause: o,
            serverName: e.serverName
        })
    }
}
async function Xqs(e, t) {
    let n = await r$(e.credentialStore, e.keyPrefix);
    if (n?.tokens && n.generation !== t) return n.tokens.access_token;
    if (!n?.tokens) throw kG({
        reason: "no_credentials",
        serverName: e.serverName
    });
    let o = n.tokens.refresh_token,
        s = n.clientInformation;
    if (!o || !s) throw kG({
        reason: "no_refresh_token",
        serverName: e.serverName
    });
    let a;
    try {
        a = await eWs(e, n)
    } catch (l) {
        return gQr(e, n, l)
    }
    try {
        let l = await zpn(a.authorizationServerUrl, {
                clientInformation: s,
                refreshToken: o,
                ...a.metadata ? {
                    metadata: a.metadata
                } : {},
                ...a.resource ? {
                    resource: a.resource
                } : {},
                ...e.fetchFn ? {
                    fetchFn: e.fetchFn
                } : {}
            }),
            u = await NMe(e.credentialStore, e.keyPrefix, {
                clientInformation: s,
                ...n.issuer ? {
                    issuer: n.issuer
                } : {},
                publishedBy: `refresh:${e.keyPrefix}`,
                tokens: l
            });
        return e.logger?.info("MCP OAuth access token refreshed", {
            event: "mcp.oauth.refresh.completed",
            credentialKeyPrefix: e.keyPrefix,
            mcpServerName: e.serverName,
            processId: process.pid,
            publishedGeneration: u.generation.slice(0, 12),
            reactive: e.reactive,
            refreshTokenRotated: l.refresh_token !== o,
            status: "completed"
        }), l.access_token
    } catch (l) {
        return await Qqs(e, n, l)
    }
}
async function Qqs(e, t, n) {
    let o = n instanceof Q7 ? n.code : void 0;
    if (e.logger?.warn("MCP OAuth access token refresh failed", {
            event: "mcp.oauth.refresh.failed",
            credentialKeyPrefix: e.keyPrefix,
            credentialSource: t.source,
            mcpServerName: e.serverName,
            oauthErrorCode: o,
            processId: process.pid,
            reactive: e.reactive,
            status: "failed"
        }), o === FF.InvalidGrant) throw t.raw && await sfn(e.credentialStore, e.keyPrefix, t.raw, "tokens"), kG({
        cause: n,
        reason: "invalid_grant",
        serverName: e.serverName
    });
    if (o === FF.InvalidClient || o === FF.UnauthorizedClient) throw e.staticClientId ? new Error(`MCP server ${e.serverName} OAuth client was rejected by the authorization server (invalid_client). The configured clientId is not usable; fix the MCP oauth configuration.`, {
        cause: n
    }) : (t.raw && await sfn(e.credentialStore, e.keyPrefix, t.raw, "all"), kG({
        cause: n,
        reason: "invalid_client",
        serverName: e.serverName
    }));
    return gQr(e, t, n)
}

function gQr(e, t, n) {
    if (e.reactive || !t.tokens) throw afn({
        cause: n,
        serverName: e.serverName
    });
    return t.tokens.access_token
}
async function eWs(e, t) {
    let n = await jMe(e.credentialStore, e.keyPrefix, {
            ...t.issuer ? {
                expectedIssuer: t.issuer
            } : {}
        }),
        o = n ?? await lut(e.serverUrl, {
            ...e.fetchFn ? {
                fetchFn: e.fetchFn
            } : {}
        });
    n || await FMe(e.credentialStore, e.keyPrefix, o);
    let s = await Upn(e.serverUrl, {}, o.resourceMetadata);
    return {
        authorizationServerUrl: o.authorizationServerUrl,
        ...o.authorizationServerMetadata ? {
            metadata: o.authorizationServerMetadata
        } : {},
        ...s ? {
            resource: s
        } : {}
    }
}

function tWs(e, t) {
    return (0, but.join)((0, but.dirname)(e), `${ufn(t)}.refresh`)
}
var but, Yqs, _Qr = Y(() => {
    "use strict";
    but = require("node:path");
    AMe();
    gs();
    mz();
    wG();
    LMe();
    pfn();
    _ut();
    Yqs = 45e3;
    r(_fn, "refreshMcpOAuthTokensUnderLock");
    r(Xqs, "refreshLocked");
    r(Qqs, "handleRefreshFailure");
    r(gQr, "failSoft");
    r(eWs, "resolveAsMetadata");
    r(tWs, "resolveRefreshLockPath")
});

function yQr(e) {
    let t = {
        credentialStore: e.credentialStore,
        ...e.fetchFn ? {
            fetchFn: e.fetchFn
        } : {},
        keyPrefix: e.keyPrefix,
        ...e.logger ? {
            logger: e.logger
        } : {},
        serverName: e.serverName,
        serverUrl: e.serverUrl,
        ...e.config.clientId ? {
            staticClientId: e.config.clientId
        } : {}
    };
    return {
        async token() {
            let n = await r$(e.credentialStore, e.keyPrefix);
            if (n?.tokens) return !QXr(n) || !n.tokens.refresh_token ? n.tokens.access_token : await _fn({
                ...t,
                reactive: !1
            })
        },
        async onUnauthorized() {
            let n = await r$(e.credentialStore, e.keyPrefix);
            if (!n?.tokens?.refresh_token) throw kG({
                reason: n?.tokens ? "no_refresh_token" : "no_credentials",
                serverName: e.serverName
            });
            await _fn({
                ...t,
                reactive: !0
            })
        }
    }
}
var vQr = Y(() => {
    "use strict";
    wG();
    LMe();
    _Qr();
    r(yQr, "createMcpOAuthTokenProvider")
});
async function wut(e, t = {}) {
    if (wQr(t) === "win32") {
        await fWs(e, t);
        return
    }
    await mWs(e, t)
}

function xG(e, t) {
    let n = t.kill ?? process.kill;
    try {
        return n(e, 0), !0
    } catch (o) {
        return aWs(o)
    }
}

function aWs(e) {
    return typeof e == "object" && e !== null && "code" in e && e.code === "EPERM"
}

function wQr(e) {
    return e.platform ?? process.platform
}

function cWs(e) {
    return new Promise(t => setTimeout(t, e))
}

function lWs(e) {
    return e.split(/\s+/).map(t => Number(t)).filter(t => Number.isInteger(t) && t > 0)
}

function uWs(e) {
    return e === "darwin" ? ["-axo", "pid=,ppid="] : ["-eo", "pid=,ppid="]
}

function dWs(e, t) {
    let n = [];
    for (let o of e.split(/\r?\n/)) {
        let [s, a] = o.trim().split(/\s+/), l = Number(s), u = Number(a);
        Number.isInteger(l) && l > 0 && u === t && n.push(l)
    }
    return n
}
async function pWs(e, t) {
    let n = await wfn("pgrep", ["-P", String(e)], {
        encoding: "utf8",
        timeout: bQr
    }, t);
    if (!n.error && n.status === 0 && n.stdout) return lWs(String(n.stdout));
    let o = await wfn("ps", uWs(wQr(t)), {
        encoding: "utf8",
        timeout: bQr
    }, t);
    return o.error || o.status !== 0 || !o.stdout ? [] : dWs(String(o.stdout), e)
}
async function Sfn(e, t, n = new Set) {
    if (n.has(e)) return [];
    n.add(e);
    let o = [];
    for (let s of await pWs(e, t)) o.push(s, ...await Sfn(s, t, n));
    return o
}

function Sut(e) {
    return [...new Set(e.filter(t => t > 0))]
}

function yfn(e, t, n) {
    let o = n.kill ?? process.kill;
    try {
        o(e, t)
    } catch {}
}

function vfn(e, t, n) {
    let o = n.kill ?? process.kill;
    try {
        o(-e, t)
    } catch {}
}
async function fWs(e, t) {
    if (!xG(e, t)) return;
    let n = await wfn("taskkill", ["/PID", String(e), "/T", "/F"], {
        encoding: "utf8",
        timeout: sWs,
        windowsHide: !0
    }, t);
    if (_Ws(n) && xG(e, t)) throw new Error(`taskkill failed for MCP stdio process tree pid=${e} status=${n.status??"unknown"}`)
}
async function mWs(e, t) {
    if (!xG(e, t)) return;
    let n = Sut(await Sfn(e, t)).reverse(),
        o = Sut([...n, e]);
    vfn(e, "SIGINT", t);
    for (let u of o) yfn(u, "SIGINT", t);
    if (await bfn(o, nWs, t), !o.some(u => xG(u, t))) return;
    vfn(e, "SIGTERM", t);
    for (let u of o) yfn(u, "SIGTERM", t);
    if (await bfn(o, rWs, t), !o.some(u => xG(u, t))) return;
    let s = Sut(await Sfn(e, t)).reverse(),
        a = Sut([...s, ...o]);
    for (let u of a) xG(u, t) && yfn(u, "SIGKILL", t);
    vfn(e, "SIGKILL", t), await bfn(a, oWs, t);
    let l = a.filter(u => xG(u, t));
    if (l.length > 0) throw new Error(`SIGKILL failed for MCP stdio process tree pid=${e} remaining=${l.join(",")}`)
}
async function bfn(e, t, n) {
    let o = n.sleep ?? cWs,
        s = n.now ?? Date.now,
        a = s();
    for (; s() - a < t;) {
        if (!e.some(l => xG(l, n))) return;
        await o(iWs)
    }
}

function wfn(e, t, n, o) {
    return (o.execFile ?? hWs)(e, t, n)
}

function hWs(e, t, n) {
    return new Promise(o => {
        (0, SQr.execFile)(e, [...t], n, (s, a, l) => {
            o({
                error: s,
                status: gWs(s),
                stderr: l,
                stdout: a
            })
        })
    })
}

function gWs(e) {
    if (!e || typeof e != "object" || !("code" in e)) return 0;
    let t = e.code;
    return typeof t == "number" ? t : null
}

function _Ws(e) {
    return !!e.error || e.status !== null && e.status !== 0
}
var SQr, bQr, nWs, rWs, oWs, iWs, sWs, kfn = Y(() => {
    "use strict";
    SQr = require("node:child_process"), bQr = 1e3, nWs = 250, rWs = 750, oWs = 250, iWs = 25, sWs = 2e3;
    r(wut, "terminateMcpStdioProcessTree");
    r(xG, "isProcessAlive");
    r(aWs, "isPermissionDenied");
    r(wQr, "getPlatform");
    r(cWs, "defaultSleep");
    r(lWs, "parsePidList");
    r(uWs, "getPosixProcessListArgs");
    r(dWs, "parseChildPidsFromProcessList");
    r(pWs, "collectChildPids");
    r(Sfn, "collectDescendantPids");
    r(Sut, "uniquePids");
    r(yfn, "killPid");
    r(vfn, "killProcessGroup");
    r(fWs, "terminateWindowsProcessTree");
    r(mWs, "terminatePosixProcessTree");
    r(bfn, "waitUntilAllExited");
    r(wfn, "runCommand");
    r(hWs, "defaultExecFile");
    r(gWs, "getExitStatus");
    r(_Ws, "didTerminationFail")
});
async function xQr(e, t = {}) {
    if ((t.platform ?? process.platform) !== "win32" || !Number.isInteger(e) || e <= 0) return;
    let n = t.api ?? await yWs();
    if (!n) return;
    let o;
    try {
        if (o = n.create(), !o || !n.assign(o, e)) {
            o && n.close(o);
            return
        }
    } catch {
        if (o) try {
            n.close(o)
        } catch {}
        return
    }
    let s = !1;
    return {
        terminate() {
            s || n.terminate(o)
        },
        close() {
            s || (s = !0, n.close(o))
        }
    }
}
async function yWs() {
    return kQr ??= vWs(), kQr
}
async function vWs() {
    try {
        let e = await import("koffi"),
            t = "default" in e ? e.default : e,
            n = t.load("kernel32.dll"),
            o = t.pointer("HANDLE", t.opaque()),
            s = t.struct("JOBOBJECT_BASIC_LIMIT_INFORMATION", {
                PerProcessUserTimeLimit: "int64",
                PerJobUserTimeLimit: "int64",
                LimitFlags: "uint32",
                MinimumWorkingSetSize: "size_t",
                MaximumWorkingSetSize: "size_t",
                ActiveProcessLimit: "uint32",
                Affinity: "uintptr_t",
                PriorityClass: "uint32",
                SchedulingClass: "uint32"
            }),
            a = t.struct("IO_COUNTERS", {
                ReadOperationCount: "uint64",
                WriteOperationCount: "uint64",
                OtherOperationCount: "uint64",
                ReadTransferCount: "uint64",
                WriteTransferCount: "uint64",
                OtherTransferCount: "uint64"
            }),
            l = t.struct("JOBOBJECT_EXTENDED_LIMIT_INFORMATION", {
                BasicLimitInformation: s,
                IoInfo: a,
                ProcessMemoryLimit: "size_t",
                JobMemoryLimit: "size_t",
                PeakProcessMemoryUsed: "size_t",
                PeakJobMemoryUsed: "size_t"
            }),
            u = n.func("__stdcall", "CreateJobObjectW", o, ["void *", "str16"]),
            f = n.func("__stdcall", "SetInformationJobObject", "bool", [o, "uint32", t.pointer(l), "uint32"]),
            g = n.func("__stdcall", "OpenProcess", o, ["uint32", "bool", "uint32"]),
            _ = n.func("__stdcall", "AssignProcessToJobObject", "bool", [o, o]),
            b = n.func("__stdcall", "TerminateJobObject", "bool", [o, "uint32"]),
            w = n.func("__stdcall", "CloseHandle", "bool", [o]);
        return {
            create() {
                let T = u(null, null);
                if (!T) return;
                if (!f(T, 9, {
                        BasicLimitInformation: {
                            PerProcessUserTimeLimit: 0,
                            PerJobUserTimeLimit: 0,
                            LimitFlags: 8192,
                            MinimumWorkingSetSize: 0,
                            MaximumWorkingSetSize: 0,
                            ActiveProcessLimit: 0,
                            Affinity: 0,
                            PriorityClass: 0,
                            SchedulingClass: 0
                        },
                        IoInfo: {
                            ReadOperationCount: 0,
                            WriteOperationCount: 0,
                            OtherOperationCount: 0,
                            ReadTransferCount: 0,
                            WriteTransferCount: 0,
                            OtherTransferCount: 0
                        },
                        ProcessMemoryLimit: 0,
                        JobMemoryLimit: 0,
                        PeakProcessMemoryUsed: 0,
                        PeakJobMemoryUsed: 0
                    }, t.sizeof(l))) {
                    w(T);
                    return
                }
                return T
            },
            assign(T, I) {
                let A = g(257, !1, I);
                if (!A) return !1;
                try {
                    return !!_(T, A)
                } finally {
                    w(A)
                }
            },
            terminate(T) {
                b(T, 1)
            },
            close(T) {
                w(T)
            }
        }
    } catch {
        return
    }
}
var kQr, TQr = Y(() => {
    "use strict";
    r(xQr, "attachProcessToWindowsJobObject");
    r(yWs, "loadWindowsJobObjectApi");
    r(vWs, "createWindowsJobObjectApi")
});

function bWs(e, t) {
    if (!("method" in e) || !t || Object.keys(t).length === 0) return e;
    let n = CQr(e.params) ? e.params : {},
        o = CQr(n._meta) ? n._meta : {};
    return {
        ...e,
        params: {
            ...n,
            _meta: {
                ...o,
                ...t
            }
        }
    }
}

function CQr(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}
var IQr, TG, EQr = Y(() => {
    "use strict";
    Ypn();
    kfn();
    TQr();
    IQr = Object.getOwnPropertyDescriptor(PMe.prototype, "_dispose")?.value, TG = class extends PMe {
        static {
            r(this, "ProcessTreeStdioClientTransport")
        }
        childProcess;
        lastProcessExit;
        requestMetaProvider;
        windowsJobObjectFactory;
        windowsJobObject;
        constructor(t, n = {}) {
            super(t), this.requestMetaProvider = t.requestMetaProvider, this.windowsJobObjectFactory = n.windowsJobObjectFactory ?? xQr
        }
        async terminateWindowsJobObject() {
            let t = this.windowsJobObject;
            if (this.windowsJobObject = void 0, !!t) try {
                t.terminate()
            } catch {} finally {
                try {
                    t.close()
                } catch {}
            }
        }
        async send(t) {
            let n = await this.requestMetaProvider?.();
            await super.send(bWs(t, n))
        }
        async start() {
            let t = Date.now();
            await super.start();
            let n = this._process;
            if (!n) return;
            this.childProcess = n;
            let o = r((s, a) => {
                this.lastProcessExit ??= {
                    exitCode: s,
                    exitedAt: Date.now(),
                    signal: a,
                    startedAt: t
                }
            }, "recordExit");
            if (n.exitCode !== null || n.signalCode !== null) {
                o(n.exitCode, n.signalCode);
                return
            }
            if (n.once("exit", o), !(process.platform !== "win32" || this.pid == null)) try {
                this.windowsJobObject = await this.windowsJobObjectFactory(this.pid)
            } catch {
                this.windowsJobObject = void 0
            }
        }
        get processExit() {
            return this.lastProcessExit
        }
        get processAlive() {
            return !!(this.childProcess && this.childProcess.exitCode === null && this.childProcess.signalCode === null)
        }
    };
    r(bWs, "mergeRequestMeta");
    r(CQr, "isRecord");
    Object.defineProperty(TG.prototype, "_dispose", {
        configurable: !0,
        async value() {
            let e = this.pid;
            if (await this.terminateWindowsJobObject(), typeof e == "number" && Number.isInteger(e) && e > 0) try {
                await wut(e)
            } catch {}
            if (IQr) {
                await IQr.call(this);
                return
            }
            await this.close()
        }
    })
});

function PQr(e) {
    let t = e.processProbe ?? gtt({
            platform: e.platform
        }),
        n = e.logicalCpuCount ?? Math.max(1, (0, kut.cpus)().length),
        o = e.totalMemoryGb ?? Math.round((0, kut.totalmem)() / 1024 ** 3),
        s = (0, AQr.randomUUID)(),
        a = e.timer ?? {
            setInterval: r((w, T) => setInterval(w, T), "setInterval"),
            clearInterval: r(w => clearInterval(w), "clearInterval")
        },
        l, u = 0,
        f = !1,
        g, _ = new Map,
        b = r(async () => {
            if (f) return;
            let w = e.getProcesses();
            if (w.length === 0) {
                _.clear(), g = void 0;
                return
            }
            f = !0;
            let T = u,
                I = e.now();
            try {
                t.reset();
                let A = await t.sampleProcessTrees(w.map(z => z.pid));
                if (T !== u) return;
                if (!A) {
                    _.clear(), g = void 0;
                    return
                }
                let R = g === void 0 ? ZZe : Math.max(1, I - g),
                    L = new Map,
                    U = new Map,
                    j = new Set;
                for (let z of w) {
                    if (!z.isCurrent()) continue;
                    let $ = A.get(z.pid);
                    if (z.observed($, I, t.treeScope), !$?.length) continue;
                    let K = U.get(z.mcpId) ?? {
                            mcpId: z.mcpId,
                            instanceToken: s,
                            sampledAt: I,
                            intervalMs: R,
                            processCount: 0,
                            rssKbTotal: 0,
                            rssKbMaxProcess: 0,
                            cpuTimeMsDelta: 0,
                            uptimeMinutes: 0,
                            platform: e.platform,
                            arch: e.arch,
                            logicalCpuCount: n,
                            totalMemoryGb: o
                        },
                        q = new Map;
                    for (let ie of $)
                        if (!j.has(ie.pid) && (j.add(ie.pid), K.processCount += 1, K.rssKbTotal += ie.rssKb, K.rssKbMaxProcess = Math.max(K.rssKbMaxProcess, ie.rssKb), ie.cpuTimeMs !== void 0)) {
                            q.set(ie.pid, ie.cpuTimeMs);
                            let ae = _.get(z.instanceId)?.get(ie.pid);
                            ae !== void 0 && (K.cpuTimeMsDelta += Math.max(0, ie.cpuTimeMs - ae))
                        } L.set(z.instanceId, q), K.uptimeMinutes = Math.max(K.uptimeMinutes, Math.floor(Math.max(0, I - z.startedAt) / 6e4)), K.processCount > 0 && U.set(z.mcpId, K)
                }
                _ = L, g = I, U.size > 0 && e.onResourceSamples?.([...U.values()])
            } catch {
                _.clear(), g = void 0
            } finally {
                f = !1
            }
        }, "sampleNow");
    return {
        sampleNow: b,
        start() {
            if (!l) try {
                l = a.setInterval(() => {
                    b()
                }, ZZe), l.unref?.()
            } catch {}
        },
        stop() {
            u += 1, _.clear(), g = void 0;
            let w = l;
            l = void 0;
            try {
                w && a.clearInterval(w)
            } catch {}
        }
    }
}
var AQr, kut, RQr = Y(() => {
    "use strict";
    AQr = require("node:crypto"), kut = require("node:os");
    gs();
    gen();
    r(PQr, "createMcpResourceTelemetry")
});

function xfn(e) {
    let t = e.arch ?? process.arch,
        n = e.now ?? Date.now,
        o = e.platform ?? process.platform,
        s = e.randomId ?? xut.randomUUID,
        a = new Map,
        l = r(f => {
            try {
                e.onEvent(f)
            } catch {}
        }, "emit"),
        u = PQr({
            ...e,
            arch: t,
            platform: o,
            now: n,
            getProcesses: r(() => [...a.values()].flatMap(f => {
                let g = f.process;
                return g ? [{
                    ...g,
                    mcpId: f.mcpId,
                    isCurrent: r(() => a.get(f.connectionId) === f && f.process === g, "isCurrent"),
                    observed(_, b, w) {
                        if (!_) {
                            f.owners.size === 0 && (f.process = void 0, a.delete(f.connectionId));
                            return
                        }
                        let T = new Set([...f.owners.values()].filter(A => A !== void 0)),
                            I = f.owners.size === 0 && f.unownedAt !== void 0 ? Math.max(0, b - f.unownedAt) : 0;
                        l({
                            arch: t,
                            kind: "memory",
                            mcpId: f.mcpId,
                            mcpInstanceId: g.instanceId,
                            mcpIsolation: f.isolation,
                            mcpSource: f.mcpSource,
                            platform: o,
                            occurredAt: b,
                            memoryKb: _.reduce((A, R) => A + R.rssKb, 0),
                            memoryScope: w,
                            orphanSuspected: f.owners.size === 0 && I > 6e4,
                            ownerSessionCount: T.size,
                            unownedSeconds: I / 1e3
                        })
                    }
                }] : []
            }), "getProcesses")
        });
    return {
        acquireOwner(f) {
            let g = a.get(f.connectionId);
            g && (g.owners.set(f.ownerId, f.sessionId), g.unownedAt = void 0)
        },
        recordProcessCrashed(f) {
            let g = a.get(f.connectionId),
                _ = g?.process;
            if (!g || !_) return;
            g.process = void 0;
            let b = n(),
                w = new Set([...g.owners.values()].filter(T => T !== void 0));
            l({
                affectedSessionCount: w.size,
                arch: t,
                exitCode: f.exitCode,
                kind: "process_crash",
                mcpId: g.mcpId,
                mcpInstanceId: _.instanceId,
                mcpIsolation: g.isolation,
                mcpSource: g.mcpSource,
                occurredAt: b,
                platform: o,
                signal: f.signal,
                uptimeMs: Math.max(0, b - _.startedAt)
            })
        },
        recordProcessClosed(f) {
            let g = a.get(f.connectionId);
            g && (g.process = void 0, g.owners.size === 0 && a.delete(f.connectionId))
        },
        recordProcessStarted(f) {
            let g = a.get(f.connectionId);
            if (!g || !Number.isInteger(f.pid) || f.pid <= 0) return;
            let _ = s(),
                b = n();
            return g.process = {
                instanceId: _,
                pid: f.pid,
                startedAt: b
            }, g.owners.size === 0 && (g.unownedAt ??= b), l({
                arch: t,
                kind: "process_start",
                mcpId: g.mcpId,
                mcpInstanceId: _,
                mcpIsolation: g.isolation,
                mcpSource: g.mcpSource,
                occurredAt: b,
                platform: o
            }), {
                mcpId: g.mcpId,
                mcpInstanceId: _
            }
        },
        recordSessionStartup(f) {
            l({
                arch: t,
                configuredCount: f.configuredCount,
                connectedCount: f.connectedCount,
                failedCount: f.failedCount,
                kind: "session_startup",
                occurredAt: n(),
                platform: o,
                processCount: f.processCount,
                sessionId: f.sessionId
            })
        },
        releaseOwner(f) {
            let g = a.get(f.connectionId);
            !g || !g.owners.delete(f.ownerId) || g.owners.size === 0 && (g.unownedAt = n())
        },
        registerConnection(f) {
            let g = f.source ?? xWs(f.serverName);
            a.set(f.connectionId, {
                connectionId: f.connectionId,
                isolation: f.isolation,
                mcpId: TWs(f.serverName, g, e.idSalt),
                mcpSource: g,
                serverName: f.serverName,
                owners: new Map
            })
        },
        unregisterConnection(f) {
            let g = a.get(f.connectionId);
            g && (g.owners.clear(), g.unownedAt ??= n(), g.process || a.delete(f.connectionId))
        },
        listProcesses() {
            let f = [];
            for (let g of a.values()) {
                if (!g.process) continue;
                let _ = OQr(g.serverName);
                f.push({
                    pid: g.process.pid,
                    serverName: g.serverName,
                    mcpSource: g.mcpSource,
                    ..._ ? {
                        pluginName: _
                    } : {}
                })
            }
            return f
        },
        sampleNow: u.sampleNow,
        start: u.start,
        stop: u.stop
    }
}

function OQr(e) {
    if (!e.startsWith(zMe)) return;
    let t = e.slice(zMe.length).split(":")[0]?.trim();
    return t || void 0
}

function xWs(e) {
    return e === wWs ? "builtin" : e.startsWith(zMe) ? "plugin" : "custom"
}

function TWs(e, t, n) {
    if (t === "builtin") {
        let s = e.startsWith(zMe) ? e.slice(zMe.length) : e;
        return `${SWs}${s.split(":").map(IWs).join(":")}`
    }
    let o = (0, xut.createHmac)("sha256", n).update(e).digest("hex").slice(0, 12);
    return `${t}:${o}`
}

function IWs(e) {
    let t = "";
    for (let n of DQr.Buffer.from(e, "utf8")) {
        let o = String.fromCharCode(n);
        t += kWs.test(o) ? o : `%${n.toString(16).toUpperCase().padStart(2,"0")}`
    }
    return t
}
var DQr, xut, SWs, wWs, kWs, zMe, MQr = Y(() => {
    "use strict";
    DQr = require("node:buffer"), xut = require("node:crypto");
    RQr();
    SWs = "builtin:", wWs = "node_repl", kWs = /^[A-Za-z0-9._~-]$/, zMe = "plugin:";
    r(xfn, "createMcpTelemetryTracker");
    r(OQr, "resolvePluginName");
    r(xWs, "resolveMcpSource");
    r(TWs, "resolveMcpId");
    r(IWs, "encodeMcpIdSegment")
});

function Afn(e = {}) {
    return new Efn(e)
}

function jQr(e = {}) {
    return efn({
        logger: e.logger,
        telemetry: e.telemetry,
        createAdapter: r(({
            connectionContext: t,
            workingDirectory: n
        }) => Afn({
            ...e,
            connectionContext: t,
            workingDirectory: n ?? e.workingDirectory
        }), "createAdapter")
    })
}

function PWs(e) {
    let t = {
        ...e.trace ? {
            trace_id: e.trace.traceId
        } : {},
        ...e.trace?.spanId ? {
            span_id: e.trace.spanId
        } : {},
        ...e.trace?.parentSpanId ? {
            parent_span_id: e.trace.parentSpanId
        } : {},
        ...e.trace?.sessionId ? {
            session_id: e.trace.sessionId
        } : {},
        ...e.trace?.turnId ? {
            turn_id: e.trace.turnId
        } : {},
        ...e.runtimeScope ? {
            runtime_scope: e.runtimeScope
        } : {},
        ...e.workspacePath ? {
            workspace_path: e.workspacePath
        } : {},
        ...e.workspaceIdentity ? {
            workspace_identity: e.workspaceIdentity
        } : {},
        ...e.workspaceKey ? {
            workspace_key: e.workspaceKey
        } : {},
        ...e.remoteSessionId ? {
            remote_session_id: e.remoteSessionId
        } : {},
        ...e.clientMode ? {
            client_mode: e.clientMode
        } : {},
        ...e.deliveryKind ? {
            delivery_kind: e.deliveryKind
        } : {},
        ...e.turnId && !e.trace?.turnId ? {
            turn_id: e.turnId
        } : {}
    };
    return {
        ...t,
        "com.zcode/request-context": t
    }
}

function BQr(e) {
    return e.protocolVersion === "2026-07-28" ? {
        pin: "2026-07-28"
    } : e.type === "sse" || e.protocolVersion === "legacy" ? "legacy" : "auto"
}

function UQr(e) {
    if (nl.isInstance(e) && e.code === Ec.EraNegotiationFailed || lge.isInstance(e)) return !0;
    let t = e?.cause;
    return t !== void 0 && t !== e ? UQr(t) : !1
}

function RWs(e) {
    let t = BQr(e);
    return typeof t == "object" ? t.pin : t
}

function DWs(e, t) {
    let n = BQr(e);
    if (n === "legacy") return {
        mode: n
    };
    let o = typeof n == "object" ? Math.max(1, Math.floor(t)) : Math.min(EWs, Math.max(1, Math.floor(t / 2)));
    return {
        mode: n,
        probe: {
            timeoutMs: o
        }
    }
}

function OWs(e) {
    return {
        type: "oauth_authorization_code",
        authorizationUrl: e.authorizationUrl,
        startedAt: new Date().toISOString()
    }
}

function Ifn(e) {
    if (e.type !== "stdio" && !$Me(e)) {
        if (e.oauth?.type === "authorization_code") return e.oauth;
        if (e.oauth?.type !== "client_credentials" && !MWs(e.headers)) return {
            type: "authorization_code"
        }
    }
}

function $Me(e) {
    return (e.type === "http" || e.type === "stdio") && e.auth?.type === "zcode_official" && e.auth.provider === "jwt_token" && e.official !== void 0
}

function MWs(e) {
    return e ? Object.keys(e).some(t => t.toLowerCase() === "authorization") : !1
}

function NWs(e) {
    let t = "";
    return {
        append(n) {
            n && (t = `${t}${n}`, t.length > e && (t = t.slice(-e)))
        },
        read() {
            return t
        }
    }
}

function NQr(e) {
    let t = String.raw`(?:api[_-]?key|access[_-]?key|secret(?:[_-]?key)?|private[_-]?key|token|password|passwd|pass|mysql_pass|mysql_password)`,
        n = e.replace(/(bearer\s+)[^\s"']+/gi, "$1[Redacted]");
    return n = n.replace(/(\bauthorization\b\s*[:=]\s*)(bearer\s+)?[^\r\n]+/gi, (o, s, a) => `${s}${a?"Bearer ":""}[Redacted]`), n = n.replace(new RegExp(`([?&]${t}=)[^&\\s]+`, "gi"), "$1[Redacted]"), n = n.replace(new RegExp(`(["']${t}["']\\s*:\\s*)(["'])(?:(?!\\2).)*\\2`, "gi"), "$1$2[Redacted]$2"), n = n.replace(new RegExp(`(\\b${t}\\b\\s*[:=]\\s*)(["']?)[^\\s"',;)}]+`, "gi"), "$1$2[Redacted]"), n.replace(/([a-z][a-z0-9+.-]*:\/\/)[^:\s/@]+:[^@\s/]+@/gi, "$1[Redacted]@")
}

