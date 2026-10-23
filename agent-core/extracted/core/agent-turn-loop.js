async function _Eo(e, t, n) {
    return await GJ(this, {
        abortSignal: n?.abortSignal,
        createCommand: r(({
            reject: o,
            resolve: s
        }) => ({
            attachments: t,
            createdAt: new Date,
            id: GA(),
            input: e,
            mode: "prompt",
            options: n,
            priority: "next",
            reject: o,
            resolve: s,
            traceContext: n?.traceContext ?? this.rootTraceContext
        }), "createCommand")
    })
}
async function yEo(e, t, n, o) {
    let s = n?.intent?.modelSelection ?? this.getSessionModelSelection(),
        a = this.config.outputStyle,
        l = fSo(e),
        u = mSo(e),
        f = o?.turnId ?? uA(),
        g = n?.queryId ?? n?.inputId ?? Noe(),
        _ = n?.displayInput ?? e,
        b = o?.traceContext ?? Ew(n?.traceContext ?? this.rootTraceContext, {
            queryId: g,
            sessionId: this.sessionId,
            turnId: f,
            attributes: {
                turnNumber: this.turnNumber
            }
        }),
        w = b.traceId,
        T = Date.now(),
        I = n?.inputId ?? String(f),
        A = [],
        R = ih.create(this.sessionId, this.turnNumber, e, w, f);
    this.currentTurnFileChanges = new Map, o || this.reserveTurnStart(f, b, "regular");
    let L = Dwo(n?.abortSignal),
        U = L.signal,
        j, z = null,
        $, K, q, ie = !1,
        ae = "queued",
        Ce = !1,
        pe = r(() => {}, "finishPreparation"),
        ze = {
            context_initialization: "context",
            session_start_hooks: "hooks",
            user_prompt_hooks: "hooks",
            session_persistence: "persistence",
            turn_started_event: "persistence",
            target_accounting: "persistence"
        },
        rt = r(Fe => {
            let kt = ze[Fe];
            pe = kt && kt !== "attempt" && kt !== "retry_wait" && kt !== "user_confirmation" ? o3(b, kt) : () => {}, ae = Fe;
            let St = Date.now();
            return this.logger?.info("Turn phase started", {
                ...Cr(b),
                event: "turn.phase.started",
                module: "core.runtime",
                phase: Fe,
                status: "started"
            }), St
        }, "startTurnPhase"),
        Ae = r((Fe, kt) => {
            pe(), this.logger?.info("Turn phase completed", {
                ...Cr(b),
                durationMs: Date.now() - kt,
                event: "turn.phase.completed",
                module: "core.runtime",
                phase: Fe,
                status: "completed"
            })
        }, "completeTurnPhase"),
        bt = this.agentTelemetry.turn({
            inputSource: n?.inputSource,
            traceContext: b,
            turnNumber: this.turnNumber
        }),
        Ye = r(() => Ste(b, async () => {
            let Fe = performance.timeOrigin + performance.now();
            o3(b, "execution")(), jd(U);
            let kt;
            try {
                kt = u === null ? Fkn(this, {
                    requestDependencies: n?.modelExecution?.requestDependencies,
                    selection: s
                }) : void 0
            } catch (et) {
                Ce = !0;
                let _t = qoe(et, U, "Model creation failed");
                throw await Woe(this, {
                    coreError: _t,
                    events: A,
                    durationMs: Date.now() - T,
                    turnPhase: "model_creation",
                    inputId: n?.inputId,
                    traceContext: b,
                    fallbackMessage: "Model creation failed",
                    logEvent: "turn.failed",
                    logLabel: "Turn"
                }), _t
            }
            let St = rt("context_initialization");
            this.contextInitialized ? d4(this, {
                model: kt
            }) : await this.ensureContextInitialized(b, kt), Ae("context_initialization", St), jd(U), St = rt("session_start_hooks");
            let ct = await this.runSessionStartHooks("startup", b, U, kt);
            if (Ae("session_start_hooks", St), this.injectHookAdditionalContextIntoMessageHistory(xl.SessionStart, ct.additionalContexts), l !== null) {
                let et = await Z4e(this, n?.intent, b, n?.modelExecution, kt);
                return this.executeManualCompact(e, l, f, b, U, n?.inputId, et)
            }
            if (u !== null) return this.executeRewindCommand(e, u, f, b, U, n?.inputId);
            j = this.beginActiveTurn(f, b, "regular", !0, {
                ...n?.inputId === void 0 ? {} : {
                    inputId: n.inputId
                }
            }), this.logger?.info("Turn started", {
                ...Cr(b),
                event: "turn.started",
                inputLength: e.length,
                module: "core.runtime",
                status: "started"
            }), R = new ih(R.start()), St = rt("session_persistence"), await this.ensureSessionPersisted(_, b);
            let $e = await Z4e(this, n?.intent, b, n?.modelExecution, kt);
            z = await this.readSessionTargetForContext(b), Ae("target_read", St), z?.status !== "active" && (z = null), K = n?.skipInputRecord === !0 ? n.recordedInputMessageId ?? ql() : ql();
            let Bt = qwo(t),
                Ve = this.createEvent(ut.TurnStarted, {
                    executionStartedAt: Fe,
                    turnNumber: this.turnNumber,
                    input: _,
                    messageId: K,
                    inputId: n?.inputId,
                    ...n?.automationId ? {
                        automationId: n.automationId
                    } : n?.offPeakTaskId ? {
                        offPeakTaskId: n.offPeakTaskId,
                        ...n.offPeakRunType ? {
                            offPeakRunType: n.offPeakRunType
                        } : {}
                    } : {},
                    foregroundExecutionId: this.activeForegroundExecution?.foregroundExecutionId,
                    queryId: g,
                    inputSource: n?.inputSource,
                    inputVisibility: n?.inputVisibility,
                    originMeta: n?.originMeta,
                    ...n?.epilogueStart === void 0 ? {} : {
                        epilogueStart: n.epilogueStart
                    },
                    ...n?.backgroundSource ? {
                        backgroundSource: n.backgroundSource
                    } : {},
                    targetId: n?.targetId,
                    ...n?.intent ? {
                        intent: n.intent
                    } : {},
                    ...Bt ? {
                        attachments: Bt
                    } : {}
                }, b);
            St = rt("turn_started_event"), await this.appendEvent(Ve, b), Ae("turn_started_event", St), A.push(Ve), St = rt("target_accounting"), z = await this.startTargetTurnAccounting({
                inputID: I,
                startedAtMs: T,
                startedTarget: z,
                traceContext: b
            }), Ae("target_accounting", St), z && this.sessionStore?.heartbeatTargetRun && ($ = setInterval(() => {
                this.trackResidencyBlockingWork(this.heartbeatTargetTurnAccounting({
                    inputID: I,
                    seenAtMs: Date.now(),
                    startedTarget: z,
                    traceContext: b
                }))
            }, Fka), typeof $ == "object" && "unref" in $ && $.unref());
            try {
                St = rt("user_prompt_hooks");
                let et = n?.skipUserPromptSubmitHooks ? {
                    additionalContexts: []
                } : await this.runUserPromptSubmitHooks(e, t, b, U);
                if (Ae("user_prompt_hooks", St), et.preventContinuation) {
                    let we = et.stopReason ?? "Prompt blocked by UserPromptSubmit hook.";
                    j && (j.steerable = !1), R = new ih(R.complete(we, "success"));
                    let _e = $O(A),
                        Pt = this.createEvent(ut.TurnComplete, {
                            response: we,
                            tokenCount: 0,
                            usage: _e,
                            toolCallCount: 0,
                            duration: Date.now() - R.state.startedAt.getTime(),
                            resultType: "success",
                            cacheStats: this.messageHistory.getCacheStats(),
                            inputId: n?.inputId
                        }, b);
                    await this.appendEvent(Pt, b), A.push(Pt), await HB(this, {
                        completedAt: Date.now(),
                        events: A,
                        startedAt: T,
                        status: "completed",
                        traceContext: b,
                        turnId: f
                    }), this.turnNumber++;
                    let it = await this.rebuildProjection();
                    return await this.accountTargetTurnCompletion({
                        inputID: I,
                        startedAtMs: T,
                        startedTarget: z,
                        traceContext: b,
                        usage: _e
                    }), {
                        response: we,
                        turnId: f,
                        traceId: w,
                        usage: _e,
                        events: A,
                        projection: it
                    }
                }
                this.injectHookAdditionalContextIntoMessageHistory(xl.UserPromptSubmit, et.additionalContexts), Bka.call(this, e, n), jka.call(this);
                let _t = await Ugt(t, {
                    abortSignal: U,
                    artifactStore: this.artifactStore,
                    fileSystemPort: this.fileSystemPort,
                    imageProcessorPort: this.imageProcessorPort,
                    sessionId: this.sessionId,
                    traceContext: b,
                    turnId: f,
                    workingDirectory: this.workingDirectory
                });
                rko(this.logger, b, _t);
                let Dt = n?.sharedContextRefs ?? n?.intent?.sharedContextRefs;
                if (Dt && Dt.length > 0) {
                    let [we] = Dt;
                    if (!we || we.kind !== "shared_context_import") throw new Error("invalid shared context reference");
                    if (!this.sessionStore) throw new Error("shared context import storage is unavailable");
                    if (!this.messageHistory.borrowReadOnlyRuntimeEntries().some(Pt => Pt.kind !== "attachment" && Pt.metadata?.source === "shared_context")) {
                        let Nn = (await this.sessionStore.messages({
                            sessionID: this.sessionId
                        })).find(Mr => Mr.info.role === "user" && Mr.info.source === "shared_context" && Mr.info.metadata && typeof Mr.info.metadata == "object" && Mr.info.metadata.contextId === we.context_id)?.parts.filter(Mr => Mr.type === "text").map(Mr => Mr.text).join(`
`).trim();
                        if (!Nn) throw new Error("shared context content is unavailable");
                        this.messageHistory.addUser(Nn, g4e("shared_context"))
                    }
                }
                if (await this.persistPendingModelChangeTimeline(b), n?.skipInputRecord !== !0 && n?.inputVisibility === "model-only") {
                    let we = n.inputSource ?? "goal-continuation",
                        _e = Pye(e, _t);
                    this.messageHistory.addUser(_e, MA(n.inputPresentation) ?? g4e(we)), await this.persistSyntheticUserNoticeForSession({
                        messageID: K,
                        metadata: {
                            ...n.targetId ? {
                                targetId: n.targetId
                            } : {},
                            ...n.inputPresentation ? {
                                inputPresentation: n.inputPresentation
                            } : {},
                            visibility: "model-only"
                        },
                        sessionId: this.sessionId,
                        source: we,
                        text: e,
                        traceContext: b,
                        visibility: "model-only"
                    })
                } else n?.skipInputRecord !== !0 && (this.messageHistory.addEntries(RSo(e, _t, {
                    browserAmbientContext: n?.browserAmbientContext
                }).map(_e => {
                    let Pt = MA(n?.inputPresentation);
                    return _e.kind !== "attachment" && Pt ? {
                        ..._e,
                        metadata: Pt
                    } : _e
                })), await this.persistUserPrompt(K, _, _t, b, {
                    intent: n?.intent,
                    inputPresentation: n?.inputPresentation,
                    sessionInputId: n?.intent?.queueItemId,
                    sourceCommandId: n?.inputId,
                    ...n?.epilogueStart === void 0 ? {} : {
                        epilogueStart: n.epilogueStart
                    }
                }), ie = !Qgt.call(this, _, K, b, {
                    deferIfProviderRuntimeHeadersRefresh: !0
                }));
                n?.inputVisibility !== "model-only" && await this.injectPluginReferenceReminderFromTurn(_, b, n?.toolDisallowlist), this.messageHistory.setCacheMiss();
                let gn = $e ?? kt;
                if (!gn) throw new Error("Turn model was not created before execution");
                GIo(this, {
                    model: gn,
                    traceContext: b,
                    turnAbortSignal: U
                }, RG), q = {
                    activeTurn: j,
                    ...n?.automationId ? {
                        automationId: n.automationId
                    } : {},
                    ...n?.offPeakTaskId ? {
                        offPeakTaskId: n.offPeakTaskId
                    } : {},
                    anomalyWarningsInjected: 0,
                    backgroundSubagentResultConsumed: n?.backgroundSubagentResultConsumed === !0,
                    workflowResultConsumed: n?.workflowResultConsumed === !0,
                    completedRealToolResultBatch: !1,
                    currentUserMessageId: K,
                    events: A,
                    input: e,
                    modelResponse: "",
                    model: gn,
                    ...n?.modelExecution?.selectionScope === "execution" ? {
                        modelSelectionScope: "execution"
                    } : {},
                    ...n?.modelExecution?.subagents && n.intent?.modelSelection ? {
                        subagentModelOverride: {
                            selection: n.intent.modelSelection,
                            requestDependencies: n.modelExecution.requestDependencies,
                            background: n.modelExecution.subagents.background
                        }
                    } : {},
                    modelStepCount: 0,
                    historyRoundCount: 0,
                    reactiveCompactAttemptedInCurrentModelStep: !1,
                    repeatedToolCallSignature: void 0,
                    repeatedToolCallStreakCount: 0,
                    stopHookContinuationCount: 0,
                    streamRecoveryRetryCount: 0,
                    tokenCount: 0,
                    toolCallCount: 0,
                    turnRequestState: {
                        entries: [...this.messageHistory.borrowReadOnlyRuntimeEntries()],
                        outputTokenContinuationCount: 0
                    },
                    toolDisallowlist: n?.toolDisallowlist,
                    traceId: w,
                    turnAbortSignal: U,
                    turnId: f,
                    turnMachine: R,
                    turnOutputStyle: a,
                    turnTraceContext: b,
                    userMessageId: K
                }, cCo(j), St = rt("regular_turn_loop");
                try {
                    await oEo.call(this, q), Ae("regular_turn_loop", St)
                } finally {
                    oIo(q.turnRequestState), await lCo.call(this, j, b)
                }
                R = q.turnMachine;
                let un = $O(A);
                await this.accountTargetTurnCompletion({
                    inputID: I,
                    startedAtMs: T,
                    startedTarget: z,
                    traceContext: b,
                    usage: un
                }), q.stableProductStartMessageId && q.stableBoundaryAssistantMessageId && await sEo(this, {
                    boundaryMessageId: q.stableBoundaryAssistantMessageId,
                    startMessageId: q.stableProductStartMessageId,
                    historyRoundCount: q.historyRoundCount,
                    traceContext: b
                }), q.stableBoundaryAssistantMessageId && await hEo(this, q, q.stableBoundaryAssistantMessageId);
                let On = this.createEvent(ut.TurnComplete, {
                    response: q.modelResponse,
                    tokenCount: q.tokenCount,
                    usage: un,
                    toolCallCount: q.toolCallCount,
                    historyRoundCount: q.historyRoundCount,
                    duration: Date.now() - R.state.startedAt.getTime(),
                    resultType: "success",
                    ...q.backgroundSubagentResultConsumed ? {
                        backgroundSubagentResultConsumed: !0
                    } : {},
                    ...q.workflowResultConsumed ? {
                        workflowResultConsumed: !0
                    } : {},
                    cacheStats: this.messageHistory.getCacheStats(),
                    inputId: n?.inputId
                }, b);
                await this.appendEvent(On, b), A.push(On), await HB(this, {
                    completedAt: Date.now(),
                    events: A,
                    startedAt: T,
                    status: "completed",
                    traceContext: b,
                    turnId: f,
                    userMessageId: K
                }), ie && K && Sxo.call(this, _, K, b), this.turnNumber++;
                let sn = await this.rebuildProjection();
                return this.logger?.info("Turn completed", {
                    ...Cr(b),
                    durationMs: Date.now() - R.state.startedAt.getTime(),
                    event: "turn.completed",
                    module: "core.runtime",
                    status: "completed",
                    toolCallCount: q.toolCallCount
                }), n?.modelExecution?.memoryExtraction !== "skip" && fEo(this, {
                    model: q.model,
                    traceContext: b
                }), {
                    response: q.modelResponse,
                    turnId: f,
                    traceId: w,
                    usage: un,
                    events: A,
                    projection: sn
                }
            } catch (et) {
                Ce = !0;
                let _t = qoe(et, U, "Turn execution failed"),
                    Dt = _t.type === fr.TurnCancelled && this.activeForegroundExecution?.preserveQueueAutoDrainOnCancel === !0,
                    gn = await this.finishTargetTurnAccounting({
                        endedAtMs: Date.now(),
                        inputID: I,
                        startedTarget: z,
                        status: _t.type === fr.TurnCancelled ? "paused" : void 0,
                        traceContext: b
                    });
                gn?.targetID === z?.targetID && (z = gn), _t.type === fr.TurnCancelled && (await this.pauseActiveTargetForCancellation(b), j && await this.fallbackPendingGuidesToQueue({
                    activeTurn: j,
                    events: A,
                    reasonCode: "guide.turnInterrupted",
                    traceContext: b
                })), j && _t.type !== fr.TurnCancelled ? (await this.rebuildProjection()).pendingSteerInputs.length > 0 && (this.queueAutoDrain = !1, this.queueExternalDrainActive = !1) : j && _t.type === fr.TurnCancelled && !Dt && j.pendingInputs.length > 0 && (this.queueAutoDrain = !1, this.queueExternalDrainActive = !1);
                let un = n?.backgroundSubagentResultConsumed === !0 || q?.backgroundSubagentResultConsumed === !0,
                    On = n?.workflowResultConsumed === !0 || q?.workflowResultConsumed === !0;
                throw await Woe(this, {
                    coreError: _t,
                    events: A,
                    durationMs: Date.now() - R.state.startedAt.getTime(),
                    turnPhase: R.state.phase,
                    inputId: n?.inputId,
                    traceContext: b,
                    fallbackMessage: "Turn execution failed",
                    logEvent: "turn.failed",
                    logLabel: "Turn",
                    preserveQueueAutoDrainOnCancel: Dt,
                    backgroundSubagentResultConsumed: un,
                    workflowResultConsumed: On,
                    historyRoundCount: q?.historyRoundCount
                }), await HB(this, {
                    completedAt: Date.now(),
                    error: _t,
                    events: A,
                    startedAt: T,
                    status: _t.type === fr.TurnCancelled ? "cancelled" : "error",
                    traceContext: b,
                    turnId: f,
                    userMessageId: K
                }), _t
            }
        }).then(Fe => (bt.finishCompleted("assistant_message"), Fe), Fe => {
            throw Ce || this.logger?.warn("Turn execution escaped lifecycle handler", {
                ...Cr(b),
                durationMs: Date.now() - T,
                errorMessage: Fe instanceof Error ? Fe.message : String(Fe),
                event: "turn.lifecycle.unhandled_rejection",
                module: "core.runtime",
                phase: ae,
                status: "failed"
            }), I0(Fe, U) ? bt.finishCancelled("abort_signal") : bt.finishFailed("unhandled", "unknown", Fe), Fe
        }), "execute");
    return bt.run(Ye).finally(async () => {
        Ikn(this), $ && clearInterval($), this.releaseTurnStart(f), DCo(this.sessionId, f), this.finishActiveTurn(j), L.dispose();
        try {
            await this.browserControlPort?.turnEnded?.({
                sessionId: this.sessionId,
                turnId: String(f),
                traceContext: b
            })
        } catch (Fe) {
            this.logger?.warn("Browser turn cleanup failed", {
                error: Fe instanceof Error ? Fe.message : String(Fe),
                event: "browser.turn_cleanup.failed",
                turnId: String(f)
            })
        }
    })
}

function jka() {
    let e = IPe(this.now()),
        t = this.lastEmittedLocalDate;
    this.lastEmittedLocalDate = e, !(!t || t === e) && this.messageHistory.addAttachment("date_change", jSo(t, e))
}

function Bka(e, t) {
    if (t?.inputVisibility === "model-only") return;
    let n = svn(e);
    n && this.messageHistory.addAttachment("referenced_session_context", n)
}
var Fka, vEo = Y(() => {
    "use strict";
    ar();
    Dre();
    aa();
    Ap();
    q$();
    U4e();
    avn();
    iEo();
    O4e();
    j2();
    GB();
    aEo();
    Dkn();
    ove();
    rNe();
    txn();
    gEo();
    U_t();
    F_t();
    $ye();
    Fka = 15e3;
    r(_Eo, "executeTurn");
    r(yEo, "executeTurnCommand");
    r(jka, "injectDateChangeReminderIntoMessageHistory");
    r(Bka, "injectReferencedSessionContextReminderIntoMessageHistory")
});
async function SEo(e, t, n) {
    let o = n?.requireIdle === !0 && this.foregroundPromotionLease !== void 0 && this.activeForegroundExecution === void 0 && this.runtimeCommandDrainActive === !1 && this.runtimeCommandQueue.hasPending() === !1 && this.activeTurn === void 0 && this.activeTurnStartReservation === void 0;
    if (this.hasActiveOrQueuedTurnWork() && !o) {
        if (n?.requireIdle === !0 || n?.modelExecution !== void 0) return {
            activeTurnId: this.activeTurn?.turnId,
            kind: "rejected",
            reason: this.activeTurn ? "turn_not_steerable" : "no_active_turn"
        };
        let b = this.activeTurn;
        if (t === void 0 && b?.steerable === !0 && (n?.queueDelivery === "guide" || n?.delivery === "auto" || n?.delivery === "steer_active_turn") && n?.queueDelivery !== "queue") {
            let I = n?.queueDelivery === "guide" ? "guide" : void 0;
            return await this.steerTurn({
                commandKind: n?.commandKind,
                delivery: I,
                expectedTurnId: n?.expectedTurnId,
                input: e,
                inputPresentation: n?.inputPresentation ?? (n?.inputSource ? void 0 : "user_steer"),
                inputId: n?.inputId,
                intent: bEo(n?.intent, I ?? "queue"),
                queryId: n?.queryId,
                toolDisallowlist: n?.toolDisallowlist,
                traceContext: n?.traceContext
            })
        }
        let T = n?.queueDelivery === "guide" && t === void 0 ? "guide" : "queue";
        return await this.enqueueDeferredInput({
            attachments: t,
            commandKind: n?.commandKind,
            delivery: T,
            input: e,
            inputPresentation: n?.inputPresentation ?? (n?.inputSource ? void 0 : "user_steer"),
            inputId: n?.inputId,
            intent: bEo(n?.intent, T),
            queryId: n?.queryId,
            toolDisallowlist: n?.toolDisallowlist,
            traceContext: n?.traceContext
        })
    }
    let a = n?.queryId ?? n?.inputId ?? Noe(),
        l = uA(),
        u = Ew(n?.traceContext ?? this.rootTraceContext, {
            queryId: a,
            sessionId: this.sessionId,
            turnId: l,
            attributes: {
                turnNumber: this.turnNumber
            }
        }),
        f = {
            kind: "regular",
            traceContext: u,
            turnId: l
        };
    this.reserveTurnStart(l, u, "regular");
    let g = n,
        _ = GJ(this, {
            abortSignal: n?.abortSignal,
            onCommandCancelled: r(() => this.releaseTurnStart(l), "onCommandCancelled"),
            createCommand: r(({
                reject: b,
                resolve: w
            }) => ({
                attachments: t,
                createdAt: new Date,
                id: GA(),
                input: e,
                mode: "prompt",
                options: {
                    ...g,
                    queryId: a,
                    traceContext: n?.traceContext ?? this.rootTraceContext
                },
                priority: "next",
                reject: b,
                resolve: w,
                startReservation: f,
                traceContext: u
            }), "createCommand")
        });
    return _.catch(() => {}), {
        completion: _,
        kind: "started",
        turnId: l
    }
}

function bEo(e, t) {
    return e ? {
        ...e,
        admittedDelivery: t
    } : void 0
}
var wEo = Y(() => {
    "use strict";
    aa();
    q$();
    U4e();
    r(SEo, "admitPrompt");
    r(bEo, "admissionIntent")
});
async function kEo(e, t, n, o) {
    if (this.config.compact?.enabled === !1) return;
    jd(n);
    let s = {
            contextWindow: o.model.properties.contextWindow,
            ...this.config.compact,
            maxOutputTokens: KJ({
                modelMaxOutputTokens: o.model.optionSpecs.maxOutputTokens.max
            }),
            modelContextBudgetStrategy: this.config.modelContextBudgetStrategy
        },
        a = Uka(s),
        l = this.config.midConversationSystem?.mode === "force" || o.model.properties.supportsMidConversationSystem,
        u = fwo({
            config: a,
            entries: o.turnRequestState.entries,
            lastAssistantCompletedAtMs: this.lastAssistantCompletedAtMs,
            useMidConversationSystem: l
        });
    if (!u.payload) {
        this.logger?.debug("Microcompact skipped", {
            ...Cr(e),
            event: "compact.micro.skipped",
            estimatedTokenCount: u.decision.estimatedTokenCount,
            modelStepIndex: o.modelStepIndex,
            module: "core.runtime",
            phase: o.phase,
            reason: u.decision.reason,
            thresholdTokens: u.decision.thresholdTokens,
            trigger: u.decision.trigger
        });
        return
    }
    let f = ZJ(u.entries);
    this.messageHistory.replaceMessages(k_t(this.messageHistory.borrowReadOnlyRuntimeEntries(), f)), o.turnRequestState.entries = u.entries;
    let g = {
            ...u.payload,
            traceId: e.traceId,
            turnId: e.turnId
        },
        _ = this.createEvent(ut.MicrocompactBoundary, g, e);
    await this.appendEvent(_, e), t.push(_), this.logger?.info("Microcompact applied", {
        ...Cr(e),
        clearedMessageCount: g.clearedMessageCount,
        event: "compact.micro.applied",
        modelStepIndex: o.modelStepIndex,
        module: "core.runtime",
        phase: o.phase,
        postMicrocompactTokenCount: g.postMicrocompactTokenCount,
        preMicrocompactTokenCount: g.preMicrocompactTokenCount,
        tokensSaved: g.tokensSaved,
        trigger: g.trigger
    })
}

function Uka(e) {
    let t = cNe(e);
    return {
        ...e.microcompact,
        enabled: e.microcompact?.enabled === !0,
        thresholdTokens: e.microcompact?.thresholdTokens ?? pdt(t)
    }
}
var xEo = Y(() => {
    "use strict";
    aa();
    Ap();
    eve();
    j2();
    r(kEo, "microcompactIfNeeded");
    r(Uka, "resolveLocalMicrocompactConfig")
});

function rxn(e) {
    return Jr(fr.ModelContextExceeded, odt, {
        cause: e.cause instanceof Error ? e.cause : void 0,
        context: {
            compactPromptTooLongAttempts: e.attempt,
            preCompactTokenCount: e.preCompactTokenCount
        },
        recoverable: !0,
        retryable: !1
    })
}

function TEo(e) {
    let t = Bye(e.providerMetadata);
    if (!(!Uye(e.finishReason, t) && !qka(e))) return Egt({
        finishReason: e.finishReason,
        rawFinishReason: t
    })
}

function qka(e) {
    return e.finishReason.trim().toLowerCase() === "length" && e.text.trim().length === 0
}
async function e6e(e, t, n, o, s) {
    await e.persistCompactTimeline(n, o);
    let a = e.createEvent(t, n, o);
    await e.appendEvent(a, o), s.push(a)
}

function oxn(e, t, n = {}) {
    return zJ({
        entries: [...e, {
            message: {
                role: "user",
                content: t
            }
        }],
        applyCacheControl: !0,
        skipCacheWrite: !0,
        useMidConversationSystem: n.useMidConversationSystem
    }).messages
}

function IEo(e, t) {
    let n = e.extractToolCallsFromResult(t);
    if (n.length > 0) throw Jr(fr.ModelError, zka, {
        context: {
            behavior: "deny",
            decisionReason: {
                reason: $ka,
                type: "other"
            },
            toolNames: n.map(s => s.name)
        },
        recoverable: !0,
        retryable: !1
    });
    let o = sNe(t.text);
    if (!o) throw Jr(fr.ModelError, "Failed to generate compact summary", {
        recoverable: !0,
        retryable: !0
    });
    return o
}
var zka, $ka, CEo = Y(() => {
    "use strict";
    aa();
    Ap();
    zka = "Tool use is not allowed during compaction", $ka = "compaction agent should only produce text summary";
    r(rxn, "createCompactPromptTooLongError");
    r(TEo, "createCompactContextExceededFinishError");
    r(qka, "isCompactEmptyLengthFinish");
    r(e6e, "persistCompactTimelineEvent");
    r(oxn, "buildCompactSummaryRequestMessages");
    r(IEo, "formatCompactSummaryOrThrow")
});
async function AEo(e) {
    let t = exa(),
        n = crypto.randomUUID(),
        o = {
            ...e.request,
            modelCall: {
                ...e.request.modelCall,
                callCause: e.request.modelCall?.callCause ?? "initial",
                logicalCallId: n
            }
        };
    try {
        for await (let s of Jka(e, o)) Vka(t, s, e);
        if (!t.finish) throw new Error("Compact summary stream ended before finish");
        if (t.providerMessageProtocolObserved && !t.providerResponseStarted || !t.committedContentBlock && !Xka(t)) throw new Error("Compact summary stream ended without a complete provider response")
    } catch (s) {
        return Gka({
            ...e,
            request: o
        }, t, s)
    }
    return Zka(t, t.finish)
}

function Vka(e, t, n) {
    switch (t.type) {
        case "start":
        case "reasoning_start":
        case "tool_input_start":
            return;
        case "compact_stream_boundary":
            Hka(e, t);
            return;
        case "text_start":
            e.currentTextBlockId = t.id, e.pendingTextById.set(t.id, "");
            return;
        case "tool_input_end":
            t6e(e);
            return;
        case "text_delta": {
            e.sawDelta = !0;
            let o = t.id ?? e.currentTextBlockId;
            e.pendingTextById.set(o, (e.pendingTextById.get(o) ?? "") + t.text);
            return
        }
        case "text_end":
            e.committedText += e.pendingTextById.get(t.id) ?? e.pendingTextById.get(void 0) ?? "", e.pendingTextById.delete(t.id), e.pendingTextById.delete(void 0), e.currentTextBlockId === t.id && (e.currentTextBlockId = void 0), t6e(e);
            return;
        case "reasoning_delta":
            e.sawDelta = !0;
            return;
        case "reasoning_end":
            t6e(e);
            return;
        case "tool_input_delta":
            e.sawDelta = !0;
            return;
        case "tool_call": {
            t6e(e);
            let [o] = E4e([t.toolCall], {
                logger: n.logger,
                model: Yka(n.model),
                source: "compactStreamText",
                traceContext: n.request.traceContext
            }) ?? [];
            if (!o || e.toolCallIds.has(o.id)) return;
            e.toolCallIds.add(o.id), e.toolCalls.push(o);
            return
        }
        case "finish":
            e.finish = {
                finishReason: t.finishReason,
                providerMetadata: t.providerMetadata,
                usage: t.usage
            };
            return;
        case "error":
            throw t.error
    }
}

function Hka(e, t) {
    if (t.boundary === "inferred_content_block_stop") {
        t6e(e);
        return
    }
    switch (e.providerMessageProtocolObserved || (e.committedContentBlock = !1), e.providerMessageProtocolObserved = !0, t.boundary) {
        case "provider_stop_reason":
            e.providerStopReasonPresent = t.present;
            return;
        case "provider_response_start":
            e.providerResponseStarted = !0;
            return;
        case "provider_content_block_start":
            if (t.index === null || t.blockType === null) throw new Error("Invalid compact provider content block start");
            e.providerContentBlockTypes.set(t.index, t.blockType);
            return;
        case "provider_content_block_delta": {
            let n = t.index === null ? void 0 : e.providerContentBlockTypes.get(t.index);
            if (n === void 0 || !Qka(n, t.deltaType)) throw new Error("Invalid compact provider content block delta");
            return
        }
        case "provider_content_block_stop":
            if (!e.providerResponseStarted || t.index === null || !e.providerContentBlockTypes.has(t.index)) throw new Error("Invalid compact provider content block stop");
            e.committedContentBlock = !0;
            return
    }
}
async function Gka(e, t, n) {
    if (I0(n, e.request.abortSignal) || l4(n) || Dgt(n) || Kka(n) || t.committedContentBlock) throw n;
    let o = n instanceof Error ? n : zye(n);
    e.logger?.warn("Compact summary stream failed; falling back to non-streaming", {
        ...Cr(e.request.traceContext),
        errorMessage: o.message,
        event: "compact.summary.stream_to_non_stream_fallback",
        model: `${e.model.providerId}/${e.model.modelId}`,
        module: "core.runtime",
        observedPartialOutput: t.sawDelta
    });
    let s = {
        ...e.request,
        modelCall: {
            ...e.request.modelCall,
            attributes: {
                ...e.request.modelCall?.attributes
            },
            callCause: "fallback_replacement",
            logicalCallId: crypto.randomUUID(),
            previousLogicalCallId: e.request.modelCall?.logicalCallId
        }
    };
    return Ly(REo(s), () => e.model.generateText(PEo(s)))
}

function Jka(e, t) {
    return Ly(REo(t), () => e.model.streamText(PEo(t)))
}

function PEo(e) {
    return {
        messages: e.messages,
        tools: e.tools,
        abortSignal: e.abortSignal,
        ...e.maxOutputTokens !== void 0 ? {
            options: {
                maxOutputTokens: e.maxOutputTokens
            }
        } : {}
    }
}

function REo(e) {
    return {
        metadata: e.metadata,
        modelCall: e.modelCall,
        modelRequestSessionType: e.modelRequestSessionType,
        statusSink: e.statusSink,
        traceContext: e.traceContext,
        preserveProviderStreamBoundaries: e.preserveProviderStreamBoundaries,
        refreshRuntimeHeadersBeforeAttempt: e.refreshRuntimeHeadersBeforeAttempt
    }
}

function Kka(e) {
    let t = EEo(e),
        n = EEo(t?.context),
        o = n?.streamFailurePhase;
    return o === "response_body" ? !1 : o === "request_setup" ? n?.httpResponseStatus !== 404 : typeof t?.code == "string" && Wka.has(t.code)
}

function EEo(e) {
    return e !== null && typeof e == "object" ? e : void 0
}

function Zka(e, t) {
    return {
        finishReason: t.finishReason,
        providerMetadata: t.providerMetadata,
        text: e.committedText,
        toolCalls: e.toolCalls.length > 0 ? e.toolCalls : void 0,
        usage: t.usage
    }
}

function Yka(e) {
    return {
        providerId: e.providerId,
        modelId: e.modelId
    }
}

function t6e(e) {
    e.providerMessageProtocolObserved || (e.committedContentBlock = !0)
}

function Xka(e) {
    if (e.providerMessageProtocolObserved) return e.providerStopReasonPresent;
    let t = e.finish?.providerMetadata?.rawFinishReason;
    if (typeof t == "string" && t.trim().length > 0) return !0;
    let n = e.finish?.finishReason.trim().toLowerCase();
    return n !== void 0 && n.length > 0 && n !== "other"
}

function Qka(e, t) {
    switch (t) {
        case "text_delta":
            return e === "text";
        case "input_json_delta":
            return e === "tool_use" || e === "server_tool_use";
        case "signature_delta":
            return e === "thinking";
        case "thinking_delta":
            return e === "thinking" || e === "redacted_thinking";
        case "citations_delta":
        default:
            return !0
    }
}

function exa() {
    return {
        committedText: "",
        committedContentBlock: !1,
        pendingTextById: new Map,
        providerContentBlockTypes: new Map,
        providerMessageProtocolObserved: !1,
        providerResponseStarted: !1,
        providerStopReasonPresent: !1,
        sawDelta: !1,
        toolCallIds: new Set,
        toolCalls: []
    }
}
var Wka, DEo = Y(() => {
    "use strict";
    aa();
    Ap();
    Wka = new Set([Cs.InvalidModelSelection, Cs.ModelConfigMissing, Cs.ProviderNotFound, Cs.ProviderNotConfigured, Cs.ModelNotFound, Cs.InvalidModelRequest]);
    r(AEo, "runCompactSummaryModelRequest");
    r(Vka, "applyCompactSummaryStreamEvent");
    r(Hka, "applyCompactProviderBoundary");
    r(Gka, "handleCompactSummaryStreamFailure");
    r(Jka, "compactModelStream");
    r(PEo, "cleanRequest");
    r(REo, "invocationContext");
    r(Kka, "isCompactSummarySetupFailure");
    r(EEo, "asRecord");
    r(Zka, "compactSummaryStreamResult");
    r(Yka, "modelSelection");
    r(t6e, "commitNormalizedContentBlock");
    r(Xka, "hasCompactSummaryStopReason");
    r(Qka, "isProviderContentBlockDeltaCompatible");
    r(exa, "createCompactSummaryStreamState")
});
async function MEo(e, t, n, o = {}) {
    let s = o.trigger ?? dd.Manual,
        a = o.phase ?? b4e(s),
        l = this.agentTelemetry.compaction({
            trigger: s,
            phase: a,
            maxAttempts: OEo,
            modelMode: this.config.modelStreaming === "off" ? "non_streaming" : "streaming",
            policyContextWindowTokens: o.compactContextTelemetry?.policyContextWindowTokens,
            thresholdTokens: o.compactContextTelemetry?.thresholdTokens,
            tokenSource: o.compactContextTelemetry?.tokenSource,
            traceContext: t
        });
    return o.compactContextTelemetry && l.setInputTokens(o.compactContextTelemetry.inputTokens), l.run(async () => {
        try {
            let u = await nxa.call(this, e, t, n, o);
            return l.setOutputTokens(u.tokenCount), l.finishCompleted(), u
        } catch (u) {
            throw I0(u, o.abortSignal) ? l.finishCancelled("abort_signal") : l.finishFailed("unhandled", "unknown", u), u
        }
    })
}
async function nxa(e, t, n, o = {}) {
    jd(o.abortSignal);
    let s = o.trigger ?? dd.Manual,
        a = o.phase ?? b4e(s),
        l = o.compactReason ?? kgt(s),
        u = o.model ?? WC(this, {
            selection: this.getSessionModelSelection()
        }),
        f = u.optionSpecs.maxOutputTokens.max,
        g = [...o.activeEntries ?? this.messageHistory.borrowReadOnlyRuntimeEntries()],
        _ = this.config.midConversationSystem?.mode === "force" || u.properties.supportsMidConversationSystem,
        b = ixa({
            activeEntries: g,
            initialPromptTooLongCause: o.initialPromptTooLongCause,
            trigger: s,
            useMidConversationSystem: _
        }),
        w = b,
        T = w.preservedEntries,
        I = w.entriesForSummary,
        A = I,
        R = $oe(A),
        L = Oye(g, {
            useMidConversationSystem: _
        }),
        U = s === dd.Auto ? OEo : 1,
        j = 1,
        z = {
            operationId: `cmp_${crypto.randomUUID()}`,
            messageId: ql(),
            partId: Ml(),
            trigger: s,
            phase: a,
            compactReason: l,
            ...o.sourceCommandId ? {
                sourceCommandId: o.sourceCommandId
            } : {},
            startedAt: Date.now(),
            preCompactTokenCount: L
        };
    if (!v4e(A)) {
        let ie = this.buildCompactTimelinePayload(z, {
            endedAt: Date.now(),
            replace: !0,
            status: nh.Skipped
        });
        return await e6e(this, ut.CompactCompleted, ie, t, n), {
            displayText: "Context is up to date; no compression needed",
            entries: g,
            outcome: "skipped",
            tokenCount: L
        }
    }
    let $ = this.buildCompactTimelinePayload(z, {
        ...U > 1 ? {
            attempt: j,
            maxAttempts: U
        } : {},
        status: nh.Started
    });
    await e6e(this, ut.CompactStarted, $, t, n), await this.initializeMcp(t), jd(o.abortSignal);
    let K = this.getTools(u),
        q = K.length > txa ? [] : K;
    for (;;) try {
        let ie = this.latestConversationMessageId,
            ae = Ew(t, {
                attributes: {
                    model: `${u.providerId}/${u.modelId}`,
                    querySource: "compact"
                }
            }),
            Ce = tdt(e),
            pe, ze = 0,
            rt = !1,
            Ae = r(we => {
                let _e = lwn({
                    currentGroupsPreserved: w.groupsPreserved,
                    entries: g,
                    promptTooLongCause: we,
                    trigger: s,
                    useMidConversationSystem: _
                });
                return _e ? (ze += 1, w = _e, T = _e.preservedEntries, A = _e.entriesForSummary, R = $oe(A), !0) : !1
            }, "reselectEntriesAfterPromptTooLong"),
            bt = r(we => {
                if (!oxa(s)) return !1;
                let _e = dwn({
                    attempt: ze,
                    cause: we,
                    entriesForSummary: A,
                    logger: this.logger,
                    traceContext: ae,
                    useMidConversationSystem: _
                });
                return _e ? (ze += 1, A = _e, R = $oe(A), !0) : !1
            }, "truncateEntriesAfterPromptTooLong");
        for (;;) {
            let we = oxn(A, Ce, {
                    useMidConversationSystem: _
                }),
                _e = ZJ(A),
                Pt = _e === A ? we : oxn(_e, Ce, {
                    useMidConversationSystem: _
                }),
                it = Hoe(we, u.properties.inputFormat);
            $gt(this.logger, ae, it.capabilityProjection, {
                event: "compact.request.media_capability_projection",
                message: "Compact request media capability projection",
                model: `${u.providerId}/${u.modelId}`
            }), qgt(this.logger, ae, it.mediaBudgetProjection, {
                event: "compact.request.media_projection",
                message: "Compact request media budget projection"
            });
            let Nn = it.messages,
                Mr = Pt === we ? Nn : Hoe(Pt, u.properties.inputFormat).messages;
            if (rt) {
                let ri = _wn(Nn);
                Nn = ri.messages, Mr = Pt === we ? Nn : _wn(Mr).messages, hwo(this.logger, ae, ri)
            }
            let gr = this.createEvent(ut.ModelRequest, {
                messages: Mr,
                providerId: String(u.providerId),
                modelId: String(u.modelId),
                querySource: "compact",
                toolCount: q.length,
                compactPromptTooLongRetry: ze
            }, ae);
            await this.appendEvent(gr, ae), n.push(gr);
            let no = Date.now(),
                eo = n.length,
                co = sxa(u),
                ro = {
                    abortSignal: o.abortSignal,
                    maxOutputTokens: co,
                    messages: Nn,
                    metadata: Cr(ae),
                    modelRequestSessionType: bye(this.config.taskType),
                    modelCall: {
                        attributes: {
                            compactionOuterAttempt: j,
                            compactionTrigger: s
                        },
                        operation: "context_compaction",
                        operationId: z.operationId
                    },
                    statusSink: this.createModelStatusSink(ae, n),
                    preserveProviderStreamBoundaries: !0,
                    traceContext: ae,
                    tools: q,
                    refreshRuntimeHeadersBeforeAttempt: aT(this, {
                        abortSignal: o.abortSignal,
                        model: u,
                        traceContext: ae
                    })
                };
            try {
                pe = await AEo({
                    logger: this.logger,
                    model: u,
                    request: ro
                })
            } catch (ri) {
                if (await HA(this, {
                        attemptIndex: ze,
                        error: ri,
                        events: n,
                        model: u,
                        networkEventStartIndex: eo,
                        querySource: "compact",
                        startedAt: no,
                        status: I0(ri, o.abortSignal) ? "cancelled" : "error",
                        traceContext: ae
                    }), I0(ri, o.abortSignal)) throw ri;
                if (Dgt(ri) && !rt) {
                    rt = !0, this.logger?.info("Compact summary hit media-size error; retrying with stripped media", {
                        ...Cr(ae),
                        errorMessage: ri instanceof Error ? ri.message : String(ri),
                        event: "compact.request.media_too_large.retry",
                        module: "core.runtime"
                    });
                    continue
                }
                if (l4(ri)) {
                    if (Ae(ri) || bt(ri)) continue;
                    throw rxn({
                        attempt: ze,
                        cause: ri,
                        preCompactTokenCount: L
                    })
                }
                throw ri
            }
            await HA(this, {
                attemptIndex: ze,
                events: n,
                model: u,
                networkEventStartIndex: eo,
                querySource: "compact",
                result: pe,
                startedAt: no,
                status: "completed",
                toolCallCount: this.extractToolCallsFromResult(pe).length,
                traceContext: ae
            });
            let Hi = TEo(pe);
            if (Hi) {
                if (Ae(Hi) || bt(Hi)) continue;
                throw rxn({
                    attempt: ze,
                    cause: Hi,
                    preCompactTokenCount: L
                })
            }
            break
        }
        let Ye = IEo(this, pe),
            Fe = Ye,
            kt = this.fileSystemPort ? await Xfo({
                abortSignal: o.abortSignal,
                fileSystemPort: this.fileSystemPort,
                sessionId: this.sessionId,
                traceContext: ae,
                workspaceRoot: this.workspaceRoot
            }) : void 0,
            St = [...kt ? [kt] : [], ...iwn({
                preservedEntries: T,
                readFileState: this.readFileState
            })],
            ct = this.createEvent(ut.ModelComplete, {
                content: Ye,
                stopReason: pe.finishReason,
                usage: pe.usage,
                querySource: "compact",
                toolCallCount: 0
            }, ae);
        await this.appendEvent(ct, ae), n.push(ct);
        let $e = ql(),
            Bt = ndt(Fe, {
                suppressFollowup: !0
            }),
            Ve = ZJ(T),
            et = this.sessionStore ? await swo({
                sessionStore: this.sessionStore,
                sessionId: this.sessionId,
                groupsPreserved: w.groupsPreserved,
                summaryMessageId: $e
            }) : {
                keptMessageCount: awn(Ve)
            },
            _t = pwo(g, {
                message: {
                    role: "user",
                    content: Bt
                },
                metadata: AG()
            }, {
                postCompactReminderEntries: St,
                preservedEntries: T
            }),
            Dt = Oye(_t, {
                useMidConversationSystem: _
            }),
            gn = sdt(pe.usage),
            un = idt({
                boundaryId: adt(),
                autoCompactThreshold: o.autoCompactThreshold,
                compactReason: l,
                customInstructions: e,
                lastSummarizedMessageId: ie,
                phase: a,
                postCompactTokenCount: gn,
                preCompactTokenCount: L,
                summarizedMessageCount: R.length,
                summaryMessageId: $e,
                traceContext: t,
                trigger: s,
                ...w.groupsPreserved > 0 ? {
                    keptMessageCount: et.keptMessageCount
                } : {},
                preservedSegment: et.preservedSegment,
                truePostCompactTokenCount: Dt,
                willRetriggerNextTurn: o.autoCompactThreshold !== void 0 ? Dt >= o.autoCompactThreshold : void 0
            });
        await this.persistCompactSummary($e, Bt, Fe, un, ae, {
            model: u,
            operationId: z.operationId,
            postCompactReminderEntries: St
        });
        let On = this.createEvent(ut.CompactBoundary, un, t);
        await this.appendEvent(On, t), n.push(On);
        let sn = this.buildCompactTimelinePayload(z, {
            ...U > 1 ? {
                attempt: j,
                maxAttempts: U
            } : {},
            boundaryId: un.boundaryId,
            endedAt: Date.now(),
            postCompactTokenCount: gn,
            replace: !0,
            status: nh.Completed,
            summaryMessageId: $e,
            tailStartMessageId: ie,
            truePostCompactTokenCount: Dt
        });
        await e6e(this, ut.CompactCompleted, sn, t, n), this.latestConversationMessageId = $e;
        let dt = ZJ(_t);
        return this.messageHistory.replaceMessages(o.activeEntries ? k_t(this.messageHistory.borrowReadOnlyRuntimeEntries(), dt) : dt), this.readFileState.clear(), R_t(this), {
            displayText: "Compacted",
            entries: _t,
            outcome: "compacted",
            tokenCount: gn
        }
    } catch (ie) {
        if (s === dd.Auto && j < U && !I0(ie, o.abortSignal) && rxa(ie)) {
            j += 1;
            let ae = this.buildCompactTimelinePayload(z, {
                attempt: j,
                maxAttempts: U,
                reason: xgt(ie),
                status: nh.Retrying
            });
            await e6e(this, ut.CompactStarted, ae, t, n), this.logger?.warn("Auto compact retrying", {
                ...Cr(t),
                attempt: j,
                errorMessage: ie instanceof Error ? ie.message : String(ie),
                event: "compact.auto.retrying",
                maxAttempts: U,
                module: "core.runtime",
                timelineStatus: nh.Retrying
            }), w = b, T = w.preservedEntries, A = I, R = $oe(A);
            continue
        }
        throw await this.finishCompactTimelineFailure({
            abortSignal: o.abortSignal,
            attempt: j,
            error: ie,
            events: n,
            maxAttempts: U > 1 ? U : void 0,
            timeline: z,
            traceContext: t
        }), ie
    }
}

function rxa(e) {
    return Sf(e) ? e.retryable : !0
}

function oxa(e) {
    return e !== dd.Auto && e !== dd.Reactive
}

function ixa(e) {
    let t = y4e({
        entries: e.activeEntries,
        trigger: e.trigger
    });
    return e.initialPromptTooLongCause === void 0 ? t : uwn({
        entries: e.activeEntries,
        promptTooLongCause: e.initialPromptTooLongCause,
        trigger: e.trigger,
        useMidConversationSystem: e.useMidConversationSystem
    }) ?? t
}

function sxa(e) {
    let t = Math.min(KJ({
        modelMaxOutputTokens: e.optionSpecs.maxOutputTokens.max
    }), ldt);
    return Math.min(t, e.optionSpecs.maxOutputTokens.max)
}
var OEo, txa, NEo = Y(() => {
    "use strict";
    aa();
    r4e();
    Ap();
    Fm();
    cwn();
    CEo();
    DEo();
    eve();
    $$();
    GB();
    ove();
    jB();
    j2();
    OEo = 3, txa = 100;
    r(MEo, "compactActiveConversation");
    r(nxa, "compactActiveConversationImpl");
    r(rxa, "isAutoCompactRetryableError");
    r(oxa, "canUseCompactSummaryTruncationFallback");
    r(ixa, "selectInitialCompactEntriesForActiveConversation");
    r(sxa, "capCompactSummaryMaxOutputTokens")
});
async function LEo(e, t, n, o, s, a) {
    let l = [],
        u = Date.now(),
        f = this.beginActiveTurn(n, o, "rewind", !1);
    return Ste(o, async () => {
        this.logger?.info("Rewind command started", {
            ...Cr(o),
            event: "rewind.started",
            inputLength: e.length,
            module: "core.runtime",
            status: "started"
        }), await this.ensureSessionPersisted(e, o);
        let g = this.createEvent(ut.TurnStarted, {
            turnNumber: this.turnNumber,
            input: e,
            inputId: a
        }, o);
        await this.appendEvent(g, o), l.push(g);
        try {
            jd(s);
            let _ = t.action === "status" ? await this.formatRewindStatus() : t.action === "fork" ? (await this.forkWorkspaceFromCheckpoint({
                abortSignal: s,
                targetCheckpointId: t.targetCheckpointId,
                traceContext: o
            })).response : t.action === "message" ? (await this.rewindToMessage({
                abortSignal: s,
                events: l,
                scope: t.scope,
                targetMessageId: t.targetMessageId,
                traceContext: o
            })).response : t.action === "cascade-message" ? (await this.rewindCascadeToMessage({
                abortSignal: s,
                events: l,
                scope: t.scope,
                targetMessageId: t.targetMessageId,
                traceContext: o
            })).response : (await this.rewindWorkspaceToCheckpoint({
                abortSignal: s,
                events: l,
                targetCheckpointId: t.targetCheckpointId,
                traceContext: o
            })).response;
            jd(s);
            let b = $O(l),
                w = this.createEvent(ut.TurnComplete, {
                    response: _,
                    tokenCount: 0,
                    usage: b,
                    toolCallCount: 0,
                    duration: Date.now() - u,
                    resultType: "success",
                    cacheStats: this.messageHistory.getCacheStats(),
                    inputId: a
                }, o);
            await this.appendEvent(w, o), l.push(w), await HB(this, {
                completedAt: Date.now(),
                events: l,
                startedAt: u,
                status: "completed",
                traceContext: o,
                turnId: n
            }), this.turnNumber++;
            let T = await this.rebuildProjection();
            return this.logger?.info("Rewind command completed", {
                ...Cr(o),
                durationMs: Date.now() - u,
                event: "rewind.completed",
                module: "core.runtime",
                status: "completed"
            }), {
                response: _,
                turnId: n,
                traceId: o.traceId,
                usage: b,
                events: l,
                projection: T
            }
        } catch (_) {
            let b = qoe(_, s, "Rewind failed");
            throw await Woe(this, {
                coreError: b,
                events: l,
                durationMs: Date.now() - u,
                turnPhase: "rewind",
                inputId: a,
                traceContext: o,
                fallbackMessage: "Rewind failed",
                logEvent: "rewind.failed",
                logLabel: "Rewind"
            }), await HB(this, {
                completedAt: Date.now(),
                error: b,
                events: l,
                startedAt: u,
                status: b.type === fr.TurnCancelled ? "cancelled" : "error",
                traceContext: o,
                turnId: n
            }), b
        }
    }).finally(() => {
        this.finishActiveTurn(f)
    })
}
async function FEo() {
    let t = (await this.rebuildProjection()).lastCheckpoint;
    if (!t) return "No workspace checkpoint is available yet.";
    let n = t.fileCount === void 0 ? "unknown files" : `${t.fileCount} file${t.fileCount===1?"":"s"}`,
        o = t.coveredByCompact ? `, covered by compact ${t.compactBoundaryId??"boundary"}` : "";
    return `Latest checkpoint: ${t.checkpointId} (${n}${o}). Run /rewind latest to restore workspace files from it.`
}
async function jEo(e) {
    let t = `rewind_${crypto.randomUUID()}`,
        n = await this.eventStore.getEvents(this.sessionId),
        o = Eye(n, e.targetCheckpointId);
    if (!o) return this.finishUnavailableRewind({
        events: e.events,
        reason: e.targetCheckpointId ? "target_checkpoint_not_found" : "no_checkpoint_available",
        rewindId: t,
        targetCheckpointId: e.targetCheckpointId,
        traceContext: e.traceContext
    });
    if (!this.artifactStore || !this.fileSystemPort) return this.finishUnavailableRewind({
        checkpoint: o,
        events: e.events,
        reason: this.artifactStore ? "file_system_port_not_configured" : "artifact_store_not_configured",
        rewindId: t,
        targetCheckpointId: o.checkpointId,
        traceContext: e.traceContext
    });
    let s = gfe({
        checkpointAvailable: !0,
        items: xSo(n),
        scope: Jl.Workspace,
        targetMessageId: o.targetMessageId ?? o.messageId
    });
    if (s.strategy !== Xp.ActiveChain && s.strategy !== Xp.FileOnly) return this.finishUnavailableRewind({
        checkpoint: o,
        evaluation: s,
        events: e.events,
        reason: s.reason,
        rewindId: t,
        targetCheckpointId: o.checkpointId,
        traceContext: e.traceContext
    });
    let a;
    try {
        jd(e.abortSignal);
        let w = await this.artifactStore.readToolResultArtifact({
            uri: o.snapshotRef,
            trace: e.traceContext
        }, {
            signal: e.abortSignal
        });
        a = jR(JSON.parse(w.content))
    } catch (w) {
        if (I0(w, e.abortSignal)) throw VC(w);
        return this.logger?.warn("Workspace rewind checkpoint read failed", {
            ...Cr(e.traceContext),
            errorMessage: w instanceof Error ? w.message : String(w),
            event: "rewind.snapshot.read.failed",
            module: "core.runtime",
            snapshotRef: o.snapshotRef,
            status: "failed"
        }), this.finishUnavailableRewind({
            checkpoint: o,
            evaluation: s,
            events: e.events,
            reason: "checkpoint_snapshot_unavailable",
            rewindId: t,
            targetCheckpointId: o.checkpointId,
            traceContext: e.traceContext
        })
    }
    let l = await this.restoreWorkspaceCheckpointArtifact(a, e.traceContext, e.abortSignal),
        u = ql(),
        f = ygt({
            checkpoint: o,
            evaluation: s,
            restoredFiles: l,
            rewindId: t
        });
    await this.persistSyntheticUserNotice(u, f, e.traceContext), this.messageHistory.addAttachment("rewind_notice", f);
    let g = this.createEvent(ut.RewindTriggered, {
        rewindId: t,
        scope: Jl.Workspace,
        strategy: s.strategy,
        targetMessageId: o.targetMessageId ?? o.messageId,
        targetCheckpointId: o.checkpointId,
        compactBoundaryId: s.compactBoundaryId,
        restoredSnapshotRef: o.snapshotRef,
        createdMessageId: u,
        reason: s.reason
    }, e.traceContext);
    await this.appendEvent(g, e.traceContext), e.events.push(g);
    let _ = `${l.length} file${l.length===1?"":"s"}`,
        b = s.strategy === Xp.FileOnly ? " Workspace files were restored; conversation history stayed at the compacted context." : "";
    return {
        checkpoint: o,
        evaluation: s,
        restoredFiles: l,
        response: `Rewound workspace to checkpoint ${o.checkpointId}: restored ${_}.${b}`,
        rewindId: t,
        strategy: s.strategy
    }
}
async function BEo(e) {
    let t = this.createEvent(ut.RewindTriggered, {
        rewindId: e.rewindId,
        scope: e.scope ?? Jl.Workspace,
        strategy: e.evaluation?.strategy ?? Xp.Unavailable,
        targetMessageId: e.targetMessageId ?? e.checkpoint?.targetMessageId ?? e.checkpoint?.messageId,
        targetCheckpointId: e.targetCheckpointId,
        compactBoundaryId: e.evaluation?.compactBoundaryId,
        restoredSnapshotRef: void 0,
        reason: e.reason
    }, e.traceContext);
    return await this.appendEvent(t, e.traceContext), e.events.push(t), {
        checkpoint: e.checkpoint,
        evaluation: e.evaluation,
        restoredFiles: [],
        response: vgt(e.reason, e.targetCheckpointId, e.targetMessageId),
        rewindId: e.rewindId,
        strategy: e.evaluation?.strategy ?? Xp.Unavailable
    }
}
var n6e = Y(() => {
    "use strict";
    aa();
    Ap();
    GB();
    r(LEo, "executeRewindCommand");
    r(FEo, "formatRewindStatus");
    r(jEo, "rewindWorkspaceToCheckpoint");
    r(BEo, "finishUnavailableRewind")
});
async function zEo(e) {
    if (e.scope === Jl.Workspace) return this.rewindWorkspaceToMessage(e);
    if (e.scope === Jl.Both) {
        let t = await this.rewindWorkspaceToMessage(e);
        if (t.strategy !== Xp.ActiveChain) return t;
        let n = await this.rewindConversationToMessage(e);
        return {
            ...n,
            response: `${t.response}
${n.response}`
        }
    }
    return this.rewindConversationToMessage(e)
}
async function $Eo(e) {
    if (e.scope === Jl.Workspace) return UEo.call(this, e);
    if (e.scope === Jl.Both) {
        let t = await HEo.call(this, e);
        if (t.kind === "unavailable") return JEo.call(this, {
            evaluation: t.evaluation,
            events: e.events,
            reason: t.reason,
            rewindId: t.rewindId,
            targetMessageId: e.targetMessageId,
            traceContext: e.traceContext
        });
        let n = await UEo.call(this, e);
        if (n.strategy !== Xp.ActiveChain) return n;
        let o = await GEo.call(this, {
            abortSignal: e.abortSignal,
            events: e.events,
            plan: t,
            targetMessageId: e.targetMessageId,
            traceContext: e.traceContext
        });
        return {
            ...o,
            response: `${n.response}
${o.response}`
        }
    }
    return this.rewindConversationToMessage(e)
}
async function qEo(e) {
    let t = await this.eventStore.getEvents(this.sessionId),
        n = SSo(t, e.targetMessageId);
    return n ? this.rewindWorkspaceToCheckpoint({
        abortSignal: e.abortSignal,
        events: e.events,
        targetCheckpointId: n.checkpointId,
        traceContext: e.traceContext
    }) : this.finishUnavailableRewind({
        events: e.events,
        reason: "target_checkpoint_not_found",
        rewindId: `rewind_${crypto.randomUUID()}`,
        scope: e.scope,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    })
}
async function UEo(e) {
    let t = await this.eventStore.getEvents(this.sessionId),
        n = await WEo.call(this),
        o = wSo(n, e.targetMessageId),
        s = BJ(t, o.length > 0 ? o : [e.targetMessageId]);
    return s.length === 0 ? this.finishUnavailableRewind({
        events: e.events,
        reason: "target_checkpoint_not_found",
        rewindId: `rewind_${crypto.randomUUID()}`,
        scope: e.scope,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    }) : s.length === 1 ? this.rewindWorkspaceToCheckpoint({
        abortSignal: e.abortSignal,
        events: e.events,
        targetCheckpointId: s[0].checkpointId,
        traceContext: e.traceContext
    }) : axa.call(this, {
        abortSignal: e.abortSignal,
        checkpoints: s,
        events: e.events,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    })
}
async function WEo() {
    if (!this.sessionStore) return [];
    let e = await this.sessionStore.getSession(this.sessionId),
        t = await this.sessionStore.messages({
            sessionID: this.sessionId
        });
    return Uk(t, {
        branchCutAfterMessageId: e?.revert?.branchCutAfterMessageID,
        rewindCreatedMessageId: e?.revert?.createdMessageID,
        rewindKeptMessageIds: e?.revert?.keptMessageIDs,
        rewindTargetMessageId: e?.revert?.targetMessageID
    })
}
async function axa(e) {
    let t = e.checkpoints[0],
        n = e.checkpoints.at(-1),
        o = `rewind_${crypto.randomUUID()}`;
    if (!this.artifactStore || !this.fileSystemPort) return this.finishUnavailableRewind({
        checkpoint: n,
        events: e.events,
        reason: this.artifactStore ? "file_system_port_not_configured" : "artifact_store_not_configured",
        rewindId: o,
        targetCheckpointId: n.checkpointId,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    });
    let s = gfe({
        checkpointAvailable: !0,
        items: ZSn(await WEo.call(this)),
        scope: Jl.Workspace,
        targetMessageId: e.targetMessageId
    });
    if (s.strategy !== Xp.ActiveChain && s.strategy !== Xp.FileOnly) return this.finishUnavailableRewind({
        checkpoint: n,
        evaluation: s,
        events: e.events,
        reason: s.reason,
        rewindId: o,
        targetCheckpointId: n.checkpointId,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    });
    let a = [...e.checkpoints].reverse(),
        l = [];
    for (let I of a) {
        jd(e.abortSignal);
        try {
            l.push({
                checkpoint: I,
                artifact: await cxa.call(this, {
                    checkpoint: I,
                    traceContext: e.traceContext,
                    abortSignal: e.abortSignal
                })
            })
        } catch (A) {
            if (I0(A, e.abortSignal)) throw VC(A);
            return this.logger?.warn("Workspace cascade rewind checkpoint read failed", {
                ...Cr(e.traceContext),
                checkpointId: I.checkpointId,
                errorMessage: A instanceof Error ? A.message : String(A),
                event: "rewind.cascade.snapshot.read.failed",
                module: "core.runtime",
                snapshotRef: I.snapshotRef,
                status: "failed"
            }), this.finishUnavailableRewind({
                checkpoint: I,
                events: e.events,
                reason: "checkpoint_snapshot_unavailable",
                rewindId: o,
                targetCheckpointId: I.checkpointId,
                targetMessageId: e.targetMessageId,
                traceContext: e.traceContext
            })
        }
    }
    let u = [];
    for (let {
            artifact: I
        }
        of l) jd(e.abortSignal), u.push(...await this.restoreWorkspaceCheckpointArtifact(I, e.traceContext, e.abortSignal));
    let f = ql(),
        g = `${ygt({checkpoint:t,evaluation:s,restoredFiles:u,rewindId:o})}
restoredCheckpoints: ${e.checkpoints.length}`;
    await this.persistSyntheticUserNotice(f, g, e.traceContext), this.messageHistory.addAttachment("rewind_notice", g);
    let _ = this.createEvent(ut.RewindTriggered, {
        rewindId: o,
        scope: Jl.Workspace,
        strategy: s.strategy,
        targetMessageId: e.targetMessageId,
        targetCheckpointId: t.checkpointId,
        compactBoundaryId: s.compactBoundaryId,
        restoredSnapshotRef: t.snapshotRef,
        createdMessageId: f,
        reason: s.reason
    }, e.traceContext);
    await this.appendEvent(_, e.traceContext), e.events.push(_);
    let b = `${u.length} file${u.length===1?"":"s"}`,
        w = `${e.checkpoints.length} checkpoint${e.checkpoints.length===1?"":"s"}`,
        T = s.strategy === Xp.FileOnly ? " Workspace files were restored; conversation history stayed at the compacted context." : "";
    return {
        checkpoint: t,
        evaluation: s,
        restoredFiles: u,
        response: `Rewound workspace through ${w} to checkpoint ${t.checkpointId}: restored ${b}.${T}`,
        rewindId: o,
        strategy: s.strategy
    }
}
async function cxa(e) {
    let t = await this.artifactStore.readToolResultArtifact({
        uri: e.checkpoint.snapshotRef,
        trace: e.traceContext
    }, {
        signal: e.abortSignal
    });
    return jR(JSON.parse(t.content))
}
async function VEo(e) {
    let t = await HEo.call(this, {
        targetMessageId: e.targetMessageId,
        remapAssistantAnchor: e.scope === void 0 || e.scope === Jl.Conversation
    });
    return t.kind === "unavailable" ? JEo.call(this, {
        evaluation: t.evaluation,
        events: e.events,
        reason: t.reason,
        rewindId: t.rewindId,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    }) : GEo.call(this, {
        abortSignal: e.abortSignal,
        events: e.events,
        plan: t,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    })
}
async function HEo(e) {
    let t = `rewind_${crypto.randomUUID()}`;
    if (!this.sessionStore) return {
        kind: "unavailable",
        reason: "conversation_rewind_requires_session_store",
        rewindId: t
    };
    let n = await this.sessionStore.getSession(this.sessionId),
        o = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        s = mA(o, {
            branchCutAfterMessageId: n?.revert?.branchCutAfterMessageID,
            rewindCreatedMessageId: n?.revert?.createdMessageID,
            rewindKeptMessageIds: n?.revert?.keptMessageIDs,
            rewindTargetMessageId: n?.revert?.targetMessageID
        }),
        a = s.findIndex(_ => _.info.id === e.targetMessageId),
        l = a;
    if (e.remapAssistantAnchor === !0 && a >= 0 && !ixn(s[a])) {
        l = -1;
        for (let _ = a - 1; _ >= 0; _ -= 1)
            if (ixn(s[_])) {
                l = _;
                break
            }
    }
    let u = l >= 0 ? s[l].info.id : e.targetMessageId,
        f = gfe({
            items: ZSn(s),
            scope: Jl.Conversation,
            targetMessageId: u
        });
    if (f.strategy !== Xp.ActiveChain || l < 0) return {
        evaluation: f,
        kind: "unavailable",
        reason: l < 0 ? a < 0 ? "target_message_not_found" : "target_message_is_not_user_prompt" : f.reason,
        rewindId: t
    };
    let g = s[l];
    return ixn(g) ? {
        evaluation: f,
        branchCutAfterMessageId: o.at(-1).info.id,
        branchGeneration: (n?.revert?.branchGeneration ?? 0) + 1,
        keptMessages: s.slice(0, l),
        kind: "available",
        persistedMessages: o,
        removedTurnIds: s.slice(l).flatMap(_ => _.info.anchor?.turnId ? [String(_.info.anchor.turnId)] : []),
        rewindId: t
    } : {
        evaluation: f,
        kind: "unavailable",
        reason: "target_message_is_not_user_prompt",
        rewindId: t
    }
}
async function GEo(e) {
    jd(e.abortSignal);
    let {
        branchCutAfterMessageId: t,
        branchGeneration: n,
        evaluation: o,
        keptMessages: s,
        persistedMessages: a,
        removedTurnIds: l,
        rewindId: u
    } = e.plan;
    await lxa.call(this, {
        removedTurnIds: l,
        traceContext: e.traceContext
    }), await this.sessionStore.setRevert({
        sessionID: this.sessionId,
        revert: {
            keptMessageIDs: s.map(g => g.info.id),
            branchCutAfterMessageID: t,
            branchGeneration: n,
            messageID: s.at(-1)?.info.id ?? e.targetMessageId,
            kind: "conversation_rewind",
            scope: Jl.Conversation,
            targetMessageID: e.targetMessageId
        }
    }), this.branchGeneration = n, this.runtimeTaskRegistry.setActiveBranchGeneration?.(n), await uxa.call(this, {
        branchCutAfterMessageId: t,
        keptMessageIds: s.map(g => g.info.id),
        persistedMessages: a,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    });
    let f = this.createEvent(ut.RewindTriggered, {
        rewindId: u,
        scope: Jl.Conversation,
        strategy: o.strategy,
        targetMessageId: e.targetMessageId,
        compactBoundaryId: o.compactBoundaryId,
        branchCutAfterMessageId: t,
        branchGeneration: n,
        reason: o.reason
    }, e.traceContext);
    return await this.appendEvent(f, e.traceContext), e.events.push(f), this.logger?.info("Conversation rewind applied", {
        ...Cr(e.traceContext),
        event: "rewind.conversation.completed",
        keptMessageCount: s.length,
        branchGeneration: n,
        module: "core.runtime",
        status: "completed",
        targetMessageId: e.targetMessageId
    }), {
        evaluation: o,
        keptMessageCount: s.length,
        response: `Rewound conversation to before message ${e.targetMessageId}.`,
        rewindId: u,
        strategy: o.strategy,
        targetMessageId: e.targetMessageId
    }
}
async function lxa(e) {
    let t = new Set(e.removedTurnIds);
    if (t.size === 0) return;
    let n = Object.values(this.runtimeTaskRegistry.all()).filter(o => o.branchGeneration === this.branchGeneration && o.turnId !== void 0 && t.has(String(o.turnId)) && o.status === "running");
    for (let o of n)
        if (!(await this.stopBackgroundTask(o.taskId, {
                traceContext: e.traceContext
            })).ok) throw new Error(`rewind background task cancellation failed: ${o.taskId}`)
}
async function JEo(e) {
    return {
        evaluation: e.evaluation,
        keptMessageCount: 0,
        response: vgt(e.reason, void 0, e.targetMessageId),
        rewindId: e.rewindId,
        strategy: e.evaluation?.strategy ?? Xp.Unavailable,
        targetMessageId: e.targetMessageId
    }
}
async function uxa(e) {
    let t = {
        branchCutAfterMessageId: e.branchCutAfterMessageId,
        rewindKeptMessageIds: e.keptMessageIds,
        rewindTargetMessageId: e.targetMessageId
    };
    this.messageHistory.reset(), await Ige({
        artifactStore: this.artifactStore,
        history: this.messageHistory,
        messages: e.persistedMessages,
        ...t
    }), await BNe({
        messages: e.persistedMessages,
        readFileState: this.readFileState,
        workingDirectory: this.workingDirectory,
        workspaceRoot: this.workspaceRoot,
        ...t
    }), d4(this), this.injectTargetStateIntoMessageHistory(await this.readSessionTargetForContext(e.traceContext));
    let n = Uk(e.persistedMessages, t),
        o = Uk(e.persistedMessages, {
            ...t,
            includeCompactPreservedSegment: !1
        }),
        s = [...o].reverse().find(a => a.info.role === "assistant");
    this.latestConversationMessageId = bgt(o), this.latestAssistantMessageId = s?.info.id, this.latestAssistantTurnId = s?.info.anchor?.turnId, this.lastAssistantCompletedAtMs = s && "completed" in s.info.time ? s.info.time.completed : void 0, this.messageHistory.setCacheMiss(), this.mainTurnCacheHitAggregate = M_t({
        activeMessages: n,
        persistedMessages: e.persistedMessages
    }), this.turnNumber = n.filter(a => a.info.role === "user" && !a.info.summary).length, this.currentTurnFileChanges = new Map, this.autoCompactConsecutiveFailures = 0
}

function ixn(e) {
    return e.info.role === "user" && !e.info.summary
}
var r6e = Y(() => {
    "use strict";
    aa();
    Ap();
    $ye();
    J4e();
    r(zEo, "rewindToMessage");
    r($Eo, "rewindCascadeToMessage");
    r(qEo, "rewindWorkspaceToMessage");
    r(UEo, "rewindWorkspaceCascadeToMessage");
    r(WEo, "readActiveMessagesForWorkspaceRewind");
    r(axa, "rewindWorkspaceToCheckpoints");
    r(cxa, "readWorkspaceCheckpointArtifact");
    r(VEo, "rewindConversationToMessage");
    r(HEo, "buildConversationRewindPlan");
    r(GEo, "applyConversationRewindPlan");
    r(lxa, "cancelRemovedBranchBackgroundTasks");
    r(JEo, "finishUnavailableConversationRewind");
    r(uxa, "rebuildConversationDerivedState");
    r(ixn, "isRewindableUserPrompt")
});

function o6e(e, t, n) {
    return {
        ...n,
        runtimeMessage: n?.runtimeMessage ?? g4e(e),
        source: e,
        visibility: t
    }
}

function KEo(e, t, n) {
    let o = {
        ...n
    };
    return delete o.runtimeMessage, {
        ...o,
        source: e,
        visibility: t
    }
}

function ZEo(e, t) {
    if (e === "shared_context") return {
        origin: "import",
        kind: "shared_context",
        source: e,
        uiVisibility: "hidden",
        providerVisibility: "visible",
        transcriptVisibility: "visible"
    };
    let n = t === "model-only";
    return {
        origin: "agent_runtime",
        kind: dxa(e),
        source: e,
        uiVisibility: n ? "hidden" : "visible",
        providerVisibility: n ? "visible" : "hidden",
        transcriptVisibility: n ? "hidden" : "visible"
    }
}

function dxa(e) {
    switch (e) {
        case "background_task":
            return "background_notification";
        case "fork":
            return "fork_notice";
        case "goal_state_change":
            return "system_reminder";
        case "goal-continuation":
            return "system_reminder";
        case "plugin_reference":
            return "system_reminder";
        case "rewind":
            return "rewind_notice";
        case "selection_side_chat":
            return "system_reminder";
        case "subagent":
            return "subagent_notification";
        case "subagent_message":
            return "subagent_notification";
        case "todo_reminder":
            return "todo_reminder";
        case "workflow_launch":
            return "user_prompt";
        case "shared_context":
            return "shared_context"
    }
}
var sxn = Y(() => {
    "use strict";
    Ap();
    r(o6e, "buildSyntheticUserNoticePartMetadata");
    r(KEo, "buildSyntheticUserNoticeMessageMetadata");
    r(ZEo, "buildSyntheticUserNoticeSemantics");
    r(dxa, "syntheticUserNoticeKind")
});

function Jg(e, t = {}) {
    return Jr(fr.InvalidStateTransition, e, {
        context: t,
        recoverable: !0
    })
}

function fxa(e) {
    if (e.info.role === "user") return e.info.modelSelection && Zy(e.info.modelSelection);
    if (!(!e.info.modelId || !e.info.providerId)) return {
        modelId: e.info.modelId,
        providerId: e.info.providerId,
        ...e.info.reasoningLevel ? {
            options: {
                reasoningLevel: e.info.reasoningLevel
            }
        } : {}
    }
}

function mxa(e, t, n) {
    if (n) return Zy(n);
    let o = [...t].reverse().map(fxa).find(Boolean),
        s = e.getSessionModelSelection(),
        a = o ?? s;
    if (!a) return;
    let u = o?.options?.reasoningLevel ?? s?.options?.reasoningLevel;
    return {
        modelId: a.modelId,
        providerId: a.providerId,
        ...u !== void 0 ? {
            options: {
                ...u !== void 0 ? {
                    reasoningLevel: u
                } : {}
            }
        } : {}
    }
}

function hxa(e, t) {
    let n = Date.now();
    return {
        id: `${e}${pxa}`,
        sessionID: e,
        type: LR,
        touchSession: !1,
        time: {
            created: n,
            updated: n
        },
        data: t ? Zy(t) : null
    }
}

function YEo(e, t, n, o = "fork") {
    let s = Date.now();
    return {
        id: n,
        projectID: t.projectID,
        workspaceID: t.workspaceID,
        parentID: e.sessionId,
        traceID: e.rootTraceContext.traceId,
        taskType: o,
        slug: `${w4e(t.slug)}-${o}-${s.toString(36)}`.slice(0, 120),
        directory: t.directory,
        path: t.path,
        title: o === "selection_side_chat" ? "Selection side chat" : `Fork of ${t.title}`,
        titleSource: "generated",
        version: t.version,
        permission: t.permission,
        time: {
            created: s,
            updated: s
        }
    }
}

function gxa(e, t) {
    let n = new Map;
    for (let o of e) {
        let s = o.info.anchor?.goalBoundary;
        s?.kind === "snapshot" && n.set(s.target.targetID, s.target)
    }
    return t.kind === "snapshot" && n.set(t.target.targetID, t.target), [...n.values()]
}

function _xa(e, t) {
    let n = new Set;
    for (let o of e) {
        let s = o.info.anchor?.goalBoundary;
        if (s?.kind === "snapshot")
            for (let a of s.verificationEntryIds) n.add(a)
    }
    if (t.kind === "snapshot")
        for (let o of t.verificationEntryIds) n.add(o);
    return n
}

function yxa(e) {
    let t = new Map,
        n = new Map,
        o = new Map,
        s = new Map,
        a = new Map,
        l = new Map,
        u = new Map,
        f = new Map,
        g = ql(),
        _ = {
            hiddenMessageId: g,
            hiddenPartId: Ml(),
            messageId: ql(),
            partId: Ml(),
            turnId: uA(),
            productTurnId: String(g)
        },
        b = r(T => {
            typeof T == "string" && T && !o.has(T) && o.set(T, String(uA()))
        }, "addTurn"),
        w = r(T => {
            if (typeof T != "string" || !T || s.has(T)) return;
            let I = t.get(T);
            s.set(T, String(I ?? uA()))
        }, "addProductTurn");
    for (let T of e.messages) {
        t.set(T.info.id, ql());
        for (let I of T.parts)
            if (n.set(I.id, Ml()), I.type === "tool" && (f.set(I.callID, String(ePe())), I.state.status === "completed"))
                for (let A of I.state.attachments ?? []) n.set(A.id, Ml())
    }
    for (let T of e.messages) {
        b(T.info.anchor?.turnId), w(T.info.anchor?.productTurnId);
        for (let I of T.parts) I.type === "timeline" && (b(I.anchorTurnId), I.timelineType === "goal_verification" && (a.has(I.targetId) || a.set(I.targetId, `fork_target_${(0,eK.randomUUID)()}`), u.has(I.verificationId) || u.set(I.verificationId, `fork_verify_${(0,eK.randomUUID)()}`))), I.type === "compaction" && b(I.compactBoundary?.turnId)
    }
    for (let T of e.goalSnapshots) a.has(T.targetID) || a.set(T.targetID, `fork_target_${(0,eK.randomUUID)()}`);
    for (let T of e.entries) {
        l.set(T.id, `fork_goal_verify_${(0,eK.randomUUID)()}`);
        let I = cve(cve(T.data).payload);
        typeof I.verificationId == "string" && !u.has(I.verificationId) && u.set(I.verificationId, `fork_verify_${(0,eK.randomUUID)()}`), b(I.anchorTurnId)
    }
    return {
        parentSessionId: e.parentSessionId,
        childSessionId: e.childSessionId,
        messageIds: t,
        partIds: n,
        turnIds: o,
        productTurnIds: s,
        targetIds: a,
        verifierEntryIds: l,
        verificationIds: u,
        toolCallIds: f,
        notice: _
    }
}

function ave(e, t, n) {
    let o = e.get(t);
    if (!o) throw Jg(`Stable fork cannot remap ${n}`, {
        id: t
    });
    return o
}

function vxa(e, t) {
    return {
        ...e,
        sessionID: t.childSessionId,
        targetID: ave(t.targetIds, e.targetID, "goal target"),
        activeInputId: null,
        activeRunStartedAtMs: null,
        activeRunLastSeenAtMs: null
    }
}

function bxa(e, t) {
    let n = cve(e.data),
        o = cve(n.payload);
    if (typeof o.targetId != "string" || typeof o.verificationId != "string") throw Jg("Stable fork verifier entry has invalid identity", {
        entryId: e.id
    });
    let s = {
        ...o,
        targetId: ave(t.targetIds, o.targetId, "verifier target"),
        verificationId: ave(t.verificationIds, o.verificationId, "verification id")
    };
    typeof o.anchorAssistantMessageId == "string" && (s.anchorAssistantMessageId = ave(t.messageIds, o.anchorAssistantMessageId, "verifier assistant anchor")), typeof o.anchorTurnId == "string" && (s.anchorTurnId = ave(t.turnIds, o.anchorTurnId, "verifier turn anchor"));
    let a = ave(t.verifierEntryIds, e.id, "verifier entry"),
        l = s;
    return {
        entry: {
            ...e,
            id: a,
            sessionID: t.childSessionId,
            data: {
                ...n,
                eventId: (0, eK.randomUUID)(),
                payload: l,
                forkOrigin: {
                    entryId: e.id,
                    eventId: n.eventId,
                    verificationId: o.verificationId
                }
            }
        },
        payload: l
    }
}

function Sxa(e, t) {
    let n = Date.now(),
        {
            hiddenMessageId: o,
            hiddenPartId: s,
            messageId: a,
            partId: l,
            turnId: u,
            productTurnId: f
        } = t.identities.notice,
        g = t.identities.messageIds.get(t.targetMessageId) ?? o,
        _ = {
            turnId: u,
            productTurnId: f,
            orderedMessageIds: [o, a],
            boundaryMessageId: a
        },
        b = {
            parentSessionId: e.sessionId,
            targetMessageId: t.targetMessageId
        },
        w = e.getSessionModelSelection(),
        T = t.modelSelection ?? w;
    return [{
        info: {
            id: o,
            sessionID: t.identities.childSessionId,
            role: "user",
            time: {
                created: n
            },
            agent: e.config.agentName ?? "zcode-agent",
            modelSelection: T && Zy(T),
            synthetic: !0,
            source: "fork",
            visibility: "model-only",
            semantics: {
                origin: "system",
                kind: "fork_notice",
                uiVisibility: "hidden",
                providerVisibility: "visible",
                transcriptVisibility: "hidden"
            },
            anchor: _,
            metadata: {
                forkOrigin: b
            }
        },
        parts: [{
            id: s,
            sessionID: t.identities.childSessionId,
            messageID: o,
            type: "text",
            text: YSn(b),
            synthetic: !0,
            time: {
                start: n,
                end: n
            },
            metadata: o6e("fork", "model-only", {
                forkOrigin: b,
                runtimeMessage: D1("conversation_fork")
            })
        }]
    }, {
        info: {
            id: a,
            sessionID: t.identities.childSessionId,
            role: "assistant",
            time: {
                created: n,
                completed: n
            },
            parentID: o,
            modelId: T && LV(T.modelId),
            providerId: T && NV(T.providerId),
            ...T?.options?.reasoningLevel ? {
                reasoningLevel: T.options.reasoningLevel
            } : {},
            ...t.executionState ?? VA(e),
            agent: e.config.agentName ?? "zcode-agent",
            path: {
                cwd: e.workingDirectory,
                root: e.workspaceRoot
            },
            cost: 0,
            tokens: $J(),
            finish: "completed",
            semantics: {
                origin: "system",
                kind: "timeline_event",
                uiVisibility: "visible",
                providerVisibility: "hidden",
                transcriptVisibility: "visible"
            },
            anchor: _,
            metadata: {
                forkOrigin: b
            }
        },
        parts: [{
            id: l,
            sessionID: t.identities.childSessionId,
            messageID: a,
            type: "timeline",
            timelineType: "session_fork",
            display: "separator",
            status: "completed",
            anchorMessageId: g,
            anchorTurnId: u,
            sourceCommandId: t.sourceCommandId,
            parentSessionId: e.sessionId,
            targetMessageId: t.targetMessageId,
            restoredFileCount: 0,
            time: {
                start: n,
                end: n
            }
        }]
    }]
}

function kxa(e, t, n) {
    let o = Date.now(),
        s = ql(),
        a = uA();
    return {
        info: {
            id: s,
            sessionID: t,
            role: "user",
            time: {
                created: o
            },
            agent: e.config.agentName ?? "zcode-agent",
            modelSelection: n && Zy(n),
            synthetic: !0,
            source: "selection_side_chat",
            visibility: "model-only",
            semantics: {
                origin: "system",
                kind: "system_reminder",
                source: "selection_side_chat",
                uiVisibility: "hidden",
                providerVisibility: "visible",
                transcriptVisibility: "hidden"
            },
            anchor: {
                turnId: a,
                productTurnId: String(s),
                orderedMessageIds: [s],
                boundaryMessageId: s,
                origin: "synthetic"
            }
        },
        parts: [{
            id: Ml(),
            sessionID: t,
            messageID: s,
            type: "text",
            text: wxa,
            synthetic: !0,
            time: {
                start: o,
                end: o
            },
            metadata: o6e("selection_side_chat", "model-only", void 0)
        }]
    }
}

function xxa(e) {
    let t = e.info.anchor;
    if (!t?.goalBoundary) return e;
    let n = {
        ...t
    };
    return delete n.goalBoundary, {
        ...e,
        info: {
            ...e.info,
            anchor: n
        }
    }
}
async function axn(e, t) {
    let n = e.sessionStore;
    if (!n?.commitForkBundle) throw Jg("Stable fork requires commitForkBundle");
    let o = t.forkedSessionId ?? Ov(),
        s = t.kind ?? "fork",
        a = VA(e),
        l = [...t.messages].reverse().find(q => q.info.role === "assistant")?.info,
        u = s === "selection_side_chat" || l?.role !== "assistant" ? a : zx(l),
        f = s === "selection_side_chat" ? t.messages.map(xxa) : t.messages,
        g = mxa(e, f, t.modelSelection),
        _ = s === "selection_side_chat" ? new Set : _xa(f, t.goalBoundary),
        b = _.size ? await n.sessionEntries?.({
            sessionID: e.sessionId,
            type: dA
        }) : [];
    if (_.size && !b) throw Jg("Stable fork verifier boundary cannot be loaded");
    let w = new Map((b ?? []).map(q => [q.id, q])),
        T = [..._].map(q => {
            let ie = w.get(q);
            if (!ie) throw Jg("Stable fork verifier boundary references missing entries", {
                verificationEntryId: q
            });
            return ie
        }),
        I = s === "selection_side_chat" ? [] : gxa(f, t.goalBoundary),
        A = yxa({
            childSessionId: o,
            entries: T,
            goalSnapshots: I,
            messages: f,
            parentSessionId: e.sessionId
        }),
        R = f.map(q => {
            let ie = A.messageIds.get(q.info.id),
                ae = {
                    info: Boe(q.info, {
                        forkedSessionId: o,
                        messageIdMap: A.messageIds,
                        nextMessageId: ie,
                        turnIdMap: A.turnIds,
                        productTurnIdMap: A.productTurnIds,
                        targetIdMap: A.targetIds,
                        verificationEntryIdMap: A.verifierEntryIds,
                        strictLocalReferences: !0
                    }),
                    parts: q.parts.map(Ce => Uoe(Ce, {
                        forkedSessionId: o,
                        nextMessageId: ie,
                        nextPartId: A.partIds.get(Ce.id),
                        partIdMap: A.partIds,
                        messageIdMap: A.messageIds,
                        turnIdMap: A.turnIds,
                        targetIdMap: A.targetIds,
                        verificationIdMap: A.verificationIds,
                        toolCallIdMap: A.toolCallIds,
                        strictLocalReferences: !0
                    }))
                };
            return s !== "selection_side_chat" ? ae : {
                ...ae,
                info: {
                    ...ae.info,
                    visibility: "model-only",
                    semantics: {
                        origin: ae.info.semantics?.origin ?? "migration",
                        kind: ae.info.semantics?.kind ?? "system_reminder",
                        ...ae.info.semantics?.source ? {
                            source: ae.info.semantics.source
                        } : {},
                        uiVisibility: "hidden",
                        providerVisibility: "visible",
                        transcriptVisibility: "hidden"
                    }
                }
            }
        }),
        L = T.map(q => bxa(q, A)),
        U = hxa(o, g);
    s === "selection_side_chat" ? R.push(kxa(e, o, g)) : R.push(...Sxa(e, {
        identities: A,
        modelSelection: g,
        executionState: u,
        sourceCommandId: t.sourceCommandId,
        targetMessageId: t.targetMessageId
    }));
    let j = t.commandFact ?? {
            parentSessionId: String(e.sessionId),
            sourceCommandId: t.sourceCommandId,
            ack: {
                commandId: t.sourceCommandId,
                status: "accepted",
                revisionAtDecision: t.revisionAtDecision ?? 0,
                result: {
                    type: s === "selection_side_chat" ? "createSelectionSideSession" : "forkAssistant",
                    sessionId: String(o)
                }
            },
            metadata: {
                forkOrigin: {
                    parentSessionId: String(e.sessionId),
                    targetMessageId: String(t.targetMessageId)
                },
                ...t.target ? {
                    forkTarget: t.target
                } : {}
            }
        },
        z = s !== "selection_side_chat" && t.goalBoundary.kind === "snapshot" ? {
            source: vxa(t.goalBoundary.target, A),
            status: t.goalBoundary.target.status
        } : void 0,
        K = (await n.commitForkBundle({
            child: YEo(e, t.parentSession, o, s),
            messages: R,
            copySources: {
                messages: Object.fromEntries([...A.messageIds].map(([q, ie]) => [ie, q])),
                parts: Object.fromEntries([...A.partIds].map(([q, ie]) => [ie, q]))
            },
            entries: [...L.map(q => q.entry), U, FJ(o, u)],
            ...z ? {
                goal: z
            } : {},
            ...t.initialInput ? {
                initialInput: t.initialInput
            } : {},
            commandFact: j
        })).id;
    if (s !== "selection_side_chat") {
        let q = e.createEvent(ut.SessionForked, {
            originalSessionId: e.sessionId,
            forkedSessionId: K,
            forkPoint: t.messages.length,
            targetMessageId: t.targetMessageId,
            restoredFileCount: 0,
            strategy: Xp.ForkRequired
        }, t.traceContext);
        try {
            await e.appendEvent(q, t.traceContext)
        } catch (ie) {
            e.logger?.warn("Parent fork event append failed after durable fork commit", {
                ...Cr(t.traceContext),
                error: ie instanceof Error ? ie.message : String(ie),
                event: "session.fork.parent_event.failed_after_commit",
                forkedSessionId: K,
                module: "core.runtime",
                parentSessionId: e.sessionId
            })
        }
    }
    return {
        copiedMessageCount: t.messages.length,
        forkedSessionId: K,
        parentSessionId: e.sessionId,
        targetMessageId: t.targetMessageId,
        restoredFiles: [],
        response: s === "selection_side_chat" ? `Created selection side chat ${K}.` : `Forked session ${K} from message ${t.targetMessageId}: copied ${t.messages.length} messages.`
    }
}
async function XEo(e) {
    if (!e.sourceCommandId.trim()) throw Jg("Selection side chat sourceCommandId must not be empty");
    if (!this.sessionStore?.commitForkBundle) throw Jg("Selection side chat requires commitForkBundle");
    let t = await this.sessionStore.getSession(this.sessionId);
    if (!t) throw Jg(`Session not found: ${this.sessionId}`);
    let n = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        o = tK(n, t),
        s = Txa(o, this.activeTurn?.turnId),
        a = s.at(-1)?.info.id ?? ql();
    return await axn(this, {
        modelSelection: e.modelSelection,
        goalBoundary: {
            kind: "none"
        },
        kind: "selection_side_chat",
        messages: s,
        parentSession: t,
        revisionAtDecision: e.revisionAtDecision,
        sourceCommandId: e.sourceCommandId,
        targetMessageId: a,
        traceContext: e.traceContext ?? this.rootTraceContext
    })
}

function Txa(e, t) {
    if (!t) return [...e];
    let n = e.findIndex(s => s.info.role === "user" && s.info.anchor?.turnId === t && s.info.anchor.origin === "realUser");
    if (n >= 0) return e.slice(0, n + 1);
    let o = e.findIndex(s => s.info.anchor?.turnId === t);
    return o >= 0 ? e.slice(0, o) : [...e]
}
async function i6e(e, t) {
    if (!e.sessionStore) throw Jr(fr.ConfigurationError, "Fork requires a session adapter.", {
        context: {
            hasSessionStore: !1
        },
        recoverable: !0
    });
    let n = t.forkedSessionId ?? Ov(),
        o = YEo(e, t.parentSession, n);
    if (t.stableForkMetadata) {
        if (!e.sessionStore.createForkedSessionWithMetadata) throw Jg("Stable fork requires atomic child metadata persistence", {
            forkedSessionId: n,
            sourceCommandId: t.stableForkMetadata.sourceCommandId
        });
        return (await e.sessionStore.createForkedSessionWithMetadata(o, t.stableForkMetadata)).id
    } else await e.sessionStore.createSession(o);
    return await e.sessionStore.saveSessionEntry?.(FJ(n, VA(e))), n
}
async function QEo(e) {
    if (!this.sessionStore) throw Jr(fr.ConfigurationError, "Fork requires a session adapter.", {
        context: {
            hasSessionStore: !1
        },
        recoverable: !0
    });
    let t = await this.sessionStore.getSession(this.sessionId);
    if (!t) throw Jr(fr.SessionNotFound, `Session not found: ${this.sessionId}`, {
        context: {
            sessionId: this.sessionId
        },
        recoverable: !0
    });
    let n = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        o = tK(n, t),
        s = o.findIndex(T => T.info.id === e.targetMessageId);
    if (s < 0) throw Jg(`Fork target message not found in session store: ${e.targetMessageId}`, {
        messageId: e.targetMessageId
    });
    let a = a6e(o, s, !0),
        l = e.beforeTarget ? nAo(o, e.targetMessageId) : c6e(n, o, s, a),
        u = await i6e(this, {
            forkedSessionId: e.forkedSessionId,
            parentSession: t
        }),
        {
            copiedMessageCount: f,
            messageIdMap: g
        } = await this.copySessionMessagesForFork({
            forkedSessionId: u,
            messages: l,
            traceContext: e.traceContext
        });
    await s6e.call(this, {
        forkedSessionId: u,
        messageIdMap: g,
        traceContext: e.traceContext
    });
    let _ = g.get(e.targetMessageId),
        b = Date.now();
    await this.persistAssistantTimelinePartForSession({
        sessionId: u,
        messageID: ql(),
        partID: Ml(`fork_${String(this.sessionId)}_${String(e.targetMessageId)}_timeline`),
        parentID: _,
        created: b,
        completed: b,
        finish: "completed",
        timeline: {
            timelineType: "session_fork",
            display: "separator",
            status: "completed",
            anchorMessageId: _,
            parentSessionId: this.sessionId,
            targetMessageId: e.targetMessageId,
            restoredFileCount: 0,
            time: {
                start: b,
                end: b
            }
        },
        traceContext: e.traceContext
    }), await this.persistSyntheticUserNoticeForSession({
        messageID: ql(),
        sessionId: u,
        source: "fork",
        text: YSn({
            parentSessionId: this.sessionId,
            targetMessageId: e.targetMessageId
        }),
        metadata: {
            forkContext: {
                kind: "session_fork",
                parentSessionId: this.sessionId,
                targetMessageId: e.targetMessageId,
                restoredFileCount: 0
            }
        },
        traceContext: e.traceContext
    }), this.logger?.debug("Conversation fork notice persisted", {
        ...Cr(e.traceContext),
        event: "session.fork.notice.persisted",
        forkedSessionId: u,
        module: "core.runtime",
        parentSessionId: this.sessionId,
        status: "completed",
        targetMessageId: e.targetMessageId
    });
    let w = this.createEvent(ut.SessionForked, {
        originalSessionId: this.sessionId,
        forkedSessionId: u,
        forkPoint: a,
        targetMessageId: e.targetMessageId,
        restoredFileCount: 0,
        strategy: Xp.ForkRequired
    }, e.traceContext);
    return await this.appendEvent(w, e.traceContext), {
        copiedMessageCount: f,
        forkedSessionId: u,
        parentSessionId: this.sessionId,
        targetMessageId: e.targetMessageId,
        restoredFiles: [],
        response: `Forked session ${u} from message ${e.targetMessageId}: copied ${f} messages.`
    }
}
async function eAo(e) {
    if (!e.sourceCommandId.trim()) throw Jg("Stable fork sourceCommandId must not be empty");
    if (!this.sessionStore?.commitForkBundle) throw Jg("Stable fork requires commitForkBundle");
    let t = await this.sessionStore.getSession(this.sessionId);
    if (!t) throw Jg(`Session not found: ${this.sessionId}`);
    let n = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        o = tK(n, t),
        s = Ixa(o, e.target);
    return await axn(this, {
        modelSelection: e.modelSelection,
        forkedSessionId: e.forkedSessionId,
        goalBoundary: e.goalBoundary,
        messages: s,
        parentSession: t,
        revisionAtDecision: e.revisionAtDecision,
        sourceCommandId: e.sourceCommandId,
        target: e.target,
        targetMessageId: e.target.boundaryMessageId,
        traceContext: e.traceContext ?? this.rootTraceContext
    })
}
async function tAo(e) {
    if (!this.sessionStore?.commitForkBundle) throw Jg("Fork requires a session adapter");
    let t = await this.sessionStore.getSession(this.sessionId);
    if (!t) throw Jg(`Session not found: ${this.sessionId}`);
    let n = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        o = tK(n, t),
        s = nAo(o, e.targetMessageId);
    return await axn(this, {
        commandFact: e.commandFact,
        modelSelection: e.modelSelection,
        forkedSessionId: e.forkedSessionId,
        goalBoundary: e.goalBoundary,
        initialInput: e.initialInput,
        messages: s,
        parentSession: t,
        sourceCommandId: e.sourceCommandId,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext ?? this.rootTraceContext
    })
}

function nAo(e, t) {
    let n = e.findIndex(s => s.info.id === t);
    if (n < 0) throw Jg(`Fork target input not found: ${t}`, {
        targetMessageId: t
    });
    if (e[n]?.info.role !== "user") throw Jg("Fork-before-input target is not a user message", {
        targetMessageId: t
    });
    return e.slice(0, n)
}

function Ixa(e, t) {
    if (t.orderedMessageIds.length === 0 || t.orderedMessageIds.at(-1) !== t.boundaryMessageId) throw Jg("Stable fork target has an invalid boundary", {
        boundaryMessageId: t.boundaryMessageId
    });
    if (new Set(t.orderedMessageIds).size !== t.orderedMessageIds.length) throw Jg("Stable fork target contains duplicate message ids");
    let o = new Map(e.map((l, u) => [String(l.info.id), u])).get(t.orderedMessageIds[0]);
    if (o === void 0) throw Jg("Stable fork target is not an active transcript segment", {
        messageId: t.orderedMessageIds[0]
    });
    for (let [l, u] of t.orderedMessageIds.entries()) {
        let f = e[o + l];
        if (String(f?.info.id) !== u) throw Jg("Stable fork target is not a contiguous active transcript segment", {
            messageId: u
        })
    }
    let s = e.slice(o, o + t.orderedMessageIds.length),
        a = s.at(-1);
    if (a?.info.role !== "assistant" || a.info.error) throw Jg("Stable fork boundary is not a completed assistant message", {
        boundaryMessageId: t.boundaryMessageId
    });
    return [...e.slice(0, o), ...s]
}
async function s6e(e) {
    let t = this.sessionStore;
    if (!t?.cloneTargetForFork || e.goalBoundary?.kind === "none") return;
    let n = e.goalBoundary?.kind === "snapshot" ? e.goalBoundary.target : await t.readTarget({
        sessionID: this.sessionId
    });
    if (!n) return;
    if (e.goalBoundary?.kind === "snapshot" && String(n.sessionID) !== String(this.sessionId)) throw Jg("Stable fork goal snapshot belongs to another session", {
        goalSessionId: n.sessionID,
        parentSessionId: this.sessionId
    });
    let o = await Cxa(t, {
            forkedSessionId: e.forkedSessionId,
            messageIdMap: e.messageIdMap,
            parentSessionId: this.sessionId,
            parentTargetId: n.targetID,
            ...e.goalBoundary?.kind === "snapshot" ? {
                verificationEntryIds: new Set(e.goalBoundary.verificationEntryIds)
            } : {}
        }),
        s = e.goalBoundary?.kind === "snapshot" ? n.status : Axa(n.status, o);
    await t.cloneTargetForFork({
        sessionID: e.forkedSessionId,
        source: n,
        status: s
    }), this.logger?.debug("Forked session goal state copied", {
        ...Cr(e.traceContext),
        copiedGoalVerificationCount: o.length,
        event: "session.fork.goal_state.copied",
        forkedSessionId: e.forkedSessionId,
        module: "core.runtime",
        parentSessionId: this.sessionId,
        targetId: n.targetID
    })
}
async function Cxa(e, t) {
    if (!e.sessionEntries || !e.saveSessionEntry) {
        if (t.verificationEntryIds?.size) throw Jg("Stable fork verifier boundary cannot be loaded", {
            verificationEntryIds: [...t.verificationEntryIds]
        });
        return []
    }
    let n = await e.sessionEntries({
            sessionID: t.parentSessionId,
            type: dA
        }),
        o = [],
        s = t.verificationEntryIds ? new Set(t.verificationEntryIds) : null;
    for (let a of n) {
        if (t.verificationEntryIds && !t.verificationEntryIds.has(a.id)) continue;
        s?.delete(a.id);
        let l = Exa(a, t);
        if (!l) {
            if (t.verificationEntryIds) throw Jg("Stable fork verifier is outside the fixed transcript cut", {
                verificationEntryId: a.id
            });
            continue
        }
        await e.saveSessionEntry(l.entry), o.push(l.payload)
    }
    if (s?.size) throw Jg("Stable fork verifier boundary references missing entries", {
        verificationEntryIds: [...s]
    });
    return o
}

function Exa(e, t) {
    let n = cve(e.data),
        o = cve(n.payload);
    if (o.targetId !== t.parentTargetId) return null;
    let s = typeof o.anchorAssistantMessageId == "string" ? o.anchorAssistantMessageId : null;
    if (s && !t.messageIdMap.has(s)) return null;
    let a = s ? t.messageIdMap.get(s) : void 0,
        l = {
            ...o
        };
    a && (l.anchorAssistantMessageId = a), typeof o.anchorTurnId == "string" && (delete l.anchorTurnId, l.originAnchorTurnId = o.anchorTurnId);
    let u = l,
        f = (0, eK.randomUUID)();
    return {
        entry: {
            ...e,
            id: `fork_goal_verify_${f}`,
            sessionID: t.forkedSessionId,
            data: {
                ...n,
                eventId: f,
                payload: u
            }
        },
        payload: u
    }
}

function Axa(e, t) {
    return [...t].reverse().find(o => o.status === "completed" && o.verification)?.verification?.passed === !0 ? "complete" : e === "complete" ? "active" : e
}

function tK(e, t) {
    return Pxa(e, {
        branchCutAfterMessageId: t.revert?.branchCutAfterMessageID,
        rewindCreatedMessageId: t.revert?.createdMessageID,
        rewindKeptMessageIds: t.revert?.keptMessageIDs,
        rewindTargetMessageId: t.revert?.targetMessageID
    })
}

function cve(e) {
    return e && typeof e == "object" && !Array.isArray(e) ? e : {}
}

function Pxa(e, t = {}) {
    return mA(e, t)
}

function a6e(e, t, n) {
    let o = e[t];
    if (!n || o?.info.role !== "assistant") return t + 1;
    let s = o.info.parentID,
        a = t + 1;
    for (let l = t + 1; l < e.length; l++) {
        let u = e[l];
        if (u.info.role !== "assistant" || u.info.parentID !== s) break;
        a = l + 1
    }
    return a
}

function rAo(e) {
    return e.parts.some(t => t.type === "compaction" && (!!t.compactBoundary || !t.timelineStatus))
}

function Rxa(e) {
    return e.info.role === "user" && e.info.synthetic !== !0 && e.info.visibility !== "model-only" && !e.info.source && !e.info.summary && !rAo(e)
}

function Dxa(e, t, n) {
    if (n?.info.role !== "assistant") return;
    let o = n.info.parentID;
    if (!o || t.some(a => a.info.id === o) || !t.some(rAo)) return;
    let s = e.find(a => a.info.id === o);
    return s && Rxa(s) ? s : void 0
}

function c6e(e, t, n, o) {
    let s = t.slice(0, o),
        a = Dxa(e, s, t[n]);
    return a ? [a, ...s] : s
}
var eK, pxa, wxa, $_t = Y(() => {
    "use strict";
    eK = require("node:crypto");
    gs();
    jJ();
    ar();
    Fm();
    aa();
    Ap();
    sxn();
    z$();
    r(Jg, "stableForkError");
    pxa = ":runtime-model-selection";
    r(fxa, "modelSelectionFromMessage");
    r(mxa, "resolveForkModelSelection");
    r(hxa, "buildModelSelectionEntry");
    r(YEo, "buildForkedSessionInput");
    r(gxa, "collectForkGoalSnapshots");
    r(_xa, "collectVerifierEntryIds");
    r(yxa, "createForkIdentityMap");
    r(ave, "mapForkIdentity");
    r(vxa, "remapGoalForFork");
    r(bxa, "cloneVerifierEntryForAtomicFork");
    r(Sxa, "buildAtomicForkNotice");
    wxa = ["The preceding conversation was inherited from the parent task for reference only.", "Do not continue the parent's active work automatically; answer only new questions sent in this side chat.", "Modify the workspace only when the user explicitly asks you to do so in this side chat."].join(" ");
    r(kxa, "buildSelectionSideChatBoundary");
    r(xxa, "withoutSelectionSideChatGoalBoundary");
    r(axn, "commitAtomicConversationFork");
    r(XEo, "createSelectionSideConversation");
    r(Txa, "selectionSideChatHistoryMessages");
    r(i6e, "createForkedSession");
    r(QEo, "forkConversationFromMessage");
    r(eAo, "forkStableConversationAtMessage");
    r(tAo, "forkConversationBeforeMessage");
    r(nAo, "conversationHistoryBeforeInput");
    r(Ixa, "stableForkHistoryMessages");
    r(s6e, "copyGoalStateForFork");
    r(Cxa, "copyGoalVerificationEntriesForFork");
    r(Exa, "cloneGoalVerificationEntryForFork");
    r(Axa, "deriveForkedGoalStatusFromCopiedVerifications");
    r(tK, "forkSourceMessagesForSession");
    r(cve, "asRecord");
    r(Pxa, "activeForkTranscriptMessages");
    r(a6e, "resolveForkHistoryEndIndex");
    r(rAo, "isActiveCompactionBoundaryMessage");
    r(Rxa, "isRealVisibleUserMessage");
    r(Dxa, "findCompactedForkParentUserMessage");
    r(c6e, "buildForkHistoryMessages")
});
async function cxn(e, t, n, o) {
    if (!e.fileSystemPort) throw Jr(fr.ConfigurationError, "FileSystemPort is not configured", {
        recoverable: !0
    });
    let s = [];
    for (let a of t) {
        if (jd(o), !a.existedBefore || a.beforeContent === null) {
            await e.fileSystemPort.removeFile({
                path: a.path,
                missingOk: !0,
                trace: n
            }, {
                signal: o
            }), s.push({
                action: "delete",
                path: a.path
            });
            continue
        }
        let l = await e.fileSystemPort.writeTextFile({
            path: a.path,
            content: a.beforeContent,
            createParents: !0,
            atomic: !0,
            trace: n
        }, {
            signal: o
        });
        s.push({
            action: "restore",
            bytesWritten: l.bytesWritten,
            path: a.path
        })
    }
    return s
}
async function oAo(e) {
    if (!this.sessionStore) throw Jr(fr.ConfigurationError, "Fork requires a session adapter.", {
        context: {
            hasSessionStore: !1
        },
        recoverable: !0
    });
    let t = await this.sessionStore.getSession(this.sessionId);
    if (!t) throw Jr(fr.SessionNotFound, `Session not found: ${this.sessionId}`, {
        context: {
            sessionId: this.sessionId
        },
        recoverable: !0
    });
    let n = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        o = tK(n, t),
        s = o.findIndex($ => $.info.id === e.targetMessageId);
    if (s < 0) throw Jr(fr.InvalidStateTransition, `Fork target message not found in session store: ${e.targetMessageId}`, {
        context: {
            messageId: e.targetMessageId
        },
        recoverable: !0
    });
    let a = a6e(o, s, !0),
        l = await this.eventStore.getEvents(this.sessionId),
        u = o.slice(0, a).map($ => $.info.id),
        f = new Set(BJ(l, u).map($ => $.checkpointId)),
        g = o.slice(a).map($ => $.info.id),
        _ = BJ(l, g).filter($ => !f.has($.checkpointId));
    if (_.length === 0) return await QEo.call(this, {
        forkedSessionId: e.forkedSessionId,
        targetMessageId: e.targetMessageId,
        traceContext: e.traceContext
    });
    if (!this.artifactStore || !this.fileSystemPort) throw Jr(fr.ConfigurationError, "Fork requires session, artifact, and file-system adapters.", {
        context: {
            hasArtifactStore: !!this.artifactStore,
            hasFileSystemPort: !!this.fileSystemPort,
            hasSessionStore: !0
        },
        recoverable: !0
    });
    let b = [];
    for (let $ of _) {
        jd(e.abortSignal);
        let K = await this.artifactStore.readToolResultArtifact({
            uri: $.snapshotRef,
            trace: e.traceContext
        }, {
            signal: e.abortSignal
        });
        b.push(jR(JSON.parse(K.content)))
    }
    let w = new Map;
    for (let $ of b)
        for (let K of $.files) w.has(K.path) || w.set(K.path, K);
    let T = await i6e(this, {
            forkedSessionId: e.forkedSessionId,
            parentSession: t
        }),
        I = c6e(n, o, s, a),
        {
            copiedMessageCount: A,
            messageIdMap: R
        } = await this.copySessionMessagesForFork({
            forkedSessionId: T,
            messages: I,
            traceContext: e.traceContext
        });
    await s6e.call(this, {
        forkedSessionId: T,
        messageIdMap: R,
        traceContext: e.traceContext
    });
    let L = await cxn(this, Array.from(w.values()), e.traceContext, e.abortSignal),
        U = R.get(e.targetMessageId),
        j = Date.now();
    await this.persistAssistantTimelinePartForSession({
        sessionId: T,
        messageID: ql(),
        partID: Ml(`fork_${String(this.sessionId)}_${String(e.targetMessageId)}_timeline`),
        parentID: U,
        created: j,
        completed: j,
        finish: "completed",
        timeline: {
            timelineType: "session_fork",
            display: "separator",
            status: "completed",
            anchorMessageId: U,
            parentSessionId: this.sessionId,
            targetMessageId: e.targetMessageId,
            restoredFileCount: L.length,
            time: {
                start: j,
                end: j
            }
        },
        traceContext: e.traceContext
    }), await this.persistSyntheticUserNoticeForSession({
        messageID: ql(),
        sessionId: T,
        source: "fork",
        text: ISo({
            parentSessionId: this.sessionId,
            restoredFiles: L,
            targetMessageId: e.targetMessageId,
            undoneCheckpointCount: _.length
        }),
        metadata: {
            forkContext: {
                kind: "session_fork",
                parentSessionId: this.sessionId,
                targetMessageId: e.targetMessageId,
                restoredFileCount: L.length
            }
        },
        traceContext: e.traceContext
    });
    let z = this.createEvent(ut.SessionForked, {
        originalSessionId: this.sessionId,
        forkedSessionId: T,
        forkPoint: a,
        targetMessageId: e.targetMessageId,
        restoredFileCount: L.length,
        strategy: Xp.ForkRequired
    }, e.traceContext);
    return await this.appendEvent(z, e.traceContext), {
        copiedMessageCount: A,
        forkedSessionId: T,
        parentSessionId: this.sessionId,
        targetMessageId: e.targetMessageId,
        restoredFiles: L,
        response: `Forked session ${T} from message ${e.targetMessageId}: copied ${A} messages and restored ${L.length} file${L.length===1?"":"s"} to the fork point.`
    }
}
var iAo = Y(() => {
    "use strict";
    aa();
    Ap();
    $_t();
    r(cxn, "restoreWorkspaceCheckpointFiles");
    r(oAo, "forkWorkspaceAtMessage")
});
async function sAo(e, t, n) {
    return await cxn(this, e.files, t, n)
}
async function aAo(e) {
    if (!this.sessionStore) return {
        copiedMessageCount: 0,
        messageIdMap: new Map
    };
    let t = new Map,
        n = 0;
    for (let o of e.messages) {
        let s = ql();
        t.set(o.info.id, s), await this.persistMessage(Boe(o.info, {
            forkedSessionId: e.forkedSessionId,
            messageIdMap: t,
            nextMessageId: s
        }), e.traceContext, {
            sessionID: o.info.sessionID,
            id: o.info.id
        });
        for (let a of o.parts) await this.persistPart(Uoe(a, {
            forkedSessionId: e.forkedSessionId,
            nextMessageId: s,
            messageIdMap: t
        }), e.traceContext, {
            sessionID: a.sessionID,
            id: a.id
        });
        n += 1
    }
    return {
        copiedMessageCount: n,
        messageIdMap: t
    }
}
async function cAo(e = {}) {
    let t = await this.eventStore.getEvents(this.sessionId),
        n = await this.loadCheckpointMessagePreviews(),
        o = t.filter(s => s.type === ut.CheckpointCreated).map(s => ({
            checkpoint: tC(s.payload),
            timestamp: s.timestamp
        })).filter(({
            checkpoint: s
        }) => s.scope === Jl.Workspace || s.scope === Jl.Both).map(({
            checkpoint: s,
            timestamp: a
        }) => ({
            checkpointId: s.checkpointId,
            compactBoundaryId: s.compactBoundaryId,
            coveredByCompact: s.coveredByCompact,
            createdAt: a,
            diffRef: s.diffRef,
            fileCount: s.fileCount,
            messageId: s.messageId,
            targetMessageId: s.targetMessageId,
            toolMessageId: s.toolMessageId,
            preview: n.get(s.targetMessageId ?? s.messageId),
            scope: s.scope,
            snapshotRef: s.snapshotRef
        })).reverse();
    return e.limit && e.limit > 0 ? o.slice(0, e.limit) : o
}
async function lAo(e = {}) {
    let t = e.traceContext ?? p1() ?? this.rootTraceContext;
    if (e.targetMessageId && !e.targetCheckpointId) return await oAo.call(this, {
        abortSignal: e.abortSignal,
        forkedSessionId: e.forkedSessionId,
        targetMessageId: e.targetMessageId,
        traceContext: t
    });
    let n = await this.eventStore.getEvents(this.sessionId),
        o = Eye(n, e.targetCheckpointId);
    if (!o) throw Jr(fr.InvalidStateTransition, e.targetCheckpointId ? `Checkpoint not found: ${e.targetCheckpointId}` : "No workspace checkpoint is available yet.", {
        context: {
            targetCheckpointId: e.targetCheckpointId,
            targetMessageId: e.targetMessageId
        },
        recoverable: !0
    });
    if (!this.sessionStore || !this.artifactStore || !this.fileSystemPort) throw Jr(fr.ConfigurationError, "Fork requires session, artifact, and file-system adapters.", {
        context: {
            hasArtifactStore: !!this.artifactStore,
            hasFileSystemPort: !!this.fileSystemPort,
            hasSessionStore: !!this.sessionStore
        },
        recoverable: !0
    });
    let s = await this.sessionStore.getSession(this.sessionId);
    if (!s) throw Jr(fr.SessionNotFound, `Session not found: ${this.sessionId}`, {
        context: {
            sessionId: this.sessionId
        },
        recoverable: !0
    });
    let a = await this.artifactStore.readToolResultArtifact({
            uri: o.snapshotRef,
            trace: t
        }, {
            signal: e.abortSignal
        }),
        l = jR(JSON.parse(a.content)),
        u = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        f = tK(u, s),
        g = o.targetMessageId ?? o.messageId,
        _ = f.findIndex($ => $.info.id === g);
    if (_ < 0) throw Jr(fr.InvalidStateTransition, `Checkpoint message not found in session store: ${g}`, {
        context: {
            checkpointId: o.checkpointId,
            messageId: g
        },
        recoverable: !0
    });
    let b = await i6e(this, {
            forkedSessionId: e.forkedSessionId,
            parentSession: s
        }),
        w = a6e(f, _, !1),
        T = c6e(u, f, _, w),
        {
            copiedMessageCount: I,
            messageIdMap: A
        } = await this.copySessionMessagesForFork({
            forkedSessionId: b,
            messages: T,
            traceContext: t
        });
    await s6e.call(this, {
        forkedSessionId: b,
        messageIdMap: A,
        traceContext: t
    });
    let R = await this.restoreWorkspaceCheckpointArtifact(l, t, e.abortSignal),
        L = A.get(g),
        U = Date.now();
    await this.persistAssistantTimelinePartForSession({
        sessionId: b,
        messageID: ql(),
        partID: Ml(`fork_${String(this.sessionId)}_${String(g)}_${o.checkpointId}_timeline`),
        parentID: L,
        created: U,
        completed: U,
        finish: "completed",
        timeline: {
            timelineType: "session_fork",
            display: "separator",
            status: "completed",
            anchorMessageId: L,
            parentSessionId: this.sessionId,
            targetMessageId: g,
            targetCheckpointId: o.checkpointId,
            restoredFileCount: R.length,
            time: {
                start: U,
                end: U
            }
        },
        traceContext: t
    }), await this.persistSyntheticUserNoticeForSession({
        messageID: ql(),
        sessionId: b,
        source: "fork",
        text: TSo({
            checkpoint: o,
            parentSessionId: this.sessionId,
            restoredFiles: R
        }),
        metadata: {
            forkContext: {
                kind: "session_fork",
                parentSessionId: this.sessionId,
                targetMessageId: g,
                targetCheckpointId: o.checkpointId,
                restoredFileCount: R.length
            }
        },
        traceContext: t
    });
    let j = this.createEvent(ut.SessionForked, {
        originalSessionId: this.sessionId,
        forkedSessionId: b,
        forkPoint: w,
        targetMessageId: g,
        targetCheckpointId: o.checkpointId,
        restoredSnapshotRef: o.snapshotRef,
        restoredFileCount: R.length,
        strategy: Xp.ForkRequired
    }, t);
    await this.appendEvent(j, t);
    let z = `Forked session ${b} from checkpoint ${o.checkpointId}: copied ${I} messages and restored ${R.length} file${R.length===1?"":"s"}.`;
    return {
        checkpoint: o,
        copiedMessageCount: I,
        forkedSessionId: b,
        parentSessionId: this.sessionId,
        targetMessageId: g,
        targetCheckpointId: o.checkpointId,
        restoredFiles: R,
        response: z
    }
}
async function uAo() {
    if (!this.sessionStore) return new Map;
    let e = await this.sessionStore.messages({
            sessionID: this.sessionId
        }),
        t = new Map(e.map(o => [o.info.id, o])),
        n = new Map;
    for (let o of e) {
        let s = o.info.role === "assistant" ? t.get(o.info.parentID) : o,
            a = s ? kSo(s) : void 0;
        a && n.set(o.info.id, a)
    }
    return n
}
var lve = Y(() => {
    "use strict";
    aa();
    Ap();
    $_t();
    iAo();
    r(sAo, "restoreWorkspaceCheckpointArtifact");
    r(aAo, "copySessionMessagesForFork");
    r(cAo, "listWorkspaceCheckpoints");
    r(lAo, "forkWorkspaceFromCheckpoint");
    r(uAo, "loadCheckpointMessagePreviews")
});
async function fAo(e = {}) {
    let t = await hAo.call(this, e);
    return l6e(t)
}
async function mAo(e = {}) {
    let t = e.traceContext ?? p1() ?? this.rootTraceContext,
        n = await hAo.call(this, {
            ...e,
            traceContext: t
        });
    if (!n.canApply) return {
        applied: !1,
        preview: l6e(n),
        response: "File rewind was not applied because at least one file is unsafe."
    };
    if (!this.fileSystemPort) return {
        applied: !1,
        preview: l6e({
            ...n,
            canApply: !1,
            unsafeFiles: [...n.unsafeFiles, {
                operationCount: 1,
                path: "workspace",
                reason: "file_read_failed",
                toolNames: [],
                message: "FileSystemPort is not configured."
            }]
        }),
        response: "File rewind was not applied because the file-system adapter is unavailable."
    };
    let o = [],
        s = [];
    try {
        for (let _ of n.operations) {
            jd(e.abortSignal);
            let b = await gAo.call(this, _.path, t, e.abortSignal);
            if ("reason" in b) throw new Error(b.message ?? `Failed to journal ${_.path}`);
            if (s.push({
                    path: _.path,
                    state: b
                }), _.action === "delete" || _.beforeContent === null) {
                await this.fileSystemPort.removeFile({
                    path: _.path,
                    missingOk: !0,
                    trace: t
                }, {
                    signal: e.abortSignal
                }), o.push({
                    action: "delete",
                    path: _.path
                });
                continue
            }
            await this.fileSystemPort.writeTextFile({
                path: _.path,
                content: _.beforeContent,
                createParents: !0,
                atomic: !0,
                trace: t
            }, {
                signal: e.abortSignal
            }), o.push({
                action: "restore",
                path: _.path
            })
        }
        await e.commitAfterApply?.()
    } catch (_) {
        try {
            await Oxa.call(this, s, t)
        } catch (w) {
            throw new AggregateError([_, w], "Workspace file rewind failed and compensation was incomplete")
        }
        let b = _ instanceof Error ? _.message : String(_);
        return {
            applied: !1,
            preview: {
                ...l6e(n),
                canApply: !1,
                unsafeFiles: [...n.unsafeFiles, {
                    operationCount: Math.max(1, s.length),
                    path: s.at(-1)?.path ?? "workspace",
                    reason: "file_read_failed",
                    toolNames: [],
                    message: b
                }]
            },
            response: "File rewind was not applied because the write failed; prior files were restored."
        }
    }
    let a = n.operations[0],
        l = n.operations.at(-1),
        u = e.targetMessageId ?? e.targetMessageIds?.[0],
        f = `rewind_${crypto.randomUUID()}`,
        g = this.createEvent(ut.RewindTriggered, {
            rewindId: f,
            scope: Jl.Workspace,
            strategy: Xp.ActiveChain,
            targetMessageId: u,
            targetCheckpointId: l?.checkpoint.checkpointId,
            restoredSnapshotRef: l?.checkpoint.snapshotRef,
            reason: "file_summary_rewind"
        }, t);
    return await this.appendEvent(g, t), this.logger?.info("Workspace file summary rewind applied", {
        ...Cr(t),
        event: "rewind.file_summary.completed",
        fileCount: n.safeFiles.length,
        module: "core.runtime",
        operationCount: n.operations.length,
        restoredFileCount: o.length,
        status: "completed",
        targetCheckpointId: l?.checkpoint.checkpointId,
        targetMessageId: u
    }), {
        applied: !0,
        preview: l6e(n),
        response: `Rewound ${n.safeFiles.length} file${n.safeFiles.length===1?"":"s"} from summary checkpoints.`
    }
}
async function Oxa(e, t) {
    for (let n of [...e].reverse()) {
        if (!n.state.exists || n.state.content === null) {
            await this.fileSystemPort.removeFile({
                path: n.path,
                missingOk: !0,
                trace: t
            });
            continue
        }
        await this.fileSystemPort.writeTextFile({
            path: n.path,
            content: n.state.content,
            createParents: !0,
            atomic: !0,
            trace: t
        })
    }
}
async function hAo(e) {
    let t = e.traceContext ?? p1() ?? this.rootTraceContext;
    if (!this.artifactStore || !this.fileSystemPort) return {
        canApply: !1,
        ignoredFiles: [],
        operations: [],
        safeFiles: [],
        unsafeFiles: [{
            operationCount: 1,
            path: "workspace",
            reason: this.artifactStore ? "file_read_failed" : "checkpoint_unreadable",
            toolNames: [],
            message: this.artifactStore ? "FileSystemPort is not configured." : "ArtifactStore is not configured."
        }]
    };
    let n = await this.eventStore.getEvents(this.sessionId),
        o = Mxa(n, {
            targetCheckpointId: e.targetCheckpointId,
            targetMessageId: e.targetMessageId,
            targetMessageIds: e.targetMessageIds
        });
    if (o.length === 0) return {
        canApply: !1,
        ignoredFiles: [],
        operations: [],
        safeFiles: [],
        unsafeFiles: []
    };
    let s = [],
        a = [];
    for (let R of o) {
        jd(e.abortSignal);
        try {
            let L = await this.artifactStore.readToolResultArtifact({
                uri: R.snapshotRef,
                trace: t
            }, {
                signal: e.abortSignal
            });
            s.push({
                artifact: jR(JSON.parse(L.content)),
                checkpoint: R
            })
        } catch (L) {
            a.push({
                operationCount: Math.max(1, R.fileCount ?? 1),
                path: `checkpoint:${R.checkpointId}`,
                reason: "checkpoint_unreadable",
                toolNames: [],
                message: L instanceof Error ? L.message : String(L)
            })
        }
    }
    let l = new Map,
        u = [],
        f = new Map;
    for (let {
            artifact: R,
            checkpoint: L
        }
        of s) {
        if (Lxa(R.toolName)) {
            for (let U of R.files) jxa(l, dAo(this.workspaceRoot, U.path), R.toolName);
            continue
        }
        for (let U of R.files) {
            let j = dAo(this.workspaceRoot, U.path),
                z = Nxa(U);
            if (z === void 0) {
                lxn(f, {
                    action: U.existedBefore && U.beforeContent !== null ? "restore" : "delete",
                    path: j,
                    reason: "unsupported_checkpoint",
                    toolName: R.toolName
                });
                continue
            }
            u.push({
                action: U.existedBefore && U.beforeContent !== null ? "restore" : "delete",
                afterContent: z,
                artifact: R,
                beforeContent: U.beforeContent,
                checkpoint: L,
                path: j,
                toolName: R.toolName
            })
        }
    }
    let g = new Map,
        _ = new Map,
        b = new Map(f),
        w = [];
    for (let R of [...u].reverse()) {
        jd(e.abortSignal);
        let L = Fxa(_, R);
        if (L.operationCount += 1, L.toolNames.add(R.toolName), L.action = R.action, b.has(R.path)) continue;
        let U = g.get(R.path) ?? await gAo.call(this, R.path, t, e.abortSignal);
        if ("reason" in U) {
            lxn(b, {
                action: R.action,
                message: U.message,
                path: R.path,
                reason: U.reason,
                toolName: R.toolName
            });
            continue
        }
        let j = q_t(R.afterContent);
        if (U.hash !== j) {
            lxn(b, {
                action: R.action,
                currentHash: U.hash ?? "missing",
                expectedHash: j,
                path: R.path,
                reason: "external_modified",
                toolName: R.toolName
            });
            continue
        }
        g.set(R.path, {
            content: R.beforeContent,
            exists: R.beforeContent !== null,
            hash: q_t(R.beforeContent)
        }), w.push(R)
    }
    for (let [R, L] of b) _.delete(R), L.operationCount = Math.max(L.operationCount, u.filter(U => U.path === R).length);
    let T = Array.from(_.values()).map(Bxa).sort(uxn),
        I = [...a, ...Array.from(b.values()).map(Uxa)].sort(uxn),
        A = Array.from(l.values()).map(zxa).sort(uxn);
    return {
        canApply: T.length > 0 && I.length === 0,
        ignoredFiles: A,
        operations: I.length === 0 ? w : [],
        safeFiles: T,
        unsafeFiles: I
    }
}

function dAo(e, t) {
    return (0, W_t.isAbsolute)(t) ? t : (0, W_t.resolve)(e, t)
}

function Mxa(e, t) {
    let n = t.targetMessageIds && t.targetMessageIds.length > 0 ? t.targetMessageIds : t.targetMessageId ? [t.targetMessageId] : [];
    if (n.length > 0) {
        let s = BJ(e, n);
        if (s.length > 0 || !t.targetTurnId) return s
    }
    if (t.targetTurnId && !String(t.targetTurnId).includes("~")) return e.filter(s => s.type === ut.CheckpointCreated).filter(s => String(s.turnId ?? "") === String(t.targetTurnId)).map(s => s.payload).filter(s => {
        let a = s;
        return a.scope === Jl.Workspace || a.scope === Jl.Both
    });
    let o = Eye(e, t.targetCheckpointId);
    return o ? [o] : []
}

function Nxa(e) {
    let t = e.afterContent;
    if (typeof t == "string") return t;
    if (!e.existedBefore && e.beforeContent === null && e.structuredPatch.length === 0) return;
    let n = e.beforeContent ?? "",
        o = {
            oldFileName: e.path,
            newFileName: e.path,
            oldHeader: void 0,
            newHeader: void 0,
            hunks: e.structuredPatch
        },
        s = PNe(n, o, {
            autoConvertLineEndings: !1,
            fuzzFactor: 0
        });
    return typeof s == "string" ? s : void 0
}
async function gAo(e, t, n) {
    try {
        let o = await this.fileSystemPort.readTextFile({
            path: e,
            trace: t
        }, {
            signal: n
        });
        return {
            content: o.content,
            exists: !0,
            hash: q_t(o.content)
        }
    } catch (o) {
        return Th(o) && o.code === "not_found" ? {
            content: null,
            exists: !1,
            hash: q_t(null)
        } : {
            reason: "file_read_failed",
            message: o instanceof Error ? o.message : String(o)
        }
    }
}

function q_t(e) {
    return e === null ? "missing" : (0, pAo.createHash)("sha256").update(e).digest("hex")
}

function Lxa(e) {
    let t = e.toLowerCase().replace(/[^a-z0-9]/g, "");
    return t === "bash" || t === "shell" || t.includes("terminal") || t.endsWith("shell")
}

function Fxa(e, t) {
    let n = e.get(t.path);
    if (n) return n;
    let o = {
        action: t.action,
        operationCount: 0,
        path: t.path,
        toolNames: new Set
    };
    return e.set(t.path, o), o
}

function lxn(e, t) {
    let n = e.get(t.path);
    if (n) {
        n.operationCount += 1, n.toolNames.add(t.toolName), n.unsafe = {
            currentHash: t.currentHash ?? n.unsafe?.currentHash,
            expectedHash: t.expectedHash ?? n.unsafe?.expectedHash,
            message: t.message ?? n.unsafe?.message,
            reason: n.unsafe?.reason ?? t.reason
        };
        return
    }
    e.set(t.path, {
        action: t.action,
        operationCount: 1,
        path: t.path,
        toolNames: new Set([t.toolName]),
        unsafe: {
            currentHash: t.currentHash,
            expectedHash: t.expectedHash,
            message: t.message,
            reason: t.reason
        }
    })
}

function jxa(e, t, n) {
    let o = e.get(t);
    if (o) {
        o.operationCount += 1, o.toolNames.add(n);
        return
    }
    e.set(t, {
        operationCount: 1,
        path: t,
        toolNames: new Set([n])
    })
}

function Bxa(e) {
    return {
        action: e.action,
        operationCount: e.operationCount,
        path: e.path,
        toolNames: Array.from(e.toolNames).sort()
    }
}

function Uxa(e) {
    return {
        operationCount: e.operationCount,
        path: e.path,
        reason: e.unsafe?.reason ?? "unsupported_checkpoint",
        toolNames: Array.from(e.toolNames).sort(),
        ...e.unsafe?.message ? {
            message: e.unsafe.message
        } : {},
        ...e.unsafe?.expectedHash ? {
            expectedHash: e.unsafe.expectedHash
        } : {},
        ...e.unsafe?.currentHash ? {
            currentHash: e.unsafe.currentHash
        } : {}
    }
}

function zxa(e) {
    return {
        operationCount: e.operationCount,
        path: e.path,
        reason: "bash_ignored",
        toolNames: Array.from(e.toolNames).sort()
    }
}

function uxn(e, t) {
    return e.path.localeCompare(t.path)
}

function l6e(e) {
    return {
        canApply: e.canApply,
        ignoredFiles: e.ignoredFiles,
        safeFiles: e.safeFiles,
        unsafeFiles: e.unsafeFiles
    }
}
var pAo, W_t, _Ao = Y(() => {
    "use strict";
    pAo = require("node:crypto"), W_t = require("node:path");
    RNe();
    aa();
    Ap();
    r(fAo, "previewWorkspaceFileRewind");
    r(mAo, "applyWorkspaceFileRewind");
    r(Oxa, "compensateFileRewindJournal");
    r(hAo, "buildWorkspaceFileRewindPlan");
    r(dAo, "resolveCheckpointFilePath");
    r(Mxa, "resolveTargetCheckpoints");
    r(Nxa, "resolveCheckpointAfterContent");
    r(gAo, "readCurrentFileState");
    r(q_t, "hashContent");
    r(Lxa, "isIgnoredShellTool");
    r(Fxa, "ensureFileAggregate");
    r(lxn, "markUnsafe");
    r(jxa, "addIgnoredFile");
    r(Bxa, "toSafeFile");
    r(Uxa, "toUnsafeFile");
    r(zxa, "toIgnoredFile");
    r(uxn, "compareByPath");
    r(l6e, "toPreview")
});
async function yAo(e) {
    let t = e.map(n => {
        let o = this.registry.get(n.name),
            s = o?.metadata,
            a = o?.permission?.sideEffectScope ?? s?.sideEffectScope;
        return {
            toolCallId: n.id,
            toolName: n.name,
            dependsOn: [],
            readOnly: s?.readOnly === void 0 ? void 0 : s.readOnly && a === "none",
            destructive: s?.destructive,
            concurrentSafe: s?.concurrentSafe,
            sideEffectScope: a
        }
    });
    return this.toolScheduler.schedule(t)
}
async function vAo(e, t, n) {
    let o = e.map(f => ({
            id: f.id,
            name: f.name,
            input: f.input
        })),
        s = n?.traceContext ?? p1() ?? this.rootTraceContext,
        a = [];
    this.logger?.debug("executeTools: executing schedule", {
        toolCalls: o.length,
        parallelGroups: t.parallelGroups.length
    });
    let l = this.executor.executeSchedule(o, t, {
            automationTurn: n?.automationTurn,
            offPeakTurn: n?.offPeakTurn,
            signal: n?.signal,
            traceContext: s,
            subagentModelOverride: n?.subagentModelOverride,
            model: n?.model
        }),
        u = [];
    for (;;) {
        let f = await l.next();
        if (f.done) {
            u = f.value;
            break
        }
        if (f.value.type === "batch_start") {
            await n?.onBatchStart?.(f.value.toolCallIds);
            continue
        }
        if (f.value.type === "batch_complete") {
            let g = f.value.results,
                _ = this.createEvent(ut.ToolBatchComplete, {
                    toolCallIds: g.map(b => b.toolCallId),
                    successCount: g.filter(b => b.success).length,
                    errorCount: g.filter(b => !b.success).length
                }, s);
            await this.appendEvent(_, s), a.push(_)
        }
    }
    return this.logger?.debug("executeTools: completed", {
        resultCount: u.length
    }), {
        results: u,
        events: a
    }
}
async function bAo(e, t, n, o) {
    let s = [],
        a = new Map(e.map(l => [l.id, l]));
    for (let l of t.items) {
        let u = a.get(l.toolCallId);
        if (!u || u.name.trim().length === 0) continue;
        let f = this.createEvent(ut.ToolCallScheduled, {
            toolCallId: l.toolCallId,
            assistantMessageId: n,
            toolName: u.name,
            input: u.input,
            dependencies: l.dependencies,
            parallelGroupIndex: ywo(t, l.toolCallId),
            canRunParallel: l.canRunParallel,
            display: Ure(this.registry.getMetadata(u.name)?.mcpPresentation),
            schedule: {
                parallelGroups: t.parallelGroups,
                executionOrder: t.executionOrder
            }
        }, o);
        await this.appendEvent(f, o), s.push(f)
    }
    return s
}
async function SAo(e) {
    if (!this.artifactStore || !e.result.success) return;
    let t = vSo(e.result.output);
    if (t) try {
        jd(e.abortSignal);
        let n = await this.artifactStore.writeToolResultArtifact({
            sessionId: this.sessionId,
            turnId: e.traceContext.turnId,
            toolCallId: e.result.toolCallId,
            toolName: e.result.toolName,
            content: bSo(t, e.result),
            contentType: ySo,
            retention: "session",
            trace: e.traceContext
        }, {
            signal: e.abortSignal
        });
        jd(e.abortSignal);
        let o = this.createEvent(ut.CheckpointCreated, {
            checkpointId: `checkpoint_${crypto.randomUUID()}`,
            messageId: e.messageId,
            targetMessageId: e.messageId,
            toolMessageId: e.toolMessageId,
            scope: Jl.Workspace,
            snapshotRef: n.uri,
            diffRef: n.uri,
            fileCount: 1
        }, e.traceContext);
        await this.appendEvent(o, e.traceContext), e.events.push(o), uko(this.currentTurnFileChanges, {
            afterContent: t.content,
            beforeContent: t.originalFile,
            path: t.filePath,
            structuredPatch: t.structuredPatch,
            toolName: e.result.toolName
        }), this.logger?.debug("Workspace checkpoint created", {
            ...Cr(e.traceContext),
            event: "checkpoint.created",
            fileCount: 1,
            module: "core.runtime",
            status: "completed",
            toolCallId: e.result.toolCallId,
            toolName: e.result.toolName
        })
    } catch (n) {
        if (I0(n, e.abortSignal)) throw VC(n);
        this.logger?.warn("Workspace checkpoint creation failed", {
            ...Cr(e.traceContext),
            errorMessage: n instanceof Error ? n.message : String(n),
            event: "checkpoint.create.failed",
            filePath: t.filePath,
            module: "core.runtime",
            status: "failed",
            toolCallId: e.result.toolCallId,
            toolName: e.result.toolName
        })
    }
}
async function wAo(e, t, n) {
    let o = p1() ?? this.rootTraceContext,
        s = this.createEvent(ut.PermissionRequested, {
            toolCallId: e,
            toolName: t,
            riskLevel: n,
            reason: `Tool ${t} requires approval`,
            input: {}
        }, o);
    await this.appendEvent(s, o)
}
async function kAo(e, t) {
    let n = {
        decision: t.allowed ? "allow" : "deny",
        reason: t.reason,
        modifiedInput: t.modifiedInput,
        permissionUpdates: t.permissionUpdates,
        resolvedAt: new Date
    };
    if (sSo(this.permissionBroker) && this.permissionBroker.resolvePermission(e, n)) return;
    let o = p1() ?? this.rootTraceContext,
        s = this.createEvent(ut.PermissionResolved, {
            toolCallId: e,
            decision: n.decision,
            reason: n.reason,
            modifiedInput: n.modifiedInput
        }, o);
    await this.appendEvent(s, o)
}
var Zoe = Y(() => {
    "use strict";
    aa();
    Ap();
    Jge();
    r(yAo, "scheduleTools");
    r(vAo, "executeTools");
    r(bAo, "emitToolScheduledEvents");
    r(SAo, "emitFileMutationCheckpoint");
    r(wAo, "emitPermissionRequest");
    r(kAo, "resolvePermission")
});
async function xAo(e, t, n) {
    let o = this.dynamicWorkflowRunPort;
    return o ? (n !== void 0 && e.registryTask !== void 0 && this.runtimeTaskRegistry.update(e.taskId, a => ({
        ...a,
        stopInitiator: n
    })), await o.cancel(e.taskId, n) ? {
        ok: !0,
        status: "cancelled",
        taskId: e.taskId,
        type: "local_dynamic_workflow"
    } : {
        ok: !1,
        reason: "background_task_not_found",
        status: "lost",
        taskId: e.taskId,
        type: "local_dynamic_workflow"
    }) : t(e)
}
var TAo = Y(() => {
    "use strict";
    r(xAo, "stopDynamicWorkflowBackgroundTask")
});

function IAo() {
    return Sdt(this.runtimeTaskRegistry)
}
async function CAo(e, t = {}) {
    let n = await this.stopBackgroundTask(e, {
        initiator: "user",
        traceContext: t.traceContext
    });
    if (!n.ok) return {
        cancelled: !1,
        reason: n.reason,
        status: dxn(n.status) ?? "lost",
        taskId: e
    };
    let o = await this.rebuildProjection(),
        s = dxn(n.status) ?? "lost";
    return {
        cancelled: s === "cancelled",
        reason: n.alreadyTerminal ? "background_task_not_running" : void 0,
        snapshot: o.backgroundTasks.find(a => a.taskId === e),
        status: s,
        taskId: e
    }
}
async function EAo(e, t) {
    let n = t.traceContext ?? this.rootTraceContext,
        o = await $xa.call(this, e);
    return o ? Wxa(o) ? qxa(o) ? t.strict ? {
        ok: !1,
        reason: "background_task_not_running",
        status: o.currentStatus,
        taskId: e,
        type: o.taskType
    } : {
        alreadyTerminal: !0,
        command: V_t(o.registryTask, o.existing),
        ok: !0,
        status: o.currentStatus ?? "lost",
        taskId: e,
        type: o.taskType
    } : o.taskType === "local_agent" ? Vxa.call(this, o) : o.taskType === "local_bash" ? Hxa.call(this, o, n) : o.taskType === "local_dynamic_workflow" ? xAo.call(this, o, u6e, t.initiator) : u6e(o) : u6e(o) : {
        ok: !1,
        reason: "background_task_not_found",
        taskId: e
    }
}
async function $xa(e) {
    let t = this.runtimeTaskRegistry.get(e),
        o = (await this.rebuildProjection()).backgroundTasks.find(a => a.taskId === e) ?? (t ? Gxa(t) : void 0);
    if (!t && !o) return;
    let s = t?.type ?? Jxa(o);
    return {
        currentStatus: t?.status ?? o?.status,
        existing: o,
        registryTask: t,
        taskId: e,
        taskType: s
    }
}

function qxa(e) {
    return (e.registryTask ? zk(e.registryTask) : !1) || Zxa(e.existing?.status)
}

function Wxa(e) {
    return e.taskType !== void 0
}

function u6e(e) {
    return {
        ok: !1,
        reason: "background_task_cancel_not_supported",
        status: e.currentStatus,
        taskId: e.taskId,
        ...e.taskType ? {
            type: e.taskType
        } : {}
    }
}
async function Vxa(e) {
    if (!this.subagentPort?.stopTask) return u6e(e);
    let t = await this.subagentPort.stopTask(e.taskId);
    return t ? {
        command: V_t(e.registryTask, e.existing),
        ok: !0,
        status: t.status,
        taskId: e.taskId,
        type: "local_agent"
    } : {
        ok: !1,
        reason: "background_task_not_found",
        status: "lost",
        taskId: e.taskId,
        ...e.taskType ? {
            type: e.taskType
        } : {}
    }
}
async function Hxa(e, t) {
    if (!this.executionPort?.cancelBackgroundTask) return u6e(e);
    let n = new Date;
    e.existing?.status === "running" && await this.appendEvent(this.createEvent(ut.BackgroundTaskUpdated, this.buildBackgroundTaskPayload(e.taskId, e.existing, void 0, {
        cancelRequestedAt: n,
        cancellable: !1,
        status: "running"
    }), t), t);
    let o = await this.executionPort.cancelBackgroundTask(e.taskId);
    if (!o) {
        let a = new Date;
        return e.registryTask && this.runtimeTaskRegistry.update(e.taskId, l => zk(l) ? l : {
            ...l,
            completedAt: a,
            isBackgrounded: !0,
            status: "lost"
        }), await this.appendEvent(this.createEvent(ut.BackgroundTaskCompleted, this.buildBackgroundTaskPayload(e.taskId, e.existing, void 0, {
            cancelRequestedAt: n,
            cancellable: !1,
            completedAt: a,
            status: "lost"
        }), t), t), {
            ok: !1,
            reason: "background_task_not_found",
            status: "lost",
            taskId: e.taskId,
            type: "local_bash"
        }
    }
    let s = o.status === "running" ? "cancelled" : o.status;
    return e.registryTask || await this.appendEvent(this.createEvent(ut.BackgroundTaskCompleted, this.buildBackgroundTaskPayload(e.taskId, e.existing, o, {
        cancelRequestedAt: n,
        cancellable: !1,
        completedAt: o.completedAt ?? new Date,
        status: s
    }), t), t), {
        command: V_t(e.registryTask, e.existing),
        ok: !0,
        status: s,
        taskId: e.taskId,
        type: "local_bash"
    }
}
async function AAo(e) {
    if (this.config.taskType !== "subagent_child") return;
    let t = e.traceContext ?? this.rootTraceContext,
        n = Object.values(this.runtimeTaskRegistry.all()).filter(o => o.type === "local_bash" && o.isBackgrounded === !0 && o.status === "running");
    for (let o of n) this.logger?.info?.("Cancelling subagent background task during runtime cleanup", {
        ...Cr(t),
        event: "runtime.background_task.cleanup_cancel",
        module: "core.runtime",
        reason: e.reason,
        taskId: o.taskId
    }), await this.stopBackgroundTask(o.taskId, {
        traceContext: t
    })
}

function PAo(e, t, n, o = {}) {
    let s = n?.result,
        a = s?.stdout.bytes ?? n?.stdoutBytes ?? t?.stdoutBytes,
        l = s?.stderr.bytes ?? n?.stderrBytes ?? t?.stderrBytes,
        u = s?.stdout.text || n?.stdoutTail || t?.stdoutTail,
        f = s?.stderr.text || n?.stderrTail || t?.stderrTail,
        g = n?.stdoutPersistedOutputPath ?? s?.stdout.artifactPath ?? t?.stdoutPersistedOutputPath,
        _ = n?.stderrPersistedOutputPath ?? s?.stderr.artifactPath ?? t?.stderrPersistedOutputPath,
        b = a === void 0 && l === void 0 ? t?.outputBytes : (a ?? 0) + (l ?? 0),
        w = n?.outputPath ?? g ?? _ ?? t?.outputPath,
        T = s === void 0 ? t?.outputTruncated : s.stdout.truncated || s.stderr.truncated || s.stdout.artifactTruncated || s.stderr.artifactTruncated,
        I = o.status ?? n?.status ?? t?.status ?? "lost";
    return {
        taskId: e,
        toolCallId: t?.toolCallId,
        toolName: t?.toolName,
        taskKind: "bash",
        blocked: t?.blocked,
        blockedReason: t?.blockedReason,
        cancellable: o.cancellable ?? (I === "running" && !!n),
        cancelRequestedAt: o.cancelRequestedAt ?? t?.cancelRequestedAt,
        command: t?.command,
        description: t?.description,
        status: I,
        pid: n?.pid ?? s?.pid ?? t?.pid,
        startedAt: n?.startedAt ?? s?.startedAt ?? t?.startedAt,
        completedAt: o.completedAt ?? n?.completedAt ?? t?.completedAt,
        outputPath: w,
        stderrPersistedOutputPath: _,
        stdoutPersistedOutputPath: g,
        outputBytes: b,
        outputTruncated: T,
        outputTail: u ?? f ?? t?.outputTail,
        stderrBytes: l,
        stderrTail: f,
        stdoutBytes: a,
        stdoutTail: u,
        terminalId: t?.terminalId ?? e
    }
}

function Gxa(e) {
    return {
        taskId: e.taskId,
        toolCallId: typeof e.parentToolCallId == "string" ? e.parentToolCallId : void 0,
        toolName: Kxa(e.type),
        cancellable: e.status === "running",
        command: V_t(e, void 0),
        description: e.description,
        status: dxn(e.status) ?? "lost",
        pid: e.pid,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        outputPath: e.outputFile,
        terminalId: e.taskId
    }
}

function V_t(e, t) {
    return e?.type === "local_agent" ? e.description : !e && t?.toolName === "Agent" ? t.description : t?.command ? t.command : e?.type === "local_bash" ? e.description || e.prompt : e?.prompt
}

function Jxa(e) {
    switch (e?.toolName) {
        case "Bash":
            return "local_bash";
        case "Agent":
            return "local_agent";
        case "Workflow":
            return "local_workflow";
        case "CreateWorkflow":
        case "AmendWorkflow":
            return "local_dynamic_workflow";
        default:
            return
    }
}

function Kxa(e) {
    switch (e) {
        case "local_agent":
            return "Agent";
        case "local_bash":
            return "Bash";
        case "local_workflow":
            return "Workflow";
        case "local_dynamic_workflow":
            return "CreateWorkflow";
        case "monitor_mcp":
            return "Monitor"
    }
}

function Zxa(e) {
    return !!(e && e !== "running")
}

function dxn(e) {
    switch (e) {
        case "cancelled":
        case "killed":
        case "stopped":
            return "cancelled";
        case "completed":
        case "failed":
        case "lost":
        case "running":
        case "spawn_error":
        case "timed_out":
            return e;
        default:
            return
    }
}
var pxn = Y(() => {
    "use strict";
    aa();
    TAo();
    DG();
    r(IAo, "hasRunningBackgroundTasks");
    r(CAo, "cancelBackgroundTask");
    r(EAo, "stopBackgroundTask");
    r($xa, "resolveBackgroundStopTarget");
    r(qxa, "isTerminalBackgroundStopTarget");
    r(Wxa, "isTypedBackgroundStopTarget");
    r(u6e, "unsupportedBackgroundStopResult");
    r(Vxa, "stopLocalAgentBackgroundTask");
    r(Hxa, "stopLocalBashBackgroundTask");
    r(AAo, "cancelRunningRuntimeBackgroundTasks");
    r(PAo, "buildBackgroundTaskPayload");
    r(Gxa, "backgroundInfoFromRuntimeTask");
    r(V_t, "commandFromRuntimeTask");
    r(Jxa, "runtimeTaskTypeFromBackgroundInfo");
    r(Kxa, "toolNameFromRuntimeTaskType");
    r(Zxa, "isTerminalBackgroundTaskInfoStatus");
    r(dxn, "toBackgroundTaskInfoStatus")
});
async function RAo(e, t = this.sessionId) {
    return this.executionPort?.readBackgroundBashOutput ? this.executionPort.readBackgroundBashOutput(e, t) : {
        kind: "unsupported",
        workId: e
    }
}
var DAo = Y(() => {
    "use strict";
    r(RAo, "readBackgroundBashOutput")
});

function H_t(e, t, n) {
    if (!t) return;
    let o = t.fallbackReasonCode ? {
        state: "fellBack",
        reasonCode: t.fallbackReasonCode
    } : t.admittedDelivery === "guide" ? {
        state: n === "drained" ? "guided" : "steering"
    } : {
        state: "notRequested"
    };
    return {
        sourceCommandId: t.sourceCommandId,
        queueItemId: t.queueItemId,
        clientId: t.clientId,
        kind: t.kind,
        text: t.text ?? e,
        attachments: t.attachmentRefs ?? [],
        ...t.modelSelection ? {
            modelSelection: t.modelSelection
        } : {},
        ...t.mode ? {
            mode: t.mode
        } : {},
        ...t.planEnabled !== void 0 ? {
            planEnabled: t.planEnabled
        } : {},
        ...t.sharedContextRefs ? {
            sharedContextRefs: t.sharedContextRefs
        } : {},
        delivery: {
            requested: t.requestedDelivery,
            admitted: t.admittedDelivery,
            ...t.fallbackReasonCode ? {
                fallbackReasonCode: t.fallbackReasonCode
            } : {}
        },
        order: {
            admissionSeq: t.admissionSeq,
            ...t.queuePosition !== void 0 ? {
                queuePosition: t.queuePosition
            } : {}
        },
        steer: o,
        dispatch: {
            state: n
        },
        admittedAt: t.admittedAt,
        ...t.provenance ? {
            provenance: t.provenance
        } : {}
    }
}
var fxn = Y(() => {
    "use strict";
    r(H_t, "buildPersistedConversationInputIntent")
});

function MAo(e, t, n) {
    return om(e, this.sessionId, t, {
        turnId: n.turnId,
        traceId: n.traceId
    })
}
async function NAo(e, t) {
    let n = Qxa.has(e.type),
        o = Date.now();
    n && this.logger?.info("Session event persistence started", {
        ...Cr(t),
        event: "session.event.persistence.started",
        module: "core.runtime",
        sessionEventType: e.type,
        status: "started"
    });
    let s = "event_store.append";
    try {
        let a = await this.eventStore.append(e);
        if (s = "session_event.persist_durable", await oTa.call(this, a, t), s = "session_event.record_usage", await pxo(this, a, t), s = "session_event.notify_sinks", await this.notifyEventSinks(a, t), n && this.logger?.info("Session event persistence completed", {
                ...Cr(t),
                durationMs: Date.now() - o,
                event: "session.event.persistence.completed",
                module: "core.runtime",
                sessionEventSequenceNumber: a.sequenceNumber,
                sessionEventType: a.type,
                status: "completed"
            }), eTa.call(this, a, t)) return;
        tTa.call(this, t, "low_frequency_event"), this.logger?.debug("Session event appended", {
            ...Cr(t),
            event: "event_store.appended",
            module: "core.runtime",
            sessionEventSequenceNumber: a.sequenceNumber,
            sessionEventType: a.type
        })
    } catch (a) {
        throw n && this.logger?.warn("Session event persistence failed", {
            ...Cr(t),
            durationMs: Date.now() - o,
            errorMessage: a instanceof Error ? a.message : String(a),
            event: "session.event.persistence.failed",
            module: "core.runtime",
            phase: s,
            sessionEventType: e.type,
            status: "failed"
        }), a
    }
}

function eTa(e, t) {
    if (!Xxa.has(e.type)) return !1;
    let n = `${t.turnId??"session"}:${e.type}`,
        o = nTa(this),
        s = rTa(e.payload),
        a = o.get(n);
    return a ? (a.eventCount += 1, a.lastEventId = String(e.id), a.lastSessionEventSequenceNumber = e.sequenceNumber, a.payloadBytes += OAo(e.payload), a.payloadKinds[s] = (a.payloadKinds[s] ?? 0) + 1, a.eventCount >= Yxa && LAo.call(this, n, a, t, "count_threshold"), !0) : (o.set(n, {
        eventCount: 1,
        eventType: e.type,
        firstEventId: String(e.id),
        firstSessionEventSequenceNumber: e.sequenceNumber,
        lastEventId: String(e.id),
        lastSessionEventSequenceNumber: e.sequenceNumber,
        payloadBytes: OAo(e.payload),
        payloadKinds: {
            [s]: 1
        }
    }), !0)
}

function tTa(e, t) {
    let n = G_t.get(this);
    if (!(!n || n.size === 0))
        for (let [o, s] of n) LAo.call(this, o, s, e, t)
}

function LAo(e, t, n, o) {
    G_t.get(this)?.delete(e), this.logger?.debug("Session event append summary", {
        ...Cr(n),
        event: "event_store.appended.summary",
        eventCount: t.eventCount,
        firstEventId: t.firstEventId,
        firstSessionEventSequenceNumber: t.firstSessionEventSequenceNumber,
        flushReason: o,
        lastEventId: t.lastEventId,
        lastSessionEventSequenceNumber: t.lastSessionEventSequenceNumber,
        module: "core.runtime",
        payloadBytes: t.payloadBytes,
        payloadKinds: t.payloadKinds,
        sessionEventType: t.eventType
    })
}

function nTa(e) {
    let t = G_t.get(e);
    return t || (t = new Map, G_t.set(e, t)), t
}

function rTa(e) {
    if (e && typeof e == "object" && !Array.isArray(e)) {
        let t = e.kind;
        if (typeof t == "string" && t.length > 0) return t
    }
    return "<missing>"
}

function OAo(e) {
    try {
        return Buffer.byteLength(JSON.stringify(e) ?? "null", "utf8")
    } catch {
        return 0
    }
}
async function oTa(e, t) {
    if (this.sessionStore) {
        if (e.type === ut.CheckpointCreated) {
            await KIo(this, e, t);
            return
        }
        if (e.type === ut.RewindTriggered) {
            await ZIo(this, e, t);
            return
        }
        if (e.type === ut.UserInputAutoResolutionUpdated) {
            let n = e.payload;
            try {
                await this.sessionStore.saveSessionEntry?.({
                    id: `user-input-auto-resolution:${n.interactionId}`,
                    sessionID: e.sessionId,
                    type: nPe,
                    time: {
                        created: n.autoResolution.startedAt,
                        updated: e.timestamp.getTime()
                    },
                    data: {
                        interactionId: n.interactionId,
                        toolCallId: n.toolCallId,
                        autoResolution: n.autoResolution,
                        eventId: e.id,
                        sequenceNumber: e.sequenceNumber,
                        traceId: e.traceId,
                        ...e.turnId ? {
                            turnId: e.turnId
                        } : {}
                    }
                })
            } catch (o) {
                this.logger?.warn("Failed to persist user input auto-resolution state", {
                    ...Cr(t),
                    errorMessage: o instanceof Error ? o.message : String(o),
                    event: "user_input_auto_resolution.persist_failed",
                    interactionId: n.interactionId,
                    module: "core.runtime",
                    status: "failed"
                })
            }
            return
        }
        if (e.type === ut.TurnSteerQueued) {
            let n = e.payload,
                o = H_t(n.input, n.intent, "queued");
            try {
                await this.sessionStore.saveSessionInput?.({
                    id: n.pendingInputId,
                    sessionID: e.sessionId,
                    kind: n.intent?.kind ?? n.commandKind ?? "sendText",
                    delivery: n.delivery ?? "queue",
                    payload: {
                        text: n.input,
                        ...n.intent ? {
                            intent: n.intent
                        } : {},
                        ...o ? {
                            conversationInputIntent: o
                        } : {}
                    }
                })
            } catch (s) {
                this.logger?.warn("Failed to admit session input to ledger", {
                    ...Cr(t),
                    errorMessage: s instanceof Error ? s.message : String(s),
                    event: "session_input.admit_failed",
                    module: "core.runtime",
                    pendingInputId: n.pendingInputId,
                    status: "failed"
                })
            }
            return
        }
        if (e.type === ut.TurnSteerDeliveryChanged) {
            let n = e.payload;
            try {
                await this.sessionStore.updateSessionInputs?.({
                    sessionID: e.sessionId,
                    updates: [{
                        delivery: n.admittedDelivery,
                        id: n.pendingInputId,
                        ...n.intent ? {
                            intent: n.intent
                        } : {}
                    }]
                })
            } catch (o) {
                this.logger?.warn("Failed to persist session input delivery fallback", {
                    ...Cr(t),
                    errorMessage: o instanceof Error ? o.message : String(o),
                    event: "session_input.delivery_change_failed",
                    module: "core.runtime",
                    pendingInputId: n.pendingInputId,
                    status: "failed"
                })
            }
            return
        }
        if (e.type === ut.TurnSteerDiscarded) {
            let n = e.payload;
            if (n.reason === "promoted") return;
            let o = n.reason === "session_resumed" ? "discarded" : "cancelled";
            for (let s of n.pendingInputIds) try {
                await this.sessionStore.settleSessionInput?.({
                    id: s,
                    sessionID: e.sessionId,
                    status: o,
                    reason: n.reason
                })
