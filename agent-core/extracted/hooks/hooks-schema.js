            effectiveRunnable: !1,
            reasonCode: "workspace_hook_declaration_changed"
        }
    }, Wx = G.string().trim().min(1), wPe = G.string().regex(/^[a-f0-9]{64}$/u), fYt = G.number().int().positive(), bte = G.number().int().nonnegative(), fgr = G.object({
        reviewItemId: Wx,
        sourceRootEnabled: G.boolean(),
        declarationEnabled: G.boolean(),
        runtimeHooksEnabled: G.boolean(),
        configuredEnabled: G.boolean(),
        editable: G.boolean(),
        trustState: ves,
        admissionClass: bes,
        effectiveRunnable: G.boolean(),
        workspaceIdentity: Wx.optional(),
        bundleDigest: wPe.optional(),
        hookDeclarationDigest: wPe.optional(),
        sourcePaths: G.array(Wx),
        reasonCode: Ses.optional()
    }).strict().superRefine((e, t) => {
        let n = mYt[e.trustState];
        e.admissionClass !== n.admissionClass && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["admissionClass"],
            message: `admissionClass must be ${n.admissionClass} for ${e.trustState}`
        }), e.reasonCode !== void 0 && e.reasonCode !== n.reasonCode && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["reasonCode"],
            message: `reasonCode must be ${n.reasonCode} for ${e.trustState}`
        }), n.effectiveRunnable === !1 && e.effectiveRunnable && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["effectiveRunnable"],
            message: `${e.trustState} cannot be runnable`
        }), !e.configuredEnabled && e.effectiveRunnable && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["effectiveRunnable"],
            message: "a configured-disabled hook cannot be runnable"
        })
    }), wes = G.enum(["SessionStart", "UserPromptSubmit", "PreToolUse", "PermissionRequest", "PostToolUse", "PostToolUseFailure", "Stop"]), dgr = {
        reviewItemId: Wx,
        event: wes,
        matcherIndex: bte,
        hookIndex: bte,
        sourceFileIndex: bte,
        sourceRelativePath: Wx,
        matcher: G.string().nullable(),
        command: Wx,
        resolvedTimeoutMs: fYt,
        resolvedMaxOutputBytes: fYt,
        statusMessage: Wx.optional(),
        sourceRootEnabled: G.boolean(),
        declarationEnabled: G.boolean(),
        runtimeHooksEnabled: G.boolean(),
        configuredEnabled: G.boolean(),
        editable: G.boolean(),
        declarationDigestAlgorithm: G.literal("sha256"),
        hookDeclarationDigest: wPe
    }, kes = G.discriminatedUnion("type", [G.object({
        ...dgr,
        type: G.literal("command"),
        async: G.boolean().optional(),
        shell: G.union([G.literal(!0), Wx]).optional()
    }).strict(), G.object({
        ...dgr,
        type: G.literal("process"),
        args: G.array(G.string()).optional()
    }).strict()]), xes = G.object({
        schemaVersion: G.literal(yes),
        workspaceIdentity: Wx,
        discoveredAt: G.string().datetime(),
        sourceFiles: G.array(G.object({
            canonicalPath: Wx,
            baseDir: Wx,
            discoveryOrder: bte,
            configFileKind: G.enum(["zcode.json", ".zcode/config.json", "explicit"]),
            explicitProjectConfig: G.boolean(),
            editable: G.boolean(),
            hooksRoot: G.object({
                enabled: G.boolean().optional(),
                timeoutMs: G.number().finite().positive().optional(),
                maxOutputBytes: G.number().finite().positive().optional()
            }).strict()
        }).strict()),
        hooks: G.array(kes),
        digestAlgorithm: G.literal("sha256"),
        bundleDigest: wPe
    }).strict();
    r(yfe, "createWorkspaceHookBundleSnapshot");
    hYt = G.object({
        reviewFlowId: Wx,
        generation: fYt,
        interactionId: Wx,
        sessionId: Wx,
        workspaceIdentity: Wx,
        bundleDigest: wPe,
        state: G.enum(["pending", "resolved", "superseded", "cancelled", "timed_out"]),
        supersededByInteractionId: Wx.optional(),
        createdAt: bte,
        deadlineAt: bte
    }).strict().superRefine((e, t) => {
        e.deadlineAt < e.createdAt && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["deadlineAt"],
            message: "deadlineAt must not precede createdAt"
        }), e.state === "superseded" && !e.supersededByInteractionId && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["supersededByInteractionId"],
            message: "superseded flow requires its replacement interaction id"
        }), e.state !== "superseded" && e.supersededByInteractionId && t.addIssue({
            code: G.ZodIssueCode.custom,
            path: ["supersededByInteractionId"],
            message: "only a superseded flow may reference a replacement interaction"
        })
    }), e2c = G.object({
        coordinatorEpoch: Wx,
        counter: bte
    }).strict();
    r(mgr, "deepFreeze")
});
var $V, Tes, uQe, ggr, gYt, qV, dQe, _gr = Y(() => {
    Fa();
    $V = 1, Tes = m.enum(["SessionStart", "UserPromptSubmit", "PreToolUse", "PermissionRequest", "PostToolUse", "PostToolUseFailure", "Stop"]), uQe = m.string().trim().min(1), ggr = m.string().regex(/^[a-f0-9]{64}$/u), gYt = m.number().int().nonnegative(), qV = m.object({
        workspaceIdentity: uQe,
        hookDeclarationDigest: ggr,
        digestAlgorithm: m.literal("sha256"),
        decision: m.literal("trusted"),
        grantedAt: m.string().datetime(),
        lastUsedAt: m.string().datetime().optional(),
        bundleDigestAtGrant: ggr.optional(),
        eventAtGrant: Tes,
        displayCommandAtGrant: uQe,
        sourcePathAtGrant: uQe,
        sourceDiscoveryOrderAtGrant: gYt.optional(),
        matcherAtGrant: m.string().nullable().optional(),
        matcherIndexAtGrant: gYt.optional(),
        hookIndexAtGrant: gYt.optional(),
        appVersionAtGrant: uQe.optional()
    }).strict(), dQe = m.object({
        schemaVersion: m.literal($V),
        records: m.array(qV)
    }).strict().superRefine((e, t) => {
        let n = e.records.map(o => `${o.workspaceIdentity}\0${o.hookDeclarationDigest}`);
        new Set(n).size !== n.length && t.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["records"],
            message: "workspace identity and declaration digest keys must be unique"
        })
    })
});
var kPe, WV, ygr = Y(() => {
    "use strict";
    _gr();
    gl();
    kPe = G.string().trim().min(1), WV = G.discriminatedUnion("mode", [G.object({
        mode: G.literal("deny"),
        reason: kPe,
        policyRevision: kPe
    }).strict(), G.object({
        mode: G.literal("user_decides"),
        policyRevision: kPe
    }).strict(), G.object({
        mode: G.literal("allow_trusted_only"),
        reason: kPe.optional(),
        policyRevision: kPe
    }).strict()])
});
var xl, Xj, Ies, Ces, vgr, Ees, Aes, Pes, Nz, u2c, bgr = Y(() => {
    "use strict";
    gl();
    hgr();
    ygr();
    xl = {
        SessionStart: "SessionStart",
        UserPromptSubmit: "UserPromptSubmit",
        PreToolUse: "PreToolUse",
        PermissionRequest: "PermissionRequest",
        PostToolUse: "PostToolUse",
        PostToolUseFailure: "PostToolUseFailure",
        Stop: "Stop"
    }, Xj = {
        Success: "success",
        Blocked: "blocked",
        Failed: "failed",
        Cancelled: "cancelled",
        TimedOut: "timed_out"
    }, Ies = G.union([G.object({
        behavior: G.literal("allow"),
        permissionUpdates: G.array(G.object({
            type: G.literal("addRules"),
            behavior: G.enum(["allow", "deny", "ask"]),
            rules: G.array(G.object({
                toolName: G.string().min(1),
                ruleContent: G.string().optional()
            }))
        })).optional(),
        updatedPermissions: G.array(G.object({
            type: G.literal("addRules"),
            behavior: G.enum(["allow", "deny", "ask"]),
            rules: G.array(G.object({
                toolName: G.string().min(1),
                ruleContent: G.string().optional()
            }))
        })).optional(),
        updatedInput: G.unknown().optional()
    }), G.object({
        behavior: G.literal("deny"),
        interrupt: G.boolean().optional(),
        message: G.string().optional()
    })]), Ces = G.discriminatedUnion("hookEventName", [G.object({
        additionalContext: G.string().optional(),
        hookEventName: G.literal(xl.PreToolUse),
        permissionDecision: G.enum(["allow", "ask", "deny"]).optional(),
        permissionDecisionReason: G.string().optional(),
        updatedInput: G.unknown().optional()
    }), G.object({
        additionalContext: G.string().optional(),
        hookEventName: G.literal(xl.UserPromptSubmit)
    }), G.object({
        additionalContext: G.string().optional(),
        hookEventName: G.literal(xl.SessionStart)
    }), G.object({
        additionalContext: G.string().optional(),
        hookEventName: G.literal(xl.PostToolUse)
    }), G.object({
        additionalContext: G.string().optional(),
        hookEventName: G.literal(xl.PostToolUseFailure)
    }), G.object({
        decision: Ies.optional(),
        hookEventName: G.literal(xl.PermissionRequest)
    }), G.object({
        additionalContext: G.string().optional(),
        hookEventName: G.literal(xl.Stop)
    })]), vgr = G.object({
        additionalContext: G.string().optional(),
        additional_context: G.string().optional(),
        continue: G.boolean().optional(),
        decision: G.enum(["approve", "block"]).optional(),
        hookSpecificOutput: Ces.optional(),
        reason: G.string().optional(),
        stopReason: G.string().optional(),
        suppressOutput: G.boolean().optional(),
        systemMessage: G.string().optional()
    }), Ees = G.object({
        type: G.literal("process"),
        command: G.string().min(1),
        enabled: G.boolean().optional(),
        args: G.array(G.string()).optional(),
        timeoutMs: G.number().int().positive().optional(),
        statusMessage: G.string().optional()
    }), Aes = G.object({
        type: G.literal("command"),
        command: G.string().min(1),
        enabled: G.boolean().optional(),
        async: G.boolean().optional(),
        shell: G.union([G.literal(!0), G.string().min(1)]).optional(),
        timeout: G.number().positive().optional(),
        timeoutMs: G.number().int().positive().optional(),
        statusMessage: G.string().optional()
    }), Pes = G.discriminatedUnion("type", [Ees, Aes]), Nz = G.object({
        matcher: G.string().optional(),
        hooks: G.array(Pes).min(1)
    }), u2c = G.object({
        enabled: G.boolean().optional(),
        timeoutMs: G.number().int().positive().optional(),
        maxOutputBytes: G.number().int().positive().optional(),
        events: G.object({
            SessionStart: G.array(Nz).optional(),
            UserPromptSubmit: G.array(Nz).optional(),
            PreToolUse: G.array(Nz).optional(),
            PermissionRequest: G.array(Nz).optional(),
            PostToolUse: G.array(Nz).optional(),
            PostToolUseFailure: G.array(Nz).optional(),
            Stop: G.array(Nz).optional()
        }).strict().optional()
    })
});
var Sgr = Y(() => {
    "use strict"
});

function kgr(e) {
    let t = _Yt(e),
        n = Les(t.body);
    if (n) throw new Error(`Custom command /${e.command.metadata.name} uses unsupported ${n} expansion. Dynamic expansion is not available yet.`);
    return yYt({
        body: t.body,
        command: e.command,
        argumentCount: t.argumentCount,
        usedArgumentsPlaceholder: t.usedArgumentsPlaceholder
    })
}

function _Yt(e) {
    let t = e.args.trim(),
        n = Nes(t),
        o = e.command.content.includes(wgr),
        s = e.command.content.replaceAll(wgr, t);
    return s = s.replace(Res, (a, l) => {
        o = !0;
        let u = Number(l) - 1;
        return n[u] ?? ""
    }), t.length > 0 && !o && (s = `${s.trimEnd()}

User arguments:
${t}`), {
        argumentCount: n.length,
        body: s,
        usedArgumentsPlaceholder: o
    }
}

function yYt(e) {
    return {
        argumentCount: e.argumentCount,
        prompt: [`Run custom command /${e.command.metadata.name}.`, `Command source: ${e.command.metadata.scope}/${e.command.metadata.source}.`, ...Mes(e.command.metadata.skills ?? []), "", e.body.trim()].join(`
`),
        usedArgumentsPlaceholder: e.usedArgumentsPlaceholder
    }
}

function Mes(e) {
    if (e.length === 0) return [];
    let t = e.map(n => `\`${n}\``).join(", ");
    return [`Required skills: ${t}.`, `Before following the command body, call the Skill tool for ${t}.`]
}

function Nes(e) {
    let t = [],
        n = "",
        o = null,
        s = !1;
    for (let a of e) {
        if (s) {
            n += a, s = !1;
            continue
        }
        if (a === "\\") {
            s = !0;
            continue
        }
        if (o) {
            a === o ? o = null : n += a;
            continue
        }
        if (a === "'" || a === '"') {
            o = a;
            continue
        }
        if (/\s/.test(a)) {
            n.length > 0 && (t.push(n), n = "");
            continue
        }
