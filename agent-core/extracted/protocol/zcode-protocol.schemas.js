    WVt();
    Lj();
    mV();
    Dee();
    Dee();
    HZe = "ZCode Protocol", GZe = 1, V3i = 3, H3i = m.object({
        independentPlanState: m.boolean().optional()
    }), Oee = {
        sessionUnavailable: -32004
    }, Rn = m.string().trim().min(1), jx = m.record(m.string(), m.unknown()), DR = m.number().int().nonnegative(), qZe = m.union([DR, Rn, m.date()]), Por = m.object({
        kind: m.literal("node_repl_images"),
        images: m.array(m.object({
            base64: m.string().min(1).max(200 * 1024),
            mimeType: m.string().regex(/^image\/[a-z0-9.+-]+$/iu)
        }).strict()).min(1).max(2),
        truncated: m.boolean().optional(),
        source: m.literal("browser_turn_end").optional()
    }).strict(), Ior = m.object({
        head: m.string().min(1).max(128).optional(),
        tail: m.string().min(1).max(128).optional()
    }).strict(), Cor = m.object({
        from: m.string().min(1).max(64),
        to: m.string().min(1).max(64),
        back: m.literal(!0).optional()
    }).strict(), G3i = m.object({
        steps: m.array(m.object({
            id: m.string().min(1).max(64),
            kind: m.enum(["ask", "world-read"]),
            label: m.string().min(1).max(128),
            labelPattern: Ior.optional(),
            line: m.number().int().positive().optional(),
            column: m.number().int().positive().optional(),
            lane: m.string().min(1).max(64),
            lanes: m.array(m.string().min(1).max(64)).max(32).optional(),
            source: m.string().min(1).max(64).optional(),
            phase: m.string().min(1).max(64).optional(),
            repeat: m.enum(["stack", "serial"]).optional()
        }).strict()).max(64),
        lanes: m.array(m.object({
            id: m.string().min(1).max(64),
            name: m.string().min(1).max(128).optional(),
            namePattern: Ior.optional(),
            line: m.number().int().positive().optional(),
            column: m.number().int().positive().optional()
        }).strict()).max(32),
        participants: m.array(m.object({
            id: m.string().min(1).max(64),
            phase: m.string().min(1).max(64),
            lane: m.string().min(1).max(64),
            steps: m.array(m.string().min(1).max(64)).min(1).max(64),
            member: m.object({
                index: m.number().int().nonnegative(),
                of: m.number().int().positive()
            }).strict().optional(),
            many: m.literal(!0).optional()
        }).strict()).max(64),
        handoffs: m.array(Cor.extend({
            types: m.array(m.string().min(1).max(128)).min(1).max(8).optional()
        }).strict()).max(256),
        phases: m.array(m.object({
            id: m.string().min(1).max(64),
            name: m.string().min(1).max(128).optional(),
            line: m.number().int().positive().optional(),
            column: m.number().int().positive().optional(),
            alongside: m.array(m.string().min(1).max(64)).min(1).max(32).optional()
        }).strict()).max(32).optional(),
        phaseEdges: m.array(Cor).max(128).optional(),
        exits: m.array(m.string().min(1).max(64)).max(32).optional(),
        sink: m.array(m.string().min(1).max(64)).max(64).optional(),
        truncated: m.boolean().optional()
    }).strict(), Ror = m.object({
        kind: m.literal("create_workflow"),
        ok: m.boolean(),
        errorCount: m.number().int().nonnegative(),
        diagnostics: m.array(m.object({
            line: m.number().int().nonnegative(),
            column: m.number().int().nonnegative(),
            code: m.number().int().nonnegative(),
            message: m.string().min(1).max(2048)
        }).strict()).max(100),
        causalityGraph: G3i.optional(),
        truncated: m.boolean().optional()
    }).strict(), J3i = jx.superRefine((e, t) => {
        let n = e.display;
        if (typeof n != "object" || n === null || Array.isArray(n)) return;
        let o = n.kind,
            a = typeof o == "string" ? {
                node_repl_images: Por,
                create_workflow: Ror,
                bash_output: vee
            } [o] : void 0;
        if (!a) return;
        let l = a.safeParse(n);
        if (!l.success)
            for (let u of l.error.issues) t.addIssue({
                ...u,
                path: ["display", ...u.path]
            })
    }), JZe = m.union([m.string(), m.number().int()]), YVt = m.object({
        traceId: Rn.optional(),
        parentId: Rn.optional(),
        spanId: Rn.optional(),
        traceparent: Rn.optional()
    }).strict(), Dor = m.object({
        id: JZe,
        method: Rn,
        params: m.unknown().optional(),
        trace: YVt.optional()
    }).strict(), Oor = m.object({
        method: Rn,
        params: m.unknown().optional(),
        trace: YVt.optional()
    }).strict(), Mor = m.object({
        id: JZe,
        result: m.unknown()
    }).strict(), Nor = m.object({
        id: JZe,
        error: m.object({
            code: m.number().int(),
            message: Rn,
            data: m.unknown().optional()
        }).strict()
    }).strict(), XVt = m.union([Dor, Oor, Mor, Nor]), OR = {
        storageStartup: "startup/storageState",
        providerRuntimeHeadersCancelled: "interaction/providerRuntimeHeadersCancelled",
        mcpTelemetry: "process/mcpTelemetry",
        mcpResourceSamples: "process/mcpResourceSamples",
        toolExecResource: "process/toolExecResource",
        pluginOperationProgress: "plugins/operationProgress",
        processResourceSample: "process/resourceSample"
    }, KZe = m.object({
        schemaVersion: m.literal(1),
        attemptId: m.string().min(1).max(128),
        sequence: m.number().int().positive(),
        databaseId: m.string().min(1).max(128),
        databaseKind: m.enum(["session", "tasks-index"]),
        phase: m.enum(["checking", "waiting_for_lock", "migrating", "committing", "ready", "failed"]),
        migration: nAe.optional(),
        elapsedMs: m.number().nonnegative().finite(),
        completed: m.number().int().nonnegative().optional(),
        total: m.number().int().nonnegative().optional(),
        errorCode: rAe.optional(),
        ...VKe.shape
    }).strict().superRefine((e, t) => {
        e.phase === "failed" && !e.errorCode && t.addIssue({
            code: "custom",
            message: "failed requires errorCode"
        })
    }), QVt = m.enum(["aix", "android", "darwin", "freebsd", "haiku", "linux", "netbsd", "openbsd", "sunos", "win32", "cygwin"]), Lor = m.enum(["arm", "arm64", "ia32", "loong64", "mips", "mipsel", "ppc", "ppc64", "riscv64", "s390", "s390x", "x64"]), $Ze = m.object({
        arch: Lor,
        occurredAt: m.number().int().nonnegative(),
        platform: QVt
    }).strict(), WZe = {
        mcpId: m.string().regex(/^(?:builtin:(?:[A-Za-z0-9._~-]|%[0-9A-F]{2})+(?::(?:[A-Za-z0-9._~-]|%[0-9A-F]{2})+)*|(?:plugin|custom):[a-f0-9]{12})$/),
        mcpInstanceId: Rn,
        mcpIsolation: m.enum(["session", "workspace"]),
        mcpSource: m.enum(["builtin", "plugin", "custom"])
    }, eHt = m.discriminatedUnion("kind", [$Ze.extend({
        kind: m.literal("process_start"),
        ...WZe
    }).strict(), $Ze.extend({
        kind: m.literal("process_crash"),
        ...WZe,
        affectedSessionCount: m.number().int().nonnegative().max(1e4),
        exitCode: m.number().int().nullable(),
        signal: Rn.nullable(),
        uptimeMs: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER)
    }).strict(), $Ze.extend({
        kind: m.literal("session_startup"),
        configuredCount: m.number().int().nonnegative().max(1e4),
        connectedCount: m.number().int().nonnegative().max(1e4),
        failedCount: m.number().int().nonnegative().max(1e4),
        processCount: m.number().int().nonnegative().max(1e4),
        sessionId: Rn
    }).strict(), $Ze.extend({
        kind: m.literal("memory"),
        ...WZe,
        memoryKb: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
        memoryScope: m.enum(["process_tree", "direct_process"]),
        orphanSuspected: m.boolean(),
        ownerSessionCount: m.number().int().nonnegative().max(1e4),
        unownedSeconds: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER)
    }).strict()]), ZZe = 5 * 6e4, For = m.object({
        mcpId: WZe.mcpId,
        instanceToken: m.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
        sampledAt: m.number().int().nonnegative(),
        intervalMs: m.number().finite().positive(),
        processCount: m.number().int().positive().max(1e5),
        rssKbTotal: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
        rssKbMaxProcess: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
        cpuTimeMsDelta: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
        uptimeMinutes: m.number().int().nonnegative(),
        platform: QVt,
        arch: Lor,
        logicalCpuCount: m.number().int().positive().max(4096),
        totalMemoryGb: m.number().int().nonnegative().max(1048576)
    }).strict(), tHt = m.array(For).max(1024), LAe = 15e3, YZe = 20, nHt = m.object({
        completionToken: m.string().uuid().optional(),
        platform: QVt,
        toolName: m.literal("bash"),
        durationMs: m.number().finite().min(LAe),
        exitKind: m.enum(["completed", "timeout", "killed", "error"]),
        treeRssKbPeak: m.number().finite().nonnegative().optional(),
        treeCpuTimeMs: m.number().finite().nonnegative().optional(),
        sampleCount: m.number().int().nonnegative().max(YZe),
        cliRssKb: m.number().finite().nonnegative(),
        systemFreeMemoryKb: m.number().finite().nonnegative()
    }).strict(), rHt = m.object({
        platform: m.enum(["aix", "android", "darwin", "freebsd", "haiku", "linux", "netbsd", "openbsd", "sunos", "win32", "cygwin"]),
        arch: m.enum(["arm", "arm64", "ia32", "loong64", "mips", "mipsel", "ppc", "ppc64", "riscv64", "s390", "s390x", "x64"]),
        logicalCpuCount: m.number().int().positive().max(4096),
        intervalMs: m.number().int().positive().max(10080 * 60 * 1e3),
        cpuCores: m.number().finite().nonnegative().max(4096),
        cpuPercent: m.number().finite().nonnegative().max(1e5),
        rssKb: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
        heapUsedKb: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
        uptimeMinutes: m.number().int().nonnegative().max(10 * 365 * 24 * 60).optional(),
        totalMemoryGb: m.number().int().nonnegative().max(1048576).optional(),
        instanceToken: m.string().regex(/^[A-Za-z0-9_-]{8,64}$/).optional()
    }).strict(), K3i = m.object({}).strict(), jor = m.object({
        pid: m.number().int().positive(),
        serverName: Rn,
        mcpSource: m.enum(["builtin", "plugin", "custom"]),
        pluginName: Rn.optional()
    }).strict(), Z3i = m.object({
        processes: m.array(jor).max(1e4)
    }).strict(), Y3i = wpe, oHt = m.enum(["immediate", "deferred"]), XZe = m.object({
        optionId: Rn,
        kind: Rn,
        name: Rn,
        description: m.string().optional(),
        response: jL
    }).strict(), Eor = m.object({
        name: Rn,
        value: m.string()
    }).strict(), X3i = m.union([m.object({
        type: m.literal("client_credentials"),
        clientId: Rn,
        clientSecret: Rn,
        clientName: Rn.optional(),
        scope: m.string().optional()
    }).strict(), m.object({
        type: m.literal("authorization_code"),
        clientId: Rn.optional(),
        clientSecret: Rn.optional(),
        clientName: Rn.optional(),
        redirectPath: Rn.optional(),
        scope: m.string().optional()
    }).strict()]), Lpe = m.union([m.object({
        name: Rn,
        command: Rn,
        args: m.array(m.string()),
        env: m.array(Eor),
        isolation: m.enum(["session", "workspace"]).optional(),
        protocolVersion: m.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: m.number().int().positive().optional()
    }).strict(), m.object({
        name: Rn,
        type: m.enum(["http", "sse"]),
        url: Rn,
        headers: m.array(Eor),
        oauth: X3i.optional(),
        isolation: m.enum(["session", "workspace"]).optional(),
        protocolVersion: m.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: m.number().int().positive().optional()
    }).strict()]), Bor = m.enum(["connecting", "connected", "disabled", "disconnected", "failed", "untrusted"]), Uor = ["config_invalid", "runtime_unavailable", "process_start_failed", "network_unreachable", "connection_timeout", "protocol_negotiation_failed", "tool_list_failed", "unexpected_disconnect", "oauth_authorization_failed", "official_origin_untrusted", "not_authenticated", "coding_plan_required", "server_not_found", "server_unavailable", "rate_limited", "server_internal_error", "protocol_error", "status_unavailable", "connection_failed"], zor = m.enum(Uor), $or = m.object({
        status: Bor,
        transport: m.enum(["stdio", "http", "sse"]),
        toolCount: m.number().int().nonnegative(),
        updatedAt: Rn,
        error: m.string().optional(),
        failureKind: zor.optional(),
        serverRequestId: Rn.optional(),
        protocolEra: m.enum(["legacy", "modern"]).optional(),
        authorization: m.object({
            type: m.literal("oauth_authorization_code"),
            authorizationUrl: Rn,
            startedAt: Rn
        }).strict().optional()
    }).strict(), qor = m.enum(["connect", "status"]), QZe = m.object({
        workspace: rd,
        mcpServers: m.array(Lpe).optional(),
        mode: qor.default("connect")
    }).strict(), Fpe = m.object({
        statuses: m.record(m.string(), $or)
    }).strict(), Wor = m.object({
        role: m.enum(["user", "assistant"]),
        content: m.string(),
        timestamp: DR.optional()
    }).strict(), Vor = m.discriminatedUnion("source", [m.object({
        source: m.literal("claudeCode"),
        title: m.string().optional(),
        createdAt: DR.optional(),
        updatedAt: DR.optional(),
        messages: m.array(Wor).min(1)
    }).strict(), m.object({
        source: m.literal("sharedContext"),
        title: m.string().trim().min(1),
        createdAt: DR.optional(),
        markdown: m.string().min(1),
        provenance: m.object({
            shareId: m.string().trim().min(1),
            contextId: m.string().trim().min(1).optional(),
            shareUrl: m.string().url().optional(),
            status: m.enum(["pending", "reserved", "attached", "discarded"]).optional(),
            projectionSha256: m.string().regex(/^[0-9a-f]{64}$/u),
            artifactSetSha256: m.string().regex(/^[0-9a-f]{64}$/u),
            formatterVersion: m.literal(1),
            markdownSha256: m.string().regex(/^[0-9a-f]{64}$/u),
            installedArtifacts: m.array(m.object({
                artifactId: m.string().trim().min(1),
                workspaceRelativePath: m.string().trim().min(1)
            }).strict())
        }).strict()
    }).strict()]), iHt = m.object({
        value: Rn,
        label: Rn,
        description: m.string().optional()
    }).strict(), Hor = m.object({
        levels: m.array(iHt),
        defaultLevel: Rn.optional()
    }).strict(), Gor = tpe.pick({
        inputFormat: !0,
        outputFormat: !0
    }), Jor = m.object({
        ref: Pu,
        label: Rn,
        providerLabel: Rn.optional(),
        description: m.string().optional(),
        contextWindow: m.number().int().positive().optional(),
        maxOutputTokens: m.number().int().positive().optional(),
        reasoning: Hor.optional(),
        properties: Gor,
        disabledReason: m.string().optional()
    }).strict(), Q3i = m.discriminatedUnion("planKind", [m.object({
        type: m.literal("zhipu-account"),
        family: m.enum(["zai", "bigmodel"]),
        planKind: m.literal("start-plan")
    }).strict(), m.object({
        type: m.literal("zhipu-account"),
        family: m.enum(["zai", "bigmodel"]),
        planKind: m.literal("individual-coding-plan")
    }).strict(), m.object({
        type: m.literal("zhipu-account"),
        family: m.enum(["zai", "bigmodel"]),
        planKind: m.literal("team-coding-plan"),
        productId: Rn,
        organizationId: Rn,
        projectId: Rn
    }).strict()]), Kor = m.object({
        type: m.literal("zhipu-account"),
        accountType: m.enum(["zai", "bigmodel"]),
        mode: m.enum(["start-plan", "individual-coding-plan", "team-coding-plan", "off-peak"]),
        entitled: m.boolean()
    }).strict(), sHt = m.object({
        content: Rn,
        status: m.enum(["pending", "in_progress", "completed"]),
        priority: m.enum(["high", "medium", "low"])
    }).strict(), Zor = m.object({
        timeUsedSeconds: m.number().int().nonnegative(),
        tokensUsed: m.number().int().nonnegative(),
        tokenBudget: m.number().int().positive().nullable(),
        contextUsed: m.number().int().nonnegative(),
        contextWindow: m.number().int().nonnegative(),
        toolCallCount: m.number().int().nonnegative(),
        iterationCount: m.number().int().nonnegative()
    }).strict(), Yor = m.object({
        id: Rn,
        source: m.enum(["goal_iteration", "session"]),
        goalIteration: m.number().int().positive().optional(),
        targetId: Rn.optional(),
        startedAt: DR.optional(),
        updatedAt: DR.optional(),
        todos: m.array(sHt)
    }).strict(), Xor = m.object({
        model: m.object({
            current: Pu.optional(),
            available: m.array(Jor),
            lastUsed: Pu.optional()
        }).strict(),
        thoughtLevel: m.object({
            enabled: m.boolean(),
            current: Rn.optional(),
            defaultLevel: Rn.optional(),
            available: m.array(iHt)
        }).strict(),
        mode: m.object({
            current: Nj
        }).strict(),
        permission: m.object({
            mode: Nj.optional(),
            rulesRevision: m.number().int().nonnegative().optional()
        }).strict().optional()
    }).strict(), Qor = m.object({
        requestId: Rn,
        toolCallId: Rn,
        toolName: Rn,
        reason: m.string(),
        riskLevel: m.enum(["low", "medium", "high", "critical"]),
        input: m.unknown().optional(),
        origin: BL.optional(),
        options: m.array(XZe).min(1),
        requestedAt: DR
    }).strict(), eir = m.object({
        toolCallId: Rn,
        toolName: Rn,
        status: m.enum(["pending", "running", "completed", "failed", "denied"]),
        startedAt: DR.optional()
    }).strict(), tir = m.object({
        sessionId: Rn,
        status: hZe,
        mode: Nj,
        turnCount: m.number().int().nonnegative(),
        totalTokenCount: m.number().int().nonnegative(),
        contextUsed: m.number().int().nonnegative(),
        contextWindow: m.number().int().nonnegative(),
        currentTurnId: Rn.optional(),
        pendingPermissions: m.array(Qor),
        activeToolCalls: m.array(eir),
        backgroundJobs: m.array(jx),
        target: gZe.nullable().optional(),
        lastError: m.object({
            type: Rn,
            code: Rn.optional(),
            message: Rn,
            detail: m.string().optional(),
            attribution: Bj.optional()
        }).strict().optional()
    }).strict(), aHt = m.object({
        name: Rn,
        description: m.string(),
        inputHint: m.string().optional(),
        source: m.enum(["builtin", "custom"]).optional()
    }).strict(), nir = m.enum(["start", "finish", "error", "text_start", "text_delta", "text_end", "reasoning_start", "reasoning_delta", "reasoning_end", "tool_input_start", "tool_input_delta", "tool_input_end", "tool_call"]), rir = m.object({
        assistantMessageId: m.string().optional(),
        delta: m.string().optional(),
        done: m.boolean().optional(),
        input: m.unknown().optional(),
        kind: nir,
        partId: m.string().optional(),
        providerExecuted: m.boolean().optional(),
        toolCallId: m.string().optional(),
        toolName: m.string().optional()
    }).strict(), FAe = m.object({
        protocol: m.object({
            name: m.literal(HZe),
            version: m.literal(GZe)
        }).strict(),
        session: _Ze,
        settings: Xor,
        projection: tir,
        runtime: WWt,
        messages: m.array(vZe),
        goalStats: Zor.optional(),
        todos: m.array(sHt).optional(),
        todoGroups: m.array(Yor).optional(),
        slashCommands: m.array(aHt).optional()
    }).strict(), oir = m.object({
        eventId: Rn,
        sessionId: Rn,
        turnId: Rn.optional(),
        seq: m.number().int().nonnegative(),
        traceId: Rn.optional(),
        timestamp: DR,
        deliveryKind: fV.optional()
    }).strict(), jpe = m.object({
        eventId: Rn,
        sequenceNumber: m.number().int().nonnegative(),
        sessionId: Rn,
        timestamp: DR
    }).strict(), eBi = jpe.extend({
        kind: m.literal("turn-started"),
        turnId: Rn
    }), tBi = jpe.extend({
        kind: m.literal("turn-completed"),
        turnId: Rn
    }), nBi = jpe.extend({
        kind: m.literal("turn-failed"),
        turnId: Rn
    }), rBi = jpe.extend({
        kind: m.literal("tool-scheduled"),
        turnId: Rn,
        toolCallId: Rn,
        toolName: Rn,
        computerUse: m.literal(!0).optional()
    }), oBi = jpe.extend({
        kind: m.literal("tool-started"),
        turnId: Rn.optional(),
        toolCallId: Rn,
        toolName: Rn.optional()
    }), iBi = jpe.extend({
        kind: m.literal("session-closed")
    }), sBi = m.discriminatedUnion("kind", [eBi, tBi, nBi, rBi, oBi, iBi]), aBi = m.enum(["session.created", "session.resumed", "session.updated", "session.titleUpdated", "session.closed", "turn.started", "turn.steerQueued", "turn.steerDrained", "turn.completed", "turn.failed", "message.upserted", "message.removed", "part.started", "part.delta", "part.upserted", "part.removed", "model.streaming", "tool.updated", "permission.requested", "permission.resolved", "userInput.requested", "userInput.resolved", "checkpoint.created", "rewind.triggered", "streamRecovery.updated"]), cHt = m.object({
        type: Rn,
        message: Rn,
        stack: m.string().optional(),
        code: m.string().optional(),
        detail: m.string().optional(),
        underlyingErrorMessage: m.string().optional(),
        underlyingErrorDetail: m.string().optional(),
        attribution: Bj.optional(),
        retryable: m.boolean().optional(),
        data: m.unknown().optional()
    }).strict(), iir = m.object({
        mode: Nj,
        contextWindow: m.number().int().nonnegative()
    }).strict(), sir = m.object({
        directory: Rn,
        interruptedToolCount: m.number().int().nonnegative(),
        messageCount: m.number().int().nonnegative(),
        partCount: m.number().int().nonnegative(),
        recoveredCompactTimelineCount: m.number().int().nonnegative().optional(),
        recoveredSteerInputCount: m.number().int().nonnegative().optional(),
        resumedTodoCount: m.number().int().nonnegative().optional()
    }).strict(), air = m.object({
        messageID: Rn.optional(),
        previousTitle: m.string(),
        source: m.enum(["default", "first_input", "generated", "custom"]),
        title: m.string()
    }).strict(), cir = m.object({
        turnNumber: m.number().int().nonnegative(),
        input: m.string(),
        inputId: Rn.optional(),
        queryId: Rn.optional(),
        inputSource: Y3i.optional(),
        inputVisibility: pZe.optional(),
        executionKind: m.enum(["agent", "controlOnly"]).optional(),
        targetId: Rn.optional(),
        messageId: Rn.optional(),
        foregroundExecutionId: Rn.optional(),
        intent: jx.optional(),
        originMeta: jx.optional(),
        backgroundSource: m.enum(["bash", "subagent"]).optional(),
        attachments: m.array(jx).optional()
    }).strict(), cBi = m.enum(["plan_approval_feedback", "workflow_refine_feedback"]), lBi = m.enum(["sendText", "sendGoalCommand", "compact"]), lir = m.enum(["queue", "guide"]), uir = m.object({
        pendingInputId: Rn,
        inputId: Rn.optional(),
        queryId: Rn.optional(),
        input: m.string(),
        inputPreview: m.string(),
        inputSize: m.number().int().nonnegative(),
        commandKind: lBi.optional(),
        source: cBi.optional(),
        toolDisallowlist: m.array(Rn).optional(),
        delivery: lir.optional(),
        targetTurnId: Rn,
        queueLength: m.number().int().nonnegative(),
        intent: jx.optional()
    }).strict(), dir = m.object({
        pendingInputIds: m.array(Rn),
        queryIds: m.array(Rn).optional(),
        targetTurnId: Rn,
        injectedMessageIds: m.array(Rn),
        drainedInputs: m.array(m.object({
            pendingInputId: Rn,
            messageId: Rn,
            text: m.string(),
            delivery: lir.optional(),
            intent: jx.optional(),
            toolDisallowlist: m.array(Rn).optional()
        }).strict()).optional()
    }).strict(), pir = m.object({
        response: m.string(),
        tokenCount: m.number().int().nonnegative(),
        usage: m.unknown().optional(),
        toolCallCount: m.number().int().nonnegative(),
        historyRoundCount: m.number().int().nonnegative().optional(),
        duration: m.number().nonnegative(),
        cacheStats: m.object({
            totalMessages: m.number().int().nonnegative(),
            cachedMessages: m.number().int().nonnegative(),
            lastCacheHit: m.boolean(),
            cacheReadTokens: m.number().int().nonnegative().optional()
        }).strict().optional(),
        inputId: Rn.optional(),
        resultType: m.enum(["success", "cancelled", "error_max_turns", "error_max_budget", "error_during_execution", "error_max_tool_calls"]),
        backgroundSubagentResultConsumed: m.boolean().optional()
    }).strict(), fir = m.object({
        error: cHt,
        turnPhase: m.string(),
        inputId: Rn.optional(),
        backgroundSubagentResultConsumed: m.boolean().optional()
    }).strict(), mir = m.object({
        content: m.string(),
        attachments: m.array(m.unknown()).optional(),
        toolCalls: m.array(m.unknown()).optional(),
        type: m.string().optional(),
        compactBoundary: m.unknown().optional()
    }).strict(), hir = m.object({
        messageId: Rn,
        reason: m.string().optional()
    }).strict(), gir = m.object({
        messageId: Rn,
        partId: Rn,
        field: m.enum(["text", "reasoning", "input", "output"]).optional(),
        delta: m.string()
    }).strict(), KVt = m.object({
        part: yZe
    }).strict(), _ir = m.object({
        messageId: Rn,
        partId: Rn,
        reason: m.string().optional()
    }).strict(), Npe = m.object({
        toolCallId: Rn,
        toolName: m.string().optional(),
        parentToolCallId: Rn.optional(),
        source: m.enum(["subagent"]).optional(),
        agentId: Rn.optional(),
        agentType: Rn.optional(),
        background: m.boolean().optional(),
        childSessionId: Rn.optional(),
        childToolCallId: Rn.optional(),
        description: m.string().optional()
    }).strict(), yir = m.discriminatedUnion("kind", [Npe.extend({
        kind: m.literal("scheduled"),
        assistantMessageId: Rn.optional(),
        toolName: Rn,
        input: m.unknown().optional(),
        inputByteLength: m.number().int().nonnegative().optional(),
        inputOmitted: m.boolean().optional(),
        inputRef: m.literal("model_stream").optional(),
        dependencies: m.array(Rn).optional(),
        parallelGroupIndex: m.number().int().nonnegative().optional(),
        canRunParallel: m.boolean().optional(),
        schedule: jx.optional()
    }).strict(), Npe.extend({
        kind: m.literal("started"),
        startedAt: qZe
    }).strict(), Npe.extend({
        kind: m.literal("progress"),
        elapsedMs: m.number().nonnegative().optional(),
        pid: m.number().int().optional(),
        stdoutBytes: m.number().int().nonnegative().optional(),
        stderrBytes: m.number().int().nonnegative().optional(),
        outputBytes: m.number().int().nonnegative().optional(),
        outputPreview: bee.optional(),
        stdoutTail: m.string().optional(),
        stderrTail: m.string().optional()
    }).strict(), Npe.extend({
        kind: m.literal("result"),
        result: J3i,
        duration: m.number().nonnegative()
    }).strict(), Npe.extend({
        kind: m.literal("error"),
        error: cHt
    }).strict(), m.object({
        kind: m.literal("batch"),
        toolCallIds: m.array(Rn),
        successCount: m.number().int().nonnegative(),
        errorCount: m.number().int().nonnegative()
    }).strict(), Npe.extend({
        kind: m.literal("raw"),
        payload: jx
    }).strict()]), vir = m.object({
        requestId: Rn.optional(),
        toolCallId: Rn,
        toolName: Rn,
        riskLevel: m.enum(["low", "medium", "high", "critical"]),
        reason: m.string(),
        input: m.unknown(),
        suggestedPermissionUpdates: m.array(mZe).optional(),
        origin: BL.optional(),
        options: m.array(XZe).min(1),
        childSessionId: Rn.optional(),
        background: m.boolean().optional()
    }).strict(), bir = m.object({
        requestId: Rn.optional(),
        toolCallId: Rn,
        toolName: Rn.optional(),
        decision: fZe.optional(),
        reason: m.string().optional(),
        modifiedInput: m.unknown().optional(),
        inputSummary: m.unknown().optional(),
        childSessionId: Rn.optional(),
        background: m.boolean().optional()
    }).strict(), Sir = m.object({
        requestId: Rn,
        prompt: m.string(),
        inputType: m.enum(["text", "choice", "confirm"]).optional(),
        choices: m.array(m.string()).optional()
    }).strict(), wir = m.object({
        requestId: Rn,
        value: m.unknown().optional(),
        cancelled: m.boolean().optional()
    }).strict(), kir = m.object({
        reason: m.string().optional()
    }).strict();
    r(E_, "zcodeSessionEventEnvelopeFor");
    lHt = m.discriminatedUnion("type", [E_("session.created", iir), E_("session.resumed", sir), E_("session.updated", jx), E_("session.titleUpdated", air), E_("session.closed", kir), E_("turn.started", cir), E_("turn.steerQueued", uir), E_("turn.steerDrained", dir), E_("turn.completed", pir), E_("turn.failed", fir), E_("message.upserted", mir), E_("message.removed", hir), E_("part.started", KVt), E_("part.delta", gir), E_("part.upserted", KVt), E_("part.removed", _ir), E_("model.streaming", rir), E_("tool.updated", yir), E_("permission.requested", vir), E_("permission.resolved", bir), E_("userInput.requested", Sir), E_("userInput.resolved", wir), E_("checkpoint.created", jx), E_("rewind.triggered", jx), E_("streamRecovery.updated", jx)]), uBi = m.object({
        events: m.array(lHt)
    }).strict(), dBi = m.object({
        messages: m.array(vZe)
    }).strict(), pBi = m.object({
        type: m.literal("state.updated"),
        scope: m.enum(["server", "workspace", "session"]),
        workspace: rd.optional(),
        sessionId: Rn.optional(),
        revision: m.number().int().nonnegative(),
        reason: m.string().optional(),
        patch: m.unknown()
    }).strict(), uHt = m.object({
        sessionId: Rn,
        deliveryKind: fV,
        afterSeq: m.number().int().nonnegative().optional(),
        includeSnapshot: m.boolean().default(!1)
    }).strict(), fBi = m.object({
        sessionId: Rn,
        eventSeq: m.number().int().nonnegative(),
        events: m.array(lHt),
        snapshot: FAe.optional()
    }).strict(), mBi = m.object({
        sessions: m.array(_Ze)
    }).strict(), xir = m.object({
        childSessionId: Rn,
        agentId: Rn.optional(),
        toolCallId: Rn.optional(),
        subagentType: Rn,
        title: Rn,
        summary: m.string().optional(),
        startedAt: m.number().int().nonnegative().optional(),
        endedAt: m.number().int().nonnegative().optional()
    }).strict(), Tir = xir.extend({
        status: m.enum(["running", "waiting", "blocked"])
    }), Iir = xir.extend({
        status: m.enum(["success", "failed", "cancelled", "lost"])
    }), hBi = m.object({
        revision: m.number().int().nonnegative(),
        childSessionIds: m.array(Rn),
        running: m.array(Tir),
        ended: m.object({
            total: m.number().int().nonnegative(),
            items: m.array(Iir),
            nextCursor: Rn.optional()
        }).strict()
    }).strict(), dHt = m.object({
        sessionId: Rn.optional(),
        workspace: rd,
        parentSessionId: Rn.optional(),
        mode: Nj.optional(),
        model: Pu.optional(),
        persistence: oHt.optional(),
        thoughtLevel: Rn.optional(),
        titleGenerationEnabled: m.boolean().optional(),
        mcpServers: m.array(Lpe).optional(),
        toolAllowlist: m.array(Rn).optional(),
        toolDenylist: m.array(Rn).optional(),
        importedHistory: Vor.optional(),
        offPeakToolEnabled: m.boolean().optional(),
        dynamicWorkflowEnabled: m.boolean().optional()
    }).strict(), pHt = m.object({
        sessionId: Rn,
        workspace: rd.optional(),
        thoughtLevel: Rn.optional(),
        mcpServers: m.array(Lpe).optional(),
        toolAllowlist: m.array(Rn).optional(),
        toolDenylist: m.array(Rn).optional(),
        offPeakToolEnabled: m.boolean().optional(),
        dynamicWorkflowEnabled: m.boolean().optional()
    }).strict(), fHt = m.object({
        workspace: rd.optional(),
        sessionIds: m.array(Rn).min(1).max(64).optional(),
        includeArchived: m.boolean().default(!1),
        limit: m.number().int().positive().optional()
    }).strict(), mHt = m.object({
        sessionId: Rn,
        endedCursor: Rn.optional(),
        endedLimit: m.number().int().positive().max(100).default(20)
    }).strict(), hHt = m.object({
        range: m.enum(Cpe),
        timeZone: m.string().optional()
    }).strict(), gBi = PZe, gHt = m.object({
        sessionId: Rn
    }).strict(), _Bi = m.object({
        sessionId: Rn,
        totalTokens: m.number().int().nonnegative(),
        inputTokens: m.number().int().nonnegative(),
        outputTokens: m.number().int().nonnegative(),
        reasoningTokens: m.number().int().nonnegative(),
        cacheCreationTokens: m.number().int().nonnegative(),
        cacheReadTokens: m.number().int().nonnegative(),
        modelRequestCount: m.number().int().nonnegative(),
        modelErrorCount: m.number().int().nonnegative(),
        inputBaselineBySource: m.record(m.string(), m.number().int().nonnegative())
    }).strict(), _Ht = m.object({
        sessionId: Rn,
        deliveryKind: fV.optional(),
        messageLimit: m.number().int().positive().optional(),
        afterSeq: m.number().int().nonnegative().optional()
    }).strict(), yHt = m.object({
        sessionId: Rn,
        afterMessageId: Rn.optional(),
        limit: m.number().int().positive().optional()
    }).strict(), vHt = m.object({
        sessionId: Rn,
        afterSeq: m.number().int().nonnegative().optional(),
        limit: m.number().int().positive().optional()
    }).strict(), Cir = m.enum(["runtime-materialization", "user-execution"]), bHt = 15e3, yBi = m.object({
        sessionId: Rn,
        scope: Cir
    }).strict(), FO = "preflight-v1", Eir = m.enum(["legacy", "preflight-v1"]), SHt = m.object({
        nativeSearchEnhancementsEnabled: m.boolean(),
        memoryEnabled: m.boolean().default(!1),
        askUserQuestionAutoResolutionEnabled: m.boolean().default(!0),
        integratedTerminalShell: FZe.optional(),
        modelContextBudgetStrategy: Eir.default(FO)
    }).strict(), eYe = m.object({
        tabCount: m.number().int().positive().max(100),
        currentUrl: m.string().trim().min(1).max(4096).optional()
    }).strict(), wHt = m.object({
        sessionId: Rn,
        modelSelection: Pu.optional(),
        modelExecution: AZe.optional(),
        inputId: Rn.optional(),
        queryId: Rn.optional(),
        content: m.string(),
        attachments: m.array(jx).optional(),
        browserAmbientContext: eYe.optional(),
        expectedRevision: m.number().int().nonnegative().optional(),
        expectedProviderRevision: Rn.optional(),
        automationId: Rn.optional(),
        offPeakTaskId: Rn.optional(),
        offPeakRunType: m.enum(["init", "resume"]).optional(),
        botDeliveryTarget: Ape.optional(),
        toolDenylist: m.array(Rn).optional()
    }).strict().superRefine((e, t) => {
        e.automationId && e.offPeakTaskId && t.addIssue({
            code: m.ZodIssueCode.custom,
            message: "automationId and offPeakTaskId are mutually exclusive"
        }), e.offPeakRunType && !e.offPeakTaskId && t.addIssue({
            code: m.ZodIssueCode.custom,
            message: "offPeakRunType requires offPeakTaskId",
            path: ["offPeakRunType"]
        }), e.modelExecution && !e.modelSelection && t.addIssue({
            code: m.ZodIssueCode.custom,
            message: "modelExecution requires modelSelection",
            path: ["modelExecution"]
        })
    }), vBi = m.object({
        sessionId: Rn,
        accepted: m.literal(!0),
        stateRevision: m.number().int().nonnegative()
    }).strict(), Air = m.discriminatedUnion("kind", [m.object({
        kind: m.literal("turn"),
        turnIndex: m.number().int().nonnegative()
    }).strict(), m.object({
        kind: m.literal("message"),
        messageId: Rn
    }).strict(), m.object({
        kind: m.literal("checkpoint"),
        checkpointId: Rn
    }).strict(), m.object({
        kind: m.literal("latestCheckpoint")
    }).strict()]), kHt = m.object({
        sessionId: Rn,
        target: Air.default({
            kind: "latestCheckpoint"
        }),
        expectedRevision: m.number().int().nonnegative().optional()
    }).strict(), bBi = m.object({
        forkedSessionId: Rn,
        parentSessionId: Rn.optional(),
        targetMessageId: Rn.optional(),
        targetCheckpointId: Rn.optional(),
        response: m.string(),
        snapshot: FAe
    }).strict(), xHt = m.object({
        sessionId: Rn,
        inputId: Rn.optional(),
        instructions: m.string().optional(),
        expectedRevision: m.number().int().nonnegative().optional()
    }).strict(), SBi = m.object({
        response: m.string(),
        snapshot: FAe,
        compact: m.object({
            state: m.enum(["accepted", "already_running"]),
            inputId: Rn.optional(),
            operationId: Rn.optional()
        }).strict().optional()
    }).strict(), Pir = m.enum(["show", "set", "replace", "pause", "resume", "clear"]), THt = m.object({
        sessionId: Rn,
        inputId: Rn.optional(),
        action: Pir,
        objective: m.string().optional(),
        expectedRevision: m.number().int().nonnegative().optional()
    }).strict(), wBi = m.object({
        response: m.string(),
        snapshot: FAe,
        startedTurn: m.boolean().optional()
    }).strict(), IHt = m.object({
        sessionId: Rn
    }).strict(), Rir = m.enum(["running", "completed", "failed", "timed_out", "cancelled", "spawn_error", "lost"]), Dir = m.object({
        taskId: Rn,
        toolCallId: Rn.optional(),
        toolName: Rn.optional(),
        taskKind: m.enum(["bash", "subagent"]).optional(),
        blocked: m.boolean().optional(),
        blockedReason: m.string().optional(),
        cancellable: m.boolean().optional(),
        cancelRequestedAt: qZe.optional(),
        command: m.string().optional(),
        description: m.string().optional(),
        status: Rir,
        pid: m.number().int().positive().optional(),
        startedAt: qZe.optional(),
        completedAt: qZe.optional(),
        outputPath: m.string().optional(),
        stderrPersistedOutputPath: m.string().optional(),
        stdoutPersistedOutputPath: m.string().optional(),
        outputBytes: m.number().int().nonnegative().optional(),
        outputTruncated: m.boolean().optional(),
        outputTail: m.string().optional(),
        stderrBytes: m.number().int().nonnegative().optional(),
        stderrTail: m.string().optional(),
        stdoutBytes: m.number().int().nonnegative().optional(),
        stdoutTail: m.string().optional(),
        terminalId: Rn.optional()
    }).strict(), CHt = m.object({
        sessionId: Rn,
        taskId: Rn
    }).strict(), kBi = m.object({
        cancelled: m.boolean(),
        reason: m.string().optional(),
        snapshot: Dir.optional(),
        status: Rir,
        taskId: Rn
    }).strict(), EHt = m.object({
        sessionId: Rn,
        model: Pu,
        expectedRevision: m.number().int().nonnegative().optional(),
        persistAsWorkspaceLastUsed: m.boolean().default(!0)
    }).strict(), AHt = m.object({
        sessionId: Rn,
        thoughtLevel: Rn.optional(),
        expectedRevision: m.number().int().nonnegative().optional(),
        persistAsWorkspaceLastUsed: m.boolean().default(!0)
    }).strict(), PHt = m.object({
        sessionId: Rn,
        mode: Nj,
        expectedRevision: m.number().int().nonnegative().optional()
    }).strict(), RHt = m.object({
        sessionId: Rn,
        expectedPersistence: oHt.optional()
    }).strict(), xBi = m.object({
        closed: m.boolean().optional()
    }).strict(), DHt = m.object({
        workspace: rd
    }).strict(), TBi = m.object({
        workspace: rd,
        mode: Nj,
        slashCommands: m.array(aHt)
    }).strict(), Aor = m.string().regex(/^[a-f0-9]{64}$/u), Mee = m.object({
        workspace: rd,
        bundleDigest: Aor,
        hookDeclarationDigest: Aor
    }).strict(), tYe = m.enum(["workspace_hooks_blocked_by_policy", "workspace_hooks_bundle_changed", "workspace_hooks_snapshot_mismatch", "workspace_hooks_policy_requires_pretrust", "workspace_hooks_trust_store_corrupt", "workspace_hooks_config_unreadable"]), Bpe = m.object({
        accepted: m.boolean(),
        reasonCode: tYe.optional()
    }).strict(), Oir = m.object({
        id: Rn,
        name: Rn,
        input: m.unknown()
    }).strict(), IBi = m.discriminatedUnion("role", [m.object({
        role: m.literal("system"),
        content: m.string()
    }).strict(), m.object({
        role: m.literal("user"),
        content: m.string()
    }).strict(), m.object({
        role: m.literal("assistant"),
        content: m.string(),
        toolCalls: m.array(Oir).optional()
    }).strict(), m.object({
        role: m.literal("tool"),
        content: m.string(),
        toolCallId: Rn,
        toolName: Rn,
        isError: m.boolean().optional()
    }).strict()]), CBi = m.object({
        name: Rn,
        description: m.string().optional(),
        inputSchema: m.record(m.string(), m.unknown())
    }).strict(), OHt = m.object({
        workspace: rd,
        selection: Pu,
        prompt: Rn.optional(),
        messages: m.array(IBi).min(1).optional(),
        tools: m.array(CBi).optional(),
        querySource: Rn,
        maxOutputTokens: m.number().int().positive().optional(),
        operationId: Rn.optional()
    }).strict().refine(e => e.prompt !== void 0 || e.messages !== void 0, {
        message: "prompt \u6216 messages \u81F3\u5C11\u9700\u8981\u63D0\u4F9B\u4E00\u4E2A"
    }), EBi = m.object({
        text: m.string(),
        selection: Pu,
        toolCalls: m.array(Oir).optional(),
        finishReason: m.string().optional(),
        usage: m.object({
            inputTokens: m.number().nonnegative().optional(),
            outputTokens: m.number().nonnegative().optional(),
            totalTokens: m.number().nonnegative().optional(),
            cacheReadTokens: m.number().nonnegative().optional(),
            cacheWriteTokens: m.number().nonnegative().optional(),
            reasoningTokens: m.number().nonnegative().optional(),
            serverToolUse: m.object({
                webSearchRequests: m.number().nonnegative().optional(),
                webFetchRequests: m.number().nonnegative().optional()
            }).strict().optional()
        }).strict().optional()
    }).strict(), MHt = m.object({
        operationId: Rn
    }).strict(), ABi = m.object({
        operationId: Rn,
        cancelled: m.boolean()
    }).strict(), NHt = m.object({
        workspace: rd,
        selection: Pu
    }).strict(), PBi = m.object({
        success: m.literal(!0)
    }).strict(), LHt = m.object({
        revision: Rn,
        basedOnZCodeBuiltinRevision: Rn,
        providers: m.record(m.string(), m.unknown()),
        states: m.record(m.string(), m.object({
            availability: m.enum(["available", "pending", "unavailable", "unknown"]),
            entitled: m.boolean(),
            unavailableReason: SVt.optional(),
            current: m.boolean().optional(),
            connectionKey: m.string().optional(),
            effectiveAt: m.number().finite().optional()
        }).strict())
    }).strict(), RBi = m.object({
        receivedRevision: Rn,
        providerCount: m.number().int().nonnegative(),
        status: m.enum(["received", "unchanged"])
    }).strict(), Mir = m.object({
        askUserQuestionAutoResolutionEnabled: m.boolean()
    }).strict(), FHt = m.object({
        workspace: rd,
        preferences: Mir
    }).strict(), DBi = m.object({
        workspace: rd,
        askUserQuestionAutoResolutionEnabled: m.boolean(),
        snoozedInteractionCount: m.number().int().nonnegative()
    }).strict(), Nir = m.object({
        fullRetentionEnabled: m.boolean()
    }).strict(), jHt = m.object({
        workspace: rd,
        preferences: Nir
    }).strict(), OBi = m.object({
        workspace: rd,
        fullRetentionEnabled: m.boolean(),
        updatedSessionCount: m.number().int().nonnegative()
    }).strict(), BHt = m.object({
        workspace: rd,
        enabled: m.boolean()
    }).strict(), MBi = m.object({
        workspace: rd,
        enabled: m.boolean()
    }).strict(), UHt = m.object({
        workspace: rd,
        enabled: m.boolean()
    }).strict(), NBi = m.object({
        workspace: rd,
        enabled: m.boolean()
    }).strict(), LBi = m.object({
        requestId: Rn,
        sessionId: Rn,
        turnId: Rn.optional(),
        toolCallId: Rn,
        toolName: Rn,
        reason: m.string(),
        riskLevel: m.enum(["low", "medium", "high", "critical"]),
        input: m.unknown(),
        origin: BL.optional(),
        options: m.array(XZe).min(1)
    }).strict(), Lir = m.object({
        requestId: Rn,
        sessionId: Rn,
        turnId: Rn.optional(),
        workspaceKey: Rn,
        workspacePath: Rn,
        workspaceIdentity: Rn.optional(),
        remoteSessionId: Rn.optional(),
        clientMode: pV,
        sessionContext: pAe
    }).strict(), nYe = wWt, Fir = m.object({
        requestId: Rn,
        sessionId: Rn,
        turnId: Rn.optional(),
        browserId: Rn.optional(),
        browserGeneration: m.number().int().nonnegative().optional(),
        workspaceKey: Rn.optional(),
        workspacePath: Rn.optional(),
        workspaceIdentity: Rn.optional(),
        remoteSessionId: Rn.optional(),
        clientMode: pV.optional(),
        sessionContext: pAe.optional(),
        command: gee
    }).strict(), Upe = yee, jir = m.object({
        value: Rn,
        label: Rn,
        description: m.string().optional(),
        preview: m.string().optional()
    }).strict(), Bir = m.object({
        question: Rn,
        header: Rn,
        options: m.array(jir).min(1),
        multiSelect: m.boolean().optional()
    }).strict(), FBi = m.object({
        requestId: Rn,
        sessionId: Rn,
        turnId: Rn.optional(),
        toolCallId: Rn.optional(),
        toolName: Rn.optional(),
        prompt: m.string().optional(),
        questions: m.array(Bir).min(1).optional(),
        input: m.unknown().optional(),
        origin: BL.optional(),
        schema: m.unknown().optional()
    }).strict(), rYe = m.object({
        action: m.enum(["accept", "decline", "cancel"]),
        content: jx.optional(),
        reason: m.string().optional()
    }).strict(), Uir = m.enum(["model-request", "captcha-retry"]), jBi = m.object({
        requestId: Rn,
        sessionId: Rn,
        turnId: Rn.optional(),
        workspace: rd,
        modelSelection: Pu,
        providerId: Rn,
        accountAccess: Kor.optional(),
        reason: Uir
    }).strict(), BBi = m.object({
        requestId: Rn,
        sessionId: Rn,
        workspace: rd
    }).strict(), zHt = m.discriminatedUnion("headersApplied", [m.object({
        headersApplied: m.literal(!0),
        requestAuth: m.object({
            apiKey: Rn.optional(),
            headers: m.record(Rn, Rn).optional()
        }).strict(),
        errorMessage: Rn.optional()
    }).strict(), m.object({
        headersApplied: m.literal(!1),
        errorMessage: Rn.optional()
    }).strict()]), UBi = m.object({
        requestId: Rn,
        workspace: rd,
        pluginId: Rn,
        mcpKey: Rn,
        targetOrigin: Rn
    }).strict(), zir = m.enum(BVt), $Ht = m.discriminatedUnion("ok", [m.object({
        ok: m.literal(!0),
        headers: m.record(m.string(), m.string())
    }).strict(), m.object({
        ok: m.literal(!1),
        reason: zir
    }).strict()]), qHt = m.union([m.string(), m.number(), m.boolean()]), zL = m.enum(["user", "workspace"]), WHt = m.object({
        event: Rn,
        matcher: m.string().optional(),
        type: m.enum(["command", "process"]),
        command: Rn,
        args: m.array(m.string()).optional(),
        async: m.boolean().optional(),
        shell: m.union([m.literal(!0), m.string()]).optional(),
        timeout: m.number().positive().optional(),
        timeoutMs: m.number().int().positive().optional(),
        statusMessage: m.string().optional(),
        sourcePath: m.string(),
        runnable: m.boolean()
    }).strict(), $ir = m.object({
        default: qHt.optional(),
        description: m.string().optional(),
        required: m.boolean().optional(),
        sensitive: m.boolean().optional(),
        title: m.string().optional(),
        type: m.enum(["string", "number", "boolean", "directory", "file"]).optional()
    }).strict(), qir = m.enum(["agent", "command", "skill", "hook", "mcp"]), Wir = m.object({
        name: Rn,
        description: m.string().optional()
    }).strict(), VHt = m.object({
        kind: qir,
        items: m.array(Wir)
    }).strict(), HHt = m.object({
        id: Rn,
        name: Rn,
        description: m.string().optional(),
        version: m.string().optional(),
        enabled: m.boolean(),
        source: Rn,
        marketplace: Rn,
        author: m.string().optional(),
        authorUrl: m.string().optional(),
        homepage: m.string().optional(),
        skillCount: m.number().int().nonnegative().optional(),
        skillRootCount: m.number().int().nonnegative(),
        commandRootCount: m.number().int().nonnegative(),
        components: m.array(VHt).optional(),
        declaredMcpServerNames: m.array(m.string()).optional(),
        hostMcpServerNames: m.array(m.string()).optional(),
        mcpServerNames: m.array(m.string()),
        hookDetails: m.array(WHt).optional(),
        rootPath: m.string(),
        userConfig: m.record(m.string(), $ir).optional(),
        configuredOptions: m.record(m.string(), qHt).optional(),
        packageStatus: m.literal("missing").optional(),
        rootSource: zL.optional(),
        enabledSource: zL.optional(),
        optionSources: m.record(m.string(), zL).optional()
    }).strict(), $L = m.object({
        code: m.string(),
        message: m.string(),
        severity: m.enum(["warning", "error"]).optional(),
        pluginId: m.string().optional()
    }).strict(), GHt = m.object({
        workspace: rd,
        configScope: zL.optional()
    }).strict(), zBi = m.object({
        plugins: m.array(HHt),
        diagnostics: m.array($L)
    }).strict(), Vir = m.object({
        category: Rn.optional(),
        pluginId: Rn,
        name: Rn,
        marketplace: Rn,
        icon: m.string().optional(),
        displayName: m.string().optional(),
        displayNameI18n: m.record(m.string(), m.string()).optional(),
        description: m.string().optional(),
        descriptionI18n: m.record(m.string(), m.string()).optional(),
        enabled: m.boolean(),
        conflictingPluginIds: m.array(Rn),
        skillQualifiedNames: m.array(Rn),
        mcpServerNames: m.array(Rn),
        subagentNames: m.array(Rn).default([])
    }).strict(), JHt = m.object({
        workspace: rd,
        sessionId: Rn.optional()
    }).strict(), $Bi = m.object({
        authority: m.enum(["session", "workspace"]),
        plugins: m.array(Vir)
    }).strict(), Hir = m.object({
        id: Rn,
        name: Rn,
        description: m.string(),
        path: Rn,
        scope: m.enum(["workspace", "user", "plugin"]),
        enabled: m.literal(!0),
        pluginName: Rn.optional()
    }).strict(), KHt = m.object({
        workspace: rd,
        sessionId: Rn.optional()
    }).strict(), qBi = m.object({
        authority: m.enum(["session", "workspace"]),
        skills: m.array(Hir)
    }).strict(), Gir = m.enum(["string", "number", "boolean", "json"]), Jir = m.object({
        type: Gir,
        description: m.string().optional(),
        required: m.boolean().optional(),
        default: m.unknown().optional()
    }).strict(), ZHt = m.record(m.string(), Jir), YHt = m.object({
        description: Rn,
        whenToUse: Rn.optional(),
        args: ZHt.optional()
    }).strict(), _V = m.enum(["project", "global"]), Kir = m.object({
        name: Rn,
        description: m.string(),
        whenToUse: m.string().optional(),
        args: ZHt.optional(),
        scope: _V,
        path: Rn
    }).strict(), Zir = m.object({
        path: Rn,
        reason: Rn
    }).strict(), Yir = m.enum(["invalid_name", "not_found", "parse_error", "read_error"]), XHt = m.object({
        ok: m.literal(!1),
        reason: Yir,
        detail: m.string().optional()
    }).strict(), QHt = m.object({
        workspace: rd,
        scope: _V.optional()
    }).strict(), WBi = m.object({
        workflows: m.array(Kir),
        invalid: m.array(Zir),
        dir: Rn
    }).strict(), eGt = m.object({
        workspace: rd,
        name: Rn,
        scope: _V.optional()
    }).strict(), VBi = m.union([m.object({
        ok: m.literal(!0),
        name: Rn,
        path: Rn,
        scope: _V,
        meta: YHt,
        script: m.string()
    }).strict(), XHt]), tGt = m.object({
        workspace: rd,
        name: Rn,
        meta: YHt,
        scope: _V.optional()
    }).strict(), HBi = m.union([m.object({
        ok: m.literal(!0),
        path: Rn
    }).strict(), XHt]), nGt = m.object({
        workspace: rd,
        name: Rn,
        scope: _V.optional()
    }).strict(), GBi = m.union([m.object({
        ok: m.literal(!0),
        path: Rn
    }).strict(), XHt]), oYe = 50, rGt = m.object({
        workspace: rd,
        name: Rn.optional(),
        limit: m.number().int().min(1).max(oYe),
        scope: _V.optional()
    }).strict(), Xir = m.enum(["pending", "running", "completed", "errored", "stopped"]), Qir = m.enum(["user", "model", "provider", "interrupted", "superseded"]), esr = m.object({
        runId: Rn,
        name: m.string().optional(),
        status: Xir,
        stopReason: Qir.optional(),
        createdAt: m.number(),
        updatedAt: m.number(),
        spentTokens: m.number(),
        parentSessionId: m.string().optional(),
        toolCallId: m.string().optional(),
        args: m.record(m.string(), m.unknown()).optional(),
        cwd: m.string().optional(),
        artifacts: m.array(m.object({
            id: Rn,
            kind: m.enum(["file", "markdown", "chart", "table", "metrics", "board"]),
            title: m.string().optional(),
            version: m.number(),
            contentType: m.string().optional()
        }).strict()).max(8).optional()
    }).strict(), JBi = m.object({
        runs: m.array(esr),
        truncated: m.literal(!0).optional()
    }).strict(), oGt = m.object({
        workspace: rd,
        name: Rn
    }).strict(), KBi = m.union([m.object({
        ok: m.literal(!0),
        from: Rn,
        to: Rn
    }).strict(), m.object({
        ok: m.literal(!1),
        reason: m.enum(["invalid_name", "not_found", "target_exists", "read_error", "write_error"]),
        path: m.string().optional(),
        detail: m.string().optional()
    }).strict()]), tsr = m.enum(["ready", "disabled", "missing", "conflict", "unavailable"]), ZBi = m.enum(["checking", "refreshing", "installing", "enabling", "cancelling", "cancelled", "complete", "failed"]), YBi = m.object({
        operationId: Rn,
        state: m.literal("refreshing")
    }).strict(), iGt = m.object({
        workspace: rd,
        stableId: Rn,
        operationId: Rn,
        clientMode: fV,
        deliveryKind: fV
    }).strict(), sGt = m.object({
        workspace: rd,
        pluginId: Rn,
        enabled: m.boolean(),
        operationId: Rn.optional(),
        scope: zL.optional()
    }).strict(), XBi = m.object({
        plugin: HHt,
        enabled: m.boolean()
    }).strict(), iYe = m.object({
        displayName: m.string().optional(),
        displayNameI18n: m.record(m.string(), m.string()).optional(),
        descriptionI18n: m.record(m.string(), m.string()).optional(),
        icon: m.string().optional(),
        category: m.string().optional(),
        author: m.string().optional(),
        authorUrl: m.string().optional(),
        homepage: m.string().optional(),
        privacyPolicy: m.string().optional(),
        termsOfService: m.string().optional(),
        heroImage: m.string().optional(),
        examplePrompts: m.array(m.string()).optional(),
        examplePromptsI18n: m.record(m.string(), m.array(m.string())).optional(),
        requiresPaidPlan: m.boolean().optional()
    }).strict(), QBi = m.object({
        stableId: Rn,
        status: tsr,
        marketplace: Rn.optional(),
        pluginName: Rn.optional(),
        sourceTrust: m.literal("official").optional(),
        icon: m.string().optional(),
        listing: iYe.optional(),
        diagnostics: m.array($L)
    }).strict().superRefine((e, t) => {
        e.status !== "ready" && e.status !== "disabled" && e.status !== "missing" || (!e.marketplace || !e.pluginName || e.sourceTrust !== "official") && t.addIssue({
            code: "custom",
            message: "actionable suggested Plugin results require trusted install identity"
        })
    }), VZe = m.object({
        id: Rn,
        name: Rn,
        source: jx,
        description: m.string().optional(),
        lastUpdated: m.string().optional(),
        pluginCount: m.number().int().nonnegative(),
        isOfficial: m.boolean().optional(),
        featured: m.array(m.string()).optional(),
        refreshFailure: m.object({
            code: m.string(),
            failedAt: m.string(),
            message: m.string()
        }).strict().optional()
    }).strict(), ZVt = m.object({
        id: Rn,
        name: Rn,
        marketplace: Rn,
        description: m.string().optional(),
        version: m.string().optional(),
        installed: m.boolean(),
        componentTypes: m.array(m.string()).optional(),
        listing: iYe.optional()
    }).strict(), sYe = m.object({
        id: Rn,
        name: Rn,
        marketplace: Rn,
        description: m.string().optional(),
        version: m.string().optional(),
        enabled: m.boolean(),
        scope: zL,
        installPath: m.string().optional(),
        installedAt: m.string().optional(),
        componentTypes: m.array(m.string()).optional(),
        hookDetails: m.array(WHt).optional(),
        updateStatus: m.enum(["none", "update-available", "version-changed"]).optional(),
        latestVersion: m.string().optional(),
        listing: iYe.optional()
    }).strict(), aGt = m.object({
        workspace: rd,
        configScope: zL.optional()
    }).strict(), e8i = m.object({
        marketplaces: m.array(VZe),
        availablePlugins: m.array(ZVt),
        installedPlugins: m.array(sYe),
        restorableBuiltins: m.array(ZVt),
        diagnostics: m.array($L),
        capability: m.object({
            supported: m.boolean(),
            reason: m.string().optional()
        }).strict()
    }).strict(), cGt = m.object({
        workspace: rd,
        source: Rn,
        dryRun: m.boolean().optional(),
        operationId: Rn.optional()
    }).strict(), lGt = m.object({
        workspace: rd,
        marketplace: Rn
    }).strict(), uGt = m.object({
        workspace: rd,
        marketplace: Rn.optional(),
        operationId: Rn.optional()
    }).strict(), t8i = m.object({
        marketplace: VZe.optional(),
        marketplaces: m.array(VZe).optional(),
        diagnostics: m.array($L).optional()
    }).strict(), dGt = m.object({
        workspace: rd,
        pluginName: Rn,
        marketplace: Rn,
        scope: zL.optional(),
        dryRun: m.boolean().optional(),
        operationId: Rn.optional()
    }).strict(), pGt = m.object({
        operationId: Rn
    }).strict(), n8i = m.object({
        operationId: Rn,
        cancelled: m.boolean()
    }).strict(), fGt = m.object({
        workspace: rd,
        pluginId: Rn.optional(),
        pluginName: Rn.optional(),
        marketplace: Rn.optional(),
        removeCache: m.boolean().optional()
    }).strict(), r8i = m.object({
        installedPlugins: m.array(sYe),
        dependencyClosure: m.array(m.string()),
        diagnostics: m.array($L)
    }).strict(), o8i = m.object({
        removedPlugin: sYe.optional(),
        diagnostics: m.array($L)
    }).strict(), mGt = m.object({
        workspace: rd,
        pluginId: Rn.optional(),
        marketplace: Rn.optional()
    }).strict(), hGt = m.object({
        workspace: rd,
        pluginId: Rn
    }).strict(), i8i = m.object({
        pluginId: Rn,
        diagnostics: m.array($L)
    }).strict(), gGt = m.object({
        workspace: rd,
        pluginId: Rn,
        options: jx,
        clearOptionKeys: m.array(Rn).optional(),
        scope: zL.optional(),
        dryRun: m.boolean().optional()
    }).strict(), s8i = m.object({
        pluginId: Rn,
        diagnostics: m.array($L)
    }).strict(), _Gt = m.object({
        workspace: rd,
        pluginId: Rn,
        scope: zL.optional()
    }).strict(), yGt = m.object({
        workspace: rd,
        pluginName: Rn.optional(),
        marketplace: Rn.optional(),
        source: Rn.optional()
    }).strict(), a8i = m.object({
        ok: m.boolean(),
        diagnostics: m.array($L),
        compatibility: m.object({
            runnable: m.array(m.string()),
            diagnosticOnly: m.array(m.string()),
            unsupported: m.array(m.string())
        }).strict()
    }).strict(), vGt = m.object({
        workspace: rd,
        pluginName: Rn,
        marketplace: Rn
    }).strict(), c8i = m.object({
        components: m.array(VHt),
        diagnostics: m.array($L).optional(),
        metadata: m.object({
            author: m.string().optional(),
            authorUrl: m.string().optional(),
            homepage: m.string().optional(),
            version: m.string().optional()
        }).strict().optional()
    }).strict(), nsr = m.object({
        unit: m.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
        interval: m.number().int().positive(),
        hour: m.number().int().min(0).max(23),
        minute: m.number().int().min(0).max(59),
        anchorAt: m.number().int(),
        weekdays: m.array(m.number().int().min(0).max(6)).optional(),
        monthDays: m.array(m.number().int().min(1).max(31)).optional(),
        months: m.array(m.number().int().min(1).max(12)).optional(),
        monthlyMode: m.enum(["date", "weekday"]).optional()
    }).strict(), bGt = m.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]), aYe = m.object({
        automationId: Rn,
        title: m.string(),
        cronExpr: Rn,
        prompt: Rn,
        modelSelection: Pu.optional(),
        mode: Ree.optional(),
        targetTaskId: Rn.optional(),
        enabled: m.boolean(),
        lifecycleStatus: m.enum(["active", "completed", "failed", "paused"]),
        nextRunAt: DR.optional(),
        lastRunAt: DR.optional(),
        runCount: m.number().int().nonnegative(),
        recurring: m.boolean(),
        maxRuns: m.number().int().positive().optional(),
        scheduleRule: nsr.optional()
    }).strict(), l8i = m.object({
        title: m.string().optional(),
        cronExpr: Rn,
        relativeDelayMinutes: m.number().int().positive().max(525600).optional(),
        prompt: Rn,
        modelSelection: Pu.optional(),
        mode: Ree.optional(),
        targetTaskId: Rn.optional(),
        botDeliveryTarget: Ape.optional(),
        recurring: m.boolean().optional(),
        maxRuns: m.number().int().positive().optional(),
        intervalUnit: bGt.optional(),
        interval: m.number().int().min(1).max(200).optional()
    }).strict().refine(e => e.intervalUnit === void 0 == (e.interval === void 0), {
        message: "intervalUnit and interval must be set together",
        path: ["interval"]
    }).refine(e => e.intervalUnit === void 0 || e.relativeDelayMinutes === void 0, {
        message: "intervalUnit cannot combine with a relative delayMinutes",
        path: ["intervalUnit"]
    }).refine(e => e.intervalUnit === void 0 || e.recurring !== !1, {
        message: "intervalUnit is a recurring carrier and cannot combine with recurring=false",
        path: ["recurring"]
    }).refine(e => e.intervalUnit === void 0 || e.maxRuns === void 0, {
        message: "intervalUnit is a recurring carrier and cannot combine with maxRuns",
        path: ["maxRuns"]
    }), SGt = m.object({
        automation: aYe
    }).strict(), u8i = m.object({
        automationId: Rn,
        title: Rn.optional(),
        cronExpr: Rn.optional(),
        prompt: Rn.optional(),
        recurring: m.boolean().optional(),
        maxRuns: m.number().int().positive().nullable().optional(),
        intervalUnit: bGt.optional(),
        interval: m.number().int().min(1).max(200).optional()
    }).strict().refine(e => e.title !== void 0 || e.cronExpr !== void 0 || e.prompt !== void 0 || e.recurring !== void 0 || e.maxRuns !== void 0 || e.intervalUnit !== void 0, {
        message: "automation update requires at least one field"
    }).refine(e => e.maxRuns !== null || e.recurring === !0, {
        message: "clearing maxRuns requires recurring=true",
        path: ["maxRuns"]
    }).refine(e => e.recurring !== !0 || typeof e.maxRuns != "number", {
        message: "recurring=true cannot be combined with a numeric maxRuns",
        path: ["maxRuns"]
    }).refine(e => e.intervalUnit === void 0 == (e.interval === void 0), {
        message: "intervalUnit and interval must be set together",
        path: ["interval"]
    }).refine(e => e.intervalUnit === void 0 || e.recurring !== !1, {
        message: "intervalUnit is a recurring carrier and cannot combine with recurring=false",
        path: ["recurring"]
    }).refine(e => e.intervalUnit === void 0 || e.maxRuns === void 0 || e.maxRuns === null && e.recurring === !0, {
        message: "intervalUnit is a recurring carrier and only allows maxRuns=null with recurring=true",
        path: ["maxRuns"]
    }), wGt = m.object({
        automation: aYe
    }).strict(), d8i = m.object({}).strict(), cYe = m.object({
        automations: m.array(aYe)
    }).strict(), p8i = m.object({
        targetTaskId: Rn
    }).strict(), kGt = m.object({
        bound: m.boolean()
    }).strict(), f8i = m.object({
        automationId: Rn
    }).strict(), xGt = m.object({
        deleted: m.boolean()
    }).strict(), rsr = m.enum(["build", "edit", "plan", "yolo"]), m8i = m.object({
        title: Rn,
        prompt: Rn,
        permissionMode: rsr.optional(),
        model: Rn.optional(),
        thoughtLevel: Rn.optional(),
        boundSessionId: Rn.optional()
    }).strict(), TGt = m.object({
        offPeakTaskId: Rn,
        title: m.string(),
        status: m.enum(["queued", "paused", "running", "completed", "failed", "cancelled"]),
        queuePosition: m.number().int().positive().optional(),
        sessionId: Rn.optional(),
        createdAt: m.number().int().nonnegative()
    }).strict(), IGt = m.discriminatedUnion("ok", [m.object({
        ok: m.literal(!0),
        task: TGt
    }).strict(), m.object({
        ok: m.literal(!1),
        failureStage: m.enum(["client_validation", "ticket_request", "local_persist"]),
        errorCategory: m.enum(["client_validation", "eligibility_3101", "quota_3103", "network", "invalid_response", "local_persist", "unknown"]),
        errorCode: m.string()
    }).strict()]), h8i = m.object({}).strict(), lYe = m.object({
        tasks: m.array(TGt)
    }).strict(), va = {
        runtimeCapabilities: "runtime/capabilities",
        computerUseOperationEvent: "computer-use/operation-event",
        sessionCreate: "session/create",
        sessionResume: "session/resume",
        sessionList: "session/list",
        sessionSubagents: "session/subagents",
        sessionRequestRuntimePreferences: "session/requestRuntimePreferences",
        sessionRead: "session/read",
        sessionMessages: "session/messages",
        sessionEvents: "session/events",
        sessionDebug: "session/debug",
        sessionSubscribe: "session/subscribe",
        sessionSend: "session/send",
        sessionStop: "session/stop",
        sessionCancelBackgroundTask: "session/cancelBackgroundTask",
        sessionFork: "session/fork",
        sessionCompact: "session/compact",
        sessionGoal: "session/goal",
        sessionClose: "session/close",
        sessionSetModel: "session/setModel",
        sessionSetThoughtLevel: "session/setThoughtLevel",
        sessionSetMode: "session/setMode",
        workspaceReadPresentation: "workspace/readPresentation",
        workspaceHookTrustGrant: "workspace/hooks/trustGrant",
        providerUpdateAccountConfig: "provider/updateAccountConfig",
        workspaceUpdateInteractionPreferences: "workspace/updateInteractionPreferences",
        workspaceUpdateModelIoPreferences: "workspace/updateModelIoPreferences",
        workspaceUpdateOffPeakToolPolicy: "workspace/updateOffPeakToolPolicy",
        workspaceUpdateDynamicWorkflowPolicy: "workspace/updateDynamicWorkflowPolicy",
        workspaceGenerateText: "workspace/generateText",
        workspaceCancelGenerateText: "workspace/cancelGenerateText",
        providerTestModelConnectivity: "provider/testModelConnectivity",
        mcpList: "mcp/list",
        pluginsList: "plugins/list",
        pluginsReferenceCatalog: "plugins/referenceCatalog",
        pluginsReferenceCatalogWithCategory: "plugins/referenceCatalogWithCategory",
        skillsReferenceCatalog: "skills/referenceCatalog",
        workflowsList: "workflows/list",
        workflowsGet: "workflows/get",
        workflowsUpdateMeta: "workflows/updateMeta",
        workflowsDelete: "workflows/delete",
        workflowsRuns: "workflows/runs",
        workflowsMove: "workflows/move",
        pluginsResolveSuggestedReference: "plugins/resolveSuggestedReference",
        pluginsSetEnabled: "plugins/setEnabled",
        pluginsOverview: "plugins/overview",
        pluginsMarketplaceAdd: "plugins/marketplace/add",
        pluginsMarketplaceRemove: "plugins/marketplace/remove",
        pluginsMarketplaceUpdate: "plugins/marketplace/update",
        pluginsInstall: "plugins/install",
        pluginsCancelOperation: "plugins/cancelOperation",
        pluginsUninstall: "plugins/uninstall",
        pluginsUpdate: "plugins/update",
        pluginsRestoreBuiltin: "plugins/restoreBuiltin",
        pluginsConfigure: "plugins/configure",
        pluginsResetConfig: "plugins/resetConfig",
        pluginsValidate: "plugins/validate",
        pluginsDescribe: "plugins/describe",
        automationCreate: "automation/create",
        automationUpdate: "automation/update",
        automationCheckTaskBinding: "automation/checkTaskBinding",
        automationList: "automation/list",
        automationDelete: "automation/delete",
        offPeakCreate: "offPeak/create",
        offPeakList: "offPeak/list",
        usageStats: "usage/stats",
        sessionUsage: "session/usage",
        processChildProcesses: "process/childProcesses",
        interactionRequestPermission: "interaction/requestPermission",
        interactionRequestUserInput: "interaction/requestUserInput",
        interactionRequestProviderRuntimeHeaders: "interaction/requestProviderRuntimeHeaders",
        interactionRequestOfficialMcpAuthHeaders: "interaction/requestOfficialMcpAuthHeaders",
        interactionBrowserList: "interaction/browserList",
        interactionBrowserExecute: "interaction/browserExecute"
    }, g8i = m.object({}).strict(), _8i = {
        [va.workspaceHookTrustGrant]: {
            params: Mee,
            result: Bpe
        },
        [va.mcpList]: {
            params: QZe,
            result: Fpe
        },
        [va.interactionBrowserList]: {
            params: Lir,
            result: nYe
        },
        [va.interactionBrowserExecute]: {
            params: Fir,
            result: Upe
        }
    }, y8i = m.discriminatedUnion("method", [m.object({
        method: m.literal("startup/storagePath"),
        params: m.object({
            path: m.string().min(1).max(32768)
        }).strict()
    }).strict(), m.object({
        method: m.literal("startup/storagePrepared"),
        params: m.object({}).strict()
    }).strict(), m.object({
        method: m.literal("startup/storageState"),
        params: KZe
    }).strict()]), v8i = m.object({
        method: m.literal("startup/storagePathReady"),
        reuse: m.boolean().optional()
    }).strict()
});

function isr(e) {
    return e === "pending" || e === "running"
}

function k8i(e) {
    return e.phase === "executing" || e.phase === "repairing" || e.phase === "nudged"
}

function x8i(e, t) {
    return e === t || e.length >= Yc.maxPhaseNameLength && t.startsWith(e)
}

function T8i(e) {
    let t = new Set((e.phases ?? []).map(f => f.name)),
        n = e.currentPhase,
        o, s;
    e.phaseNames !== void 0 && e.phaseNames.length > 0 ? (o = e.phaseNames, s = e.phaseAlongside) : (o = (e.phases ?? []).map(f => f.name), n !== void 0 && !t.has(n) && (o = [...o, n]));
    let a = isr(e.status),
        l = a ? e.nodes.filter(k8i).flatMap(f => f.phaseName ?? []) : [],
        u = Math.min(o.length, Yc.maxPhases);
    return o.slice(0, Yc.maxPhases).map((f, g) => {
        let _ = f === n,
            b = t.has(f) || _,
            w = l.some(A => x8i(f, A)),
            T;
        a ? T = _ || w ? "running" : b ? "done" : "pending" : e.status === "completed" ? T = b ? "done" : "pending" : e.status === "errored" ? T = _ ? "failed" : b ? "done" : "pending" : T = _ ? "pending" : b ? "done" : "pending";
        let I = (s?.[g] ?? []).filter(A => Number.isInteger(A) && A >= 0 && A < u && A !== g);
        return {
            name: f,
            status: T,
            ...I.length === 0 ? {} : {
                alongside: I
            }
        }
    })
}

function I8i(e, t) {
    let n = t?.title.trim();
    return {
        runId: e.runId,
        ...e.toolCallId === void 0 ? {} : {
            toolCallId: e.toolCallId
        },
        ...n === void 0 || n.length === 0 ? {} : {
            name: n
        },
        status: e.status,
        ...e.stopReason === void 0 ? {} : {
            stopReason: e.stopReason
        },
        ...t === void 0 ? {} : {
            startedAt: t.startedAt
        },
        phases: T8i(e),
        ...e.currentPhase === void 0 ? {} : {
            currentPhase: e.currentPhase
        },
        agentsWorking: e.actors.filter(o => o.status === "running").length
    }
}

function ssr(e) {
    let t = e.workflowRuns?.runs;
    if (t === void 0 || t.length === 0) return;
    let n = new Map;
    for (let a of e.backgroundWorks) a.kind === "workflow" && n.set(a.workId, a);
    let o = [],
        s = [];
    return t.forEach((a, l) => {
        let u = n.get(a.runId),
            f = I8i(a, u);
        isr(a.status) ? o.push(f) : s.push({
            summary: f,
            endedAt: u?.endedAt ?? 0,
            index: l
        })
    }), s.sort((a, l) => l.endedAt - a.endedAt || l.index - a.index), {
        runs: [...o, ...s.map(a => a.summary)].slice(0, osr)
    }
}
var osr, b8i, S8i, w8i, zpe, jAe = Y(() => {
    Fa();
    xb();
    NO();
    osr = 4, b8i = m.enum(["pending", "running", "done", "failed"]), S8i = m.object({
        name: m.string().min(1).max(Yc.maxPhaseNameLength),
        status: b8i,
        alongside: m.array(m.number().int().nonnegative()).max(Yc.maxPhases).optional()
    }), w8i = m.object({
        runId: m.string().min(1),
        toolCallId: m.string().min(1).optional(),
        name: m.string().min(1).optional(),
        status: kZe.shape.status,
        stopReason: kZe.shape.stopReason,
        startedAt: pu.optional(),
        phases: m.array(S8i).max(Yc.maxPhases),
        currentPhase: m.string().min(1).max(Yc.maxPhaseNameLength).optional(),
        agentsWorking: m.number().int().nonnegative()
    }), zpe = m.object({
        runs: m.array(w8i).max(osr)
    });
    r(isr, "isSessionWorkflowRunLive");
    r(k8i, "isRunNodeRunning");
    r(x8i, "phaseNameMatches");
    r(T8i, "derivePhases");
    r(I8i, "summarizeRun");
    r(ssr, "deriveSessionWorkflowActivity")
});

function vV(e) {
    let t = 4294967295;
    for (let n of e) {
        t ^= n;
        for (let o = 0; o < 8; o += 1) t = t >>> 1 ^ (t & 1 ? 3988292384 : 0)
    }
    return ((t ^ 4294967295) >>> 0).toString(16).padStart(8, "0")
}

function BAe(e) {
    let t = "",
        n = [];
    for (let o = 0; o < e.byteLength; o += 3) {
        let s = e[o] ?? 0,
            a = o + 1 < e.byteLength,
            l = o + 2 < e.byteLength,
            u = a ? e[o + 1] ?? 0 : 0,
            f = l ? e[o + 2] ?? 0 : 0;
        n.push(yV[s >>> 2], yV[(s & 3) << 4 | u >>> 4], a ? yV[(u & 15) << 2 | f >>> 6] : "=", l ? yV[f & 63] : "="), n.length >= 16384 && (t += n.join(""), n = [])
    }
    return t + n.join("")
}

function UAe(e) {
    if (!CGt.safeParse(e).success) return null;
    let t = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0,
        n = new Uint8Array(e.length / 4 * 3 - t),
        o = 0;
    for (let s = 0; s < e.length; s += 4) {
        let a = yV.indexOf(e[s]),
            l = yV.indexOf(e[s + 1]),
            u = e[s + 2] === "=" ? 0 : yV.indexOf(e[s + 2]),
            f = e[s + 3] === "=" ? 0 : yV.indexOf(e[s + 3]);
        if (a < 0 || l < 0 || u < 0 || f < 0) return null;
        let g = a << 18 | l << 12 | u << 6 | f;
        o < n.length && (n[o++] = g >>> 16), o < n.length && (n[o++] = g >>> 8 & 255), o < n.length && (n[o++] = g & 255)
    }
    return n
}
var CGt, yV, $pe = Y(() => {
    Fa();
    CGt = m.string().min(4).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);
    r(vV, "crc32WireBytes");
    yV = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    r(BAe, "encodeWireBytesBase64");
    r(UAe, "decodeWireBase64")
});

function usr(e) {
    if (e.length < 4 || e.length > ZI.maxPhysicalFrameBytes) return !1;
    let t = UAe(e);
    return t !== null && t.byteLength > 0 && BAe(t) === e
}

function psr(e) {
    return new TextEncoder().encode(e).byteLength
}

function C8i(e, t = {}) {
    let n = t.clientTimestamp === void 0 ? Number.MAX_SAFE_INTEGER : t.clientTimestamp,
        o = t.serverTimestamp === void 0 ? Number.MAX_SAFE_INTEGER : t.serverTimestamp;
    return {
        type: "data",
        payload: e,
        ...n === null ? {} : {
            client_ts: n
        },
        ...o === null ? {} : {
            server_ts: o
        }
    }
}

function fYe(e, t) {
    return psr(JSON.stringify(C8i(e, t)))
}

function bV(e, t, n) {
    let o = e ?? t;
    if (!Number.isSafeInteger(o) || o <= 0) throw new MR(n);
    return Math.min(o, t)
}

function E8i(e) {
    let t = PGt.safeParse(e);
    return t.success ? t.data : null
}

function A8i(e, t = {}) {
    let n;
    try {
        n = bV(t.maxPhysicalFrameBytes, ZI.maxPhysicalFrameBytes, "remote.rpcFrame.invalidPhysicalLimit")
    } catch (l) {
        return {
            kind: "fault",
            fault: {
                reasonCode: l instanceof MR ? l.reasonCode : "remote.rpcFrame.invalidPhysicalLimit",
                terminal: !0
            }
        }
    }
    let o = psr(e);
    if (o > n) return {
        kind: "fault",
        fault: {
            reasonCode: "remote.rpcFrame.envelopeTooLarge",
            terminal: !0
        }
    };
    let s;
    try {
        s = JSON.parse(e)
    } catch {
        return {
            kind: "fault",
            fault: {
                reasonCode: "remote.rpcFrame.invalidJson",
                terminal: !0
            }
        }
    }
    let a = dsr.safeParse(s);
    return a.success ? {
        kind: "accepted",
        bytes: o,
        envelope: a.data
    } : {
        kind: "fault",
        fault: {
            reasonCode: "remote.rpcFrame.invalidEnvelope",
            terminal: !0
        }
    }
}

function fsr(e) {
    let t = csr.safeParse({
        bridgeSessionId: e.bridgeSessionId,
        ...e.bridgeGeneration === void 0 ? {} : {
            bridgeGeneration: e.bridgeGeneration
        },
        ...e.recoveryId === void 0 ? {} : {
            recoveryId: e.recoveryId
        }
    });
    if (!t.success) throw new MR("remote.rpcFrame.invalidIdentity");
    return t.data
}

function dYe(e, t) {
    if (!Number.isSafeInteger(e) || e <= 0) throw new MR(t)
}

function P8i(e) {
    return 4 * Math.ceil(e / 3)
}

function msr(e) {
    return {
        zcode_type: "rpc-frame",
        ...e.identity,
        seq: e.seq,
        messageSeq: e.messageSeq,
        fragmentIndex: e.fragmentIndex,
        fragmentCount: e.fragmentCount,
        messageBytes: e.messageBytes,
        checksum: e.checksum,
        dataBase64: e.dataBase64
    }
}

function R8i(e) {
    let t = msr({
            identity: e.identity,
            seq: e.endSeq,
            messageSeq: e.messageSeq,
            fragmentIndex: e.fragmentCount - 1,
            fragmentCount: e.fragmentCount,
            messageBytes: e.messageBytes,
            checksum: e.checksum,
            dataBase64: ""
        }),
        n = fYe(t),
        o = 0,
        s = e.messageBytes;
    for (; o < s;) {
        let a = Math.ceil((o + s) / 2);
        n + P8i(a) <= e.maxPhysicalFrameBytes ? o = a : s = a - 1
    }
    return o
}

function D8i(e, t) {
    let n = fsr(t);
    dYe(t.firstPhysicalSeq, "remote.rpcFrame.invalidPhysicalSeq"), dYe(t.messageSeq, "remote.rpcFrame.invalidMessageSeq");
    let o = bV(t.maxPhysicalFrameBytes, ZI.maxPhysicalFrameBytes, "remote.rpcFrame.invalidPhysicalLimit"),
        s = bV(t.maxMessageBytes, ZI.maxMessageBytes, "remote.rpcFrame.invalidMessageLimit"),
        a = bV(t.maxFragments, ZI.maxFragments, "remote.rpcFrame.invalidFragmentLimit");
    if (e.byteLength === 0) throw new MR("remote.rpcFrame.emptyMessage");
    if (e.byteLength > s) throw new MR("remote.rpcFrame.messageTooLarge");
    let l = Object.freeze({
            algorithm: "crc32",
            value: vV(e)
        }),
        u = 1,
        f = 0;
    for (;;) {
        let _ = t.firstPhysicalSeq + u - 1;
        if (!Number.isSafeInteger(_) || _ > Number.MAX_SAFE_INTEGER) throw new MR("remote.rpcFrame.sequenceOverflow");
        if (f = R8i({
                identity: n,
                endSeq: _,
                messageSeq: t.messageSeq,
                fragmentCount: u,
                messageBytes: e.byteLength,
                checksum: l,
                maxPhysicalFrameBytes: o
            }), f < 1) throw new MR("remote.rpcFrame.envelopeTooLarge");
        let b = Math.ceil(e.byteLength / f);
        if (b > a) throw new MR("remote.rpcFrame.fragmentLimitExceeded");
        if (b <= u) break;
        u = b
    }
    let g = [];
    for (let _ = 0; _ < u; _ += 1) {
        let b = _ * f,
            w = Math.min(e.byteLength, b + f),
            T = msr({
                identity: n,
                seq: t.firstPhysicalSeq + _,
                messageSeq: t.messageSeq,
                fragmentIndex: _,
                fragmentCount: u,
                messageBytes: e.byteLength,
                checksum: l,
                dataBase64: BAe(e.subarray(b, w))
            });
        if (fYe(T) > o || !qpe.safeParse(T).success) throw new MR("remote.rpcFrame.internalEnvelopeError");
        g.push(Object.freeze(T))
    }
    return Object.freeze(g)
}

function O8i(e, t) {
    return t.bridgeSessionId === e.bridgeSessionId && t.bridgeGeneration === e.bridgeGeneration && t.recoveryId === e.recoveryId
}

function M8i(e, t) {
    if (typeof t != "object" || t === null) return !1;
    let n = t;
    return ["bridgeSessionId", "bridgeGeneration", "recoveryId"].some(s => s in n) ? n.bridgeSessionId !== e.bridgeSessionId || n.bridgeGeneration !== e.bridgeGeneration || n.recoveryId !== e.recoveryId : !1
}

function N8i(e, t) {
    return {
        messageSeq: e.messageSeq,
        value: JSON.stringify([e.bridgeSessionId, e.bridgeGeneration ?? null, e.recoveryId ?? null, e.seq, e.messageSeq, e.fragmentIndex, e.fragmentCount, e.messageBytes, e.checksum.algorithm, e.checksum.value, t.byteLength, vV(t)])
    }
}

function asr(e, t) {
    return e.value === t.value
}
var ZI, EGt, zAe, Nee, csr, lsr, qpe, pYe, PGt, dsr, MR, AGt, RGt = Y(() => {
    Fa();
    xb();
    $pe();
    ZI = {
        maxPhysicalFrameBytes: pc.maxFrameBytes,
        maxMessageBytes: 16 * 1024 * 1024,
        maxFragments: 64,
        assemblyTimeoutMs: 3e4,
        transportIdMaxChars: pc.transportEnvelopeIdMaxChars
    }, EGt = m.number().int().positive().max(Number.MAX_SAFE_INTEGER), zAe = m.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), Nee = m.string().min(1).max(ZI.transportIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u), csr = m.object({
        bridgeSessionId: Nee,
        bridgeGeneration: zAe.optional(),
        recoveryId: Nee.optional()
    }).strict(), lsr = m.object({
        algorithm: m.literal("crc32"),
        value: m.string().regex(/^[0-9a-f]{8}$/u)
    }).strict();
    r(usr, "isCanonicalBase64");
    qpe = m.object({
        zcode_type: m.literal("rpc-frame"),
        bridgeSessionId: Nee,
        bridgeGeneration: zAe.optional(),
        recoveryId: Nee.optional(),
        seq: EGt,
        messageSeq: EGt,
        fragmentIndex: m.number().int().nonnegative().max(ZI.maxFragments - 1),
        fragmentCount: m.number().int().positive().max(ZI.maxFragments),
        messageBytes: m.number().int().positive().max(ZI.maxMessageBytes),
        checksum: lsr,
        dataBase64: m.string().min(4).max(ZI.maxPhysicalFrameBytes).refine(usr)
    }).strict().superRefine((e, t) => {
        e.fragmentIndex >= e.fragmentCount && t.addIssue({
            code: "custom",
            path: ["fragmentIndex"],
            message: "fragmentIndex must be smaller than fragmentCount"
        }), e.fragmentCount > e.messageBytes && t.addIssue({
            code: "custom",
            path: ["fragmentCount"],
            message: "non-empty fragments cannot exceed message bytes"
        })
    }), pYe = m.object({
        zcode_type: m.literal("rpc-frame-ack"),
        bridgeSessionId: Nee,
        bridgeGeneration: zAe.optional(),
        recoveryId: Nee.optional(),
        ackMessageSeq: EGt
    }).strict(), PGt = m.union([qpe, pYe]), dsr = m.object({
        type: m.literal("data"),
        payload: PGt,
        client_ts: zAe.optional(),
        server_ts: zAe.optional()
    }).strict();
    r(psr, "utf8Bytes");
    r(C8i, "relayEnvelopeFor");
    r(fYe, "measureWebRemoteControlRpcRelayEnvelopeBytes");
    r(bV, "boundedPositive");
    r(E8i, "parseWebRemoteControlRpcTransportPayload");
    r(A8i, "parseWebRemoteControlRpcRelayEnvelopeJson");
    MR = class extends Error {
        constructor(n) {
            super(n);
            this.reasonCode = n;
            this.name = "WebRemoteControlRpcTransportEncodingError"
        }
        static {
            r(this, "WebRemoteControlRpcTransportEncodingError")
        }
    };
    r(fsr, "identityFrom");
    r(dYe, "assertPositiveSafe");
    r(P8i, "base64Length");
    r(msr, "frameShell");
    r(R8i, "findDecodedBudget");
    r(D8i, "encodeWebRemoteControlRpcTransportMessage");
    r(O8i, "sameIdentity");
    r(M8i, "hasRawIdentityMismatch");
    r(N8i, "frameFingerprint");
    r(asr, "sameFingerprint");
    AGt = class {
        static {
            r(this, "WebRemoteControlRpcTransportAssembler")
        }
        identity;
        maxPhysicalFrameBytes;
        maxMessageBytes;
        maxFragments;
        timeoutMs;
        now;
        expectedPhysicalSeq;
        expectedMessageSeq;
        lastCompletedMessageSeq;
        physicalSequenceExhausted = !1;
        messageSequenceExhausted = !1;
        settledFrameFingerprintsBySeq = new Map;
        active = null;
        terminalReason = null;
        constructor(t) {
            this.identity = fsr(t.identity), this.expectedPhysicalSeq = t.initialPhysicalSeq ?? 1, this.expectedMessageSeq = t.initialMessageSeq ?? 1, dYe(this.expectedPhysicalSeq, "remote.rpcFrame.invalidPhysicalSeq"), dYe(this.expectedMessageSeq, "remote.rpcFrame.invalidMessageSeq"), this.lastCompletedMessageSeq = this.expectedMessageSeq - 1, this.maxPhysicalFrameBytes = bV(t.maxPhysicalFrameBytes, ZI.maxPhysicalFrameBytes, "remote.rpcFrame.invalidPhysicalLimit"), this.maxMessageBytes = bV(t.maxMessageBytes, ZI.maxMessageBytes, "remote.rpcFrame.invalidMessageLimit"), this.maxFragments = bV(t.maxFragments, ZI.maxFragments, "remote.rpcFrame.invalidFragmentLimit"), this.timeoutMs = bV(t.timeoutMs, ZI.assemblyTimeoutMs, "remote.rpcFrame.invalidTimeout"), this.now = t.now ?? Date.now
        }
        get nextExpiryAt() {
            return this.active ? this.active.firstSeenAt + this.timeoutMs : null
        }
        fault(t, n, o) {
            return n && (this.terminalReason = t, this.active = null), {
                kind: "fault",
                fault: {
                    reasonCode: t,
                    terminal: n,
                    ...typeof o?.seq == "number" ? {
                        seq: o.seq
                    } : {},
                    ...typeof o?.messageSeq == "number" ? {
                        messageSeq: o.messageSeq
                    } : {},
                    expectedSeq: this.expectedPhysicalSeq,
                    expectedMessageSeq: this.expectedMessageSeq
                }
            }
        }
        expire(t = this.now()) {
            return !this.active || t - this.active.firstSeenAt < this.timeoutMs ? null : this.fault("remote.rpcFrame.assemblyTimeout", !0, {
                messageSeq: this.active.messageSeq
            })
        }
        accept(t, n = this.now()) {
            if (M8i(this.identity, t)) return this.fault("remote.rpcFrame.identityMismatch", !1);
            if (this.terminalReason) return this.fault(this.terminalReason, !0);
            let o = this.expire(n);
            if (o) return o;
            let s = typeof t == "object" && t !== null && "dataBase64" in t ? t.dataBase64 : void 0;
            if (typeof s == "string" && (s.length > this.maxPhysicalFrameBytes || !usr(s))) return this.fault("remote.rpcFrame.invalidBase64", !0);
            let a = qpe.safeParse(t);
            if (!a.success) return this.fault("remote.rpcFrame.invalidMetadata", !0);
            let l = a.data;
            if (!O8i(this.identity, l)) return this.fault("remote.rpcFrame.identityMismatch", !1, l);
            if (l.messageBytes > this.maxMessageBytes) return this.fault("remote.rpcFrame.messageTooLarge", !0, l);
            if (l.fragmentCount > this.maxFragments) return this.fault("remote.rpcFrame.fragmentLimitExceeded", !0, l);
            if (fYe(l) > this.maxPhysicalFrameBytes) return this.fault("remote.rpcFrame.envelopeTooLarge", !0, l);
            let u = UAe(l.dataBase64);
            if (!u || u.byteLength === 0) return this.fault("remote.rpcFrame.invalidBase64", !0, l);
            let f = N8i(l, u),
                g = this.active?.frameFingerprintsBySeq.get(l.seq);
            if (g) return asr(g, f) ? {
                kind: "duplicate",
                ackMessageSeq: this.lastCompletedMessageSeq > 0 ? this.lastCompletedMessageSeq : null
            } : this.fault("remote.rpcFrame.conflictingDuplicate", !0, l);
            let _ = this.settledFrameFingerprintsBySeq.get(l.seq);
            if (_) return asr(_, f) ? {
                kind: "duplicate",
                ackMessageSeq: this.lastCompletedMessageSeq > 0 ? this.lastCompletedMessageSeq : null
            } : this.physicalSequenceExhausted && l.messageSeq !== _.messageSeq ? this.fault("remote.rpcFrame.physicalSequenceExhausted", !0, l) : this.fault("remote.rpcFrame.conflictingDuplicate", !0, l);
            if (l.seq < this.expectedPhysicalSeq) return {
                kind: "duplicate",
                ackMessageSeq: this.lastCompletedMessageSeq > 0 ? this.lastCompletedMessageSeq : null
            };
            if (this.physicalSequenceExhausted) return this.fault("remote.rpcFrame.physicalSequenceExhausted", !0, l);
            if (this.messageSequenceExhausted && !this.active) return this.fault("remote.rpcFrame.messageSequenceExhausted", !0, l);
            if (l.seq > this.expectedPhysicalSeq) return this.fault("remote.rpcFrame.physicalGap", !0, l);
            if (l.messageSeq !== this.expectedMessageSeq) return this.fault("remote.rpcFrame.messageGap", !0, l);
            if (l.seq === Number.MAX_SAFE_INTEGER && l.fragmentIndex + 1 < l.fragmentCount) return this.fault("remote.rpcFrame.physicalSequenceExhausted", !0, l);
            let b = this.active?.fragments.length ?? 0;
            if (l.fragmentIndex !== b) return this.fault("remote.rpcFrame.fragmentGap", !0, l);
            if (this.active && (l.fragmentCount !== this.active.fragmentCount || l.messageBytes !== this.active.messageBytes)) return this.fault("remote.rpcFrame.metadataMismatch", !0, l);
            if (this.active && l.checksum.value !== this.active.checksum.value) return this.fault("remote.rpcFrame.checksumMismatch", !0, l);
            if (this.active || (this.active = {
                    messageSeq: l.messageSeq,
                    fragmentCount: l.fragmentCount,
                    messageBytes: l.messageBytes,
                    checksum: l.checksum,
                    firstSeenAt: n,
                    stagedBytes: 0,
                    fragments: [],
                    frameFingerprintsBySeq: new Map
                }), this.active.stagedBytes + u.byteLength > this.active.messageBytes) return this.fault("remote.rpcFrame.lengthMismatch", !0, l);
            if (this.active.fragments.push(u), this.active.frameFingerprintsBySeq.set(l.seq, f), this.active.stagedBytes += u.byteLength, l.seq === Number.MAX_SAFE_INTEGER ? this.physicalSequenceExhausted = !0 : this.expectedPhysicalSeq += 1, this.active.fragments.length < this.active.fragmentCount) return {
                kind: "incomplete",
                messageSeq: l.messageSeq,
                receivedFragments: this.active.fragments.length
            };
            if (this.active.stagedBytes !== this.active.messageBytes) return this.fault("remote.rpcFrame.lengthMismatch", !0, l);
            let w = new Uint8Array(this.active.messageBytes),
                T = 0;
            for (let R of this.active.fragments) w.set(R, T), T += R.byteLength;
            if (vV(w) !== this.active.checksum.value) return this.fault("remote.rpcFrame.checksumMismatch", !0, l);
            let I = this.active,
                A = I.messageSeq;
            return this.settledFrameFingerprintsBySeq = new Map(I.frameFingerprintsBySeq), this.active = null, this.lastCompletedMessageSeq = A, A === Number.MAX_SAFE_INTEGER ? this.messageSequenceExhausted = !0 : this.expectedMessageSeq += 1, {
                kind: "complete",
                messageSeq: A,
                bytes: w
            }
        }
    }
});

function hsr(e) {
    return e.workspaceIdentity?.trim() || e.workspacePath
}
var Fc, L8i, F8i, j8i, B8i, U8i, gsr, mYe, DGt, _sr, z8i, ysr, Wpe, hYe, OGt, MGt, vsr, $8i, bsr, Ssr, NGt, wsr, ksr, gYe, xsr, LGt, FGt, jGt, Lee, Tsr, Isr, Csr, Esr, q8i, Asr, Psr, Rsr, Dsr, BGt, UGt, Osr, _Ye, zGt, $Gt, qGt = Y(() => {
    Fa();
    Lj();
    CAe();
    Sz();
    Fc = m.string().trim().min(1), L8i = ["default", "yolo", "plan", "edit", "acceptEdits", "auto", "dontAsk", "bypassPermissions", "autoEdit", "build"], F8i = ["claude", "opencode", "gemini", "codex", "glm"], j8i = ["claudeCode"], B8i = m.object({
        fileCount: m.number().int().nonnegative(),
        added: m.number().int().nonnegative(),
        removed: m.number().int().nonnegative(),
        files: m.array(m.object({
            path: m.string(),
            added: m.number().int().nonnegative(),
            removed: m.number().int().nonnegative(),
            writeCount: m.number().int().positive(),
            lastTurnIndex: m.number().int().nonnegative()
        }).strict())
    }).strict(), U8i = m.object({
        taskId: Fc,
        traceId: Fc,
        title: m.string(),
        titleOverridden: m.boolean().optional(),
        workspacePath: Fc,
        workspaceIdentity: Fc.optional(),
        createdAt: m.number().int().nonnegative(),
        updatedAt: m.number().int().nonnegative(),
        mode: m.enum(L8i),
        model: m.string().optional(),
        runtimeEpoch: m.number().int().nonnegative().optional(),
        provider: m.enum(F8i).optional(),
        migrationSource: m.enum(j8i).optional(),
        forkedFromTaskId: Fc.optional(),
        unreadAt: m.number().int().nonnegative().optional(),
        status: m.enum(["running", "completed", "error"]).optional(),
        lastError: m.object({
            code: m.string().optional(),
            message: m.string().min(1),
            traceId: Fc.optional(),
            taskId: Fc.optional(),
            attribution: Bj.optional()
        }).optional(),
        changeSummary: B8i.optional()
    });
    r(hsr, "resolveWorkspaceKey");
    gsr = m.enum(["task_created", "user_message_saved", "assistant_message_saved", "task_status_changed", "task_meta_changed", "task_model_changed", "task_title_changed", "task_pinned", "task_unpinned", "task_archived", "task_unarchived", "task_deleted", "stream_mirror_gap", "stream_mirror_owner_lost"]), mYe = m.enum(["observer", "relay_owner"]), DGt = m.enum(["desktop_window", "relay_bridge"]), _sr = m.object({
        eventId: Fc,
        workspacePath: Fc,
        workspaceIdentity: Fc.optional(),
        workspaceKey: Fc,
        traceId: Fc,
        createdAt: m.number().int().nonnegative()
    }).strict(), z8i = m.object({
        runId: Fc,
        opSeq: m.number().int().nonnegative()
    }).strict(), ysr = _sr.extend({
        reason: gsr,
        streamWatermark: z8i.optional()
    }).strict(), Wpe = r((e, t) => {
        let n = hsr(t);
        t.workspaceKey !== n && e.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["workspaceKey"],
            message: "workspaceKey must match workspaceIdentity fallback rule"
        })
    }, "addWorkspaceKeyIssue"), hYe = r((e, t) => {
        t.runId !== t.traceId && e.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["runId"],
            message: "runId must match traceId"
        })
    }, "addRunIdTraceIdIssue"), OGt = ysr.extend({
        type: m.literal("task_snapshot_invalidated"),
        taskId: Fc
    }).strict(), MGt = ysr.extend({
        type: m.literal("workspace_task_list_invalidated"),
        taskId: Fc.optional(),
        taskMeta: U8i.optional()
    }).strict(), vsr = m.discriminatedUnion("kind", [m.object({
        kind: m.literal("image"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative().optional(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }).strict(), m.object({
        kind: m.literal("audio"),
        filename: m.string(),
        mimeType: m.string(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }).strict(), m.object({
        kind: m.literal("video"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative().optional(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }).strict(), m.object({
        kind: m.literal("pdf"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative().optional(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }).strict(), m.object({
        kind: m.literal("file"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative(),
        dataBase64: m.string().optional(),
        textContent: m.string().optional(),
        localPath: m.string().optional()
    }).strict()]), $8i = m.object({
        type: Fc,
        taskId: Fc,
        traceId: Fc
    }).passthrough(), bsr = m.object({
        kind: m.literal("user_message"),
        messageId: Fc,
        content: m.string(),
        attachments: m.array(vsr).optional(),
        timestamp: m.number().finite()
    }).strict(), Ssr = m.object({
        kind: m.literal("stream_event"),
        event: $8i
    }).strict(), NGt = m.discriminatedUnion("kind", [bsr, Ssr]), wsr = m.discriminatedUnion("kind", [bsr.extend({
        seq: m.number().int().positive()
    }).strict(), Ssr.extend({
        seq: m.number().int().positive()
    }).strict()]), ksr = m.object({
        workspacePath: Fc,
        workspaceIdentity: Fc.optional(),
        workspaceKey: Fc,
        taskId: Fc,
        runId: Fc,
        traceId: Fc,
        ownerClientId: Fc.optional(),
        ownerDeviceLabel: Fc.optional()
    }).strict(), gYe = ksr.superRefine((e, t) => {
        Wpe(t, e), hYe(t, e)
    }), xsr = _sr.extend({
        type: m.literal("task_stream_mirror_batch"),
        taskId: Fc,
        runId: Fc,
        ownerClientId: Fc.optional(),
        ownerDeviceLabel: Fc.optional(),
        batchSeq: m.number().int().positive(),
        fromSeq: m.number().int().positive(),
        toSeq: m.number().int().positive(),
        ops: m.array(wsr),
        terminal: m.boolean()
    }).strict(), LGt = gYe, FGt = ksr.extend({
        leaseRequestId: Fc
    }).strict().superRefine((e, t) => {
        Wpe(t, e), hYe(t, e)
    }), jGt = m.discriminatedUnion("acquired", [m.object({
        leaseRequestId: Fc,
        acquired: m.literal(!0),
        ownerHostId: Fc
    }).strict(), m.object({
        leaseRequestId: Fc,
        acquired: m.literal(!1),
        ownerHostId: Fc,
        reason: m.literal("owned_by_other_host")
    }).strict()]), Lee = m.object({
        commandRequestId: Fc,
        workspacePath: Fc,
        workspaceIdentity: Fc.optional(),
        workspaceKey: Fc,
        taskId: Fc,
        runId: Fc
    }).strict(), Tsr = Lee.extend({
        type: m.literal("stop_generation")
    }).strict(), Isr = Lee.extend({
        type: m.literal("respond_permission"),
        permissionRequestId: Fc,
        optionId: Fc,
        response: jL
    }).strict(), Csr = Lee.extend({
        type: m.literal("respond_elicitation"),
        elicitationRequestId: Fc,
        action: m.enum(["accept", "decline", "cancel"]),
        content: m.record(m.string(), m.unknown()).optional()
    }).strict(), Esr = Lee.extend({
        type: m.literal("respond_workspace_hook_review"),
        remoteSessionId: Fc.optional(),
        sessionId: Fc,
        bundleDigest: m.string().regex(/^[a-f0-9]{64}$/u),
        reviewFlowId: Fc,
        generation: m.number().int().positive(),
        interactionId: Fc,
        decision: Iee
    }).strict().superRefine((e, t) => {
        e.remoteSessionId && !e.workspaceIdentity && t.addIssue({
            code: m.ZodIssueCode.custom,
            path: ["workspaceIdentity"],
            message: "remote workspace Hook review response requires workspaceIdentity"
        })
    }), q8i = m.object({
        commandId: Fc,
        taskId: Fc,
        traceId: Fc,
        workspacePath: Fc,
        workspaceIdentity: Fc.optional(),
        workspaceKey: Fc,
        status: m.enum(["accepted", "running", "failed"]),
        createdAt: m.number().int().nonnegative(),
        updatedAt: m.number().int().nonnegative(),
        clientId: Fc.optional(),
        clientLabel: Fc.optional(),
        error: m.string().optional()
    }).strict(), Asr = m.discriminatedUnion("type", [q8i.extend({
        type: m.literal("send_prompt"),
        content: m.string(),
        attachments: m.array(vsr).optional(),
        automationId: Fc.optional()
    }).strict()]), Psr = Lee.extend({
        type: m.literal("enqueue_task_command"),
        taskCommand: Asr
    }).strict(), Rsr = Lee.extend({
        type: m.literal("promote_task_command"),
        commandId: Fc,
        clientMode: m.literal("web-remote-replayable")
    }).strict(), Dsr = Lee.extend({
        type: m.literal("cancel_task_command"),
        commandId: Fc,
        clientMode: m.literal("web-remote-replayable")
    }).strict(), BGt = m.discriminatedUnion("type", [Tsr, Isr, Csr, Esr, Psr, Rsr, Dsr]).superRefine((e, t) => {
        Wpe(t, e)
    }), UGt = m.discriminatedUnion("type", [Tsr.extend({
        requesterHostId: Fc
    }).strict(), Isr.extend({
        requesterHostId: Fc
    }).strict(), Csr.extend({
        requesterHostId: Fc
    }).strict(), Esr.extend({
        requesterHostId: Fc
    }).strict(), Psr.extend({
        requesterHostId: Fc
    }).strict(), Rsr.extend({
        requesterHostId: Fc
    }).strict(), Dsr.extend({
        requesterHostId: Fc
    }).strict()]).superRefine((e, t) => {
        Wpe(t, e)
    }), Osr = m.enum(["NO_ACTIVE_TASK_OWNER", "STALE_TASK_OWNER_COMMAND", "OWNER_COMMAND_FAILED"]), _Ye = m.discriminatedUnion("success", [m.object({
        commandRequestId: Fc,
        success: m.literal(!0),
        taskCommand: Asr.optional()
    }).strict(), m.object({
        commandRequestId: Fc,
        success: m.literal(!1),
        error: m.string(),
        code: Osr.optional()
    }).strict()]), zGt = m.discriminatedUnion("type", [OGt, MGt, xsr]).superRefine((e, t) => {
        Wpe(t, e), e.type === "task_stream_mirror_batch" && hYe(t, e)
    }), $Gt = m.discriminatedUnion("type", [OGt.extend({
        originHostId: Fc,
        deliveryPurpose: mYe.optional()
    }).strict(), MGt.extend({
        originHostId: Fc,
        deliveryPurpose: mYe.optional()
    }).strict(), xsr.extend({
        originHostId: Fc,
        deliveryPurpose: mYe.optional()
    }).strict()]).superRefine((e, t) => {
        Wpe(t, e), e.type === "task_stream_mirror_batch" && hYe(t, e)
    })
});

function W8i(e) {
    return e.issues.map(t => `${t.path.length>0?t.path.join("."):"<root>"}: ${t.message}`).join("; ")
}

function K8i(e) {
    let t = Bsr.safeParse(e);
    return t.success ? t.data : null
}
var Ur, V8i, NR, Msr, VGt, H8i, G8i, Nsr, HGt, yYe, Lsr, bYe, Fsr, jsr, WGt, vYe, J8i, Bsr, Z8i, Y8i, X8i, Usr, zsr, $sr, qsr, Vpe, Q8i, e5i, t5i, n5i, Wsr, r5i, o5i, Vsr, Hsr, i5i, Gsr, Jsr, Ksr, Zsr, Ysr, Xsr, Qsr, ear, tar, nar, GGt, rar, oar, iar, sar, aar, car, lar, uar, JGt, KGt, dar, par, far, mar, har, gar, _ar, yar, bar, Sar, war, s5i, kar, xar, Tar, Iar, Car, Ear, Aar, Par, Rar, Dar, Oar, Mar, Nar, Lar, Far, jar, a5i, Bar, Uar, zar, $ar, qar, War, Var, Har, Gar, Jar, Kar, Zar, Yar, Xar, Qar, ecr, tcr, ncr, rcr, ocr, icr, scr, acr, ccr, lcr, ucr, dcr, pcr, fcr, mcr, hcr, gcr, _cr, ycr, vcr, bcr, c5i, Scr, wcr, kcr, xcr, Tcr, Icr, Ccr, l5i, Ecr, ZGt, Acr, Pcr, $Ae, Rcr, u5i, d5i, p5i, SYe, Dcr, f5i, Ocr, m5i, h5i, g5i, _5i, y5i, YGt = Y(() => {
    HKe();
    vWt();
    Fa();
    VJe();
    _ee();
    mAe();
    eZe();
    EWt();
    rZe();
    PWt();
    aS();
    OWt();
    uYe();
    BZe();
    xb();
    Sz();
    jAe();
    RGt();
    qGt();
    NZe();
    BZe();
    NZe();
    NVt();
    r(W8i, "formatZodError");
    Ur = m.string().trim().min(1), V8i = m.array(m.string()), NR = Ur.max(pc.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u), Msr = m.object({
        workspacePath: Ur,
        workspaceIdentity: Ur.optional(),
        remoteSessionId: Ur.optional(),
        label: Ur,
        workspacePurpose: m.enum(["project", "conversation"]).optional(),
        kind: m.enum(["local", "remote"]),
        connectionState: m.enum(["connected", "disconnected", "reconnecting"]).optional(),
        lastConnectionError: m.string().optional()
    }), VGt = m.array(Msr), H8i = m.object({
        requestId: Ur,
        workspaceKey: Ur
    }), G8i = m.union([m.object({
        requestId: Ur,
        workspaceKey: Ur,
        success: m.literal(!0)
    }), m.object({
        requestId: Ur,
        workspaceKey: Ur,
        success: m.literal(!1),
        error: m.string()
    })]), Nsr = m.object({
        taskId: Ur,
        title: m.string(),
        workspacePath: Ur,
        workspaceIdentity: Ur.optional(),
        remoteSessionId: Ur.optional(),
        workspaceLabel: Ur,
        workspaceKind: m.enum(["local", "remote"]),
        createdAt: m.number().finite(),
        updatedAt: m.number().finite(),
        provider: OO.optional(),
        unreadAt: m.number().finite().optional(),
        displayStatus: m.enum(["idle", "running", "completed", "error"]).optional(),
        hasBackgroundWork: m.boolean().optional(),
        workflowActivity: zpe.optional(),
        pinned: m.boolean().optional(),
        archived: m.boolean().optional()
    }), HGt = m.array(Nsr), yYe = m.enum(["session-not-found", "session-expired", "session-conflict", "workspace-closed", "desktop-disconnected", "invalid-mobile-connection", "desktop-bootstrap-timeout", "connection-recovery-timeout", "relay-unavailable", "unsupported-action", "unexpected-error"]), Lsr = m.discriminatedUnion("kind", [m.object({
        bridgeSessionId: NR,
        bridgeGeneration: m.number().int().nonnegative().optional(),
        recoveryId: NR.optional(),
        kind: m.literal("local"),
        workspaceKey: Ur,
        workspacePath: Ur,
        initialTaskId: Ur.optional()
    }), m.object({
        bridgeSessionId: NR,
        bridgeGeneration: m.number().int().nonnegative().optional(),
        recoveryId: NR.optional(),
        kind: m.literal("remote"),
        workspaceKey: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur,
        remoteSessionId: Ur,
        initialTaskId: Ur.optional()
    })]), bYe = m.object({
        activeWorkspaceKey: Ur.optional(),
        activeTaskId: Ur.optional(),
        updatedAt: m.number().finite()
    }), Fsr = m.object({
        platform: Ur,
        version: Ur,
        name: Ur,
        userAgent: m.string().optional(),
        language: m.string().optional(),
        languages: m.array(m.string()).optional(),
        browserPlatform: m.string().optional(),
        viewport: m.object({
            width: m.number().finite(),
            height: m.number().finite(),
            devicePixelRatio: m.number().finite()
        }).optional(),
        screen: m.object({
            width: m.number().finite(),
            height: m.number().finite()
        }).optional(),
        timezone: m.string().optional(),
        online: m.boolean().optional(),
        updatedAt: m.number().finite()
    }), jsr = m.object({
        windowControlSessionId: Ur,
        desktopAppVersion: Ur.optional(),
        workspaces: VGt,
        tasks: HGt,
        initialViewState: bYe.optional(),
        mobileViewState: bYe.optional()
    }), WGt = m.object({
        workspaces: VGt,
        tasks: HGt.optional(),
        activeWorkspaceKey: Ur.optional(),
        activeTaskId: Ur.optional()
    }), vYe = m.enum(["isDockerAvailable", "listWSLDistros", "listDockerContainers", "listSSHConfigAliases", "loadMcpFromUserDirectory", "saveMcpToUserDirectory", "migrateLegacyCommonMcp"]), J8i = [m.object({
        zcode_type: m.literal("telemetry-report"),
        event: sAe
    }).strict(), m.object({
        zcode_type: m.literal("bootstrap-request"),
        requestId: Ur
    }), m.object({
        zcode_type: m.literal("bootstrap-response"),
        requestId: Ur,
        success: m.literal(!0),
        result: jsr
    }), m.object({
        zcode_type: m.literal("workspace-list-request"),
        requestId: Ur
    }), m.object({
        zcode_type: m.literal("workspace-list-response"),
        requestId: Ur,
        success: m.literal(!0),
        result: WGt
    }), m.object({
        zcode_type: m.literal("workspace-list-updated"),
        result: WGt
    }), m.object({
        zcode_type: m.literal("workspace-bridge-open"),
        requestId: Ur,
        bridgeSessionId: NR,
        bridgeGeneration: m.number().int().nonnegative().optional(),
        recoveryId: NR.optional(),
        workspaceKey: Ur,
        taskId: Ur.optional()
    }), m.object({
        zcode_type: m.literal("workspace-bridge-ready"),
        requestId: Ur,
        bridgeSessionId: NR,
        bridgeGeneration: m.number().int().nonnegative().optional(),
        recoveryId: NR.optional(),
        bridge: Lsr
    }), m.object({
        zcode_type: m.literal("workspace-bridge-error"),
        requestId: Ur,
        bridgeSessionId: NR.optional(),
        bridgeGeneration: m.number().int().nonnegative().optional(),
        recoveryId: NR.optional(),
        reason: yYe,
        error: m.string()
    }), m.object({
        zcode_type: m.literal("workspace-reconnect-request"),
        requestId: Ur,
        workspaceKey: Ur
    }), m.object({
        zcode_type: m.literal("workspace-reconnect-response"),
        requestId: Ur,
        workspaceKey: Ur,
        success: m.literal(!0)
    }), m.object({
        zcode_type: m.literal("workspace-reconnect-response"),
        requestId: Ur,
        workspaceKey: Ur,
        success: m.literal(!1),
        error: m.string()
    }), m.object({
        zcode_type: m.literal("mobile-view-state-update"),
        viewState: bYe,
        deviceInfo: Fsr.optional()
    }), m.object({
        zcode_type: m.literal("platform-request"),
        requestId: Ur,
        method: vYe,
        args: m.unknown().optional()
    }), m.object({
        zcode_type: m.literal("platform-response"),
        requestId: Ur,
        method: vYe,
        success: m.literal(!0),
        result: m.unknown()
    }), m.object({
        zcode_type: m.literal("platform-response"),
        requestId: Ur,
        method: vYe,
        success: m.literal(!1),
        error: m.string()
    }), qpe, pYe, m.object({
        zcode_type: m.literal("bridge-degraded"),
        bridgeSessionId: NR,
        bridgeGeneration: m.number().int().nonnegative().optional(),
        recoveryId: NR.optional(),
        reason: m.enum(["rpc-transport-fault", "rpc-frame-gap", "buffer-overflow", "buffer-timeout"]),
        seq: m.number().int().nonnegative().optional(),
        expectedSeq: m.number().int().nonnegative().optional(),
        droppedCount: m.number().int().nonnegative().optional()
    }), m.object({
        zcode_type: m.literal("app-error"),
        requestId: Ur.optional(),
        bridgeSessionId: NR.optional(),
        reason: yYe,
        error: m.string()
    }), m.object({
        zcode_type: m.literal("mobile-diagnostic"),
        event: m.enum(["state-transition", "socket-close", "socket-error", "recover-start", "recover-scheduled", "pair-status", "failure"]),
        timestamp: m.number().int().nonnegative(),
        state: m.string().optional(),
        previousState: m.string().optional(),
        pairStatus: m.enum(["waiting", "matched"]).optional(),
        closeCode: m.number().int().optional(),
        closeReason: m.string().optional(),
        wasClean: m.boolean().optional(),
        wasPaired: m.boolean().optional(),
        failureReason: yYe.optional(),
        failureMessage: m.string().optional(),
        visibilityState: m.string().optional(),
        online: m.boolean().optional(),
        hiddenDurationMs: m.number().int().nonnegative().optional()
    })], Bsr = m.union(J8i);
    r(K8i, "parseWebRemoteControlAppPayload");
    Z8i = m.record(m.string(), m.string()), Y8i = Ur, X8i = m.string(), Usr = m.object({
        kind: m.literal("ssh"),
        host: Ur,
        port: m.number().int().positive().max(65535).optional(),
        username: Ur,
        sshConfigAlias: Ur.optional(),
        password: m.string().optional(),
        privateKeyPath: m.string().optional(),
        privateKeyPassphrase: m.string().optional(),
        assetInstallMode: m.enum(hAe).optional(),
        resourcePackages: m.object({
            selectedPackageIds: m.array(m.string().refine(gAe)).optional()
        }).optional()
    }), zsr = m.object({
        kind: m.literal("wsl"),
        distro: m.string().optional(),
        user: Ppe.optional()
    }), $sr = m.object({
        kind: m.literal("docker"),
        container: Ur
    }), qsr = m.object({
        kind: m.literal("server"),
        url: m.string().url(),
        name: Ur.optional(),
        token: m.string().optional(),
        workspacePath: m.string().optional(),
        serverId: Ur.optional()
    }), Vpe = m.discriminatedUnion("kind", [Usr, zsr, $sr, qsr]), Q8i = m.object({
        type: m.literal("zcode-hello"),
        version: m.string(),
        platform: m.string(),
        arch: m.string(),
        pid: m.number().int()
    }), e5i = m.object({
        type: m.literal("zcode-hello-ack"),
        version: m.string(),
        clientId: Ur
    }), t5i = m.object({
        level: m.enum(["info", "warn", "error"]),
        args: m.array(m.unknown())
    }), n5i = m.object({
        taskId: Ur,
        status: m.enum(["completed", "failed", "permission_request", "elicitation_request", "feedback_update"]),
        requestId: Ur.optional(),
        title: m.string(),
        body: m.string()
    }), Wsr = m.object({
        clientTimezone: Ur,
        clientLanguage: Ur,
        screenResolution: Ur
    }), r5i = m.object({
        context: Wsr,
        elementName: Ur,
        eventRegion: Ur,
        eventType: Ur,
        eventText: m.string().optional(),
        eventExtraDetail: m.record(m.string(), m.string()),
        userId: m.string().optional(),
        talkId: m.string().optional(),
        messageId: m.string().optional()
    }), o5i = m.object({
        name: Ur,
        group: Ur,
        value: m.number().finite().optional(),
        properties: m.record(m.string(), m.union([m.string(), m.number().finite(), m.boolean(), m.undefined()])).optional()
    }), Vsr = m.object({
        channel: Ur,
        payload: m.unknown(),
        sourceWindowId: m.number().int().optional()
    }), Hsr = m.object({
        mockCdnDir: m.string().optional(),
        remoteCdnBaseUrl: m.string().optional(),
        remoteCdnBaseUrls: m.array(m.string()).optional(),
        remoteCacheDir: m.string().optional()
    }), i5i = m.object({
        workspacePath: Ur,
        workspaceIdentity: Ur.optional()
    }), Gsr = m.object({
        type: m.literal("init-local"),
        databaseStartupId: m.string().min(1).max(128).optional(),
        hostId: Ur.optional(),
        deliveryKind: DGt.optional(),
        deviceMid: m.string().optional(),
        feedbackApiBase: m.string().url().optional(),
        workspacePath: Ur.optional(),
        workspaceIdentity: Ur.optional(),
        agentWarmupTargets: m.array(i5i).max(3).optional(),
        agentSpawnFallbackCwd: Ur.optional(),
        zcodeBuiltinProviderConfigFilePath: Ur,
        runtimeProcessEnvPatch: m.record(m.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), m.string()).optional()
    }), Jsr = m.object({
        remoteSessionId: Ur,
        target: Vpe,
        workspacePath: Ur.optional(),
        workspaceIdentity: Ur.optional(),
        generation: m.number().int().positive()
    }).strict(), Ksr = m.discriminatedUnion("kind", [m.object({
        kind: m.literal("local")
    }).strict(), m.object({
        kind: m.literal("remote"),
        remoteSessionId: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur
    }).strict()]), Zsr = m.object({
        type: m.literal("connect-remote-workspace"),
        requestId: Ur,
        target: Vpe,
        remoteAssets: Hsr,
        workspacePath: Ur.optional(),
        workspaceIdentity: Ur.optional()
    }).strict(), Ysr = m.object({
        type: m.literal("cancel-remote-workspace-connect"),
        requestId: Ur
    }).strict(), Xsr = m.object({
        type: m.literal("bind-remote-workspace-context"),
        requestId: Ur,
        remoteSessionId: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur
    }).strict(), Qsr = m.object({
        type: m.literal("dispose-remote-workspace-session"),
        requestId: Ur,
        remoteSessionId: Ur
    }).strict(), ear = m.object({
        type: m.literal("attach-service-port"),
        requestId: Ur,
        attachmentId: Ur,
        clientMode: m.enum(["desktop-continuous", "web-remote-replayable"]),
        scope: Ksr
    }).strict(), tar = m.object({
        type: m.literal("detach-service-port"),
        attachmentId: Ur
    }), nar = m.object({
        type: m.literal("dispose")
    }), GGt = m.object({
        type: m.literal("broadcast"),
        message: Vsr
    }), rar = m.discriminatedUnion("status", [m.object({
        type: m.literal("broadcast-claim-result"),
        requestId: Ur,
        status: m.literal("acquired"),
        claimToken: Ur
    }), m.object({
        type: m.literal("broadcast-claim-result"),
        requestId: Ur,
        status: m.literal("busy"),
        retryAfterMs: m.number().int().nonnegative()
    }), m.object({
        type: m.literal("broadcast-claim-result"),
        requestId: Ur,
        status: m.literal("committed")
    })]), oar = m.object({
        type: m.literal("task-realtime-deliver"),
        event: $Gt
    }), iar = m.object({
        type: m.literal("task-run-lease-result"),
        result: jGt
    }), sar = m.object({
        type: m.literal("task-owner-command-deliver"),
        command: UGt
    }), aar = m.object({
        type: m.literal("task-owner-command-result"),
        result: _Ye
    }), car = m.object({
        type: m.literal("bot-remote-workspace-reconnect-result"),
        requestId: Ur,
        ok: m.boolean(),
        sessionId: Ur.optional(),
        error: m.string().optional()
    }), lar = m.object({
        type: m.literal("bot-remote-workspace-connection-status-result"),
        requestId: Ur,
        ok: m.boolean(),
        connected: m.boolean().optional(),
        error: m.string().optional()
    }), uar = m.object({
        type: m.literal("bot-remote-workspace-runtime-port"),
        requestId: Ur,
        ok: m.boolean(),
        error: m.string().optional()
    }), JGt = m.object({
        content: Ur,
        createdAt: Ur,
        fromSessionId: Ur,
        messageId: Ur,
        requestId: Ur,
        toSessionId: Ur
    }), KGt = m.object({
        error: m.string().optional(),
        messageId: Ur,
        requestId: Ur,
        sessionId: Ur,
        status: m.enum(["success", "failed"])
    }), dar = m.object({
        sessionId: Ur
    }), par = m.object({
        type: m.literal("session-message-deliver"),
        request: JGt
    }), far = m.object({
        type: m.literal("session-message-delivery-result"),
        result: KGt
    }), mar = m.object({
        type: m.literal("feedback-log-archive-result"),
        requestId: Ur,
        ok: m.boolean(),
        path: m.string().optional(),
        size: m.number().int().nonnegative().optional(),
        error: m.string().optional()
    }), har = m.object({
        type: m.literal("cron-run"),
        automationId: Ur,
        runId: Ur,
        workspacePath: Ur,
        workspaceIdentity: m.string().optional(),
        prompt: Ur,
        targetTaskId: Ur.optional(),
        modelSelection: Pu.optional(),
        mode: m.string().optional()
    }), gar = m.object({
        type: m.literal("off-peak-run"),
        offPeakTaskId: Ur,
        workspacePath: Ur,
        workspaceIdentity: m.string().optional(),
        prompt: Ur,
        permissionMode: Ur,
        modelSelection: Pu,
        conversationId: m.string().optional(),
        sessionId: m.string().optional(),
        serverTicketId: m.string().optional()
    }), _ar = m.object({
        type: m.literal("browser-execute-result"),
        requestId: Ur,
        result: yee
    }), yar = m.object({
        type: m.literal("local-media-preview-path-authorize-result"),
        requestId: Ur,
        ok: m.boolean(),
        path: Ur.optional(),
        error: m.string().optional()
    }).strict(), bar = m.object({
        type: m.literal("cua-pip-focus-changed"),
        event: m.object({
            kind: m.literal("focus-changed"),
            revision: m.number().int().nonnegative().safe(),
            sourceWindowId: Ur.max(255),
            sessionId: Ur.max(255).nullable()
        }).strict()
    }).strict(), Sar = m.object({
        type: m.literal("provider-provisioning-execute"),
        requestId: Ur,
        environmentKey: Ur,
        remoteSessionId: Ur,
        trigger: iZe
    }).strict(), war = m.object({
        type: m.literal("resource-usage-snapshot-request"),
        requestId: Ur
    }).strict(), s5i = m.discriminatedUnion("type", [m.object({
        type: m.literal("database-startup-control"),
        control: _Wt
    }).strict(), war, m.object({
        type: m.literal("resource-usage-snapshot-cancel"),
        requestId: Ur
    }).strict(), Gsr, Zsr, Ysr, Xsr, Qsr, ear, tar, nar, GGt, rar, oar, iar, sar, aar, car, lar, uar, par, far, mar, har, gar, _ar, yar, bar, Sar]), kar = m.object({
        type: m.literal("remote-workspace-connected"),
        requestId: Ur,
        descriptor: Jsr
    }).strict(), xar = m.object({
        type: m.literal("remote-workspace-connection-log"),
        requestId: Ur,
        level: m.enum(["info", "warn", "error"]),
        message: Ur
    }).strict(), Tar = m.object({
        type: m.literal("remote-workspace-connect-failed"),
        requestId: Ur,
        error: Ur
    }).strict(), Iar = m.object({
        type: m.literal("remote-workspace-closed"),
        remoteSessionId: Ur,
        reason: m.enum(["connection-closed", "disposed", "connect-cancelled"]),
        exitCode: m.number().int().nullable().optional(),
        signal: m.string().nullable().optional(),
        error: m.string().optional()
    }).strict(), Car = m.object({
        type: m.literal("log"),
        level: m.enum(["info", "warn", "error"]),
        source: m.string(),
        message: m.string()
    }), Ear = m.enum(["claudeCode"]), Aar = m.object({
        type: m.literal("agent-process-spawned"),
        lane: Ur.optional(),
        pid: m.number().int().positive(),
        provider: OO,
        workspacePath: Ur,
        command: m.string(),
        args: m.array(m.string()),
        startedAt: m.number().int().nonnegative(),
        runtimeGeneration: m.number().int().positive().optional(),
        runtimeInstanceId: Ur.optional()
    }), Par = m.object({
        type: m.literal("agent-process-ready"),
        lane: Ur.optional(),
        pid: m.number().int().positive(),
        provider: OO,
        workspacePath: Ur,
        readyAt: m.number().int().nonnegative(),
        startupDurationMs: m.number().int().nonnegative(),
        runtimeGeneration: m.number().int().positive(),
        runtimeInstanceId: Ur
    }), Rar = m.object({
        type: m.literal("agent-process-exited"),
        lane: Ur.optional(),
        pid: m.number().int().positive(),
        provider: OO,
        workspacePath: Ur,
        exitCode: m.number().int().nullable(),
        signal: m.string().nullable(),
        endedAt: m.number().int().nonnegative(),
        terminationKind: m.enum(["expected", "unexpected", "watchdog_recycle"]),
        terminationReason: m.string().optional(),
        runtimeReady: m.boolean().optional(),
        runtimeGeneration: m.number().int().positive(),
        runtimeInstanceId: Ur.optional(),
        uptimeMs: m.number().int().nonnegative(),
        stderrLineCount: m.number().int().nonnegative(),
        stderrTail: m.array(m.string().max(1100)).max(20).optional()
    }), Dar = m.object({
        type: m.literal("agent-process-error"),
        lane: Ur.optional(),
        pid: m.number().int().positive().nullable(),
        provider: OO,
        workspacePath: Ur,
        command: m.string(),
        args: m.array(m.string()),
        errorName: Ur,
        errorCode: m.string().optional(),
        errorMessage: m.string(),
        errorStack: m.string().optional(),
        runtimeGeneration: m.number().int().positive(),
        runtimeInstanceId: Ur.optional(),
        occurredAt: m.number().int().nonnegative()
    }), Oar = m.object({
        type: m.literal("agent-process-exception"),
        lane: Ur.optional(),
        pid: m.number().int().positive(),
        provider: OO,
        workspacePath: Ur,
        runtimeGeneration: m.number().int().positive(),
        runtimeInstanceId: Ur,
        diagnostic: WJe
    }).strict(), Mar = m.enum(IWt), Nar = rHt.extend({
        lane: Mar.optional()
    }).strict(), Lar = m.string().regex(/^[a-f0-9]{64}$/), Far = m.object({
        type: m.literal("agent-resource-sample"),
        runtimeSurface: m.enum(["local", "remote"]),
        environmentKey: Lar.optional(),
        sample: Nar
    }).strict(), jar = m.object({
        cpuPercent: m.number().finite().nonnegative().max(1e5),
        rssKb: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
        heapUsedKb: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER)
    }).strict(), a5i = m.object({
        heapUsedKb: m.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER)
    }).strict(), Bar = m.object({
        type: m.literal("host-resource-sample"),
        sample: jar
    }).strict(), Uar = m.object({
        type: m.literal("mcp-resource-samples"),
        runtimeSurface: m.enum(["local", "remote"]),
        environmentKey: Lar.optional(),
        samples: tHt
    }).strict(), zar = m.object({
        type: m.literal("tool-exec-resource"),
        runtimeSurface: m.enum(["local", "remote"]),
        sample: nHt
    }).strict(), $ar = m.object({
        type: m.literal("mcp-telemetry"),
        runtimeSurface: m.enum(["local", "remote"]),
        event: eHt
    }).strict(), qar = m.object({
        type: m.literal("session-create-telemetry"),
        event: yWt
    }).strict(), War = m.object({
        type: m.literal("agent-running-task-count-changed"),
        runningTaskCount: m.number().int().nonnegative()
    }), Var = m.object({
        type: m.literal("workspace-running-task-count-changed"),
        workspacePath: Ur,
        workspaceIdentity: Ur.optional(),
        runningTaskCount: m.number().int().nonnegative()
    }), Har = m.object({
        type: m.literal("cua-operation-state"),
        active: m.boolean(),
        sessionId: Ur,
        turnId: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur.optional()
    }).strict(), Gar = m.object({
        type: m.literal("broadcast-claim-request"),
        requestId: Ur,
        key: Ur.max(1024)
    }), Jar = m.object({
        type: m.literal("broadcast-claim-commit"),
        key: Ur.max(1024),
        claimToken: Ur
    }), Kar = m.object({
        type: m.literal("broadcast-claim-release"),
        key: Ur.max(1024),
        claimToken: Ur
    }), Zar = m.object({
        type: m.literal("task-realtime-publish"),
        event: zGt
    }), Yar = m.object({
        type: m.literal("task-stream-op-publish"),
        target: gYe,
        op: NGt
    }), Xar = m.object({
        type: m.literal("task-run-lease-acquire"),
        request: FGt
    }), Qar = m.object({
        type: m.literal("task-run-lease-release"),
        target: LGt
    }), ecr = m.object({
        type: m.literal("task-owner-command-request"),
        command: BGt
    }), tcr = m.object({
        type: m.literal("task-owner-command-result"),
        result: _Ye
    }), ncr = m.object({
        type: m.literal("bot-remote-workspace-reconnect-request"),
        requestId: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur,
        target: Vpe
    }), rcr = m.object({
        type: m.literal("bot-remote-workspace-connection-status-request"),
        requestId: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur,
        target: Vpe
    }), ocr = m.object({
        type: m.literal("bot-remote-workspace-runtime-port-request"),
        requestId: Ur,
        workspacePath: Ur,
        workspaceIdentity: Ur,
        target: Vpe
    }), icr = m.object({
        type: m.literal("session-message-send-requested"),
        request: JGt
    }), scr = m.object({
        type: m.literal("session-route-announce"),
        route: dar
    }), acr = m.object({
        type: m.literal("session-message-deliver-result"),
        result: KGt
    }), ccr = m.object({
        type: m.literal("feedback-log-archive-request"),
        requestId: Ur,
        sourceDir: Ur
    }), lcr = m.object({
        type: m.literal("cron-run-result"),
        runId: Ur,
        ok: m.boolean(),
        taskId: m.string().optional(),
        sessionId: m.string().optional(),
        error: m.string().optional(),
        failureKind: m.enum(["transient", "permanent"]).optional()
    }), ucr = m.object({
        type: m.literal("off-peak-run-result"),
        offPeakTaskId: Ur,
        ok: m.boolean(),
        conversationId: m.string().optional(),
        sessionId: m.string().optional(),
        error: m.string().optional(),
        failureKind: m.enum(["transient", "permanent"]).optional()
    }), dcr = m.object({
        type: m.literal("cron-scheduler-wake-request"),
        automationId: Ur
    }), pcr = m.object({
        type: m.literal("off-peak-scheduler-wake-request"),
        offPeakTaskId: m.string().optional()
    }), fcr = m.object({
        type: m.literal("browser-execute-request"),
        requestId: Ur,
        browserId: Ur.optional(),
        browserGeneration: m.number().int().nonnegative().optional(),
        sessionId: Ur,
        turnId: Ur.optional(),
        workspaceKey: Ur.optional(),
        workspacePath: Ur.optional(),
        workspaceIdentity: Ur.optional(),
        remoteSessionId: Ur.optional(),
        clientMode: m.enum(["desktop-continuous", "web-remote-replayable"]).optional(),
        sessionContext: m.enum(["live", "cached"]).optional(),
        command: gee
    }), mcr = m.object({
        type: m.literal("local-media-preview-path-authorize-request"),
        requestId: Ur,
        path: Ur
    }).strict(), hcr = m.object({
        transport: m.enum(["http", "websocket", "rpc"]),
        interface: m.string(),
        durationMs: m.number(),
        ok: m.boolean(),
        statusCode: m.number().optional(),
        errorKind: m.string().optional(),
        attempt: m.number().int().positive().optional(),
        dnsMs: m.number().optional(),
        tcpMs: m.number().optional(),
        tlsMs: m.number().optional(),
        ttfbMs: m.number().optional(),
        downloadMs: m.number().optional()
    }), gcr = m.object({
        type: m.literal("network-telemetry-batch"),
        observations: m.array(hcr).max(500)
    }), _cr = m.object({
        type: m.literal("provider-provisioning-source-changed"),
        trigger: iZe.exclude(["environment-online"])
    }).strict(), ycr = m.object({
        type: m.literal("provider-provisioning-execution-result"),
        requestId: Ur,
        environmentKey: Ur,
        status: m.enum(["applied", "already-applied", "unsupported", "failed", "rollback_failed"]),
        error: m.string().optional()
    }).strict(), vcr = m.object({
        pid: m.number().int().positive(),
        name: Ur,
        category: m.enum(["base", "builtin-plugin", "community-plugin"]),
        groupKey: Ur,
        groupLabel: Ur,
        cpuPercent: m.number().finite().nonnegative(),
        memoryBytes: m.number().finite().nonnegative()
    }).strict(), bcr = m.object({
        type: m.literal("resource-usage-snapshot-result"),
        requestId: Ur,
        sampledAt: m.number().int().nonnegative(),
        processes: m.array(vcr).max(1e4)
    }).strict(), c5i = m.discriminatedUnion("type", [m.object({
        type: m.literal("database-startup-state"),
        state: gWt
    }).strict(), bcr, xar, kar, Tar, Iar, Car, Aar, Par, Rar, Dar, Oar, Far, Bar, $ar, Uar, zar, qar, War, Var, Har, GGt, Gar, Jar, Kar, Zar, Yar, Xar, Qar, ecr, tcr, ncr, rcr, ocr, icr, scr, acr, ccr, fcr, mcr, gcr, _cr, ycr, lcr, ucr, dcr, pcr]), Scr = m.enum(["running", "completed", "error"]), wcr = m.object({
        kind: m.literal("image"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative().optional(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }), kcr = m.object({
        kind: m.literal("video"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative().optional(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }), xcr = m.object({
        kind: m.literal("pdf"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative().optional(),
        dataBase64: m.string().optional(),
        localPath: m.string().optional()
    }), Tcr = m.object({
        kind: m.literal("file"),
        filename: m.string(),
        mimeType: m.string(),
        sizeBytes: m.number().int().nonnegative(),
        dataBase64: m.string().optional(),
        textContent: m.string().optional(),
        localPath: m.string().optional()
    }), Icr = m.discriminatedUnion("kind", [wcr, kcr, xcr, Tcr]), Ccr = m.object({
        toolName: m.string().optional(),
        title: m.string().optional(),
        kind: m.string().optional(),
        status: m.enum(["completed", "failed", "denied", "stopped"]).optional(),
        input: m.unknown(),
        output: m.unknown().optional(),
        error: m.string().optional(),
        raw: m.unknown().optional(),
        snapshotRefs: m.array(m.object({
            field: m.enum(["input", "output", "raw"]),
            refId: m.string(),
            hash: m.string(),
            fullBytes: m.number().int().nonnegative(),
            previewBytes: m.number().int().nonnegative()
        })).optional()
    }), l5i = m.discriminatedUnion("type", [m.object({
        type: m.literal("content"),
        content: m.string()
    }), m.object({
        type: m.literal("thought"),
        content: m.string()
    }), m.object({
        type: m.literal("tool-call"),
        toolIndex: m.number().int().nonnegative()
    })]), Ecr = m.object({
        id: m.string().optional(),
        role: m.enum(["user", "assistant"]),
        content: m.string(),
        timestamp: m.number().int().nonnegative(),
        model: m.string().optional(),
        characterCount: m.number().int().nonnegative().optional(),
        durationMs: m.number().int().nonnegative().optional(),
        interrupted: m.boolean().optional(),
        feedback: m.enum(["like", "dislike"]).optional(),
        attachments: m.array(Icr).optional(),
        tools: m.array(Ccr).optional(),
        thought: m.string().optional(),
        parts: m.array(l5i).optional(),
        checkpointState: m.enum(["partial"]).optional(),
        checkpointReason: m.enum(["tool_completed", "part_boundary", "periodic"]).optional(),
        checkpointUpdatedAt: m.number().int().nonnegative().optional(),
        turnIndex: m.number().int().nonnegative().optional(),
        bodyRefs: m.array(m.object({
            field: m.enum(["content", "thought"]),
            refId: m.string(),
            hash: m.string(),
            fullBytes: m.number().int().nonnegative(),
            previewBytes: m.number().int().nonnegative()
        })).optional(),
        toolSlice: m.object({
            persistedMessageIndex: m.number().int().nonnegative(),
            totalTools: m.number().int().nonnegative(),
            startToolIndex: m.number().int().nonnegative(),
            endToolIndexExclusive: m.number().int().nonnegative()
        }).optional()
    }), ZGt = m.enum(["active", "paused", "budget_limited", "complete"]), Acr = m.enum(["set", "status_updated", "cleared", "usage_accounted", "run_started", "run_finished", "summary_updated"]), Pcr = m.enum(["command", "tool", "runtime"]), $Ae = m.object({
        sessionID: Ur,
        targetID: Ur,
        objective: Ur,
        summaryTitle: m.string().min(1).nullable().default(null),
        status: ZGt,
        tokenBudget: m.number().int().positive().nullable(),
        tokensUsed: m.number().int().nonnegative(),
        timeUsedSeconds: m.number().int().nonnegative(),
        activeInputId: Ur.nullable().optional(),
        activeRunStartedAtMs: m.number().int().nonnegative().nullable().optional(),
        activeRunLastSeenAtMs: m.number().int().nonnegative().nullable().optional(),
        time: m.object({
            created: m.number().int().nonnegative(),
            updated: m.number().int().nonnegative()
        })
    }), Rcr = m.object({
        action: Acr,
        source: Pcr,
        target: $Ae.nullable(),
        previousTarget: $Ae.nullable().optional()
    }), u5i = ZGt, d5i = $Ae, p5i = Rcr, SYe = m.object({
        taskId: Ur,
        traceId: Ur,
        title: m.string(),
        titleOverridden: m.boolean().optional(),
        workspacePath: Ur,
        workspaceIdentity: Ur.optional(),
        workspacePurpose: m.enum(["project", "conversation"]).optional(),
        createdAt: m.number().int().nonnegative(),
        updatedAt: m.number().int().nonnegative(),
        mode: Ree,
        model: m.string().optional(),
        thoughtLevel: Ur.optional(),
        runtimeEpoch: m.number().int().nonnegative().optional(),
        provider: OO.optional(),
        migrationSource: Ear.optional(),
        forkedFromTaskId: Ur.optional(),
        cronAutomationId: Ur.optional(),
        offPeakTaskId: Ur.optional(),
        unreadAt: m.number().int().nonnegative().optional(),
        status: Scr.optional(),
        lastError: m.object({
            code: m.string().optional(),
            detail: m.string().optional(),
            message: m.string().min(1),
            traceId: Ur.optional(),
            taskId: Ur.optional(),
            attribution: Bj.optional()
        }).optional(),
        repairState: m.object({
            claudeNativeSnapshotAssistantContentVersion: m.number().int().nonnegative().optional(),
            codexNativeSnapshotSubagentToolsVersion: m.number().int().nonnegative().optional()
        }).optional(),
        changeSummary: m.object({
            fileCount: m.number().int().nonnegative(),
            added: m.number().int().nonnegative(),
            removed: m.number().int().nonnegative(),
            files: m.array(m.object({
                path: m.string(),
                added: m.number().int().nonnegative(),
                removed: m.number().int().nonnegative(),
                writeCount: m.number().int().positive(),
                lastTurnIndex: m.number().int().nonnegative()
            }))
        }).optional(),
        target: $Ae.nullable().optional()
    }), Dcr = m.enum(["idle", "syncing", "ready", "stale", "failed"]), f5i = m.object({
        provider: OO,
        sessionId: Ur,
        lastSyncedTurnIndex: m.number().int(),
        state: Dcr
    }), Ocr = m.object({
        workspaceHash: Ur,
        taskId: Ur
    }), m5i = m.object({
        version: m.literal("1"),
        tasks: m.array(Ocr)
    }), h5i = m.object({
        path: m.string(),
        beforeContent: m.string().nullable(),
        afterContent: m.string(),
        writeCount: m.number().int().positive(),
        contentRefs: m.array(m.object({
            field: m.enum(["beforeContent", "afterContent"]),
            refId: m.string(),
            hash: m.string(),
            fullBytes: m.number().int().nonnegative(),
            previewBytes: m.number().int().nonnegative()
        })).optional()
    }), g5i = m.object({
        turnIndex: m.number().int().nonnegative(),
        snapshots: m.array(h5i),
        fileState: m.enum(["applied", "reverted"]).optional()
    }), _5i = m.object({
        turnIndex: m.number().int().nonnegative(),
        baseFileCheckpointId: Ur,
        resultFileCheckpointId: Ur.optional()
    }), y5i = m.object({
        meta: SYe,
        messages: m.array(Ecr),
        fileChanges: m.array(g5i).optional(),
        turnCheckpoints: m.array(_5i).optional()
    })
});
var XGt, Mcr = Y(() => {
    XGt = class extends Error {
        static {
            r(this, "ApiError")
        }
        url;
        method;
        status;
        responseHeaders;
        constructor(t) {
            super(t.message, t.cause === void 0 ? void 0 : {
                cause: t.cause
            }), this.name = "ApiError", this.url = t.url, this.method = (t.method ?? "GET").toUpperCase(), this.status = t.status, this.responseHeaders = t.responseHeaders
        }
    }
});

function Lcr(e) {
    let t = e.indexOf(".");
    if (!(t <= 0 || t !== e.lastIndexOf(".") || !e.slice(0, t).trim() || !e.slice(t + 1).trim())) return {
        apiKeyId: e.slice(0, t),
        apiKeySecret: e.slice(t + 1),
        credential: e
    }
}

function qAe(e, t) {
    return t.aborted ? Promise.reject(t.reason ?? new DOMException("The operation was aborted.", "AbortError")) : new Promise((n, o) => {
        let s = r(() => {
                a(), o(t.reason ?? new DOMException("The operation was aborted.", "AbortError"))
            }, "onAbort"),
            a = r(() => t.removeEventListener("abort", s), "cleanup");
        t.addEventListener("abort", s, {
            once: !0
        }), e.then(l => {
            a(), n(l)
        }, l => {
            a(), o(l)
        })
    })
}
async function Fcr(e, t) {
    let n = new Request(e, t),
        o = n.method === "GET" || n.method === "HEAD" ? void 0 : new Uint8Array(await n.arrayBuffer());
    return {
        ...o ? {
            body: o
        } : {},
        cache: n.cache,
        credentials: n.credentials,
        headers: wYe(n.headers),
        integrity: n.integrity,
        keepalive: n.keepalive,
        method: n.method,
        mode: n.mode,
        redirect: n.redirect,
        referrer: n.referrer,
        referrerPolicy: n.referrerPolicy,
        signal: n.signal,
        ...t?.timeoutMs ? {
            timeoutMs: t.timeoutMs
        } : {},
        url: n.url
    }
}

function QGt(e, t) {
    return {
        ...e.body ? {
            body: e.body.slice()
        } : {},
        cache: e.cache,
        credentials: e.credentials,
        headers: t,
        integrity: e.integrity,
        keepalive: e.keepalive,
        method: e.method,
        mode: e.mode,
        redirect: e.redirect,
        referrer: e.referrer,
        referrerPolicy: e.referrerPolicy,
        signal: e.signal,
        ...e.timeoutMs ? {
            timeoutMs: e.timeoutMs
        } : {}
    }
}

function wYe(e) {
    let t = new Headers(e);
    for (let n of S5i) t.delete(n);
    return t
}
async function jcr(e) {
    let t = await e.json();
    if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("invalid response envelope");
    return t
}

function Bcr(e) {
    return typeof e == "string" && /^HANDSHAKE_[A-Z_]+$/.test(e) ? e : void 0
}
async function eJt(e) {
    if (e.status === 401) try {
        let t = await e.clone().json();
        if (!t || typeof t != "object" || Array.isArray(t)) return;
        let n = t,
            o = Ncr(n.data),
            s = Ncr(n.error),
            a = [n.msg, n.reason, o?.reason, s?.reason, s?.message].find(l => l === v5i || l === b5i);
        return typeof a == "string" ? a : void 0
    } catch {
        return
    }
}

function Ncr(e) {
    return e && typeof e == "object" && !Array.isArray(e) ? e : void 0
}
var v5i, b5i, S5i, tJt = Y(() => {
    v5i = "VERIFY_SIGNATURE_INVALID", b5i = "VERIFY_APIKEY_EXPIRED", S5i = ["X-Client-Ts", "X-Client-Version", "X-Client-Sig", "X-Client-Nonce", "X-Client-Pow", "X-App-Id", "X-Client-Sign-Verified"];
    r(Lcr, "parseClientSigningCredential");
    r(qAe, "waitForSigningPromiseOrAbort");
    r(Fcr, "makeReplayableSigningRequest");
    r(QGt, "buildSigningRequestInit");
    r(wYe, "sanitizeClientSigningHeaders");
    r(jcr, "readClientSigningHandshakeResponse");
    r(Bcr, "readClientSigningHandshakeReason");
    r(eJt, "readRefreshableClientSignatureReason");
    r(Ncr, "asRecord")
});

function nJt(e) {
    return e !== null && typeof e == "object" && !Array.isArray(e) ? e : void 0
}
var rJt, Ucr, zcr, WAe, $cr = Y(() => {
    tJt();
    rJt = "/api/v1/agent/configs", Ucr = 3600 * 1e3, zcr = 15e3, WAe = class {
        static {
            r(this, "CodingPlanSignatureFeatureGate")
        }
        cacheTtlMs;
        headers;
        now;
        onResult;
        timeoutMs;
        transport;
        url;
        requestPromise;
        snapshot;
        constructor(t) {
            this.cacheTtlMs = t.cacheTtlMs ?? Ucr, this.headers = t.headers, this.now = t.now ?? Date.now, this.onResult = t.onResult, this.timeoutMs = t.timeoutMs ?? zcr, this.transport = t.transport, this.url = t.url
        }
        async isEnabled(t) {
            if (this.snapshot && this.snapshot.expiresAt > this.now()) return this.snapshot.enabled;
            if (!this.requestPromise) {
                let o = this.fetchFeatureResult().then(a => (this.report(a), a));
                this.requestPromise = o;
                let s = r(() => {
                    this.requestPromise === o && (this.requestPromise = void 0)
                }, "clearRequest");
                o.then(s, s)
            }
            let n = t ? await qAe(this.requestPromise, t) : await this.requestPromise;
            return n.cacheable && (this.snapshot = {
                enabled: n.enabled,
                expiresAt: this.now() + this.cacheTtlMs
            }), n.enabled
        }
        report(t) {
            try {
                this.onResult?.(t)
            } catch {}
        }
        async fetchFeatureResult() {
            let t = new AbortController,
                n = setTimeout(() => t.abort(), this.timeoutMs),
                o;
            try {
                if (o = await this.transport(typeof this.url == "function" ? this.url() : this.url, {
                        headers: typeof this.headers == "function" ? this.headers() : this.headers,
                        method: "GET",
                        redirect: "manual",
                        signal: t.signal
                    }), !o.ok) return {
                    cacheable: !1,
                    enabled: !1,
                    failure: "http_status",
                    httpStatus: o.status
                };
                let s = nJt(await o.json());
                if (s?.code !== 0) return {
                    cacheable: !1,
                    enabled: !1,
                    failure: "business_code",
                    httpStatus: o.status
                };
                let a = nJt(s.data);
                return !a || !Object.prototype.hasOwnProperty.call(a, "codingPlanSignature") ? {
                    cacheable: !0,
                    enabled: !1,
                    httpStatus: o.status
                } : {
                    cacheable: !0,
                    enabled: nJt(a.codingPlanSignature)?.enable === !0,
                    httpStatus: o.status
                }
            } catch {
                return {
                    cacheable: !1,
                    enabled: !1,
                    failure: o ? "malformed" : t.signal.aborted ? "timeout" : "network",
                    ...o ? {
                        httpStatus: o.status
                    } : {}
                }
            } finally {
                clearTimeout(n)
            }
        }
    };
    r(nJt, "asRecord")
});
async function Wcr(e, t) {
    let n = await Jcr(e, x5i);
    try {
        let o = await crypto.subtle.importKey("raw", n, {
                hash: "SHA-256",
                name: "HMAC"
            }, !1, ["sign"]),
            s = new Uint8Array(await crypto.subtle.sign("HMAC", o, SV(t)));
        try {
            return Kcr(s)
        } finally {
            s.fill(0)
        }
    } finally {
        n.fill(0)
    }
}
async function Vcr(e, t, n) {
    let o, s, a;
    try {
        let l = qcr(n);
        if (l.byteLength <= 12 + 128 / 8) throw new Error("privateCipher is too short");
        o = await Jcr(t, k5i);
        let u = await crypto.subtle.importKey("raw", o, "AES-GCM", !1, ["decrypt"]);
        return s = new Uint8Array(await crypto.subtle.decrypt({
            additionalData: SV(e),
            iv: l.slice(0, 12),
            name: "AES-GCM",
            tagLength: 128
        }, u, l.slice(12))), a = qcr(new TextDecoder().decode(s)), await crypto.subtle.importKey("pkcs8", a, "Ed25519", !1, ["sign"])
    } finally {
        o?.fill(0), s?.fill(0), a?.fill(0)
    }
}
async function Hcr(e, t) {
    let n = new Uint8Array(await crypto.subtle.sign("Ed25519", e, SV(t)));
    try {
        return Kcr(n)
    } finally {
        n.fill(0)
    }
}
async function Gcr(e) {
    if (!Number.isInteger(e.powBits) || e.powBits < 0 || e.powBits > 32) throw new Error("powBits must be an integer between 0 and 32");
    e.signal?.throwIfAborted();
    let t = new Uint8Array(await crypto.subtle.digest("SHA-256", SV(`${e.apiKeyId}
${e.appId}
${e.sessionId}
${e.ts}`))),
        n = I5i(t).slice(0, 32),
        o = kYe(12);
    for (let s = 0; s <= 4294967295; s += 1) {
        e.signal?.throwIfAborted();
        let a = `${o}${s.toString(16).padStart(8,"0")}`,
            l = new Uint8Array(await crypto.subtle.digest("SHA-256", SV(`${n}
${a}`)));
        if (T5i(l, e.powBits)) return a
    }
    throw new Error("Unable to solve client request proof of work")
}

function kYe(e) {
    let t = crypto.getRandomValues(new Uint8Array(e));
    return Array.from(t, n => n.toString(16).padStart(2, "0")).join("")
}

function T5i(e, t) {
    let n = Math.floor(t / 8);
    for (let a = 0; a < n; a += 1)
        if (e[a] !== 0) return !1;
    let o = t % 8;
    if (o === 0) return !0;
    let s = 255 << 8 - o & 255;
    return ((e[n] ?? 255) & s) === 0
}
async function Jcr(e, t) {
    let n = await crypto.subtle.importKey("raw", SV(e), "HKDF", !1, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits({
        hash: "SHA-256",
        info: SV(t),
        name: "HKDF",
        salt: SV(w5i)
    }, n, 256))
}

function SV(e) {
    return new TextEncoder().encode(e)
}

function Kcr(e) {
    let t = "";
    for (let n of e) t += String.fromCharCode(n);
    return btoa(t)
}

function I5i(e) {
    return Array.from(e, t => t.toString(16).padStart(2, "0")).join("")
}

function qcr(e) {
    if (!e || e.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(e)) throw new Error("invalid base64");
    let t = atob(e);
    return Uint8Array.from(t, n => n.charCodeAt(0))
}
var w5i, k5i, x5i, Zcr = Y(() => {
    w5i = "WD_CLIENT_SIGN_KDF_SALT", k5i = "ed25519_priv", x5i = "getSignKey_hmac";
    r(Wcr, "createHandshakeSignature");
    r(Vcr, "decryptSigningPrivateKey");
    r(Hcr, "signBusinessMessage");
    r(Gcr, "createClientRequestProofOfWork");
    r(kYe, "randomHex");
    r(T5i, "hasLeadingZeroBits");
    r(Jcr, "deriveBytes");
    r(SV, "encodeUtf8");
    r(Kcr, "bytesToBase64");
    r(I5i, "bytesToHex");
    r(qcr, "base64ToBytes")
});

function Qcr() {
    return {
        epoch: 0
    }
}

function R5i(e, t) {
    let n;
    try {
        n = new URL(e)
    } catch (o) {
        throw Bx("invalid-config", "Client signing requires a valid baseURL.", {
            cause: o
        })
    }
    if (n.protocol !== "https:" && !(t && n.protocol === "http:")) throw Bx("invalid-config", "Client signing handshake requires HTTPS.");
    return new URL(E5i, n.origin).toString()
}

function Bx(e, t, n = {}) {
    return new Fee({
        kind: e,
        message: t,
        ...n
    })
}

function D5i(e) {
    return e instanceof Fee && e.failOpenEligible
}
var C5i, E5i, Ycr, A5i, Xcr, P5i, Fee, VAe, HAe, oJt, elr = Y(() => {
    sWt();
    Zcr();
    tJt();
    C5i = "get_sign_key", E5i = "/api/paas/c1f3a7e2/v2/client", Ycr = "zcode", A5i = 1e4, Xcr = 16, P5i = 8, Fee = class extends Error {
        static {
            r(this, "ClientRequestSigningV4Error")
        }
        kind;
        failOpenEligible;
        reason;
        httpStatus;
        businessCode;
        constructor(t) {
            super(t.message, t.cause === void 0 ? void 0 : {
                cause: t.cause
            }), this.name = "ClientRequestSigningV4Error", this.kind = t.kind, this.failOpenEligible = t.failOpenEligible ?? !1, this.reason = t.reason, this.httpStatus = t.httpStatus, this.businessCode = t.businessCode
        }
    }, VAe = class {
        static {
            r(this, "ClientRequestSigningV4KeyCache")
        }
        entries = new Map;
        resolve(t, n) {
            let o = this.entries.get(t);
            o || (o = new Map, this.entries.set(t, o));
            let s = new URL(n).origin,
                a = o.get(s);
            if (a) return a;
            let l = Qcr();
            return o.set(s, l), l
        }
    }, HAe = class {
        static {
            r(this, "ClientRequestSigningV4Manager")
        }
        entries = new Map;
        allowInsecureHttp;
        isEnabled;
        keyCache;
        observer;
        constructor(t = {}) {
            this.allowInsecureHttp = t.allowInsecureHttp ?? !1, this.isEnabled = t.isEnabled ?? (async () => !1), this.keyCache = t.keyCache, this.observer = t.observer
        }
        createFetch(t, n) {
            let o = this.resolveSigner(t, n);
            return (s, a) => o.request(s, a)
        }
        dispose(t) {
            if (t) {
                this.entries.get(t)?.signer.dispose(), this.entries.delete(t);
                return
            }
            for (let n of this.entries.values()) n.signer.dispose();
            this.entries.clear()
        }
        resolveSigner(t, n) {
            let o = t.clientVersion ?? LL,
                s = this.entries.get(t.providerId);
            if (s?.apiKey === t.apiKey && s.baseURL === t.baseURL && s.clientVersion === o && s.transport === n) return s.signer;
            s?.signer.dispose();
            let a = new oJt(t, n, {
                allowInsecureHttp: this.allowInsecureHttp,
                isEnabled: this.isEnabled,
                keyCache: this.keyCache,
                observer: this.observer
            });
            return this.entries.set(t.providerId, {
                apiKey: t.apiKey,
                baseURL: t.baseURL,
                clientVersion: o,
                signer: a,
                transport: n
            }), a
        }
    }, oJt = class {
        static {
            r(this, "ClientRequestSigningV4Signer")
        }
        apiKey;
        clientVersion;
        credential;
        businessOrigin;
        handshakeUrl;
        isEnabled;
        keyState;
        ownsKeyState;
        transport;
        observer;
        providerId;
        activeRequestCount = 0;
        bypassSigning = !1;
        disposed = !1;
        disposeRequested = !1;
        constructor(t, n, o) {
            this.apiKey = t.apiKey, this.clientVersion = t.clientVersion?.trim() || LL, this.handshakeUrl = R5i(t.baseURL, o.allowInsecureHttp ?? !1), this.businessOrigin = new URL(this.handshakeUrl).origin, this.isEnabled = o.isEnabled ?? (async () => !1), this.keyState = o.keyCache?.resolve(this.apiKey, this.handshakeUrl) ?? Qcr(), this.ownsKeyState = !o.keyCache, this.transport = n, this.observer = o.observer, this.providerId = t.providerId
        }
        dispose() {
            this.disposeRequested || this.disposed || (this.disposeRequested = !0, !(this.activeRequestCount > 0) && this.finalizeDispose())
        }
        beginRequest() {
            if (this.disposeRequested || this.disposed) throw Bx("disposed", "Client request signer has been disposed.");
            this.activeRequestCount += 1
        }
        endRequest() {
            this.activeRequestCount -= 1, this.activeRequestCount === 0 && this.disposeRequested && this.finalizeDispose()
        }
        finalizeDispose() {
            this.disposed = !0, this.ownsKeyState && (this.keyState.epoch += 1, this.keyState.privateKey = void 0, this.keyState.handshakePromise = void 0)
        }
        async request(t, n) {
            this.beginRequest();
            let o;
            try {
                if (o = await Fcr(t, n), new URL(o.url).origin !== this.businessOrigin) return await this.sendUnsigned(o, "origin_mismatch");
                if (this.bypassSigning) return await this.sendUnsigned(o, "bypass");
                try {
                    if (!await this.isEnabled(this.apiKey, o.signal)) return await this.sendUnsigned(o, "feature_gate_disabled")
                } catch (_) {
                    if (o.signal?.aborted) throw _;
                    return await this.sendUnsigned(o, "feature_gate_unavailable")
                }
                let a = await this.getKeyOrSendUnsigned(o);
                if (a instanceof Response) return a;
                let l = await this.sendSigned(o, a, 1),
                    u = await eJt(l);
                if (!u) return l;
                if (this.observe(o, {
                        kind: "verify_rejected",
                        reason: u,
                        signedAttempt: 1
                    }), this.invalidatePrivateKey(a), a = await this.getKeyOrSendUnsigned(o), a instanceof Response) return a;
                let f = await this.sendSigned(o, a, 2),
                    g = await eJt(f);
                return g ? (this.observe(o, {
                    kind: "verify_rejected",
                    reason: g,
                    signedAttempt: 2
                }), this.invalidatePrivateKey(a), this.bypassSigning = !0, this.observe(o, {
                    kind: "bypass_entered"
                }), await this.sendUnsigned(o, "verify_refresh_exhausted")) : f
            } catch (s) {
                throw s instanceof Fee && !o?.signal?.aborted && this.observe(o, {
                    errorKind: s.kind,
                    kind: "request_failed_closed"
                }), s
            } finally {
                this.endRequest()
            }
        }
        observe(t, n) {
            if (!this.observer) return;
            let o = t?.headers.get("x-request-id")?.trim() || void 0,
                s = t?.headers.get("x-session-id")?.trim() || void 0;
            try {
                this.observer({
                    observation: n,
                    providerId: this.providerId,
                    ...o ? {
                        requestId: o
                    } : {},
                    ...s ? {
                        sessionId: s
                    } : {}
                })
            } catch {}
        }
        async getKeyOrSendUnsigned(t) {
            try {
                return await this.ensurePrivateKey(t)
            } catch (n) {
                if (D5i(n)) return this.sendUnsigned(t, "handshake_failed");
                throw n
            }
        }
        async sendSigned(t, n, o) {
            let s = this.resolveCredential(),
                a = t.headers.get("X-Session-Id")?.trim();
            if (!a) throw Bx("invalid-config", "Client request signing requires X-Session-Id.");
            let l = wYe(t.headers),
                u = String(Date.now()),
                f = kYe(Xcr),
                g;
            try {
                g = await Gcr({
                    apiKeyId: s.apiKeyId,
                    appId: Ycr,
                    powBits: P5i,
                    sessionId: a,
                    signal: t.signal,
                    ts: u
                })
            } catch (b) {
                throw t.signal?.aborted ? b : Bx("cryptography", "Client request proof of work failed.", {
                    cause: b
                })
            }
            let _;
            try {
                _ = await Hcr(n, `${s.apiKeyId}
${u}
${this.clientVersion}
${a}
${f}`)
            } catch (b) {
                throw Bx("cryptography", "Client request signing failed.", {
                    cause: b
                })
            }
            return l.set("X-Client-Ts", u), l.set("X-Client-Version", this.clientVersion), l.set("X-Client-Sig", _), l.set("X-Session-Id", a), l.set("X-Client-Nonce", f), l.set("X-App-Id", Ycr), l.set("X-Client-Pow", g), this.observe(t, {
                kind: "signed_sent",
                signedAttempt: o
            }), this.transport(t.url, QGt(t, l))
        }
        sendUnsigned(t, n) {
            return this.observe(t, {
                kind: "unsigned_sent",
                reason: n
            }), this.transport(t.url, QGt(t, wYe(t.headers)))
        }
        invalidatePrivateKey(t) {
            this.keyState.privateKey === t && (this.keyState.epoch += 1, this.keyState.privateKey = void 0, this.keyState.handshakePromise = void 0)
        }
        async ensurePrivateKey(t) {
            let n = t.signal;
            if (this.disposed) throw Bx("disposed", "Client request signer has been disposed.");
            if (this.keyState.privateKey) return this.keyState.privateKey;
            if (this.resolveCredential(), this.keyState.handshakePromise) return n ? qAe(this.keyState.handshakePromise, n) : this.keyState.handshakePromise;
            let o = this.keyState.epoch,
                s = this.performHandshake().catch(l => {
                    throw l instanceof Fee && this.observe(t, {
                        errorKind: l.kind,
                        kind: "handshake_failed",
                        ...l.httpStatus !== void 0 ? {
                            httpStatus: l.httpStatus
                        } : {},
                        ...l.businessCode !== void 0 ? {
                            businessCode: l.businessCode
                        } : {},
                        ...l.reason ? {
                            reason: l.reason
                        } : {}
                    }), l
                }).then(l => {
                    if (this.ownsKeyState && this.disposed || this.keyState.epoch !== o) throw Bx("disposed", "Client request signer changed during handshake.");
                    return this.keyState.privateKey = l, l
                });
            this.keyState.handshakePromise = s;
            let a = r(() => {
                this.keyState.handshakePromise === s && (this.keyState.handshakePromise = void 0)
            }, "clearHandshake");
            return s.then(a, a), n ? qAe(s, n) : s
        }
        async performHandshake() {
            let t = this.resolveCredential(),
                n = String(Date.now()),
                o = kYe(Xcr),
                s;
            try {
                s = await Wcr(t.apiKeySecret, `${C5i}
${t.apiKeyId}
${n}
${o}`)
            } catch (u) {
                throw Bx("cryptography", "Client signing handshake signature failed.", {
                    cause: u,
                    failOpenEligible: !0
                })
            }
            let a = new AbortController,
                l = setTimeout(() => a.abort(), A5i);
            try {
                let u;
                try {
                    u = await this.transport(this.handshakeUrl, {
                        body: JSON.stringify({
                            apiKey: t.credential,
                            nonce: o,
                            sig: s,
                            ts: n
                        }),
                        headers: {
                            Authorization: t.credential,
                            "Content-Type": "application/json"
                        },
                        method: "POST",
                        redirect: "manual",
                        signal: a.signal
                    })
                } catch (_) {
                    let b = a.signal.aborted;
                    throw Bx(b ? "handshake-timeout" : "handshake-network", b ? "Client signing handshake timed out." : "Client signing handshake failed.", {
                        cause: _,
                        failOpenEligible: !0
                    })
                }
                if (u.status !== 200) throw Bx("handshake-protocol", "Client signing handshake HTTP status is invalid.", {
                    failOpenEligible: !0,
                    httpStatus: u.status
                });
                let f;
                try {
                    f = await jcr(u)
                } catch (_) {
                    let b = a.signal.aborted;
                    throw Bx(b ? "handshake-timeout" : "handshake-protocol", b ? "Client signing handshake timed out." : "Client signing handshake JSON is invalid.", {
                        cause: _,
                        failOpenEligible: !0
                    })
                }
                if (clearTimeout(l), f.code === 500) throw Bx("handshake-server", "Client signing handshake reported code 500.", {
                    businessCode: 500,
                    failOpenEligible: !0
                });
                if (f.code !== 200) {
                    let _ = Bcr(f.msg);
                    throw Bx("handshake-business", "Client signing handshake was rejected.", {
                        ...typeof f.code == "number" ? {
                            businessCode: f.code
                        } : {},
                        failOpenEligible: !0,
                        reason: _
                    })
                }
                let g = f.data?.privateCipher;
                if (typeof g != "string" || !g) throw Bx("handshake-protocol", "Client signing handshake omitted privateCipher.", {
                    failOpenEligible: !0
                });
                try {
                    return await Vcr(t.apiKeyId, t.apiKeySecret, g)
                } catch (_) {
                    throw Bx("cryptography", "Client signing private key is invalid.", {
                        cause: _,
                        failOpenEligible: !0
                    })
                }
            } finally {
                clearTimeout(l)
            }
        }
        resolveCredential() {
            if (this.credential) return this.credential;
            let t = Lcr(this.apiKey);
            if (!t) throw Bx("invalid-config", "Client signing credential must contain one separator.");
            return this.credential = t, t
        }
    };
    r(Qcr, "createClientRequestSigningV4KeyState");
    r(R5i, "resolveHandshakeUrl");
    r(Bx, "signingError");
    r(D5i, "isFailOpenEligible")
});
var tlr = Y(() => {});

function M5i(e) {
    return e === "ssh" || e === "wsl" || e === "docker" || e === "server"
}

function nlr(e) {
    return `/${e.replace(/\\/g,"/").replace(/\/+/g,"/").replace(/^\/+|\/+$/g,"")}`
}

function N5i(e) {
    let t = e.serverId?.trim() || e.name?.trim();
    if (t) return t;
    try {
        return new URL(e.url.trim()).host
    } catch {
        return e.url.trim()
    }
}

function L5i(e) {
    let t = e.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!t) throw new Error("serverId must contain at least one identity-safe character");
    return t
}

function rlr(e) {
    let t = L5i(e.serverId),
        n = nlr(e.workspacePath);
    return `${iJt}server:${t}:${n}`
}

function F5i(e, t) {
    let n = nlr(e);
    switch (t.kind) {
        case "ssh":
            return `remote:ssh:${t.host.trim().toLowerCase()}:${t.port??22}:${t.username.trim()}:${n}`;
        case "wsl": {
            let o = t.distro?.trim() || "default",
                s = t.user?.trim();
            return s ? `remote:wsl:${o}:${s}:${n}` : `remote:wsl:${o}:${n}`
        }
        case "docker":
            return `remote:docker:${t.container}:${n}`;
        case "server":
            return rlr({
                serverId: N5i(t),
                workspacePath: n
            })
    }
}

function lA(e) {
    if (!e.startsWith(iJt)) return null;
    let t = e.slice(iJt.length),
        n = t.indexOf(":");
    if (n <= 0) return null;
    let o = t.slice(0, n);
    if (!M5i(o)) return null;
    let s = n + 1;
    for (let l = 0; l < O5i[o]; l++) {
        let u = t.indexOf(":", s);
        if (u <= s) return null;
        s = u + 1
    }
    if (o === "wsl" && t[s] !== "/") {
        let l = t.indexOf(":", s);
        if (l <= s) return null;
        s = l + 1
    }
    let a = t.slice(s);
    return a.startsWith("/") ? {
        kind: o,
        workspacePath: a
    } : null
}

function sJt(e) {
    return lA(e) !== null
}
var iJt, O5i, aJt = Y(() => {
    iJt = "remote:", O5i = {
        ssh: 3,
        wsl: 1,
        docker: 1,
        server: 1
    };
    r(M5i, "isRemoteWorkspaceIdentityKind");
    r(nlr, "normalizeWorkspacePathForIdentity");
    r(N5i, "resolveServerIdentityId");
    r(L5i, "normalizeServerIdForIdentity");
    r(rlr, "buildServerRemoteWorkspaceIdentity");
    r(F5i, "buildRemoteWorkspaceIdentity");
    r(lA, "parseRemoteWorkspaceIdentity");
    r(sJt, "isRemoteWorkspaceIdentity")
});

function olr(e) {
    if (e === null) return null;
    let t = ilr(e);
    if (Object.keys(t).length === 0) return;
    let n = GAe(t.attempt) ?? Math.max((GAe(t.nextAttempt) ?? 2) - 1, 1),
        o = Math.max(Hpe(t.maxRetries) ?? (GAe(t.maxAttempts) ?? n + 1) - 1, n);
    return {
        kind: "api_retry",
        attempt: n,
        maxRetries: o,
        retryDelayMs: Hpe(t.retryDelayMs) ?? Hpe(t.delayMs) ?? 0,
        errorStatus: Hpe(t.errorStatus) ?? Hpe(t.statusCode) ?? null,
        error: kz(t.error) ?? kz(t.message) ?? kz(t.reason) ?? "Model retry scheduled"
    }
}

function cJt(e) {
    let t = kz(e.type);
    if (t === "model_retry_scheduled") return olr(e);
    if (t === "model_request_started") {
        let n = xYe(e.streamRecovery);
        if (n !== void 0) return n;
        if ((GAe(e.attempt) ?? 1) <= 1) return null
    }
    if (t === "model_request_completed" || t === "model_request_failed" && e.retryable !== !0) return null
}

function lJt(e) {
    let t = kz(e.kind);
    return t === "text_delta" || t === "reasoning_delta" ? !!kz(e.delta) : kz(e.toolCallId) ? t === "tool_input_start" || t === "tool_input_end" || t === "tool_call" ? !0 : t === "tool_input_delta" ? !!kz(e.delta) : !1 : !1
}

function xYe(e) {
    let t = ilr(e),
        n = GAe(t.retryNumber);
    if (n !== void 0) return {
        kind: "api_retry",
        attempt: n,
        maxRetries: Math.max(Hpe(t.maxRetries) ?? n, n),
        retryDelayMs: 0,
        errorStatus: null,
        error: kz(t.message) ?? "Model stream recovery retry started"
    }
}

function ilr(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) ? e : {}
}

function kz(e) {
    return typeof e == "string" ? e : void 0
}

function Hpe(e) {
    return typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : void 0
}

function GAe(e) {
    return typeof e == "number" && Number.isInteger(e) && e > 0 ? e : void 0
}
var slr = Y(() => {
    r(olr, "normalizeZCodeApiRetryStatus");
    r(cJt, "zcodeApiRetryFromModelNetworkStatusPayload");
    r(lJt, "isZCodeModelRetryRecoveryProgressPayload");
    r(xYe, "zcodeApiRetryFromStreamRecoveryPayload");
    r(ilr, "asRecord");
    r(kz, "stringValue");
    r(Hpe, "nonNegativeIntegerValue");
    r(GAe, "positiveIntegerValue")
});

function uJt(e) {
    let t = B5i(e.payload.type);
    if (!t) return null;
    let n = alr(e.payload.requestHeaders),
        o = alr(e.payload.responseHeaders),
        s = llr(e.payload.model),
        a = uw(e.payload.requestId),
        l = uw(e.payload.queryId),
        u = e.queryId ?? l,
        f = JAe(e.payload.attempt),
        g = uw(e.payload.timestamp),
        _ = e.eventId ?? [e.traceId, e.inputId ?? "no-input", t, a ?? "no-request", f ?? "no-attempt", g ?? "no-time"].join(":");
    return {
        type: "task_network_debug_status",
        taskId: e.taskId,
        traceId: e.traceId,
        ...e.inputId ? {
            inputId: e.inputId
        } : {},
        ...u ? {
            queryId: u
        } : {},
        eventKey: _,
        ...e.eventId ? {
            eventId: e.eventId
        } : {},
        statusType: t,
        ...a ? {
            requestId: a
        } : {},
        ...uw(s.providerId) ? {
            providerId: uw(s.providerId)
        } : {},
        ...uw(s.modelId) ? {
            modelId: uw(s.modelId)
        } : {},
        ...uw(e.payload.providerKind) ? {
            providerKind: uw(e.payload.providerKind)
        } : {},
        ...uw(e.payload.transport) ? {
            transport: uw(e.payload.transport)
        } : {},
        ...uw(e.payload.baseURL) ? {
            baseURL: uw(e.payload.baseURL)
        } : {},
        ...uw(e.payload.querySource) ? {
            querySource: uw(e.payload.querySource)
        } : {},
        ...f !== void 0 ? {
            attempt: f
        } : {},
        ...JAe(e.payload.maxAttempts) !== void 0 ? {
            maxAttempts: JAe(e.payload.maxAttempts)
        } : {},
        ...JAe(e.payload.nextAttempt) !== void 0 ? {
            nextAttempt: JAe(e.payload.nextAttempt)
        } : {},
        ...clr(e.payload.retryable) !== void 0 ? {
            retryable: clr(e.payload.retryable)
        } : {},
        ...TYe(e.payload.statusCode) !== void 0 ? {
            statusCode: TYe(e.payload.statusCode)
        } : {},
        ...wV(e.payload.durationMs) !== void 0 ? {
            durationMs: wV(e.payload.durationMs)
        } : {},
        ...wV(e.payload.delayMs) !== void 0 ? {
            delayMs: wV(e.payload.delayMs)
        } : {},
        ...wV(e.payload.idleMs) !== void 0 ? {
            idleMs: wV(e.payload.idleMs)
        } : {},
        ...wV(e.payload.timeoutMs) !== void 0 ? {
            timeoutMs: wV(e.payload.timeoutMs)
        } : {},
        ...uw(e.payload.reason) ? {
            reason: uw(e.payload.reason)
        } : {},
        ...uw(e.payload.message) ? {
            message: uw(e.payload.message)
        } : {},
        ...g ? {
            timestamp: g
        } : {},
        requestHeaders: n,
        responseHeaders: o,
        requestHeaderCount: TYe(e.payload.requestHeaderCount) ?? Object.keys(n).length,
        responseHeaderCount: TYe(e.payload.responseHeaderCount) ?? Object.keys(o).length
    }
}

function B5i(e) {
    return typeof e == "string" && j5i.has(e) ? e : void 0
}

function llr(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) ? e : {}
}

function alr(e) {
    let t = llr(e);
    return Object.fromEntries(Object.entries(t).filter(n => typeof n[1] == "string").map(([n, o]) => [n, o]))
}

function uw(e) {
    return typeof e == "string" && e.length > 0 ? e : void 0
}

function clr(e) {
    return typeof e == "boolean" ? e : void 0
}

function wV(e) {
    return typeof e == "number" && Number.isFinite(e) && e >= 0 ? e : void 0
}

function TYe(e) {
    return Number.isInteger(e) && typeof e == "number" && e >= 0 ? e : void 0
}

function JAe(e) {
    return Number.isInteger(e) && typeof e == "number" && e > 0 ? e : void 0
}
var j5i, ulr = Y(() => {
    j5i = new Set(["model_request_started", "model_request_completed", "model_request_failed", "model_retry_scheduled", "model_stream_stalled"]);
    r(uJt, "zcodeTaskNetworkDebugStatusFromPayload");
    r(B5i, "networkStatusTypeValue");
    r(llr, "asRecord");
    r(alr, "stringRecordValue");
    r(uw, "stringValue");
    r(clr, "booleanValue");
    r(wV, "nonNegativeNumberValue");
    r(TYe, "nonNegativeIntegerValue");
    r(JAe, "positiveIntegerValue")
});

function Ux(e) {
    let t = e.info,
        n = e.parts ?? [],
        o = t.semantics;
    if (o?.kind === "compact_summary" || t.summary !== void 0) return "providerContextOnly";
    if (o) {
        if (o.kind === "timeline_event") return "timelineOnly";
        if (o.origin === "real_user" && t.synthetic !== !0 && t.visibility !== dJt) return "realUserInput";
        if (t.role === "assistant" && o.kind === "assistant_response" && o.uiVisibility === "visible" && o.transcriptVisibility === "visible") return "visibleAssistant";
        if (o.providerVisibility === "visible") return "providerContextOnly";
        if (o.kind === "fork_notice") return "timelineOnly";
        if (o.origin === "agent_runtime" || o.uiVisibility === "hidden" || o.transcriptVisibility === "hidden") return "hiddenSynthetic"
    }
    if (t.visibility === dJt || X5i(n)) return "providerContextOnly";
    if (Y5i(t, n)) return "timelineOnly";
    let s = dlr(t, n);
    return s === pJt ? "timelineOnly" : s && H5i.has(s) || Q5i(n) || (t.synthetic === !0 || n.some(a => a.synthetic === !0)) && plr(n) ? "providerContextOnly" : t.synthetic === !0 || n.some(a => a.synthetic === !0) ? "hiddenSynthetic" : t.role === "assistant" ? "visibleAssistant" : "realUserInput"
}

function jee(e) {
    return e.info.role === "user" && Ux(e) === "realUserInput"
}

function CYe(e) {
    if (e.info.role !== "user" || Ux(e) !== "providerContextOnly") return null;
    let t = dlr(e.info, e.parts ?? []);
    return t && G5i.has(t) ? t : plr(e.parts ?? []) ? "background_task" : null
}

function J5i(e) {
    return Ux(e) === "providerContextOnly"
}

function K5i(e) {
    return Ux(e) === "timelineOnly"
}

function Z5i(e) {
    return Ux(e) === "hiddenSynthetic"
}

function Y5i(e, t) {
    if (e.semantics?.kind === "timeline_event") return !0;
    let n = Gpe(e.metadata);
    return e.source === pJt || IYe(n?.source) === pJt ? !0 : t.some(o => {
        let s = Gpe(o.metadata);
        return o.type === "timeline" || eUi(s) || o.type === "compaction" && (typeof s?.timelineStatus == "string" || typeof o.summaryMessageId == "string")
    })
}

function X5i(e) {
    return e.some(t => {
        let n = Gpe(t.metadata);
        return n?.visibility === dJt || IYe(n?.source) === "goal-continuation"
    })
}

function dlr(e, t) {
    let n = Gpe(e.metadata);
    return e.source ?? IYe(n?.source) ?? e.semantics?.source ?? t.map(o => IYe(Gpe(o.metadata)?.source)).find(o => !!o)
}

function Q5i(e) {
    let t = flr(e).trimStart();
    return t.startsWith(U5i) || t.startsWith("<system-reminder>") && (t.includes(z5i) || t.includes($5i)) || V5i.some(n => t.includes(n))
}

function plr(e) {
    let t = flr(e).trimStart();
    return t.startsWith(q5i) || t.startsWith(W5i)
}

function flr(e) {
    return e.filter(t => t.type === "text" && t.ignored !== !0).map(t => t.text ?? "").join("")
}

function eUi(e) {
    let t = Gpe(e)?.forkContext;
    return typeof t == "object" && t !== null && !Array.isArray(t) && t.kind === "session_fork"
}

function Gpe(e) {
    return e && typeof e == "object" && !Array.isArray(e) ? e : void 0
}

function IYe(e) {
    return typeof e == "string" && e.length > 0 ? e : void 0
}
var dJt, pJt, U5i, z5i, $5i, q5i, W5i, V5i, H5i, G5i, fJt = Y(() => {
    dJt = "model-only", pJt = "fork", U5i = '<system-reminder source="goal-continuation">', z5i = "Continue working toward the active session goal.", $5i = "Current session goal state", q5i = "<task-notification>", W5i = "<subagent-notification>", V5i = ["Conversation rewind applied.", "Workspace rewind applied."], H5i = new Set(["agent_control_message", "background_task", "goal-continuation", "goal_completion_verification", "goal_state_change", "plugin_reference", "queued_system_notification", "resume_goal_state", "resume_referenced_session_context", "rewind", "selection_side_chat", "subagent", "subagent_message", "target_continuation", "task_notification", "task_status", "todo_reminder"]), G5i = new Set(["background_task", "task_notification", "subagent", "subagent_message", "goal-continuation", "target_continuation"]);
    r(Ux, "getConversationMessageProjectionPolicy");
    r(jee, "isConversationRealUserTurnStarter");
    r(CYe, "getConversationModelOnlyTurnTriggerSource");
    r(J5i, "isConversationProviderContextOnlyMessage");
    r(K5i, "isConversationTimelineOnlyMessage");
    r(Z5i, "isConversationHiddenSyntheticMessage");
    r(Y5i, "isTimelineOnlyMessage");
    r(X5i, "hasModelOnlyPart");
    r(dlr, "messageSource");
    r(Q5i, "hasLegacySystemReminderContextText");
    r(plr, "hasLegacyNotificationContextText");
    r(flr, "textFromParts");
    r(eUi, "hasSessionForkContext");
    r(Gpe, "metadataRecord");
    r(IYe, "stringValue")
});

function hJt(e) {
    let t = e.trimStart();
    return t.startsWith(tUi) ? !0 : t.startsWith("<system-reminder>") && t.includes(nUi)
}

function gJt(e) {
    return e.info.role === "user" && (e.info.source === "goal-continuation" || String(e.info.metadata?.source ?? "") === "goal-continuation" || hJt(kee(e.parts)))
}

function _Jt(e) {
    let t = e.trimStart();
    return t.startsWith("<system-reminder>") && t.includes(rUi)
}

function mlr(e) {
    return e.info.role === "user" && (gJt(e) || _Jt(kee(e.parts)))
}

function hlr(e) {
    if (e.info.role === "user" && (String(e.info.source ?? "") === mJt || String(e.info.metadata?.source ?? "") === mJt || e.parts.some(n => n.type === "text" && String(n.metadata?.source ?? "") === mJt))) return !0;
    let t = Ux(e);
    return t === "providerContextOnly" || t === "hiddenSynthetic"
}

function glr(e) {
    return e.info.role === "user" && e.parts.some(t => t.type !== "compaction" ? !1 : typeof t.metadata?.timelineStatus != "string")
}

function yJt(e, t = {}) {
    let n = [];
    for (let o of e) hlr(o) || glr(o) || n.push(o);
    return n
}

function oUi(e, t = {}) {
    let n = t.target ?? null;
    if (!n) return new Map;
    let o = new Map,
        s = [...e].sort(iUi),
        a = n.status === "active" ? null : n.updatedAt,
        l = 0,
        u = !1;
    for (let f of s) {
        if (f.info.role === "user") {
            if (gJt(f)) {
                l += 1, u = !1;
                continue
            }
            sUi(f, n) && (u = !0);
            continue
        }
        if (f.info.role === "assistant" && !(a !== null && f.info.time.created > a) && (u && (l += 1, u = !1), l === 0 && f.info.time.created >= n.createdAt && (l = 1), l > 0)) {
            let g = t.maxGoalIteration && t.maxGoalIteration > 0 ? Math.min(l, t.maxGoalIteration) : l;
            o.set(f.info.messageId, g)
        }
    }
    return o
}

function vJt(e) {
    if (!e.targetStatus) return 0;
    let t = e.timeline ?? [];
    if (t.length === 0) return 1;
    let n = t[t.length - 1];
    if (!n) return 1;
    let o = n.goalIteration ?? t.length;
    return n.status === "started" || n.status === "completed" && n.verification?.passed === !0 || e.targetStatus === "complete" || e.targetStatus !== "active" ? o : o + 1
}

function iUi(e, t) {
    let n = e.info.time.created - t.info.time.created;
    return n !== 0 ? n : e.info.messageId.localeCompare(t.info.messageId)
}

function sUi(e, t) {
    return !(e.info.role !== "user" || Ux(e) !== "realUserInput" || !(e.info.time.created >= t.createdAt - 3e4))
}

function aUi(e) {
    let t = e.title?.trim() ?? "";
    if (t && !hJt(t) && !_Jt(t)) return t;
    let n = e.messages.find(a => a.info.role === "user" && Ux(a) === "realUserInput" && !mlr(a)),
        o = kee(n?.parts ?? []).trim();
    if (o) return o.slice(0, 80);
    let s = e.target?.objective.trim() ?? "";
    return s ? s.slice(0, 80) : e.fallback ?? "New session"
}
var tUi, nUi, rUi, mJt, bJt = Y(() => {
    fJt();
    Lj();
    tUi = '<system-reminder source="goal-continuation">', nUi = "Continue working toward the active session goal.", rUi = "Current session goal state", mJt = "subagent_message";
    r(hJt, "isZCodeGoalContinuationReminderText");
    r(gJt, "isZCodeGoalContinuationReminderMessage");
    r(_Jt, "isZCodeGoalStateReminderText");
    r(mlr, "isZCodeGoalModelOnlyReminderMessage");
    r(hlr, "isZCodeModelOnlySyntheticUserMessage");
    r(glr, "isZCodeCompactSummaryMessage");
    r(yJt, "getZCodeUserVisibleMessages");
    r(oUi, "getZCodeGoalIterationByAssistantMessageId");
    r(vJt, "getZCodeGoalActiveIterationCount");
    r(iUi, "compareZCodeMessagesByCreatedTime");
    r(sUi, "isVisibleRealGoalUserMessage");
    r(aUi, "resolveZCodeVisibleSessionTitle")
});

function ylr(e) {
    let t = lUi.exec(e);
    return t ? {
        rawCode: t[2],
        locale: t[1] ? "zh-CN" : "en-US"
    } : null
}

function uUi(e, t) {
    let n;
    try {
        n = new URL(e)
    } catch {
        return e
    }
    let o = ylr(n.pathname);
    return o ? (n.pathname = `${cUi[t]}/share/${o.rawCode}`, n.toString()) : e
}

function dUi(e) {
    return e <= EYe
}

function pUi(e) {
    let t = [],
        n = [],
        o = 0;
    for (let s of e) {
        let a = jj.safeParse(s);
        if (a.success) {
            t.push(a.data);
            continue
        }
        o += 1;
        let l = s?.kind,
            u = typeof l == "string" && l.trim() ? l.trim() : "unknown";
        n.includes(u) || n.push(u)
    }
    return {
        rows: t,
        unsupportedCount: o,
        unsupportedKinds: n
    }
}

function _Ui(e) {
    let t = [],
        n = [];
    for (let a of e.allowed_artifacts) {
        let l = Tee.safeParse(a.type);
        l.success ? t.push({
            ...a,
            type: l.data
        }) : n.includes(a.type) || n.push(a.type)
    }
    let o = [],
        s = [];
    for (let a of e.access_modes) {
        let l = Bee.safeParse(a);
        l.success ? o.push(l.data) : s.includes(a) || s.push(a)
    }
    return {
        capabilities: {
            ...e,
            access_modes: o,
            allowed_artifacts: t
        },
        unsupportedArtifactTypes: n,
        unsupportedAccessModes: s
    }
}

function EUi(e) {
    return m.object({
        code: m.literal(0),
        msg: m.string(),
        data: e
    })
}
var cUi, lUi, Bee, EYe, AYe, Jpe, vlr, fUi, SJt, mUi, blr, hUi, gUi, Slr, yUi, _lr, vUi, bUi, wlr, wJt, SUi, wUi, klr, xlr, kUi, xUi, Tlr, TUi, IUi, CUi, Ilr = Y(() => {
    Fa();
    mV();
    cUi = {
        "zh-CN": "/cn",
        "en-US": ""
    }, lUi = /^\/(cn\/)?share\/([^/]+)\/?$/u;
    r(ylr, "parseConversationSharePathname");
    r(uUi, "localizeConversationShareUrl");
    Bee = m.enum(["private", "public_readonly", "public_importable"]), EYe = 1, AYe = m.number().int().positive();
    r(dUi, "isConversationShareSchemaVersionSupported");
    r(pUi, "decodeConversationShareRows");
    Jpe = m.string().regex(/^[0-9a-f]{64}$/u), vlr = {
        artifact_id: m.string().trim().min(1),
        logical_artifact_key: m.string().trim().min(1),
        producer_product_turn_id: m.string().trim().min(1),
        artifact_version: m.number().int().positive(),
        state: m.literal("current"),
        ref: m.string().regex(/^zcode-artifact:\/\/share\/[A-Za-z0-9._~-]+$/u),
        artifact_type: Tee,
        display_name: m.string().trim().min(1),
        original_path: m.string().min(1).optional(),
        extension: m.string().trim().min(1),
        mime_type: m.string().trim().min(1),
        size_bytes: m.number().int().nonnegative(),
        sha256: Jpe
    }, fUi = m.object(vlr).strict(), SJt = m.object(vlr), mUi = m.object({
        type: m.string().trim().min(1),
        extensions: m.array(m.string().trim().min(1)),
        mime_types: m.array(m.string().trim().min(1))
    }), blr = {
        ttl_ms: m.number().int().positive(),
        max_rows: m.number().int().positive(),
        max_payload_bytes: m.number().int().positive(),
        max_artifact_count: m.number().int().nonnegative(),
        max_artifact_bytes: m.number().int().positive(),
        max_total_artifact_bytes: m.number().int().positive()
    }, hUi = m.object({
        ...blr,
        schema_version: AYe,
        access_modes: m.array(m.string().trim().min(1)),
        allowed_artifacts: m.array(mUi)
    }), gUi = m.object({
        ...blr,
        schema_version: AYe,
        access_modes: m.array(Bee),
        allowed_artifacts: m.array(m.object({
            type: Tee,
            extensions: m.array(m.string().trim().min(1)),
            mime_types: m.array(m.string().trim().min(1))
        }).strict())
    }).strict();
    r(_Ui, "narrowConversationShareCapabilities");
    Slr = m.object({
        share_code: m.string().trim().min(1),
        share_url: m.string().url(),
        access_mode: Bee,
        expires_at: m.number().int().nonnegative()
    }), yUi = m.object({
        client_request_id: m.string().trim().min(1),
        title: m.string().trim().min(1),
        schema_version: m.literal(EYe),
        access_mode: Bee,
        payload_sha256: Jpe,
        artifact_count: m.number().int().nonnegative()
    }).strict(), _lr = {
        preparation_id: m.string().trim().min(1),
        access_mode: Bee,
        expires_at: m.number().int().nonnegative()
    }, vUi = m.discriminatedUnion("status", [m.object({
        ..._lr,
        status: m.literal("preparing")
    }), m.object({
        ..._lr,
        status: m.literal("confirmed"),
        share: Slr
    })]), bUi = m.object({
        artifact_id: m.string().trim().min(1),
        size_bytes: m.number().int().nonnegative(),
        sha256: Jpe,
        status: m.literal("uploaded"),
        safety_status: m.string().trim().min(1)
    }), wlr = {
        projection_sha256: Jpe,
        artifact_set_sha256: Jpe
    }, wJt = m.object(wlr), SUi = m.object(wlr).strict(), wUi = m.object({
        selected_product_turn_ids: m.array(m.string().trim().min(1)).min(1),
        projection: m.object({
            rows: m.array(jj).min(1)
        }).strict(),
        integrity: SUi,
        disclosure_confirmation: m.object({
            version: m.literal(1),
            accepted_at: m.number().int().nonnegative(),
            acknowledged_no_secret_detection: m.literal(!0)
        }).strict()
    }).strict(), klr = m.object({
        title: m.string(),
        access_mode: Bee,
        created_at: m.number().int().nonnegative(),
        expires_at: m.number().int().nonnegative()
    }), xlr = SJt.extend({
        url: m.string().url(),
        url_expires_at: m.number().int().nonnegative()
    }), kUi = m.object({
        schema_version: AYe,
        share: klr,
        rows: m.array(m.unknown()),
        artifacts: m.array(xlr),
        integrity: wJt
    }), xUi = m.object({
        schema_version: m.literal(EYe),
        client_request_id: m.string().trim().min(1)
    }).strict(), Tlr = SJt.extend({
        download_url: m.string().url(),
        download_url_expires_at: m.number().int().nonnegative()
    }), TUi = m.object({
        schema_version: AYe,
        import_grant_id: m.string().trim().min(1),
        import_grant_expires_at: m.number().int().nonnegative(),
        share: klr.extend({
            share_id: m.string().trim().min(1)
        }),
        rows: m.array(m.unknown()),
        artifacts: m.array(Tlr),
        integrity: wJt
    }), IUi = m.union([m.literal(3001), m.literal(3002), m.literal(3200), m.literal(3201), m.literal(3203), m.literal(3204), m.literal(3205), m.literal(3206), m.literal(3207), m.literal(3208), m.literal(3209), m.literal(3210), m.literal(3211), m.literal(3212), m.literal(3213), m.literal(3214), m.literal(3215)]), CUi = m.object({
        code: m.number().int(),
        msg: m.string()
    });
    r(EUi, "createConversationShareSuccessEnvelopeSchema")
});

function AUi(e) {
    let t = e.replace(/\\/g, "/").toLowerCase();
    return PYe.find(({
        extension: n
    }) => t.endsWith(n)) ?? null
}
var PYe, kJt = Y(() => {
    PYe = [{
        extension: ".mp4",
        kind: "video",
        mediaType: "video/mp4"
    }, {
        extension: ".mov",
        kind: "video",
        mediaType: "video/quicktime"
    }, {
        extension: ".webm",
        kind: "video",
        mediaType: "video/webm"
    }, {
        extension: ".m4v",
        kind: "video",
        mediaType: "video/x-m4v"
    }, {
        extension: ".mp3",
        kind: "audio",
        mediaType: "audio/mpeg"
    }, {
        extension: ".wav",
        kind: "audio",
        mediaType: "audio/wav"
    }, {
        extension: ".m4a",
        kind: "audio",
        mediaType: "audio/mp4"
    }, {
        extension: ".ogg",
        kind: "audio",
        mediaType: "audio/ogg"
    }, {
        extension: ".opus",
        kind: "audio",
        mediaType: "audio/opus"
    }, {
        extension: ".flac",
        kind: "audio",
        mediaType: "audio/flac"
    }, {
        extension: ".weba",
        kind: "audio",
        mediaType: "audio/webm"
    }];
    r(AUi, "getMediaPreviewFormat")
});

function xJt(e) {
    return e.replace(/\\/gu, "/")
}

function TJt(e) {
    return e.trim().replace(/[.,;!?，。！？；：、]+$/gu, "").replace(/:\d+(?::\d+)?$/u, "")
}

function FUi(e) {
    try {
        return decodeURI(e)
    } catch {
        return e
    }
}

function jUi(e) {
    try {
        let t = new URL(e);
        if (t.protocol !== "file:") return null;
        let n = FUi(t.pathname);
        return /^\/[a-zA-Z]:\//u.test(n) ? n.slice(1) : t.hostname && t.hostname !== "localhost" ? `//${t.hostname}${n}` : n
    } catch {
        return null
    }
}

function BUi(e) {
    return e.startsWith("/") || /^[a-zA-Z]:[\\/]/u.test(e) || e.startsWith("\\\\")
}

function UUi(e) {
    let t = [];
    for (let n of xJt(e).split("/"))
        if (!(!n || n === ".")) {
            if (n === "..") {
                if (t.length === 0) return null;
                t.pop();
                continue
            }
            t.push(n)
        } return t.join("/")
}

function kV(e) {
    let t = xJt(e).replace(/\/{2,}/gu, "/"),
        n = t.startsWith("/") ? "/" : "",
        o = [];
    for (let s of t.split("/"))
        if (!(!s || s === ".")) {
            if (s === "..") {
                o.pop();
                continue
            }
            o.push(s)
        } return `${n}${o.join("/")}`
}

function KAe(e, t) {
    let n = TJt(t);
    if (!n || /^~[\\/]/u.test(n)) return null;
    let o = /^file:\/\//iu.test(n) ? jUi(n) : n;
    if (!o) return null;
    if (BUi(o)) return kV(o);
    let s = UUi(o);
    return s === null ? null : `${kV(e).replace(/\/$/u,"")}/${s}`
}

function DYe(e) {
    let t = TJt(e).toLowerCase();
    return PUi.find(n => n.extensions.some(o => t.endsWith(o))) ?? null
}

function zUi(e) {
    return xJt(e).replace(/\/+$/u, "").split("/").filter(Boolean).at(-1) ?? e
}

function $Ui(e, t) {
    let n = kV(e).replace(/\/$/u, ""),
        o = kV(t).replace(/\/$/u, "");
    return n === o || n.startsWith(`${o}/`)
}

function RYe(e, t, n) {
    return n.some(([o, s]) => e < s && t > o)
}

function Clr(e, t) {
    return new RegExp(`${t}\\s*=\\s*["']([^"']+)["']`, "iu").exec(e)?.[1]?.trim() || void 0
}

function Alr(e, t) {
    if (!e.trim()) return [];
    let n = [],
        o = [],
        s = r((u, f, g) => {
            let _ = KAe(t, u),
                b = _ ? DYe(_) : null;
            !_ || !b || n.push({
                start: f,
                end: g,
                kind: b.kind,
                path: _,
                raw: u
            })
        }, "addReference");
    for (let u of e.matchAll(OUi)) {
        let f = u[0] ?? "",
            g = u.index ?? 0,
            _ = g + f.length;
        o.push([g, _]);
        let b = Clr(u[1] ?? "", "path");
        if (!b) continue;
        let w = Clr(u[1] ?? "", "artifact_kind")?.toLowerCase(),
            T = KAe(t, b),
            I = T ? DYe(T) : null,
            A = I?.kind === "docx" || I?.kind === "xlsx" || I?.kind === "pptx" || I?.kind === "pdf" || I?.kind === "video" || I?.kind === "audio" ? I.kind : null,
            R = w === "document" ? "docx" : w === "presentation" ? "pptx" : w === "workbook" ? "xlsx" : void 0;
        T && A && (R === void 0 || R === A) && n.push({
            start: g,
            end: _,
            kind: A,
            path: T,
            raw: b
        })
    }
    for (let u of e.matchAll(MUi)) {
        let f = (u[2] ?? "").trim().replace(/^<|>$/gu, ""),
            g = u.index ?? 0,
            _ = g + (u[0]?.length ?? 0);
        RYe(g, _, o) || (o.push([g, _]), s(f, g, _))
    }
    for (let u of e.matchAll(DUi)) {
        let f = TJt(u[0] ?? ""),
            g = u.index ?? 0,
            _ = g + (u[0]?.length ?? 0);
        RYe(g, _, o) || (o.push([g, _]), s(f, g, _))
    }
    for (let u of e.matchAll(NUi)) {
        let f = (u[2] ?? "").trim(),
            g = u.index ?? 0,
            _ = g + (u[0]?.length ?? f.length);
        !f || RYe(g, _, o) || (o.push([g, _]), s(f, g + (u[0]?.indexOf(f) ?? 0), g + (u[0]?.indexOf(f) ?? 0) + f.length))
    }
    for (let u of e.matchAll(LUi)) {
        let f = u[1] ?? "",
            g = u[0] ?? f,
            _ = (u.index ?? 0) + g.lastIndexOf(f),
            b = _ + f.length;
        !f || RYe(_, b, o) || s(f, _, b)
    }
    let a = new Set;
    return n.sort((u, f) => f.start - u.start || f.end - u.end).filter(u => {
        let f = kV(u.path);
        return a.has(f) ? !1 : (a.add(f), !0)
    }).reverse()
}

function Plr(e) {
    let t = e.fileChanges ?? [],
        n = new Set(t.filter(a => a.state !== "reverted").map(a => kV(KAe(e.workspacePath, a.path) ?? a.path))),
        o = new Set(t.filter(a => a.state === "reverted").map(a => kV(KAe(e.workspacePath, a.path) ?? a.path))),
        s = new Set;
    return [...e.references].sort((a, l) => l.start - a.start || l.end - a.end).map(a => {
        let l = DYe(a.path);
        if (!l) return null;
        let u = kV(a.path);
        if (e.enforceWorkspaceBoundary !== !1 && !$Ui(u, e.workspacePath)) return null;
        let f = a.kind === "markdown" || a.kind === "html";
        return f && (!n.has(u) || o.has(u)) || s.has(u) ? null : (s.add(u), {
            artifactType: l.artifactType,
            displayName: zUi(a.path),
            mimeType: l.mimeType,
            previewKind: l.kind,
            productTurnId: e.productTurnId,
            sourceKind: "assistant_preview_card",
            sourceRef: a.path,
            requiresFileChanges: f
        })
    }).filter(a => a !== null).slice(0, Elr)
}

function qUi(e) {
    return Plr({
        ...e,
        references: Alr(e.assistantText, e.workspacePath)
    })
}
var PUi, Elr, RUi, DUi, OUi, MUi, NUi, LUi, Rlr = Y(() => {
    mV();
    kJt();
    PUi = [{
        extensions: [".md"],
        kind: "markdown",
        mimeType: "text/markdown",
        artifactType: "md"
    }, {
        extensions: [".html", ".htm"],
        kind: "html",
        mimeType: "text/html",
        artifactType: "html"
    }, {
        extensions: [".docx"],
        kind: "docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        artifactType: "docx"
    }, {
        extensions: [".xlsx"],
        kind: "xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        artifactType: "xlsx"
    }, {
        extensions: [".pptx"],
        kind: "pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        artifactType: "pptx"
    }, {
        extensions: [".pdf"],
        kind: "pdf",
        mimeType: "application/pdf",
        artifactType: "pdf"
    }, ...PYe.map(({
        extension: e,
        kind: t,
        mediaType: n
    }) => ({
        extensions: [e],
        kind: t,
        mimeType: n,
        artifactType: t
    }))], Elr = 15, RUi = 10, DUi = /\bfile:\/\/[^\s<>()\]`"'*，。！？；：、]+/giu, OUi = /:{1,2}zcode-file-citation\{([^}]*)\}/giu, MUi = /\[([^\]\n]*)\]\(([^)\n]+)\)/g, NUi = /([`"'])([^`"'\r\n]+?\.(?:md|html?|docx|xlsx|pptx|pdf|mp4|mov|webm|m4v|mp3|wav|m4a|ogg|opus|flac|weba)(?::\d+(?::\d+)?)?)\1/giu, LUi = /(?:^|[\s("'`,.;:!?，。！？；：、])((?:(?:\.{1,2}[\\/]|[a-zA-Z]:[\\/]|\/|[\p{L}\p{N}\p{M}\p{S}_.@()-]+[\\/])[\p{L}\p{N}\p{M}\p{S}_.@() -]+?(?:[\\/][\p{L}\p{N}\p{M}\p{S}_.@() -]+?)*|[\p{L}\p{N}\p{M}\p{S}_.@()-]+)\.(?:md|html?|docx|xlsx|pptx|pdf|mp4|mov|webm|m4v|mp3|wav|m4a|ogg|opus|flac|weba)(?::\d+(?::\d+)?)?)(?=$|[\s)"'`,.;:!?，。！？；：、])/giu;
    r(xJt, "normalizeSlashes");
    r(TJt, "cleanPath");
    r(FUi, "decodePath");
    r(jUi, "parseFileUrlPath");
    r(BUi, "isAbsolutePath");
    r(UUi, "normalizeRelativePath");
    r(kV, "normalizeAbsolutePath");
    r(KAe, "resolveConversationPreviewPath");
    r(DYe, "getConversationPreviewFileType");
    r(zUi, "getPathLeaf");
    r($Ui, "isInsideWorkspace");
    r(RYe, "rangesOverlap");
    r(Clr, "readDirectiveParameter");
    r(Alr, "extractConversationPreviewFileReferences");
    r(Plr, "buildConversationPreviewArtifactCandidatesFromReferences");
    r(qUi, "buildConversationPreviewArtifactCandidates")
});

function WUi(e) {
    if (e === "running" || e === "waiting" || e === "paused") return "running";
    if (e === "error") return "error";
    if (e === "completed") return "completed"
}

function Dlr(e) {
    return e.runtime.activeTurnId || e.runtime.activeTurnKind || (e.projection.pendingPermissions ?? []).length > 0 ? !0 : (e.projection.activeToolCalls ?? []).some(t => t.status === "pending" || t.status === "running")
}

function VUi(e) {
    return Dlr(e)
}

function HUi(e) {
    return e?.trim().toLowerCase().replace(/_/g, "-") === "tool-calls"
}

function GUi(e) {
    let n = yJt(e.messages, {
        target: e.projection.target
    }).at(-1);
    return n?.info.role !== "assistant" || HUi(n.info.finish) ? !1 : typeof n.info.time.completed == "number"
}

function JUi(e) {
    if (e.projection.lastError) return "error";
    let t = WUi(e.session.status);
    return t === "error" || t === "completed" ? t : GUi(e) && !Dlr(e) ? "completed" : VUi(e) ? t ?? "running" : t
}
var Olr = Y(() => {
    bJt();
    r(WUi, "statusFromZCodeSession");
    r(Dlr, "hasBlockingActiveSnapshotRuntime");
    r(VUi, "hasActiveSnapshotRuntime");
    r(HUi, "isToolCallContinuationFinish");
    r(GUi, "hasCompletedVisibleAssistantTurn");
    r(JUi, "deriveZCodeTaskStatusFromSessionSnapshot")
});

function KUi() {
    return {
        completeToolInputById: new Map,
        streamingToolInputById: new Map,
        toolNameById: new Map
    }
}

function ZUi(e) {
    return e.completeToolInputById ??= new Map, e.streamingToolInputById ??= new Map, e.toolNameById ??= new Map, e
}

function YUi(e, t, n) {
    let o = ezi(e.toolName) ?? n.toolNameById?.get(t);
    return o && n.toolNameById?.set(t, o), "input" in e ? {
        hasInput: e.input !== void 0,
        input: e.input,
        toolName: o
    } : n.completeToolInputById?.has(t) ? {
        hasInput: !0,
        input: n.completeToolInputById.get(t),
        toolName: o
    } : {
        hasInput: !1,
        toolName: o
    }
}

function XUi(e, t, n) {
    n.completeToolInputById ??= new Map, n.completeToolInputById.set(e, t);
    let o = n.streamingToolInputById?.get(e);
    o && (o.lastPreviewRawInputLength = o.rawInput.length, o.rawInput = "")
}

function QUi(e, t) {
    t.completeToolInputById?.delete(e), t.streamingToolInputById?.delete(e), t.toolNameById?.delete(e)
}

function ezi(e) {
    return typeof e == "string" && e.length > 0 ? e : void 0
}
var Mlr = Y(() => {
    r(KUi, "createZCodeToolProjectionMemory");
    r(ZUi, "ensureZCodeToolProjectionMemory");
    r(YUi, "resolveZCodeToolProjectionMetadata");
    r(XUi, "finalizeZCodeToolProjectionInput");
    r(QUi, "forgetZCodeToolProjectionMetadata");
    r(ezi, "readNonEmptyString")
});
var qL, Nlr = Y(() => {
    qL = [{
        details: ["Shows command-center help locally without creating a session or sending a model prompt.", "Pass a command name with or without the leading slash for command-specific help."],
        name: "help",
        summary: "Show this slash command help.",
        usage: "/help [command]"
    }, {
        details: ["Opens a Coding Plan setup picker when called without arguments.", "Z.ai and BigModel Coding Plan login write the final API key to config.json.", "Manual API key variants accept the API key as an argument."],
        name: "login",
        summary: "Set up a Coding Plan provider.",
        usage: "/login [zai-coding-plan|bigmodel-coding-plan|zai-coding-plan-api-key <api-key>|bigmodel-coding-plan-api-key <api-key>]"
    }, {
        details: ["Deletes Z.ai OAuth credentials from the shared ZCode credential store."],
        name: "logout",
        summary: "Remove the shared Z.ai login credentials.",
        usage: "/logout"
    }, {
        details: ["Runs the core manual compaction path and forwards optional summary instructions."],
        name: "compact",
        summary: "Compact the current conversation with optional instructions.",
        usage: "/compact [instructions]"
    }, {
        details: ["Runs a normal agent turn that inspects the current workspace and creates or updates AGENTS.md.", "Existing AGENTS.md files should be edited rather than overwritten.", "This command targets the workspace root, not the user default ~/.zcode/AGENTS.md."],
        name: "init",
        summary: "Create or update workspace AGENTS.md instructions.",
        usage: "/init [notes]"
    }, {
        details: ["Starts a durable expert workflow in yolo mode when called with a task.", "Use status, resume, or stop to manage the latest or a named workflow run."],
        name: "expert",
        summary: "Run or manage the expert workflow.",
        usage: "/expert [status|resume|stop|<task>]"
    }, {
        aliases: ["variant"],
        details: ["In the TUI, type /effort or /variant to open composer suggestions.", "Submitting the empty command or list shows the current and selectable efforts as text.", "Use a listed level to switch the current session reasoning effort."],
        name: "effort",
        summary: "Show or switch the current session reasoning effort.",
        usage: "/effort [list|<level>]"
    }, {
        details: ["Lists this session's dynamic workflow runs with server-decided status and resumability.", "cancel without a run id cancels the only in-flight run, or lists candidates when there are several.", "resume asks the server; a run the server refuses reports the structured reason."],
        name: "dwf",
        summary: "List, cancel, or resume dynamic workflow runs.",
        usage: "/dwf [list|cancel [runId]|resume <runId>]"
    }, {
        details: ["In the TUI, opens a checkpoint picker when called without arguments.", "Use latest or a specific checkpoint id to bypass the picker."],
        name: "fork",
        summary: "Fork a new session from a workspace checkpoint.",
        usage: "/fork [latest|checkpointId]"
    }, {
        aliases: ["language"],
        details: ["Shows the current UI locale when called without arguments.", "Use auto, en-US, or zh-CN to switch and persist the UI locale."],
        name: "locale",
        summary: "Show or switch the UI locale.",
        usage: "/locale [auto|en-US|zh-CN]"
    }, {
        details: ["Lists MCP server status by default.", "Use connect or disconnect with a configured server name to manage the session connection."],
        name: "mcp",
        summary: "Show or manage configured MCP servers.",
        usage: "/mcp [list|status|connect <server>|disconnect <server>]"
    }, {
        aliases: ["plugin"],
        details: ["Opens a TUI plugin panel when called without arguments.", "Rows show \u2713 for enabled plugins and \u25CB for disabled plugins.", "Use enable or disable with a plugin id to persist the switch in user config.", "Plugin capability changes apply to new sessions."],
        name: "plugins",
        summary: "Open the plugin manager.",
        usage: "/plugins [list|enable <plugin>|disable <plugin>]"
    }, {
        details: ["Shows the current permission mode when submitted without arguments.", "Interactive TUI composer input opens a local picker before submit.", "Switchable modes are plan, build, edit, and yolo.", "Picker rows and explicit input submit /mode <mode> commands."],
        name: "mode",
        summary: "Show or switch the current permission mode.",
        usage: "/mode [plan|build|edit|yolo]"
    }, {
        details: ["Shows the current and selectable models when called without arguments or with list.", "Use main, lite, or a provider/model id to switch the active session model."],
        name: "model",
        summary: "Show or switch the current session model.",
        usage: "/model [list|main|lite|provider/model]"
    }, {
        aliases: ["clear"],
        details: ["Starts a fresh root session and resets the TUI session projection."],
        name: "new",
        summary: "Start a fresh session in the TUI.",
        usage: "/new"
    }, {
        aliases: ["continue"],
        details: ["In the TUI, opens a session picker when called without arguments.", "Resumes a specific session id when provided.", "/continue resumes the latest root session for the current directory."],
        name: "resume",
        summary: "Resume a saved session.",
        usage: "/resume [sessionId]"
    }, {
        details: ["In the TUI, opens a checkpoint picker when called without arguments.", "Use status to show the latest checkpoint, or latest/a checkpoint id to restore directly."],
        name: "rewind",
        summary: "Inspect or restore workspace checkpoints.",
        usage: "/rewind [latest|checkpointId]"
    }, {
        details: ["Without a name, lists discoverable skills for the current working directory.", "With a name, rewrites the next prompt so the Skill tool must load that skill first."],
        name: "skill",
        summary: "List skills, or force the next prompt to load one.",
        usage: "/skill [<skill-name> [task]]"
    }, {
        aliases: ["target"],
        details: ["Shows the current session goal when called without arguments.", "Setting a new objective overwrites an existing goal; replace is an explicit alias.", "Use pause, resume, or clear to manage the current goal."],
        name: "goal",
        summary: "Show or set the current session goal.",
        usage: "/goal [pause|resume|clear|replace <objective>|<objective>]"
    }]
});

function WL(e) {
    let t = e?.trim();
    if (!(!t || !/^[\x20-\x7e]+$/.test(t))) return t
}

function IJt(e = {}) {
    let t = WL(e.appVersion),
        n = WL(e.arch),
        o = WL(e.clientLanguage) ?? "unknown",
        s = WL(e.clientTimezone) ?? "unknown",
        a = WL(e.deviceMid),
        l = WL(e.endpointOrigin) ?? Aee,
        u = WL(e.osVersion),
        f = WL(e.platform),
        g = WL(e.releaseChannel),
        _ = WL(e.sourceTitle) ?? "electron";
    return {
        ...Llr,
        "HTTP-Referer": l,
        "User-Agent": `ZCode/${t??"unknown"}`,
        ...t ? {
            "X-ZCode-App-Version": t
        } : {},
        "X-Title": `Z Code@${_}`,
        ...f && n ? {
            "X-Platform": `${f}-${n}`
        } : {},
        ...g ? {
            "X-Release-Channel": g
        } : {},
        "X-Client-Language": o,
        "X-Client-Timezone": s,
        ...f ? {
            "X-Os-Category": tzi(f)
        } : {},
        ...u ? {
            "X-Os-Version": u
        } : {},
        ...a ? {
            "X-Device-Mid": a
        } : {}
    }
}

function tzi(e) {
    switch (e) {
        case "darwin":
            return "macos";
        case "win32":
            return "windows";
        default:
            return "linux"
    }
}
var Llr, Flr = Y(() => {
    Dpe();
    Llr = {
        "User-Agent": "ZCode/unknown",
        "HTTP-Referer": Aee,
        "X-Title": "Z Code@electron"
    };
    r(WL, "normalizeZCodeSourceHeaderValue");
    r(IJt, "buildZCodeSourceHeadersFromContext");
    r(tzi, "normalizeOsCategory")
});

function jlr(e, t, n) {
    if (n) {
        let o = n[e];
        if (o) return o;
        let s = e.split("-")[0];
        if (s) {
            let a = Object.entries(n).find(([l]) => l.split("-")[0] === s);
            if (a?.[1]) return a[1]
        }
    }
    return t
}

function Blr(e, t) {
    return e.trim().split(/[-_]+/u).filter(Boolean).map(n => nzi[n.toLowerCase()] ?? `${n.charAt(0).toLocaleUpperCase(t)}${n.slice(1)}`).join(" ")
}

function CJt(e, t) {
    return jlr(t, e.listing?.displayName, e.listing?.displayNameI18n) ?? Blr(e.name, t)
}
var nzi, Ulr = Y(() => {
    nzi = {
        aws: "AWS",
        mcp: "MCP",
        zcode: "ZCode"
    };
    r(jlr, "resolveLocalizedText");
    r(Blr, "formatCanonicalPluginName");
    r(CJt, "resolvePluginDisplayName")
});

function zlr(e, t) {
    return t === "win32" ? `${e}.exe` : e
}

function rzi() {
    return $lr
}
var $lr, qlr = Y(() => {
    r(zlr, "resolvePlatformBinaryName");
    $lr = {
        binaryKind: "native-binary",
        binaryEnvVar: "GLM_BINARY_PATH",
        bundledResourceDir: "glm",
        version: "0.13.3",
        spawnArgs: ["app-server", "--stdio"],
        nativeConfigDir: ".zcode/cli",
        nativeConfigFileName: "config.json",
        missingBinaryMessage: "[ZCode Agent] glm binary \u672A\u627E\u5230\uFF0C\u8BF7\u8BBE\u7F6E ZCODE_AGENT_WORKDIR\u3001GLM_BINARY_PATH \u6216\u5148\u51C6\u5907 GLM \u8FD0\u884C\u65F6\u8D44\u6E90",
        resolveEntrySegments: r(e => [zlr("zcode-agent", e)], "resolveEntrySegments"),
        nodeBundleEntryFile: "zcode.cjs",
        resolveNodeBundleSegments() {
            return [this.nodeBundleEntryFile]
        }
    };
    r(rzi, "getZCodeAgentRuntime")
});

function EJt(e) {
    if (typeof e != "string") return;
    let t = e.trim();
    return Wlr.includes(t) ? t : void 0
}

function Glr(e) {
    return e !== "disabled"
}

function OYe(e, t) {
    return {
        mode: e,
        enabled: Glr(e),
        source: t
    }
}

function ozi(e) {
    let t = EJt(e.env?.[Vlr]);
    if (t) return OYe(t, "override");
    let n = EJt(typeof e.remote == "object" && e.remote !== null ? e.remote.mode : void 0);
    return n ? OYe(n, "remote") : OYe(Hlr, "default")
}
var Wlr, Vlr, Hlr, Jlr = Y(() => {
    Wlr = ["disabled", "onDemand", "alwaysOn"], Vlr = "ZCODE_DYNAMIC_WORKFLOW_MODE", Hlr = "disabled";
    r(EJt, "normalizeDynamicWorkflowMode");
    r(Glr, "isDynamicWorkflowModeEnabled");
    r(OYe, "createDynamicWorkflowClientConfig");
    r(ozi, "resolveDynamicWorkflowClientConfig")
});

function Zlr(e, t) {
    let n = null,
        o = 0;
    return e.split(`
`).map(s => {
        let a = s.match(izi);
        if (a?.[2]) {
            let l = a[2],
                u = l[0],
                f = a[3] ?? "";
            return n === u && l.length >= o && f.trim() === "" ? (n = null, o = 0) : !n && (u === "~" || !f.includes("`")) && (n = u, o = l.length), s
        }
        return n ? s : t(s)
    }).join(`
`)
}

function PJt(e) {
    let t = new Set;
    return Zlr(e, n => {
        for (let o of n.matchAll(Klr)) o[1] && t.add(o[1]);
        return n
    }), [...t]
}

function szi(e) {
    return Zlr(e, t => t.replace(Klr, (n, o) => n.replace(o, `${AJt}${encodeURIComponent(o)}`)))
}

function azi(e) {
    if (!e.startsWith(AJt)) return null;
    try {
        let t = decodeURIComponent(e.slice(AJt.length));
        return t.startsWith("zcode-artifact://") ? t : null
    } catch {
        return null
    }
}
var AJt, izi, Klr, Ylr = Y(() => {
    AJt = "/__zcode_artifact_image__/", izi = /^( {0,3})(`{3,}|~{3,})(.*)$/u, Klr = /!\[[^\]\n]*\]\(\s*(?:<)?(zcode-artifact:\/\/[^\s)>]+)(?:>)?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/gu;
    r(Zlr, "mapOutsideMarkdownFences");
    r(PJt, "extractMarkdownArtifactImageRefs");
    r(szi, "rewriteMarkdownArtifactImageSources");
    r(azi, "decodeMarkdownArtifactImageSource")
});

function eur(e) {
    return typeof e == "string" && Qlr.includes(e)
}

function czi(e) {
    let t = e[Xlr]?.trim();
    return t ? eur(t) ? {
        mode: t,
        invalidRawValue: void 0
    } : {
        mode: void 0,
        invalidRawValue: t
    } : {
        mode: void 0,
        invalidRawValue: void 0
    }
}

function lzi(e) {
    return e !== "desktop-attached-remote"
}
var Xlr, Qlr, tur = Y(() => {
    Xlr = "ZCODE_SERVICE_AUTHORITY_MODE", Qlr = ["desktop-local", "desktop-attached-remote", "standalone-server"];
    r(eur, "isServiceAuthorityMode");
    r(czi, "parseServiceAuthorityMode");
    r(lzi, "shouldUseProviderRegistrySourceForAuthorityMode")
});
var nur, rur, uzi, dzi, our = Y(() => {
    Fa();
    nur = 1, rur = m.object({
        path: m.string().trim().min(1),
        label: m.string().trim().min(1).optional(),
        workspaceIdentity: m.string().trim().min(1).optional()
    }), uzi = m.object({
        serverId: m.string().trim().min(1),
        name: m.string().trim().min(1).optional(),
        version: m.string(),
        protocolVersion: m.literal(nur),
        authRequired: m.boolean(),
        workspaces: m.array(rur),
        capabilities: m.object({
            desktopContinuous: m.literal(!0),
            websocketRpc: m.literal(!0),
            processResourceTelemetry: m.boolean().optional()
        })
    }), dzi = m.object({
        capability: m.string().trim().min(1),
        expiresAt: m.number().int().positive()
    }).strict()
});

function XVi(e, t) {
    return `${e}-${t}`
}
var pzi, fzi, mzi, hzi, gzi, _zi, yzi, vzi, bzi, Szi, wzi, kzi, xzi, Tzi, Izi, Czi, Ezi, Azi, Pzi, Rzi, Dzi, Ozi, Mzi, Nzi, Lzi, Fzi, jzi, Bzi, Uzi, zzi, $zi, qzi, Wzi, Vzi, Hzi, Gzi, Jzi, Kzi, Zzi, Yzi, Xzi, Qzi, e7i, t7i, n7i, r7i, o7i, i7i, s7i, a7i, c7i, l7i, u7i, d7i, p7i, f7i, m7i, h7i, g7i, _7i, y7i, v7i, b7i, S7i, w7i, k7i, x7i, T7i, I7i, C7i, E7i, A7i, P7i, R7i, D7i, O7i, M7i, N7i, L7i, F7i, j7i, B7i, U7i, z7i, $7i, q7i, W7i, V7i, H7i, G7i, J7i, K7i, Z7i, Y7i, X7i, Q7i, e$i, t$i, n$i, r$i, o$i, i$i, s$i, a$i, c$i, l$i, u$i, d$i, p$i, f$i, m$i, h$i, g$i, _$i, y$i, v$i, b$i, S$i, w$i, k$i, x$i, T$i, I$i, C$i, E$i, A$i, P$i, R$i, D$i, O$i, M$i, N$i, L$i, F$i, j$i, B$i, U$i, z$i, $$i, q$i, W$i, V$i, H$i, G$i, J$i, K$i, Z$i, Y$i, X$i, Q$i, e9i, t9i, n9i, r9i, o9i, i9i, s9i, a9i, c9i, l9i, u9i, d9i, p9i, f9i, m9i, h9i, g9i, _9i, y9i, v9i, b9i, S9i, w9i, k9i, x9i, T9i, I9i, C9i, E9i, A9i, P9i, R9i, D9i, O9i, M9i, N9i, L9i, F9i, j9i, B9i, U9i, z9i, $9i, q9i, W9i, V9i, H9i, G9i, J9i, K9i, Z9i, Y9i, X9i, Q9i, eqi, tqi, nqi, rqi, oqi, iqi, sqi, aqi, cqi, lqi, uqi, dqi, pqi, fqi, mqi, hqi, gqi, _qi, yqi, vqi, bqi, Sqi, wqi, kqi, xqi, Tqi, Iqi, Cqi, Eqi, Aqi, Pqi, Rqi, Dqi, Oqi, Mqi, Nqi, Lqi, Fqi, jqi, Bqi, Uqi, zqi, $qi, qqi, Wqi, Vqi, Hqi, Gqi, Jqi, Kqi, Zqi, Yqi, Xqi, Qqi, eWi, tWi, nWi, rWi, oWi, iWi, sWi, aWi, cWi, lWi, uWi, dWi, pWi, fWi, mWi, hWi, gWi, _Wi, yWi, vWi, bWi, SWi, wWi, kWi, xWi, TWi, IWi, CWi, EWi, AWi, PWi, RWi, DWi, OWi, MWi, NWi, LWi, FWi, jWi, BWi, UWi, zWi, $Wi, qWi, WWi, VWi, HWi, GWi, JWi, KWi, ZWi, YWi, XWi, QWi, eVi, tVi, nVi, rVi, oVi, iVi, sVi, aVi, cVi, lVi, uVi, dVi, pVi, fVi, mVi, hVi, gVi, _Vi, yVi, vVi, bVi, SVi, wVi, kVi, xVi, TVi, IVi, CVi, EVi, AVi, PVi, RVi, DVi, OVi, MVi, NVi, LVi, FVi, jVi, BVi, UVi, zVi, $Vi, qVi, WVi, VVi, HVi, GVi, JVi, KVi, ZVi, YVi, QVi, eHi, tHi, iur = Y(() => {
    pzi = "login-trigger", fzi = "login-menu-item", mzi = "login-use-api-key-button", hzi = "login-api-key-provider-trigger", gzi = "login-api-key-provider-item", _zi = "login-api-key-input", yzi = "login-api-key-continue-button", vzi = "login-api-key-cancel-button", bzi = "login-api-key-skip-button", Szi = "login-api-key-error", wzi = "oauth-login-button", kzi = "oauth-cancel", xzi = "oauth-error", Tzi = "app-header", Izi = "locale-toggle", Czi = "theme-toggle", Ezi = "logout-button", Azi = "terminal-toggle", Pzi = "side-pane-toggle", Rzi = "terminal-close-button", Dzi = "browser-toggle", Ozi = "git-toggle", Mzi = "browser-pane", Nzi = "browser-close-button", Lzi = "git-pane", Fzi = "git-close-button", jzi = "git-action-trigger", Bzi = "git-commit-dialog", Uzi = "git-commit-message-input", zzi = "git-commit-generate-button", $zi = "git-commit-include-unstaged", qzi = "git-commit-action-command", Wzi = "git-commit-action-item", Vzi = "browser-address-input", Hzi = "browser-back-button", Gzi = "browser-forward-button", Jzi = "browser-refresh-button", Kzi = "browser-responsive-button", Zzi = "browser-responsive-viewport", Yzi = "browser-responsive-toolbar", Xzi = "browser-responsive-width-input", Qzi = "browser-responsive-height-input", e7i = "browser-responsive-zoom-select", t7i = "browser-responsive-zoom-option", n7i = "browser-responsive-scaled-frame", r7i = "browser-responsive-resize-left", o7i = "browser-responsive-resize-width", i7i = "browser-responsive-resize-top", s7i = "browser-responsive-resize-height", a7i = "browser-responsive-resize-corner-top-left", c7i = "browser-responsive-resize-corner-top-right", l7i = "browser-responsive-resize-corner-bottom-left", u7i = "browser-responsive-resize-corner", d7i = "browser-element-picker-button", p7i = "browser-more-button", f7i = "browser-open-external-item", m7i = "browser-devtools-button", h7i = "browser-webview", g7i = "browser-load-error", _7i = "browser-load-error-cert-hint", y7i = "preview-pane", v7i = "preview-close-button", b7i = "preview-prev-button", S7i = "preview-next-button", w7i = "tool-code-viewer-button", k7i = "tool-summary-trigger", x7i = "terminal", T7i = "ssh-connect-trigger", I7i = "ssh-dialog", C7i = "remote-kind-ssh", E7i = "remote-kind-server", A7i = "remote-kind-wsl", P7i = "remote-kind-docker", R7i = "ssh-host-input", D7i = "ssh-port-input", O7i = "ssh-username-input", M7i = "ssh-config-alias-select", N7i = "ssh-password-input", L7i = "ssh-private-key-input", F7i = "ssh-auth-password", j7i = "ssh-auth-private-key", B7i = "wsl-distro-select", U7i = "wsl-user-input", z7i = "docker-container-select", $7i = "docker-container-input", q7i = "server-url-input", W7i = "server-name-input", V7i = "server-token-input", H7i = "server-workspace-path-input", G7i = "ssh-connect-button", J7i = "ssh-cancel-button", K7i = "sidebar", Z7i = "workspace-open-button", Y7i = "workspace-list", X7i = "workspace-item", Q7i = "workspace-close", e$i = "conversation-section", t$i = "project-section", n$i = "conversation-new-task", r$i = "project-add", o$i = "composer-workspace-trigger", i$i = "composer-remote-connection", s$i = "composer-project-detach", a$i = "composer-work-outside-project", c$i = "chat-view", l$i = "chat-messages", u$i = "chat-error-banner", d$i = "chat-error-details-button", p$i = "chat-error-hook-icon", f$i = "chat-empty", m$i = "chat-input", h$i = "chat-attachment-button", g$i = "chat-attachment-menu-item", _$i = "chat-send-button", y$i = "chat-stop-button", v$i = "chat-loading", b$i = "chat-summary-panel", S$i = "chat-compact-marker", w$i = "chat-compact-retry-button", k$i = "chat-goal-verification-marker", x$i = "chat-queue-panel", T$i = "chat-queue-item", I$i = "chat-queue-item-content", C$i = "chat-queue-send-now-button", E$i = "chat-queue-edit-button", A$i = "chat-queue-edit-input", P$i = "chat-queue-edit-save-button", R$i = "chat-queue-edit-cancel-button", D$i = "chat-queue-remove-button", O$i = "chat-queue-drag-handle", M$i = "chat-user-message", N$i = "chat-assistant-message", L$i = "chat-assistant-history-trigger", F$i = "chat-assistant-history-content", j$i = "chat-background-result-title", B$i = "chat-tool-call-block", U$i = "chat-message-edit-button", z$i = "chat-message-edit-input", $$i = "chat-message-edit-submit", q$i = "chat-message-edit-cancel", W$i = "chat-message-fork-button", V$i = "chat-change-summary-toggle-files-button", H$i = "prompt-suggestion-panel", G$i = "prompt-suggestion-section", J$i = "prompt-suggestion-option", K$i = "prompt-suggestion-status", Z$i = "task-list", Y$i = "task-new-button", X$i = "task-item", Q$i = "task-empty", e9i = "task-archive", t9i = "task-settings-button", n9i = "settings-page", r9i = "settings-back-button", o9i = "settings-section-nav", i9i = "settings-native-search-switch", s9i = "settings-data-base-dir-input", a9i = "settings-data-base-dir-browse", c9i = "settings-data-base-dir-save", l9i = "settings-data-base-dir-status", u9i = "resource-manager-tab", d9i = "resource-manager-storage-section", p9i = "resource-manager-storage-total", f9i = "resource-manager-storage-status", m9i = "resource-manager-storage-rescan", h9i = "resource-manager-storage-disk-card", g9i = "resource-manager-storage-root", _9i = "resource-manager-storage-category-row", y9i = "resource-manager-storage-category-size", v9i = "resource-manager-storage-category-clean", b9i = "resource-manager-storage-detail", S9i = "resource-manager-storage-detail-back", w9i = "resource-manager-storage-detail-entry", k9i = "resource-manager-storage-confirm-dialog", x9i = "resource-manager-storage-confirm-accept", T9i = "resource-manager-storage-confirm-cancel", I9i = "settings-memory-switch", C9i = "settings-memory-refresh", E9i = "settings-memory-scope-trigger", A9i = "settings-memory-scope-icon", P9i = "settings-memory-count", R9i = "settings-memory-search-input", D9i = "settings-memory-search-clear", O9i = "settings-memory-back-projects", M9i = "settings-memory-back-memories", N9i = "settings-memory-workspace", L9i = "settings-memory-file", F9i = "settings-memory-file-icon", j9i = "settings-memory-file-name", B9i = "settings-memory-file-updated-at", U9i = "settings-memory-file-editor-actions", z9i = "settings-memory-preview", $9i = "settings-ask-user-question-auto-resolution-switch", q9i = "settings-locale-select-trigger", W9i = "settings-locale-select-item", V9i = "mcp-server-row", H9i = "plugin-mcp-server-row", G9i = "mcp-open-authorization-button", J9i = "subagent-row", K9i = "subagent-built-in-model-trigger", Z9i = "settings-usage-tab", Y9i = "sidebar-usage-remaining-trigger", X9i = "sidebar-coding-plan-usage-button", Q9i = "model-provider-add-provider-button", eqi = "model-provider-template-picker", tqi = "model-provider-template-item", nqi = "model-provider-template-back-button", rqi = "model-provider-nav-item", oqi = "model-provider-connection-mode-trigger", iqi = "model-provider-start-plan-count-shortcut", sqi = "model-provider-start-plan-switch-prefix", aqi = "model-provider-connection-mode-item", cqi = "model-provider-api-key-input", lqi = "model-provider-name-edit-button", uqi = "model-provider-name-input", dqi = "model-provider-base-url-input", pqi = "model-provider-api-format-trigger", fqi = "model-provider-api-format-item", mqi = "model-provider-model-input", hqi = "model-provider-model-delete-button", gqi = "model-provider-add-model-button", _qi = "chat-model-select-trigger", yqi = "chat-model-select-group", vqi = "chat-model-select-item", bqi = "chat-thought-level-select-trigger", Sqi = "chat-thought-level-select-item", wqi = "chat-mode-select-trigger", kqi = "chat-mode-select-item", xqi = "chat-context-usage-trigger", Tqi = "chat-reasoning-trigger", Iqi = "chat-reasoning-content", Cqi = "workspace-header", Eqi = "workspace-title", Aqi = "workspace-path", Pqi = "workspace-more-button", Rqi = "workspace-help-menu-trigger", Dqi = "workspace-help-menu-resource-manager", Oqi = "workspace-file-tree-button", Mqi = "workspace-file-tree-panel", Nqi = "workspace-file-tree-refresh-button", Lqi = "workspace-file-tree-row", Fqi = "ssh-error", jqi = "ssh-success", Bqi = "v4-session-pane", Uqi = "v4-timeline", zqi = "v4-timeline-empty", $qi = "v4-row", qqi = "v4-workspace-hook-pending-banner", Wqi = "v4-workspace-hook-pending-review", Vqi = "v4-workspace-hook-pending-dismiss", Hqi = "v4-composer", Gqi = "v4-composer-input", Jqi = "v4-composer-background-work-trigger", Kqi = "v4-composer-cua-entry", Zqi = "v4-composer-send", Yqi = "v4-composer-clear-queue-send", Xqi = "v4-composer-keep-queue-send", Qqi = "v4-paused-queue-send-dialog", eWi = "v4-attachment", tWi = "v4-attachment-upload-progress", nWi = "v4-attachment-upload-retry", rWi = "v4-stop", oWi = "v4-fork", iWi = "v4-retry", sWi = "v4-feedback-like", aWi = "v4-feedback-dislike", cWi = "v4-hook-details-trigger", lWi = "v4-hook-details-content", uWi = "v4-edit", dWi = "v4-edit-input", pWi = "v4-edit-submit", fWi = "v4-edit-cancel", mWi = "v4-edit-attachment-remove", hWi = "v4-edit-rewind-workspace", gWi = "v4-edit-workspace-conflict-dialog", _Wi = "v4-edit-workspace-conflict-conversation-only", yWi = "v4-queue", vWi = "v4-queue-paused-banner", bWi = "v4-queue-resume", SWi = "v4-queue-item", wWi = "v4-queue-item-delete", kWi = "v4-queue-item-edit", xWi = "v4-queue-item-send-now", TWi = "v4-queue-item-up", IWi = "v4-autodrain-toggle", CWi = "v4-followup-toggle", EWi = "v4-session-title", AWi = "v4-rename-input", PWi = "v4-rename-submit", RWi = "v4-goal-banner", DWi = "v4-delete-session", OWi = "v4-background-works", MWi = "v4-background-work-item", NWi = "v4-background-work-cancel", LWi = "v4-model-config", FWi = "v4-retry-subscribe", jWi = "v4-user-input-dialog", BWi = "v4-user-input-option", UWi = "v4-user-input-text", zWi = "v4-timeline-bottom", $Wi = "v4-pane-shell", qWi = "v4-split-open", WWi = "v4-split-down", VWi = "v4-split-close", HWi = "v4-split-divider", GWi = "v4-pane-workspace-badge", JWi = "v4-task-open-in-split", KWi = "v4-timeline-load-older", ZWi = "v4-turn-navigator", YWi = "v4-turn-navigator-item", XWi = "v4-turn-navigator-tooltip", QWi = "v4-subagent-toggle", eVi = "v4-subagent-drilldown", tVi = "v4-subagent-open-split", nVi = "v4-subagent-open-side-pane", rVi = "v4-row-attachments", oVi = "plugin-store-browse", iVi = "automations-open", sVi = "automations-list", aVi = "automations-status-filter", cVi = "automation-create-menu", lVi = "automation-create-manually", uVi = "automation-card", dVi = "offpeak-create-button", pVi = "offpeak-card", fVi = "offpeak-card-session", mVi = "offpeak-card-menu", hVi = "offpeak-edit-view", gVi = "offpeak-edit-submit", _Vi = "offpeak-form-title", yVi = "offpeak-form-instructions", vVi = "offpeak-action-pause", bVi = "offpeak-action-continue", SVi = "offpeak-action-delete", wVi = "offpeak-tab", kVi = "automation-card-menu", xVi = "automation-action-toggle", TVi = "automation-action-delete", IVi = "automation-form-title", CVi = "automation-form-prompt", EVi = "automation-form-submit", AVi = "automation-run-now", PVi = "automation-edit-back", RVi = "automation-frequency-select", DVi = "automation-frequency-option", OVi = "automation-custom-unit-select", MVi = "automation-custom-unit-option", NVi = "automation-custom-interval-select", LVi = "automation-custom-interval-increment", FVi = "automation-custom-interval-decrement", jVi = "automation-custom-interval-option", BVi = "automation-custom-repeat-edit", UVi = "automation-custom-confirm", zVi = "automation-year-monthday", $Vi = "automation-year-month-option", qVi = "automation-year-day-option", WVi = "automation-schedule-preview", VVi = "automation-schedule-add", HVi = "automation-schedule-delete", GVi = "cron-create-card", JVi = "cron-create-open", KVi = "offpeak-create-card", ZVi = "offpeak-create-open", YVi = "confirm-dialog-confirm";
    r(XVi, "testId");
    QVi = "manual-claim-plan-banner", eHi = "start-plan-recommendation-dialog", tHi = "feedback-logs-opt-in"
});
var nHi, rHi, oHi, iHi, sHi, aHi, cHi, lHi, uHi, dHi, pHi, fHi, mHi, hHi, gHi, _Hi, yHi, vHi, bHi, SHi, wHi, kHi, xHi, THi, IHi, CHi, EHi, AHi, PHi, RHi, DHi, OHi, MHi, NHi, LHi, FHi, jHi, sur = Y(() => {
    nHi = "automations-page-tab", rHi = "workflows-list", oHi = "workflows-empty", iHi = "workflows-refresh", sHi = "workflows-create-via-chat", aHi = "workflow-project-group", cHi = "workflow-global-group", lHi = "workflow-card", uHi = "workflow-card-run", dHi = "workflow-card-menu", pHi = "workflow-action-delete", fHi = "workflow-launch-dialog", mHi = "workflow-launch-arg", hHi = "workflow-launch-target", gHi = "workflow-launch-submit", _Hi = "workflow-launch-error", yHi = "workflow-run-digest", vHi = "workflow-action-move", bHi = "workflow-move-dialog", SHi = "workflow-move-dialog-target", wHi = "workflow-move-dialog-submit", kHi = "workflow-detail", xHi = "workflow-detail-run", THi = "workflow-detail-menu", IHi = "workflow-detail-tab", CHi = "workflow-detail-description", EHi = "workflow-detail-when-to-use", AHi = "workflow-detail-script", PHi = "workflow-meta-save", RHi = "workflow-meta-discard", DHi = "workflow-run-row", OHi = "workflow-run-artifacts", MHi = "workflow-run-artifacts-toggle", NHi = "workflow-run-artifact-card", LHi = "workflow-artifact-pane", FHi = "workflow-run-artifact-chip", jHi = "workflow-notification-artifact-chip"
});
var BHi, UHi, zHi, $Hi, qHi, WHi, VHi, HHi, GHi, aur = Y(() => {
    BHi = {
        File: "file",
        MediaPreview: "media-preview",
        System: "system",
        Terminal: "terminal",
        Git: "git",
        GitCheckpoint: "git-checkpoint",
        Setting: "setting",
        Credential: "credential",
        CuaPermission: "cua-permission",
        CuaPipSession: "cua-pip-session",
        Broadcast: "broadcast",
        ZCodeTask: "zcode-task",
        WindowController: "window-controller",
        ZCodeAgent: "zcode-agent",
        ZCodeSession: "zcode-session",
        ConversationShare: "conversation-share",
        FileWatcher: "file-watcher",
        OAuth: "oauth",
        ProviderSettings: "provider-settings",
        ModelSelection: "model-selection",
        ProviderProvisioningTarget: "provider-provisioning-target",
        UsageStats: "usage-stats",
        CodingPlanSubscription: "coding-plan-subscription",
        ClientConfig: "client-config",
        ClientScenes: "client-scenes",
        CloudContent: "cloud-content",
        MarketingTouch: "marketing-touch",
        Skills: "skills",
        SkillSync: "skill-sync",
        McpSync: "mcp-sync",
        PluginSync: "plugin-sync",
        Plugins: "plugins",
        PluginManagement: "plugin-management",
        Subagents: "subagents",
        Commands: "commands",
        Hooks: "hooks",
        Memory: "memory",
        OutputStyle: "output-style",
        SettingsSync: "settings-sync",
        Bots: "bots",
        Feedback: "feedback",
        PromptAttachmentTransfer: "prompt-attachment-transfer",
        OffPeakTask: "off-peak-task",
        OnboardingRecord: "onboarding-record"
    }, UHi = {
        SelectDirectory: "zcode:select-directory",
        SelectFile: "zcode:select-file",
        SelectFiles: "zcode:select-files",
        CreateTempTextAttachment: "zcode:create-temp-text-attachment",
        SaveFile: "zcode:save-file",
        PrintToPdf: "zcode:print-to-pdf",
        RemoteConnectionLog: "zcode:remote-connection-log",
        RemoteSessionClosed: "zcode:remote-session-closed",
        BotRemoteWorkspaceReconnected: "zcode:bot-remote-workspace-reconnected",
        ActivateOrSetWorkspace: "zcode:activate-or-set-workspace",
        ConnectRemote: "zcode:connect-remote",
        CancelPendingRemoteConnection: "zcode:cancel-pending-remote-connection",
        BindRemoteWorkspaceSessionContext: "zcode:bind-remote-workspace-session-context",
        StartWebRemoteControl: "zcode:start-web-remote-control",
        ResetWebRemoteControlPairing: "zcode:reset-web-remote-control-pairing",
        StopWebRemoteControl: "zcode:stop-web-remote-control",
        GetWebRemoteControlStatus: "zcode:get-web-remote-control-status",
        WebRemoteControlStatusChanged: "zcode:web-remote-control-status-changed",
        DisposeRemoteSession: "zcode:dispose-remote-session",
        IsDockerAvailable: "zcode:is-docker-available",
        ListWSLDistros: "zcode:list-wsl-distros",
        ListDockerContainers: "zcode:list-docker-containers",
        ListSSHConfigAliases: "zcode:list-ssh-config-aliases",
        LoadMcpFromUserDirectory: "zcode:load-mcp-from-user-directory",
        SaveMcpToUserDirectory: "zcode:save-mcp-to-user-directory",
        Log: "zcode:log",
        SyncWindowTabs: "zcode:sync-window-tabs",
        SyncWebRemoteControlWorkspaces: "zcode:sync-web-remote-control-workspaces",
        SyncWebRemoteControlTasks: "zcode:sync-web-remote-control-tasks",
        WebRemoteControlReconnectWorkspace: "zcode:web-remote-control-reconnect-workspace",
        SyncWindowUnreadCount: "zcode:sync-window-unread-count",
        SyncActiveTaskSession: "zcode:sync-active-task-session",
        SyncAppSettings: "zcode:sync-app-settings",
        SetShortcutRecordingActive: "zcode:set-shortcut-recording-active",
        FocusTab: "zcode:focus-tab",
        NewTab: "zcode:new-tab",
        CloseActiveContextRequest: "zcode:close-active-context-request",
        OpenBrowserUrl: "zcode:open-browser-url",
        BrowserViewReady: "zcode:browser-view-ready",
        BrowserViewOperation: "zcode:browser-view-operation",
        BrowserViewVisibility: "zcode:browser-view-visibility",
        BrowserViewViewportChanged: "zcode:browser-view-viewport-changed",
        BrowserViewScreenshotSurfacePrepare: "zcode:browser-view-screenshot-surface-prepare",
        BrowserViewScreenshotSurfaceReady: "zcode:browser-view-screenshot-surface-ready",
        BrowserViewScreenshotSurfaceRelease: "zcode:browser-view-screenshot-surface-release",
        BrowserViewCloseTab: "zcode:browser-view-close-tab",
        BrowserViewSuspend: "zcode:browser-view-suspend",
        BrowserViewRestore: "zcode:browser-view-restore",
        NewTask: "zcode:new-task",
        OpenWorkspace: "zcode:open-workspace",
        OpenWorkspacePath: "zcode:open-workspace-path",
        OpenFeedbackDialog: "zcode:open-feedback-dialog",
        OpenTicketsPanel: "zcode:open-tickets-panel",
        WindowFullscreenChanged: "zcode:window-fullscreen-changed",
        GetDesktopWindowChromeState: "zcode:get-desktop-window-chrome-state",
        DesktopWindowChromeStateChanged: "zcode:desktop-window-chrome-state-changed",
        WindowControlsOverlayChanged: "zcode:window-controls-overlay-changed",
        WindowControlsOverlayReady: "zcode:window-controls-overlay-ready",
        GetResourceUsageSnapshot: "zcode:get-resource-usage-snapshot",
        SetResourceUsageSamplingActive: "zcode:set-resource-usage-sampling-active",
        OpenResourceManager: "zcode:open-resource-manager",
        StorageStartScan: "zcode:storage-start-scan",
        StorageCancelScan: "zcode:storage-cancel-scan",
        StorageGetSnapshot: "zcode:storage-get-snapshot",
        StorageClean: "zcode:storage-clean",
        StorageRevealPath: "zcode:storage-reveal-path",
        StorageScanProgress: "zcode:storage-scan-progress",
        OpenExternal: "zcode:open-external",
        CanOpenCommunity: "zcode:can-open-community",
        OpenInFileManager: "zcode:open-in-file-manager",
        OpenExternalFile: "zcode:open-external-file",
        OpenCuaPermissionOnboarding: "zcode:open-cua-permission-onboarding",
        CancelCuaPermissionOnboarding: "zcode:cancel-cua-permission-onboarding",
        PrepareCuaHelperPermissionDrag: "zcode:prepare-cua-helper-permission-drag",
        StartCuaHelperPermissionDrag: "zcode:start-cua-helper-permission-drag",
        NotifyCuaHelperPermissionDragEnded: "zcode:notify-cua-helper-permission-drag-ended",
        OAuthRegisterState: "zcode:oauth-register-state",
        OAuthCallback: "zcode:oauth-callback",
        PaymentCallback: "zcode:payment-callback",
        ShareImport: "zcode:share-import",
        OAuthCallbackHandled: "zcode:oauth-callback-handled",
        RendererReady: "zcode:renderer-ready",
        SyncTelemetryContext: "zcode:sync-telemetry-context",
        ReportTelemetryEvent: "zcode:report-telemetry-event",
        ReportArmsCustomEvent: "zcode:report-arms-custom-event",
        GetRendererActionTraceConfig: "zcode:get-renderer-action-trace-config",
        RendererActionTraceConfigChanged: "zcode:renderer-action-trace-config-changed",
        ReportRendererActionTraceBatch: "zcode:report-renderer-action-trace-batch",
        ReportRendererHeapSample: "zcode:report-renderer-heap-sample",
        ReportLocalTtftBatch: "zcode:report-local-ttft-batch",
        ReadFinalArmsCustomEventsE2E: "zcode:e2e:read-final-arms-custom-events",
        ClearFinalArmsCustomEventsE2E: "zcode:e2e:clear-final-arms-custom-events",
        ConfigureFinalArmsCustomEventsE2E: "zcode:e2e:configure-final-arms-custom-events",
        ShowTaskNotification: "zcode:show-task-notification",
        TaskNotificationSound: "zcode:task-notification-sound",
        TaskNotificationClick: "zcode:task-notification-click",
        ExportLogs: "zcode:export-logs",
        CaptureWindowScreenshot: "zcode:capture-window-screenshot",
        BrowserViewAttachGuest: "zcode:browser-view-attach-guest",
        BrowserViewDetachGuest: "zcode:browser-view-detach-guest",
        BrowserViewCloseTabFromRenderer: "zcode:browser-view-close-tab-from-renderer",
        BrowserViewReportResidency: "zcode:browser-view-report-residency",
        BrowserViewSuspendReady: "zcode:browser-view-suspend-ready",
        BrowserViewEnsureResident: "zcode:browser-view-ensure-resident",
        BrowserViewRestoreTabs: "zcode:browser-view-restore-tabs",
        BrowserViewUpdateViewport: "zcode:browser-view-update-viewport",
        EmbeddedBrowserJavaScriptDialog: "zcode:embedded-browser-javascript-dialog",
        ImportChromeBrowserData: "zcode:import-chrome-browser-data",
        ClearEmbeddedBrowserData: "zcode:clear-embedded-browser-data",
        UpdateReady: "zcode:update-ready",
        UpdateCheckResult: "zcode:update-check-result",
        UpdateStateChanged: "zcode:update-state-changed",
        GetUpdateState: "zcode:get-update-state",
        DownloadUpdate: "zcode:download-update",
        CancelUpdateDownload: "zcode:cancel-update-download",
        OpenUpdateStatusWindow: "zcode:open-update-status-window",
        GetAutoUpdatePreferences: "zcode:get-auto-update-preferences",
        SetAutoDownloadAndInstallUpdates: "zcode:set-auto-download-and-install-updates",
        GetDesktopSessionActivity: "zcode:get-desktop-session-activity",
        GetDesktopZoomLevel: "zcode:get-desktop-zoom-level",
        DesktopZoomLevelChanged: "zcode:desktop-zoom-level-changed",
        GetZCodeStdioTapDevState: "zcode:get-zcode-stdio-tap-dev-state",
        SettingsChanged: "zcode:settings-changed",
        ApplicationLocaleChanged: "zcode:application-locale-changed",
        GetSystemLocale: "zcode:get-system-locale",
        PostUpdateReleaseNotes: "zcode:post-update-release-notes",
        AcknowledgePostUpdateReleaseNotes: "zcode:ack-post-update-release-notes",
        SkipUpdateVersion: "zcode:skip-update-version",
        QuitAndInstallUpdate: "zcode:quit-and-install-update",
        GetInstalledEditors: "zcode:get-installed-editors",
        GetApplicationIcon: "zcode:get-application-icon",
        OpenInEditor: "zcode:open-in-editor",
        ExecuteDesktopCommand: "zcode:execute-desktop-command",
        SetApplicationLocale: "zcode:set-application-locale",
        SetTitleBarTheme: "zcode:set-title-bar-theme",
        MigrateLegacyCommonMcp: "zcode:migrate-legacy-common-mcp",
        GetDeviceId: "zcode:get-device-id"
    }, zHi = {
        WheelBoundary: "zcode:embedded-browser-wheel-boundary"
    }, $Hi = {
        PurchaseComplete: "zcode:coding-plan-purchase-complete"
    }, qHi = {
        DatabaseStartupState: "zcode:database-startup-state",
        DatabaseStartupControl: "zcode:database-startup-control",
        ServicePort: "zcode:service-port",
        ScopedServicePort: "zcode:scoped-service-port",
        ScopedServicePortReady: "zcode:scoped-service-port-ready",
        TaskNotificationSound: "zcode:task-notification-sound"
    }, WHi = "x-zcode-rpc-client-mode", VHi = "x-zcode-rpc-host-capability", HHi = {
        DatabaseStartupControl: "database-startup-control",
        InitLocal: "init-local",
        ConnectRemoteWorkspace: "connect-remote-workspace",
        CancelRemoteWorkspaceConnect: "cancel-remote-workspace-connect",
        BindRemoteWorkspaceContext: "bind-remote-workspace-context",
        DisposeRemoteWorkspaceSession: "dispose-remote-workspace-session",
        AttachServicePort: "attach-service-port",
        DetachServicePort: "detach-service-port",
        Dispose: "dispose",
        Broadcast: "broadcast",
        BroadcastClaimResult: "broadcast-claim-result",
        TaskRealtimeDeliver: "task-realtime-deliver",
        TaskRunLeaseResult: "task-run-lease-result",
        TaskOwnerCommandDeliver: "task-owner-command-deliver",
        TaskOwnerCommandResult: "task-owner-command-result",
        BotRemoteWorkspaceReconnectResult: "bot-remote-workspace-reconnect-result",
        BotRemoteWorkspaceConnectionStatusResult: "bot-remote-workspace-connection-status-result",
        BotRemoteWorkspaceRuntimePort: "bot-remote-workspace-runtime-port",
        SessionMessageDeliver: "session-message-deliver",
        SessionMessageDeliveryResult: "session-message-delivery-result",
        FeedbackLogArchiveResult: "feedback-log-archive-result",
        CronRun: "cron-run",
        OffPeakRun: "off-peak-run",
        BrowserExecuteResult: "browser-execute-result",
        LocalMediaPreviewPathAuthorizeResult: "local-media-preview-path-authorize-result",
        CuaPipFocusChanged: "cua-pip-focus-changed",
        ProviderProvisioningExecute: "provider-provisioning-execute",
        ResourceUsageSnapshotRequest: "resource-usage-snapshot-request",
        ResourceUsageSnapshotCancel: "resource-usage-snapshot-cancel"
    }, GHi = {
        DatabaseStartupState: "database-startup-state",
        RemoteWorkspaceConnectionLog: "remote-workspace-connection-log",
        RemoteWorkspaceConnected: "remote-workspace-connected",
        RemoteWorkspaceConnectFailed: "remote-workspace-connect-failed",
        RemoteWorkspaceClosed: "remote-workspace-closed",
        Log: "log",
        AgentProcessSpawned: "agent-process-spawned",
        AgentProcessReady: "agent-process-ready",
        AgentProcessExited: "agent-process-exited",
        AgentProcessError: "agent-process-error",
        AgentProcessException: "agent-process-exception",
        AgentResourceSample: "agent-resource-sample",
        HostResourceSample: "host-resource-sample",
        McpTelemetry: "mcp-telemetry",
        McpResourceSamples: "mcp-resource-samples",
        ToolExecResource: "tool-exec-resource",
        SessionCreateTelemetry: "session-create-telemetry",
        ResourceUsageSnapshotResult: "resource-usage-snapshot-result",
        AgentRunningTaskCountChanged: "agent-running-task-count-changed",
        WorkspaceRunningTaskCountChanged: "workspace-running-task-count-changed",
        CuaOperationState: "cua-operation-state",
        RemoteWorkspaceAcquired: "remote-workspace-acquired",
        Broadcast: "broadcast",
        BroadcastClaimRequest: "broadcast-claim-request",
        BroadcastClaimCommit: "broadcast-claim-commit",
        BroadcastClaimRelease: "broadcast-claim-release",
        TaskRealtimePublish: "task-realtime-publish",
        TaskStreamOpPublish: "task-stream-op-publish",
        TaskRunLeaseAcquire: "task-run-lease-acquire",
        TaskRunLeaseRelease: "task-run-lease-release",
        TaskOwnerCommandRequest: "task-owner-command-request",
        TaskOwnerCommandResult: "task-owner-command-result",
        BotRemoteWorkspaceReconnectRequest: "bot-remote-workspace-reconnect-request",
        BotRemoteWorkspaceConnectionStatusRequest: "bot-remote-workspace-connection-status-request",
        BotRemoteWorkspaceRuntimePortRequest: "bot-remote-workspace-runtime-port-request",
        SessionMessageSendRequested: "session-message-send-requested",
        SessionRouteAnnounce: "session-route-announce",
        SessionMessageDeliverResult: "session-message-deliver-result",
        FeedbackLogArchiveRequest: "feedback-log-archive-request",
        CronRunResult: "cron-run-result",
        OffPeakRunResult: "off-peak-run-result",
        CronSchedulerWakeRequest: "cron-scheduler-wake-request",
        OffPeakSchedulerWakeRequest: "off-peak-scheduler-wake-request",
        BrowserExecuteRequest: "browser-execute-request",
        LocalMediaPreviewPathAuthorizeRequest: "local-media-preview-path-authorize-request",
        NetworkTelemetryBatch: "network-telemetry-batch",
        ProviderProvisioningSourceChanged: "provider-provisioning-source-changed",
        ProviderProvisioningExecutionResult: "provider-provisioning-execution-result"
    }
});

function KHi(e) {
    let t = new Map;
    for (let n of e) {
        let o = n.volume ? `dev:${n.volume.deviceId}` : `path:${n.path}`,
            s = t.get(o);
        if (s) {
            s.roots.push(n), s.bytes += n.bytes;
            continue
        }
        t.set(o, {
            key: o,
            volume: n.volume,
            roots: [n],
            bytes: n.bytes
        })
    }
    return [...t.values()].sort((n, o) => o.bytes - n.bytes)
}
var JHi, p_c, cur = Y(() => {
    JHi = ["sessionStore", "subagentTranscripts", "toolOutputs", "modelTrajectory", "devTraces", "logs", "backups", "exports", "runtimes", "config", "other"], p_c = "\u2026";
    r(KHi, "groupStorageRootsByVolume")
});

function ZHi(e) {
    let t = YHi(e);
    return t ? t === uur : !!XHi(e).startsWith(lur)
}

function YHi(e) {
    return typeof e == "object" && e !== null && "code" in e ? String(e.code ?? "") : ""
}

function XHi(e) {
    return e instanceof Error ? e.message : typeof e == "object" && e !== null && "message" in e ? String(e.message ?? "") : ""
}

function eGi(e, t = Date.now(), n = 3e4) {
    try {
        let o = e.split(".")[1];
        if (!o) return {
            kind: "unknown"
        };
        let s = o.replace(/-/g, "+").replace(/_/g, "/"),
            a = s.padEnd(Math.ceil(s.length / 4) * 4, "="),
            l = globalThis.atob(a),
            u = Uint8Array.from(l, _ => _.charCodeAt(0)),
            f = JSON.parse(new TextDecoder().decode(u));
        if (typeof f.exp != "number" || !Number.isFinite(f.exp) || f.exp <= 0) return {
            kind: "unknown"
        };
        let g = f.exp * 1e3;
        return t + Math.max(0, n) >= g ? {
            kind: "expired",
            expiresAt: g
        } : {
            kind: "valid",
            expiresAt: g
        }
    } catch {
        return {
            kind: "unknown"
        }
    }
}
var MYe, RJt, lur, uur, QHi, DJt = Y(() => {
    MYe = "bigmodel", RJt = "zai", lur = "\u51ED\u636E\u89E3\u5BC6\u5931\u8D25\uFF1A", uur = "ZCODE_CREDENTIAL_DECRYPT_FAILED";
    r(ZHi, "isCredentialDecryptError");
    r(YHi, "readCredentialErrorCode");
    r(XHi, "readCredentialErrorMessage");
    QHi = "auth:zcode-jwt-invalid";
    r(eGi, "resolveJwtExpiration")
});

function dur(e, t) {
    return (OJt[e] ?? OJt[$Ke])[t]
}

function nGi(e, t, n) {
    let o = dur(e, t);
    if (!n) return o;
    for (let [s, a] of Object.entries(n)) o = o.replaceAll(`{${s}}`, String(a));
    return o
}
var tGi, OJt, pur = Y(() => {
    iWt();
    tGi = {
        file: "titleBar.menu.file",
        edit: "titleBar.menu.edit",
        view: "titleBar.menu.view",
        window: "titleBar.menu.window",
        help: "titleBar.menu.help",
        fileNewTask: "titleBar.menu.file.newTask",
        fileOpenWorkspace: "titleBar.menu.file.openWorkspace",
        fileCloseWindow: "titleBar.menu.file.closeWindow",
        editUndo: "titleBar.menu.edit.undo",
        editRedo: "titleBar.menu.edit.redo",
        editCut: "titleBar.menu.edit.cut",
        editCopy: "titleBar.menu.edit.copy",
        editPaste: "titleBar.menu.edit.paste",
        editDelete: "titleBar.menu.edit.delete",
        editSelectAll: "titleBar.menu.edit.selectAll",
        viewToggleFullScreen: "titleBar.menu.view.toggleFullScreen",
        viewActualSize: "titleBar.menu.view.actualSize",
        viewZoomIn: "titleBar.menu.view.zoomIn",
        viewZoomOut: "titleBar.menu.view.zoomOut",
        windowMinimize: "titleBar.menu.window.minimize",
        windowZoom: "titleBar.menu.window.zoom",
        windowBringAllToFront: "titleBar.menu.window.bringAllToFront",
        appServices: "titleBar.menu.app.services",
        appHide: "titleBar.menu.app.hide",
        appHideOthers: "titleBar.menu.app.hideOthers",
        appShowAll: "titleBar.menu.app.showAll",
        appQuit: "titleBar.menu.app.quit",
        helpAbout: "titleBar.menu.help.about",
        helpWhatsNew: "titleBar.menu.help.whatsNew",
        helpCheckForUpdates: "titleBar.menu.help.checkForUpdates",
        helpToggleDevTools: "titleBar.menu.help.toggleDevTools",
        helpResourceManager: "titleBar.menu.help.resourceManager",
        helpToggleZCodeStdioTap: "titleBar.menu.help.toggleZCodeStdioTap",
        helpZCodeEndpoint: "titleBar.menu.help.zcodeEndpoint",
        helpZCodeEndpointProduction: "titleBar.menu.help.zcodeEndpoint.production",
        helpZCodeEndpointTest: "titleBar.menu.help.zcodeEndpoint.test",
        helpZCodeEndpointCustom: "titleBar.menu.help.zcodeEndpoint.custom",
        helpZCodeEndpointReset: "titleBar.menu.help.zcodeEndpoint.reset",
        helpFeedback: "titleBar.menu.help.feedback",
        helpExportLogs: "titleBar.menu.help.exportLogs",
        helpClearAllData: "titleBar.menu.help.clearAllData",
        helpCheckingForUpdates: "desktopMenu.help.checkingForUpdates",
        helpUpdateAvailableVersion: "desktopMenu.help.updateAvailableVersion",
        helpDownloadingUpdateVersion: "desktopMenu.help.downloadingUpdateVersion",
        helpDownloadingUpdateProgress: "desktopMenu.help.downloadingUpdateProgress",
        helpRestartToUpdate: "desktopMenu.help.restartToUpdate",
        dockShowCurrentWindow: "dock.menu.showCurrentWindow",
        trayTooltip: "tray.tooltip",
        trayOpenZCode: "tray.menu.openZCode",
        trayQuit: "tray.menu.quit"
    }, OJt = {
        "zh-CN": {
            "titleBar.menu.file": "\u6587\u4EF6",
            "titleBar.menu.edit": "\u7F16\u8F91",
            "titleBar.menu.view": "\u89C6\u56FE",
            "titleBar.menu.window": "\u7A97\u53E3",
            "titleBar.menu.help": "\u5E2E\u52A9",
            "titleBar.menu.file.newTask": "\u65B0\u5EFA\u4EFB\u52A1",
            "titleBar.menu.file.openWorkspace": "\u6253\u5F00\u5DE5\u4F5C\u533A",
            "titleBar.menu.file.closeWindow": "\u5173\u95ED\u7A97\u53E3",
            "titleBar.menu.edit.undo": "\u64A4\u9500",
            "titleBar.menu.edit.redo": "\u91CD\u505A",
            "titleBar.menu.edit.cut": "\u526A\u5207",
            "titleBar.menu.edit.copy": "\u590D\u5236",
            "titleBar.menu.edit.paste": "\u7C98\u8D34",
            "titleBar.menu.edit.delete": "\u5220\u9664",
            "titleBar.menu.edit.selectAll": "\u5168\u9009",
            "titleBar.menu.view.toggleFullScreen": "\u5207\u6362\u5168\u5C4F",
            "titleBar.menu.view.actualSize": "\u5B9E\u9645\u5927\u5C0F",
            "titleBar.menu.view.zoomIn": "\u653E\u5927",
            "titleBar.menu.view.zoomOut": "\u7F29\u5C0F",
            "titleBar.menu.window.minimize": "\u6700\u5C0F\u5316",
            "titleBar.menu.window.zoom": "\u7F29\u653E",
            "titleBar.menu.window.bringAllToFront": "\u5168\u90E8\u7F6E\u4E8E\u524D\u53F0",
            "titleBar.menu.app.services": "\u670D\u52A1",
            "titleBar.menu.app.hide": "\u9690\u85CF {appName}",
            "titleBar.menu.app.hideOthers": "\u9690\u85CF\u5176\u4ED6",
            "titleBar.menu.app.showAll": "\u5168\u90E8\u663E\u793A",
            "titleBar.menu.app.quit": "\u9000\u51FA {appName}",
            "titleBar.menu.help.about": "\u5173\u4E8E ZCode",
            "titleBar.menu.help.whatsNew": "\u66F4\u65B0\u65E5\u5FD7",
            "titleBar.menu.help.checkForUpdates": "\u68C0\u67E5\u66F4\u65B0",
            "titleBar.menu.help.toggleDevTools": "\u5207\u6362\u5F00\u53D1\u8005\u5DE5\u5177",
            "titleBar.menu.help.resourceManager": "\u8D44\u6E90\u7BA1\u7406\u5668",
            "titleBar.menu.help.toggleZCodeStdioTap": "\u6293\u53D6 Agent stdio \u901A\u4FE1",
            "titleBar.menu.help.zcodeEndpoint": "ZCode Endpoint",
            "titleBar.menu.help.zcodeEndpoint.production": "Production\uFF08\u9ED8\u8BA4\uFF09",
            "titleBar.menu.help.zcodeEndpoint.test": "Test",
            "titleBar.menu.help.zcodeEndpoint.custom": "\u81EA\u5B9A\u4E49...",
            "titleBar.menu.help.zcodeEndpoint.reset": "\u6062\u590D\u9ED8\u8BA4",
            "titleBar.menu.help.feedback": "\u95EE\u9898\u4E0A\u62A5",
            "titleBar.menu.help.exportLogs": "\u5BFC\u51FA\u65E5\u5FD7",
            "titleBar.menu.help.clearAllData": "\u6E05\u9664\u6240\u6709\u6570\u636E",
            "desktopMenu.help.checkingForUpdates": "\u6B63\u5728\u68C0\u67E5\u66F4\u65B0...",
            "desktopMenu.help.updateAvailableVersion": "\u53D1\u73B0\u65B0\u7248\u672C {version}",
            "desktopMenu.help.downloadingUpdateVersion": "\u6B63\u5728\u4E0B\u8F7D\u66F4\u65B0 {version}...",
            "desktopMenu.help.downloadingUpdateProgress": "\u6B63\u5728\u4E0B\u8F7D\u66F4\u65B0... {progress}",
            "desktopMenu.help.restartToUpdate": "\u91CD\u542F\u4EE5\u66F4\u65B0\uFF08{version}\uFF09",
            "dock.menu.showCurrentWindow": "\u663E\u793A\u5F53\u524D\u7A97\u53E3",
            "tray.tooltip": "ZCode",
            "tray.menu.openZCode": "\u6253\u5F00 ZCode",
            "tray.menu.quit": "\u9000\u51FA"
        },
        "en-US": {
            "titleBar.menu.file": "File",
            "titleBar.menu.edit": "Edit",
            "titleBar.menu.view": "View",
            "titleBar.menu.window": "Window",
            "titleBar.menu.help": "Help",
            "titleBar.menu.file.newTask": "New task",
            "titleBar.menu.file.openWorkspace": "Open workspace",
            "titleBar.menu.file.closeWindow": "Close window",
            "titleBar.menu.edit.undo": "Undo",
            "titleBar.menu.edit.redo": "Redo",
            "titleBar.menu.edit.cut": "Cut",
            "titleBar.menu.edit.copy": "Copy",
            "titleBar.menu.edit.paste": "Paste",
            "titleBar.menu.edit.delete": "Delete",
            "titleBar.menu.edit.selectAll": "Select all",
            "titleBar.menu.view.toggleFullScreen": "Toggle full screen",
            "titleBar.menu.view.actualSize": "Actual size",
            "titleBar.menu.view.zoomIn": "Zoom in",
            "titleBar.menu.view.zoomOut": "Zoom out",
            "titleBar.menu.window.minimize": "Minimize",
            "titleBar.menu.window.zoom": "Zoom",
            "titleBar.menu.window.bringAllToFront": "Bring all to front",
            "titleBar.menu.app.services": "Services",
            "titleBar.menu.app.hide": "Hide {appName}",
            "titleBar.menu.app.hideOthers": "Hide others",
            "titleBar.menu.app.showAll": "Show all",
            "titleBar.menu.app.quit": "Quit {appName}",
            "titleBar.menu.help.about": "About ZCode",
            "titleBar.menu.help.whatsNew": "What's new",
            "titleBar.menu.help.checkForUpdates": "Check for updates",
            "titleBar.menu.help.toggleDevTools": "Toggle developer tools",
            "titleBar.menu.help.resourceManager": "Resource manager",
            "titleBar.menu.help.toggleZCodeStdioTap": "Capture agent stdio traffic",
            "titleBar.menu.help.zcodeEndpoint": "ZCode Endpoint",
            "titleBar.menu.help.zcodeEndpoint.production": "Production (default)",
            "titleBar.menu.help.zcodeEndpoint.test": "Test",
            "titleBar.menu.help.zcodeEndpoint.custom": "Custom...",
            "titleBar.menu.help.zcodeEndpoint.reset": "Reset to default",
            "titleBar.menu.help.feedback": "Feedback",
            "titleBar.menu.help.exportLogs": "Export logs",
            "titleBar.menu.help.clearAllData": "Clear all data",
            "desktopMenu.help.checkingForUpdates": "Checking for updates...",
            "desktopMenu.help.updateAvailableVersion": "Update available {version}",
            "desktopMenu.help.downloadingUpdateVersion": "Downloading update {version}...",
            "desktopMenu.help.downloadingUpdateProgress": "Downloading update... {progress}",
            "desktopMenu.help.restartToUpdate": "Restart to update ({version})",
            "dock.menu.showCurrentWindow": "Show current window",
            "tray.tooltip": "ZCode",
            "tray.menu.openZCode": "Open ZCode",
            "tray.menu.quit": "Quit"
        }
    };
    r(dur, "getDesktopMenuMessage");
    r(nGi, "formatDesktopMenuMessage")
});
var fur, rGi, oGi, iGi, sGi, mur, aGi, hur = Y(() => {
    fur = "none", rGi = ["Plugin / MCP", "Agent\u4EFB\u52A1\u6267\u884C\u5931\u8D25", "\u6A21\u578B\u914D\u7F6E / API Key", "\u6A21\u578B\u8C03\u7528\u62A5\u9519", "\u6743\u9650 / \u914D\u7F6E\u4FDD\u5B58", "SSH\u8FDE\u63A5\u5931\u8D25", "WSL\u8FDE\u63A5\u5931\u8D25", "UI\u5E03\u5C40 / \u4EA4\u4E92", "\u6A21\u578B\u54CD\u5E94\u6162 / \u989D\u5EA6", "\u5D29\u6E83 / Internal Error", "\u6587\u6863 / \u4F7F\u7528\u54A8\u8BE2", "\u5176\u5B83"], oGi = [{
        value: "bug",
        label: "Bug \u53CD\u9988"
    }, {
        value: "usage",
        label: "\u4F7F\u7528\u95EE\u9898"
    }, {
        value: "feature",
        label: "\u529F\u80FD\u5EFA\u8BAE"
    }, {
        value: "performance",
        label: "\u6027\u80FD\u95EE\u9898"
    }], iGi = ["P1-\u9AD8", "P2-\u4E2D", "P3-\u4F4E"], sGi = "zcode-agent", mur = [{
        value: "zcode-agent",
        label: "ZCode Agent"
    }], aGi = [{
        value: fur,
        label: "\u672A\u6307\u5B9A"
    }, ...mur]
});

function cGi(e) {
    return e.VITE_ZCODE_E2E_STORE_BRIDGE === "1" && !!e.ZCODE_E2E_RUN_ID?.trim()
}
var gur = Y(() => {
    r(cGi, "shouldEnableE2ETestBridge")
});

function Uee(e) {
    return typeof e == "object" && e != null
}

function NYe(e) {
    return typeof e == "string" && e.trim() !== "" ? e : void 0
}

function FYe(e) {
    if (Uee(e)) return NYe(e.feedback_url)
}

function lGi(e) {
    if (Uee(e)) return NYe(e.feedback_api_base)
}

function uGi(e) {
    if (!Uee(e)) return !1;
    let t = e.feedback_use_external_form;
    return t === !0 || t === "true"
}

function LYe(e) {
    if (!Uee(e)) return {};
    let t = e.community_urls;
    return Uee(t) ? {
        "zh-CN": NYe(t["zh-CN"]),
        "en-US": NYe(t["en-US"])
    } : {}
}

function dGi(e, t) {
    return LYe(e)[t]
}

function jYe(e, t, n) {
    let o = LYe(e),
        s = LYe(t);
    return o[n] ?? s[n]
}

function pGi(e) {
    if (!Uee(e)) return;
    let t = e.forceUpdate;
    if (!Uee(t)) return;
    let n = t.minimalVersion;
    return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0
}
var MJt = Y(() => {
    r(Uee, "isRecord");
    r(NYe, "sanitizeUrl");
    r(FYe, "getFeedbackUrlFromConfig");
    r(lGi, "getFeedbackApiBaseFromConfig");
    r(uGi, "getFeedbackUseExternalFormFromConfig");
    r(LYe, "getCommunityUrlsFromConfig");
    r(dGi, "getCommunityUrlFromConfig");
    r(jYe, "getCommunityUrlFromConfigs");
    r(pGi, "getForceUpdateMinimalVersionFromConfig")
});

function mGi(e, t, n) {
    let o = new URL("/api/v1/client/configs", Pee(e).origin);
    return o.searchParams.set("app_version", t), n && o.searchParams.set("platform", n), o.toString()
}

function hGi(e, t) {
    let n = NJt.safeParse(e).data,
        o = NJt.safeParse(t).data;
    return {
        community_urls: {
            "zh-CN": jYe(n, o, "zh-CN"),
            "en-US": jYe(n, o, "en-US")
        },
        feedback_url: FYe(n) ?? FYe(o),
        feedback_use_external_form: n?.feedback_use_external_form ?? o?.feedback_use_external_form ?? !1
    }
}

function gGi(e) {
    let t = new Map,
        n = e.now ?? Date.now;
    return async (o, s) => {
        for (let [u, f] of t) !f.pending && f.expiresAt <= n() && t.delete(u);
        let a = t.get(o);
        if (a?.pending) return a.pending;
        if (a?.value && a.expiresAt > n()) return a.value;
        let l = {
            expiresAt: 0
        };
        t.set(o, l), l.pending = (async () => {
            let u = await e.fetchImpl(o, {
                method: "GET",
                cache: "no-store",
                credentials: "omit",
                headers: s,
                signal: AbortSignal.timeout(1e4)
            });
            if (!u.ok) throw new Error(`Help config HTTP ${u.status}`);
            let f = fGi.parse(await u.json()).data.configs.feedbackUrl;
            return l.value = f, l.expiresAt = n() + 3600 * 1e3, f
        })();
        try {
            return await l.pending
        } catch (u) {
            throw t.delete(o), u
        } finally {
            l.pending = void 0
        }
    }
}
var NJt, fGi, _ur = Y(() => {
    Fa();
    Dpe();
    MJt();
    NJt = m.object({
        community_urls: m.object({
            "zh-CN": m.string().optional().catch(void 0),
            "en-US": m.string().optional().catch(void 0)
        }).optional().catch(void 0),
        feedback_url: m.string().optional().catch(void 0),
        feedback_use_external_form: m.boolean().optional().catch(void 0)
    }), fGi = m.object({
        code: m.literal(0),
        data: m.object({
            configs: m.object({
                feedbackUrl: NJt
            })
        })
    });
    r(mGi, "buildHelpAppConfigUrl");
    r(hGi, "resolveHelpAppConfig");
    r(gGi, "createHelpAppConfigReader")
});
var yur, vur, bur, _Gi, Sur = Y(() => {
    Fa();
    yur = m.string().min(1).nullable(), vur = m.enum(["coding", "office"]).nullable(), bur = m.object({
        userId: m.string().min(1).nullable(),
        occupation: yur,
        interfaceMode: vur,
        memoryEnabled: m.boolean().nullable(),
        proactiveSuggestionsEnabled: m.boolean().nullable(),
        completedAt: m.string().min(1),
        uploadState: m.literal("pending")
    }), _Gi = m.object({
        version: m.literal(1),
        deviceMid: m.string().min(1),
        entries: m.array(bur)
    })
});

function yGi(e) {
    let t = BYe(e.now, "unknown", "");
    if (!e.providerFamilyDomain) return t;
    let n = wur({
        snapshot: e.codingPlanEntitlement,
        now: e.now,
        entitlementCacheTtlMs: e.entitlementCacheTtlMs
    });
    if (n.kind === "active") return BYe(n.generatedAt, "coding_plan", n.planProductId);
    if (n.kind !== "none") return t;
    let o = wur({
        snapshot: e.startPlanEntitlement,
        now: e.now,
        entitlementCacheTtlMs: e.entitlementCacheTtlMs
    });
    return o.kind === "active" ? BYe(o.generatedAt, "start_plan", o.planProductId) : o.kind === "none" ? BYe(e.now, "no_plan", "") : t
}

function BYe(e, t, n) {
    return {
        generatedAt: e,
        planStatus: t,
        planProductId: n
    }
}

function wur(e) {
    let t = e.snapshot;
    return t ? e.now - t.generatedAt > e.entitlementCacheTtlMs ? {
        kind: "unknown"
    } : !t.authenticated || t.unavailableReason === "unavailable" ? {
        kind: "unknown"
    } : t.unavailableReason === "not_authenticated" || t.unavailableReason === "not_configured" ? {
        kind: "unknown"
    } : t.unavailableReason === "no_plan" ? {
        kind: "none"
    } : t.quota || t.subscription || t.remaining ? {
        kind: "active",
        generatedAt: t.generatedAt,
        planProductId: t.subscription?.details[0]?.productId ?? ""
    } : {
        kind: "unknown"
    } : {
        kind: "unknown"
    }
}
var kur = Y(() => {
    r(yGi, "resolvePlanIdentitySnapshot");
    r(BYe, "createPlanIdentitySnapshot");
    r(wur, "resolvePlanEntitlementState")
});

function Tur(e) {
    let t = new URL(`${LJt}://local/preview`);
    return t.searchParams.set("path", e), t.toString()
}

function Cur(e) {
    switch (e.kind) {
        case "ssh":
            return {
                kind: "ssh", host: e.host, port: e.port, username: e.username, ...e.sshConfigAlias?.trim() ? {
                    sshConfigAlias: e.sshConfigAlias.trim()
                } : {}
            };
        case "wsl": {
            let t = e.user?.trim();
            return {
                kind: "wsl",
                distro: e.distro,
                ...t ? {
                    user: t
                } : {}
            }
        }
        case "docker":
            return {
                kind: "docker", container: e.container
            };
        case "server":
            return
    }
}
var xur, LJt, Iur, Eur, Aur = Y(() => {
    xur = "zcode-browser-restore://pending", LJt = "zcode-media";
    r(Tur, "buildLocalMediaPreviewUrl");
    Iur = 3e3;
    r(Cur, "createOpenInEditorRemoteTarget");
    Eur = {
        NewTask: "newTask",
        OpenWorkspace: "openWorkspace",
        CloseActiveContext: "closeActiveContext",
        CloseWindow: "closeWindow",
        MinimizeWindow: "minimizeWindow",
        ToggleMaximizeWindow: "toggleMaximizeWindow",
        ToggleFullScreen: "toggleFullScreen",
        ResetWindowSize: "resetWindowSize",
        ResetZoom: "resetZoom",
        ZoomIn: "zoomIn",
        ZoomOut: "zoomOut",
        ShowAbout: "showAbout",
        OpenChangelog: "openChangelog",
        CheckForUpdates: "checkForUpdates",
        RelaunchApp: "relaunchApp",
        OpenFeedback: "openFeedback",
        OpenCommunity: "openCommunity",
        ExportLogs: "exportLogs",
        ToggleDevTools: "toggleDevTools",
        OpenResourceManager: "openResourceManager",
        ToggleZCodeStdioTapDevProxy: "toggleZCodeStdioTapDevProxy",
        SetZCodeEndpointProduction: "setZCodeEndpointProduction",
        SetZCodeEndpointTest: "setZCodeEndpointTest",
        SetZCodeEndpointCustom: "setZCodeEndpointCustom",
        ResetZCodeEndpoint: "resetZCodeEndpoint",
        ClearAllData: "clearAllData",
        ClearCodingPlanWebviewStorage: "clearCodingPlanWebviewStorage",
        GetCuaOsSupport: "getCuaOsSupport"
    }
});

function UYe(e) {
    let t = e?.trim();
    if (!t) return "";
    try {
        let n = new URL(t);
        return n.protocol !== "https:" && n.protocol !== "http:" ? "" : n.hostname.toLowerCase()
    } catch {
        return ""
    }
}

function FJt(e) {
    return e ? "[redacted]" : ""
}

function vGi(e) {
    let t = UYe(e);
    if (t) return t;
    let n = e.trim().toLowerCase();
    return n && UYe(`https://${n}`) === n ? n : ""
}

function Pur(e, t) {
    return Object.fromEntries(Object.entries(t).map(([n, o]) => [n, n === "error_msg" ? FJt(o) : e === "app_login_ck" && n === "login_url" ? vGi(o) : o]))
}

function Rur(e) {
    let t = typeof Intl < "u" ? Intl.DateTimeFormat().resolvedOptions() : void 0,
        n = e?.timeZone ?? t?.timeZone ?? "UTC",
        o = e?.intlLocale ?? t?.locale ?? "en-US",
        s = globalThis.screen,
        a = e?.screen ?? s ?? {
            width: 0,
            height: 0
        };
    return {
        clientTimezone: n,
        clientLanguage: o,
        screenResolution: `${a.width}x${a.height}`
    }
}
var Dur = Y(() => {
    r(UYe, "resolveSafeTelemetryHostname");
    r(FJt, "sanitizeTelemetryErrorMessage");
    r(vGi, "sanitizeLoginHostname");
    r(Pur, "sanitizeTelemetryEventDetail");
    r(Rur, "collectTelemetryRendererContext")
});

function Our(e, t = {}) {
    if (typeof e != "string" || !e) return "";
    let n = t.maxLength ?? jJt;
    return e.slice(0, bGi).replace(/\bhttps?:\/\/[^\s"'<>]+/giu, s => BJt(s)).replace(/(\bauthorization\b["']?\s*[:=])\s*(?:(?:Bearer|Basic)\s+)?[^\s,"'};]+/giu, "$1 {redacted}").replace(/([?&](?:api[_-]?key|token|access[_-]?token|authorization|password|passwd|secret|cookie|session)=)[^&\s]+/giu, "$1{redacted}").replace(/(["']?(?:api[_-]?key|token|access[_-]?token|password|passwd|secret|client[_-]?secret|cookie|set-cookie|session)["']?\s*[:=]\s*["']?)(?!\{redacted\})[^\s,"'};]+/giu, "$1{redacted}").replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/giu, "$1 {redacted}").replace(/\b(?:sk|rk|pk)-[A-Za-z0-9_-]{12,}\b/giu, "{secret}").replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/gu, "{secret}").replace(/\bAKIA[A-Z0-9]{16}\b/gu, "{secret}").replace(/\bAIza[0-9A-Za-z_-]{30,}\b/gu, "{secret}").replace(/\b[^/@\s]+@[^/@\s]+\.[^/@\s]+\b/gu, "{email}").replace(/\/(?:private\/)?(?:var\/folders|tmp)\/[^\s:;,)\]}]+/gu, "{path}").replace(/\/(?:Users|home|root|workspace|workspaces|Volumes)\/[^/\s]+(?:\/[^\s:;,)\]}]+)*/gu, "{path}").replace(/\b[A-Za-z]:\\[^\\\s]+(?:\\[^\s:;,)\]}]+)*/gu, "{path}").replace(new RegExp("\\p{Cc}+", "gu"), " ").replace(/\s+/gu, " ").trim().slice(0, n)
}

function BJt(e) {
    let t = typeof e == "string" ? e.trim() : "";
    if (!t) return "unknown";
    if (/^blob:/iu.test(t)) return "blob";
    if (/^data:/iu.test(t)) return "data";
    if (/^file:/iu.test(t) || /^[a-zA-Z]:[\\/]/u.test(t) || t.startsWith("/")) return "local_file";
    try {
        let n = t.includes("://") ? t : /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?(?:[/?#]|$)/iu.test(t) ? `https://${t}` : "";
        if (!n) return "unknown";
        let o = new URL(n);
        if (o.protocol === "file:" || !o.host) return "local_file";
        let s = o.pathname.split("/").map(a => wGi(a)).join("/");
        return `${o.protocol}//${o.host}${s}`
    } catch {
        return "unknown"
    }
}

function wGi(e) {
    return e && (/@/u.test(e) || /^\d{7,}$/u.test(e) || /^[0-9a-f]{16,}$/iu.test(e) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/iu.test(e) ? "{segment}" : e.slice(0, SGi))
}

function xGi(e) {
    let t = pz(e);
    return t !== void 0 && t !== e
}

function zYe(e) {
    let t = e?.trim();
    return t ? QQ(t) || xGi(t) ? {
        providerId: t,
        providerScope: "builtin"
    } : {
        providerId: "custom",
        providerScope: "custom"
    } : {
        providerId: "",
        providerScope: "unknown"
    }
}

function TGi(e) {
    let t = dz(e);
    if (t) return t.modelName ?? "";
    let n = e.indexOf("/");
    return n > 0 ? e.slice(n + 1) : e
}

function ZAe(e, t) {
    let n = t?.trim();
    if (!n || e === "unknown") return "";
    if (e === "custom") return "custom";
    let o = TGi(n).toLowerCase();
    return UJt.has(o) ? o : "custom"
}

function Mur(e) {
    let t = e?.trim();
    if (!t) return "";
    let n = dz(t);
    if (n) return ZAe(zYe(n.providerId).providerScope, n.modelName);
    let o = t.indexOf("/");
    if (o > 0) {
        let {
            providerScope: s
        } = zYe(t.slice(0, o));
        return ZAe(s, t.slice(o + 1))
    }
    return ZAe("builtin", t)
}
var jJt, bGi, SGi, kGi, UJt, Nur = Y(() => {
    OEe();
    NEe();
    MEe();
    ZJe();
    jJt = 2048, bGi = 4096, SGi = 128;
    r(Our, "redactTelemetryText");
    r(BJt, "redactTelemetryUrl");
    r(wGi, "redactTelemetryRouteSegment");
    kGi = ["charglm-4", "codegeex-4", "emohaa"], UJt = new Set([...Q9t.map(e => e.toLowerCase()), ...kGi]);
    r(xGi, "isLegacyBuiltinTelemetryProviderId");
    r(zYe, "resolveTelemetryProviderScope");
    r(TGi, "extractBareModelId");
    r(ZAe, "resolveTelemetryModelId");
    r(Mur, "sanitizeTelemetryModelValue")
});

function IGi(e) {
    let t = e.workspaceIdentity?.trim();
    return {
        workspace_kind: t || e.remoteSessionId?.trim() ? "remote" : "local",
        remote_kind: t ? lA(t)?.kind ?? "" : ""
    }
}

function zJt(e, t) {
    return {
        result: e,
        error_category: e === "failure" ? t ?? "unknown" : ""
    }
}

function $Ye(e, t, n) {
    return {
        elementName: e,
        eventRegion: "web_remote_control",
        eventType: t,
        eventExtraDetail: n
    }
}

function CGi(e) {
    return {
        elementName: "remote_workspace_connect_result",
        eventRegion: "remote_workspace",
        eventType: "result",
        eventExtraDetail: {
            result: e.result,
            remote_kind: e.remoteKind,
            connect_trigger: e.connectTrigger,
            error_category: e.result === "success" ? "" : e.errorCategory ?? "unknown"
        }
    }
}

function EGi(e) {
    return $Ye("web_remote_control_entry_view", "view", {
        workspace_kind: e.workspaceKind,
        remote_kind: e.remoteKind ?? ""
    })
}

function AGi(e) {
    return $Ye("web_remote_control_start_result", "result", {
        ...zJt(e.result, e.errorCategory),
        workspace_kind: e.workspaceKind,
        remote_kind: e.remoteKind ?? ""
    })
}

function PGi(e) {
    return $Ye("web_remote_control_pair_result", "result", {
        ...zJt(e.result, e.errorCategory),
        pair_kind: e.pairKind,
        workspace_kind: e.workspaceKind,
        remote_kind: e.remoteKind ?? ""
    })
}

function RGi(e) {
    return $Ye("web_remote_control_bridge_result", "result", {
        ...zJt(e.result, e.errorCategory),
        workspace_kind: e.workspaceKind,
        remote_kind: e.remoteKind ?? "",
        entry_kind: e.entryKind
    })
}

function DGi(e) {
    if (typeof e == "string") return e.toLowerCase();
    if (typeof e != "object" || e === null) return "";
    let t = "code" in e ? String(e.code ?? "") : "",
        n = "message" in e ? String(e.message ?? "") : "";
    return `${t} ${n}`.toLowerCase()
}

function OGi(e) {
    let t = DGi(e);
    return /(auth|password|credential|token|permission|denied|unauthor)/.test(t) ? "auth" : /(deploy|download|install|asset|checksum)/.test(t) ? "deploy" : /(host_start|host start|spawn|process.*(?:exit|start)|host.*(?:exit|start))/.test(t) ? "host_start" : /(attach|desktop_host_missing|workspace.*(?:identity|missing|mismatch)|remote_session)/.test(t) ? "attach" : /(relay|websocket|web socket|pair|device.*(?:kicked|not.found))/.test(t) ? "relay" : /(connect|network|socket|ssh|wsl|docker|server|timeout|timedout|econn)/.test(t) ? "connect" : "unknown"
}
var Lur = Y(() => {
    aJt();
    r(IGi, "resolveWorkspaceTelemetryDetail");
    r(zJt, "buildResultDetail");
    r($Ye, "buildWebRemoteControlEvent");
    r(CGi, "buildRemoteWorkspaceConnectResultTelemetry");
    r(EGi, "buildWebRemoteControlEntryViewTelemetry");
    r(AGi, "buildWebRemoteControlStartResultTelemetry");
    r(PGi, "buildWebRemoteControlPairResultTelemetry");
    r(RGi, "buildWebRemoteControlBridgeResultTelemetry");
    r(DGi, "readErrorSearchText");
    r(OGi, "classifyRemoteUsageError")
});

function jur(e) {
    return JSON.stringify(e)
}

function Bur(e) {
    if (e == null || e === "") return null;
    let t;
    try {
        t = JSON.parse(e)
    } catch {
        return null
    }
    if (t == null || typeof t != "object") return null;
    let n = t,
        o = ["createdAt", "mainStart", "appReady", "loadUrl"],
        s = {};
    for (let a of o) {
        let l = n[a];
        if (typeof l != "number" || !Number.isFinite(l)) return null;
        s[a] = l
    }
    return s
}
var Fur, Uur = Y(() => {
    Fur = "zcodeLaunchMarks";
    r(jur, "serializeLaunchMarks");
    r(Bur, "parseLaunchMarks")
});

function $ur(e) {
    return e.toString(16).padStart(2, "0")
}

function xz(e = Date.now()) {
    let t = new Uint8Array(16);
    crypto.getRandomValues(t);
    let n = BigInt(e);
    t[0] = Number(n >> 40n & 0xffn), t[1] = Number(n >> 32n & 0xffn), t[2] = Number(n >> 24n & 0xffn), t[3] = Number(n >> 16n & 0xffn), t[4] = Number(n >> 8n & 0xffn), t[5] = Number(n & 0xffn), t[6] = 112 | t[6] & 15, t[8] = 128 | t[8] & 63;
    let o = Array.from(t, $ur).join("");
    return `${o.slice(0,8)}-${o.slice(8,12)}-${o.slice(12,16)}-${o.slice(16,20)}-${o.slice(20)}`
}

function zur(e) {
    let t = new Uint8Array(e);
    return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, [t.slice(0, 4), t.slice(4, 6), t.slice(6, 8), t.slice(8, 10), t.slice(10, 16)].map(o => Array.from(o, $ur).join("")).join("-")
}

function xV() {
    let e = globalThis.crypto;
    if (e?.randomUUID) return e.randomUUID();
    if (e?.getRandomValues) {
        let n = new Uint8Array(16);
        return e.getRandomValues(n), zur(n)
    }
    let t = new Uint8Array(16);
    for (let n = 0; n < t.length; n += 1) t[n] = Math.floor(Math.random() * 256);
    return zur(t)
}
var $Jt = Y(() => {
    r($ur, "byteToHex");
    r(xz, "uuidv7");
    r(zur, "formatUuid");
    r(xV, "createUuid")
});

function MGi(e) {
    return xV()
}

function NGi() {
    return xV()
}

function LGi() {
    return xV()
}

function FGi() {
    return xV()
}

function UGi(e) {
    return !!(e.cronAutomationId || e.automationId)
}

function zGi(e) {
    return !!e.offPeakTaskId
}
var jGi, BGi, qur = Y(() => {
    $Jt();
    r(MGi, "generateTraceId");
    r(NGi, "createSessionTraceId");
    r(LGi, "createInputId");
    r(FGi, "createQueryId");
    jGi = "zcode-default-group-cron", BGi = "zcode-default-group-off-peak";
    r(UGi, "isCronTask");
    r(zGi, "isOffPeakTask")
});

function $Gi(e) {
    return (typeof e == "string" ? e : e instanceof Error ? e.message : "").includes(Wur)
}

function qJt(e) {
    let t = e.indexOf(":");
    if (t <= 0) return null;
    let n = e.slice(0, t),
        o = e.slice(t + 1);
    if (o.startsWith("manual:")) return o.length > 7 ? {
        automationId: n,
        trigger: "manual"
    } : null;
    let s = Number(o);
    return !Number.isSafeInteger(s) || s <= 0 ? null : {
        automationId: n,
        trigger: "schedule",
        scheduledAt: s
    }
}
var eyc, Wur, Vur = Y(() => {
    eyc = 20, Wur = "AUTOMATION_CREATE_LIMIT_REACHED";
    r($Gi, "isAutomationCreateLimitError");
    r(qJt, "parseAutomationRunId")
});

function qGi(e) {
    return Hur.includes(e)
}

function WGi(e) {
    return qYe[e]
}

function VGi(e) {
    return !!e?.includes(Gur)
}
var Hur, Gur, qYe, Jur = Y(() => {
    Hur = ["completed", "failed", "cancelled"];
    r(qGi, "isOffPeakTerminalStatus");
    Gur = "off-peak-ticket-expired", qYe = {
        zai: "account:zai-offpeak-idle-plan",
        bigmodel: "account:bigmodel-offpeak-idle-plan"
    };
    r(WGi, "resolveOffPeakProviderId");
    r(VGi, "isOffPeakTicketExpiredError")
});

function HGi(e, t) {
    let n = new Map(e.map(o => [o.jobId, o]));
    for (let o of t) n.set(o.jobId, o);
    return Array.from(n.values())
}
var Kur = Y(() => {
    r(HGi, "mergeZCodeBackgroundTaskControlItems")
});

function zee(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function jO(e, t) {
    if (zee(e))
        for (let n of t) {
            let o = e[n];
            if (typeof o != "string") continue;
            let s = o.trim();
            if (s.length > 0) return s
        }
}

function WYe(e, t) {
    if (zee(e))
        for (let n of t) {
            let o = e[n];
            if (typeof o == "number" && Number.isFinite(o)) return o;
            if (typeof o == "string" && o.trim().length > 0) {
                let s = Number(o);
                if (Number.isFinite(s)) return s
            }
        }
}

function JGi(e, t) {
    if (zee(e))
        for (let n of t) {
            let o = e[n];
            if (typeof o == "boolean") return o;
            if (typeof o == "string") {
                let s = o.trim().toLowerCase();
                if (s === "true" || s === "yes" || s === "1") return !0;
                if (s === "false" || s === "no" || s === "0") return !1
            }
        }
}

function Yur(e, t) {
    let n = WYe(e, t);
    if (n !== void 0) return n;
    if (zee(e))
        for (let o of t) {
            let s = e[o];
            if (typeof s != "string" || s.trim().length === 0) continue;
            let a = Date.parse(s);
            if (Number.isFinite(a)) return a
        }
}

function Kpe(e) {
    if (typeof e == "string" && e.trim().length > 0) return e.trim();
    if (Array.isArray(e)) {
        let t = e.map(n => typeof n == "string" ? n.trim() : "").filter(n => n.length > 0);
        return t.length > 0 ? t.join(" ") : void 0
    }
}

function Zur(e) {
    let t = Kpe(e.command) ?? Kpe(e.cmd) ?? Kpe(e.script);
    if (t) return t;
    let n = zee(e.input) ? e.input : null;
    return n ? Kpe(n.command) ?? Kpe(n.cmd) ?? Kpe(n.script) : void 0
}

function VYe(e) {
    return e?.trim().toLowerCase().replace(/[^a-z0-9]+/gu, "_") ?? ""
}

function Xur(e) {
    if (e === "agent" || e === "local_agent" || e === "subagent" || e === "background_agent") return "agent";
    if (e === "bash" || e === "local_bash" || e === "shell" || e === "terminal" || e === "background_bash" || e === "background_shell") return "bash"
}

function KGi(e) {
    let t = VYe(jO(e, ["taskKind", "task_kind", "taskType", "task_type"]));
    return Xur(t)
}

function ZGi(e) {
    let t = VYe(jO(e, ["toolName", "tool_name"]));
    return t === "task" ? "agent" : Xur(t)
}

function YGi(e) {
    let t = VYe(jO(e, ["type", "kind", "category"]));
    if (t === "local_agent" || t === "subagent" || t === "background_agent" || t === "agent_background") return "agent";
    if (t === "local_bash" || t === "background_bash" || t === "background_shell" || t === "bash_background" || t === "shell_background") return "bash"
}

function XGi(e) {
    return KGi(e) ?? ZGi(e) ?? YGi(e)
}

function HYe(e) {
    return zee(e) ? XGi(e) : void 0
}

function QGi(e, t) {
    return t === "agent" ? jO(e, ["description", "summary", "title", "label"]) ?? Zur(e) : Zur(e) ?? jO(e, ["description", "summary", "title", "label"])
}

function eJi(e) {
    let t = VYe(e);
    return t === "queued" || t === "scheduled" || t === "starting" || t === "pending" ? "pending" : t === "running" || t === "in_progress" || t === "started" || t === "active" ? "running" : t === "completed" || t === "complete" || t === "success" || t === "succeeded" || t === "done" ? "completed" : t === "failed" || t === "failure" || t === "error" || t === "spawn_error" ? "failed" : t === "killed" || t === "cancelled" || t === "canceled" || t === "stopped" || t === "terminated" || t === "timed_out" || t === "timeout" ? "killed" : t === "lost" || t === "unknown" ? "lost" : "running"
}

function tJi(e, t) {
    let n = jO(e, ["taskId", "task_id", "backgroundTaskId", "background_task_id", "jobId", "job_id", "backgroundJobId", "background_job_id", "id"]);
    if (n) return n;
    let o = Yur(e, ["startedAt", "started_at", "startTime", "start_time"]);
    return `background-task:${WYe(e,["pid","processId","process_id"])??"no-pid"}:${o??"no-start"}:${t}`
}

function WJt(e) {
    if (!Array.isArray(e)) return [];
    let t = new Map;
    for (let n of e) {
        if (!zee(n)) continue;
        let o = HYe(n);
        if (!o) continue;
        let s = QGi(n, o);
        if (!s) continue;
        let a = tJi(n, s),
            l = jO(n, ["toolCallId", "tool_call_id"]),
            u = Yur(n, ["startedAt", "started_at", "startTime", "start_time"]),
            f = WYe(n, ["elapsedMs", "elapsed_ms", "durationMs", "duration_ms"]),
            g = WYe(n, ["pid", "processId", "process_id"]),
            _ = jO(n, ["title", "name", "label", "description"]),
            b = eJi(jO(n, ["status", "state", "phase"])),
            w = JGi(n, ["cancellable"]),
            T = jO(n, ["stdoutTail", "stdout_tail"]),
            I = jO(n, ["stderrTail", "stderr_tail"]),
            A = jO(n, ["outputTail", "output_tail"]),
            R = {
                jobId: a,
                ...l ? {
                    toolCallId: l
                } : {},
                command: s,
                taskKind: o,
                ...w !== void 0 ? {
                    cancellable: w
                } : {},
                ..._ ? {
                    title: _
                } : {},
                status: b,
                ...u !== void 0 ? {
                    startedAt: u
                } : {},
                ...f !== void 0 ? {
                    elapsedMs: f
                } : {},
                ...g !== void 0 ? {
                    pid: g
                } : {},
                ...T ? {
                    stdoutTail: T
                } : {},
                ...I ? {
                    stderrTail: I
                } : {},
                ...A ? {
                    outputTail: A
                } : {},
                raw: n
            };
        t.set(R.jobId, R)
    }
    return Array.from(t.values())
}

function GYe(e) {
    return GGi.has(e.status)
}

function JYe(e, t = Date.now()) {
    let n = e.startedAt !== void 0 ? Math.max(0, t - e.startedAt) : void 0;
    return Math.max(n ?? 0, e.elapsedMs ?? 0)
}

function VJt(e, t = Date.now(), n = 3e4) {
    return e.filter(GYe).map(o => ({
        ...o,
        elapsedMs: JYe(o, t)
    })).filter(o => o.elapsedMs >= n).sort((o, s) => s.elapsedMs - o.elapsedMs)
}
var GGi, HJt = Y(() => {
    GGi = new Set(["running"]);
    r(zee, "isPlainRecord");
    r(jO, "readStringField");
    r(WYe, "readNumberField");
    r(JGi, "readBooleanField");
    r(Yur, "readInstantMs");
    r(Kpe, "commandFromValue");
    r(Zur, "readCommand");
    r(VYe, "normalizeToken");
    r(Xur, "taskKindFromToken");
    r(KGi, "readExplicitTaskKind");
    r(ZGi, "readToolTaskKind");
    r(YGi, "readBackgroundTypeTaskKind");
    r(XGi, "resolveTaskKind");
    r(HYe, "resolveZCodeBackgroundTaskControlKind");
    r(QGi, "readDisplayCommand");
    r(eJi, "normalizeStatus");
    r(tJi, "readJobId");
    r(WJt, "parseZCodeBackgroundTaskControlItems");
    r(GYe, "isActiveZCodeBackgroundTaskControlItem");
    r(JYe, "getZCodeBackgroundTaskControlItemElapsedMs");
    r(VJt, "collectVisibleZCodeBackgroundTaskControlItems")
});

function KYe(e) {
    let t = e?.trim();
    if (!t?.startsWith("<task-notification>")) return null;
    let n = $ee(t, "tool-use-id");
    return n ? {
        toolUseId: n,
        notification: {
            error: $ee(t, "error"),
            outputFile: $ee(t, "output-file"),
            result: $ee(t, "result"),
            status: $ee(t, "status"),
            summary: $ee(t, "summary"),
            taskId: $ee(t, "task-id")
        }
    } : null
}

function nJi(e) {
    let t = new Map;
    for (let n of e) {
        if (n.info.role !== "user") continue;
        let o = KYe(kee(n.parts));
        o && t.set(o.toolUseId, o.notification)
    }
    return t
}

function JJt(e) {
    return e === "failed" || e === "lost" ? "failed" : e === "stopped" || e === "killed" ? "stopped" : "completed"
}

function rJi(e, t) {
    if (!t) return e;
    let n = GJt(e),
        o = GJt(n._meta),
        s = GJt(o.zcode);
    return {
        ...n,
        _meta: {
            ...o,
            zcode: {
                ...s,
                taskNotification: t
            }
        }
    }
}

function $ee(e, t) {
    let o = e.match(new RegExp(`<${t}>([\\s\\S]*?)<\\/${t}>`, "u"))?.[1]?.trim();
    return o ? oJi(o) : void 0
}

function oJi(e) {
    return e.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
}

function GJt(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e) ? e : {}
}
var Qur = Y(() => {
    Lj();
    r(KYe, "parseZCodeBackgroundTaskNotificationText");
    r(nJi, "collectZCodeBackgroundTaskNotificationsByToolUseId");
    r(JJt, "zcodeBackgroundTaskNotificationToolUpdateStatus");
    r(rJi, "attachZCodeBackgroundTaskNotificationToRaw");
    r($ee, "readTaskNotificationTag");
    r(oJi, "decodeTaskNotificationXmlText");
    r(GJt, "asPlainRecord")
});

function iJi(e) {
    return WJt(e).filter(lJi)
}

function sJi(e) {
    return GYe(e)
}

function aJi(e, t = Date.now()) {
    return JYe(e, t)
}

function cJi(e, t = Date.now(), n = 3e4) {
    return VJt(e, t, n)
}

function lJi(e) {
    return e.taskKind === "bash"
}
var edr = Y(() => {
    HJt();
    r(iJi, "parseZCodeBackgroundBashJobs");
    r(sJi, "isActiveZCodeBackgroundBashJob");
    r(aJi, "getZCodeBackgroundBashJobElapsedMs");
    r(cJi, "collectVisibleZCodeBackgroundBashJobs");
    r(lJi, "isBackgroundBashJob")
});

function ZYe(e) {
    return gJi.has(e) ? e : "build"
}

function YYe() {
    return KJt.map(e => ({
        value: e.id,
        name: e.name,
        description: e.description
    }))
}

function _Ji() {
    return KJt.map(e => ({
        ...e
    }))
}

function yJi(e) {
    let t = [{
        id: uJi,
        name: "Model",
        category: dJi,
        type: "select",
        currentValue: sV(e.model.current),
        options: e.model.available.map(n => {
            let o = n.reasoning?.levels.map(a => a.value),
                s = n.reasoning?.defaultLevel && o?.includes(n.reasoning.defaultLevel) ? n.reasoning.defaultLevel : void 0;
            return {
                value: sV(n.ref),
                name: n.label,
                description: n.description,
                modelProviderId: n.ref.providerId,
                modelProviderName: n.providerLabel ?? n.ref.providerId,
                ...o ? {
                    modelThoughtLevels: o
                } : {},
                ...s ? {
                    modelDefaultThoughtLevel: s
                } : {}
            }
        })
    }, {
        id: pJi,
        name: "Mode",
        category: fJi,
        type: "select",
        currentValue: ZYe(e.mode.current),
        options: YYe()
    }];
    if (e.thoughtLevel.enabled) {
        let n = new Set(e.thoughtLevel.available.map(s => s.value)),
            o = e.thoughtLevel.defaultLevel && n.has(e.thoughtLevel.defaultLevel) ? e.thoughtLevel.defaultLevel : void 0;
        t.push({
            id: mJi,
            name: "Thought Level",
            category: hJi,
            type: "select",
            currentValue: e.thoughtLevel.current ?? o ?? e.thoughtLevel.available[0]?.value ?? "",
            options: e.thoughtLevel.available.map(s => ({
                value: s.value,
                name: s.label,
                description: s.description
            }))
        })
    }
    return t
}
var uJi, dJi, pJi, fJi, mJi, hJi, KJt, gJi, tdr = Y(() => {
    aS();
    uJi = "model", dJi = "model", pJi = "mode", fJi = "mode", mJi = "thought_level", hJi = "thought_level", KJt = [{
        id: "build",
        name: "Ask before changes",
        description: "Ask before each file changes."
    }, {
        id: "edit",
        name: "Edit automatically",
        description: "Edit selected files or relevant workspace files automatically."
    }, {
        id: "plan",
        name: "Plan mode",
        description: "Inspect the code and present a plan before editing."
    }, {
        id: "yolo",
        name: "Full access",
        description: "Edit and run commands with fewer confirmations."
    }], gJi = new Set(KJt.map(e => e.id));
    r(ZYe, "normalizeAvailableZCodeMode");
    r(YYe, "getZCodeAgentModeSelectOptions");
    r(_Ji, "getZCodeAgentAvailableModes");
    r(yJi, "zcodeSessionSettingsToZCodeConfigOptions")
});
var ndr = Y(() => {});

function vJi(e) {
    return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "provider"
}

function bJi(e) {
    let t = 2166136261;
    for (let n of e) t ^= n.codePointAt(0) ?? 0, t = Math.imul(t, 16777619);
    return (t >>> 0).toString(16).padStart(8, "0")
}

function rdr(e) {
    let t = e.trim();
    if (!t) throw new Error("providerId \u4E0D\u80FD\u4E3A\u7A7A");
    return `${vJi(t)}-${bJi(t)}`
}

function SJi(e, t) {
    let n = t.trim();
    if (!n) throw new Error("modelName \u4E0D\u80FD\u4E3A\u7A7A");
    return `${rdr(e)}/${n}`
}
var odr = Y(() => {
    r(vJi, "toAsciiSlug");
    r(bJi, "hash8");
    r(rdr, "toOpencodeProviderKey");
    r(SJi, "toOpencodeModelId")
});

function ZJt(e = new Date) {
    let t = e.getFullYear(),
        n = String(e.getMonth() + 1).padStart(2, "0"),
        o = String(e.getDate()).padStart(2, "0"),
        s = String(e.getHours()).padStart(2, "0"),
        a = String(e.getMinutes()).padStart(2, "0"),
        l = String(e.getSeconds()).padStart(2, "0"),
        u = String(e.getMilliseconds()).padStart(3, "0");
    return `${t}-${n}-${o} ${s}:${a}:${l}.${u}`
}

function idr(e, t) {
    let n = ZJt(),
        o = t != null ? ` [pid:${t}]` : "";
    return `[${n}]${o} [${e}]`
}
var sdr = Y(() => {
    r(ZJt, "formatTimestamp");
    r(idr, "formatLogPrefix")
});

function adr(e) {
    return wJi.get(e)
}

function YJt(e) {
    return kJi.get(e) ?? null
}

function QYe(e) {
    let t = e?.trim();
    if (!t) return null;
    let n;
    try {
        n = new URL(t).hostname.toLowerCase()
    } catch {
        return null
    }
    for (let o of XYe)
        if (n === o.rootDomain || n.endsWith(`.${o.rootDomain}`)) return o.id;
    return null
}

function cdr(e) {
    let t = YJt(e);
    return t ? adr(t) : null
}

function xJi(e) {
    return cdr(e)?.label ?? null
}

function ldr(e) {
    return e === "zai" || e === "bigmodel" ? e : null
}

function XJt(e) {
    return e === "zai" ? "zai" : e === MYe ? "bigmodel" : null
}

function QJt(e) {
    let t = ldr(e.providerFamilyDomain);
    return t ? e.familyId === t : !0
}

function TJi(e) {
    return QJt({
        familyId: e.familyId,
        providerFamilyDomain: XJt(e.activeOAuthProvider)
    })
}

function udr(e) {
    let t = YJt(e.providerId);
    return t ? QJt({
        familyId: t,
        providerFamilyDomain: e.providerFamilyDomain
    }) : !0
}

function IJi(e) {
    return udr({
        providerId: e.providerId,
        providerFamilyDomain: XJt(e.activeOAuthProvider)
    })
}
var XYe, wJi, kJi, ddr = Y(() => {
    DJt();
    MEe();
    fWt();
    Dpe();
    XYe = [{
        id: "zai",
        label: "Z.ai",
        rootDomain: "z.ai",
        oauthProviderId: "zai",
        startPlanProviderId: rm.zaiStartPlan,
        individualCodingPlanProviderId: rm.zaiIndividualCodingPlan,
        teamCodingPlanProviderId: rm.zaiTeamCodingPlan,
        teamCodingPlanManageUrl: "https://z.ai/manage-apikey/subscription"
    }, {
        id: "bigmodel",
        label: "BigModel",
        rootDomain: "bigmodel.cn",
        oauthProviderId: MYe,
        startPlanProviderId: rm.bigmodelStartPlan,
        individualCodingPlanProviderId: rm.bigmodelIndividualCodingPlan,
        teamCodingPlanProviderId: rm.bigmodelTeamCodingPlan,
        teamCodingPlanManageUrl: AVt({
            ZCODE_ENV: mpe
        })
    }], wJi = new Map(XYe.map(e => [e.id, e])), kJi = new Map(XYe.flatMap(e => [e.startPlanProviderId, e.individualCodingPlanProviderId, e.teamCodingPlanProviderId].map(t => [t, e.id])));
    r(adr, "getModelProviderFamilySpec");
    r(YJt, "resolveModelProviderFamilyIdByProviderId");
    r(QYe, "resolveModelProviderFamilyIdByBaseURL");
    r(cdr, "resolveModelProviderFamilySpecByProviderId");
    r(xJi, "resolveModelProviderFamilyLabelByProviderId");
    r(ldr, "normalizeProviderFamilyDomain");
    r(XJt, "resolveProviderFamilyDomainFromOAuthProvider");
    r(QJt, "shouldShowModelProviderFamilyForDomain");
    r(TJi, "shouldShowModelProviderFamilyForActiveOAuth");
    r(udr, "shouldShowBuiltinModelProviderForDomain");
    r(IJi, "shouldShowBuiltinModelProviderForActiveOAuth")
});
var CJi, EJi, pdr = Y(() => {
    CJi = "ZCODE_AGENT_PROVIDER_NOT_READY", EJi = "provider_not_ready"
});

function fdr(e, t = 2166136261) {
    let n = t >>> 0;
    for (let o of e) n ^= o.codePointAt(0) ?? 0, n = Math.imul(n, 16777619), n >>>= 0;
    return n >>> 0
}

function RJi(e) {
    let t = fdr(e, 2166136261).toString(16).padStart(8, "0"),
        n = fdr(e, 2654435761).toString(16).padStart(8, "0");
    return `${t}${n}`.slice(0, 12)
}

function DJi(e) {
    return e.trim().replace(AJi, "")
}

function _dr(e) {
    return `${mdr}${e}`
}

function ydr(e) {
    return `${hdr}${e.trim()}`
}

function vdr(e) {
    let t = encodeURIComponent(e.trim() || "unknown");
    return t.length <= PJi ? t : `hash=${RJi(e)}`
}

function OJi(e, t, n) {
    return [gdr, e, ":", t, ":", vdr(n)].join("")
}

function MJi(e, t) {
    let n = dz(String(t ?? ""));
    return n?.providerId ? ydr(n.providerId) : _dr(e)
}
var mdr, hdr, gdr, AJi, PJi, bdr = Y(() => {
    OEe();
    mdr = "native:", hdr = "custom:", gdr = "ghost:", AJi = /\/+$/, PJi = 160;
    r(fdr, "fnv1a32");
    r(RJi, "hash12");
    r(DJi, "normalizeSupplierBaseUrl");
    r(_dr, "buildNativeSupplierKey");
    r(ydr, "buildCustomSupplierKey");
    r(vdr, "buildGhostSupplierIdentity");
    r(OJi, "buildGhostSupplierKey");
    r(MJi, "resolveSupplierKeyFromModelDisplayValue")
});
var Sdr = Y(() => {});
var NJi, wdr = Y(() => {
    NJi = "SKILL_SYNC_SIZE_LIMIT_EXCEEDED"
});
var kdr = Y(() => {});
var xdr = Y(() => {});
var Tdr = Y(() => {});
var Idr = Y(() => {});
var Cdr = Y(() => {});

function LJi(e) {
    let t = HJe(e);
    return t.code === eKt || t.message.includes(eKt)
}
var eKt, Edr = Y(() => {
    GJe();
    eKt = "DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR";
    r(LJi, "isDataBaseDirForbiddenWindowsInstallDirError")
});
var FJi, eXe, jJi, Adr = Y(() => {
    Fa();
    FJi = "settings:app-runtime-preferences", eXe = "ZCODE_E2E_ASK_USER_QUESTION_CLOCK_SCALE", jJi = m.object({
        askUserQuestionAutoResolutionEnabled: m.boolean(),
        modelIoFullRetentionEnabled: m.boolean().default(!1)
    }).strict()
});

function BJi(e) {
    return e.source === "user"
}

function UJi(e) {
    return e.source === "plugin"
}
var Pdr = Y(() => {
    r(BJi, "isUserCommand");
    r(UJi, "isPluginCommand")
});

function Rdr(e) {
    if (!e) return [];
    let t = e.split(`
`);
    return t[t.length - 1] === "" && t.pop(), t
}

function zJi(e, t) {
    let n = Rdr(e),
        o = Rdr(t),
        s = 0;
    for (; s < n.length && s < o.length && n[s] === o[s];) s += 1;
    let a = n.length - 1,
        l = o.length - 1;
    for (; a >= s && l >= s && n[a] === o[l];) a -= 1, l -= 1;
    let u = n.slice(s, a + 1),
        f = o.slice(s, l + 1);
    if (u.length === 0) return {
        added: f.length,
        removed: 0
    };
    if (f.length === 0) return {
        added: 0,
        removed: u.length
    };
    if (u.length * f.length > 4e5) return {
        added: f.length,
        removed: u.length
    };
    let g = Array.from({
        length: f.length + 1
    }, () => 0);
    for (let b = 1; b <= u.length; b += 1) {
        let w = 0;
        for (let T = 1; T <= f.length; T += 1) {
            let I = g[T];
            u[b - 1] === f[T - 1] ? g[T] = w + 1 : g[T] = Math.max(g[T], g[T - 1]), w = I
        }
    }
    let _ = g[f.length] ?? 0;
    return {
        added: f.length - _,
        removed: u.length - _
    }
}
var Ddr = Y(() => {
    r(Rdr, "splitIntoLogicalLines");
    r(zJi, "computeLineChangeStat")
});

function qJi(e) {
    if (!e) return null;
    let t = e.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return t ? t.slice(0, 24) : null
}

function Tz(...e) {
    let t = e.map(n => qJi(n)).filter(n => !!n);
    return [$Ji, ...t].join("-")
}

function WJi(e) {
    let t = e?.trim();
    return t ? t.split(/[\\/]+/).filter(Boolean).at(-1) ?? t : void 0
}

function VJi() {
    return Tz("main")
}

function HJi() {
    return Tz("gpu")
}

function GJi(e) {
    return Tz("host", e)
}

function JJi(e) {
    let t = e?.trim();
    if (!t || t === "ZCode") return Tz("renderer", "main");
    if (t === "Resource Manager") return Tz("renderer", "resource-manager");
    let n = "ZCode - ";
    return t.startsWith(n) ? Tz("renderer", "remote", t.slice(n.length)) : Tz("renderer", t)
}

function KJi(e, t) {
    return Tz("agent", e, WJi(t))
}

function ZJi(e, t = "utility") {
    return Tz(t, e)
}
var $Ji, Odr = Y(() => {
    $Ji = "zcode";
    r(qJi, "sanitizeProcessNameSegment");
    r(Tz, "joinZCodeProcessName");
    r(WJi, "pickWorkspaceTag");
    r(VJi, "formatZCodeMainProcessName");
    r(HJi, "formatZCodeGpuProcessName");
    r(GJi, "formatZCodeHostProcessName");
    r(JJi, "formatZCodeRendererProcessName");
    r(KJi, "formatZCodeAgentProcessName");
    r(ZJi, "formatZCodeUtilityProcessName")
});
var Mdr = Y(() => {});

function YJi(e, t) {
    let n = e ?? [],
        o = n[n.length - 1];
    return o && o.type === t.type && (o.type === "content" || o.type === "thought") && (t.type === "content" || t.type === "thought") ? [...n.slice(0, -1), {
        ...o,
        content: o.content + t.content
    }] : [...n, t]
}

function tXe(e) {
    for (let t = e.length - 1; t >= 0; t -= 1) {
        let n = e[t];
        if (n?.type === "content") return n
    }
    return null
}

function XJi(e) {
    return tXe(e)?.content ?? ""
}
var tKt = Y(() => {
    r(YJi, "appendAssistantMessagePart");
    r(tXe, "getLatestAssistantContentPart");
    r(XJi, "getLatestAssistantContentText")
});

function QJi(e) {
    let t = [];
    for (let o of e) {
        let s = t[t.length - 1];
        if (o.role === "assistant" && s?.role === "assistant" && !s.syntheticTimeline && !o.syntheticTimeline && s.goalIteration === o.goalIteration) {
            t[t.length - 1] = eKi(s, o);
            continue
        }
        t.push(o)
    }
    let n = -1;
    return t.map(o => {
        o.role === "user" && (n += 1);
        let s = n < 0 ? 0 : n;
        return o.turnIndex === s ? o : {
            ...o,
            turnIndex: s
        }
    })
}

function eKi(e, t) {
    let n = e.tools ?? [],
        o = t.tools ?? [],
        s = n.length + o.length > 0 ? [...n, ...o] : void 0,
        a = n.length,
        l = e.parts ?? [],
        u = (t.parts ?? []).map(I => I.type === "tool-call" ? {
            type: "tool-call",
            toolIndex: I.toolIndex + a
        } : I),
        f = l.length + u.length > 0 ? [...l, ...u] : void 0,
        g = e.content + t.content,
        _ = e.thought === void 0 && t.thought === void 0 ? void 0 : (e.thought ?? "") + (t.thought ?? ""),
        b = e.durationMs === void 0 || t.durationMs === void 0 ? void 0 : Math.max(t.timestamp + t.durationMs - e.timestamp, 0),
        w = e.characterCount === void 0 && t.characterCount === void 0 ? void 0 : g.length,
        T = tKi(e, t);
    return {
        ...e,
        content: g,
        timestamp: e.timestamp,
        model: t.model ?? e.model,
        durationMs: b,
        characterCount: w,
        interrupted: t.interrupted ?? e.interrupted,
        feedback: t.feedback ?? e.feedback,
        mergedMessageIds: T.length > 0 ? T : void 0,
        goalIteration: t.goalIteration ?? e.goalIteration,
        attachments: t.attachments ?? e.attachments,
        tools: s,
        thought: _,
        parts: f,
        checkpointState: t.checkpointState ?? e.checkpointState,
        checkpointReason: t.checkpointReason ?? e.checkpointReason,
        checkpointUpdatedAt: t.checkpointUpdatedAt ?? e.checkpointUpdatedAt,
        bodyRefs: t.bodyRefs ?? e.bodyRefs,
        toolSlice: t.toolSlice ?? e.toolSlice
    }
}

function tKi(e, t) {
    let n = [e.id, ...e.mergedMessageIds ?? [], t.id, ...t.mergedMessageIds ?? []].filter(o => !!o);
    return [...new Set(n)]
}
var Ndr = Y(() => {
    r(QJi, "coalesceConsecutiveZCodeAssistants");
    r(eKi, "mergeAssistantPair");
    r(tKi, "collectMergedMessageIds")
});

function nKi({
    content: e,
    thought: t,
    toolCalls: n
}) {
    let o = (n ?? []).filter(s => {
        let a = s.parentToolUseId ?? null;
        return !a || a === s.toolId || !(n ?? []).some(l => l.toolId === a)
    });
    return [...t ? [{
        type: "thought",
        content: t
    }] : [], ...o.map(s => ({
        type: "tool-call",
        toolId: s.toolId
    })), ...e ? [{
        type: "content",
        content: e
    }] : []]
}

function rKi({
    content: e,
    thought: t,
    toolCalls: n = [],
    parts: o,
    streaming: s = !1,
    interrupted: a = !1,
    settling: l = !1
}) {
    let u = o && o.length > 0 ? [...o] : nKi({
            content: e,
            thought: t,
            toolCalls: n
        }),
        f = new Map(n.map(I => [I.toolId, I])),
        g = new Set,
        _ = [];
    for (let I of u) {
        if (I.type === "content") {
            _.push({
                type: "content",
                content: I.content
            });
            continue
        }
        if (I.type === "thought") {
            _.push({
                type: "thought",
                content: I.content
            });
            continue
        }
        let A = f.get(I.toolId);
        if (!A || g.has(I.toolId)) continue;
        let R = A.parentToolUseId ?? null;
        R && R !== A.toolId && f.has(R) || (g.add(I.toolId), _.push({
            type: "tool-call",
            toolCall: A
        }))
    }
    let b = s || a || l ? null : tXe(_.filter(I => I.type === "content").map(I => ({
            type: "content",
            content: I.content
        }))),
        w = null,
        T = -1;
    return b && (T = _.findLastIndex(I => I.type === "content" && I.content === b.content), w = T >= 0 ? _[T] : null), {
        messageParts: u,
        blocks: _,
        latestPart: w,
        historyBlocks: _.filter((I, A) => A !== T)
    }
}
var Ldr = Y(() => {
    tKt();
    r(nKi, "buildFallbackAssistantParts");
    r(rKi, "buildZCodeAssistantPresentation")
});

function YAe(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function rKt(e) {
    return e.trim().replace(/\s+/g, " ")
}

function Fdr(e) {
    if (e.length === 0) return 0;
    let t = 1;
    for (let n = 0; n < e.length; n++) e.charCodeAt(n) === 10 && t++;
    return e.charCodeAt(e.length - 1) === 10 && t--, t
}

function Zpe(e, t) {
    for (let n of t) {
        let o = e[n];
        if (typeof o == "string") return o
    }
}

function nKt(e) {
    if (!YAe(e)) return null;
    let t = Zpe(e, ["old_string", "oldString", "oldText", "before"]),
        n = Zpe(e, ["new_string", "newString", "newText", "after", "content"]);
    if (t !== void 0 && n !== void 0) return {
        before: t,
        after: n
    };
    let o = e.metadata;
    if (YAe(o)) {
        let a = o.filediff;
        if (YAe(a)) {
            let l = Zpe(a, ["old_string", "oldString", "oldText", "before"]),
                u = Zpe(a, ["new_string", "newString", "newText", "after", "content"]);
            if (l !== void 0 && u !== void 0) return {
                before: l,
                after: u
            }
        }
    }
    let s = e.content;
    if (Array.isArray(s))
        for (let a of s) {
            if (!YAe(a)) continue;
            let l = Zpe(a, ["old_string", "oldString", "oldText", "before"]),
                u = Zpe(a, ["new_string", "newString", "newText", "after", "content"]);
            if (l !== void 0 && u !== void 0) return {
                before: l,
                after: u
            }
        }
    return null
}

function aKi(e, t, n, o) {
    if (!/(edit|patch|replace|multi.?edit)/i.test(e)) return;
    let s = nKt(t) ?? nKt(n) ?? nKt(o);
    if (!s) return;
    let a = Fdr(s.before),
        l = Fdr(s.after);
    if (!(l === 0 && a === 0)) return {
        added: l,
        removed: a
    }
}

function cKi(e) {
    if (typeof e == "string") {
        let t = rKt(e);
        return t.length > 0 ? t : void 0
    }
    if (YAe(e))
        for (let t of ["command", "path", "file_path", "filePath", "prompt"]) {
            let n = e[t];
            if (typeof n != "string") continue;
            let o = rKt(n);
            if (o.length > 0) return o
        }
}

function lKi(e) {
    return oKi.has(e)
}

function uKi(e) {
    return iKi.has(e)
}

function dKi(e, t) {
    return t === "stopped" ? "chat.toolCall.status.stopped" : sKi[e] ?? "chat.toolCall.status.pending"
}

function pKi({
    title: e,
    kind: t,
    input: n,
    output: o,
    raw: s
}) {
    let a = aKi(t, n, o, s),
        l = e && rKt(e) || "tool",
        u = cKi(n);
    return {
        primaryText: l,
        secondaryText: u,
        changeStat: a
    }
}
var oKi, iKi, sKi, jdr = Y(() => {
    oKi = new Set(["input-streaming", "input-available"]), iKi = new Set(["output-available", "output-error", "output-denied"]), sKi = {
        "input-streaming": "chat.toolCall.status.pending",
        "input-available": "chat.toolCall.status.running",
        "output-available": "chat.toolCall.status.completed",
        "output-error": "chat.toolCall.status.failed",
        "output-denied": "chat.toolCall.status.denied"
    };
    r(YAe, "isRecord");
    r(rKt, "normalizeDisplayText");
    r(Fdr, "countLines");
    r(Zpe, "readFirstStringField");
    r(nKt, "extractBeforeAfterText");
    r(aKi, "getChangeStat");
    r(cKi, "getInputSummary");
    r(lKi, "isCompactToolCallRunningState");
    r(uKi, "isCompactToolCallFinishedState");
    r(dKi, "getCompactToolCallStatusMessageId");
    r(pKi, "getCompactToolCallSummary")
});

function oKt(e) {
    let t = e?.trim();
    return t ? mKi.get(t.toLowerCase()) ?? null : null
}

function Udr(e) {
    let t = oKt(e);
    return t ? fKi[t] : null
}

function hKi(e, t) {
    return Udr(e) === t
}

function gKi(e) {
    return oKt(e) === "Write"
}
var Bdr, fKi, mKi, zdr = Y(() => {
    Bdr = ["Read", "Write", "Edit", "ApplyPatch", "Bash", "Glob", "Grep", "WebFetch", "WebSearch", "web_search", "TodoRead", "TodoWrite", "GoalRead", "ReadSessionContext", "AskUserQuestion", "SendMessage", "RespondToCoordinator", "TaskOutput", "TaskStop", "js", "js_reset", "js_add_node_module_dir", "mcp__node_repl__js", "mcp__node_repl__js_reset", "mcp__node_repl__js_add_node_module_dir", "Agent", "Task", "Skill", "CreateWorkflow", "AmendWorkflow", "submit_result"], fKi = {
        Read: "file-read",
        Write: "file-write",
        Edit: "file-write",
        ApplyPatch: "file-write",
        Bash: "shell",
        Glob: "search",
        Grep: "search",
        WebFetch: "search",
        WebSearch: "search",
        web_search: "search",
        TodoRead: "todo",
        TodoWrite: "todo",
        GoalRead: "goal",
        ReadSessionContext: "session-context",
        AskUserQuestion: "ask-user-question",
        SendMessage: "message",
        RespondToCoordinator: "message",
        TaskOutput: "task-control",
        TaskStop: "task-control",
        js: "node-repl",
        js_reset: "node-repl",
        js_add_node_module_dir: "node-repl",
        mcp__node_repl__js: "node-repl",
        mcp__node_repl__js_reset: "node-repl",
        mcp__node_repl__js_add_node_module_dir: "node-repl",
        Agent: "agent",
        Task: "agent",
        Skill: "skill",
        CreateWorkflow: "workflow",
        AmendWorkflow: "workflow",
        submit_result: "workflow"
    }, mKi = new Map(Bdr.map(e => [e.toLowerCase(), e]));
    r(oKt, "normalizeZCodeToolName");
    r(Udr, "getZCodeToolFamilyForName");
    r(hKi, "isZCodeToolFamily");
    r(gKi, "isZCodeFileContentWriteToolName")
});

function yKi(e, t) {
    return {
        ...e,
        deltaCount: (e?.deltaCount ?? 0) + 1,
        rawInput: `${e?.rawInput??""}${t}`
    }
}

function vKi(e, t) {
    if (t !== void 0) return {
        complete: !0,
        input: t,
        rawInput: e
    };
    let n = wKi(e);
    return n.ok ? {
        complete: !0,
        input: n.value,
        rawInput: e
    } : {
        complete: !1,
        input: kKi(e) ?? {},
        rawInput: e
    }
}

function bKi(e, t = {}) {
    if (t.mode === "background-summary") return !1;
    if ((e.deltaCount ?? 0) <= 1) return !0;
    let o = e.lastPreviewAt ?? 0;
    if (nXe(t.toolName)) return (t.now ?? Date.now()) - o >= 1e3;
    let s = e.lastPreviewRawInputLength ?? 0;
    return e.rawInput.length - s >= 8192 ? !0 : (t.now ?? Date.now()) - o >= 750 ? e.rawInput.length <= 8192 : !1
}

function nXe(e) {
    let t = e?.trim().toLowerCase();
    return t === "write" || t === "edit"
}

function SKi(e, t = Date.now()) {
    e.lastPreviewAt = t, e.lastPreviewRawInputLength = e.rawInput.length
}

function wKi(e) {
    try {
        return {
            ok: !0,
            value: JSON.parse(e)
        }
    } catch {
        return {
            ok: !1
        }
    }
}

function kKi(e) {
    let t = {};
    for (let n of _Ki) {
        let o = xKi(e, n);
        o !== void 0 && (t[n] = o)
    }
    return Object.keys(t).length > 0 ? t : null
}

function xKi(e, t) {
    let n = new RegExp(`"${EKi(t)}"\\s*:\\s*"`).exec(e);
    if (!n) return;
    let o = "",
        s = !1,
        a = !1;
    for (let l = n.index + n[0].length; l < e.length; l += 1) {
        let u = e[l] ?? "";
        if (s) {
            o += `\\${u}`, s = !1;
            continue
        }
        if (u === "\\") {
            s = !0;
            continue
        }
        if (u === '"') {
            a = !0;
            break
        }
        o += u
    }
    return s && (o += "\\"), TKi(o, a)
}

function TKi(e, t) {
    let n = t ? e : IKi(e);
    try {
        return JSON.parse(`"${n}"`)
    } catch {
        return CKi(n)
    }
}

function IKi(e) {
    return e.replace(/\\u[0-9a-fA-F]{0,3}$/, "").replace(/\\$/, "")
}

function CKi(e) {
    return e.replace(/\\n/g, `
`).replace(/\\r/g, "\r").replace(/\\t/g, "	").replace(/\\"/g, '"').replace(/\\\\/g, "\\")
}

function EKi(e) {
    return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
var tvc, nvc, rvc, iKt, ovc, _Ki, $dr = Y(() => {
    tvc = 1, nvc = 750, rvc = 8192, iKt = 1e3, ovc = 8192, _Ki = ["file_path", "filePath", "path", "target_path", "targetPath", "filename", "file", "content", "new_string", "newString", "new_text", "newText", "old_string", "oldString", "old_text", "oldText", "command", "description", "title", "pattern", "replacement", "plan", "name", "script"];
    r(yKi, "appendZCodeStreamingToolInputDelta");
    r(vKi, "buildZCodeStreamingToolInputPreview");
    r(bKi, "shouldMaterializeZCodeStreamingToolInputPreview");
    r(nXe, "isZCodeFileStreamingToolInputPreviewTool");
    r(SKi, "markZCodeStreamingToolInputPreviewMaterialized");
    r(wKi, "parseCompleteJson");
    r(kKi, "readPartialJsonObjectPreview");
    r(xKi, "readPartialJsonStringField");
    r(TKi, "decodeJsonStringSegment");
    r(IKi, "trimDanglingJsonEscape");
    r(CKi, "decodeJsonStringSegmentBestEffort");
    r(EKi, "escapeRegExp")
});

function Ype(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function VL(e) {
    return typeof e == "string" && e.trim().length > 0 ? e.trim() : void 0
}

function RKi(e) {
    let t = VL(e)?.replace(/-/g, "_").toLowerCase();
    return t === "pending" || t === "in_progress" || t === "completed" ? t : null
}

function DKi(e, t) {
    if (typeof e == "string") {
        let s = e.trim();
        return s ? {
            id: s,
            title: s,
            status: t === 0 ? "in_progress" : "pending"
        } : null
    }
    if (!Ype(e)) return null;
    let n = VL(e.content) ?? VL(e.step) ?? VL(e.title) ?? VL(e.text) ?? VL(e.activeForm),
        o = RKi(e.status);
    return !n || !o ? null : {
        id: VL(e.id) ?? n,
        title: n,
        status: o
    }
}

function sKt(e) {
    try {
        return JSON.parse(e)
    } catch {
        return
    }
}

function OKi(e) {
    let t = typeof e == "string" ? sKt(e) : e;
    if (!Ype(t)) return null;
    for (let n of PKi) {
        let o = t[n];
        if (Array.isArray(o)) return o
    }
    return null
}

function qdr(e) {
    let t = OKi(e);
    if (!t || t.length === 0) return null;
    let n = t.map((o, s) => DKi(o, s)).filter(o => o !== null);
    return n.length === t.length ? n : null
}

function MKi(e) {
    let t = [e],
        n = typeof e == "string" ? sKt(e) : void 0;
    if (n !== void 0 && t.push(n), Ype(e))
        for (let o of ["content", "output", "result"]) {
            let s = e[o];
            if (t.push(s), typeof s == "string") {
                let a = sKt(s);
                a !== void 0 && t.push(a)
            }
        }
    return t
}

function aKt(e) {
    return typeof e == "string" && AKi.test(e.trim())
}

function NKi(e) {
    let t = e._meta;
    if (!Ype(t)) return;
    let n = t.claudeCode;
    if (Ype(n)) return VL(n.parentToolUseId)
}

function cKt(...e) {
    for (let t of e)
        if (Ype(t) && (VL(t.source) === "subagent" || VL(t.parentToolCallId) || VL(t.parentToolUseId) || NKi(t))) return !1;
    return !0
}

function lKt(e) {
    let t = [e.title, e.kind].filter(Boolean).join(" ");
    return aKt(t) ? qdr(e.input) : null
}

function uKt(e) {
    let t = [e.title, e.kind].filter(Boolean).join(" ");
    if (!aKt(t)) return null;
    for (let n of MKi(e.output)) {
        let o = qdr(n);
        if (o) return o
    }
    return null
}
var AKi, PKi, Wdr = Y(() => {
    AKi = /(?:^|[_\s-])(?:todo[_\s-]*(?:read|write)|update[_\s-]*plan)(?:$|[_\s-])/i, PKi = ["todos", "plan", "steps", "items"];
    r(Ype, "isRecord");
    r(VL, "readString");
    r(RKi, "normalizePlanStatus");
    r(DKi, "parsePlanStep");
    r(sKt, "parseJsonValue");
    r(OKi, "readPlanCollection");
    r(qdr, "extractPlanStepsFromValue");
    r(MKi, "collectOutputCandidates");
    r(aKt, "isTodoPlanToolName");
    r(NKi, "readClaudeParentToolUseId");
    r(cKt, "isMainAgentToolProjectionSource");
    r(lKt, "extractPlanStepsFromToolInput");
    r(uKt, "extractPlanStepsFromToolOutput")
});

function zj(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function Hdr(e) {
    return e.trim().replace(/\s+/g, " ")
}

function Gdr(e) {
    return e.trim().replace(/\r\n/g, `
`)
}

function UKi(e) {
    return Array.isArray(e) ? e.map(t => typeof t == "string" ? t.trim() : typeof t == "number" || typeof t == "boolean" || typeof t == "bigint" ? String(t) : "").filter(t => t.length > 0) : []
}

function zKi(e) {
    return zj(e) ? "rawInput" in e && e.rawInput !== void 0 ? e.rawInput : "input" in e ? e.input : e : e
}

function $Ki(e) {
    for (let [t, n] of Object.entries(e)) {
        if (!LKi.has(t.toLowerCase()) || typeof n != "string") continue;
        let o = Gdr(n);
        if (o.length !== 0) {
            for (let [s, a] of Object.entries(e)) {
                if (!FKi.has(s.toLowerCase())) continue;
                let l = UKi(a);
                if (l.length > 0) return `${o} ${l.join(" ")}`
            }
            return o
        }
    }
    return null
}

function rXe(e, t = new Set, n = !1) {
    if (typeof e == "string") {
        if (!n) return null;
        let s = Gdr(e);
        return s.length > 0 ? s : null
    }
    if (Array.isArray(e)) {
        if (t.has(e)) return null;
        t.add(e);
        for (let s of e) {
            let a = rXe(s, t);
            if (a) return a
        }
        return null
    }
    if (!zj(e) || t.has(e)) return null;
    t.add(e);
    let o = $Ki(e);
    if (o) return o;
    for (let s of ["rawInput", "input", "params", "toolCall"]) {
        if (!(s in e)) continue;
        let a = rXe(e[s], t, s === "rawInput" || s === "input" || s === "params");
        if (a) return a
    }
    for (let s of Object.values(e)) {
        if (!Array.isArray(s) && !zj(s)) continue;
        let a = rXe(s, t);
        if (a) return a
    }
    return null
}

function Vdr(e, t) {
    let n = Hdr(t);
    !n || e.includes(n) || e.push(n)
}

function dKt(e, t, n) {
    if (!(t.length >= TV)) {
        if (typeof e == "string") {
            Vdr(t, e);
            return
        }
        if (Array.isArray(e)) {
            if (n.has(e)) return;
            n.add(e);
            for (let o of e)
                if (dKt(o, t, n), t.length >= TV) return;
            return
        }
        if (!(!zj(e) || n.has(e)) && (n.add(e), !(typeof e.path == "string" && (Vdr(t, e.path), t.length >= TV)))) {
            for (let o of Object.values(e))
                if (dKt(o, t, n), t.length >= TV) return
        }
    }
}

function pKt(e, t, n = new Set) {
    if (!(t.length >= TV)) {
        if (Array.isArray(e)) {
            if (n.has(e)) return;
            n.add(e);
            for (let o of e)
                if (pKt(o, t, n), t.length >= TV) return;
            return
        }
        if (!(!zj(e) || n.has(e))) {
            n.add(e);
            for (let [o, s] of Object.entries(e)) {
                let a = o.toLowerCase();
                if (!BKi.has(a)) {
                    if (jKi.has(a)) {
                        if (dKt(s, t, n), t.length >= TV) return;
                        continue
                    }
                    if (!(!Array.isArray(s) && !zj(s)) && (pKt(s, t, n), t.length >= TV)) return
                }
            }
        }
    }
}

function fKt(e, t, n = new Set) {
    if (Array.isArray(e)) {
        if (n.has(e)) return;
        n.add(e);
        for (let o of e) fKt(o, t, n);
        return
    }
    if (!(!zj(e) || n.has(e))) {
        if (n.add(e), zj(e.changes))
            for (let [o, s] of Object.entries(e.changes)) zj(s) && (s.type !== "add" && s.type !== "update" || t.some(a => a.path === o && a.type === s.type) || t.push({
                path: o,
                type: s.type
            }));
        for (let o of Object.values(e)) !Array.isArray(o) && !zj(o) || fKt(o, t, n)
    }
}

function qKi(e) {
    let t = e.raw,
        n = [];
    pKt(t, n);
    let o = Hdr(e.title ?? e.description ?? e.kind) || "permission",
        s = rXe(zKi(t), new Set, !0),
        a = [];
    fKt(t, a);
    let l = a.length === 1 ? a[0] : null,
        u = s ? "command" : n.length > 0 ? "file" : "generic";
    return {
        title: o,
        command: s,
        filePaths: n,
        scope: u,
        fileChange: l,
        fileChanges: a
    }
}
var LKi, FKi, jKi, BKi, TV, Jdr = Y(() => {
    LKi = new Set(["command", "cmd", "script", "shellcommand"]), FKi = new Set(["args", "argv", "arguments"]), jKi = new Set(["path", "paths", "file", "file_path", "filepath", "files", "filename", "filenames", "target", "targets", "location", "locations"]), BKi = new Set(["cwd", "directory", "workingdirectory"]), TV = 6;
    r(zj, "isRecord");
    r(Hdr, "normalizeInlineText");
    r(Gdr, "normalizeBlockText");
    r(UKi, "getStringArray");
    r(zKi, "readPermissionInputSource");
    r($Ki, "getCommandFromRecord");
    r(rXe, "findFirstCommand");
    r(Vdr, "pushUniquePath");
    r(dKt, "extractPathsFromCandidate");
    r(pKt, "collectFilePaths");
    r(fKt, "collectFileChanges");
    r(qKi, "getPermissionRequestPreview")
});

function WKi(e) {
    return {
        reason: "connection-recovery-timeout",
        message: e
    }
}

function $j(e, t) {
    let n = e.get(t)?.trim();
    return n || void 0
}

function Kdr(e) {
    return e === "light" || e === "dark" || e === "zai-light" || e === "zai-dark" || e === "system"
}

function HKi(e) {
    let t = e.trim() || "/",
        n = "/";
    try {
        n = new URL(t, "https://zcode.invalid").pathname
    } catch {
        n = t.startsWith("/") ? t : `/${t}`
    }
    let o = n.replace(/\/+$/, "") || "/";
    return o === "/" ? "/remote" : o
}

function GKi(e, t) {
    let n = r(o => o.replace(/\/+$/, "") || "/", "normalizeRoutePath");
    return n(e) === n(t)
}

function JKi({
    baseUrl: e,
    deviceSid: t,
    passHash: n,
    timestamp: o,
    deviceMid: s,
    deviceName: a,
    appVersion: l,
    theme: u
}) {
    let f = new URL(e);
    return f.searchParams.set("sid", t), f.searchParams.set("hash", n), f.searchParams.set("t", String(o)), s?.trim() && f.searchParams.set("mid", s), a?.trim() && f.searchParams.set("name", a), l?.trim() && f.searchParams.set("app_version", l), f.toString()
}

function KKi(e) {
    let t = $j(e, "sid"),
        n = $j(e, "hash"),
        o = $j(e, "t"),
        s = o ? Number(o) : Number.NaN,
        a = $j(e, "theme");
    return !t || !n || !Number.isFinite(s) ? null : {
        deviceSid: t,
        passHash: n,
        timestamp: s,
        ...$j(e, "mid") ? {
            deviceMid: $j(e, "mid")
        } : {},
        ...$j(e, "name") ? {
            deviceName: $j(e, "name")
        } : {},
        ...$j(e, "app_version") ? {
            appVersion: $j(e, "app_version")
        } : {},
        ...Kdr(a) ? {
            theme: a
        } : {}
    }
}

function ZKi(e) {
    switch (e) {
        case qee.SessionNotFound:
            return "session-not-found";
        case qee.SessionConflict:
            return "session-conflict";
        case qee.DesktopDisconnected:
            return "desktop-disconnected";
        case qee.SessionExpired:
            return "session-expired";
        case qee.WorkspaceClosed:
            return "workspace-closed";
        case qee.InvalidMobileConnection:
            return "invalid-mobile-connection";
        default:
            return null
    }
}

function XAe(e) {
    return e.workspaceIdentity?.trim() || e.workspacePath
}

function YKi(e) {
    return e.kind !== "remote" || !!(e.workspaceIdentity && e.remoteSessionId)
}

function XKi({
    workspaces: e,
    mobileViewState: t,
    initialViewState: n
}) {
    let o = e.filter(YKi),
        s = new Set(o.map(g => XAe(g))),
        a = new Set(e.map(g => XAe(g))),
        l = t ?? n,
        u = l?.activeWorkspaceKey;
    if (u && s.has(u)) return {
        workspaceKey: u,
        ...l.activeTaskId ? {
            taskId: l.activeTaskId
        } : {},
        canBridge: !0
    };
    let f = o[0];
    if (!f) {
        if (u && a.has(u)) return {
            workspaceKey: u,
            ...l?.activeTaskId ? {
                taskId: l.activeTaskId
            } : {},
            canBridge: !1
        };
        let g = e[0];
        return g ? {
            workspaceKey: XAe(g),
            canBridge: !1
        } : null
    }
    return {
        workspaceKey: XAe(f),
        canBridge: !0
    }
}
var dvc, pvc, VKi, qee, Zdr = Y(() => {
    dvc = 12e4, pvc = 5e3;
    r(WKi, "createWebRemoteControlConnectionRecoveryTimeoutFailure");
    VKi = [{
        passHash: "dGVzdF9oYXNo",
        nonce: "nonce-1",
        role: "device",
        deviceSid: "device-1",
        proof: "XK0m7u-26VS88uk7ISAX5Z_9pjzq8jqyP77N-HkCsPE"
    }, {
        passHash: "dGVzdF9oYXNo",
        nonce: "nonce-1",
        role: "terminal",
        deviceSid: "device-1",
        proof: "YkqkJy-p-iZK1g1AcoGd0Q83REOggX1EygWkcxW4oLU"
    }];
    r($j, "readNonEmptySearchParam");
    r(Kdr, "isWebRemoteControlThemeSeed");
    r(HKi, "resolveWebRemoteControlRoutePathFromBaseUrl");
    r(GKi, "matchesWebRemoteControlRoutePath");
    r(JKi, "buildWebRemoteControlExternalQrUrl");
    r(KKi, "parseWebRemoteControlExternalQrParams");
    qee = {
        SessionNotFound: 4004,
        SessionConflict: 4009,
        DesktopDisconnected: 4010,
        SessionExpired: 4011,
        WorkspaceClosed: 4012,
        InvalidMobileConnection: 4013
    };
    r(ZKi, "resolveWebRemoteControlFailureReasonFromCloseCode");
    r(XAe, "resolveWebRemoteControlWorkspaceKey");
    r(YKi, "isWebRemoteControlBridgeableWorkspaceTarget");
    r(XKi, "resolveWebRemoteControlInitialWorkspaceSelection")
});

function Ydr(e) {
    let t = e();
    return Number.isFinite(t) ? Math.min(.999999999, Math.max(0, t)) : 0
}

function Xdr(e = 1e4, t) {
    let n = Number.isFinite(e) && e > 0 ? Math.floor(e) : 1e4,
        o = Math.min(2e3, Math.floor(n * .2)),
        s = t ?? o;
    return !Number.isFinite(s) || s <= 0 ? 0 : Math.min(Math.floor(s), Math.max(0, n - 1))
}

function QKi(e = 1e4, t, n = Math.random) {
    let o = Number.isFinite(e) && e > 0 ? Math.floor(e) : 1e4,
        s = Xdr(o, t),
        a = Math.max(1, o - s),
        l = o + s;
    return a + Math.floor(Ydr(n) * (l - a + 1))
}

function eZi(e = 2e3, t = Math.random) {
    if (!Number.isFinite(e) || e <= 0) return 0;
    let n = Math.floor(e);
    return Math.floor(Ydr(t) * (n + 1))
}
var hvc, gvc, _vc, yvc, Qdr = Y(() => {
    hvc = 1e4, gvc = 2e3, _vc = 3e4, yvc = 2e3;
    r(Ydr, "safeRandom");
    r(Xdr, "getWebRemoteControlHeartbeatJitterMs");
    r(QKi, "getWebRemoteControlHeartbeatDelayMs");
    r(eZi, "getWebRemoteControlReconnectJitterMs")
});
var epr = Y(() => {});
var tZi, nZi, tpr = Y(() => {
    tZi = "coding_plan_security_verification_required", nZi = "coding_plan_system_busy"
});

function npr(e) {
    let t = e.trim().replace(/^v/i, ""),
        n = t.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
    if (n) return {
        major: Number(n[1]),
        minor: Number(n[2]),
        patch: Number(n[3]),
        prerelease: n[4]?.split(".") ?? []
    };
    let o = t.match(/^(\d+)$/);
    if (o) return {
        major: Number(o[1]),
        minor: 0,
        patch: 0,
        prerelease: []
    };
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
    for (let o of e.matchAll(n)) {
        let s = o[1] ?? o[2] ?? o[3] ?? "";
        if (o[1] !== void 0) try {
            s = JSON.parse(`"${s}"`)
        } catch {}
        t.push({
            key: s,
            quoted: o[3] === void 0,
            end: o.index + o[0].length
        })
    }
    return t
}

function DZi(e, t) {
    if (t || e.username || e.password || e.hostname === "hooks.slack.com" || [...e.searchParams.keys()].some(n => Qpe(n, !1) || /^(?:.*signature|sig|code)$/i.test(NKt(n)))) return !0;
    try {
        return decodeURIComponent(e.pathname).split("/").some(n => {
            let o = NKt(n);
            return Jpr.test(o) || /^(?:webhook\w*|(?:password)?reset(?:password)?|invites?|invitations?|callback|downloads?|signed|verify|verification|activate|magiclink)$/.test(o.toLowerCase())
        })
    } catch {
        return !0
    }
}

function Kpr(e, t) {
    let n = e.replace(/\b((?:Proxy-)?Authorization|Cookie|Set-Cookie)\s*:\s*[^\r\n]+/gi, `$1: ${YI}`).replace(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z0-9 ]*PRIVATE KEY-----|$)/g, YI).replace(/\bBearer\s+[^\s"'\\,;]+/gi, `Bearer ${YI}`).replace(/([\w.-]+)(\s*[=:]\s*)(?:"(?:\\.|[^"\\])*"|'[^']*'|[^\s,;"'<>]+)/g, (o, s, a) => Qpe(s, !1) ? `${s}${a}${YI}` : o).replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s"'<>\\]+/gi, o => {
        try {
            let s = new URL(o);
            return DZi(s, t) && s.pathname && s.pathname !== "/" && (s.pathname = `/${YI}`), s.username = "", s.password = "", s.search = "", s.hash = "", s.toString()
        } catch {
            return YI
        }
    }).replace(/(?:\/(?:Users|home)\/|[a-z]:\\Users\\)[^\s"'<>]+/gi, "[USER_PATH]");
    return t && (n = n.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]")), n
}

function cXe(e, t, n = 0) {
    return n > 32 ? YI : typeof e == "string" ? Zpr(e, t, n + 1) : Array.isArray(e) ? e.map(o => cXe(o, t, n + 1)) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).map(([o, s]) => [o, Qpe(o, t) ? YI : cXe(s, t, n + 1)])) : e
}

function MKt(e, t) {
    return Kpr(e, t).split(/\r?\n/).map(n => LKt(n).some(({
        key: s,
        quoted: a,
        end: l
    }) => Qpe(s, t) && (a || t || !n.slice(l).startsWith(YI))) ? YI : n).join(`
`)
}

function OZi(e, t) {
    let n = 0,
        o = !1,
        s = !1;
    for (let a = t; a < e.length; a += 1) {
        let l = e[a];
        if (o) s ? s = !1 : l === "\\" ? s = !0 : l === '"' && (o = !1);
        else if (l === '"') o = !0;
        else if (l === "{" || l === "[") n += 1;
        else if ((l === "}" || l === "]") && --n === 0) return a + 1
    }
    return e.length
}

function Zpr(e, t, n) {
    if (n > 32) return YI;
    try {
        let l = JSON.parse(e);
        if (l && typeof l == "object") return JSON.stringify(cXe(l, t, n + 1))
    } catch {}
    let o = Kpr(e, t),
        s = [],
        a = 0;
    for (let l = 0; l < o.length; l += 1) {
        if (o.startsWith(YI, l)) {
            l += YI.length - 1;
            continue
        }
        if (o[l] !== "{" && o[l] !== "[") continue;
        let u = o.slice(a, l),
            f = OZi(o, l),
            g = u.slice(u.lastIndexOf(`
`) + 1),
            _ = LKt(g).some(({
                key: w
            }) => Qpe(w, t));
        if (_) {
            let w = o.indexOf(`
`, f);
            f = w < 0 ? o.length : w
        }
        let b = o.slice(l, f);
        s.push(MKt(u, t));
        try {
            s.push(_ ? YI : JSON.stringify(cXe(JSON.parse(b), t, n + 1)))
        } catch {
            s.push(_ || LKt(b).some(({
                key: w
            }) => Qpe(w, t)) ? YI : MKt(b, t))
        }
        a = f, l = f - 1
    }
    return s.push(MKt(o.slice(a), t)), s.join("")
}

function Ypr(e, t = {}) {
    return Zpr(e, t.diagnostic === !0, 0)
}
var YI, Jpr, RZi, Xpr = Y(() => {
    YI = "[REDACTED]", Jpr = /(?:password|passwd|passphrase|secret|token|apikey|accesskey|privatekey|authorization|cookie|credential)/i, RZi = /^(?:content|messages?|prompt|systemprompt|request|response|body|payload|input|output|toolinput|tooloutput|arguments|args|env|environment|headers|text|completion|result|stdout|stderr|data|params)$/i;
    r(NKt, "normalizeKey");
    r(Qpe, "shouldRedactKey");
    r(LKt, "fieldKeys");
    r(DZi, "shouldRedactUrlPath");
    r(Kpr, "redactValues");
    r(cXe, "scrubValue");
    r(MKt, "redactPlainText");
    r(OZi, "jsonFragmentEnd");
    r(Zpr, "redactText");
    r(Ypr, "redactFeedbackText")
});
var Qpr = {};
Ng(Qpr, {
    ACTIVE_REMOTE_RESOURCE_PACKAGE_IDS: () => nZe,
    ALL_BOT_WORKSPACES: () => o3i,
    APP_RUNTIME_PREFERENCES_CHANGED_BROADCAST_CHANNEL: () => FJi,
    APP_USAGE_RANGES: () => Cpe,
    ARMS_CUSTOM_EVENT_PROPERTY_LIMIT: () => Snr,
    ASK_USER_QUESTION_E2E_CLOCK_SCALE_ENV: () => eXe,
    AUTOMATION_CREATE_LIMIT: () => eyc,
    AUTOMATION_CREATE_LIMIT_ERROR_CODE: () => Wur,
    ApiError: () => XGt,
    BACKGROUND_BASH_OUTPUT_MAX_BYTES: () => sZe,
    BASH_RESOURCE_MAX_SAMPLES: () => YZe,
    BASH_RESOURCE_SAMPLE_INTERVAL_MS: () => LAe,
    BIGMODEL_PROVIDER_ID: () => MYe,
    BOT_BIND_CODE_TTL_MS: () => i3i,
    BOT_REPLY_GRANULARITIES: () => Drr,
    BOT_TASK_BROADCAST_CHANNEL: () => s3i,
    BOT_TASK_STREAM_BROADCAST_CHANNEL: () => a3i,
    BOT_ZCODE_PROVIDER_OPTIONS: () => g3i,
    BROWSER_SCREENSHOT_SURFACE_PREPARE_TIMEOUT_MS: () => Iur,
    BROWSER_VIEWPORT_LIMITS: () => aAe,
    BROWSER_VIEWPORT_ZOOM_OPTIONS: () => tnr,
    BROWSER_VIEW_RESTORE_BOOTSTRAP_URL: () => xur,
    BUILTIN_MODEL_PROVIDER_IDS: () => rm,
    BUILTIN_PROVIDER_TEMPLATE_IDS: () => XQ,
    BUILTIN_ZCODE_SLASH_COMMAND_HELP_ENTRIES: () => qL,
    CLAUDE_OFFICIAL_PLUGIN_MARKETPLACE_ID: () => K9t,
    CODING_PLAN_LOCAL_WEBVIEW_ORIGIN: () => jrr,
    CODING_PLAN_SECURITY_VERIFICATION_REQUIRED: () => tZi,
    CODING_PLAN_SIGNATURE_CONFIG_CACHE_TTL_MS: () => Ucr,
    CODING_PLAN_SIGNATURE_CONFIG_PATH: () => rJt,
    CODING_PLAN_SIGNATURE_CONFIG_TIMEOUT_MS: () => zcr,
    CODING_PLAN_SYSTEM_BUSY: () => nZi,
    CONVERSATION_PREVIEW_CARD_CANDIDATE_LIMIT: () => Elr,
    CONVERSATION_PREVIEW_CARD_VISIBLE_LIMIT: () => RUi,
    CONVERSATION_SHARE_SCHEMA_VERSION: () => EYe,
    CREDENTIAL_DECRYPT_ERROR_CODE: () => uur,
    CREDENTIAL_DECRYPT_ERROR_PREFIX: () => lur,
    CRON_DEFAULT_GROUP_ID: () => jGi,
    CUSTOM_MODEL_VALUE_PREFIX: () => DEe,
    CUSTOM_SUPPLIER_KEY_PREFIX: () => hdr,
    ClientRequestSigningV4Error: () => Fee,
    ClientRequestSigningV4KeyCache: () => VAe,
    ClientRequestSigningV4Manager: () => HAe,
    CodingPlanSignatureFeatureGate: () => WAe,
    CodingPlanWebviewChannels: () => $Hi,
    DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR_ERROR_CODE: () => eKt,
    DEFAULT_AGENT_BROWSER_VIEWPORT: () => E6i,
    DEFAULT_BIGMODEL_API_ORIGIN: () => Brr,
    DEFAULT_BOT_COMMANDS: () => m3i,
    DEFAULT_BOT_REPLY_GRANULARITY: () => Lrr,
    DEFAULT_BROWSER_VIEWPORT_ZOOM: () => rnr,
    DEFAULT_DYNAMIC_WORKFLOW_MODE: () => Hlr,
    DEFAULT_EMBEDDED_BROWSER_VIEWPORT_PREFERENCE: () => bWt,
    DEFAULT_ENABLED_OFFICIAL_PLUGIN_IDS: () => AFi,
    DEFAULT_FEEDBACK_TICKET_FRAMEWORK: () => sGi,
    DEFAULT_INTRANET_MACHINE_HOST: () => spr,
    DEFAULT_LOCALE: () => $Ke,
    DEFAULT_PLUGIN_MARKETPLACES: () => Z9t,
    DEFAULT_REMOTE_ASSET_INSTALL_MODE: () => vnr,
    DEFAULT_WEB_REMOTE_CONTROL_RELAY_WS_URL: () => Grr,
    DEFAULT_ZAI_BUSINESS_BASE_URL: () => qrr,
    DEFAULT_ZAI_OAUTH_CLIENT_ID: () => Vrr,
    DEFAULT_ZAI_OAUTH_ORIGIN: () => zrr,
    DEFAULT_ZCODE_ENDPOINT_ORIGIN: () => Aee,
    DEFAULT_ZCODE_MODEL_CONTEXT_BUDGET_STRATEGY: () => FO,
    DISABLED_RENDERER_ACTION_TRACE_CONFIG: () => S6i,
    DYNAMIC_WORKFLOW_MODES: () => Wlr,
    DesktopCommandIds: () => Eur,
    ESTIMATED_TOKEN_CHAR_DIVISOR: () => Eee,
    EmbeddedBrowserWebviewChannels: () => zHi,
    FALLBACK_PLUGIN_STORE_CATEGORY: () => iXe,
    FEEDBACK_FRAMEWORK_NONE: () => fur,
    FEEDBACK_TICKET_FRAMEWORKS: () => aGi,
    FEEDBACK_TICKET_FRAMEWORK_OPTIONS: () => mur,
    FEEDBACK_TICKET_MODULES: () => rGi,
    FEEDBACK_TICKET_SEVERITIES: () => iGi,
    FEEDBACK_TICKET_TYPES: () => oGi,
    GHOST_SUPPLIER_KEY_PREFIX: () => gdr,
    HostMessageTypes: () => HHi,
    HostResponseTypes: () => GHi,
    INTRANET_ASSET_BASE_URL: () => cpr,
    INTRANET_ASSET_SERVICE_PORT: () => gKt,
    INTRANET_DEPS_BASE_URL: () => iZi,
    INTRANET_MACHINE_HOST: () => hKt,
    INTRANET_PROBE_SERVICE_PATH: () => upr,
    INTRANET_PROBE_SERVICE_PORT: () => lpr,
    INTRANET_PROBE_SERVICE_URL: () => sZi,
    InternalChannels: () => qHi,
    LAUNCH_MARKS_QUERY_KEY: () => Fur,
    LOCAL_MEDIA_PREVIEW_SCHEME: () => LJt,
    LOCAL_TTFT_BUCKETS_MS: () => z3i,
    LOCAL_TTFT_CLOCK_MAX_ERROR_MS: () => kor,
    LOCAL_TTFT_CLOCK_TTL_MS: () => $3i,
    LOCAL_TTFT_MAX_DETAILS: () => wz,
    LOCAL_TTFT_MAX_PENDING: () => Mpe,
    LOCAL_TTFT_PREPARATION_STAGES: () => wor,
    LOCAL_TTFT_STAGES: () => Sor,
    LOCAL_TTFT_TTL_MS: () => HVt,
    MAX_SKILL_SCAN_DEPTH: () => lZi,
    MCP_SERVER_FAILURE_KINDS: () => Uor,
    MCP_USAGE_QUOTA_LIMIT_TYPE: () => Xji,
    MEDIA_BUDGET_CURRENT_ATTACHMENT_TOO_LARGE_ERROR_CODE: () => SAe,
    MEDIA_BUDGET_CURRENT_IMAGE_TOO_LARGE_ERROR_CODE: () => LWt,
    MEDIA_BUDGET_CURRENT_VIDEO_TOO_LARGE_ERROR_CODE: () => FWt,
    MEDIA_PREVIEW_FORMATS: () => PYe,
    MEMORY_SAMPLE_HEAP_DELTA_RATIO: () => Ecc,
    MEMORY_SAMPLE_HEARTBEAT_MS: () => Pcc,
    MEMORY_SAMPLE_INTERVAL_MS: () => Ccc,
    MEMORY_SAMPLE_NATIVE_DELTA_RATIO: () => Acc,
    MODEL_PROVIDER_FAMILY_SPECS: () => XYe,
    NATIVE_SUPPLIER_KEY_PREFIX: () => mdr,
    NODE_REPL_BROWSER_BROKER_SOCKET_ENV: () => yKt,
    NODE_REPL_BROWSER_BROKER_TOKEN_ENV: () => vKt,
    NON_MCP_FALLBACK_EXTRA_ERROR_PATTERNS: () => bFi,
    NON_RETRYABLE_WORKSPACE_PREPARE_ERROR_PATTERNS: () => qQn,
    OFFICIAL_CUA_PERMISSION_RULE_TOOL_NAME: () => wee,
    OFFICIAL_GLM_MODEL_IDS: () => Q9t,
    OFFICIAL_MCP_AUTH_FAILURE_REASONS: () => yor,
    OFFICIAL_MCP_AUTH_HEADER_NAMES: () => hor,
    OFFICIAL_MCP_AUTH_META_KEY: () => FVt,
    OFFICIAL_MCP_AUTH_PORT_FAILURE_REASONS: () => BVt,
    OFFICIAL_MCP_DEV_TRUSTED_ORIGINS_ENV: () => UVt,
    OFFICIAL_MCP_RESERVED_HEADER_NAMES: () => gor,
    OFFICIAL_MCP_TOOL_ERROR_CODES: () => xee,
    OFF_PEAK_DEFAULT_GROUP_ID: () => BGi,
    OFF_PEAK_PROVIDER_IDS: () => qYe,
    OFF_PEAK_TERMINAL_STATUSES: () => Hur,
    OFF_PEAK_TICKET_EXPIRED_MARKER: () => Gur,
    OPENROUTER_ATTRIBUTION_HEADERS: () => hpr,
    OPTIONAL_REMOTE_RESOURCE_PACKAGE_IDS: () => F6i,
    PERF_PROCESS_WINDOW_PROPERTY_KEYS: () => wnr,
    PERF_SYSTEM_WINDOW_PROPERTY_KEYS: () => knr,
    PERF_TOOL_EXEC_RESOURCE_PROPERTY_KEYS: () => xnr,
    PLUGIN_STORE_CATEGORY_ORDER: () => TKt,
    PROCESS_RESOURCE_CLI_LANES: () => IWt,
    PROCESS_RESOURCE_EVENT_NAMES: () => tZe,
    PROCESS_RESOURCE_FORBIDDEN_PROPERTY_KEY_PATTERN: () => Tnr,
    PROCESS_RESOURCE_ROLES: () => O6i,
    PUBLIC_STORE_MARKETPLACE_IDS: () => JQn,
    PlatformChannels: () => UHi,
    REMOTE_ASSET_INSTALL_MODES: () => hAe,
    REMOTE_RESOURCE_PACKAGE_DEPENDENCIES: () => Cnr,
    REMOTE_RESOURCE_PACKAGE_IDS: () => Inr,
    REMOTE_RUNTIME_TOOL_RUNTIME: () => _Kn,
    RENDERER_ACTION_TRACE_MAX_BATCH_BYTES: () => v6i,
    RENDERER_ACTION_TRACE_MAX_BATCH_SPANS: () => Ktr,
    RENDERER_ACTION_TRACE_MAX_SAMPLE_RATIO: () => Jtr,
    RENDERER_ACTION_TRACE_SERVICE_NAME: () => Gtr,
    REQUIRED_REMOTE_RESOURCE_PACKAGE_IDS: () => AWt,
    REWARDS_CONTEXT_EVENT: () => TZi,
    REWARDS_PARTITION: () => xZi,
    RUNTIME_TOOL_RUNTIME: () => vCe,
    RUNTIME_ZCODE_DEBUG: () => Wtr,
    SERVER_REMOTE_PROTOCOL_VERSION: () => nur,
    SERVICE_AUTHORITY_MODE_ENV: () => Xlr,
    SESSION_DEBUG_LIMITS: () => Vee,
    SHORTCUT_COMMANDS: () => cWt,
    SKILL_FILE_NAME: () => Xpe,
    SKILL_SCAN_EXCLUDED_DIRECTORY_NAMES: () => bpr,
    SKILL_SYNC_SIZE_LIMIT_ERROR_CODE: () => NJi,
    STORAGE_CATEGORY_IDS: () => JHi,
    STORAGE_MORE_ENTRIES_PATH: () => p_c,
    ServiceChannels: () => BHi,
    TELEMETRY_SAFE_BUILTIN_MODEL_IDS: () => UJt,
    TELEMETRY_TEXT_MAX_LENGTH: () => jJt,
    TEST_BIGMODEL_API_ORIGIN: () => Urr,
    TEST_ZAI_BUSINESS_BASE_URL: () => Wrr,
    TEST_ZAI_OAUTH_CLIENT_ID: () => Hrr,
    TEST_ZAI_OAUTH_ORIGIN: () => $rr,
    TEST_ZCODE_ENDPOINT_ORIGIN: () => LZe,
    TID_APP_HEADER: () => Tzi,
    TID_AUTOMATIONS_LIST: () => sVi,
    TID_AUTOMATIONS_OPEN: () => iVi,
    TID_AUTOMATIONS_PAGE_TAB: () => nHi,
    TID_AUTOMATIONS_STATUS_FILTER: () => aVi,
    TID_AUTOMATION_ACTION_DELETE: () => TVi,
    TID_AUTOMATION_ACTION_TOGGLE: () => xVi,
    TID_AUTOMATION_CARD: () => uVi,
    TID_AUTOMATION_CARD_MENU: () => kVi,
    TID_AUTOMATION_CREATE_MANUALLY: () => lVi,
    TID_AUTOMATION_CREATE_MENU: () => cVi,
    TID_AUTOMATION_CUSTOM_CONFIRM: () => UVi,
    TID_AUTOMATION_CUSTOM_INTERVAL_DECREMENT: () => FVi,
    TID_AUTOMATION_CUSTOM_INTERVAL_INCREMENT: () => LVi,
    TID_AUTOMATION_CUSTOM_INTERVAL_OPTION: () => jVi,
    TID_AUTOMATION_CUSTOM_INTERVAL_SELECT: () => NVi,
    TID_AUTOMATION_CUSTOM_REPEAT_EDIT: () => BVi,
    TID_AUTOMATION_CUSTOM_UNIT_OPTION: () => MVi,
    TID_AUTOMATION_CUSTOM_UNIT_SELECT: () => OVi,
    TID_AUTOMATION_EDIT_BACK: () => PVi,
    TID_AUTOMATION_FORM_PROMPT: () => CVi,
    TID_AUTOMATION_FORM_SUBMIT: () => EVi,
    TID_AUTOMATION_FORM_TITLE: () => IVi,
    TID_AUTOMATION_FREQUENCY_OPTION: () => DVi,
    TID_AUTOMATION_FREQUENCY_SELECT: () => RVi,
    TID_AUTOMATION_RUN_NOW: () => AVi,
    TID_AUTOMATION_SCHEDULE_ADD: () => VVi,
    TID_AUTOMATION_SCHEDULE_DELETE: () => HVi,
    TID_AUTOMATION_SCHEDULE_PREVIEW: () => WVi,
    TID_AUTOMATION_YEAR_DAY_OPTION: () => qVi,
    TID_AUTOMATION_YEAR_MONTHDAY: () => zVi,
    TID_AUTOMATION_YEAR_MONTH_OPTION: () => $Vi,
    TID_BROWSER_ADDRESS_INPUT: () => Vzi,
    TID_BROWSER_BACK_BUTTON: () => Hzi,
    TID_BROWSER_CLOSE_BUTTON: () => Nzi,
    TID_BROWSER_DEVTOOLS_BUTTON: () => m7i,
    TID_BROWSER_ELEMENT_PICKER_BUTTON: () => d7i,
    TID_BROWSER_FORWARD_BUTTON: () => Gzi,
    TID_BROWSER_LOAD_ERROR: () => g7i,
    TID_BROWSER_LOAD_ERROR_CERT_HINT: () => _7i,
    TID_BROWSER_MORE_BUTTON: () => p7i,
    TID_BROWSER_OPEN_EXTERNAL_ITEM: () => f7i,
    TID_BROWSER_PANE: () => Mzi,
    TID_BROWSER_REFRESH_BUTTON: () => Jzi,
    TID_BROWSER_RESPONSIVE_BUTTON: () => Kzi,
    TID_BROWSER_RESPONSIVE_HEIGHT_INPUT: () => Qzi,
    TID_BROWSER_RESPONSIVE_RESIZE_CORNER: () => u7i,
    TID_BROWSER_RESPONSIVE_RESIZE_CORNER_BOTTOM_LEFT: () => l7i,
    TID_BROWSER_RESPONSIVE_RESIZE_CORNER_TOP_LEFT: () => a7i,
    TID_BROWSER_RESPONSIVE_RESIZE_CORNER_TOP_RIGHT: () => c7i,
    TID_BROWSER_RESPONSIVE_RESIZE_HEIGHT: () => s7i,
    TID_BROWSER_RESPONSIVE_RESIZE_LEFT: () => r7i,
    TID_BROWSER_RESPONSIVE_RESIZE_TOP: () => i7i,
    TID_BROWSER_RESPONSIVE_RESIZE_WIDTH: () => o7i,
    TID_BROWSER_RESPONSIVE_SCALED_FRAME: () => n7i,
    TID_BROWSER_RESPONSIVE_TOOLBAR: () => Yzi,
    TID_BROWSER_RESPONSIVE_VIEWPORT: () => Zzi,
    TID_BROWSER_RESPONSIVE_WIDTH_INPUT: () => Xzi,
    TID_BROWSER_RESPONSIVE_ZOOM_OPTION: () => t7i,
    TID_BROWSER_RESPONSIVE_ZOOM_SELECT: () => e7i,
    TID_BROWSER_TOGGLE: () => Dzi,
    TID_BROWSER_WEBVIEW: () => h7i,
    TID_CHAT_ASSISTANT_HISTORY_CONTENT: () => F$i,
    TID_CHAT_ASSISTANT_HISTORY_TRIGGER: () => L$i,
    TID_CHAT_ASSISTANT_MESSAGE: () => N$i,
    TID_CHAT_ATTACHMENT_BUTTON: () => h$i,
    TID_CHAT_ATTACHMENT_MENU_ITEM: () => g$i,
    TID_CHAT_BACKGROUND_RESULT_TITLE: () => j$i,
    TID_CHAT_CHANGE_SUMMARY_TOGGLE_FILES_BUTTON: () => V$i,
    TID_CHAT_COMPACT_MARKER: () => S$i,
    TID_CHAT_COMPACT_RETRY_BUTTON: () => w$i,
    TID_CHAT_CONTEXT_USAGE_TRIGGER: () => xqi,
    TID_CHAT_EMPTY: () => f$i,
    TID_CHAT_ERROR_BANNER: () => u$i,
    TID_CHAT_ERROR_DETAILS_BUTTON: () => d$i,
    TID_CHAT_ERROR_HOOK_ICON: () => p$i,
    TID_CHAT_GOAL_VERIFICATION_MARKER: () => k$i,
    TID_CHAT_INPUT: () => m$i,
    TID_CHAT_LOADING: () => v$i,
    TID_CHAT_MESSAGES: () => l$i,
    TID_CHAT_MESSAGE_EDIT_BUTTON: () => U$i,
    TID_CHAT_MESSAGE_EDIT_CANCEL: () => q$i,
    TID_CHAT_MESSAGE_EDIT_INPUT: () => z$i,
    TID_CHAT_MESSAGE_EDIT_SUBMIT: () => $$i,
    TID_CHAT_MESSAGE_FORK_BUTTON: () => W$i,
    TID_CHAT_MODEL_SELECT_GROUP: () => yqi,
    TID_CHAT_MODEL_SELECT_ITEM: () => vqi,
    TID_CHAT_MODEL_SELECT_TRIGGER: () => _qi,
    TID_CHAT_MODE_SELECT_ITEM: () => kqi,
    TID_CHAT_MODE_SELECT_TRIGGER: () => wqi,
    TID_CHAT_QUEUE_DRAG_HANDLE: () => O$i,
    TID_CHAT_QUEUE_EDIT_BUTTON: () => E$i,
    TID_CHAT_QUEUE_EDIT_CANCEL_BUTTON: () => R$i,
    TID_CHAT_QUEUE_EDIT_INPUT: () => A$i,
    TID_CHAT_QUEUE_EDIT_SAVE_BUTTON: () => P$i,
    TID_CHAT_QUEUE_ITEM: () => T$i,
    TID_CHAT_QUEUE_ITEM_CONTENT: () => I$i,
    TID_CHAT_QUEUE_PANEL: () => x$i,
    TID_CHAT_QUEUE_REMOVE_BUTTON: () => D$i,
    TID_CHAT_QUEUE_SEND_NOW_BUTTON: () => C$i,
    TID_CHAT_REASONING_CONTENT: () => Iqi,
    TID_CHAT_REASONING_TRIGGER: () => Tqi,
    TID_CHAT_SEND_BUTTON: () => _$i,
    TID_CHAT_STOP_BUTTON: () => y$i,
    TID_CHAT_SUMMARY_PANEL: () => b$i,
    TID_CHAT_THOUGHT_LEVEL_SELECT_ITEM: () => Sqi,
    TID_CHAT_THOUGHT_LEVEL_SELECT_TRIGGER: () => bqi,
    TID_CHAT_TOOL_CALL_BLOCK: () => B$i,
    TID_CHAT_USER_MESSAGE: () => M$i,
    TID_CHAT_VIEW: () => c$i,
    TID_CHAT_WORKFLOW_ARTIFACT_CHIP: () => jHi,
    TID_CHAT_WORKFLOW_RUN_DIGEST: () => yHi,
    TID_COMPOSER_PROJECT_DETACH: () => s$i,
    TID_COMPOSER_REMOTE_CONNECTION: () => i$i,
    TID_COMPOSER_WORKSPACE_TRIGGER: () => o$i,
    TID_COMPOSER_WORK_OUTSIDE_PROJECT: () => a$i,
    TID_CONFIRM_DIALOG_CONFIRM: () => YVi,
    TID_CONVERSATION_NEW_TASK: () => n$i,
    TID_CONVERSATION_SECTION: () => e$i,
    TID_CRON_CREATE_CARD: () => GVi,
    TID_CRON_CREATE_OPEN: () => JVi,
    TID_DOCKER_CONTAINER_INPUT: () => $7i,
    TID_DOCKER_CONTAINER_SELECT: () => z7i,
    TID_FEEDBACK_LOGS_OPT_IN: () => tHi,
    TID_GIT_ACTION_TRIGGER: () => jzi,
    TID_GIT_CLOSE_BUTTON: () => Fzi,
    TID_GIT_COMMIT_ACTION_COMMAND: () => qzi,
    TID_GIT_COMMIT_ACTION_ITEM: () => Wzi,
    TID_GIT_COMMIT_DIALOG: () => Bzi,
    TID_GIT_COMMIT_GENERATE_BUTTON: () => zzi,
    TID_GIT_COMMIT_INCLUDE_UNSTAGED: () => $zi,
    TID_GIT_COMMIT_MESSAGE_INPUT: () => Uzi,
    TID_GIT_PANE: () => Lzi,
    TID_GIT_TOGGLE: () => Ozi,
    TID_LOCALE_TOGGLE: () => Izi,
    TID_LOGIN_API_KEY_CANCEL_BUTTON: () => vzi,
    TID_LOGIN_API_KEY_CONTINUE_BUTTON: () => yzi,
    TID_LOGIN_API_KEY_ERROR: () => Szi,
    TID_LOGIN_API_KEY_INPUT: () => _zi,
    TID_LOGIN_API_KEY_PROVIDER_ITEM: () => gzi,
    TID_LOGIN_API_KEY_PROVIDER_TRIGGER: () => hzi,
    TID_LOGIN_API_KEY_SKIP_BUTTON: () => bzi,
    TID_LOGIN_MENU_ITEM: () => fzi,
    TID_LOGIN_TRIGGER: () => pzi,
    TID_LOGIN_USE_API_KEY_BUTTON: () => mzi,
    TID_LOGOUT_BUTTON: () => Ezi,
    TID_MANUAL_CLAIM_PLAN_BANNER: () => QVi,
    TID_MCP_OPEN_AUTHORIZATION_BUTTON: () => G9i,
    TID_MCP_SERVER_ROW: () => V9i,
    TID_MODEL_PROVIDER_ADD_MODEL_BUTTON: () => gqi,
    TID_MODEL_PROVIDER_ADD_PROVIDER_BUTTON: () => Q9i,
    TID_MODEL_PROVIDER_API_FORMAT_ITEM: () => fqi,
    TID_MODEL_PROVIDER_API_FORMAT_TRIGGER: () => pqi,
    TID_MODEL_PROVIDER_API_KEY_INPUT: () => cqi,
    TID_MODEL_PROVIDER_BASE_URL_INPUT: () => dqi,
    TID_MODEL_PROVIDER_CONNECTION_MODE_ITEM: () => aqi,
    TID_MODEL_PROVIDER_CONNECTION_MODE_TRIGGER: () => oqi,
    TID_MODEL_PROVIDER_MODEL_DELETE_BUTTON: () => hqi,
    TID_MODEL_PROVIDER_MODEL_INPUT: () => mqi,
    TID_MODEL_PROVIDER_NAME_EDIT_BUTTON: () => lqi,
    TID_MODEL_PROVIDER_NAME_INPUT: () => uqi,
    TID_MODEL_PROVIDER_NAV_ITEM: () => rqi,
    TID_MODEL_PROVIDER_START_PLAN_COUNT_SHORTCUT: () => iqi,
    TID_MODEL_PROVIDER_START_PLAN_SWITCH_PREFIX: () => sqi,
    TID_MODEL_PROVIDER_TEMPLATE_BACK_BUTTON: () => nqi,
    TID_MODEL_PROVIDER_TEMPLATE_ITEM: () => tqi,
    TID_MODEL_PROVIDER_TEMPLATE_PICKER: () => eqi,
    TID_OAUTH_CANCEL: () => kzi,
    TID_OAUTH_ERROR: () => xzi,
    TID_OAUTH_LOGIN_BUTTON: () => wzi,
    TID_OFFPEAK_ACTION_CONTINUE: () => bVi,
    TID_OFFPEAK_ACTION_DELETE: () => SVi,
    TID_OFFPEAK_ACTION_PAUSE: () => vVi,
    TID_OFFPEAK_CARD: () => pVi,
    TID_OFFPEAK_CARD_MENU: () => mVi,
    TID_OFFPEAK_CARD_SESSION: () => fVi,
    TID_OFFPEAK_CREATE_BUTTON: () => dVi,
    TID_OFFPEAK_CREATE_CARD: () => KVi,
    TID_OFFPEAK_CREATE_OPEN: () => ZVi,
    TID_OFFPEAK_EDIT_SUBMIT: () => gVi,
    TID_OFFPEAK_EDIT_VIEW: () => hVi,
    TID_OFFPEAK_FORM_INSTRUCTIONS: () => yVi,
    TID_OFFPEAK_FORM_TITLE: () => _Vi,
    TID_OFFPEAK_TAB: () => wVi,
    TID_PLUGIN_MCP_SERVER_ROW: () => H9i,
    TID_PLUGIN_STORE_BROWSE: () => oVi,
    TID_PREVIEW_CLOSE_BUTTON: () => v7i,
    TID_PREVIEW_NEXT_BUTTON: () => S7i,
    TID_PREVIEW_PANE: () => y7i,
    TID_PREVIEW_PREV_BUTTON: () => b7i,
    TID_PROJECT_ADD: () => r$i,
    TID_PROJECT_SECTION: () => t$i,
    TID_PROMPT_SUGGESTION_OPTION: () => J$i,
    TID_PROMPT_SUGGESTION_PANEL: () => H$i,
    TID_PROMPT_SUGGESTION_SECTION: () => G$i,
    TID_PROMPT_SUGGESTION_STATUS: () => K$i,
    TID_REMOTE_KIND_DOCKER: () => P7i,
    TID_REMOTE_KIND_SERVER: () => E7i,
    TID_REMOTE_KIND_SSH: () => C7i,
    TID_REMOTE_KIND_WSL: () => A7i,
    TID_RESOURCE_MANAGER_STORAGE_CATEGORY_CLEAN: () => v9i,
    TID_RESOURCE_MANAGER_STORAGE_CATEGORY_ROW: () => _9i,
    TID_RESOURCE_MANAGER_STORAGE_CATEGORY_SIZE: () => y9i,
    TID_RESOURCE_MANAGER_STORAGE_CONFIRM_ACCEPT: () => x9i,
    TID_RESOURCE_MANAGER_STORAGE_CONFIRM_CANCEL: () => T9i,
    TID_RESOURCE_MANAGER_STORAGE_CONFIRM_DIALOG: () => k9i,
    TID_RESOURCE_MANAGER_STORAGE_DETAIL: () => b9i,
    TID_RESOURCE_MANAGER_STORAGE_DETAIL_BACK: () => S9i,
    TID_RESOURCE_MANAGER_STORAGE_DETAIL_ENTRY: () => w9i,
    TID_RESOURCE_MANAGER_STORAGE_DISK_CARD: () => h9i,
    TID_RESOURCE_MANAGER_STORAGE_RESCAN: () => m9i,
    TID_RESOURCE_MANAGER_STORAGE_ROOT: () => g9i,
    TID_RESOURCE_MANAGER_STORAGE_SECTION: () => d9i,
    TID_RESOURCE_MANAGER_STORAGE_STATUS: () => f9i,
    TID_RESOURCE_MANAGER_STORAGE_TOTAL: () => p9i,
    TID_RESOURCE_MANAGER_TAB: () => u9i,
    TID_SERVER_NAME_INPUT: () => W7i,
    TID_SERVER_TOKEN_INPUT: () => V7i,
    TID_SERVER_URL_INPUT: () => q7i,
    TID_SERVER_WORKSPACE_PATH_INPUT: () => H7i,
    TID_SETTINGS_ASK_USER_QUESTION_AUTO_RESOLUTION_SWITCH: () => $9i,
    TID_SETTINGS_BACK_BUTTON: () => r9i,
    TID_SETTINGS_DATA_BASE_DIR_BROWSE: () => a9i,
    TID_SETTINGS_DATA_BASE_DIR_INPUT: () => s9i,
    TID_SETTINGS_DATA_BASE_DIR_SAVE: () => c9i,
    TID_SETTINGS_DATA_BASE_DIR_STATUS: () => l9i,
    TID_SETTINGS_LOCALE_SELECT_ITEM: () => W9i,
    TID_SETTINGS_LOCALE_SELECT_TRIGGER: () => q9i,
    TID_SETTINGS_MEMORY_BACK_MEMORIES: () => M9i,
    TID_SETTINGS_MEMORY_BACK_PROJECTS: () => O9i,
    TID_SETTINGS_MEMORY_COUNT: () => P9i,
    TID_SETTINGS_MEMORY_FILE: () => L9i,
    TID_SETTINGS_MEMORY_FILE_EDITOR_ACTIONS: () => U9i,
    TID_SETTINGS_MEMORY_FILE_ICON: () => F9i,
    TID_SETTINGS_MEMORY_FILE_NAME: () => j9i,
    TID_SETTINGS_MEMORY_FILE_UPDATED_AT: () => B9i,
    TID_SETTINGS_MEMORY_PREVIEW: () => z9i,
    TID_SETTINGS_MEMORY_REFRESH: () => C9i,
    TID_SETTINGS_MEMORY_SCOPE_ICON: () => A9i,
    TID_SETTINGS_MEMORY_SCOPE_TRIGGER: () => E9i,
    TID_SETTINGS_MEMORY_SEARCH_CLEAR: () => D9i,
    TID_SETTINGS_MEMORY_SEARCH_INPUT: () => R9i,
    TID_SETTINGS_MEMORY_SWITCH: () => I9i,
    TID_SETTINGS_MEMORY_WORKSPACE: () => N9i,
    TID_SETTINGS_NATIVE_SEARCH_SWITCH: () => i9i,
    TID_SETTINGS_PAGE: () => n9i,
    TID_SETTINGS_SECTION_NAV: () => o9i,
    TID_SETTINGS_USAGE_TAB: () => Z9i,
    TID_SIDEBAR: () => K7i,
    TID_SIDEBAR_CODING_PLAN_USAGE_BUTTON: () => X9i,
    TID_SIDEBAR_USAGE_REMAINING_TRIGGER: () => Y9i,
    TID_SIDE_PANE_TOGGLE: () => Pzi,
    TID_SSH_AUTH_PASSWORD: () => F7i,
    TID_SSH_AUTH_PRIVATE_KEY: () => j7i,
    TID_SSH_CANCEL_BUTTON: () => J7i,
    TID_SSH_CONFIG_ALIAS_SELECT: () => M7i,
    TID_SSH_CONNECT_BUTTON: () => G7i,
    TID_SSH_CONNECT_TRIGGER: () => T7i,
    TID_SSH_DIALOG: () => I7i,
    TID_SSH_ERROR: () => Fqi,
    TID_SSH_HOST_INPUT: () => R7i,
    TID_SSH_PASSWORD_INPUT: () => N7i,
    TID_SSH_PORT_INPUT: () => D7i,
    TID_SSH_PRIVATE_KEY_INPUT: () => L7i,
    TID_SSH_SUCCESS: () => jqi,
    TID_SSH_USERNAME_INPUT: () => O7i,
    TID_START_PLAN_RECOMMENDATION_DIALOG: () => eHi,
    TID_SUBAGENT_BUILT_IN_MODEL_TRIGGER: () => K9i,
    TID_SUBAGENT_ROW: () => J9i,
    TID_TASK_ARCHIVE: () => e9i,
    TID_TASK_EMPTY: () => Q$i,
    TID_TASK_ITEM: () => X$i,
    TID_TASK_LIST: () => Z$i,
    TID_TASK_NEW_BUTTON: () => Y$i,
    TID_TASK_SETTINGS_BUTTON: () => t9i,
    TID_TERMINAL: () => x7i,
    TID_TERMINAL_CLOSE_BUTTON: () => Rzi,
    TID_TERMINAL_TOGGLE: () => Azi,
    TID_THEME_TOGGLE: () => Czi,
    TID_TOOL_CODE_VIEWER_BUTTON: () => w7i,
    TID_TOOL_SUMMARY_TRIGGER: () => k7i,
    TID_V4_ATTACHMENT: () => eWi,
    TID_V4_ATTACHMENT_UPLOAD_PROGRESS: () => tWi,
    TID_V4_ATTACHMENT_UPLOAD_RETRY: () => nWi,
    TID_V4_AUTODRAIN_TOGGLE: () => IWi,
    TID_V4_BACKGROUND_WORKS: () => OWi,
    TID_V4_BACKGROUND_WORK_CANCEL: () => NWi,
    TID_V4_BACKGROUND_WORK_ITEM: () => MWi,
    TID_V4_COMPOSER: () => Hqi,
    TID_V4_COMPOSER_BACKGROUND_WORK_TRIGGER: () => Jqi,
    TID_V4_COMPOSER_CLEAR_QUEUE_SEND: () => Yqi,
    TID_V4_COMPOSER_CUA_ENTRY: () => Kqi,
    TID_V4_COMPOSER_INPUT: () => Gqi,
    TID_V4_COMPOSER_KEEP_QUEUE_SEND: () => Xqi,
    TID_V4_COMPOSER_SEND: () => Zqi,
    TID_V4_DELETE_SESSION: () => DWi,
    TID_V4_EDIT: () => uWi,
    TID_V4_EDIT_ATTACHMENT_REMOVE: () => mWi,
    TID_V4_EDIT_CANCEL: () => fWi,
    TID_V4_EDIT_INPUT: () => dWi,
    TID_V4_EDIT_REWIND_WORKSPACE: () => hWi,
    TID_V4_EDIT_SUBMIT: () => pWi,
    TID_V4_EDIT_WORKSPACE_CONFLICT_CONVERSATION_ONLY: () => _Wi,
    TID_V4_EDIT_WORKSPACE_CONFLICT_DIALOG: () => gWi,
    TID_V4_FEEDBACK_DISLIKE: () => aWi,
    TID_V4_FEEDBACK_LIKE: () => sWi,
    TID_V4_FOLLOWUP_TOGGLE: () => CWi,
    TID_V4_FORK: () => oWi,
    TID_V4_GOAL_BANNER: () => RWi,
    TID_V4_HOOK_DETAILS_CONTENT: () => lWi,
    TID_V4_HOOK_DETAILS_TRIGGER: () => cWi,
    TID_V4_MODEL_CONFIG: () => LWi,
    TID_V4_PANE_SHELL: () => $Wi,
    TID_V4_PANE_WORKSPACE_BADGE: () => GWi,
    TID_V4_PAUSED_QUEUE_SEND_DIALOG: () => Qqi,
    TID_V4_QUEUE: () => yWi,
    TID_V4_QUEUE_ITEM: () => SWi,
    TID_V4_QUEUE_ITEM_DELETE: () => wWi,
    TID_V4_QUEUE_ITEM_EDIT: () => kWi,
    TID_V4_QUEUE_ITEM_SEND_NOW: () => xWi,
    TID_V4_QUEUE_ITEM_UP: () => TWi,
    TID_V4_QUEUE_PAUSED_BANNER: () => vWi,
    TID_V4_QUEUE_RESUME: () => bWi,
    TID_V4_RENAME_INPUT: () => AWi,
    TID_V4_RENAME_SUBMIT: () => PWi,
    TID_V4_RETRY: () => iWi,
    TID_V4_RETRY_SUBSCRIBE: () => FWi,
    TID_V4_ROW: () => $qi,
    TID_V4_ROW_ATTACHMENTS: () => rVi,
    TID_V4_SESSION_PANE: () => Bqi,
    TID_V4_SESSION_TITLE: () => EWi,
    TID_V4_SPLIT_CLOSE: () => VWi,
    TID_V4_SPLIT_DIVIDER: () => HWi,
    TID_V4_SPLIT_DOWN: () => WWi,
    TID_V4_SPLIT_OPEN: () => qWi,
    TID_V4_STOP: () => rWi,
    TID_V4_SUBAGENT_DRILLDOWN: () => eVi,
    TID_V4_SUBAGENT_OPEN_SIDE_PANE: () => nVi,
    TID_V4_SUBAGENT_OPEN_SPLIT: () => tVi,
    TID_V4_SUBAGENT_TOGGLE: () => QWi,
    TID_V4_TASK_OPEN_IN_SPLIT: () => JWi,
    TID_V4_TIMELINE: () => Uqi,
    TID_V4_TIMELINE_BOTTOM: () => zWi,
    TID_V4_TIMELINE_EMPTY: () => zqi,
    TID_V4_TIMELINE_LOAD_OLDER: () => KWi,
    TID_V4_TURN_NAVIGATOR: () => ZWi,
    TID_V4_TURN_NAVIGATOR_ITEM: () => YWi,
    TID_V4_TURN_NAVIGATOR_TOOLTIP: () => XWi,
    TID_V4_USER_INPUT_DIALOG: () => jWi,
    TID_V4_USER_INPUT_OPTION: () => BWi,
    TID_V4_USER_INPUT_TEXT: () => UWi,
    TID_V4_WORKSPACE_HOOK_PENDING_BANNER: () => qqi,
    TID_V4_WORKSPACE_HOOK_PENDING_DISMISS: () => Vqi,
    TID_V4_WORKSPACE_HOOK_PENDING_REVIEW: () => Wqi,
    TID_WORKFLOWS_CREATE_VIA_CHAT: () => sHi,
    TID_WORKFLOWS_EMPTY: () => oHi,
    TID_WORKFLOWS_LIST: () => rHi,
    TID_WORKFLOWS_REFRESH: () => iHi,
    TID_WORKFLOW_ACTION_DELETE: () => pHi,
    TID_WORKFLOW_ACTION_MOVE: () => vHi,
    TID_WORKFLOW_ARTIFACTS_SECTION: () => OHi,
    TID_WORKFLOW_ARTIFACTS_TOGGLE: () => MHi,
    TID_WORKFLOW_ARTIFACT_CARD: () => NHi,
    TID_WORKFLOW_ARTIFACT_CHIP: () => FHi,
    TID_WORKFLOW_ARTIFACT_PANE: () => LHi,
    TID_WORKFLOW_CARD: () => lHi,
    TID_WORKFLOW_CARD_MENU: () => dHi,
    TID_WORKFLOW_CARD_RUN: () => uHi,
    TID_WORKFLOW_DETAIL: () => kHi,
    TID_WORKFLOW_DETAIL_DESCRIPTION: () => CHi,
    TID_WORKFLOW_DETAIL_MENU: () => THi,
    TID_WORKFLOW_DETAIL_RUN: () => xHi,
    TID_WORKFLOW_DETAIL_SCRIPT: () => AHi,
    TID_WORKFLOW_DETAIL_TAB: () => IHi,
    TID_WORKFLOW_DETAIL_WHEN_TO_USE: () => EHi,
    TID_WORKFLOW_GLOBAL_GROUP: () => cHi,
    TID_WORKFLOW_LAUNCH_ARG: () => mHi,
    TID_WORKFLOW_LAUNCH_DIALOG: () => fHi,
    TID_WORKFLOW_LAUNCH_ERROR: () => _Hi,
    TID_WORKFLOW_LAUNCH_SUBMIT: () => gHi,
    TID_WORKFLOW_LAUNCH_TARGET: () => hHi,
    TID_WORKFLOW_META_DISCARD: () => RHi,
    TID_WORKFLOW_META_SAVE: () => PHi,
    TID_WORKFLOW_MOVE_DIALOG: () => bHi,
    TID_WORKFLOW_MOVE_DIALOG_SUBMIT: () => wHi,
    TID_WORKFLOW_MOVE_DIALOG_TARGET: () => SHi,
    TID_WORKFLOW_PROJECT_GROUP: () => aHi,
    TID_WORKFLOW_RUN_ROW: () => DHi,
    TID_WORKSPACE_CLOSE: () => Q7i,
    TID_WORKSPACE_FILE_TREE_BUTTON: () => Oqi,
    TID_WORKSPACE_FILE_TREE_PANEL: () => Mqi,
    TID_WORKSPACE_FILE_TREE_REFRESH_BUTTON: () => Nqi,
    TID_WORKSPACE_FILE_TREE_ROW: () => Lqi,
    TID_WORKSPACE_HEADER: () => Cqi,
    TID_WORKSPACE_HELP_MENU_RESOURCE_MANAGER: () => Dqi,
    TID_WORKSPACE_HELP_MENU_TRIGGER: () => Rqi,
    TID_WORKSPACE_ITEM: () => X7i,
    TID_WORKSPACE_LIST: () => Y7i,
    TID_WORKSPACE_MORE_BUTTON: () => Pqi,
    TID_WORKSPACE_OPEN_BUTTON: () => Z7i,
    TID_WORKSPACE_PATH: () => Aqi,
    TID_WORKSPACE_TITLE: () => Eqi,
    TID_WSL_DISTRO_SELECT: () => B7i,
    TID_WSL_USER_INPUT: () => U7i,
    VIDEO_INPUT_MAX_BYTES: () => MO,
    WEB_REMOTE_CONTROL_HEARTBEAT_ACK_TIMEOUT_MS: () => _vc,
    WEB_REMOTE_CONTROL_HEARTBEAT_INTERVAL_MS: () => hvc,
    WEB_REMOTE_CONTROL_HEARTBEAT_JITTER_MS: () => gvc,
    WEB_REMOTE_CONTROL_OUTBOUND_PAYLOAD_BUFFER_TIMEOUT_MS: () => pvc,
    WEB_REMOTE_CONTROL_RECONNECT_JITTER_MS: () => yvc,
    WEB_REMOTE_CONTROL_RELAY_AUTH_PROOF_VECTORS: () => VKi,
    WEB_REMOTE_CONTROL_RPC_TRANSPORT_LIMITS: () => ZI,
    WEB_REMOTE_CONTROL_V4_MIN_APP_VERSION: () => Jrr,
    WEB_REMOTE_CONTROL_WORKSPACE_RECONNECT_TIMEOUT_MS: () => dvc,
    WORKFLOW_REFINE_PERMISSION_OPTION_ID: () => wAe,
    WSL_USER_MAX_LENGTH: () => MZe,
    WebRemoteControlCloseCodes: () => qee,
    WebRemoteControlRpcTransportAssembler: () => AGt,
    WebRemoteControlRpcTransportEncodingError: () => MR,
    ZAI_PROVIDER_ID: () => RJt,
    ZCODE_ACTIVE_STREAMING_TOOL_INPUT_EAGER_DELTA_COUNT: () => tvc,
    ZCODE_ACTIVE_STREAMING_TOOL_INPUT_PREVIEW_MIN_INTERVAL_MS: () => nvc,
    ZCODE_ACTIVE_STREAMING_TOOL_INPUT_PREVIEW_MIN_RAW_GROWTH: () => rvc,
    ZCODE_ACTIVE_STREAMING_TOOL_INPUT_TIME_BUDGET_MAX_RAW_INPUT: () => ovc,
    ZCODE_AGENT_CA_CERT_ENV_KEY: () => hCe,
    ZCODE_AGENT_LIFECYCLE_LOG_MARKER: () => dFi,
    ZCODE_AGENT_PROVIDER: () => Arr,
    ZCODE_AGENT_PROVIDER_LABEL: () => xVt,
    ZCODE_AGENT_PROVIDER_NOT_READY_CODE: () => CJi,
    ZCODE_AGENT_PROVIDER_NOT_READY_REASON: () => EJi,
    ZCODE_AGENT_RUNTIME: () => $lr,
    ZCODE_APP_VERSION_ENV: () => hpe,
    ZCODE_ARMS_RUM_ENDPOINT: () => Vtr,
    ZCODE_BUILD_COMMIT_ID_ENV: () => qtr,
    ZCODE_BUILD_TIME: () => Otr,
    ZCODE_CLI_RESOURCE_SAMPLE_INTERVAL_MS: () => bnr,
    ZCODE_COMMAND_AGENT_SOURCE: () => TVt,
    ZCODE_COMMAND_AGENT_SOURCES: () => Qji,
    ZCODE_COMMIT: () => Dtr,
    ZCODE_CUA_BROKER_SOCKET_ENV_KEY: () => kR,
    ZCODE_CUA_DEV_MODE_ENV_KEY: () => iKn,
    ZCODE_CUA_NODE_REPL_HOST_ENV_KEY: () => ade,
    ZCODE_CUA_OFFICIAL_MCP_NAMESPACE_NAME: () => Cj,
    ZCODE_CUA_OFFICIAL_PLUGIN_ID: () => s1,
    ZCODE_CUA_PLUGIN_AUTHORITY_ENV_KEY: () => lde,
    ZCODE_CUA_PRODUCT_HELPER_ENV_KEY: () => oKn,
    ZCODE_DESKTOP_CONTEXT_PROMPT_ENABLED_ENV: () => J2i,
    ZCODE_DYNAMIC_WORKFLOW_MODE_ENV: () => Vlr,
    ZCODE_ENABLED_AGENT_PROVIDERS: () => Epe,
    ZCODE_ENV: () => mpe,
    ZCODE_FILE_LOCK_TIMEOUT_ERROR_CODE: () => Xde,
    ZCODE_FILE_STREAMING_TOOL_INPUT_PREVIEW_MIN_INTERVAL_MS: () => iKt,
    ZCODE_HTTP_PROXY_ENV_KEY: () => sde,
    ZCODE_JWT_INVALID_BROADCAST_CHANNEL: () => QHi,
    ZCODE_KNOWN_TOOL_NAMES: () => Bdr,
    ZCODE_MCP_RESOURCE_SAMPLE_INTERVAL_MS: () => ZZe,
    ZCODE_MODEL_REASONING_SEPARATOR: () => LEe,
    ZCODE_NO_PROXY_ENV_KEY: () => mCe,
    ZCODE_OFFICIAL_MCP_AUTH_PROVIDER_JWT_TOKEN: () => B3i,
    ZCODE_OFFICIAL_MCP_AUTH_TYPE: () => LVt,
    ZCODE_OFFICIAL_PLUGIN_MARKETPLACE_ID: () => uz,
    ZCODE_PLUGIN_ID_ENV_KEY: () => xR,
    ZCODE_PROCESS_DIAGNOSTIC_MAX_LINE_CHARS: () => OQn,
    ZCODE_PROCESS_DIAGNOSTIC_MESSAGE_MAX_CHARS: () => $Je,
    ZCODE_PROCESS_DIAGNOSTIC_NAME_MAX_CHARS: () => zJe,
    ZCODE_PROCESS_DIAGNOSTIC_PREFIX: () => EEe,
    ZCODE_PROCESS_DIAGNOSTIC_STACK_MAX_CHARS: () => qJe,
    ZCODE_PRODUCT_FLAVOR: () => $tr,
    ZCODE_PROTOCOL_NAME: () => HZe,
    ZCODE_PROTOCOL_V4_WIRE_VERSION: () => V3i,
    ZCODE_PROTOCOL_VERSION: () => GZe,
    ZCODE_REMOTE_HTTP_PROXY_ENV_KEY: () => YBt,
    ZCODE_REMOTE_NO_PROXY_ENV_KEY: () => XBt,
    ZCODE_REMOTE_RUNTIME_NETWORK_AUTHORITY_ENV_KEY: () => ZBt,
    ZCODE_RPC_CLIENT_MODE_HEADER: () => WHi,
    ZCODE_RPC_HOST_CAPABILITY_HEADER: () => VHi,
    ZCODE_RUNTIME_ENV_KEY: () => nz,
    ZCODE_SESSION_RUNTIME_PREFERENCES_REQUEST_TIMEOUT_MS: () => bHt,
    ZCODE_SOURCE_HEADERS: () => Llr,
    ZCODE_TOOL_ENV_PASSTHROUGH_ENV_KEY: () => IQ,
    ZCODE_VERSION: () => LL,
    ZCODE_WORKFLOWS_RUNS_MAX_LIMIT: () => oYe,
    ZCODE_WORKSPACE_IDENTITY_ENV: () => zVt,
    accountProviderUnavailableReasonSchema: () => SVt,
    agentLaneResourceSampleSchema: () => Nar,
    appRuntimePreferencesChangedBroadcastPayloadSchema: () => jJi,
    appSettingsOccupationEnum: () => Qrr,
    appSettingsPatchSchema: () => dor,
    appSettingsSchema: () => uor,
    appUsageDailyModelItemSchema: () => Trr,
    appUsageDailyModelUsageSchema: () => Irr,
    appUsageFavoriteModelSchema: () => brr,
    appUsageHeatmapCellSchema: () => wrr,
    appUsageHeatmapSchema: () => xrr,
    appUsageHeatmapWeekSchema: () => krr,
    appUsageModelUsageSchema: () => Crr,
    appUsageSnapshotSchema: () => PZe,
    appUsageSummarySchema: () => Srr,
    appUsageToolUsageSchema: () => Err,
    appendAssistantMessagePart: () => YJi,
    appendZCodeStreamingToolInputDelta: () => yKi,
    armsCustomEventPayloadSchema: () => o5i,
    attachZCodeBackgroundTaskNotificationToRaw: () => rJi,
    automationSessionCreateTelemetrySchema: () => yWt,
    backgroundBashOutputResultSchema: () => MWt,
    backgroundBashOutputSchema: () => Onr,
    bashOutputDisplaySchema: () => vee,
    botAllowedCommandsSchema: () => IVt,
    botCommandPolicySchema: () => c3i,
    botConfigSchema: () => Nrr,
    botCurrentOptionsSchema: () => Orr,
    botDraftOptionsSchema: () => Mrr,
    botProviders: () => Prr,
    botsConfigFileSchema: () => p3i,
    botsStateFileSchema: () => f3i,
    broadcastMessageSchema: () => Vsr,
    browserBackendDescriptorSchema: () => XKe,
    browserBackendListResultSchema: () => wWt,
    browserBackendTypeSchema: () => YKe,
    browserCapabilityDescriptorSchema: () => SWt,
    browserClientModeSchema: () => pV,
    browserCommandContextSchema: () => inr,
    browserCommandMethodSchema: () => onr,
    browserCommandResultSchema: () => yee,
    browserCommandSchema: () => gee,
    browserDialogSchema: () => hnr,
    browserDiscoveryContextSchema: () => dnr,
    browserElementRectSchema: () => pnr,
    browserErrorCodeSchema: () => JKe,
    browserKeyModifierSchema: () => hee,
    browserMouseButtonSchema: () => ZKe,
    browserPageStateSchema: () => KKe,
    browserPlaywrightActionSchema: () => unr,
    browserPlaywrightLocatorOperationSchema: () => cnr,
    browserPlaywrightModifierSchema: () => lnr,
    browserPointSchema: () => dAe,
    browserRecordingActionSchema: () => snr,
    browserRecordingArtifactSchema: () => _nr,
    browserRecordingJobSchema: () => ynr,
    browserRecordingOptionsSchema: () => anr,
    browserResponseMetaSchema: () => gnr,
    browserSessionContextKindSchema: () => pAe,
    browserSessionContextSchema: () => R6i,
    browserSnapshotDomNodeSchema: () => fnr,
    browserSnapshotElementSchema: () => QKe,
    browserSnapshotSchema: () => kWt,
    browserTabSummarySchema: () => TWt,
    browserUserTabInfoSchema: () => mnr,
    browserViewportInputSchema: () => cAe,
    browserViewportSizeSchema: () => GKe,
    browserViewportZoomSchema: () => nnr,
    buildBigModelApiUrl: () => Rpe,
    buildBigModelCodingPlanPersonalManageUrl: () => k3i,
    buildBigModelCodingPlanTeamManageUrl: () => AVt,
    buildConversationPreviewArtifactCandidates: () => qUi,
    buildConversationPreviewArtifactCandidatesFromReferences: () => Plr,
    buildCustomSupplierKey: () => ydr,
    buildGhostSupplierIdentity: () => vdr,
    buildGhostSupplierKey: () => OJi,
    buildHelpAppConfigUrl: () => mGi,
    buildLocalMediaPreviewUrl: () => Tur,
    buildNativeSupplierKey: () => _dr,
    buildRemoteEnvironmentKey: () => Ltr,
    buildRemoteWorkspaceConnectResultTelemetry: () => CGi,
    buildRemoteWorkspaceIdentity: () => F5i,
    buildRewardsUrl: () => qpr,
    buildRuntimeZCodeApiUrl: () => MAe,
    buildRuntimeZCodeEndpointUrls: () => S3i,
    buildRuntimeZaiBusinessUrl: () => T3i,
    buildRuntimeZaiOAuthUrl: () => x3i,
    buildServerRemoteWorkspaceIdentity: () => rlr,
    buildSshRemoteHostKey: () => qKe,
    buildWebRemoteControlBridgeResultTelemetry: () => RGi,
    buildWebRemoteControlEntryViewTelemetry: () => EGi,
    buildWebRemoteControlExternalQrUrl: () => JKi,
    buildWebRemoteControlPairResultTelemetry: () => PGi,
    buildWebRemoteControlStartResultTelemetry: () => AGi,
    buildZCodeAssistantPresentation: () => rKi,
    buildZCodeEndpointUrls: () => Pee,
    buildZCodeSourceHeadersFromContext: () => IJt,
    buildZCodeStreamingToolInputPreview: () => vKi,
    buildZCodeToolEnvPassthroughEnv: () => THe,
    buildZaiOAuthUrl: () => Yrr,
    bytesToKb: () => oee,
    calculateOutputTps: () => OKt,
    calibrateLocalTtftClock: () => q3i,
    canRetryDatabaseStartup: () => C6i,
    checkProcessResourceEventProperties: () => L6i,
    classifyDatabaseStartupError: () => oAe,
    classifyRemoteUsageError: () => OGi,
    clientConfigReadOptionsSchema: () => fZi,
    cloudContentPayloadSchema: () => Rtr,
    coalesceConsecutiveZCodeAssistants: () => QJi,
    collectTelemetryRendererContext: () => Rur,
    collectVisibleZCodeBackgroundBashJobs: () => cJi,
    collectVisibleZCodeBackgroundTaskControlItems: () => VJt,
    collectZCodeBackgroundTaskNotificationsByToolUseId: () => nJi,
    compareDocumentPluginPriority: () => Rpr,
    compareSemverVersions: () => rpr,
    computeLineChangeStat: () => zJi,
    contentBundleSchema: () => rWt,
    conversationArtifactTypeSchema: () => Tee,
    conversationShareAccessModeSchema: () => Bee,
    conversationShareArtifactDescriptorSchema: () => fUi,
    conversationShareArtifactUploadDataSchema: () => bUi,
    conversationShareCapabilitiesDataSchema: () => gUi,
    conversationShareCapabilitiesWireSchema: () => hUi,
    conversationShareConfirmDataSchema: () => Slr,
    conversationShareConfirmRequestSchema: () => wUi,
    conversationShareContinuationArtifactSchema: () => Tlr,
    conversationShareContinuationDataSchema: () => TUi,
    conversationShareContinuationRequestSchema: () => xUi,
    conversationShareErrorEnvelopeSchema: () => CUi,
    conversationShareInboundArtifactDescriptorSchema: () => SJt,
    conversationShareIntegritySchema: () => wJt,
    conversationShareKnownErrorCodeSchema: () => IUi,
    conversationSharePreparationDataSchema: () => vUi,
    conversationSharePreparationRequestSchema: () => yUi,
    conversationSharePreviewArtifactSchema: () => xlr,
    conversationSharePreviewDataSchema: () => kUi,
    conversationShareSha256Schema: () => Jpe,
    convertToZCodeAgentMcpServer: () => hDi,
    createAgentStateId: () => nqt,
    createConversationShareSuccessEnvelopeSchema: () => EUi,
    createDynamicWorkflowClientConfig: () => OYe,
    createHelpAppConfigReader: () => gGi,
    createInputId: () => LGi,
    createMemoryDiagnosticsRegistry: () => HFi,
    createMemorySampleWriteGate: () => lqt,
    createOfficialMcpTrustedOriginRegistry: () => qVt,
    createOpenInEditorRemoteTarget: () => Cur,
    createPluginAgentStateId: () => tqt,
    createQueryId: () => FGi,
    createRewardsInjectionScript: () => EZi,
    createSessionTraceId: () => NGi,
    createUuid: () => xV,
    createWebRemoteControlConnectionRecoveryTimeoutFailure: () => WKi,
    createZCodeToolProjectionMemory: () => KUi,
    credentialKeySchema: () => Y8i,
    credentialRecordSchema: () => Z8i,
    credentialValueSchema: () => X8i,
    databaseMigrationFactsSchema: () => nAe,
    databaseMigrationIdSchema: () => iAe,
    databaseStartupControlSchema: () => _Wt,
    databaseStartupErrorCodeSchema: () => rAe,
    databaseStartupErrorDetails: () => gpe,
    databaseStartupErrorDetailsSchema: () => VKe,
    databaseStartupPhaseSchema: () => hWt,
    databaseStartupPortPayloadSchema: () => I6i,
    databaseStartupStateSchema: () => gWt,
    decodeConversationShareRows: () => pUi,
    decodeCustomModelValue: () => dz,
    decodeMarkdownArtifactImageSource: () => azi,
    deriveZCodeTaskStatusFromSessionSnapshot: () => JUi,
    desktopMenuMessageIds: () => tGi,
    desktopMenuMessages: () => OJt,
    dockerConnectOptionsSchema: () => $sr,
    embeddedBrowserViewportPreferenceSchema: () => lAe,
    encodeCustomModelValue: () => Y9t,
    encodeWebRemoteControlRpcTransportMessage: () => D8i,
    ensureZCodeToolProjectionMemory: () => ZUi,
    executionPermissionModeSchema: () => SKt,
    executionStateSchema: () => wKt,
    extractConversationPreviewFileReferences: () => Alr,
    extractMarkdownArtifactImageRefs: () => PJt,
    extractPlanStepsFromToolInput: () => lKt,
    extractPlanStepsFromToolOutput: () => uKt,
    finalizeZCodeToolProjectionInput: () => XUi,
    findOfficialMcpReservedHeaders: () => UZe,
    forgetZCodeToolProjectionMetadata: () => QUi,
    formatCanonicalPluginName: () => Blr,
    formatDesktopMenuMessage: () => nGi,
    formatLogPrefix: () => idr,
    formatMemorySampleLine: () => VFi,
    formatModelPickerValue: () => sV,
    formatSubagentMarkdownModel: () => XQn,
    formatTimestamp: () => ZJt,
    formatZCodeAgentProcessName: () => KJi,
    formatZCodeGpuProcessName: () => HJi,
    formatZCodeHostProcessName: () => GJi,
    formatZCodeMainProcessName: () => VJi,
    formatZCodeRendererProcessName: () => JJi,
    formatZCodeUtilityProcessName: () => ZJi,
    formatZodError: () => W8i,
    generateTraceId: () => MGi,
    getCapturedZCodeAgentTelemetryEnv: () => QBt,
    getCapturedZCodeCuaBrokerCredentials: () => qW,
    getCommunityUrlFromConfig: () => dGi,
    getCommunityUrlFromConfigs: () => jYe,
    getCommunityUrlsFromConfig: () => LYe,
    getCompactToolCallStatusMessageId: () => dKi,
    getCompactToolCallSummary: () => pKi,
    getConversationMessageProjectionPolicy: () => Ux,
    getConversationModelOnlyTurnTriggerSource: () => CYe,
    getConversationPreviewFileType: () => DYe,
    getDefaultShortcutBindings: () => jtr,
    getDesktopMenuMessage: () => dur,
    getFeedbackApiBaseFromConfig: () => lGi,
    getFeedbackUrlFromConfig: () => FYe,
    getFeedbackUseExternalFormFromConfig: () => uGi,
    getForceUpdateMinimalVersionFromConfig: () => pGi,
    getLatestAssistantContentPart: () => tXe,
    getLatestAssistantContentText: () => XJi,
    getMcpServerRequestHeaders: () => IKn,
    getMediaPreviewFormat: () => AUi,
    getModelProviderFamilySpec: () => adr,
    getPermissionRequestPreview: () => qKi,
    getRemoteResourcePackageDependencies: () => Enr,
    getRemoteRuntimeToolsForPlatform: () => nDi,
    getRuntimeToolRuntime: () => PQ,
    getSupportedBotReplyGranularities: () => Frr,
    getWebRemoteControlHeartbeatDelayMs: () => QKi,
    getWebRemoteControlHeartbeatJitterMs: () => Xdr,
    getWebRemoteControlReconnectJitterMs: () => eZi,
    getZCodeAgentAvailableModes: () => _Ji,
    getZCodeAgentModeSelectOptions: () => YYe,
    getZCodeAgentRuntime: () => rzi,
    getZCodeBackgroundBashJobElapsedMs: () => aJi,
    getZCodeBackgroundTaskControlItemElapsedMs: () => JYe,
    getZCodeGoalActiveIterationCount: () => vJt,
    getZCodeGoalIterationByAssistantMessageId: () => oUi,
    getZCodeToolFamilyForName: () => Udr,
    getZCodeUserVisibleMessages: () => yJt,
    groupStorageRootsByVolume: () => KHi,
    helloAckMessageSchema: () => e5i,
    helloMessageSchema: () => Q8i,
    hookExecutionProjectionSchema: () => oVt,
    hookInvocationRowSchema: () => iVt,
    hostAgentProcessErrorResponseSchema: () => Dar,
    hostAgentProcessExceptionResponseSchema: () => Oar,
    hostAgentProcessExitedResponseSchema: () => Rar,
    hostAgentProcessReadyResponseSchema: () => Par,
    hostAgentProcessSpawnedResponseSchema: () => Aar,
    hostAgentResourceSampleResponseSchema: () => Far,
    hostAgentRunningTaskCountChangedResponseSchema: () => War,
    hostAttachServicePortMessageSchema: () => ear,
    hostBindRemoteWorkspaceContextMessageSchema: () => Xsr,
    hostBotRemoteWorkspaceConnectionStatusRequestResponseSchema: () => rcr,
    hostBotRemoteWorkspaceConnectionStatusResultMessageSchema: () => lar,
    hostBotRemoteWorkspaceReconnectRequestResponseSchema: () => ncr,
    hostBotRemoteWorkspaceReconnectResultMessageSchema: () => car,
    hostBotRemoteWorkspaceRuntimePortMessageSchema: () => uar,
    hostBotRemoteWorkspaceRuntimePortRequestResponseSchema: () => ocr,
    hostBroadcastClaimCommitResponseSchema: () => Jar,
    hostBroadcastClaimReleaseResponseSchema: () => Kar,
    hostBroadcastClaimRequestResponseSchema: () => Gar,
    hostBroadcastClaimResultMessageSchema: () => rar,
    hostBroadcastEnvelopeSchema: () => GGt,
    hostBrowserExecuteRequestResponseSchema: () => fcr,
    hostBrowserExecuteResultMessageSchema: () => _ar,
    hostCancelRemoteWorkspaceConnectMessageSchema: () => Ysr,
    hostConnectRemoteWorkspaceMessageSchema: () => Zsr,
    hostCronRunMessageSchema: () => har,
    hostCronRunResultResponseSchema: () => lcr,
    hostCronSchedulerWakeRequestResponseSchema: () => dcr,
    hostCuaOperationStateResponseSchema: () => Har,
    hostCuaPipFocusChangedMessageSchema: () => bar,
    hostDetachServicePortMessageSchema: () => tar,
    hostDisposeMessageSchema: () => nar,
    hostDisposeRemoteWorkspaceSessionMessageSchema: () => Qsr,
    hostFeedbackLogArchiveRequestResponseSchema: () => ccr,
    hostFeedbackLogArchiveResultMessageSchema: () => mar,
    hostIncomingMessageSchema: () => s5i,
    hostInitLocalMessageSchema: () => Gsr,
    hostLocalMediaPreviewPathAuthorizeRequestResponseSchema: () => mcr,
    hostLocalMediaPreviewPathAuthorizeResultMessageSchema: () => yar,
    hostLogResponseSchema: () => Car,
    hostMcpResourceSamplesResponseSchema: () => Uar,
    hostMcpTelemetryResponseSchema: () => $ar,
    hostNetworkTelemetryBatchResponseSchema: () => gcr,
    hostOffPeakRunMessageSchema: () => gar,
    hostOffPeakRunResultResponseSchema: () => ucr,
    hostOffPeakSchedulerWakeRequestResponseSchema: () => pcr,
    hostProviderProvisioningExecuteMessageSchema: () => Sar,
    hostProviderProvisioningExecutionResultResponseSchema: () => ycr,
    hostProviderProvisioningSourceChangedResponseSchema: () => _cr,
    hostRemoteWorkspaceClosedResponseSchema: () => Iar,
    hostRemoteWorkspaceConnectFailedResponseSchema: () => Tar,
    hostRemoteWorkspaceConnectedResponseSchema: () => kar,
    hostRemoteWorkspaceConnectionLogResponseSchema: () => xar,
    hostResourceSampleResponseSchema: () => Bar,
    hostResourceUsageProcessSchema: () => vcr,
    hostResourceUsageSnapshotRequestMessageSchema: () => war,
    hostResourceUsageSnapshotResultResponseSchema: () => bcr,
    hostResponseMessageSchema: () => c5i,
    hostSessionCreateTelemetryResponseSchema: () => qar,
    hostSessionMessageDeliverMessageSchema: () => par,
    hostSessionMessageDeliverResultResponseSchema: () => acr,
    hostSessionMessageDeliveryResultMessageSchema: () => far,
    hostSessionMessageSendRequestedResponseSchema: () => icr,
    hostSessionRouteAnnounceResponseSchema: () => scr,
    hostTaskOwnerCommandDeliverMessageSchema: () => sar,
    hostTaskOwnerCommandRequestResponseSchema: () => ecr,
    hostTaskOwnerCommandResultMessageSchema: () => aar,
    hostTaskOwnerCommandResultResponseSchema: () => tcr,
    hostTaskRealtimeDeliverMessageSchema: () => oar,
    hostTaskRealtimePublishResponseSchema: () => Zar,
    hostTaskRunLeaseAcquireResponseSchema: () => Xar,
    hostTaskRunLeaseReleaseResponseSchema: () => Qar,
    hostTaskRunLeaseResultMessageSchema: () => iar,
    hostTaskStreamOpPublishResponseSchema: () => Yar,
    hostToolExecResourceResponseSchema: () => zar,
    hostWorkspaceRunningTaskCountChangedResponseSchema: () => Var,
    installRewardsPageBridge: () => CZi,
    isActiveRemoteResourcePackage: () => $6i,
    isActiveZCodeBackgroundBashJob: () => sJi,
    isActiveZCodeBackgroundTaskControlItem: () => GYe,
    isAutomationCreateLimitError: () => $Gi,
    isBigModelStartPlanProviderId: () => RFi,
    isBuiltinModelProviderId: () => QQ,
    isCodingPlanModelProviderId: () => OFi,
    isCompactToolCallFinishedState: () => uKi,
    isCompactToolCallRunningState: () => lKi,
    isConversationHiddenSyntheticMessage: () => Z5i,
    isConversationProviderContextOnlyMessage: () => J5i,
    isConversationRealUserTurnStarter: () => jee,
    isConversationShareSchemaVersionSupported: () => dUi,
    isConversationTimelineOnlyMessage: () => K5i,
    isCredentialDecryptError: () => ZHi,
    isCronTask: () => UGi,
    isCuaDevModeRequested: () => sKn,
    isDataBaseDirForbiddenWindowsInstallDirError: () => LJi,
    isDynamicWorkflowModeEnabled: () => Glr,
    isFeishuBotProvider: () => Rrr,
    isIndividualCodingPlanModelProviderId: () => DFi,
    isKnownRemoteResourcePackageId: () => gAe,
    isMainAgentToolProjectionSource: () => cKt,
    isNonRetryableWorkspacePrepareError: () => wFi,
    isOffPeakTask: () => zGi,
    isOffPeakTerminalStatus: () => qGi,
    isOffPeakTicketExpiredError: () => VGi,
    isOfficialMcpOriginTrusted: () => vor,
    isOfficialMcpReservedHeaderName: () => jVt,
    isOpenCodeRuntimeCrashError: () => kFi,
    isOpenRouterBaseUrl: () => gpr,
    isPluginCommand: () => UJi,
    isProviderProvisioningAccountCredentialKey: () => H6i,
    isPublicStoreMarketplaceId: () => PFi,
    isRemoteResourcePackageSelectedAsDependency: () => W6i,
    isRemoteWorkspaceIdentity: () => sJt,
    isRequiredRemoteResourcePackage: () => q6i,
    isServiceAuthorityMode: () => eur,
    isStartPlanModelProviderId: () => X9t,
    isTodoPlanToolName: () => aKt,
    isTrustedCodingPlanWebviewOrigin: () => b3i,
    isTrustedRewardsUrl: () => $pr,
    isUserCommand: () => BJi,
    isValidShortcutBinding: () => Utr,
    isValidWslUser: () => CVt,
    isWebRemoteControlThemeSeed: () => Kdr,
    isZCodeAgentProvider: () => r3i,
    isZCodeCompactSummaryMessage: () => glr,
    isZCodeCuaInternalFeatureEnabled: () => cde,
    isZCodeCuaMcpCommand: () => s8t,
    isZCodeCuaMcpPackageArg: () => a8t,
    isZCodeFileContentWriteToolName: () => gKi,
    isZCodeFileLockTimeoutError: () => V9t,
    isZCodeFileStreamingToolInputPreviewTool: () => nXe,
    isZCodeGoalContinuationReminderMessage: () => gJt,
    isZCodeGoalContinuationReminderText: () => hJt,
    isZCodeGoalModelOnlyReminderMessage: () => mlr,
    isZCodeGoalStateReminderText: () => _Jt,
    isZCodeModelOnlySyntheticUserMessage: () => hlr,
    isZCodeModelRetryRecoveryProgressPayload: () => lJt,
    isZCodeToolFamily: () => hKi,
    isZaiCodingPlanProviderId: () => ZQn,
    localTtftBatchSchema: () => W3i,
    localTtftClockSchema: () => GVt,
    localTtftContextSchema: () => zZe,
    localTtftDetailSchema: () => VVt,
    localTtftFactsSchema: () => gV,
    localTtftIntervalSchema: () => xor,
    localTtftNow: () => Uj,
    localTtftOutputKindSchema: () => JVt,
    localTtftRecordSchema: () => Tor,
    localeSchema: () => Ope,
    localizeConversationShareUrl: () => uUi,
    mapZCodeEnvToArmsRumEnv: () => Htr,
    markZCodeStreamingToolInputPreviewMaterialized: () => SKi,
    marketingActionSchema: () => Fpr,
    marketingAssetSchema: () => Wee,
    marketingDeliverySchema: () => Upr,
    marketingNavigationSchema: () => Lpr,
    marketingPopupSchema: () => AKt,
    marketingVisualSchema: () => EKt,
    matchesWebRemoteControlRoutePath: () => GKi,
    mcpServerFailureKindSchema: () => zor,
    measureWebRemoteControlRpcRelayEnvelopeBytes: () => fYe,
    memoryUsageToSampleFields: () => uqt,
    mergeZCodeBackgroundTaskControlItems: () => HGi,
    migrateLegacyModelProviderId: () => pz,
    migrateLegacyOfficialGlmModelId: () => eee,
    modelSelectionSchema: () => Pu,
    narrowConversationShareCapabilities: () => _Ui,
    networkObservationSchema: () => hcr,
    nodeReplBrowserBrokerRequestSchema: () => bKt,
    nodeReplBrowserBrokerResponseSchema: () => dZi,
    nodeSelfResourceSampleSchema: () => jar,
    nonEmptyStringSchema: () => Ur,
    normalizeAgentProviderToZCodeAgent: () => e3i,
    normalizeAgentProvidersToZCodeAgent: () => t3i,
    normalizeAvailableZCodeMode: () => ZYe,
    normalizeBotReplyGranularity: () => h3i,
    normalizeCommandAgentSourceToZCodeAgent: () => n3i,
    normalizeDynamicWorkflowMode: () => EJt,
    normalizeOfficialGlmModelId: () => eqt,
    normalizeProviderFamilyDomain: () => ldr,
    normalizeRemoteAssetInstallMode: () => D6i,
    normalizeRemoteResourcePackageSelection: () => z6i,
    normalizeShortcutKey: () => WKe,
    normalizeSupplierBaseUrl: () => DJi,
    normalizeUnknownError: () => HJe,
    normalizeZCodeApiRetryStatus: () => olr,
    normalizeZCodeEndpointOrigin: () => RR,
    normalizeZCodeEnv: () => dWt,
    normalizeZCodeProductFlavor: () => pWt,
    normalizeZCodeRuntimeEnv: () => $W,
    normalizeZCodeSourceHeaderValue: () => WL,
    normalizeZCodeToolName: () => oKt,
    onboardingInterfaceModeSchema: () => vur,
    onboardingOccupationSchema: () => yur,
    onboardingRecordEntrySchema: () => bur,
    onboardingRecordFileSchema: () => _Gi,
    parseAutomationRunId: () => qJt,
    parseClientConfigSnapshot: () => hZi,
    parseConversationSharePathname: () => ylr,
    parseLaunchMarks: () => Bur,
    parseMarketingTouchResponse: () => kZi,
    parseModelPickerValue: () => fz,
    parseOfficialMcpToolError: () => JWt,
    parsePluginStoreOrder: () => kKt,
    parsePluginSubagentModelSelectionOverrides: () => FEe,
    parseRemoteWorkspaceIdentity: () => lA,
    parseServiceAuthorityMode: () => czi,
    parseShortcutBinding: () => lWt,
    parseSubagentMarkdownSelection: () => tee,
    parseWebRemoteControlAppPayload: () => K8i,
    parseWebRemoteControlExternalQrParams: () => KKi,
    parseWebRemoteControlRpcRelayEnvelopeJson: () => A8i,
    parseWebRemoteControlRpcTransportPayload: () => E8i,
    parseZCodeBackgroundBashJobs: () => iJi,
    parseZCodeBackgroundTaskControlItems: () => WJt,
    parseZCodeBackgroundTaskNotificationText: () => KYe,
    parseZCodeProcessDiagnostic: () => pFi,
    postUpdateReleaseNotesPayloadSchema: () => jZe,
    processResourceCliLaneSchema: () => Mar,
    providerFamilyConnectionSelectionSchema: () => DWt,
    providerFamilyConnectionSelectionSettingsSchema: () => ype,
    providerProvisioningAccountSettingsSchema: () => Rnr,
    providerProvisioningCredentialEntrySchema: () => Dnr,
    providerProvisioningCredentialScopeSchema: () => Anr,
    providerProvisioningEnvelopeSchema: () => G6i,
    providerProvisioningPersonalConfigSchema: () => Pnr,
    providerProvisioningResultSchema: () => J6i,
    providerProvisioningTriggerSchema: () => iZe,
    readZCodeAgentTelemetryEnv: () => uKn,
    readZCodeToolEnvPassthroughEnv: () => EQ,
    redactFeedbackText: () => Ypr,
    redactTelemetryText: () => Our,
    redactTelemetryUrl: () => BJt,
    remoteAssetDirsSchema: () => Hsr,
    remoteTargetSchema: () => Vpe,
    rendererActionTraceAttributesSchema: () => Ztr,
    rendererActionTraceBatchSchema: () => T6i,
    rendererActionTraceConfigSchema: () => b6i,
    rendererActionTraceGroupSchema: () => mWt,
    rendererActionTraceResourceSchema: () => Xtr,
    rendererActionTraceSpanSchema: () => Ytr,
    rendererHeapSampleSchema: () => a5i,
    rendererLogPayloadSchema: () => t5i,
    rendererTelemetryEventPayloadSchema: () => r5i,
    resetCapturedZCodeAgentTelemetryEnvForTest: () => X2i,
    resetCapturedZCodeCuaBrokerCredentialsForTest: () => Y2i,
    resolveBigModelApiOrigin: () => NAe,
    resolveCliProcessResourceRole: () => M6i,
    resolveConversationPreviewPath: () => KAe,
    resolveDynamicWorkflowClientConfig: () => ozi,
    resolveExecutionState: () => zx,
    resolveForceUpdateRequirement: () => oZi,
    resolveHelpAppConfig: () => hGi,
    resolveIntranetDepsBaseUrl: () => aZi,
    resolveIntranetMachineHost: () => mKt,
    resolveJwtExpiration: () => eGi,
    resolveLocalizedText: () => jlr,
    resolveModelProviderFamilyIdByBaseURL: () => QYe,
    resolveModelProviderFamilyIdByProviderId: () => YJt,
    resolveModelProviderFamilyLabelByProviderId: () => xJi,
    resolveModelProviderFamilySpecByProviderId: () => cdr,
    resolveOffPeakProviderId: () => WGi,
    resolvePlanIdentitySnapshot: () => yGi,
    resolvePlatformBinaryName: () => zlr,
    resolvePluginDisplayName: () => CJt,
    resolvePluginStoreCategory: () => Dpr,
    resolveProviderFamilyDomainFromOAuthProvider: () => XJt,
    resolveRewardsOrigin: () => IZi,
    resolveRuntimeProductEndpointConfig: () => I3i,
    resolveRuntimeZCodeEndpointOrigin: () => c1,
    resolveRuntimeZCodeEnv: () => UL,
    resolveSafeTelemetryHostname: () => UYe,
    resolveStartupLocalWorkspaceSessionIndex: () => cZi,
    resolveSupplierKeyFromModelDisplayValue: () => MJi,
    resolveTelemetryModelId: () => ZAe,
    resolveTelemetryProviderScope: () => zYe,
    resolveWebRemoteControlFailureReasonFromCloseCode: () => ZKi,
    resolveWebRemoteControlInitialWorkspaceSelection: () => XKi,
    resolveWebRemoteControlRelayWsUrl: () => w3i,
    resolveWebRemoteControlRoutePathFromBaseUrl: () => HKi,
    resolveWebRemoteControlWorkspaceKey: () => XAe,
    resolveWorkspaceKey: () => hsr,
    resolveWorkspaceTelemetryDetail: () => IGi,
    resolveZCodeBackgroundTaskControlKind: () => HYe,
    resolveZCodeEndpointOrigin: () => Krr,
    resolveZCodeRuntimeEnv: () => gCe,
    resolveZCodeToolProjectionMetadata: () => YUi,
    resolveZCodeVisibleSessionTitle: () => aUi,
    resolveZaiBusinessBaseUrl: () => RVt,
    resolveZaiOAuthClientId: () => Zrr,
    resolveZaiOAuthOrigin: () => PVt,
    rewardsContextSchema: () => PKt,
    rewriteMarkdownArtifactImageSources: () => szi,
    rewriteZCodeEndpointUrl: () => C3i,
    sanitizeTelemetryErrorMessage: () => FJt,
    sanitizeTelemetryEventDetail: () => Pur,
    sanitizeTelemetryModelValue: () => Mur,
    sanitizeZCodeRuntimeEnv: () => CQ,
    sanitizeZCodeRuntimeEnvInPlace: () => _Ce,
    serializeLaunchMarks: () => jur,
    serializeShortcutBinding: () => uWt,
    serverConnectOptionsSchema: () => qsr,
    serverRemoteHostCapabilitySchema: () => dzi,
    serverRemoteInfoSchema: () => uzi,
    serverRemoteWorkspaceInfoSchema: () => rur,
    serviceAuthorityModes: () => Qlr,
    sessionCreateTelemetrySchema: () => sAe,
    sessionDebugNetworkEntrySchema: () => Hpr,
    sessionDebugParamsSchema: () => DKt,
    sessionDebugRoundSchema: () => Vpr,
    sessionDebugSnapshotSchema: () => PZi,
    sessionMessageDeliveryResultSchema: () => KGt,
    sessionMessageRequestSchema: () => JGt,
    sessionRouteSchema: () => dar,
    shouldCaptureZCodeToolEnvPassthroughKey: () => e8t,
    shouldEnableE2ETestBridge: () => cGi,
    shouldMaterializeZCodeStreamingToolInputPreview: () => bKi,
    shouldSanitizeZCodeRuntimeEnvKey: () => IHe,
    shouldShowBuiltinModelProviderForActiveOAuth: () => IJi,
    shouldShowBuiltinModelProviderForDomain: () => udr,
    shouldShowModelProviderFamilyForActiveOAuth: () => TJi,
    shouldShowModelProviderFamilyForDomain: () => QJt,
    shouldUseProviderRegistrySourceForAuthorityMode: () => lzi,
    shouldWalkSkillDirectoryEntry: () => oXe,
    sortPluginStoreEntries: () => _Zi,
    sshConnectOptionsSchema: () => Usr,
    startupDiskSummarySchema: () => enr,
    stringArraySchema: () => V8i,
    stringifyUnknownValue: () => AEe,
    stripRemoteTargetSecrets: () => Mtr,
    summarizeOfficialMcpIdentityHeaders: () => $Vt,
    taskNotificationPayloadSchema: () => n5i,
    taskOwnerCommandDeliverySchema: () => UGt,
    taskOwnerCommandErrorCodeSchema: () => Osr,
    taskOwnerCommandRequestSchema: () => BGt,
    taskOwnerCommandResultSchema: () => _Ye,
    taskRealtimeDeliveredEventSchema: () => $Gt,
    taskRealtimeDeliveryPurposeSchema: () => mYe,
    taskRealtimeEventSchema: () => zGt,
    taskRealtimeHostDeliveryKindSchema: () => DGt,
    taskRealtimeReasonSchema: () => gsr,
    taskRunLeaseAcquireRequestSchema: () => FGt,
    taskRunLeaseResultSchema: () => jGt,
    taskRunLeaseTargetSchema: () => LGt,
    taskSnapshotInvalidatedEventSchema: () => OGt,
    taskStreamMirrorOpSchema: () => wsr,
    taskStreamMirrorPublishOpSchema: () => NGt,
    taskStreamMirrorTargetSchema: () => gYe,
    telemetryRendererContextSchema: () => Wsr,
    testId: () => XVi,
    textFromZCodeMessageParts: () => kee,
    toOpencodeModelId: () => SJi,
    toOpencodeProviderKey: () => rdr,
    uuidv7: () => xz,
    webRemoteControlAppPayloadSchema: () => Bsr,
    webRemoteControlExternalWorkspaceBridgeSchema: () => Lsr,
    webRemoteControlFailureReasonSchema: () => yYe,
    webRemoteControlMobileDeviceInfoSchema: () => Fsr,
    webRemoteControlMobileViewStateSchema: () => bYe,
    webRemoteControlPlatformMethodSchema: () => vYe,
    webRemoteControlReconnectWorkspaceRequestSchema: () => H8i,
    webRemoteControlReconnectWorkspaceResultSchema: () => G8i,
    webRemoteControlRpcRelayEnvelopeSchema: () => dsr,
    webRemoteControlRpcTransportAckSchema: () => pYe,
    webRemoteControlRpcTransportChecksumSchema: () => lsr,
    webRemoteControlRpcTransportFrameSchema: () => qpe,
    webRemoteControlRpcTransportIdSchema: () => Nee,
    webRemoteControlRpcTransportIdentitySchema: () => csr,
    webRemoteControlRpcTransportPayloadSchema: () => PGt,
    webRemoteControlTaskTargetSchema: () => Nsr,
    webRemoteControlTaskTargetsSchema: () => HGt,
    webRemoteControlWindowBootstrapResultSchema: () => jsr,
    webRemoteControlWorkspaceListResultSchema: () => WGt,
    webRemoteControlWorkspaceTargetSchema: () => Msr,
    webRemoteControlWorkspaceTargetsSchema: () => VGt,
    windowHostAttachmentScopeSchema: () => Ksr,
    windowHostRemoteWorkspaceDescriptorSchema: () => Jsr,
    withOpenRouterAttributionHeaders: () => _Kt,
    workspaceTaskListInvalidatedEventSchema: () => MGt,
    wslConnectOptionsSchema: () => zsr,
    wslUserSchema: () => Ppe,
    zcodeAccountAccessSchema: () => Q3i,
    zcodeActiveToolCallSchema: () => eir,
    zcodeApiRetryFromModelNetworkStatusPayload: () => cJt,
    zcodeApiRetryFromStreamRecoveryPayload: () => xYe,
    zcodeAssistantMessageInfoSchema: () => qnr,
    zcodeAutomationBotDeliveryTargetSchema: () => Ape,
    zcodeAutomationCheckTaskBindingParamsSchema: () => p8i,
    zcodeAutomationCheckTaskBindingResultSchema: () => kGt,
    zcodeAutomationCreateParamsSchema: () => l8i,
    zcodeAutomationCreateResultSchema: () => SGt,
    zcodeAutomationDeleteParamsSchema: () => f8i,
    zcodeAutomationDeleteResultSchema: () => xGt,
    zcodeAutomationIntervalUnitSchema: () => bGt,
    zcodeAutomationListParamsSchema: () => d8i,
    zcodeAutomationListResultSchema: () => cYe,
    zcodeAutomationProtocolSchema: () => aYe,
    zcodeAutomationScheduleRuleSchema: () => nsr,
    zcodeAutomationUpdateParamsSchema: () => u8i,
    zcodeAutomationUpdateResultSchema: () => wGt,
    zcodeAvailablePluginSummarySchema: () => ZVt,
    zcodeBackgroundTaskInfoSchema: () => Dir,
    zcodeBackgroundTaskNotificationToolUpdateStatus: () => JJt,
    zcodeBrowserAmbientContextSchema: () => eYe,
    zcodeBrowserExecuteParamsSchema: () => Fir,
    zcodeBrowserExecuteResultSchema: () => Upe,
    zcodeBrowserListParamsSchema: () => Lir,
    zcodeBrowserListResultSchema: () => nYe,
    zcodeComputerUseOperationEventSchema: () => sBi,
    zcodeContextUsageBreakdownItemSchema: () => Knr,
    zcodeContextUsageBreakdownSchema: () => kpe,
    zcodeContextUsageBreakdownSourceSchema: () => Jnr,
    zcodeCreateWorkflowToolResultDisplaySchema: () => Ror,
    zcodeDeliveryKindSchema: () => fV,
    zcodeEventEnvelopeSchema: () => oir,
    zcodeInstalledPluginSummarySchema: () => sYe,
    zcodeInteractionPreferencesSchema: () => Mir,
    zcodeInteractionRequestOriginSchema: () => BL,
    zcodeMcpListModeSchema: () => qor,
    zcodeMcpListParamsSchema: () => QZe,
    zcodeMcpListResultSchema: () => Fpe,
    zcodeMcpResourceSampleSchema: () => For,
    zcodeMcpResourceSamplesSchema: () => tHt,
    zcodeMcpServerStatusKindSchema: () => Bor,
    zcodeMcpServerStatusSnapshotSchema: () => $or,
    zcodeMcpTelemetryEventSchema: () => eHt,
    zcodeMessageInfoSchema: () => Wnr,
    zcodeMessagePartDeltaEventPayloadSchema: () => gir,
    zcodeMessagePartRemovedEventPayloadSchema: () => _ir,
    zcodeMessagePartSchema: () => yZe,
    zcodeMessagePartUpsertedEventPayloadSchema: () => KVt,
    zcodeMessageRemovedEventPayloadSchema: () => hir,
    zcodeMessageSemanticsSchema: () => qWt,
    zcodeMessageUpsertedEventPayloadSchema: () => mir,
    zcodeMessageVisibilitySchema: () => pZe,
    zcodeMessageWithPartsSchema: () => vZe,
    zcodeModelContextBudgetStrategySchema: () => Eir,
    zcodeModelFormatPropertiesSchema: () => Gor,
    zcodeModelIoPreferencesSchema: () => Nir,
    zcodeModelOptionSchema: () => Jor,
    zcodeModelReasoningOptionsSchema: () => Hor,
    zcodeModelStreamingEventPayloadSchema: () => rir,
    zcodeModelStreamingKindSchema: () => nir,
    zcodeNodeReplImageToolResultDisplaySchema: () => Por,
    zcodeOffPeakCreateParamsSchema: () => m8i,
    zcodeOffPeakCreateResultSchema: () => IGt,
    zcodeOffPeakListParamsSchema: () => h8i,
    zcodeOffPeakListResultSchema: () => lYe,
    zcodeOffPeakPermissionModeSchema: () => rsr,
    zcodeOffPeakTaskSnapshotSchema: () => TGt,
    zcodeOfficialMcpAuthFailureReasonSchema: () => zir,
    zcodeOfficialMcpAuthHeadersRequestParamsSchema: () => UBi,
    zcodeOfficialMcpAuthHeadersResponseSchema: () => $Ht,
    zcodePendingPermissionSchema: () => Qor,
    zcodePermissionDecisionSchema: () => fZe,
    zcodePermissionOptionSchema: () => XZe,
    zcodePermissionRequestParamsSchema: () => LBi,
    zcodePermissionRequestedEventPayloadSchema: () => vir,
    zcodePermissionResolvedEventPayloadSchema: () => bir,
    zcodePermissionResponseSchema: () => jL,
    zcodePermissionRuleBehaviorSchema: () => Fnr,
    zcodePermissionRuleValueSchema: () => jnr,
    zcodePermissionUpdateSchema: () => mZe,
    zcodePersistedMessageSchema: () => Ecr,
    zcodePersistedToolCallSchema: () => Ccr,
    zcodePinnedTasksFileSchema: () => m5i,
    zcodePluginComponentGroupSchema: () => VHt,
    zcodePluginComponentItemSchema: () => Wir,
    zcodePluginComponentKindSchema: () => qir,
    zcodePluginDiagnosticSchema: () => $L,
    zcodePluginHookDetailSchema: () => WHt,
    zcodePluginInfoSchema: () => HHt,
    zcodePluginMarketplaceSummarySchema: () => VZe,
    zcodePluginOperationProgressNotificationSchema: () => YBi,
    zcodePluginOperationStateSchema: () => ZBi,
    zcodePluginOptionValueSchema: () => qHt,
    zcodePluginReferenceCatalogEntrySchema: () => Vir,
    zcodePluginScopeSchema: () => zL,
    zcodePluginStoreListingSchema: () => iYe,
    zcodePluginSuggestedReferenceStatusSchema: () => tsr,
    zcodePluginUserConfigOptionSchema: () => $ir,
    zcodePluginsCancelOperationParamsSchema: () => pGt,
    zcodePluginsCancelOperationResultSchema: () => n8i,
    zcodePluginsConfigureParamsSchema: () => gGt,
    zcodePluginsConfigureResultSchema: () => s8i,
    zcodePluginsDescribeParamsSchema: () => vGt,
    zcodePluginsDescribeResultSchema: () => c8i,
    zcodePluginsInstallParamsSchema: () => dGt,
    zcodePluginsInstallResultSchema: () => r8i,
    zcodePluginsListParamsSchema: () => GHt,
    zcodePluginsListResultSchema: () => zBi,
    zcodePluginsMarketplaceAddParamsSchema: () => cGt,
    zcodePluginsMarketplaceMutationResultSchema: () => t8i,
    zcodePluginsMarketplaceRemoveParamsSchema: () => lGt,
    zcodePluginsMarketplaceUpdateParamsSchema: () => uGt,
    zcodePluginsOverviewParamsSchema: () => aGt,
    zcodePluginsOverviewResultSchema: () => e8i,
    zcodePluginsReferenceCatalogParamsSchema: () => JHt,
    zcodePluginsReferenceCatalogResultSchema: () => $Bi,
    zcodePluginsResetConfigParamsSchema: () => _Gt,
    zcodePluginsResolveSuggestedReferenceParamsSchema: () => iGt,
    zcodePluginsResolveSuggestedReferenceResultSchema: () => QBi,
    zcodePluginsRestoreBuiltinParamsSchema: () => hGt,
    zcodePluginsRestoreBuiltinResultSchema: () => i8i,
    zcodePluginsSetEnabledParamsSchema: () => sGt,
    zcodePluginsSetEnabledResultSchema: () => XBi,
    zcodePluginsUninstallParamsSchema: () => fGt,
    zcodePluginsUninstallResultSchema: () => o8i,
    zcodePluginsUpdateParamsSchema: () => mGt,
    zcodePluginsValidateParamsSchema: () => yGt,
    zcodePluginsValidateResultSchema: () => a8i,
    zcodeProcessChildProcessSchema: () => jor,
    zcodeProcessChildProcessesParamsSchema: () => K3i,
    zcodeProcessChildProcessesResultSchema: () => Z3i,
    zcodeProcessDiagnosticSchema: () => WJe,
    zcodeProcessResourceSampleSchema: () => rHt,
    zcodePromptAttachmentSchema: () => Icr,
    zcodePromptFileAttachmentSchema: () => Tcr,
    zcodePromptImageAttachmentSchema: () => wcr,
    zcodePromptPdfAttachmentSchema: () => xcr,
    zcodePromptVideoAttachmentSchema: () => kcr,
    zcodeProtocolEmptyResultSchema: () => g8i,
    zcodeProtocolErrorCodes: () => Oee,
    zcodeProtocolErrorDetailSchema: () => cHt,
    zcodeProtocolErrorSchema: () => Nor,
    zcodeProtocolMcpServerSchema: () => Lpe,
    zcodeProtocolMessageSchema: () => XVt,
    zcodeProtocolMethods: () => va,
    zcodeProtocolNotificationSchema: () => Oor,
    zcodeProtocolNotifications: () => OR,
    zcodeProtocolRequestIdSchema: () => JZe,
    zcodeProtocolRequestSchema: () => Dor,
    zcodeProtocolResponseSchema: () => Mor,
    zcodeProtocolSessionMethodContracts: () => _8i,
    zcodeProtocolTraceSchema: () => YVt,
    zcodeProviderAccountAccessSchema: () => Kor,
    zcodeProviderRuntimeHeadersCancelledSchema: () => BBi,
    zcodeProviderRuntimeHeadersRequestParamsSchema: () => jBi,
    zcodeProviderRuntimeHeadersRequestReasonSchema: () => Uir,
    zcodeProviderRuntimeHeadersResponseSchema: () => zHt,
    zcodeProviderSchema: () => OO,
    zcodeProviderTestModelConnectivityParamsSchema: () => NHt,
    zcodeProviderTestModelConnectivityResultSchema: () => PBi,
    zcodeProviderUpdateAccountConfigParamsSchema: () => LHt,
    zcodeProviderUpdateAccountConfigResultSchema: () => RBi,
    zcodeRuntimeCapabilitiesSchema: () => H3i,
    zcodeSavedWorkflowArgDeclarationSchema: () => Jir,
    zcodeSavedWorkflowArgTypeSchema: () => Gir,
    zcodeSavedWorkflowArgsDeclarationSchema: () => ZHt,
    zcodeSavedWorkflowEntrySchema: () => Kir,
    zcodeSavedWorkflowFailureReasonSchema: () => Yir,
    zcodeSavedWorkflowInvalidEntrySchema: () => Zir,
    zcodeSavedWorkflowMetaSchema: () => YHt,
    zcodeSavedWorkflowRunSchema: () => esr,
    zcodeSavedWorkflowRunStatusSchema: () => Xir,
    zcodeSavedWorkflowRunStopReasonSchema: () => Qir,
    zcodeSavedWorkflowScopeSchema: () => _V,
    zcodeSessionApiRetryStatusSchema: () => Gnr,
    zcodeSessionCancelBackgroundTaskParamsSchema: () => CHt,
    zcodeSessionCancelBackgroundTaskResultSchema: () => kBi,
    zcodeSessionCloseParamsSchema: () => RHt,
    zcodeSessionCloseResultSchema: () => xBi,
    zcodeSessionClosedEventPayloadSchema: () => kir,
    zcodeSessionCompactParamsSchema: () => xHt,
    zcodeSessionCompactResultSchema: () => SBi,
    zcodeSessionContextCacheUsageSchema: () => bZe,
    zcodeSessionContextUsageSchema: () => Znr,
    zcodeSessionCreateParamsSchema: () => dHt,
    zcodeSessionCreatedEventPayloadSchema: () => iir,
    zcodeSessionEndedSubagentSchema: () => Iir,
    zcodeSessionEventSchema: () => lHt,
    zcodeSessionEventTypeSchema: () => aBi,
    zcodeSessionEventsParamsSchema: () => vHt,
    zcodeSessionEventsResultSchema: () => uBi,
    zcodeSessionFileSchema: () => y5i,
    zcodeSessionForkParamsSchema: () => kHt,
    zcodeSessionForkResultSchema: () => bBi,
    zcodeSessionGoalActionSchema: () => Pir,
    zcodeSessionGoalParamsSchema: () => THt,
    zcodeSessionGoalResultSchema: () => wBi,
    zcodeSessionGoalSchema: () => gZe,
    zcodeSessionGoalStatsSchema: () => Zor,
    zcodeSessionGoalVerificationSchema: () => zWt,
    zcodeSessionGoalVerificationTimelineSchema: () => Unr,
    zcodeSessionHistoryTargetSchema: () => Air,
    zcodeSessionImportHistorySchema: () => Vor,
    zcodeSessionImportMessageSchema: () => Wor,
    zcodeSessionInfoSchema: () => _Ze,
    zcodeSessionKindSchema: () => Bnr,
    zcodeSessionListParamsSchema: () => fHt,
    zcodeSessionListResultSchema: () => mBi,
    zcodeSessionMessagesParamsSchema: () => yHt,
    zcodeSessionMessagesResultSchema: () => dBi,
    zcodeSessionModeSchema: () => Nj,
    zcodeSessionPersistenceSchema: () => oHt,
    zcodeSessionProjectionSchema: () => tir,
    zcodeSessionReadParamsSchema: () => _Ht,
    zcodeSessionRequestRuntimePreferencesParamsSchema: () => yBi,
    zcodeSessionResumeParamsSchema: () => pHt,
    zcodeSessionResumedEventPayloadSchema: () => sir,
    zcodeSessionRunningSubagentSchema: () => Tir,
    zcodeSessionRuntimePreferencesResultSchema: () => SHt,
    zcodeSessionRuntimePreferencesScopeSchema: () => Cir,
    zcodeSessionRuntimeStateSchema: () => WWt,
    zcodeSessionSendParamsSchema: () => wHt,
    zcodeSessionSendResultSchema: () => vBi,
    zcodeSessionSetModeParamsSchema: () => PHt,
    zcodeSessionSetModelParamsSchema: () => EHt,
    zcodeSessionSetThoughtLevelParamsSchema: () => AHt,
    zcodeSessionSettingsStateSchema: () => Xor,
    zcodeSessionSettingsToZCodeConfigOptions: () => yJi,
    zcodeSessionStateSnapshotSchema: () => FAe,
    zcodeSessionStatusSchema: () => hZe,
    zcodeSessionStopParamsSchema: () => IHt,
    zcodeSessionSubagentsParamsSchema: () => mHt,
    zcodeSessionSubagentsResultSchema: () => hBi,
    zcodeSessionSubscribeParamsSchema: () => uHt,
    zcodeSessionSubscribeResultSchema: () => fBi,
    zcodeSessionTitleUpdatedEventPayloadSchema: () => air,
    zcodeSessionTodoGroupSchema: () => Yor,
    zcodeSessionTodoItemSchema: () => sHt,
    zcodeSkillReferenceCatalogEntrySchema: () => Hir,
    zcodeSkillsReferenceCatalogParamsSchema: () => KHt,
    zcodeSkillsReferenceCatalogResultSchema: () => qBi,
    zcodeSlashCommandSchema: () => aHt,
    zcodeStateUpdatedNotificationSchema: () => pBi,
    zcodeStoragePathReadySchema: () => v8i,
    zcodeStoragePreparationFrameSchema: () => y8i,
    zcodeStorageStartupStateSchema: () => KZe,
    zcodeSyntheticUserMessageSourceSchema: () => wpe,
    zcodeTaskGoalChangedPatchSchema: () => Rcr,
    zcodeTaskGoalSchema: () => $Ae,
    zcodeTaskGoalStatusSchema: () => ZGt,
    zcodeTaskIndexEntrySchema: () => Ocr,
    zcodeTaskMetaSchema: () => SYe,
    zcodeTaskMigrationSourceSchema: () => Ear,
    zcodeTaskModeSchema: () => Ree,
    zcodeTaskNetworkDebugStatusFromPayload: () => uJt,
    zcodeTaskPersistStatusSchema: () => Scr,
    zcodeTaskSessionBindingSchema: () => f5i,
    zcodeTaskSessionBindingStateSchema: () => Dcr,
    zcodeTaskTargetChangedActionSchema: () => Acr,
    zcodeTaskTargetChangedPatchSchema: () => p5i,
    zcodeTaskTargetChangedSourceSchema: () => Pcr,
    zcodeTaskTargetSchema: () => d5i,
    zcodeTaskTargetStatusSchema: () => u5i,
    zcodeTaskTokenUsageParamsSchema: () => gHt,
    zcodeTaskTokenUsageResultSchema: () => _Bi,
    zcodeThoughtLevelOptionSchema: () => iHt,
    zcodeTimelinePartSchema: () => Hnr,
    zcodeTokenUsageSchema: () => $Wt,
    zcodeToolExecResourceSchema: () => nHt,
    zcodeToolStateSchema: () => Vnr,
    zcodeToolUpdatedEventPayloadSchema: () => yir,
    zcodeTurnCompletedEventPayloadSchema: () => pir,
    zcodeTurnFailedEventPayloadSchema: () => fir,
    zcodeTurnStartedEventPayloadSchema: () => cir,
    zcodeTurnSteerDrainedEventPayloadSchema: () => dir,
    zcodeTurnSteerQueuedEventPayloadSchema: () => uir,
    zcodeUsageStatsParamsSchema: () => hHt,
    zcodeUsageStatsResultSchema: () => gBi,
    zcodeUserInputOptionSchema: () => jir,
    zcodeUserInputQuestionSchema: () => Bir,
    zcodeUserInputRequestParamsSchema: () => FBi,
    zcodeUserInputRequestedEventPayloadSchema: () => Sir,
    zcodeUserInputResolvedEventPayloadSchema: () => wir,
    zcodeUserInputResponseSchema: () => rYe,
    zcodeUserMessageInfoSchema: () => $nr,
    zcodeWorkflowsDeleteParamsSchema: () => nGt,
    zcodeWorkflowsDeleteResultSchema: () => GBi,
    zcodeWorkflowsGetParamsSchema: () => eGt,
    zcodeWorkflowsGetResultSchema: () => VBi,
    zcodeWorkflowsListParamsSchema: () => QHt,
    zcodeWorkflowsListResultSchema: () => WBi,
    zcodeWorkflowsMoveParamsSchema: () => oGt,
    zcodeWorkflowsMoveResultSchema: () => KBi,
    zcodeWorkflowsRunsParamsSchema: () => rGt,
    zcodeWorkflowsRunsResultSchema: () => JBi,
    zcodeWorkflowsUpdateMetaParamsSchema: () => tGt,
    zcodeWorkflowsUpdateMetaResultSchema: () => HBi,
    zcodeWorkspaceCancelGenerateTextParamsSchema: () => MHt,
    zcodeWorkspaceCancelGenerateTextResultSchema: () => ABi,
    zcodeWorkspaceGenerateTextParamsSchema: () => OHt,
    zcodeWorkspaceGenerateTextResultSchema: () => EBi,
    zcodeWorkspaceHookTrustGrantParamsSchema: () => Mee,
    zcodeWorkspaceHookTrustGrantReasonCodeSchema: () => tYe,
    zcodeWorkspaceHookTrustGrantResultSchema: () => Bpe,
    zcodeWorkspacePresentationSchema: () => TBi,
    zcodeWorkspaceReadPresentationParamsSchema: () => DHt,
    zcodeWorkspaceRefSchema: () => rd,
    zcodeWorkspaceUpdateDynamicWorkflowPolicyParamsSchema: () => UHt,
    zcodeWorkspaceUpdateDynamicWorkflowPolicyResultSchema: () => NBi,
    zcodeWorkspaceUpdateInteractionPreferencesParamsSchema: () => FHt,
    zcodeWorkspaceUpdateInteractionPreferencesResultSchema: () => DBi,
    zcodeWorkspaceUpdateModelIoPreferencesParamsSchema: () => jHt,
    zcodeWorkspaceUpdateModelIoPreferencesResultSchema: () => OBi,
    zcodeWorkspaceUpdateOffPeakToolPolicyParamsSchema: () => BHt,
    zcodeWorkspaceUpdateOffPeakToolPolicyResultSchema: () => MBi
});
