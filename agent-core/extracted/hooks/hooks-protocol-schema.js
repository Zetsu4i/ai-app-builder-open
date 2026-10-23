        parentToolCallId: m.string().optional(),
        subagentType: m.string(),
        status: m.enum(["running", "success", "failed", "cancelled"]),
        summaryText: m.string(),
        childSessionId: m.string().optional(),
        backgrounded: m.literal(!0).optional(),
        workId: m.string().optional(),
        startedAt: pu.optional(),
        endedAt: pu.optional()
    }), Amc = m.object({
        clientVisible: m.literal(!0),
        sourceKind: m.enum(["user", "plugin", "project", "internal"]),
        sourcePath: m.string().optional(),
        pluginId: m.string().optional(),
        pluginName: m.string().optional(),
        statusMessage: m.string().optional(),
        executionType: m.enum(["process", "command"]),
        executionMode: m.enum(["foreground", "background"]),
        commandDisplay: m.string(),
        timeoutMs: m.number().int().positive()
    }).strict(), oVt = m.object({
        hookRunId: m.string().min(1),
        hookIndex: m.number().int().nonnegative(),
        didExecute: m.boolean(),
        state: m.enum(["running", "completed", "failed"]),
        outcome: m.enum(["success", "blocked", "failed", "cancelled", "timed_out"]).optional(),
        blockReason: m.string().trim().min(1).optional(),
        startedAt: pu,
        endedAt: pu.optional(),
        durationMs: m.number().nonnegative().optional(),
        displayName: m.string().trim().min(1),
        sourceKind: m.enum(["user", "plugin", "project"]),
        pluginName: m.string().optional(),
        toolName: m.string().optional()
    }).strict(), iVt = m.object({
        ...Fj,
        kind: m.literal("hookInvocation"),
        hookInvocationId: m.string().min(1),
        hookEventName: m.enum(["SessionStart", "UserPromptSubmit", "PreToolUse", "PermissionRequest", "PostToolUse", "PostToolUseFailure", "Stop"]),
        hookCount: m.number().int().positive(),
        state: m.enum(["running", "completed", "failed"]),
        startedAt: pu,
        endedAt: pu.optional(),
        durationMs: m.number().nonnegative().optional(),
        lane: m.enum(["assistantWork", "toolBefore", "toolAfter"]),
        anchorToolCallId: m.string().optional(),
        executions: m.array(oVt)
    }), Lji = m.union([m.object({
        type: m.literal("compact"),
        origin: m.enum(["manual", "auto"]),
        status: m.enum(["running", "success", "failed", "noop", "cancelled"]),
        tokensBefore: m.number().optional(),
        tokensAfter: m.number().optional(),
        summaryRef: m.string().optional()
    }), m.object({
        type: m.literal("forkNotice"),
        parentSessionId: m.string(),
        parentRowId: m.number()
    }), m.object({
        type: m.literal("forkCreated"),
        childSessionId: m.string(),
        atRowId: m.number()
    }), m.object({
        type: m.literal("modelChange"),
        fromProvider: m.string(),
        fromModel: m.string(),
        toProvider: m.string(),
        toModel: m.string(),
        toThought: m.string()
    }), m.object({
        type: m.literal("modelChange"),
        fromProvider: m.never().optional(),
        fromModel: m.never().optional(),
        toProvider: m.string(),
        toModel: m.string(),
        toThought: m.string()
    }), m.object({
        type: m.literal("goalSet"),
        objective: m.string(),
        previousObjective: m.string().optional()
    }), m.object({
        type: m.literal("goalVerify"),
        iteration: m.number(),
        outcome: m.enum(["running", "pass", "notSatisfied", "failed"]),
        detail: m.string().optional()
    }), m.object({
        type: m.literal("retryNotice"),
        attempt: m.number(),
        reasonCode: m.string()
    }), m.object({
        type: m.literal("checkpointRestored"),
        checkpointId: m.string()
    })]), Fji = m.enum(["assistantWork", "turnTailBoundary", "lightBoundary"]), jji = m.object({
        ...Fj,
        kind: m.literal("timelineMarker"),
        sourceCommandId: m.string().optional(),
        lane: Fji.optional(),
        marker: Lji
    }), jj = m.discriminatedUnion("kind", [Aji, Pji, Rji, Dji, rVt, Mji, Nji, iVt, jji])
});

function aVt(e, t, n) {
    new Set(e).size !== e.length && t.addIssue({
        code: m.ZodIssueCode.custom,
        path: n,
        message: "review item ids must be unique"
    })
}
var eh, IAe, sVt, Ipe, Bji, Iee, EZe, mrr, hrr, Cee, Mmc, CAe = Y(() => {
    Fa();
    xb();
    eh = m.string().trim().min(1), IAe = m.number().int().positive(), sVt = m.number().int().nonnegative(), Ipe = m.string().regex(/^[a-f0-9]{64}$/u), Bji = m.enum(["not_applicable", "pending_trust", "trusted_persistent", "blocked_untrusted", "blocked_policy", "revoked", "stale_digest"]), Iee = m.object({
        action: m.literal("trust_selected"),
        reviewItemIds: m.array(eh).min(1)
    }).strict().superRefine((e, t) => {
        "reviewItemIds" in e && e.reviewItemIds && aVt(e.reviewItemIds, t, ["reviewItemIds"])
    }), EZe = m.object({
        sessionId: eh,
        taskId: eh,
        runId: eh,
        remoteSessionId: eh.optional(),
        workspaceIdentity: eh,
        bundleDigest: Ipe,
        reviewFlowId: eh,
        generation: IAe,
        interactionId: eh
    }).strict(), mrr = m.object({
        sessionId: eh,
        remoteSessionId: eh.optional(),
        workspaceIdentity: eh,
        bundleDigest: Ipe,
        hookDeclarationDigests: m.array(Ipe).min(1)
    }).strict().superRefine((e, t) => {
        aVt(e.hookDeclarationDigests, t, ["hookDeclarationDigests"])
    }), hrr = m.object({
        sessionId: eh,
        remoteSessionId: eh.optional(),
        workspaceIdentity: eh,
        bundleDigest: Ipe
    }).strict(), Cee = m.object({
        kind: m.literal("workspaceHookReview"),
        reviewFlowId: eh,
        generation: IAe,
        interactionId: eh,
        sessionId: eh,
        taskId: eh,
        runId: eh,
        workspaceIdentity: eh,
        workspaceLabel: eh,
        remoteSessionId: eh.optional(),
        bundleDigest: Ipe,
        createdAt: pu,
        deadlineAt: pu,
        sourceFiles: m.array(m.object({
            path: eh,
            displayPath: eh,
            editable: m.boolean()
        }).strict()),
        summary: m.object({
            eventCount: sVt,
            hookCount: sVt,
            pendingCount: sVt
        }).strict(),
        items: m.array(m.object({
            reviewItemId: eh,
            event: m.enum(["SessionStart", "UserPromptSubmit", "PreToolUse", "PermissionRequest", "PostToolUse", "PostToolUseFailure", "Stop"]),
            matcher: m.string().optional(),
            type: m.enum(["command", "process"]),
            displayName: eh,
            displayCommand: eh,
            sourcePath: eh,
            resolvedTimeoutMs: IAe,
            resolvedMaxOutputBytes: IAe,
            executionMode: m.enum(["foreground", "background"]),
            configuredEnabled: m.boolean(),
            editable: m.boolean(),
            trustState: Bji
        }).strict()),
        warningCode: m.literal("workspace_hooks_execute_code")
    }).strict().superRefine((e, t) => {
        e.deadlineAt < e.createdAt && t.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["deadlineAt"],
            message: "deadlineAt must not precede createdAt"
        }), e.summary.hookCount !== e.items.length && t.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["summary", "hookCount"],
            message: "hookCount must match the immutable request items"
        });
        let n = new Set(e.items.map(s => s.event)).size;
        e.summary.eventCount !== n && t.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["summary", "eventCount"],
            message: "eventCount must match the immutable request items"
        });
        let o = e.items.filter(s => ["pending_trust", "revoked", "stale_digest"].includes(s.trustState)).length;
        e.summary.pendingCount !== o && t.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["summary", "pendingCount"],
            message: "pendingCount must match pending admission items"
        }), aVt(e.items.map(s => s.reviewItemId), t, ["items"])
