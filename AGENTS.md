# AGENTS.md — ZCode Builder Webapp

Operational map for any agent (human or AI) working in this repo. ~100 lines, pointers to deeper docs.

## What this is
A full-stack **AI app-builder web app** that wraps the **ZCode agent core** (`extracted/zcode.cjs`,
protocol in `docs/02-zcode-protocol.md`) in mode-specialized contained environments
(E2B sandboxes or local folders), with a production chat/IDE UI.

## Repo layout (this branch)
```
├── src/                    # Next.js 16 app (UI ported from "Forge" + BFF routes)
│   ├── app/                # App Router: page.tsx = the whole app; /api/bff/* proxies
│   ├── components/forge/   # Ported UI components (chat, workspace, screens, cards)
│   ├── lib/                # zustand store, socket client, api client, types
├── mini-services/agent-service/   # bun service :3031 — THE backend
│   ├── src/                # runtime (zcode core), sandbox, swarm, preview, git,
│   │                       # dev-server, llm bridge, modes, skills, mcp, files
├── agent-core/extracted/   # vendored zcode.cjs + config + plugins (runtime)
├── agent-core/sdk/         # ZCodeProtocolClient / ZCodeSession (dep-free)
├── packs/                  # skill packs: superpowers (17 skills), design (od skills)
├── design-systems/         # curated open-design-core design systems (Apache-2.0)
├── e2b-templates/          # per-mode Dockerfiles + registry + build.sh
├── prisma/schema.prisma    # SQLite data model
├── docs/                   # protocol docs (01..11) + docs/builder/* webapp docs
├── examples/               # chat-wrapper reference + websocket demo
├── worklog.md              # DO NOT DELETE — append-only agent journal
```

## Deeper sources of truth (read in this order)
1. `docs/builder/ARCHITECTURE.md` — system design, sandbox runtimes, swarm, design mode
2. `docs/builder/MODES.md` — the 8 builtin modes + custom mode schema
3. `docs/builder/SWARM.md` — DAG/lease/evidence contract (oh-my-codex × symphony port)
4. `docs/11-builtin-provider-guide.md` — free builtin provider (zai-bridge)
5. `docs/09-providers-models.md` — BYOK provider_config.json format
6. `docs/02-zcode-protocol.md` — NDJSON wire protocol
7. `docs/10-ui-integration.md` — verified UI wrapper flows

## Non-negotiable rules
- **Never remove features/modes.** 8 builtin modes + custom modes + swarm; combine & improve only.
- The UI is the "Forge" warm-paper design (see `src/app/globals.css` tokens). Keep it.
- Browser may only call same-origin `/api/bff/*` and `io("/?XTransformPort=3031")`.
- z-ai-web-dev-sdk is backend-only (zai-bridge + enhancer + titles).
- Permission answers MUST NOT include `optionId` (breaks core 0.16.9).
- Model selections MUST include `options.reasoningLevel`.
- Every BYOK model rule MUST include `requiresMfjsToolSchema`.
- E2B failures fall back to local runtime with a `sandbox` event — never hard-fail a project.
- Swarm is blocked in design mode (`swarmAllowed=false`).
- SQLite via Prisma (`src/lib/db.ts` in Next, `@prisma/client` in agent-service). No new DBs.
- `worklog.md`: every agent appends its Task ID section when done (template inside).

## Common commands
```bash
bun install && bun run db:push        # deps + schema
bun run dev                           # Next.js :3000 (tee dev.log)
cd mini-services/agent-service && bun run dev   # backend :3031 (bun --hot)
bun run lint                          # eslint
```

## Gotchas learned the hard way (from the deprecated branch)
- Core boot fails without `ZCODE_BUILTIN_PROVIDER_CONFIG_FILE`.
- Seed plugins need `ln -s plugins agent-core/extracted/packages`.
- Think-tag leakage: strip `<think>` blocks in streamed deltas; add degeneration guard.
- Next preview needs basePath-aware next.config.js in generated workspaces.
- Verify every BFF route against its backend twin E2E (dead endpoints ship silently).
- Node ≥ 22.5 required for the core (node:sqlite). Machine has Node 24.
