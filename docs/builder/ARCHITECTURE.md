# ZCode Builder — Web App Architecture (branch `zcode-builder-glm-6z-*`)

> The agent core already exists (`extracted/zcode.cjs`, protocol docs in `docs/`).
> This webapp **wraps** it: it runs the core in contained, mode-specialized
> environments (E2B sandbox or local folder) and gives it a production UI.

## 1. System overview

```
┌────────────────────────────── Browser ──────────────────────────────┐
│  Next.js 16 App Router (port 3000)                                  │
│  "Forge" UI (ported from ai-agent-chat-interface-23, zustand store) │
│  Chat ▸ Preview ▸ Code ▸ Git ▸ Terminal ▸ Jobs(Swarm) ▸ Artifacts   │
└───────────┬──────────────────────────────┬──────────────────────────┘
            │ REST /api/bff/* (same-origin) │ socket.io  /?XTransformPort=3031
┌───────────▼──────────────┐   ┌───────────▼──────────────────────────┐
│ Next BFF route handlers  │   │ agent-service (bun mini-service:3031)│
│ (proxy to 127.0.0.1:3031)│──▶│                                      │
└──────────────────────────┘   │  ┌────────────────────────────────┐  │
                               │  │ zai-bridge  POST /llm/v1/...   │  │
                               │  │ OpenAI wire format, streams;   │  │
                               │  │ z-ai-web-dev-sdk backend = the │  │
                               │  │ FREE builtin provider          │  │
                               │  └───────────────▲────────────────┘  │
                               │  ┌───────────────┴────────────────┐  │
                               │  │ ZCodeRuntime                   │  │
                               │  │  spawn node agent-core/        │  │
                               │  │  extracted/zcode.cjs           │  │
                               │  │      app-server --stdio        │  │
                               │  │  NDJSON ⇄ SDK (sdk/index.js)   │  │
                               │  │  sessions, tools, skills, MCP, │  │
                               │  │  plugins, hooks, subagents,    │  │
                               │  │  compaction, checkpoints       │  │
                               │  └───────▲──────────▲─────────────┘  │
                               │          │          │                │
                               │  ┌───────┴───┐ ┌────┴──────────────┐ │
                               │  │ Sandbox   │ │ Swarm orchestrator│ │
                               │  │ manager   │ │ DAG·leases·evid.  │ │
                               │  │ E2B|local │ │ tick loop         │ │
                               │  └───────────┘ └───────────────────┘ │
                               │  dev-server mgr · preview · git ·    │
                               │  files · artifacts · terminal ·      │
                               │  enhancer · skills/MCP/plugins mgr   │
                               └──────────────┬───────────────────────┘
                                              │ Prisma client
                                     ┌────────▼────────┐
                                     │ SQLite (shared) │
                                     └─────────────────┘
```

- **Browser → agent-service**: only through the gateway: `io("/?XTransformPort=3031")`, REST via Next BFF (`/api/bff/...` → server-side fetch to `127.0.0.1:3031`). Never absolute ports in the browser.
- **Core → bridge**: `127.0.0.1:3031/llm/v1/chat/completions` (server-local, direct).

## 2. The agent runtime (the real core — this time actually wired)

The deprecated branch designed `ZcodeCoreEngine` but never implemented it. Here it
is the **only** engine:

- Vendor `extracted/zcode.cjs` + `extracted/config/*` + `extracted/plugins` + `sdk/` into the repo (`agent-core/`).
- Boot checklist (verified empirically, see docs/10 & 11):
  1. `ln -s plugins agent-core/extracted/packages` (seed plugins discovery).
  2. Env: `ZCODE_BUILTIN_PROVIDER_CONFIG_FILE=<...>/zcode-builtin.json`,
     `ZCODE_PERSONAL_PROVIDER_CONFIG_FILE=<work>/provider_config.json` (generated from DB BYOK rows + builtin `zai-bridge` entry).
  3. Spawn `node zcode.cjs app-server --stdio` (Node ≥ 22.5), one app-server per
     runtime; sessions multiplexed inside it.
  4. `waitForReady()` → answer `session/requestRuntimePreferences` →
     `session/create { workspace{workspacePath, workspaceKey}, mode, model }` →
     `session/subscribe (desktop-continuous, includeSnapshot)` → `session/send`.
  5. Override `interaction/requestPermission` → **no `optionId`** (SDK default is broken);
     override `interaction/requestUserInput` → `{action:"accept", content:{...}}`
     (forwarded to UI as a question card when policy says "ask").
  6. Events fan out to socket.io rooms `project:<id>` and persist to
     `AgentMessage.parts` (text / reasoning / tool-invocation / delegation / question...).
- **Permission policy** by agent mode: `yolo` allow-all; `auto` allow low+medium risk, ask high+;
  `plan|build|edit` ask for non-readonly tools. UI renders approval cards.
- **BYOK**: `provider_config.json` generated from `ProviderConfig` rows
  (openai-chat-completions / anthropic-messages / openai-responses). Every model
  rule must include `requiresMfjsToolSchema` (silent un-registration otherwise) and
  every model selection must carry `options.reasoningLevel`.
- **Free provider**: `zai-bridge` provider entry → `http://127.0.0.1:3031/llm/v1`
  (agent-service route backed by z-ai-web-dev-sdk; upstream credentials from
  `/etc/.z-ai-config` / env; `thinking: disabled`).

## 3. Sandbox runtimes (E2B first, local fallback)

| Runtime | How the core runs | Notes |
|---|---|---|
| `local` (default & fallback) | core cwd = `workspaces/<projectId>/` | always available |
| `e2b` | core **inside** the sandbox via stdio-over-HTTP relay: upload `zcode.cjs`+configs+workspace → sandbox runs `relay.mjs` (port 4777): `POST /rpc`, `GET /poll?cursor=`, `POST /respond` → agent-service reaches it at `https://4777-<id>.e2b.app` | full isolation, dev servers live in-sandbox (`sandbox.getHost(port)` preview) |

- Key resolution: `process.env.E2B_API_KEY` or Setting `e2b` (starts with `e2b_`).
- Boot failure → automatic `fallback-local` event + `sandboxRuntime=local`.
- Workspace mirror for `e2b`: tar.gz syncUp before turn / syncDown after (local dir stays SSOT for the UI).
- Per-mode E2B templates: Dockerfiles in `e2b-templates/<mode>/` + registry
  (`E2B_TEMPLATE_<MODE>` → `E2B_TEMPLATE` → base); AGENTS.md contract injected per mode.
- `AGENTS.md` (workspace contract) is generated per mode and written into the
  workspace before the core boots; `.zcode/skills`, `.zcode/mcp.json`, `.zcode/config.json` seeded from the project config.

## 4. Modes & templates

8 builtin modes (kept, none removed): **web, mobile, design, app ("Anything"),
presentation, document, computer, data**. Each = directive + framework presets +
seed files + skill presets + sample prompts + icon/color + `swarmAllowed`
(design = false, everything else = true). Custom modes: `ModeTemplate` rows
(slug `custom:*`) with the same fields, CRUD UI, selected like builtins.
Framework presets per mode (react-vite/nextjs/flask · expo · html · express ·
python…). Swarm switch per project; blocked for design mode.

## 5. Swarm mode (oh-my-codex × symphony, TypeScript port)

- Planner (LLM, `workspace/generateText` or a swarm session) emits strict JSON
  DAG `{schema_version, plan_slug, nodes[{id,subject,description,role,lane,filePaths,depends_on,acceptance}], worker_policy}`.
  Validate (unique ids, deps exist, DFS cycle check), topo-sort, remap deps to
  concrete ids, derive lanes from filePath sets, cap workers (≤6).
- Isolation: **one lane = one workspace folder** (local) or **one E2B sandbox**;
  lane workspaces are copies; merge = copy lane outputs (only declared
  `filePaths`) back into the main workspace + git commit (fixes the old
  shared-workspace collision bug).
- Claims: `SwarmTask.claim {owner, token, leasedUntil 15min}` with `version` CAS;
  tick (3s) reclaims expired leases, stall-detects workers (5 min), runs the
  phase FSM `plan→exec→verify→fix(≤3)→complete|failed`.
- Evidence gate: worker report must contain `Verification:` section + per-task
  evidence file (`.swarm/evidence/task-<id>.json` with `claimTokenSha256`);
  verifier lane re-checks code-changing tasks.
- Events: append-only `SwarmEvent` + socket `swarm` events; UI Jobs tab shows
  lanes, worker cards, DAG progress, event feed (SwarmCard in chat).

## 6. Design mode (open-design-core powered)

- Content (Apache-2.0, attribution kept): curated design systems
  (`design-systems/<slug>/{DESIGN.md,tokens.css,USAGE.md,manifest.json}`), craft
  rules, design skills (frontend-design, taste, redesign, brandkit, deck-*),
  prompt stack (charter + discovery + directions → DESIGN.md+tokens → skills →
  craft → output contract).
- Editor: `buildSrcdoc` pipeline (from open-design-core `srcdoc.ts`, compact
  port) → sandboxed iframe with `data-od-id annotation` + postMessage edit
  bridge (hover/select/patch/dump) + element inspector → byte-exact save.
- Design mode disables swarm and serves artifacts from `design/` directly.

## 7. Skills / MCP / Plugins

- Skills: core discovery paths (`agent-core` seed plugins → `~/.zcode/skills` →
  `<workspace>/.zcode/skills` + `.agents/skills`). Bundled packs:
  `packs/superpowers/*` (17 methodology skills) and `packs/design/*`. Skills
  manager: catalog + toggle + custom installers (paste/manual-write, folder
  upload, URL/git fetch, `npx skills` registry fetch).
- MCP: `McpServer` rows → written to workspace `.zcode/config.json` AND passed
  via `session/create {mcpServers}` (stdio {name,command,args,env[]} |
  http/sse {url,headers}) — **actually executed by the core** (`mcp__server__tool`).
- Plugins: seed plugins (14) listed + enable/disable; install = drop
  `.zcode-plugin/plugin.json` folder into workspace plugins dir (Claude-compatible manifests accepted).

## 8. Chat & tool UI

Every core tool gets a card (`ToolCards.tsx`): Read/Edit/Write (diff counts),
Bash (command + exit + output), Glob/Grep (query + match count), WebFetch/
WebSearch, TodoWrite (plan card), Skill (skill card), Agent (delegation card),
AskUserQuestion (question card), Cron*, Task*, MCP (`mcp__*`), Workflow,
SendMessage, checkpoints. `state.updated` snapshots drive status bar
(contextUsed/tokens), `turn.completed` → stats footer, titles from title events.

## 9. Data model (Prisma/SQLite)

Project, ProjectFile, AgentMessage(role, parts JSON), AgentEvent(kind,payload),
Artifact, Checkpoint, Setting(KV), ProviderConfig(+builtin zai-bridge),
SkillInstall, McpServer, PluginInstall, ModeTemplate, AgentProfile,
SwarmRun/Tasks/Workers/Events. See `prisma/schema.prisma`.

## 10. Work contract inside the sandbox (AGENTS.md)

Every workspace gets `AGENTS.md` (mode capabilities + operational rules),
`PLAN.md`, `TODO.md`, `WORKLOG.md` (Task ID / Agent / Task / Work Log / Stage
Summary per turn — monotonically increasing). The core's own TodoWrite +
session goal system drive the plan card in chat.

## 11. Dev & deploy

- `bun run dev` (Next :3000) + `bun run dev` in `mini-services/agent-service` (:3031, `bun --hot`).
- Caddy gateway routes `?XTransformPort=3031` → agent-service.
- Health: `GET :3031/health`, `GET :3031/api/status`.
