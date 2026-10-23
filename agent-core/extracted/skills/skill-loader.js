    let s = t.match(/^(\d+)\.(\d+)$/);
    return s ? {
        major: Number(s[1]),
        minor: Number(s[2]),
        patch: 0,
        prerelease: []
    } : null
}

function rZi(e, t) {
    if (e.length === 0 && t.length === 0) return 0;
    if (e.length === 0) return 1;
    if (t.length === 0) return -1;
    let n = Math.max(e.length, t.length);
    for (let o = 0; o < n; o += 1) {
        let s = e[o],
            a = t[o];
        if (s === void 0) return -1;
        if (a === void 0) return 1;
        let l = /^\d+$/.test(s),
            u = /^\d+$/.test(a);
        if (l && u) {
            let g = Number(s) - Number(a);
            if (g !== 0) return g > 0 ? 1 : -1;
            continue
        }
        if (l !== u) return l ? -1 : 1;
        let f = s.localeCompare(a);
        if (f !== 0) return f > 0 ? 1 : -1
    }
    return 0
}

function rpr(e, t) {
    let n = npr(e),
        o = npr(t);
    if (!n || !o) return null;
    for (let s of ["major", "minor", "patch"]) {
        let a = n[s] - o[s];
        if (a !== 0) return a > 0 ? 1 : -1
    }
    return rZi(n.prerelease, o.prerelease)
}

function oZi(e) {
    let t = e.forceUpdate?.minimalVersion.trim();
    if (!t) return null;
    let n = rpr(e.currentVersion, t);
    return n === null || n >= 0 ? null : {
        currentVersion: e.currentVersion,
        minimalVersion: t
    }
}
var opr = Y(() => {
    r(npr, "parseSemver");
    r(rZi, "comparePrerelease");
    r(rpr, "compareSemverVersions");
    r(oZi, "resolveForceUpdateRequirement")
});
var ipr = Y(() => {});

function apr() {
    return globalThis.process?.env ?? {}
}

function mKt(e = apr()) {
    return e.INTRANET_MACHINE_HOST?.trim() || spr
}

function aZi(e = apr()) {
    let t = e.ZCODE_DEPS_BASE_URL?.trim();
    return t ? t.replace(/\/+$/, "") : `http://${mKt(e)}:${gKt}/zcode/deps`
}
var spr, hKt, gKt, cpr, iZi, lpr, upr, sZi, dpr = Y(() => {
    spr = "studio.zcode-ai.com";
    r(apr, "readProcessEnv");
    r(mKt, "resolveIntranetMachineHost");
    hKt = mKt(), gKt = 12345, cpr = `http://${hKt}:${gKt}/zcode`, iZi = `${cpr}/deps`, lpr = 3850, upr = "/api/intranet/probe", sZi = `http://${hKt}:${lpr}${upr}`;
    r(aZi, "resolveIntranetDepsBaseUrl")
});
var ppr = Y(() => {});
var fpr = Y(() => {});
var mpr = Y(() => {});

function gpr(e) {
    let t = e?.trim();
    if (!t) return !1;
    try {
        let n = new URL(t),
            o = n.hostname.toLowerCase();
        return n.protocol === "https:" && (o === "openrouter.ai" || o.endsWith(".openrouter.ai"))
    } catch {
        return !1
    }
}

function _Kt(e, t) {
    return gpr(t) ? {
        ...e,
        ...hpr
    } : e
}
var hpr, _pr = Y(() => {
    hpr = {
        "X-OpenRouter-Title": "ZCode",
        "X-OpenRouter-Categories": "programming-app"
    };
    r(gpr, "isOpenRouterBaseUrl");
    r(_Kt, "withOpenRouterAttributionHeaders")
});

function ypr(e, t, n) {
    for (let o = t; o < n; o += 1)
        if (e[o]?.kind === "local") return o;
    return null
}

function cZi(e, t) {
    if (e.length === 0) return null;
    let n = Math.min(Math.max(t ?? 0, 0), e.length - 1),
        o = ypr(e, n, e.length);
    return o ?? ypr(e, 0, n)
}
var vpr = Y(() => {
    r(ypr, "findLocalWorkspaceSessionIndex");
    r(cZi, "resolveStartupLocalWorkspaceSessionIndex")
});

function oXe(e) {
    return bpr.has(e) ? !1 : e.startsWith(".") ? uZi.has(e) : !0
}
var Xpe, bpr, lZi, uZi, Spr = Y(() => {
    Xpe = "SKILL.md", bpr = new Set(["node_modules", "dist", "build", "out", "target", "vendor", "coverage", ".cache", ".next", ".turbo", ".venv", "__pycache__"]), lZi = 8, uZi = new Set([".system"]);
    r(oXe, "shouldWalkSkillDirectoryEntry")
});
var yKt, vKt, wpr, bKt, dZi, kpr = Y(() => {
    Fa();
    fAe();
    _ee();
    mAe();
    yKt = "ZCODE_NODE_REPL_BROWSER_BROKER_SOCKET", vKt = "ZCODE_NODE_REPL_BROWSER_BROKER_TOKEN", wpr = m.object({
        id: m.string().uuid(),
        runtimeScope: m.enum(["main", "subagent"]),
        token: m.string().min(32),
        sessionId: m.string().trim().min(1),
        turnId: m.string().trim().min(1).optional(),
        trace: m.object({
            traceId: m.string().trim().min(1),
            spanId: m.string().trim().min(1).optional(),
            parentSpanId: m.string().trim().min(1).optional()
        }).strict().optional()
    }), bKt = m.discriminatedUnion("op", [wpr.extend({
        op: m.literal("list")
    }).strict(), wpr.extend({
        op: m.literal("execute"),
        browserId: m.string().trim().min(1),
        browserGeneration: m.number().int().nonnegative(),
        command: gee
    }).strict()]), dZi = m.discriminatedUnion("ok", [m.object({
        id: m.string().uuid(),
        ok: m.literal(!0),
        browsers: m.array(XKe).optional(),
        result: yee.optional()
    }).strict(), m.object({
        id: m.string().uuid(),
        ok: m.literal(!1),
        error: m.string().min(1)
    }).strict()])
});
var xpr = Y(() => {
    _pe();
    _ee();
    fAe();
    xWt();
    mAe();
    kpr()
});
var Tpr = Y(() => {});

function zx(e, t = {
    mode: "build",
    planEnabled: !1
}) {
    let n = SKt.safeParse(e.mode);
    return {
        mode: n.success ? n.data : t.mode,
        planEnabled: e.planEnabled ?? (e.mode === "plan" ? !0 : n.success ? !1 : t.planEnabled)
    }
}
var SKt, wKt, Ipr = Y(() => {
    Fa();
    SKt = m.enum(["build", "edit", "yolo", "auto"]), wKt = m.object({
        mode: SKt,
        planEnabled: m.boolean()
    });
    r(zx, "resolveExecutionState")
});

function kKt(e) {
    return pZi.safeParse(e).data ?? null
}
var Cpr, Epr, pZi, xKt = Y(() => {
    Fa();
    Cpr = m.array(m.string().trim().min(1)).transform(e => [...new Set(e)]), Epr = m.object({
        categoryOrder: Cpr.optional(),
        pluginOrder: m.record(m.string(), Cpr).optional()
    }), pZi = m.object({
        code: Epr.optional().catch(void 0),
        work: Epr.optional().catch(void 0)
    });
    r(kKt, "parsePluginStoreOrder")
});

function hZi(e) {
    let t = mZi.safeParse(e);
    if (!t.success) throw new Error("Invalid public client config response");
    return {
        pluginStoreOrder: kKt(t.data.data?.configs?.pluginStoreOrder)
    }
}
var fZi, mZi, Apr = Y(() => {
    Fa();
    xKt();
    fZi = m.object({
        forceRefresh: m.boolean().optional()
    }), mZi = m.object({
        code: m.literal(0),
        data: m.object({
            configs: m.object({
                pluginStoreOrder: m.unknown().optional()
            }).nullish()
        }).nullish()
    });
    r(hZi, "parseClientConfigSnapshot")
});

function Rpr(e, t) {
    return IKt(gZi, e, t)
}

function Dpr(e) {
    let t = e?.trim();
    return t === "guides" ? "utilities" : t || void 0
}

function _Zi(e, t, n, o) {
    let s = Ppr(o?.categoryOrder),
        a = new Map(Object.entries(o?.pluginOrder ?? {}).map(([l, u]) => [l, Ppr(u)]));
    return e.map((l, u) => {
        let f = t(l);
        return {
            item: l,
            index: u,
            ...f,
            category: Dpr(f.category) ?? iXe
        }
    }).sort((l, u) => IKt(s, l.category, u.category) || yZi(l.category, u.category) || IKt(a.get(l.category), l.id, u.id) || Rpr(l.id, u.id) || l.displayName.localeCompare(u.displayName, n) || l.index - u.index).map(({
        item: l
    }) => l)
}

function Ppr(e = []) {
    let t = new Map;
    for (let n of e) t.has(n) || t.set(n, t.size);
    return t
}

function IKt(e, t, n) {
    return e ? (e.get(t) ?? e.size) - (e.get(n) ?? e.size) : 0
}

function yZi(e, t) {
    if (e === t) return 0;
    if (e === iXe) return 1;
    if (t === iXe) return -1;
    let n = TKt.indexOf(e),
        o = TKt.indexOf(t);
    return n !== -1 && o !== -1 ? n - o : n !== -1 ? -1 : o !== -1 ? 1 : e < t ? -1 : 1
}
var iXe, TKt, gZi, Opr = Y(() => {
    JJe();
    iXe = "other", TKt = ["productivity", "developer-tools", "utilities", "finance", "legal", "template"], gZi = new Map(["pdf", "presentations", "spreadsheets", "documents"].map((e, t) => [`${e}@${uz}`, t]));
    r(Rpr, "compareDocumentPluginPriority");
    r(Dpr, "resolvePluginStoreCategory");
    r(_Zi, "sortPluginStoreEntries");
    r(Ppr, "ranks");
    r(IKt, "compareRanks");
    r(yZi, "compareCategories")
});

function kZi(e) {
    let {
        data: t
    } = wZi.parse(e), n = [], o = 0, s = new Set;
    for (let a of t.deliveries) {
        let l = Upr.safeParse(a);
        if (!l.success || s.has(l.data.resource_position)) {
            o++;
            continue
        }
        s.add(l.data.resource_position), n.push(l.data)
    }
    return {
        serverTime: t.server_time * 1e3,
        language: t.language,
        deliveries: n,
        rejectedCount: o
    }
}
var sXe, Npr, Wee, aXe, Lpr, Fpr, jpr, vZi, Bpr, CKt, bZi, EKt, AKt, SZi, Mpr, Upr, wZi, zpr = Y(() => {
    Fa();
    oWt();
    sXe = m.string().trim().min(1).max(128), Npr = m.string().max(4096).url().refine(e => {
        if (!URL.canParse(e)) return !1;
        let t = new URL(e);
        return ["http:", "https:"].includes(t.protocol) && !t.username && !t.password
    }), Wee = m.object({
        src: Npr,
        sha256: m.string().regex(/^[a-f0-9]{64}$/u)
    }), aXe = m.object({
        format: m.enum(["plaintext", "html", "markdown"]),
        content: m.string().max(2e4)
    }), Lpr = m.discriminatedUnion("page", [m.object({
        page: m.literal("upgrade")
    }).strict(), m.object({
        page: m.literal("rewards")
    }).strict(), m.object({
        page: m.literal("settings"),
        section: m.enum(["general", "appearance", "models", "browser", "computer_use", "memory", "subagents", "plugins", "mcp", "skills", "commands", "hooks", "usage"]).optional(),
        provider_id: sXe.optional()
    }).strict().refine(e => e.provider_id === void 0 || e.section === "models"), m.object({
        page: m.literal("plugin_marketplace"),
        plugin_id: sXe.regex(/^[^@\s]+@[^@\s]+$/u).optional()
    }).strict()]), Fpr = m.discriminatedUnion("type", [m.object({
        type: m.literal("close")
    }), m.object({
        type: m.literal("open_url"),
        args: m.object({
            url: Npr
        })
    }), m.object({
        type: m.literal("claim_zcode_plan"),
        args: m.object({
            plan_id: sXe
        })
    }), m.object({
        type: m.literal("navigate"),
        args: Lpr
    }), m.object({
        type: m.literal("copy_text"),
        args: m.object({
            text: m.string().max(2e4).refine(e => e.trim().length > 0)
        }).strict()
    })]), jpr = m.object({
        text: aXe,
        action: Fpr,
        theme: nWt.nullish()
    }), vZi = jpr.omit({
        theme: !0
    }).extend({
        text: aXe.extend({
            format: m.enum(["", "plaintext", "html", "markdown"]).transform(e => e || "plaintext")
        })
    }), Bpr = m.enum(["", "v1"]).optional(), CKt = m.record(m.string(), m.unknown()).refine(e => JSON.stringify(e).length <= 64e3).optional(), bZi = m.object({
        type: m.literal("image"),
        image: m.object({
            default: Wee,
            dark: Wee.nullish()
        }),
        args: CKt
    }), EKt = m.discriminatedUnion("type", [bZi, m.object({
        type: m.literal("video"),
        video: m.object({
            src: Wee,
            fallback: Wee
        }),
        args: CKt
    }), m.object({
        type: m.literal("bundle"),
        bundle: m.object({
            bundle: Wee,
            entry: m.string().min(1).max(240).refine(e => !e.includes("\\") && e.split("/").every(t => t && t !== "." && t !== "..")),
            fallback: Wee.nullish()
        }),
        args: CKt
    })]), AKt = m.object({
        layout: Bpr,
        title: aXe,
        description: aXe,
        hero: EKt.nullish(),
        buttons: m.array(jpr).max(4)
    }), SZi = m.object({
        layout: Bpr,
        background: EKt,
        buttons: m.array(vZi).max(2),
        success_popup: AKt.nullish()
    }).refine(e => e.buttons.filter(t => t.action.type === "close").length <= 1 && e.buttons.filter(t => t.action.type !== "close").length <= 1), Mpr = {
        campaign_id: sXe,
        priority: m.number().int().min(0).max(100)
    }, Upr = m.discriminatedUnion("resource_position", [m.object({
        ...Mpr,
        resource_position: m.literal("banner"),
        banner: SZi
    }), m.object({
        ...Mpr,
        resource_position: m.literal("popup"),
        popup: AKt
    })]), wZi = m.object({
        code: m.literal(0),
        data: m.object({
            server_time: m.number().finite(),
            language: m.enum(["zh-CN", "en-US"]),
            deliveries: m.array(m.unknown()).max(32)
        })
    });
    r(kZi, "parseMarketingTouchResponse")
});

function $pr(e, t = {}) {
    try {
        let n = new URL(e);
        return n.username || n.password ? !1 : (["https://zcode.z.ai", "https://zcode.chatglm.site"].includes(n.origin) || t.dev === !0 && n.origin === "http://localhost:3000" || t.e2e === !0 && n.protocol === "http:" && ["127.0.0.1", "localhost"].includes(n.hostname)) && /^\/(cn|en)\/rewards\/?$/.test(n.pathname) && n.searchParams.get("embedded") === "app"
    } catch {
        return !1
    }
}

function IZi(e) {
    try {
        if (e.override && $pr(qpr(e.override, "en-US", "zai-dark"), e)) return new URL(e.override).origin
    } catch {}
    return e.env === "test" ? "https://zcode.chatglm.site" : "https://zcode.z.ai"
}

function qpr(e, t, n) {
    let o = new URL(`/${t==="zh-CN"?"cn":"en"}/rewards`, e);
    return o.searchParams.set("embedded", "app"), o.searchParams.set("theme", n), o.toString()
}
var xZi, TZi, PKt, RKt = Y(() => {
    Fa();
    xZi = "persist:zcode-rewards", TZi = "zcode-rewards-context", PKt = m.object({
        theme: m.enum(["zai-light", "zai-dark"]),
        locale: m.enum(["zh-CN", "en-US"]),
        auth: m.object({
            status: m.enum(["ready", "anonymous"]),
            provider: m.enum(["zai", "bigmodel"]).nullable(),
            revision: m.number().int().nonnegative()
        })
    });
    r($pr, "isTrustedRewardsUrl");
    r(IZi, "resolveRewardsOrigin");
    r(qpr, "buildRewardsUrl")
});

function CZi() {
    let e = globalThis.localStorage;
    for (let s of ["oauth:zai:access_token", "oauth:bigmodel:access_token", "zcodejwttoken"]) e.removeItem(s);
    let t = globalThis.window,
        n = null,
        o = {
            theme: new Set,
            locale: new Set,
            auth: new Set
        };
    t.addEventListener("zcode-rewards-context", s => {
        let a = s.detail;
        if (!a || !["zai-light", "zai-dark"].includes(a.theme) || !["zh-CN", "en-US"].includes(a.locale) || !a.auth || !["ready", "anonymous"].includes(a.auth.status) || ![null, "zai", "bigmodel"].includes(a.auth.provider) || !Number.isSafeInteger(a.auth.revision) || a.auth.revision < 0) return;
        let l = n;
        n = a;
        for (let u of ["theme", "locale", "auth"])
            if (JSON.stringify(l?.[u]) !== JSON.stringify(a[u]))
                for (let f of o[u]) f(a[u])
    }), Object.defineProperty(t, "zcodeBridge", {
        configurable: !1,
        writable: !1,
        value: {
            getTheme() {
                return n?.theme ?? null
            },
            getLang() {
                return n?.locale ?? null
            },
            getAuthState() {
                return n?.auth ?? null
            },
            onThemeChange(s) {
                return o.theme.add(s), () => o.theme.delete(s)
            },
            onLangChange(s) {
                return o.locale.add(s), () => o.locale.delete(s)
            },
            onAuthChange(s) {
                return o.auth.add(s), () => o.auth.delete(s)
            }
        }
    })
}

function EZi(e, t, n) {
    let o = PKt.parse(e),
        s = o.auth.status === "ready" ? {
            [`oauth:${o.auth.provider}:access_token`]: t.oauth?.trim() || null,
            zcodejwttoken: t.jwt?.trim() || null
        } : {};
    return `(() => {
    ${n?`if (window.location.href !== ${JSON.stringify(n)}) return;`:""}
    for (const key of ["oauth:zai:access_token", "oauth:bigmodel:access_token", "zcodejwttoken"]) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(${JSON.stringify(s)})) if (value) localStorage.setItem(key, value);
    window.dispatchEvent(new CustomEvent("zcode-rewards-context", { detail: ${JSON.stringify(o)} }));
  })()`
}
var Wpr = Y(() => {
    RKt();
    r(CZi, "installRewardsPageBridge");
    r(EZi, "createRewardsInjectionScript")
});

function OKt(e, t) {
    if (e === void 0 || !Number.isFinite(e) || e < 0 || t === null || !Number.isFinite(t) || t <= 0) return null;
    let n = e * 1e3 / t;
    return Number.isFinite(n) ? n : null
}
var Vee, DKt, Lg, AZi, Vpr, Hpr, PZi, Gpr = Y(() => {
    Fa();
    Vee = {
        rounds: 200,
        network: 100,
        dedupe: 2e3
    }, DKt = m.object({
        sessionId: m.string().min(1)
    }).strict(), Lg = m.number().finite().nonnegative(), AZi = m.object({
        inputTokens: Lg.optional(),
        outputTokens: Lg.optional(),
        totalTokens: Lg.optional(),
        reasoningTokens: Lg.optional(),
        cachedInputTokens: Lg.optional(),
        cachedWriteInputTokens: Lg.optional()
    }).strict(), Vpr = m.object({
        eventKey: m.string(),
        requestId: m.string(),
        requestIndex: Lg,
        recordedAt: Lg,
        usage: AZi,
        hitRate: Lg.nullable(),
        generationDurationMs: Lg.nullable(),
        tokensPerSecond: Lg.nullable()
    }).strict(), Hpr = m.object({
        eventKey: m.string(),
        traceId: m.string(),
        recordedAt: Lg,
        statusType: m.enum(["model_request_started", "model_request_completed", "model_request_failed", "model_retry_scheduled", "model_stream_stalled"]),
        requestId: m.string().optional(),
        providerId: m.string().optional(),
        modelId: m.string().optional(),
        providerKind: m.string().optional(),
        transport: m.string().optional(),
        baseURL: m.string().optional(),
        querySource: m.string().optional(),
        queryId: m.string().optional(),
        timestamp: m.string().optional(),
        attempt: Lg.optional(),
        maxAttempts: Lg.optional(),
        nextAttempt: Lg.optional(),
        retryable: m.boolean().optional(),
        statusCode: Lg.optional(),
        durationMs: Lg.optional(),
        delayMs: Lg.optional(),
        idleMs: Lg.optional(),
        timeoutMs: Lg.optional(),
        reason: m.string().optional(),
        message: m.string().optional(),
        requestHeaders: m.record(m.string(), m.string()),
        responseHeaders: m.record(m.string(), m.string()),
        requestHeaderCount: Lg,
        responseHeaderCount: Lg
    }).strict(), PZi = m.object({
        sessionId: m.string(),
        rounds: m.array(Vpr).max(Vee.rounds),
        networkEntries: m.array(Hpr).max(Vee.network),
        cache: m.object({
            hitRateRequestCount: Lg,
            totalInputTokens: Lg,
            totalCacheReadTokens: Lg,
            hitRate: Lg.nullable()
        }).strict().nullable()
    }).strict();
    r(OKt, "calculateOutputTps")
});

function NKt(e) {
    return e.replace(/[^a-z0-9]/gi, "")
}

function Qpe(e, t) {
    let n = NKt(e);
    return Jpr.test(n) || t && RZi.test(n)
}

function LKt(e) {
    let t = [],
        n = /(?:"((?:\\.|[^"\\])*)"|'([^']*)'|([\w.-]+))\s*[:=]\s*/g;
