# E2B Per-Mode Templates — ZCode Builder

One isolated cloud image per build mode — never a single giant template. Each
template only carries what its mode's agents actually need, so cold boots stay
fast and the attack surface stays small.

| Mode            | Template dir    | Preinstalled tooling                                                                 |
| --------------- | --------------- | ------------------------------------------------------------------------------------ |
| `web`           | `web/`          | Node 20, create-vite/vite/create-next-app global, Python 3.11, git, jq · ports 5173/3000/5000/8080 |
| `mobile`        | `mobile/`       | Node 20, expo-cli, eas-cli, watchman, JDK 17 · Metro ports 8081/19000-19002          |
| `reverse`       | `reverse/`      | Ghidra at `/opt/ghidra` (headless + GUI support), radare2, binwalk, strace/ltrace, JDK 21, Xvfb X11, capstone/lief/pyelftools |
| `data`          | `data/`         | Python 3.11 + pandas/numpy/matplotlib/plotly/scipy/openpyxl, Node 20                 |
| `design`        | `design/`       | Minimal static: Node, serve, imagemagick                                             |
| `presentation`  | `presentation/` | Minimal static: Node, serve, imagemagick                                             |
| `anything`      | `anything/`     | Polyglot: Node 20 + tsx, Python 3.11 + requests, build-essential                     |

## Build (needs Docker + e2b CLI)

```bash
export E2B_ACCESS_TOKEN=e2b_...   # dashboard → API keys
npm i -g e2b
./build.sh                        # or: ./build.sh web mobile reverse
```

## Wire into ZCode Builder

Copy the printed template ids into the **agent-service** env (root `.env` also works —
`config.ts` loads it manually):

```dotenv
E2B_API_KEY=e2b_...                 # required — boots sandboxes
E2B_TEMPLATE_WEB=e2b_abc123
E2B_TEMPLATE_MOBILE=e2b_def456
E2B_TEMPLATE_REVERSE=e2b_ghi789
E2B_TEMPLATE_DATA=e2b_jkl012
E2B_TEMPLATE_DESIGN=e2b_mno345
E2B_TEMPLATE_PRESENTATION=e2b_pqr678
E2B_TEMPLATE_ANYTHING=e2b_stu901
E2B_TEMPLATE=e2b_base               # optional global fallback
```

Resolution order inside the agent-service: **mode-specific env → `E2B_TEMPLATE` →
`"base"`**. Projects never fail because a mode template is missing — they just
boot the base image with mode-aware AGENTS.md injected at runtime.

## Verify

Each sandbox boot logs the resolved template. The editor's cloud banner chip
shows which image is serving the project; `GET /api/projects/:id/sandbox`
returns `{ template }`.
