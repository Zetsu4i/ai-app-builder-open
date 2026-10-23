                            ..._.sourcePath === void 0 ? {} : {
                                sourcePath: _.sourcePath
                            },
                            itemCount: _.itemCount,
                            ..._.primary === !0 ? {
                                primary: !0
                            } : {}
                        }
                    })
                }
            };
        return {
            ...g,
            summary: evo(g)
        }
    }, "getWorkflowRunHandler"), nvo = {
        capability: "Read one dynamic-workflow run's progress, final result, or failure",
        maxModelChars: L0a,
        metadata: {
            name: Vfe,
            description: F0a,
            readOnly: !0,
            destructive: !1,
            concurrentSafe: !0,
            timeoutMs: oSn,
            maxOutputBytes: W0t,
            sideEffectScope: "none",
            riskLevel: "low",
            needsApproval: !1
        },
        handler: j0a,
        inputSchema: vvr,
        outputSchema: bvr,
        runtimeInputSchema: aet,
        runtimeOutputSchema: Ate,
        formatModelContent: Gyo,
        permission: {
            permission: "getWorkflowRun",
            reason: "GetWorkflowRun reads one run's record from the project's run journal",
            riskLevel: "low",
            sideEffectScope: "none",
            needsApproval: !1,
            patternSources: ["toolName", "input"],
            alwaysAllowPatternSources: ["toolName"],
            denyPriority: "beforeAsk"
        },
        resultBudget: {
            maxInlineBytes: W0t,
            maxModelBytes: W0t,
            strategy: "artifact",
            preview: {
                maxBytes: W0t,
                direction: "head"
            },
            artifact: {
                enabled: !0,
                retention: "session"
            }
        },
        resultArtifactContentType: "text/plain",
        timeout: {
            kind: "timed",
            defaultMs: oSn,
            maxMs: oSn,
            allowCallOverride: !1
        },
        cancellation: {
            supported: !1,
            cleanup: "none",
            userVisibleMessage: "GetWorkflowRun reads the run journal synchronously and cannot be cancelled"
        },
        trace: {
            required: !0,
            propagateToAdapters: !1,
            recordInput: "summary",
            recordOutput: "summary"
        }
    }
});

function U0a() {
    return {
        result: !1,
        errorCode: PJ.RESUME_UNAVAILABLE,
        message: "workflow_resume_unavailable: this session cannot resume workflow runs \u2014 workflow execution is not available here. This is a capability gap, not a status problem."
    }
}

function z0a(e, t, n) {
    switch (e) {
        case "compile_failed":
            return {
                result: !1, errorCode: PJ.COMPILE_FAILED, message: `workflow_run_compile_failed: the stored script of run ${t} no longer compiles against the current workflow facade, so it cannot be replayed as-is. Rewrite it for the current facade and submit it with AmendWorkflow, which keeps the finished work of this run.${n===void 0?"":`
${n}`}`
            };
        case "not_resumable":
            return {
                result: !1, errorCode: PJ.NOT_RESUMABLE, message: "workflow_run_not_resumable: this run is not in the resumable set \u2014 only a `stopped` run can be resumed (any stop reason except `superseded`). An `errored` run needs a corrected script submitted with AmendWorkflow; a completed run has nothing to resume. Check the status with GetWorkflowRun."
            };
        case "superseded":
            return {
                result: !1, errorCode: PJ.SUPERSEDED, message: `workflow_run_superseded: run ${t} was stopped by an AmendWorkflow and superseded; its unfinished work belongs to the successor run (see GetWorkflowRun's <superseded_by>). Read or amend the successor instead of resuming this run.`
            };
        case "already_running":
            return {
                result: !1, errorCode: PJ.ALREADY_RUNNING, message: "workflow_run_already_running: this run is already in flight in this session's workflow runtime. Wait for its completion notification instead of resuming it again."
            };
        case "script_missing":
            return {
                result: !1, errorCode: PJ.SCRIPT_MISSING, message: "workflow_run_script_missing: this run's journal record has no stored script text (it predates script persistence), so there is nothing to re-run. Start a fresh run with CreateWorkflow instead."
            };
        case "script_mismatch":
            return {
                result: !1, errorCode: PJ.SCRIPT_MISMATCH, message: `workflow_run_script_mismatch: the stored script hash for run ${t} no longer matches the stored script text \u2014 the journal record was modified by an outside force. Start a fresh run with CreateWorkflow instead.`
            };
        default:
            return {
                result: !1, errorCode: PJ.NOT_RESUMABLE, message: `workflow_run_not_resumable: the workflow runtime refused to resume run ${t} (reason: ${e}).`
            }
    }
}

function q0a(e) {
    let t = Hfe.safeParse(e);
    return t.success ? t.data.response : "ResumeWorkflowRun returned an invalid result."
}
var iSn, V0t, PJ, B0a, $0a, ovo, ivo = Y(() => {
    "use strict";
    ar();
    hJ();
    iSn = 15e3, V0t = 24e3, PJ = {
        RESUME_UNAVAILABLE: 11,
        NOT_RESUMABLE: 12,
        ALREADY_RUNNING: 13,
        SCRIPT_MISSING: 14,
        SCRIPT_MISMATCH: 15,
        SUPERSEDED: 16,
        COMPILE_FAILED: 17
    }, B0a = ["Resumes a dynamic-workflow run whose status is `stopped` \u2014 the user cancelled it, you stopped it with TaskStop, a provider-side error stopped it (expired sign-in, model not in the plan, quota cap), or the process that owned it exited (`interrupted`). The run continues under the same run ID: finished steps are replayed from the journal without spending tokens, unfinished steps are dispatched again. The one stopped run that is NOT resumable is a `superseded` one: an AmendWorkflow replaced it, and its successor is the live run.", "", "- Takes run_id \u2014 from CreateWorkflow's or AmendWorkflow's result, from a completion notification, or from GetWorkflowRun / ListWorkflowRuns.", "- The resumed run is backgrounded: you will be notified with the final output when it completes. Do not wait for it or poll it with TaskOutput; continue with other work unless the user asked you to wait.", "- An `errored` run (the script itself failed) is NOT resumable \u2014 replaying it would fail the same way. Fix the script and submit it with AmendWorkflow instead. A completed run is not resumable either; a `superseded` run is refused with the successor's ID.", "- Stop reason `user` means the user stopped it on purpose: resume it only when the user asks you to; never resume a run the user just cancelled on your own initiative. Reason `model` is your own TaskStop. Reason `provider` means a provider-side error stopped it: resolve the cause with the user first (the stop notification names it), then resume. Reason `interrupted` (the process died) is different: continuing it is usually what the user wants."].join(`
`);
    r(U0a, "workflowResumeUnavailableFailure");
    r(z0a, "resumeFailureFor");
    $0a = r(async (e, t) => {
        let n = cet.parse(e),
            o = t.dynamicWorkflowRunPort;
        if (o === void 0 || typeof o.resume != "function") return U0a();
        let s = await o.resume(n.run_id);
        return s.ok ? {
            ok: !0,
            runId: s.runId,
            response: `The workflow run ${s.runId} has been resumed and is running in the background. It is still running \u2014 you will be notified with the final output when it completes. Do not wait for it or poll it with TaskOutput; continue with other work unless the user asked you to wait.`,
            status: "backgrounded",
            backgroundTaskId: s.runId
        } : s.reason === "not_found" ? B_e(n.run_id) : z0a(s.reason, n.run_id, s.message)
    }, "resumeWorkflowRunHandler");
    r(q0a, "formatResumeWorkflowRunModelContent");
    ovo = {
        capability: "Resume a stopped dynamic-workflow run under the same run ID",
        metadata: {
            name: r3,
            description: B0a,
            readOnly: !1,
            destructive: !1,
            concurrentSafe: !0,
            timeoutMs: iSn,
            maxOutputBytes: V0t,
            sideEffectScope: "none",
            riskLevel: "low",
            needsApproval: !1
        },
        handler: $0a,
        inputSchema: Svr,
        outputSchema: wvr,
        runtimeInputSchema: cet,
        runtimeOutputSchema: Hfe,
        formatModelContent: q0a,
        permission: {
            permission: "resumeWorkflowRun",
            reason: "resumeWorkflowRun.runConfirmation: resuming continues executing a stopped workflow run",
            riskLevel: "low",
            sideEffectScope: "none",
            needsApproval: !1,
            patternSources: ["toolName", "input"],
            alwaysAllowPatternSources: ["toolName"],
            denyPriority: "beforeAsk"
        },
        resultBudget: {
            maxInlineBytes: V0t,
            maxModelBytes: V0t,
            strategy: "truncate",
            preview: {
                maxBytes: V0t,
                direction: "head"
            }
        },
        timeout: {
            kind: "timed",
            defaultMs: iSn,
            maxMs: iSn,
            allowCallOverride: !1
        },
        cancellation: {
            supported: !1,
            cleanup: "none",
            userVisibleMessage: "ResumeWorkflowRun resumes the run synchronously and cannot be cancelled"
        },
        trace: {
            required: !0,
            propagateToAdapters: !0,
            recordInput: "summary",
            recordOutput: "summary"
        }
    }
});

function Moe(e, t = {}) {
    let n = t.allowedTools ? new Set(t.allowedTools) : void 0,
        o = D_e(t.disallowedTools);
    for (let s of sSn) t.embeddedSearchEnabled === !0 && (s.metadata.name === "Glob" || s.metadata.name === "Grep") || n && !n.has(s.metadata.name) || o?.has(s.metadata.name) || o$(s.metadata.name) && t.includeAgent !== !0 || s.metadata.name === "Skill" && t.includeSkill === !1 || s.metadata.name === "SendMessage" && t.includeSendMessage !== !0 || s.metadata.name === "RespondToCoordinator" && t.includeRespondToCoordinator !== !0 || s.metadata.name === "submit_result" && t.includeSubmitResult !== !0 || s.metadata.name === "escalate" && t.includeEscalate !== !0 || s.metadata.name === "Workflow" && t.includeWorkflow !== !0 || (s.metadata.name === "CronCreate" || s.metadata.name === "CronList" || s.metadata.name === "CronUpdate" || s.metadata.name === "CronDelete") && t.includeAutomation !== !0 || (s.metadata.name === "OffPeakCreate" || s.metadata.name === "OffPeakList") && t.includeOffPeak !== !0 || t.includeDynamicWorkflow === !1 && W0a.has(s.metadata.name) || s.metadata.name === "js" && t.includeNodeRepl !== !0 || e.register(V0a(s, t), {
        silentDuplicateWarning: t.silentDuplicateWarnings
    })
}

function V0a(e, t) {
    return e.metadata.name === "Bash" ? Zuo({
        bashTimeoutPolicy: t.bashTimeoutPolicy,
        embeddedSearchEnabled: t.embeddedSearchEnabled
    }) : e.metadata.name === OPe && t.submitResultSchema !== void 0 ? ght(t.submitResultSchema) : e.metadata.name === "Agent" ? qyn({
        embeddedSearchEnabled: t.embeddedSearchEnabled,
        profiles: t.agentProfiles,
        dynamicWorkflowEnabled: t.includeDynamicWorkflow !== !1
    }) : e.metadata.name === "Task" ? Dfo({
        embeddedSearchEnabled: t.embeddedSearchEnabled,
        profiles: t.agentProfiles,
        dynamicWorkflowEnabled: t.includeDynamicWorkflow !== !1
    }) : e.metadata.name === "EnterPlanMode" ? nmo({
        embeddedSearchEnabled: t.embeddedSearchEnabled
    }) : e.metadata.name === "js" ? vpo({
        browserUseEnabled: t.includeBrowserUse === !0
    }) : e
}
var sSn, W0a, aSn = Y(() => {
    "use strict";
    ar();
    Woo();
    Yao();
    pco();
    Xuo();
    wyn();
    Spo();
    kpo();
    tfo();
    dfo();
    Ofo();
    Nge();
    Nfo();
    jfo();
    qfo();
    Jyn();
    lmo();
    dmo();
    fmo();
    hmo();
    Yyn();
    _mo();
    vmo();
    Dmo();
    Mmo();
    rho();
    xyo();
    Ybn();
    Eyo();
    Ryo();
    Oyo();
    jyo();
    Uyo();
    rvo();
    ivo();
    O_e();
    sSn = [qoo, Kao, dco, Zft, bpo, wpo, efo, ufo, Lfo, Ffo, Bfo, Ufo, zfo, $fo, Gfo, Jfo, dht, rmo, umo, pmo, mmo, iFe, gmo, Pmo, Omo, tho, loe, Rfo, Mfo, Wmt, wyo, kyo, Cyo, Fyo, Byo, nvo, ovo, ymo, Pyo, Dyo], W0a = new Set([Mv, By, jfe, Bfe, zfe, qfe, Nfe, Vfe, r3, eH]);
    r(Moe, "registerBuiltInTools");
    r(V0a, "resolveBuiltInToolEntryForBranch")
});
var svo = Y(() => {
    "use strict";
    hdt();
    Soo();
    Lmn();
    cSn();
    aSn()
});

function avo() {
    return ["Notes:", "- Agent threads always have their cwd reset between bash calls, as a result please only use absolute file paths.", "- In your final response, share file paths (always absolute, never relative) that are relevant to the task. Include code snippets only when the exact text is load-bearing (e.g., a bug you found, a function signature the caller asked for) \u2014 do not recap code you merely read.", "- For clear communication with the user the assistant MUST avoid using emojis.", '- Do not use a colon before tool calls. Text like "Let me read the file:" followed by a read tool call should just be "Let me read the file." with a period.', "- Do NOT Write report/summary/findings/analysis .md files. Return findings directly as your final assistant message \u2014 the parent agent reads your text output, not files you create."].join(`
`)
}

function cvo(e) {
    let {
        envInfo: t,
        model: n
