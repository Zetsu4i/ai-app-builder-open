    r(aeo, "isUsableDataUrl");
    r(wVs, "concreteMediaType");
    r(kVs, "isRecord")
});

function feo(e) {
    let t = new Map(e.map(o => [o.callID, o])),
        n = e.filter(o => t.get(o.callID) === o);
    return n.some(o => o.declarationIndex === void 0) ? n : n.sort((o, s) => o.declarationIndex - s.declarationIndex)
}
var meo = Y(() => {
    "use strict";
    r(feo, "selectToolPartsForHistory")
});
async function Ige(e) {
    let t = Uk(e.messages, {
            branchCutAfterMessageId: e.branchCutAfterMessageId,
            rewindCreatedMessageId: e.rewindCreatedMessageId,
            rewindKeptMessageIds: e.rewindKeptMessageIds,
            rewindTargetMessageId: e.rewindTargetMessageId
        }),
        n = 0,
        o = 0,
        s = 0;
    for (let a of t) {
        let l = TVs(a.parts);
        if (s += l.length, a.info.role === "user") {
            let _ = a.info.source === "shared_context" && a.info.metadata && typeof a.info.metadata == "object" ? a.info.metadata.sharedContextStatus : void 0;
            if (a.info.source === "shared_context" && _ !== void 0 && _ !== "attached") continue;
            let b = PVs(l);
            if (b) {
                e.history.addAttachment(b.source, b.content), n++;
                continue
            }
            let w = await IVs(l, e.artifactStore);
            if (w.length === 0) continue;
            let T = MA(a.info.metadata?.inputPresentation);
            e.history.addEntries(T ? w.map(I => I.kind === "attachment" ? I : {
                ...I,
                metadata: T
            }) : w), n++;
            continue
        }
        let u = MVs(l),
            f = NVs(l),
            g = feo(l.filter(LVs));
        if (!(u.trim().length === 0 && f.length === 0 && g.length === 0 && !Lut(a.info.tokens))) {
            e.history.addAssistant(u, g.map(_ => ({
                id: _.callID,
                input: _.state.input,
                name: heo(_)
            })), f, a.info.modelId && a.info.providerId ? {
                modelId: a.info.modelId,
                providerId: a.info.providerId
            } : void 0, a.info.tokens), n++;
            for (let _ of g) {
                let b = heo(_);
                if (_.state.status === "completed") {
                    let w = _.state.attachments ? await Promise.all(_.state.attachments.map(A => Yfn(A, e.artifactStore))) : [],
                        I = (w.length > 0 ? ceo(_.state.metadata?.modelContentLayout, w) : void 0) ?? _.state.output;
                    e.history.addToolResult(_.callID, b, I, !0);
                    continue
                }
                if (_.state.status === "error") {
                    let w = _.state.metadata?.modelContent;
                    e.history.addToolResult(_.callID, b, typeof w == "string" ? w : _.state.error, !1);
                    continue
                }
                o++, e.history.addToolResult(_.callID, b, xVs, !1)
            }
        }
    }
    return {
        appliedMessageCount: n,
        interruptedToolCount: o,
        messageCount: t.length,
        partCount: s
    }
}

function Uk(e, t = {}) {
    if (!t.branchCutAfterMessageId) {
        let s = -1;
        for (let l = e.length - 1; l >= 0; l--)
            if (e[l].parts.some(Kfn)) {
                s = l;
                break
            } let a = s >= 0 ? Gfn(e, s, t.includeCompactPreservedSegment !== !1) : e;
        if (t.rewindKeptMessageIds && s >= 0) {
            let l = new Set(e.slice(s).map(u => u.info.id));
            if (!t.rewindKeptMessageIds.some(u => l.has(u))) return a
        }
        return mA(a, t)
    }
    let n = mA(e, t),
        o = -1;
    for (let s = n.length - 1; s >= 0; s--)
        if (n[s].parts.some(Kfn)) {
            o = s;
            break
        } return o >= 0 ? Gfn(n, o, t.includeCompactPreservedSegment !== !1) : n
}

function TVs(e) {
    let t = new Map;
    for (let n of e) t.set(n.id, n);
    return [...t.values()]
}
async function IVs(e, t) {
    let n = [],
        o = [],
        s = [],
        a = [],
        l = [];
    for (let b of e) {
        if (b.type === "text" && !b.ignored) {
            let w = geo(b);
            if (w) {
                a.push(qg(w.source, w.content));
                continue
            }
            s.push({
                type: "text",
                text: AVs(b)
            });
            continue
        }
        if (b.type === "file") {
            let w = await Yfn(b, t);
            if (w.type === "text") {
                let T = EVs(b, w);
                if (T) {
                    let I = HMe(T).join(`
`);
                    l.push(qg("prompt_attachment", I));
                    continue
                }
            }
            w.type === "image" || w.type === "video" ? o.push(w) : n.push(w);
            continue
        }
        b.type === "agent" && s.push({
            type: "text",
            text: `[Selected agent: ${b.name}]`
        })
    }
    let u = CVs([...n, ...s, ...o], {
            preserveBlocks: n.length > 0 || o.length > 0
        }),
        f = zu(u).trim().length > 0,
        g = DVs(e),
        _ = f || g.source === "real_user" && l.length > 0;
    return !_ && a.length === 0 && l.length === 0 ? [] : [..._ ? [{
        message: {
            role: "user",
            content: u
        },
        metadata: g
    }] : [], ...a, ...l]
}

function CVs(e, t = {}) {
    if (t.preserveBlocks) return e.map(o => ({
        ...o
    }));
    let n = e.filter(o => o.type === "text");
    return e.length === n.length ? n.map(o => o.text).filter(Boolean).join(`

`) : e.map(o => ({
        ...o
    }))
}

function EVs(e, t) {
    if (e.mime.startsWith("text/")) {
        if (!e.source) return {
            content: t.text,
            kind: "inline_text",
            label: e.filename,
            preview: e.metadata?.preview
        };
        if (e.metadata?.storageKind === "inline" && !(e.metadata.recoverability !== "provider_ready" && e.metadata.recoverability !== "preview_only") && e.metadata.preview?.text === t.text) return {
            content: t.text,
            kind: "file",
            label: e.source.text.value ?? e.filename,
            preview: e.metadata.preview
        }
    }
}

function AVs(e) {
    if (!e.synthetic || _eo(e.text)) return e.text;
    let t = veo(e.metadata);
    return t?.source === "task_status" && e.metadata?.source !== "background_task" ? $F("task_status", e.text) : t?.source === "queued_system_notification" || e.metadata?.source === "subagent" ? $F("queued_system_notification", e.text) : e.text
}

function PVs(e) {
    let t = e.filter(o => !(o.type === "text" && o.ignored));
    if (t.length !== 1) return;
    let n = t[0];
    if (!(n.type !== "text" || !n.synthetic)) return geo(n)
}

function geo(e) {
    if (!e.synthetic || e.text.trim().length === 0 || _eo(e.text)) return;
    let t = yeo(e);
    if (RVs(t.source)) return {
        source: t.source,
        content: e.text
    }
}

function RVs(e) {
    if (!cB(e)) return !1;
    let t = xge(e);
    return t.isMeta && t.providerVisibility === "provider_visible" && t.channel !== "real_user" && t.channel !== "tool_result"
}

function _eo(e) {
    return e.trimStart().startsWith("<system-reminder")
}

function DVs(e) {
    let t = e.filter(a => a.type === "text" && !a.ignored),
        n = t.some(a => !a.synthetic),
        o = e.some(a => a.type === "file" || a.type === "agent");
    if (n || o) return aB();
    let s = t.find(a => a.synthetic);
    return s ? yeo(s) : aB()
}

function yeo(e) {
    let t = e.metadata?.source;
    if (t === "background_task" || t === "subagent_message") return AG();
    let n = veo(e.metadata);
    return n || (t === "subagent" ? D1("queued_system_notification") : t === "todo_reminder" ? Pre() : t === "goal-continuation" ? D1("target_continuation") : t === "rewind" || t === "fork" ? D1("rewind_notice") : cB(t) ? D1(t) : AG())
}

function veo(e) {
    let t = e?.runtimeMessage;
    if (!OVs(t)) return;
    let n = MA(t.inputPresentation);
    if (n) return n;
    let o = t.source;
    if (o === "real_user") return aB();
    if (o === "legacy_synthetic") return AG();
    if (o === "todo_reminder") return Pre();
    if (cB(o)) return D1(o)
}

function OVs(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e)
}

function MVs(e) {
    let t = [];
    for (let n of e) n.type === "text" && !n.ignored && t.push(n.text);
    return t.join(`

`)
}

function NVs(e) {
    let t = [];
    for (let n of e) n.type === "reasoning" && t.push({
        type: "reasoning",
        text: n.text,
        providerOptions: n.metadata ? {
            ...n.metadata
        } : void 0
    });
    return t
}

function LVs(e) {
    return e.type === "tool"
}

function heo(e) {
    let t = e.metadata?.providerToolName;
    return t !== void 0 && typeof t == "string" ? t : e.tool
}
var xVs, Cge = Y(() => {
    "use strict";
    Dre();
    ar();
    sB();
    Vfn();
    Hfn();
    Fm();
    Zfn();
    peo();
    meo();
    xVs = "[Tool execution was interrupted before resume]";
    r(Ige, "hydrateMessageHistoryFromSession");
    r(Uk, "activeSessionMessages");
    r(TVs, "dedupeParts");
    r(IVs, "userEntriesFromParts");
    r(CVs, "contentFromUserBlocks");
    r(EVs, "promptAttachmentReminderInputForFilePart");
    r(AVs, "textPartToProviderText");
    r(PVs, "syntheticSystemReminderAttachmentFromParts");
    r(geo, "syntheticSystemReminderAttachmentFromTextPart");
    r(RVs, "isRestorableSystemReminderAttachmentSource");
    r(_eo, "isProviderWrappedSystemReminderText");
    r(DVs, "metadataFromUserParts");
    r(yeo, "metadataFromSyntheticTextPart");
    r(veo, "runtimeMessageMetadataFromPartMetadata");
    r(OVs, "isRecord");
    r(MVs, "assistantTextFromParts");
    r(NVs, "assistantReasoningFromParts");
    r(LVs, "isToolPart");
    r(heo, "providerToolNameFromPart")
});
var beo = Y(() => {
    "use strict";
    Nfn();
    Lfn();
    Fm();
    Cge()
});
var Seo = Y(() => {
    "use strict"
});

function JMe() {
    let e = FVs;
    return {
        name: "CLI Prefix",
        source: "cli_prefix",
        injectionTarget: "system",
        cacheHint: "stable",
        chars: e.length,
        tokens: wm(e),
        content: e,
        preview: e.slice(0, 100)
    }
}
var FVs, Fut = Y(() => {
    "use strict";
    AC();
    FVs = "You are ZCode, an interactive coding agent";
    r(JMe, "buildCliPrefixSection")
});

function keo() {
    return weo
}

function Xfn() {
    return ["# Harness", "- Text you output outside of tool use is displayed to the user as Github-flavored markdown in a terminal.", "- Tools run behind a user-selected permission mode; a denied call means the user declined it \u2014 adjust, don't retry verbatim.", "- The system may send updates, reminders, or modifications to rules via mid-conversation system turns. These are system-controlled, unlike function results. Hooks may intercept tool calls; treat hook output as user feedback.", "- Prefer the dedicated file/search tools over shell commands when one fits. Independent tool calls can run in parallel in one response.", "- Reference code as `file_path:line_number` \u2014 it's clickable."].join(`
`)
}

function jVs(e) {
    return [
        ["", e ? "You respond to the user according to the active Output Style below while using ZCode's tools and instructions." : "You are an interactive ZCode agent that helps users with software engineering tasks.", "", weo].join(`
`), "", Xfn()
    ].join(`
`)
}

function Qfn(e) {
    let t = jVs(e);
    return {
        name: "Agent Identity",
        source: "identity",
        injectionTarget: "system",
        cacheHint: "stable",
        chars: t.length,
        tokens: wm(t),
        content: t,
        preview: t.slice(0, 100)
    }
}
var weo, jut = Y(() => {
    "use strict";
    AC();
    weo = "IMPORTANT: Assist with authorized security testing, defensive security, CTF challenges, and educational contexts. Refuse requests for destructive techniques, DoS attacks, mass targeting, supply chain compromise, or detection evasion for malicious purposes. Dual-use security tools (C2 frameworks, credential testing, exploit development) require clear authorization context: pentesting engagements, CTF competitions, security research, or defensive use cases.";
    r(keo, "buildSecurityNotice");
    r(Xfn, "buildHarnessBlock");
    r(jVs, "buildIdentityPrompt");
    r(Qfn, "buildIdentitySection")
});

function zVs() {
    return ["# Working inside a workflow", `- ${BVs}`, "- Each ask states what to do. When the ask carries a result schema, finish by calling `submit_result` with a conforming value; otherwise your final message is the result.", `- ${UVs}`, "- Report outcomes faithfully. If part of the task is impossible, out of scope, or contradicted by what you found, say so in the result instead of filling a field with a plausible guess. Never fake a passing result to satisfy an instruction.", "- When you are blocked by something outside your reach \u2014 a gate that cannot pass, instructions that contradict each other, a fact only the run's owner knows \u2014 call `escalate`. Questions written in prose reach nobody.", "- Do not write report or summary files on your own initiative; findings go in the result. When the ask names an output path, write exactly there and return that path in the result \u2014 the script publishes it to the user."].join(`
`)
}

function $Vs(e) {
    let t = e.name?.trim(),
        o = [`You are a subagent inside a dynamic workflow run${t?`, named "${t}"`:""}. A script created you and hands you work one ask at a time; the script \u2014 not a person \u2014 consumes what you return. There is no user in this conversation to talk to.`],
        s = e.persona?.trim();
    return [o.join(`
`), ...s ? ["", s] : [], "", keo(), "", Xfn(), "", zVs()].join(`
`)
}

function emn(e) {
    let t = $Vs(e);
    return {
        name: "Workflow Actor Identity",
        source: "workflow_actor_identity",
        injectionTarget: "system",
        cacheHint: "stable",
        chars: t.length,
        tokens: wm(t),
        content: t,
        preview: t.slice(0, 100)
    }
}
var BVs, UVs, tmn = Y(() => {
    "use strict";
    AC();
    jut();
    BVs = "You have the regular working tools \u2014 reading, searching, editing, running commands \u2014 plus `submit_result` and `escalate`. There is no tool that asks a person anything.", UVs = "Ground every claim in something you read or ran in this session, or in the material the ask gave you, and say which. Cite code as `path:line`. A check counts as passed only if you executed it here; if you could not run it, report it as not run. Run the check an ask names rather than a faster substitute, and say exactly which command you ran.";
    r(zVs, "buildWorkflowContract");
    r($Vs, "buildWorkflowActorIdentityPrompt");
    r(emn, "buildWorkflowActorIdentitySection")
});

function nmn(e, t) {
    let n = sHs(e, t);
    return {
        name: "Environment Info",
        source: "env_info",
        injectionTarget: "system",
        cacheHint: "dynamic",
        chars: n.length,
        tokens: wm(n),
        content: n,
        preview: n.slice(0, 100)
    }
}

function rmn(e) {
    if (!But(e)) return null;
    let t = aHs(e);
    return {
        name: "System Context",
        source: "system_context",
        injectionTarget: "system",
        cacheHint: "dynamic",
        chars: t.length,
        tokens: wm(t),
        content: t,
        preview: t.slice(0, 100)
    }
}

function sHs(e, t) {
    let n = But(e);
    return [qVs, "You have been invoked in the following environment:", `- ${WVs}: ${e.cwd}`, `- ${VVs}: ${n?KVs:ZVs}`, `- ${HVs}: ${e.platform}`, `- ${GVs}: ${e.shell}`, `- ${JVs}: ${e.osVersion}`, ...t ? [`- You are powered by the model named ${t.providerId}/${t.modelId}.`] : []].join(`
`)
}

function aHs(e) {
    let t = [YVs];
    return e.gitBranch && t.push("", `${XVs}: ${e.gitBranch}`), e.gitMainBranch && t.push("", `${QVs}: ${e.gitMainBranch}`), e.gitUser && t.push("", `${eHs}: ${e.gitUser}`), t.push("", `${tHs}:
${cHs(e)}`), t.push("", `${nHs}:
${lHs(e)}`), t.join(`
`)
}

function But(e) {
    return e.isGitRepository ?? (e.gitStatus !== void 0 ? e.gitStatus !== "not_repo" : !!e.gitBranch)
}

function cHs(e) {
    return e.gitStatusLines && e.gitStatusLines.length > 0 ? e.gitStatusLines.join(`
`) : e.gitStatus === "dirty" ? oHs : e.gitStatus === "clean" ? rHs : iHs
}

function lHs(e) {
    return e.recentCommits && e.recentCommits.length > 0 ? e.recentCommits.join(`
`) : ""
}
var qVs, WVs, VVs, HVs, GVs, JVs, KVs, ZVs, YVs, XVs, QVs, eHs, tHs, nHs, rHs, oHs, iHs, Uut = Y(() => {
    "use strict";
    AC();
    qVs = "# Environment", WVs = "Primary working directory", VVs = "Is a git repository", HVs = "Platform", GVs = "Shell", JVs = "OS Version", KVs = "yes", ZVs = "no", YVs = "gitStatus: This is the git status at the start of the conversation. Note that this status is a snapshot in time, and will not update during the conversation.", XVs = "Current branch", QVs = "Main branch (you will usually use this for PRs)", eHs = "Git user", tHs = "Status", nHs = "Recent commits", rHs = "(clean)", oHs = "(dirty)", iHs = "(unknown)";
    r(nmn, "buildEnvInfoSection");
    r(rmn, "buildGitSystemContextSection");
    r(sHs, "buildEnvInfoContent");
    r(aHs, "buildGitSystemContextContent");
    r(But, "isEnvInfoGitRepository");
    r(cHs, "formatGitStatus");
    r(lHs, "formatRecentCommits")
});

function KMe(e) {
    if (e.outcome.skills.length === 0) return null;
    let t = pHs(e.outcome.skills, e.metadataBudget ?? uHs);
    return {
        name: "Skills",
        source: "skills",
        injectionTarget: "meta_user",
        cacheHint: "dynamic",
        chars: t.length,
        tokens: wm(t),
        content: t,
        preview: t.slice(0, 100)
    }
}

function pHs(e, t) {
    let n = ["The following skills are available for use with the Skill tool:", ""],
        o = [...e].sort((u, f) => zut(u).localeCompare(zut(f))),
        s = o.map(u => fHs(u, dHs)),
        a = [...n, ...s].join(`
`);
    if (a.length <= t) return a;
    let l = o.map(u => `- ${zut(u)}${xeo(u)} (file: ${u.path})`);
    return [...n, ...l].join(`
`)
}

function fHs(e, t) {
    let n = e.whenToUse ? `${e.description} - ${e.whenToUse}` : e.description,
        o = n.length > t ? `${n.slice(0,t-1)}...` : n;
    return `- ${zut(e)}: ${o}${xeo(e)} (file: ${e.path})`
}

function zut(e) {
    return e.qualifiedName ?? e.name
}

function xeo(e) {
    return e.qualifiedName && e.qualifiedName !== e.name ? ` (also loadable as ${e.name})` : ""
}
var uHs, dHs, $ut = Y(() => {
    "use strict";
    AC();
    uHs = 2e4, dHs = 250;
    r(KMe, "buildSkillsSection");
    r(pHs, "buildSkillsContent");
    r(fHs, "formatSkillLine");
    r(zut, "skillDisplayName");
    r(xeo, "bareAliasSuffix")
});

function amn() {
    return {
        async: !1,
        breaks: !1,
        extensions: null,
        gfm: !0,
        hooks: null,
        pedantic: !1,
        renderer: null,
        silent: !1,
        tokenizer: null,
        walkTokens: null
    }
}

function Reo(e) {
    Mre = e
}

function sh(e, t = "") {
    let n = typeof e == "string" ? e : e.source,
        o = {
            replace: r((s, a) => {
                let l = typeof a == "string" ? a : a.source;
                return l = l.replace(PC.caret, "$1"), n = n.replace(s, l), o
            }, "replace"),
            getRegex: r(() => new RegExp(n, t), "getRegex")
        };
    return o
}

function lB(e, t) {
    if (t) {
        if (PC.escapeTest.test(e)) return e.replace(PC.escapeReplace, Ceo)
    } else if (PC.escapeTestNoEncode.test(e)) return e.replace(PC.escapeReplaceNoEncode, Ceo);
    return e
}

function Eeo(e) {
    try {
        e = encodeURI(e).replace(PC.percentDecode, "%")
    } catch {
        return null
    }
    return e
}

function Aeo(e, t) {
    let n = e.replace(PC.findPipe, (a, l, u) => {
            let f = !1,
                g = l;
            for (; --g >= 0 && u[g] === "\\";) f = !f;
            return f ? "|" : " |"
        }),
        o = n.split(PC.splitPipe),
        s = 0;
    if (o[0].trim() || o.shift(), o.length > 0 && !o.at(-1)?.trim() && o.pop(), t)
        if (o.length > t) o.splice(t);
        else
            for (; o.length < t;) o.push("");
    for (; s < o.length; s++) o[s] = o[s].trim().replace(PC.slashPipe, "|");
    return o
}

function YMe(e, t, n) {
    let o = e.length;
    if (o === 0) return "";
    let s = 0;
    for (; s < o;) {
        let a = e.charAt(o - s - 1);
        if (a === t && !n) s++;
        else if (a !== t && n) s++;
        else break
    }
    return e.slice(0, o - s)
}

function JHs(e, t) {
    if (e.indexOf(t[1]) === -1) return -1;
    let n = 0;
    for (let o = 0; o < e.length; o++)
        if (e[o] === "\\") o++;
        else if (e[o] === t[0]) n++;
    else if (e[o] === t[1] && (n--, n < 0)) return o;
    return n > 0 ? -2 : -1
}

function Peo(e, t, n, o, s) {
    let a = t.href,
        l = t.title || null,
        u = e[1].replace(s.other.outputLinkReplace, "$1");
    o.state.inLink = !0;
    let f = {
        type: e[0].charAt(0) === "!" ? "image" : "link",
        raw: n,
        href: a,
        title: l,
        text: u,
        tokens: o.inlineTokens(u)
    };
    return o.state.inLink = !1, f
}

function KHs(e, t, n) {
    let o = e.match(n.other.indentCodeCompensation);
    if (o === null) return t;
    let s = o[1];
    return t.split(`
`).map(a => {
        let l = a.match(n.other.beginningSpace);
        if (l === null) return a;
        let [u] = l;
        return u.length >= s.length ? a.slice(s.length) : a
    }).join(`
`)
}

function Z0(e, t) {
    return Ore.parse(e, t)
}
var Mre, QMe, mHs, PC, hHs, gHs, _Hs, eNe, yHs, cmn, Deo, Oeo, vHs, lmn, bHs, umn, SHs, wHs, Gut, dmn, kHs, Meo, xHs, pmn, Teo, THs, IHs, CHs, EHs, Neo, AHs, Jut, fmn, Leo, PHs, Feo, RHs, DHs, OHs, jeo, MHs, NHs, Beo, LHs, FHs, jHs, BHs, UHs, zHs, $Hs, Wut, qHs, Ueo, zeo, WHs, Ieo, mmn, VHs, omn, HHs, qut, ZMe, GHs, Ceo, Vut, w2, Hut, hmn, qF, XMe, ZHs, Ore, YSl, XSl, QSl, ewl, twl, nwl, rwl, $eo = Y(() => {
    r(amn, "L");
    Mre = amn();
    r(Reo, "G");
    QMe = {
        exec: r(() => null, "exec")
    };
    r(sh, "d");
    mHs = (() => {
        try {
            return !!new RegExp("(?<=1)(?<!1)")
        } catch {
            return !1
        }
    })(), PC = {
        codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
        outputLinkReplace: /\\([\[\]])/g,
        indentCodeCompensation: /^(\s+)(?:```)/,
        beginningSpace: /^\s+/,
        endingHash: /#$/,
        startingSpaceChar: /^ /,
        endingSpaceChar: / $/,
        nonSpaceChar: /[^ ]/,
        newLineCharGlobal: /\n/g,
        tabCharGlobal: /\t/g,
        multipleSpaceGlobal: /\s+/g,
        blankLine: /^[ \t]*$/,
        doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
        blockquoteStart: /^ {0,3}>/,
        blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
        blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
        listReplaceTabs: /^\t+/,
        listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
        listIsTask: /^\[[ xX]\] /,
        listReplaceTask: /^\[[ xX]\] +/,
        anyLine: /\n.*\n/,
        hrefBrackets: /^<(.*)>$/,
        tableDelimiter: /[:|]/,
        tableAlignChars: /^\||\| *$/g,
        tableRowBlankLine: /\n[ \t]*$/,
        tableAlignRight: /^ *-+: *$/,
        tableAlignCenter: /^ *:-+: *$/,
        tableAlignLeft: /^ *:-+ *$/,
        startATag: /^<a /i,
        endATag: /^<\/a>/i,
        startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
        endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
        startAngleBracket: /^</,
        endAngleBracket: />$/,
        pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
        unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
        escapeTest: /[&<>"']/,
        escapeReplace: /[&<>"']/g,
        escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
        escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
        unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
        caret: /(^|[^\[])\^/g,
        percentDecode: /%25/g,
        findPipe: /\|/g,
        splitPipe: / \|/,
        slashPipe: /\\\|/g,
        carriageReturn: /\r\n|\r/g,
        spaceLine: /^ +$/gm,
        notSpaceStart: /^\S*/,
        endingNewline: /\n$/,
        listItemRegex: r(e => new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`), "listItemRegex"),
        nextBulletRegex: r(e => new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), "nextBulletRegex"),
        hrRegex: r(e => new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), "hrRegex"),
        fencesBeginRegex: r(e => new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`), "fencesBeginRegex"),
        headingBeginRegex: r(e => new RegExp(`^ {0,${Math.min(3,e-1)}}#`), "headingBeginRegex"),
        htmlBeginRegex: r(e => new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`, "i"), "htmlBeginRegex")
    }, hHs = /^(?:[ \t]*(?:\n|$))+/, gHs = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, _Hs = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, eNe = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, yHs = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, cmn = /(?:[*+-]|\d{1,9}[.)])/, Deo = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Oeo = sh(Deo).replace(/bull/g, cmn).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), vHs = sh(Deo).replace(/bull/g, cmn).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), lmn = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, bHs = /^[^\n]+/, umn = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, SHs = sh(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", umn).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), wHs = sh(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, cmn).getRegex(), Gut = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", dmn = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, kHs = sh("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", dmn).replace("tag", Gut).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Meo = sh(lmn).replace("hr", eNe).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Gut).getRegex(), xHs = sh(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Meo).getRegex(), pmn = {
        blockquote: xHs,
        code: gHs,
        def: SHs,
        fences: _Hs,
        heading: yHs,
        hr: eNe,
        html: kHs,
        lheading: Oeo,
        list: wHs,
        newline: hHs,
        paragraph: Meo,
        table: QMe,
        text: bHs
    }, Teo = sh("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", eNe).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Gut).getRegex(), THs = {
        ...pmn,
        lheading: vHs,
        table: Teo,
        paragraph: sh(lmn).replace("hr", eNe).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Teo).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Gut).getRegex()
    }, IHs = {
        ...pmn,
        html: sh(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", dmn).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: QMe,
        lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
        paragraph: sh(lmn).replace("hr", eNe).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Oeo).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
    }, CHs = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, EHs = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Neo = /^( {2,}|\\)\n(?!\s*$)/, AHs = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Jut = /[\p{P}\p{S}]/u, fmn = /[\s\p{P}\p{S}]/u, Leo = /[^\s\p{P}\p{S}]/u, PHs = sh(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, fmn).getRegex(), Feo = /(?!~)[\p{P}\p{S}]/u, RHs = /(?!~)[\s\p{P}\p{S}]/u, DHs = /(?:[^\s\p{P}\p{S}]|~)/u, OHs = sh(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", mHs ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), jeo = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, MHs = sh(jeo, "u").replace(/punct/g, Jut).getRegex(), NHs = sh(jeo, "u").replace(/punct/g, Feo).getRegex(), Beo = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", LHs = sh(Beo, "gu").replace(/notPunctSpace/g, Leo).replace(/punctSpace/g, fmn).replace(/punct/g, Jut).getRegex(), FHs = sh(Beo, "gu").replace(/notPunctSpace/g, DHs).replace(/punctSpace/g, RHs).replace(/punct/g, Feo).getRegex(), jHs = sh("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, Leo).replace(/punctSpace/g, fmn).replace(/punct/g, Jut).getRegex(), BHs = sh(/\\(punct)/, "gu").replace(/punct/g, Jut).getRegex(), UHs = sh(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), zHs = sh(dmn).replace("(?:-->|$)", "-->").getRegex(), $Hs = sh("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", zHs).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Wut = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/, qHs = sh(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Wut).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Ueo = sh(/^!?\[(label)\]\[(ref)\]/).replace("label", Wut).replace("ref", umn).getRegex(), zeo = sh(/^!?\[(ref)\](?:\[\])?/).replace("ref", umn).getRegex(), WHs = sh("reflink|nolink(?!\\()", "g").replace("reflink", Ueo).replace("nolink", zeo).getRegex(), Ieo = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, mmn = {
        _backpedal: QMe,
        anyPunctuation: BHs,
        autolink: UHs,
        blockSkip: OHs,
        br: Neo,
        code: EHs,
        del: QMe,
        emStrongLDelim: MHs,
        emStrongRDelimAst: LHs,
        emStrongRDelimUnd: jHs,
        escape: CHs,
        link: qHs,
        nolink: zeo,
        punctuation: PHs,
        reflink: Ueo,
        reflinkSearch: WHs,
        tag: $Hs,
        text: AHs,
        url: QMe
    }, VHs = {
        ...mmn,
        link: sh(/^!?\[(label)\]\((.*?)\)/).replace("label", Wut).getRegex(),
        reflink: sh(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Wut).getRegex()
    }, omn = {
        ...mmn,
        emStrongRDelimAst: FHs,
        emStrongLDelim: NHs,
        url: sh(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", Ieo).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
        _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
        text: sh(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", Ieo).getRegex()
    }, HHs = {
        ...omn,
        br: sh(Neo).replace("{2,}", "*").getRegex(),
        text: sh(omn.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
    }, qut = {
        normal: pmn,
        gfm: THs,
        pedantic: IHs
    }, ZMe = {
        normal: mmn,
        gfm: omn,
        breaks: HHs,
        pedantic: VHs
    }, GHs = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }, Ceo = r(e => GHs[e], "ge");
    r(lB, "w");
    r(Eeo, "J");
    r(Aeo, "V");
    r(YMe, "z");
    r(JHs, "fe");
    r(Peo, "me");
    r(KHs, "Ye");
    Vut = class {
        static {
            r(this, "y")
        }
        options;
        rules;
        lexer;
        constructor(e) {
            this.options = e || Mre
        }
        space(e) {
            let t = this.rules.block.newline.exec(e);
            if (t && t[0].length > 0) return {
                type: "space",
                raw: t[0]
            }
        }
        code(e) {
            let t = this.rules.block.code.exec(e);
            if (t) {
                let n = t[0].replace(this.rules.other.codeRemoveIndent, "");
                return {
                    type: "code",
                    raw: t[0],
                    codeBlockStyle: "indented",
                    text: this.options.pedantic ? n : YMe(n, `
`)
                }
            }
        }
        fences(e) {
            let t = this.rules.block.fences.exec(e);
            if (t) {
                let n = t[0],
                    o = KHs(n, t[3] || "", this.rules);
                return {
                    type: "code",
                    raw: n,
                    lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
                    text: o
                }
            }
        }
        heading(e) {
            let t = this.rules.block.heading.exec(e);
            if (t) {
                let n = t[2].trim();
                if (this.rules.other.endingHash.test(n)) {
                    let o = YMe(n, "#");
                    (this.options.pedantic || !o || this.rules.other.endingSpaceChar.test(o)) && (n = o.trim())
                }
                return {
                    type: "heading",
                    raw: t[0],
                    depth: t[1].length,
                    text: n,
                    tokens: this.lexer.inline(n)
                }
            }
        }
        hr(e) {
            let t = this.rules.block.hr.exec(e);
            if (t) return {
                type: "hr",
                raw: YMe(t[0], `
`)
            }
        }
        blockquote(e) {
            let t = this.rules.block.blockquote.exec(e);
            if (t) {
                let n = YMe(t[0], `
`).split(`
`),
                    o = "",
                    s = "",
                    a = [];
                for (; n.length > 0;) {
                    let l = !1,
                        u = [],
                        f;
                    for (f = 0; f < n.length; f++)
                        if (this.rules.other.blockquoteStart.test(n[f])) u.push(n[f]), l = !0;
                        else if (!l) u.push(n[f]);
                    else break;
                    n = n.slice(f);
                    let g = u.join(`
`),
                        _ = g.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
                    o = o ? `${o}
${g}` : g, s = s ? `${s}
${_}` : _;
                    let b = this.lexer.state.top;
                    if (this.lexer.state.top = !0, this.lexer.blockTokens(_, a, !0), this.lexer.state.top = b, n.length === 0) break;
                    let w = a.at(-1);
                    if (w?.type === "code") break;
                    if (w?.type === "blockquote") {
                        let T = w,
                            I = T.raw + `
` + n.join(`
`),
                            A = this.blockquote(I);
                        a[a.length - 1] = A, o = o.substring(0, o.length - T.raw.length) + A.raw, s = s.substring(0, s.length - T.text.length) + A.text;
                        break
                    } else if (w?.type === "list") {
                        let T = w,
                            I = T.raw + `
` + n.join(`
`),
                            A = this.list(I);
                        a[a.length - 1] = A, o = o.substring(0, o.length - w.raw.length) + A.raw, s = s.substring(0, s.length - T.raw.length) + A.raw, n = I.substring(a.at(-1).raw.length).split(`
`);
                        continue
                    }
                }
                return {
                    type: "blockquote",
                    raw: o,
                    tokens: a,
                    text: s
                }
            }
        }
        list(e) {
            let t = this.rules.block.list.exec(e);
            if (t) {
                let n = t[1].trim(),
                    o = n.length > 1,
                    s = {
                        type: "list",
                        raw: "",
                        ordered: o,
                        start: o ? +n.slice(0, -1) : "",
                        loose: !1,
                        items: []
                    };
                n = o ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = o ? n : "[*+-]");
                let a = this.rules.other.listItemRegex(n),
                    l = !1;
                for (; e;) {
                    let f = !1,
                        g = "",
                        _ = "";
                    if (!(t = a.exec(e)) || this.rules.block.hr.test(e)) break;
                    g = t[0], e = e.substring(g.length);
                    let b = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, L => " ".repeat(3 * L.length)),
                        w = e.split(`
`, 1)[0],
                        T = !b.trim(),
                        I = 0;
                    if (this.options.pedantic ? (I = 2, _ = b.trimStart()) : T ? I = t[1].length + 1 : (I = t[2].search(this.rules.other.nonSpaceChar), I = I > 4 ? 1 : I, _ = b.slice(I), I += t[1].length), T && this.rules.other.blankLine.test(w) && (g += w + `
`, e = e.substring(w.length + 1), f = !0), !f) {
                        let L = this.rules.other.nextBulletRegex(I),
                            U = this.rules.other.hrRegex(I),
                            j = this.rules.other.fencesBeginRegex(I),
                            z = this.rules.other.headingBeginRegex(I),
                            $ = this.rules.other.htmlBeginRegex(I);
                        for (; e;) {
                            let K = e.split(`
`, 1)[0],
                                q;
                            if (w = K, this.options.pedantic ? (w = w.replace(this.rules.other.listReplaceNesting, "  "), q = w) : q = w.replace(this.rules.other.tabCharGlobal, "    "), j.test(w) || z.test(w) || $.test(w) || L.test(w) || U.test(w)) break;
                            if (q.search(this.rules.other.nonSpaceChar) >= I || !w.trim()) _ += `
` + q.slice(I);
                            else {
                                if (T || b.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || j.test(b) || z.test(b) || U.test(b)) break;
                                _ += `
` + w
                            }!T && !w.trim() && (T = !0), g += K + `
`, e = e.substring(K.length + 1), b = q.slice(I)
                        }
                    }
                    s.loose || (l ? s.loose = !0 : this.rules.other.doubleBlankLine.test(g) && (l = !0));
                    let A = null,
                        R;
                    this.options.gfm && (A = this.rules.other.listIsTask.exec(_), A && (R = A[0] !== "[ ] ", _ = _.replace(this.rules.other.listReplaceTask, ""))), s.items.push({
                        type: "list_item",
                        raw: g,
                        task: !!A,
                        checked: R,
                        loose: !1,
                        text: _,
                        tokens: []
                    }), s.raw += g
                }
                let u = s.items.at(-1);
                if (u) u.raw = u.raw.trimEnd(), u.text = u.text.trimEnd();
                else return;
                s.raw = s.raw.trimEnd();
                for (let f = 0; f < s.items.length; f++)
                    if (this.lexer.state.top = !1, s.items[f].tokens = this.lexer.blockTokens(s.items[f].text, []), !s.loose) {
                        let g = s.items[f].tokens.filter(b => b.type === "space"),
                            _ = g.length > 0 && g.some(b => this.rules.other.anyLine.test(b.raw));
                        s.loose = _
                    } if (s.loose)
                    for (let f = 0; f < s.items.length; f++) s.items[f].loose = !0;
                return s
            }
        }
        html(e) {
            let t = this.rules.block.html.exec(e);
            if (t) return {
                type: "html",
                block: !0,
                raw: t[0],
                pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
                text: t[0]
            }
        }
        def(e) {
            let t = this.rules.block.def.exec(e);
            if (t) {
                let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "),
                    o = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "",
                    s = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
                return {
                    type: "def",
                    tag: n,
                    raw: t[0],
                    href: o,
                    title: s
                }
            }
        }
        table(e) {
            let t = this.rules.block.table.exec(e);
            if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
            let n = Aeo(t[1]),
                o = t[2].replace(this.rules.other.tableAlignChars, "").split("|"),
                s = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [],
                a = {
                    type: "table",
                    raw: t[0],
                    header: [],
                    align: [],
                    rows: []
                };
            if (n.length === o.length) {
                for (let l of o) this.rules.other.tableAlignRight.test(l) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(l) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(l) ? a.align.push("left") : a.align.push(null);
                for (let l = 0; l < n.length; l++) a.header.push({
                    text: n[l],
                    tokens: this.lexer.inline(n[l]),
                    header: !0,
                    align: a.align[l]
                });
                for (let l of s) a.rows.push(Aeo(l, a.header.length).map((u, f) => ({
                    text: u,
                    tokens: this.lexer.inline(u),
                    header: !1,
                    align: a.align[f]
                })));
                return a
            }
        }
        lheading(e) {
            let t = this.rules.block.lheading.exec(e);
            if (t) return {
                type: "heading",
                raw: t[0],
                depth: t[2].charAt(0) === "=" ? 1 : 2,
                text: t[1],
                tokens: this.lexer.inline(t[1])
            }
        }
        paragraph(e) {
            let t = this.rules.block.paragraph.exec(e);
            if (t) {
                let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
                return {
                    type: "paragraph",
                    raw: t[0],
                    text: n,
                    tokens: this.lexer.inline(n)
                }
            }
        }
        text(e) {
            let t = this.rules.block.text.exec(e);
            if (t) return {
                type: "text",
                raw: t[0],
                text: t[0],
                tokens: this.lexer.inline(t[0])
            }
        }
        escape(e) {
            let t = this.rules.inline.escape.exec(e);
            if (t) return {
                type: "escape",
                raw: t[0],
                text: t[1]
            }
        }
        tag(e) {
            let t = this.rules.inline.tag.exec(e);
            if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
                type: "html",
                raw: t[0],
                inLink: this.lexer.state.inLink,
                inRawBlock: this.lexer.state.inRawBlock,
                block: !1,
                text: t[0]
            }
        }
        link(e) {
            let t = this.rules.inline.link.exec(e);
            if (t) {
                let n = t[2].trim();
                if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
                    if (!this.rules.other.endAngleBracket.test(n)) return;
                    let a = YMe(n.slice(0, -1), "\\");
                    if ((n.length - a.length) % 2 === 0) return
                } else {
                    let a = JHs(t[2], "()");
                    if (a === -2) return;
                    if (a > -1) {
                        let l = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + a;
                        t[2] = t[2].substring(0, a), t[0] = t[0].substring(0, l).trim(), t[3] = ""
                    }
                }
                let o = t[2],
                    s = "";
                if (this.options.pedantic) {
                    let a = this.rules.other.pedanticHrefTitle.exec(o);
                    a && (o = a[1], s = a[3])
                } else s = t[3] ? t[3].slice(1, -1) : "";
                return o = o.trim(), this.rules.other.startAngleBracket.test(o) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? o = o.slice(1) : o = o.slice(1, -1)), Peo(t, {
                    href: o && o.replace(this.rules.inline.anyPunctuation, "$1"),
                    title: s && s.replace(this.rules.inline.anyPunctuation, "$1")
                }, t[0], this.lexer, this.rules)
            }
        }
        reflink(e, t) {
            let n;
            if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
                let o = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "),
                    s = t[o.toLowerCase()];
                if (!s) {
                    let a = n[0].charAt(0);
                    return {
                        type: "text",
                        raw: a,
                        text: a
                    }
                }
                return Peo(n, s, n[0], this.lexer, this.rules)
            }
        }
        emStrong(e, t, n = "") {
            let o = this.rules.inline.emStrongLDelim.exec(e);
            if (!(!o || o[3] && n.match(this.rules.other.unicodeAlphaNumeric)) && (!(o[1] || o[2]) || !n || this.rules.inline.punctuation.exec(n))) {
                let s = [...o[0]].length - 1,
                    a, l, u = s,
                    f = 0,
                    g = o[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
                for (g.lastIndex = 0, t = t.slice(-1 * e.length + s);
                    (o = g.exec(t)) != null;) {
                    if (a = o[1] || o[2] || o[3] || o[4] || o[5] || o[6], !a) continue;
                    if (l = [...a].length, o[3] || o[4]) {
                        u += l;
                        continue
                    } else if ((o[5] || o[6]) && s % 3 && !((s + l) % 3)) {
                        f += l;
                        continue
                    }
                    if (u -= l, u > 0) continue;
                    l = Math.min(l, l + u + f);
                    let _ = [...o[0]][0].length,
                        b = e.slice(0, s + o.index + _ + l);
                    if (Math.min(s, l) % 2) {
                        let T = b.slice(1, -1);
                        return {
                            type: "em",
                            raw: b,
                            text: T,
                            tokens: this.lexer.inlineTokens(T)
                        }
                    }
                    let w = b.slice(2, -2);
                    return {
                        type: "strong",
                        raw: b,
                        text: w,
                        tokens: this.lexer.inlineTokens(w)
                    }
                }
            }
        }
        codespan(e) {
            let t = this.rules.inline.code.exec(e);
            if (t) {
                let n = t[2].replace(this.rules.other.newLineCharGlobal, " "),
                    o = this.rules.other.nonSpaceChar.test(n),
                    s = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
                return o && s && (n = n.substring(1, n.length - 1)), {
                    type: "codespan",
                    raw: t[0],
                    text: n
                }
            }
        }
        br(e) {
            let t = this.rules.inline.br.exec(e);
            if (t) return {
                type: "br",
                raw: t[0]
            }
        }
        del(e) {
            let t = this.rules.inline.del.exec(e);
            if (t) return {
                type: "del",
                raw: t[0],
                text: t[2],
                tokens: this.lexer.inlineTokens(t[2])
            }
        }
        autolink(e) {
            let t = this.rules.inline.autolink.exec(e);
            if (t) {
                let n, o;
                return t[2] === "@" ? (n = t[1], o = "mailto:" + n) : (n = t[1], o = n), {
                    type: "link",
                    raw: t[0],
                    text: n,
                    href: o,
                    tokens: [{
                        type: "text",
                        raw: n,
                        text: n
                    }]
                }
            }
        }
        url(e) {
            let t;
            if (t = this.rules.inline.url.exec(e)) {
                let n, o;
                if (t[2] === "@") n = t[0], o = "mailto:" + n;
                else {
                    let s;
                    do s = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? ""; while (s !== t[0]);
                    n = t[0], t[1] === "www." ? o = "http://" + t[0] : o = t[0]
                }
                return {
                    type: "link",
                    raw: t[0],
                    text: n,
                    href: o,
                    tokens: [{
                        type: "text",
                        raw: n,
                        text: n
                    }]
                }
            }
        }
        inlineText(e) {
            let t = this.rules.inline.text.exec(e);
            if (t) {
                let n = this.lexer.state.inRawBlock;
                return {
                    type: "text",
                    raw: t[0],
                    text: t[0],
                    escaped: n
                }
            }
        }
    }, w2 = class imn {
        static {
            r(this, "l")
        }
        tokens;
        options;
        state;
        tokenizer;
        inlineQueue;
        constructor(t) {
            this.tokens = [], this.tokens.links = Object.create(null), this.options = t || Mre, this.options.tokenizer = this.options.tokenizer || new Vut, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
                inLink: !1,
                inRawBlock: !1,
                top: !0
            };
            let n = {
                other: PC,
                block: qut.normal,
                inline: ZMe.normal
            };
            this.options.pedantic ? (n.block = qut.pedantic, n.inline = ZMe.pedantic) : this.options.gfm && (n.block = qut.gfm, this.options.breaks ? n.inline = ZMe.breaks : n.inline = ZMe.gfm), this.tokenizer.rules = n
        }
        static get rules() {
            return {
                block: qut,
                inline: ZMe
            }
        }
        static lex(t, n) {
            return new imn(n).lex(t)
        }
        static lexInline(t, n) {
            return new imn(n).inlineTokens(t)
        }
        lex(t) {
            t = t.replace(PC.carriageReturn, `
`), this.blockTokens(t, this.tokens);
            for (let n = 0; n < this.inlineQueue.length; n++) {
                let o = this.inlineQueue[n];
                this.inlineTokens(o.src, o.tokens)
            }
            return this.inlineQueue = [], this.tokens
        }
        blockTokens(t, n = [], o = !1) {
            for (this.options.pedantic && (t = t.replace(PC.tabCharGlobal, "    ").replace(PC.spaceLine, "")); t;) {
                let s;
                if (this.options.extensions?.block?.some(l => (s = l.call({
                        lexer: this
                    }, t, n)) ? (t = t.substring(s.raw.length), n.push(s), !0) : !1)) continue;
                if (s = this.tokenizer.space(t)) {
                    t = t.substring(s.raw.length);
                    let l = n.at(-1);
                    s.raw.length === 1 && l !== void 0 ? l.raw += `
` : n.push(s);
                    continue
                }
                if (s = this.tokenizer.code(t)) {
                    t = t.substring(s.raw.length);
                    let l = n.at(-1);
                    l?.type === "paragraph" || l?.type === "text" ? (l.raw += (l.raw.endsWith(`
`) ? "" : `
`) + s.raw, l.text += `
` + s.text, this.inlineQueue.at(-1).src = l.text) : n.push(s);
                    continue
                }
                if (s = this.tokenizer.fences(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.heading(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.hr(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.blockquote(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.list(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.html(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.def(t)) {
                    t = t.substring(s.raw.length);
                    let l = n.at(-1);
                    l?.type === "paragraph" || l?.type === "text" ? (l.raw += (l.raw.endsWith(`
`) ? "" : `
`) + s.raw, l.text += `
` + s.raw, this.inlineQueue.at(-1).src = l.text) : this.tokens.links[s.tag] || (this.tokens.links[s.tag] = {
                        href: s.href,
                        title: s.title
                    }, n.push(s));
                    continue
                }
                if (s = this.tokenizer.table(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                if (s = this.tokenizer.lheading(t)) {
                    t = t.substring(s.raw.length), n.push(s);
                    continue
                }
                let a = t;
                if (this.options.extensions?.startBlock) {
                    let l = 1 / 0,
                        u = t.slice(1),
                        f;
                    this.options.extensions.startBlock.forEach(g => {
                        f = g.call({
                            lexer: this
                        }, u), typeof f == "number" && f >= 0 && (l = Math.min(l, f))
                    }), l < 1 / 0 && l >= 0 && (a = t.substring(0, l + 1))
                }
                if (this.state.top && (s = this.tokenizer.paragraph(a))) {
                    let l = n.at(-1);
                    o && l?.type === "paragraph" ? (l.raw += (l.raw.endsWith(`
`) ? "" : `
`) + s.raw, l.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = l.text) : n.push(s), o = a.length !== t.length, t = t.substring(s.raw.length);
                    continue
                }
                if (s = this.tokenizer.text(t)) {
                    t = t.substring(s.raw.length);
                    let l = n.at(-1);
                    l?.type === "text" ? (l.raw += (l.raw.endsWith(`
`) ? "" : `
`) + s.raw, l.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = l.text) : n.push(s);
                    continue
                }
                if (t) {
                    let l = "Infinite loop on byte: " + t.charCodeAt(0);
                    if (this.options.silent) {
                        console.error(l);
                        break
                    } else throw new Error(l)
                }
            }
            return this.state.top = !0, n
        }
        inline(t, n = []) {
            return this.inlineQueue.push({
                src: t,
                tokens: n
            }), n
        }
        inlineTokens(t, n = []) {
            let o = t,
                s = null;
            if (this.tokens.links) {
                let f = Object.keys(this.tokens.links);
                if (f.length > 0)
                    for (;
                        (s = this.tokenizer.rules.inline.reflinkSearch.exec(o)) != null;) f.includes(s[0].slice(s[0].lastIndexOf("[") + 1, -1)) && (o = o.slice(0, s.index) + "[" + "a".repeat(s[0].length - 2) + "]" + o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))
            }
            for (;
                (s = this.tokenizer.rules.inline.anyPunctuation.exec(o)) != null;) o = o.slice(0, s.index) + "++" + o.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
            let a;
            for (;
                (s = this.tokenizer.rules.inline.blockSkip.exec(o)) != null;) a = s[2] ? s[2].length : 0, o = o.slice(0, s.index + a) + "[" + "a".repeat(s[0].length - a - 2) + "]" + o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
            o = this.options.hooks?.emStrongMask?.call({
                lexer: this
            }, o) ?? o;
            let l = !1,
                u = "";
            for (; t;) {
                l || (u = ""), l = !1;
                let f;
                if (this.options.extensions?.inline?.some(_ => (f = _.call({
                        lexer: this
                    }, t, n)) ? (t = t.substring(f.raw.length), n.push(f), !0) : !1)) continue;
                if (f = this.tokenizer.escape(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.tag(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.link(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.reflink(t, this.tokens.links)) {
                    t = t.substring(f.raw.length);
                    let _ = n.at(-1);
                    f.type === "text" && _?.type === "text" ? (_.raw += f.raw, _.text += f.text) : n.push(f);
                    continue
                }
                if (f = this.tokenizer.emStrong(t, o, u)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.codespan(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.br(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.del(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (f = this.tokenizer.autolink(t)) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                if (!this.state.inLink && (f = this.tokenizer.url(t))) {
                    t = t.substring(f.raw.length), n.push(f);
                    continue
                }
                let g = t;
                if (this.options.extensions?.startInline) {
                    let _ = 1 / 0,
                        b = t.slice(1),
                        w;
                    this.options.extensions.startInline.forEach(T => {
                        w = T.call({
                            lexer: this
                        }, b), typeof w == "number" && w >= 0 && (_ = Math.min(_, w))
                    }), _ < 1 / 0 && _ >= 0 && (g = t.substring(0, _ + 1))
                }
                if (f = this.tokenizer.inlineText(g)) {
                    t = t.substring(f.raw.length), f.raw.slice(-1) !== "_" && (u = f.raw.slice(-1)), l = !0;
                    let _ = n.at(-1);
                    _?.type === "text" ? (_.raw += f.raw, _.text += f.text) : n.push(f);
                    continue
                }
                if (t) {
                    let _ = "Infinite loop on byte: " + t.charCodeAt(0);
                    if (this.options.silent) {
                        console.error(_);
                        break
                    } else throw new Error(_)
                }
            }
            return n
        }
    }, Hut = class {
        static {
            r(this, "P")
        }
        options;
        parser;
        constructor(e) {
            this.options = e || Mre
        }
        space(e) {
            return ""
        }
        code({
            text: e,
            lang: t,
            escaped: n
        }) {
            let o = (t || "").match(PC.notSpaceStart)?.[0],
                s = e.replace(PC.endingNewline, "") + `
`;
            return o ? '<pre><code class="language-' + lB(o) + '">' + (n ? s : lB(s, !0)) + `</code></pre>
` : "<pre><code>" + (n ? s : lB(s, !0)) + `</code></pre>
`
        }
        blockquote({
            tokens: e
        }) {
            return `<blockquote>
${this.parser.parse(e)}</blockquote>
`
        }
        html({
            text: e
        }) {
            return e
        }
        def(e) {
            return ""
        }
        heading({
            tokens: e,
            depth: t
        }) {
            return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`
        }
        hr(e) {
            return `<hr>
`
        }
        list(e) {
            let t = e.ordered,
                n = e.start,
                o = "";
            for (let l = 0; l < e.items.length; l++) {
                let u = e.items[l];
                o += this.listitem(u)
            }
            let s = t ? "ol" : "ul",
                a = t && n !== 1 ? ' start="' + n + '"' : "";
            return "<" + s + a + `>
` + o + "</" + s + `>
`
        }
        listitem(e) {
            let t = "";
            if (e.task) {
                let n = this.checkbox({
                    checked: !!e.checked
                });
                e.loose ? e.tokens[0]?.type === "paragraph" ? (e.tokens[0].text = n + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = n + " " + lB(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
                    type: "text",
                    raw: n + " ",
                    text: n + " ",
                    escaped: !0
                }) : t += n + " "
            }
            return t += this.parser.parse(e.tokens, !!e.loose), `<li>${t}</li>
`
        }
        checkbox({
            checked: e
        }) {
            return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">'
        }
        paragraph({
            tokens: e
        }) {
            return `<p>${this.parser.parseInline(e)}</p>
`
        }
        table(e) {
            let t = "",
                n = "";
            for (let s = 0; s < e.header.length; s++) n += this.tablecell(e.header[s]);
            t += this.tablerow({
                text: n
            });
            let o = "";
            for (let s = 0; s < e.rows.length; s++) {
                let a = e.rows[s];
                n = "";
                for (let l = 0; l < a.length; l++) n += this.tablecell(a[l]);
                o += this.tablerow({
                    text: n
                })
            }
            return o && (o = `<tbody>${o}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + o + `</table>
`
        }
        tablerow({
            text: e
        }) {
            return `<tr>
${e}</tr>
`
        }
        tablecell(e) {
            let t = this.parser.parseInline(e.tokens),
                n = e.header ? "th" : "td";
            return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`
        }
        strong({
            tokens: e
        }) {
            return `<strong>${this.parser.parseInline(e)}</strong>`
        }
        em({
            tokens: e
        }) {
            return `<em>${this.parser.parseInline(e)}</em>`
        }
        codespan({
            text: e
        }) {
            return `<code>${lB(e,!0)}</code>`
        }
        br(e) {
            return "<br>"
        }
        del({
            tokens: e
        }) {
            return `<del>${this.parser.parseInline(e)}</del>`
        }
        link({
            href: e,
            title: t,
            tokens: n
        }) {
            let o = this.parser.parseInline(n),
                s = Eeo(e);
            if (s === null) return o;
            e = s;
            let a = '<a href="' + e + '"';
            return t && (a += ' title="' + lB(t) + '"'), a += ">" + o + "</a>", a
        }
        image({
            href: e,
            title: t,
            text: n,
            tokens: o
        }) {
            o && (n = this.parser.parseInline(o, this.parser.textRenderer));
            let s = Eeo(e);
            if (s === null) return lB(n);
            e = s;
            let a = `<img src="${e}" alt="${n}"`;
            return t && (a += ` title="${lB(t)}"`), a += ">", a
        }
        text(e) {
            return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : lB(e.text)
        }
    }, hmn = class {
        static {
            r(this, "$")
        }
        strong({
            text: e
        }) {
            return e
        }
        em({
            text: e
        }) {
            return e
        }
        codespan({
            text: e
        }) {
            return e
        }
        del({
            text: e
        }) {
            return e
        }
        html({
            text: e
        }) {
            return e
        }
        text({
            text: e
        }) {
            return e
        }
        link({
            text: e
        }) {
            return "" + e
        }
        image({
            text: e
        }) {
            return "" + e
        }
        br() {
            return ""
        }
    }, qF = class smn {
        static {
            r(this, "l")
        }
        options;
        renderer;
        textRenderer;
        constructor(t) {
            this.options = t || Mre, this.options.renderer = this.options.renderer || new Hut, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new hmn
        }
        static parse(t, n) {
            return new smn(n).parse(t)
        }
        static parseInline(t, n) {
            return new smn(n).parseInline(t)
        }
        parse(t, n = !0) {
            let o = "";
            for (let s = 0; s < t.length; s++) {
                let a = t[s];
                if (this.options.extensions?.renderers?.[a.type]) {
                    let u = a,
                        f = this.options.extensions.renderers[u.type].call({
                            parser: this
                        }, u);
                    if (f !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(u.type)) {
                        o += f || "";
                        continue
                    }
                }
                let l = a;
                switch (l.type) {
                    case "space": {
                        o += this.renderer.space(l);
                        continue
                    }
                    case "hr": {
                        o += this.renderer.hr(l);
                        continue
                    }
                    case "heading": {
                        o += this.renderer.heading(l);
                        continue
                    }
                    case "code": {
                        o += this.renderer.code(l);
                        continue
                    }
                    case "table": {
                        o += this.renderer.table(l);
                        continue
                    }
                    case "blockquote": {
                        o += this.renderer.blockquote(l);
                        continue
                    }
                    case "list": {
                        o += this.renderer.list(l);
                        continue
                    }
                    case "html": {
                        o += this.renderer.html(l);
                        continue
                    }
                    case "def": {
                        o += this.renderer.def(l);
                        continue
                    }
                    case "paragraph": {
                        o += this.renderer.paragraph(l);
                        continue
                    }
                    case "text": {
                        let u = l,
                            f = this.renderer.text(u);
                        for (; s + 1 < t.length && t[s + 1].type === "text";) u = t[++s], f += `
` + this.renderer.text(u);
                        n ? o += this.renderer.paragraph({
                            type: "paragraph",
                            raw: f,
                            text: f,
                            tokens: [{
                                type: "text",
                                raw: f,
                                text: f,
                                escaped: !0
                            }]
                        }) : o += f;
                        continue
                    }
                    default: {
                        let u = 'Token with "' + l.type + '" type was not found.';
                        if (this.options.silent) return console.error(u), "";
                        throw new Error(u)
                    }
                }
            }
            return o
        }
        parseInline(t, n = this.renderer) {
            let o = "";
            for (let s = 0; s < t.length; s++) {
                let a = t[s];
                if (this.options.extensions?.renderers?.[a.type]) {
                    let u = this.options.extensions.renderers[a.type].call({
                        parser: this
                    }, a);
                    if (u !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
                        o += u || "";
                        continue
                    }
                }
                let l = a;
                switch (l.type) {
                    case "escape": {
                        o += n.text(l);
                        break
                    }
                    case "html": {
                        o += n.html(l);
                        break
                    }
                    case "link": {
                        o += n.link(l);
                        break
                    }
                    case "image": {
                        o += n.image(l);
                        break
                    }
                    case "strong": {
                        o += n.strong(l);
                        break
                    }
                    case "em": {
                        o += n.em(l);
                        break
                    }
                    case "codespan": {
                        o += n.codespan(l);
                        break
                    }
                    case "br": {
                        o += n.br(l);
                        break
                    }
                    case "del": {
                        o += n.del(l);
                        break
                    }
                    case "text": {
                        o += n.text(l);
                        break
                    }
                    default: {
                        let u = 'Token with "' + l.type + '" type was not found.';
                        if (this.options.silent) return console.error(u), "";
                        throw new Error(u)
                    }
                }
            }
            return o
        }
    }, XMe = class {
        static {
            r(this, "S")
        }
        options;
        block;
        constructor(e) {
            this.options = e || Mre
        }
        static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
        static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
        preprocess(e) {
            return e
        }
        postprocess(e) {
            return e
        }
        processAllTokens(e) {
            return e
        }
        emStrongMask(e) {
            return e
        }
        provideLexer() {
            return this.block ? w2.lex : w2.lexInline
        }
        provideParser() {
            return this.block ? qF.parse : qF.parseInline
        }
    }, ZHs = class {
        static {
            r(this, "B")
        }
        defaults = amn();
        options = this.setOptions;
        parse = this.parseMarkdown(!0);
        parseInline = this.parseMarkdown(!1);
        Parser = qF;
        Renderer = Hut;
        TextRenderer = hmn;
        Lexer = w2;
        Tokenizer = Vut;
        Hooks = XMe;
        constructor(...e) {
            this.use(...e)
        }
        walkTokens(e, t) {
            let n = [];
            for (let o of e) switch (n = n.concat(t.call(this, o)), o.type) {
                case "table": {
                    let s = o;
                    for (let a of s.header) n = n.concat(this.walkTokens(a.tokens, t));
                    for (let a of s.rows)
                        for (let l of a) n = n.concat(this.walkTokens(l.tokens, t));
                    break
                }
                case "list": {
                    let s = o;
                    n = n.concat(this.walkTokens(s.items, t));
                    break
                }
                default: {
                    let s = o;
                    this.defaults.extensions?.childTokens?.[s.type] ? this.defaults.extensions.childTokens[s.type].forEach(a => {
                        let l = s[a].flat(1 / 0);
                        n = n.concat(this.walkTokens(l, t))
                    }) : s.tokens && (n = n.concat(this.walkTokens(s.tokens, t)))
                }
            }
            return n
        }
        use(...e) {
            let t = this.defaults.extensions || {
                renderers: {},
                childTokens: {}
            };
            return e.forEach(n => {
                let o = {
                    ...n
                };
                if (o.async = this.defaults.async || o.async || !1, n.extensions && (n.extensions.forEach(s => {
                        if (!s.name) throw new Error("extension name required");
                        if ("renderer" in s) {
                            let a = t.renderers[s.name];
                            a ? t.renderers[s.name] = function(...l) {
                                let u = s.renderer.apply(this, l);
                                return u === !1 && (u = a.apply(this, l)), u
                            } : t.renderers[s.name] = s.renderer
                        }
                        if ("tokenizer" in s) {
                            if (!s.level || s.level !== "block" && s.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
                            let a = t[s.level];
                            a ? a.unshift(s.tokenizer) : t[s.level] = [s.tokenizer], s.start && (s.level === "block" ? t.startBlock ? t.startBlock.push(s.start) : t.startBlock = [s.start] : s.level === "inline" && (t.startInline ? t.startInline.push(s.start) : t.startInline = [s.start]))
                        }
                        "childTokens" in s && s.childTokens && (t.childTokens[s.name] = s.childTokens)
                    }), o.extensions = t), n.renderer) {
                    let s = this.defaults.renderer || new Hut(this.defaults);
                    for (let a in n.renderer) {
                        if (!(a in s)) throw new Error(`renderer '${a}' does not exist`);
                        if (["options", "parser"].includes(a)) continue;
                        let l = a,
                            u = n.renderer[l],
                            f = s[l];
                        s[l] = (...g) => {
                            let _ = u.apply(s, g);
                            return _ === !1 && (_ = f.apply(s, g)), _ || ""
                        }
                    }
                    o.renderer = s
                }
                if (n.tokenizer) {
                    let s = this.defaults.tokenizer || new Vut(this.defaults);
                    for (let a in n.tokenizer) {
                        if (!(a in s)) throw new Error(`tokenizer '${a}' does not exist`);
                        if (["options", "rules", "lexer"].includes(a)) continue;
                        let l = a,
                            u = n.tokenizer[l],
                            f = s[l];
                        s[l] = (...g) => {
                            let _ = u.apply(s, g);
                            return _ === !1 && (_ = f.apply(s, g)), _
                        }
                    }
                    o.tokenizer = s
                }
                if (n.hooks) {
                    let s = this.defaults.hooks || new XMe;
                    for (let a in n.hooks) {
                        if (!(a in s)) throw new Error(`hook '${a}' does not exist`);
                        if (["options", "block"].includes(a)) continue;
                        let l = a,
                            u = n.hooks[l],
                            f = s[l];
                        XMe.passThroughHooks.has(a) ? s[l] = g => {
                            if (this.defaults.async && XMe.passThroughHooksRespectAsync.has(a)) return (async () => {
                                let b = await u.call(s, g);
                                return f.call(s, b)
                            })();
                            let _ = u.call(s, g);
                            return f.call(s, _)
                        } : s[l] = (...g) => {
                            if (this.defaults.async) return (async () => {
                                let b = await u.apply(s, g);
                                return b === !1 && (b = await f.apply(s, g)), b
                            })();
                            let _ = u.apply(s, g);
                            return _ === !1 && (_ = f.apply(s, g)), _
                        }
                    }
                    o.hooks = s
                }
                if (n.walkTokens) {
                    let s = this.defaults.walkTokens,
                        a = n.walkTokens;
                    o.walkTokens = function(l) {
                        let u = [];
                        return u.push(a.call(this, l)), s && (u = u.concat(s.call(this, l))), u
                    }
                }
                this.defaults = {
                    ...this.defaults,
                    ...o
                }
            }), this
        }
        setOptions(e) {
            return this.defaults = {
                ...this.defaults,
                ...e
            }, this
        }
        lexer(e, t) {
            return w2.lex(e, t ?? this.defaults)
        }
        parser(e, t) {
            return qF.parse(e, t ?? this.defaults)
        }
        parseMarkdown(e) {
            return (t, n) => {
                let o = {
                        ...n
                    },
                    s = {
                        ...this.defaults,
                        ...o
                    },
                    a = this.onError(!!s.silent, !!s.async);
                if (this.defaults.async === !0 && o.async === !1) return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
                if (typeof t > "u" || t === null) return a(new Error("marked(): input parameter is undefined or null"));
                if (typeof t != "string") return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected"));
                if (s.hooks && (s.hooks.options = s, s.hooks.block = e), s.async) return (async () => {
                    let l = s.hooks ? await s.hooks.preprocess(t) : t,
                        u = await (s.hooks ? await s.hooks.provideLexer() : e ? w2.lex : w2.lexInline)(l, s),
                        f = s.hooks ? await s.hooks.processAllTokens(u) : u;
                    s.walkTokens && await Promise.all(this.walkTokens(f, s.walkTokens));
                    let g = await (s.hooks ? await s.hooks.provideParser() : e ? qF.parse : qF.parseInline)(f, s);
                    return s.hooks ? await s.hooks.postprocess(g) : g
                })().catch(a);
                try {
                    s.hooks && (t = s.hooks.preprocess(t));
                    let l = (s.hooks ? s.hooks.provideLexer() : e ? w2.lex : w2.lexInline)(t, s);
                    s.hooks && (l = s.hooks.processAllTokens(l)), s.walkTokens && this.walkTokens(l, s.walkTokens);
                    let u = (s.hooks ? s.hooks.provideParser() : e ? qF.parse : qF.parseInline)(l, s);
                    return s.hooks && (u = s.hooks.postprocess(u)), u
                } catch (l) {
                    return a(l)
                }
            }
        }
        onError(e, t) {
            return n => {
                if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
                    let o = "<p>An error occurred:</p><pre>" + lB(n.message + "", !0) + "</pre>";
                    return t ? Promise.resolve(o) : o
                }
                if (t) return Promise.reject(n);
                throw n
            }
        }
    }, Ore = new ZHs;
    r(Z0, "k");
    Z0.options = Z0.setOptions = function(e) {
        return Ore.setOptions(e), Z0.defaults = Ore.defaults, Reo(Z0.defaults), Z0
    };
    Z0.getDefaults = amn;
    Z0.defaults = Mre;
    Z0.use = function(...e) {
        return Ore.use(...e), Z0.defaults = Ore.defaults, Reo(Z0.defaults), Z0
    };
    Z0.walkTokens = function(e, t) {
        return Ore.walkTokens(e, t)
    };
    Z0.parseInline = Ore.parseInline;
    Z0.Parser = qF;
    Z0.parser = qF.parse;
    Z0.Renderer = Hut;
    Z0.TextRenderer = hmn;
    Z0.Lexer = w2;
    Z0.lexer = w2.lex;
    Z0.Tokenizer = Vut;
    Z0.Hooks = XMe;
    Z0.parse = Z0;
    YSl = Z0.options, XSl = Z0.setOptions, QSl = Z0.use, ewl = Z0.walkTokens, twl = Z0.parseInline, nwl = qF.parse, rwl = w2.lex
});

function Kut(e) {
    let t = e.replace(YHs, "");
    return ymn(QHs(t))
}

function ymn(e) {
    let t = e.trim();
    if (!t) return "";
    let n = t.split(`
`),
        o = n.length,
        s = t.length,
        a = o > gmn,
        l = s > tNe;
    if (!a && !l) return t;
    let u = a ? n.slice(0, gmn).join(`
`) : t;
    if (u.length > tNe) {
        let g = u.lastIndexOf(`
`, tNe);
        u = u.slice(0, g > 0 ? g : tNe)
    }
    let f = l && !a ? `${_mn(s)} (limit: ${_mn(tNe)}) \u2014 index entries are too long` : a && !l ? `${o} lines (limit: ${gmn})` : `${o} lines and ${_mn(s)}`;
    return `${u}

> WARNING: MEMORY.md is ${f}. Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files.`
}

function _mn(e) {
    let t = e / 1024;
    if (t < 1) return `${e} bytes`;
    if (t < 1024) return `${t.toFixed(1).replace(/\.0$/u,"")}KB`;
    let n = t / 1024;
    return n < 1024 ? `${n.toFixed(1).replace(/\.0$/u,"")}MB` : `${(n/1024).toFixed(1).replace(/\.0$/u,"")}GB`
}

function QHs(e) {
    if (!e.includes("<!--")) return e;
    let t = "";
    for (let n of new w2({
            gfm: !1
        }).lex(e)) {
        if (n.type === "html") {
            let o = n.raw.trimStart();
            if (o.startsWith("<!--") && o.includes("-->")) {
                let s = n.raw.replace(XHs, "");
                s.trim().length > 0 && (t += s);
                continue
            }
        }
        t += n.raw
    }
    return t
}
var gmn, tNe, YHs, XHs, Zut = Y(() => {
    "use strict";
    $eo();
    gmn = 200, tNe = 25e3, YHs = /^---\s*\n[\s\S]*?---\s*\n?/u, XHs = /<!--[\s\S]*?-->/gu;
    r(Kut, "formatProjectMemoryIndexContent");
    r(ymn, "formatMemoryIndexContent");
    r(_mn, "formatBytes");
    r(QHs, "stripTopLevelMarkdownHtmlComments")
});

function Yut(e) {
    let t = eGs(e);
    return t ? {
        name: "Request User Context",
        source: "request_user_context",
        injectionTarget: "meta_user",
        cacheHint: "dynamic",
        chars: t.length,
        tokens: wm(t),
        content: t,
        preview: t.slice(0, 100)
    } : null
}

function eGs(e) {
    let t = [],
        n = e.userInstructions ? nGs(e.userInstructions) : null;
    n && t.push(n);
    let o = tGs(e.memoryRoot, e.memoryIndexContent);
    return o && t.push(o), t.length === 0 ? null : ["# agentsMd", "Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.", "", t.join(`

`)].join(`
`)
}

function tGs(e, t) {
    if (!e || t === void 0) return null;
    let n = Kut(t);
    return n ? [`Contents of ${(0,qeo.join)(e,"MEMORY.md")} (user's auto-memory, persists across conversations):`, "", n].join(`
`) : null
}

function nGs(e) {
    let t = rGs(e).map(n => oGs(n)).filter(n => n !== null);
    return t.length > 0 ? t.join(`

`) : null
}

function rGs(e) {
    return e.sources && e.sources.length > 0 ? e.sources : [{
        scope: "workspace",
        filePath: e.filePath,
        fileName: e.fileName,
        content: e.content,
        bytesRead: e.bytesRead,
        sizeBytes: e.sizeBytes,
        truncated: e.truncated
    }]
}

function oGs(e) {
    let n = (e.truncated ? `${e.content}

[File truncated: ${e.fileName}]` : e.content).trim();
    return n ? [`Contents of ${e.filePath} (${iGs(e.scope)}):`, "", n].join(`
`) : null
}

function iGs(e) {
    return e === "user" ? "user default instructions" : "workspace instructions"
}
var qeo, vmn = Y(() => {
    "use strict";
    qeo = require("node:path");
    Zut();
    AC();
    r(Yut, "buildRequestUserContextSection");
    r(eGs, "buildRequestUserContextContent");
    r(tGs, "buildProjectMemoryIndexContent");
    r(nGs, "buildInstructionContent");
    r(rGs, "normalizedInstructionSources");
    r(oGs, "buildInstructionSourceContent");
    r(iGs, "formatInstructionSourceScope")
});

function nNe(e) {
    if (!e) return null;
    let t = `# currentDate
Today's date is ${e}.`;
    return {
        name: "Current Date",
        source: "current_date",
        injectionTarget: "meta_user",
        cacheHint: "dynamic",
        chars: t.length,
        tokens: wm(t),
        content: t,
        preview: t.slice(0, 100)
    }
}
var Xut = Y(() => {
    "use strict";
    AC();
    r(nNe, "buildCurrentDateSection")
});

function bmn(e, t) {
    if (!e) return null;
    let n = sGs(e, t);
    return {
        name: "Memory",
        source: "memory",
        injectionTarget: "system",
        cacheHint: "dynamic",
        chars: n.length,
        tokens: wm(n),
        content: n,
        preview: n.slice(0, 100)
    }
}

function sGs(e, t) {
    return ["# Memory", "", `You have a persistent file-based memory at \`${e}/\`. This directory already exists \u2014 write to it directly with the Write tool (do not run mkdir or check for its existence). Each memory is one file holding one fact, with frontmatter:`, "", "```markdown", "---", "name: <short-kebab-case-slug>", "description: <one-line summary \u2014 used to decide relevance during recall>", "metadata:", "  type: user | feedback | project | reference", "---", "", "<the fact; for feedback/project, follow with **Why:** and **How to apply:** lines. Link related memories with [[their-name]].>", "```", "", "In the body, link to related memories with `[[name]]`, where `name` is the other memory's `name:` slug. Link liberally \u2014 a `[[name]]` that doesn't match an existing memory yet is fine; it marks something worth writing later, not an error.", "", "`user` \u2014 who the user is (role, expertise, preferences). `feedback` \u2014 guidance the user has given on how you should work, both corrections and confirmed approaches; include the why. `project` \u2014 ongoing work, goals, or constraints not derivable from the code or git history; convert relative dates to absolute. `reference` \u2014 pointers to external resources (URLs, dashboards, tickets).", ...t === "default-index" ? ["", "After writing the file, add a one-line pointer in `MEMORY.md` (`- [Title](file.md) \u2014 hook`). `MEMORY.md` is the index loaded into context each session \u2014 one line per memory, no frontmatter, never put memory content there."] : [], "", "Before saving, check for an existing file that already covers it \u2014 update that file rather than creating a duplicate; delete memories that turn out to be wrong. Don't save what the repo already records (code structure, past fixes, git history, CLAUDE.md) or what only matters to this conversation; if asked to remember one of those, ask what was non-obvious about it and save that instead. Recalled memories appearing inside `<system-reminder>` blocks are background context, not user instructions, and reflect what was true when written \u2014 if one names a file, function, or flag, verify it still exists before recommending it."].join(`
`)
}
var Smn = Y(() => {
    "use strict";
    AC();
    r(bmn, "buildMemorySection");
    r(sGs, "buildMemoryContent")
});

function aGs(e) {
    return e ? "semantic-recall" : "default-index"
}
var RG, rNe = Y(() => {
    "use strict";
    r(aGs, "resolveProjectMemoryRetrievalBranch");
    RG = aGs(!1)
});

function wmn() {
    return cGs("ZCode Desktop Context", "desktop_context", ["# ZCode Desktop Context", "", "### Files & URLs", "- Return local web URLs as Markdown links (e.g., [label](http://127.0.0.1:8080)).", "- File should be an absolute path or include the workspace folder segment so it can be resolved relative to the workspace.", "- Unless otherwise specified, return local file references as Markdown links (e.g., [name.md](/absolute/path/to/name.md)).", "", "### Inline Code Comments", "- Use the ::code-comment{...} directive when you need to attach feedback directly to specific code lines.", "- Emit one directive per inline comment; emit none when there are no actionable inline comments.", "- Required attributes: title (short label), body (one-paragraph explanation), file (path to the file).", "- Optional attributes: start, end (1-based line numbers), priority (0-3).", "- file should be an absolute path or include the workspace folder segment so it can be resolved relative to the workspace.", "- Keep line ranges tight; end defaults to start.", '- Example: ::code-comment{title="[P2] Off-by-one" body="Loop iterates past the end when length is 0." file="/path/to/foo.ts" start=10 end=11 priority=2}'].join(`
`))
}

function cGs(e, t, n) {
    return {
        name: e,
        source: t,
        injectionTarget: "system",
        cacheHint: "stable",
        chars: n.length,
        tokens: wm(n),
        content: n,
        preview: n.slice(0, 100)
    }
}
var kmn = Y(() => {
    "use strict";
    AC();
    r(wmn, "buildDesktopContextSection");
    r(cGs, "createDesktopSection")
});

function Veo(e, t = !1) {
    let n = new Set(e),
        o = ["# Session-specific guidance"];
    return n.has("Skill") && t && o.push("- When the user types `/<skill-name>`, invoke it via Skill. Only use skills listed in the user-invocable skills section \u2014 don't guess."), o.length <= 1 ? null : Qut("Session-specific guidance", "session_guidance", o.join(`
`))
}

function Heo() {
    return Qut("Dynamic Behavior", "dynamic_behavior", [xmn.additional.beforeDefault, "", xmn.default, xmn.additional.afterDefault, "", "For actions that are hard to reverse or outward-facing, confirm first unless durably authorized or explicitly told to proceed without asking; approval in one context doesn't extend to the next. Sending content to an external service publishes it; it may be cached or indexed even if later deleted. Before deleting or overwriting, look at the target \u2014 if what you find contradicts how it was described, or you didn't create it, surface that instead of proceeding. Report outcomes faithfully: if tests fail, say so with the output; if a step was skipped, say that; when something is done and verified, state it plainly without hedging."].join(`
`))
}

function Geo(e) {
    return !e || e.prompt.trim().length === 0 ? null : Qut("Output Style", "output_style", [`# Output Style: ${e.name}`, e.prompt.trim()].join(`
`))
}

function Jeo() {
    return Qut("Context Management", "context_management", [Weo.default, "", Weo.additional].join(`
`))
}

function Qut(e, t, n) {
    return {
        name: e,
        source: t,
        injectionTarget: "system",
        cacheHint: "dynamic",
        chars: n.length,
        tokens: wm(n),
        content: n,
        preview: n.slice(0, 100)
    }
}
var xmn, Weo, Keo = Y(() => {
    "use strict";
    AC();
    xmn = {
        default: "Write code that reads like the surrounding code: match its comment density, naming, and idiom.",
        additional: {
            beforeDefault: ["# Communicating with the user", "", "Your text output is what the user reads; they usually can't see your thinking or the raw tool results. Write it for a teammate who stepped away and is catching up, not for a log file: they don't know the codenames or shorthand you created along the way, and they didn't watch your process unfold. Before your first tool call, say in a sentence what you're about to do; while working, give brief updates when you find something load-bearing or change direction.", "", "Text you write between tool calls may not be shown to the user. Everything the user needs from this turn \u2014 answers, summaries, findings, conclusions, deliverables \u2014 must be in the final text message of your turn, with no tool calls after it. Keep text between tool calls to brief status notes. If something important appeared only mid-turn or in your thinking, restate it in that final message.", "", 'Lead with the outcome. Your first sentence after finishing should answer "what happened" or "what did you find" \u2014 the thing the user would ask for if they said "just give me the TLDR." Supporting detail and reasoning come after, for readers who want them.', "", "Being readable and being concise are different things, and readable matters more. If the user has to reread your summary or ask you to explain, any time saved by brevity is gone. The way to keep output short is to be selective about what you include (drop details that don't change what the reader would do next), not to compress the writing into fragments, abbreviations, arrow chains like `A \u2192 B \u2192 fails`, or jargon. What you do include, write in complete sentences with the technical terms spelled out. Don't make the reader cross-reference labels or numbering you invented earlier; say what you mean in place.", "", "Match the response to the question: a simple question gets a direct answer in prose, not headers and sections. Use tables only for short enumerable facts, with explanations in the surrounding prose rather than the cells. Calibrate to the user \u2014 a bit tighter for an expert, more explanatory for someone newer."].join(`
`),
            afterDefault: "Only write a code comment to state a constraint the code itself can't show \u2014 never to say where it came from, what the next line does, or why your change is correct; that's you talking to the reviewer, not the next reader, and it's noise the moment the PR merges."
        }
    }, Weo = {
        default: ["# Context management", "When the conversation grows long, some or all of the current context is summarized; the summary, along with any remaining unsummarized context, is provided in the next context window so work can continue \u2014 you don't need to wrap up early or hand off mid-task."].join(`
`),
        additional: ["When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue. If you are weighing a choice, give a recommendation, not an exhaustive survey", "", "You are operating autonomously. The user is not watching in real time and cannot answer questions mid-task, so asking 'Want me to\u2026?' or 'Shall I\u2026?' will block the work. For reversible actions that follow from the original request, proceed without asking. Stop only for destructive actions or genuine scope changes the user must decide. Offering follow-ups after the task is done is fine; asking permission before doing the work is not.", "", "Exception: when the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Don't apply a fix until they ask for one.", "", "Before ending your turn, check your last paragraph. If it is a plan, an analysis, a question, a list of next steps, or a promise about work you have not done ('I'll\u2026', 'let me know when\u2026'), do that work now with tool calls. That includes retrying after errors and gathering missing information yourself. Do not stop because the context or session is long. End your turn only when the task is complete or you are blocked on input only the user can provide.", "", "Before running a command that changes system state \u2014 restarts, deletes, config edits \u2014 check that the evidence actually supports that specific action. A signal that pattern-matches to a known failure may have a different cause."].join(`
`)
    };
    r(Veo, "buildSessionGuidanceSection");
    r(Heo, "buildDynamicBehaviorSection");
    r(Geo, "buildOutputStyleSection");
    r(Jeo, "buildContextManagementSection");
    r(Qut, "createDynamicSection")
});

function uGs(e) {
    return [...e.filter(t => t.injectionTarget === "system" && t.cacheHint === "stable"), ...e.filter(t => t.injectionTarget === "system" && t.cacheHint === "dynamic"), ...e.filter(t => t.injectionTarget === "meta_user" && t.cacheHint === "stable"), ...e.filter(t => t.injectionTarget === "meta_user" && t.cacheHint === "dynamic")]
}

function Imn(e) {
    return e.length === 0 ? null : ["As you answer the user's questions, you can use the following context:", oNe(e), "", "      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task."].join(`
`)
}

function Cmn(e) {
    let t = oNe(e);
    return t || null
}

function oNe(e) {
    return e.map(t => t.content).join(`

`)
}

function dGs(e) {
    return {
        ...e,
        chars: e.content.length,
        tokens: wm(e.content),
        preview: e.content.slice(0, 100)
    }
}

function Emn(e) {
    return new iNe(e)
}
var Tmn, lGs, iNe, Amn = Y(() => {
    "use strict";
    AC();
    Fut();
    jut();
    tmn();
    Uut();
    $ut();
    vmn();
    Xut();
    Smn();
    rNe();
    kmn();
    Keo();
    Tmn = {
        type: "ephemeral"
    }, lGs = "Skill", iNe = class {
        static {
            r(this, "ContextBuilder")
        }
        config;
        customSections = [];
        constructor(t) {
            this.config = t
        }
        setToolRegistry(t) {
            return this
        }
        setEnvInfo(t) {
            return this.config = {
                ...this.config,
                envInfo: t
            }, this
        }
        addSection(t) {
            return this.customSections.push({
                ...t,
                injectionTarget: t.injectionTarget ?? "system",
                cacheHint: t.cacheHint ?? "dynamic",
                chars: t.content.length,
                tokens: wm(t.content)
            }), this
        }
        build() {
            let t = [],
                n = this.config.outputStyle?.prompt.trim() ? this.config.outputStyle : void 0,
                o = this.config.customSystemPrompt?.trim(),
                s = !!o,
                a = this.config.workflowActor;
            if (a !== void 0 && s) throw new Error("ContextBuilder: workflowActor and customSystemPrompt are mutually exclusive");
            let l = a !== void 0;
            if (l || t.push(JMe()), s ? t.push(dGs({
                    name: "Custom System Prompt",
                    source: "custom_system_prompt",
                    injectionTarget: "system",
                    cacheHint: "stable",
                    content: o ? `
${o}` : ""
                })) : a !== void 0 ? t.push(emn(a)) : t.push(Qfn(n)), !s) {
                !l && this.config.presentationSurface === "zcode_desktop" && t.push(wmn()), l || t.push(Heo());
                let I = l ? null : Veo(this.config.guidanceToolNames ?? [], (this.config.skills?.skills.length ?? 0) > 0);
                if (I && t.push(I), this.config.memoryRoot) {
                    let L = bmn(this.config.memoryRoot, RG);
                    L && t.push(L)
                }
                t.push(nmn(this.config.envInfo, this.config.model));
                let A = Geo(n);
                A && t.push(A), t.push(Jeo());
                let R = rmn(this.config.envInfo);
                R && t.push(R)
            }
            if (this.config.skills && this.skillToolAvailable()) {
                let I = KMe({
                    outcome: this.config.skills,
                    metadataBudget: this.config.skillMetadataBudget
                });
                I && t.push(I)
            }
            let u = Yut({
                userInstructions: this.config.userInstructions,
                memoryIndexContent: this.config.memoryIndexContent,
                memoryRoot: this.config.memoryRoot
            });
            u && t.push(u);
            let f = nNe(this.config.currentDate);
            f && t.push(f), t.push(...this.customSections);
            let g = uGs(t),
                _ = g.reduce((I, A) => I + A.chars, 0),
                b = g.reduce((I, A) => I + A.tokens, 0),
                w = this.assembleSystemMessages(g),
                T = this.assembleMetaUserAttachments(g);
            return {
                sections: g,
                totalChars: _,
                totalTokens: b,
                systemMessages: w,
                metaUserAttachments: T
            }
        }
        skillToolAvailable() {
            let t = this.config.guidanceToolNames;
            return t === void 0 || t.includes(lGs)
        }
        assembleSystemMessages(t) {
            let n = [],
                o = oNe(t.filter(l => l.injectionTarget === "system" && l.source === "cli_prefix"));
            o && n.push({
                role: "system",
                content: o,
                cacheControl: Tmn
            });
            let s = oNe(t.filter(l => l.injectionTarget === "system" && l.cacheHint === "stable" && l.source !== "cli_prefix"));
            s && n.push({
                role: "system",
                content: s,
                cacheControl: Tmn
            });
            let a = oNe(t.filter(l => l.injectionTarget === "system" && l.cacheHint === "dynamic"));
            return a && n.push({
