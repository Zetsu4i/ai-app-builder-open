// agent-service — AGENTS.md contract generator (injected into every workspace).
// Per-mode capability blocks, inspired by the deprecated branch's MODE_RULES (rewritten).

export const MODE_RULES: Record<string, string> = {
  default: `## Operational Rules
1. The platform manages dev servers and previews. Do not start long-running servers unless instructed.
2. Keep PLAN.md, TODO.md and WORKLOG.md updated as you work.
3. Verify your work before claiming success (run, compile, test).
4. Write real content; never leave placeholders.`,
  web: `## System Capabilities
- Node.js + npm/bun available; Vite/Next dev server managed by the platform on an assigned port.
- Preview served through the platform gateway; reload happens automatically after your turn.

## Operational Rules
1. Edit source files; never run npm start/dev — the platform handles it.
2. Keep vite.config.ts/next.config.js base-path settings intact (preview depends on them).
3. Verify UI changes by checking the code compiles; run quick smoke checks via curl if a server is running.
4. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  mobile: `## System Capabilities
- Expo (React Native) toolchain installed; Metro bundler managed by the platform.
- Web preview available through the platform.

## Operational Rules
1. NEVER run npm start / expo start — platform manages Metro.
2. Edit App.tsx and components only; npm install allowed.
3. Keep app.json valid; use functional components + hooks.
4. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  design: `## System Capabilities
- Static HTML/CSS served by the platform preview (no build step).
- Google Fonts via CDN allowed.

## Operational Rules
1. One self-contained HTML file per screen under design/.
2. Every editable element carries a data-od-id attribute (the visual editor uses it).
3. Portfolio-grade quality: real copy, coherent tokens (:root variables), responsive layouts.
4. Update DESIGN.md with the brief and direction you chose.`,
  app: `## System Capabilities
- Node.js (ESM) + Python 3.11 with requests/httpx preinstalled.
- Long-running services are platform-managed.

## Operational Rules
1. Pick the right stack for the job; replace the starter when a different shape fits.
2. Servers listen on the port the platform assigns via PORT env.
3. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  presentation: `## System Capabilities
- python-pptx available; reveal.js-style HTML allowed under slides/.
- PDF export friendly via @media print.

## Operational Rules
1. Keep slides.md as the outline source of truth.
2. 1920x1080 slide geometry for HTML decks; keyboard navigation.
3. Presentation-grade typography and content only.
4. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  document: `## System Capabilities
- python-docx, markdown, PDF tooling available.

## Operational Rules
1. Keep document.md as the source of truth.
2. Rich docs → md + PDF; business docs → .docx.
3. Professional structure; tables where useful.
4. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  computer: `## System Capabilities
- Browser automation skills (control-browser) available.

## Operational Rules
1. Announce each step, act, capture screenshots under zcode/screenshots/.
2. Report what you observed, not assumptions.
3. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  data: `## System Capabilities
- Python 3.11 with pandas/numpy/matplotlib/plotly/scipy/openpyxl.
- datasets/ and output/ directories.

## Operational Rules
1. Datasets under datasets/, charts under output/, findings in REPORT.md.
2. Verify numbers before claiming them.
3. Maintain PLAN.md / TODO.md / WORKLOG.md.`,
  reverse: `## System Capabilities
- REA (Reverse Engineering Agents) MCP available — prefer its tools for static and dynamic binary analysis.
- Ghidra headless at /opt/ghidra/support/analyzeHeadless (E2B template) — use for decompilation and function mapping.
- radare2 (r2, rabin2, rasm2), binwalk, strings, file, xxdd, ltrace/strace where available.
- Python 3.11 (capstone, pwn tools as needed) for scripts under scripts/.
- Full read access to samples/; write analysis artifacts under extracted/ and reports to RECON.md / FINDINGS.md.

## Operational Rules
1. TRIAGE FIRST: file type, hashes (sha256/md5), strings, binwalk signatures — record in RECON.md before deep analysis.
2. STATIC BEFORE DYNAMIC: map functions and decompile with Ghidra/radare2 before running anything; dynamic analysis only in a sandbox, never on host-critical paths.
3. EVIDENCE-GATED CLAIMS: every finding in FINDINGS.md cites evidence (offset, function name, decompiled snippet, command output). Never guess.
4. Prefer REA MCP commands when present; fall back to r2/ghidra CLI. Keep original samples immutable under samples/.
5. Maintain PLAN.md / TODO.md / WORKLOG.md (append a Task ID section per analysis pass).`,
};

export function agentsMdFor(modeName: string, rules: string): string {
  return `# Workspace Configuration — ${modeName.toUpperCase()} MODE

You are running inside ZCode Builder, a managed app-building platform.
This file is your operational contract for this workspace.

${rules}

## ZCode Builder Contract
- PLAN.md = what you plan to do; TODO.md = current checklist; WORKLOG.md = append-only journal.
- After each significant unit of work, append to WORKLOG.md:
  "Task ID: <n> / Agent: <name> / Task: <one line> / Work Log: - steps / Stage Summary: - results"
- The user sees your tool calls, files, and preview live. Make every turn count.
`;
}
