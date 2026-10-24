// agent-service — modes: 8 builtin modes + custom modes + system-prompt composition.
// Features ported & improved from the deprecated zcode-builder-glm-4-4 branch (implementation rewritten).

export interface SeedFile {
  path: string;
  content: string;
}

export interface ModeDef {
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  frameworks: string[];
  samplePrompts: string[];
  swarmAllowed: boolean;
  directive: string;
  skills: string[]; // suggested skills (hints only; core loads what it needs)
  defaultFramework: string;
}

// ---------- framework presets ----------
export const FRAMEWORK_PRESETS: Record<string, { label: string; block: string }> = {
  "react-vite": {
    label: "React + Vite",
    block: `FRAMEWORK: React 18 + Vite + TypeScript.
- Dev server: the PLATFORM manages it (npm run dev). NEVER run npm start/dev yourself; edit files and the preview reloads.
- Entry src/main.tsx renders <App/>; keep components in src/components; use plain CSS (src/index.css) or CSS modules; no tailwind config required.
- vite.config.ts may define server.base — do not delete it; the platform injects the correct base for preview.`,
  },
  nextjs: {
    label: "Next.js",
    block: `FRAMEWORK: Next.js 14 (app router) + TypeScript.
- Dev server is platform-managed; NEVER run npm start/dev. Edit files; preview reloads.
- next.config.js may contain basePath/assetPrefix — do not remove; preview requires it.
- Keep pages small; use server components by default; client components only when interactive.`,
  },
  flask: {
    label: "Python + Flask",
    block: `FRAMEWORK: Python 3 + Flask.
- Dev server is platform-managed (python app.py). NEVER run it yourself.
- Templates in templates/, static in static/. Keep app.py the entry point.`,
  },
  express: {
    label: "Node + Express",
    block: `FRAMEWORK: Node.js + Express (ESM).
- The platform runs the server (node server.js / npm start). NEVER start it yourself; edit files and restart via the platform.
- Keep server.js the entry; routes/ for modules; serve any static UI from public/.`,
  },
  expo: {
    label: "Expo (React Native)",
    block: `FRAMEWORK: Expo (React Native, TypeScript).
- NEVER run npm start / expo start — the platform manages Metro and the web preview.
- Edit App.tsx and components/ only; npm install is allowed.
- Keep app.json valid; prefer functional components + hooks.`,
  },
  html: {
    label: "Static HTML",
    block: `FRAMEWORK: self-contained static HTML/CSS/JS.
- Each screen is a standalone .html file (CDN fonts allowed, no build step).
- Design-mode output contract: files under design/, portfolio-grade quality.`,
  },
  python: {
    label: "Python",
    block: `FRAMEWORK: Python 3.
- Entry script; requirements.txt for deps; pip install allowed.`,
  },
};

// ---------- seed templates ----------
const REACT_VITE_SEED: SeedFile[] = [
  { path: "package.json", content: `{\n  "name": "app",\n  "private": true,\n  "version": "0.0.1",\n  "type": "module",\n  "scripts": { "dev": "vite", "build": "vite build" },\n  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1" },\n  "devDependencies": { "@types/react": "^18.3.3", "@types/react-dom": "^18.3.0", "@vitejs/plugin-react": "^4.3.1", "typescript": "^5.5.3", "vite": "^5.4.0" }\n}\n` },
  { path: "vite.config.ts", content: `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  // allowedHosts: cloud-sandbox preview serves the app on an e2b.app host\n  server: { host: "127.0.0.1", strictPort: true, allowedHosts: true },\n});\n` },
  { path: "index.html", content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n` },
  { path: "src/main.tsx", content: `import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n` },
  { path: "src/App.tsx", content: `export default function App() {\n  return (\n    <main style={{ fontFamily: "system-ui", padding: 48 }}>\n      <h1>Ready.</h1>\n      <p>Describe what you want to build in the chat.</p>\n    </main>\n  );\n}\n` },
  { path: "src/index.css", content: `:root { color-scheme: light; }\nbody { margin: 0; background: #fafafa; color: #18181b; }\n` },
  { path: "tsconfig.json", content: `{\n  "compilerOptions": { "target": "ES2020", "lib": ["ES2020", "DOM"], "jsx": "react-jsx", "module": "ESNext", "moduleResolution": "bundler", "strict": true, "skipLibCheck": true, "noEmit": true }\n}\n` },
];

const NEXTJS_SEED: SeedFile[] = [
  { path: "package.json", content: `{\n  "name": "app",\n  "private": true,\n  "scripts": { "dev": "next dev", "build": "next build" },\n  "dependencies": { "next": "^14.2.5", "react": "^18.3.1", "react-dom": "^18.3.1" },\n  "devDependencies": { "@types/node": "^20", "@types/react": "^18", "typescript": "^5" }\n}\n` },
  { path: "next.config.js", content: `/** @type {import('next').NextConfig} */\nmodule.exports = {\n  // basePath is injected by the platform for preview — keep it.\n};\n` },
  { path: "app/layout.tsx", content: `export const metadata = { title: "App" };\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n` },
  { path: "app/page.tsx", content: `export default function Page() {\n  return <main style={{ padding: 48, fontFamily: "system-ui" }}><h1>Ready.</h1></main>;\n}\n` },
  { path: "tsconfig.json", content: `{\n  "compilerOptions": { "target": "ES2017", "lib": ["dom", "dom.iterable", "esnext"], "jsx": "preserve", "module": "esnext", "moduleResolution": "bundler", "strict": true, "noEmit": true, "incremental": true, "plugins": [{ "name": "next" }] }\n}\n` },
];

const FLASK_SEED: SeedFile[] = [
  { path: "app.py", content: `from flask import Flask, render_template\n\napp = Flask(__name__)\n\n@app.get("/")\ndef index():\n    return render_template("index.html")\n\nif __name__ == "__main__":\n    app.run(host="127.0.0.1", port=5000)\n` },
  { path: "templates/index.html", content: `<!doctype html>\n<html><head><meta charset="utf-8"><title>App</title></head>\n<body style="font-family: system-ui; padding: 48px"><h1>Ready.</h1></body></html>\n` },
  { path: "requirements.txt", content: "flask>=3.0\n" },
];

const EXPRESS_SEED: SeedFile[] = [
  { path: "package.json", content: `{\n  "name": "app",\n  "private": true,\n  "type": "module",\n  "scripts": { "start": "node server.js" },\n  "dependencies": { "express": "^4.19.2" }\n}\n` },
  { path: "server.js", content: `import express from "express";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\n\nconst app = express();\nconst here = path.dirname(fileURLToPath(import.meta.url));\napp.use(express.static(path.join(here, "public")));\napp.use(express.json());\n\napp.get("/api/health", (_req, res) => res.json({ ok: true }));\n\nconst port = process.env.PORT || 3000;\napp.listen(port, () => console.log("listening on " + port));\n` },
  { path: "public/index.html", content: `<!doctype html>\n<html><head><meta charset="utf-8"><title>App</title></head>\n<body style="font-family: system-ui; padding: 48px"><h1>Ready.</h1></body></html>\n` },
];

const EXPO_SEED: SeedFile[] = [
  { path: "package.json", content: `{\n  "name": "app",\n  "private": true,\n  "main": "node_modules/expo/AppEntry.js",\n  "scripts": { "start": "expo start" },\n  "dependencies": { "expo": "~51.0.0", "react": "18.2.0", "react-native": "0.74.5" },\n  "devDependencies": { "@types/react": "~18.2.79", "typescript": "~5.3.3" }\n}\n` },
  { path: "App.tsx", content: `import { StyleSheet, Text, View } from "react-native";\n\nexport default function App() {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.text}>Ready.</Text>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, alignItems: "center", justifyContent: "center" },\n  text: { fontSize: 20 },\n});\n` },
  { path: "app.json", content: `{\n  "expo": { "name": "app", "slug": "app", "version": "1.0.0", "orientation": "portrait", "userInterfaceStyle": "automatic", "platforms": ["ios", "android", "web"] }\n}\n` },
  { path: "tsconfig.json", content: `{\n  "extends": "expo/tsconfig.base",\n  "compilerOptions": { "strict": true }\n}\n` },
];

const DESIGN_SEED: SeedFile[] = [
  { path: "design/index.html", content: `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>Design</title>\n</head>\n<body>\n  <main data-od-id="root" style="font-family: system-ui; padding: 64px; min-height: 100vh; background: #faf8f4; color: #1c1917;">\n    <h1 data-od-id="heading">Design canvas</h1>\n    <p data-od-id="lede">Replace this with a portfolio-grade design. Every editable element carries data-od-id.</p>\n  </main>\n</body>\n</html>\n` },
  { path: "DESIGN.md", content: `# Design Brief\n\n- Goal: (fill me)\n- Audience: (fill me)\n- Direction: (fill me)\n` },
];

const DOC_SEED: SeedFile[] = [
  { path: "document.md", content: `# Document\n\n## Summary\n(tbd)\n` },
];

const SLIDES_SEED: SeedFile[] = [
  { path: "slides.md", content: `# Presentation\n\n## Slide 1 — Title\n(tbd)\n` },
];

const DATA_SEED: SeedFile[] = [
  { path: "analysis.py", content: `import pandas as pd\n\n# Load your dataset and print the first rows\ndf = pd.read_csv("datasets/data.csv")\nprint(df.head())\n` },
  { path: "datasets/README.md", content: "Place datasets here.\n" },
];

const REVERSE_SEED: SeedFile[] = [
  {
    path: "RECON.md",
    content: `# Reconnaissance

## Target
- File / binary: (path, sha256, size, type)
- Tooling used: (ghidra headless / radare2 / binwalk / strings / REA MCP)

## Surface
- Entry points, exported functions, embedded strings, packed/obfuscated sections

## Findings
- (append as you work)
`,
  },
  {
    path: "FINDINGS.md",
    content: `# Findings

| # | Finding | Evidence | Confidence |
|---|---------|----------|------------|
| 1 | (what you discovered) | (function/offset/output) | low/med/high |

## IOCs / Indicators
- (hashes, strings, domains, mutexes…)

## Recommendations
- (patch / hardening / detection ideas)
`,
  },
  { path: "samples/.gitkeep", content: "" },
  { path: "scripts/README.md", content: "Analysis scripts live here (r2 scripts, ghidra post-scripts, python helpers).\n" },
];

export const BUILTIN_MODES: ModeDef[] = [
  {
    slug: "web",
    name: "Web App",
    icon: "Globe",
    color: "#b4532a",
    description: "Full-stack web apps with live preview",
    frameworks: ["react-vite", "nextjs", "flask"],
    defaultFramework: "react-vite",
    samplePrompts: [
      "Build a SaaS landing page with pricing tiers and a waitlist form",
      "Create a kanban board with drag-and-drop and localStorage persistence",
      "Build a recipe finder with search, filters, and favorites",
    ],
    swarmAllowed: true,
    directive: "",
    skills: ["web-gui-tester", "control-browser", "frontend-design"],
  },
  {
    slug: "mobile",
    name: "Mobile App",
    icon: "Smartphone",
    color: "#5b6b4c",
    description: "Expo React Native apps with web preview",
    frameworks: ["expo"],
    defaultFramework: "expo",
    samplePrompts: [
      "Build a habit tracker with streaks and charts",
      "Create a fitness log with workout history",
      "Build a mobile wallet UI with transactions list",
    ],
    swarmAllowed: true,
    directive:
      "You are building a MOBILE app with Expo. NEVER run npm start / expo start — the platform runs Metro and a web preview. Edit App.tsx and components only. npm install is allowed. Test via the web preview the platform provides.",
    skills: ["web-gui-tester", "control-browser"],
  },
  {
    slug: "design",
    name: "Design",
    icon: "Palette",
    color: "#7c3aed",
    description: "High-quality HTML design mockups",
    frameworks: ["html"],
    defaultFramework: "html",
    samplePrompts: [
      "Design a landing page for a coffee roastery brand",
      "Design a dashboard for a solar energy startup",
      "Design a mobile checkout flow for a fashion store",
    ],
    swarmAllowed: false,
    directive:
      "You are a DESIGNER. Produce high-quality, portfolio-grade DESIGN MOCKUPS as self-contained HTML files under design/ (one file per screen). Use CDN fonts (Google Fonts), responsive mobile+desktop layouts, realistic copy (never lorem ipsum), and coherent design tokens (:root variables). Every editable element gets a data-od-id attribute. No build step, no external JS frameworks — polished semantic HTML + modern CSS only.",
    skills: ["frontend-design", "taste-skill", "color-expert"],
  },
  {
    slug: "app",
    name: "Anything",
    icon: "Sparkles",
    color: "#c98a2d",
    description: "General-purpose builds: APIs, scripts, bots",
    frameworks: ["express", "python", "react-vite"],
    defaultFramework: "express",
    samplePrompts: [
      "Build a REST API for a URL shortener with rate limiting",
      "Create a CLI tool that organizes downloads by type",
      "Build a Telegram bot that summarizes articles",
    ],
    swarmAllowed: true,
    directive:
      "You are a general-purpose BUILDER. Services, APIs, scripts, bots, tools — Node and Python are both available (express, requests/httpx). Pick the right stack for the job; replace the starter if a different shape fits better. Anything that must run long-running is managed by the platform.",
    skills: ["dynamic-workflows", "control-browser"],
  },
  {
    slug: "presentation",
    name: "Presentation",
    icon: "Presentation",
    color: "#2f6bff",
    description: "Slide decks (pptx / reveal.js)",
    frameworks: ["html", "python"],
    defaultFramework: "html",
    samplePrompts: [
      "Create a 10-slide investor deck for a climate startup",
      "Build a workshop deck about prompt engineering",
      "Design a product launch keynote",
    ],
    swarmAllowed: true,
    directive:
      "You build PRESENTATIONS. Either .pptx via python-pptx or reveal.js-style HTML under slides/ (1920x1080, keyboard navigation, print-to-PDF friendly via @media print). Keep slides.md as the outline source of truth. Presentation-grade quality: no clip-art, coherent typography, real content.",
    skills: ["pptx", "pdf", "dynamic-workflows"],
  },
  {
    slug: "document",
    name: "Document",
    icon: "FileText",
    color: "#57534e",
    description: "Documents & reports (docx/md/pdf)",
    frameworks: ["python"],
    defaultFramework: "python",
    samplePrompts: [
      "Write a product requirements document for a food delivery app",
      "Create a business plan for a bike repair service",
      "Draft a technical whitepaper on vector databases",
    ],
    swarmAllowed: true,
    directive:
      "You build DOCUMENTS. Rich docs → markdown + PDF; business docs → .docx (python-docx). Keep document.md as the source of truth. Professional structure, real content, tables where useful, no filler.",
    skills: ["docx", "pdf", "dynamic-workflows"],
  },
  {
    slug: "computer",
    name: "Computer Use",
    icon: "MousePointerClick",
    color: "#1c1917",
    description: "Browser automation & verification",
    frameworks: ["express"],
    defaultFramework: "express",
    samplePrompts: [
      "Go to example.com and take a screenshot of the header",
      "Test the login flow of the current project in the browser",
      "Scrape the top stories from a news site into JSON",
    ],
    swarmAllowed: true,
    directive:
      "You operate a REAL browser (browser-use skills). Announce each step, act, and capture screenshots under zcode/screenshots/. Use the control-browser skill for all web automation. Report what you saw, not what you assume.",
    skills: ["computer-use", "control-browser"],
  },
  {
    slug: "data",
    name: "Data",
    icon: "BarChart3",
    color: "#0d9488",
    description: "Analysis, plots, datasets",
    frameworks: ["python"],
    defaultFramework: "python",
    samplePrompts: [
      "Analyze the Iris dataset and plot class distributions",
      "Build a sales dashboard from a CSV with plotly",
      "Clean a messy CSV and report data quality issues",
    ],
    swarmAllowed: true,
    directive:
      "You are a DATA analyst. Python 3 with pandas/numpy/matplotlib/plotly/scipy is preinstalled. Put datasets under datasets/, charts under output/, and write findings to REPORT.md. Show your intermediate steps; verify numbers before claiming them.",
    skills: ["dynamic-workflows"],
  },
  {
    slug: "reverse",
    name: "Reverse Engineering",
    icon: "Binary",
    color: "#3f3f46",
    description: "Binary & protocol analysis with REA tooling",
    frameworks: ["python"],
    defaultFramework: "python",
    samplePrompts: [
      "Analyze the binary in samples/, map the entry point and key functions, and document the control flow",
      "Extract embedded strings, flags and configs from this executable and write an IOC report",
      "Reverse the protocol of this capture and build a python parser for it",
    ],
    swarmAllowed: true,
    directive:
      "You are a SENIOR REVERSE ENGINEER. Work methodically: triage (file/strings/binwalk) → static analysis (ghidra headless / radare2) → dynamic analysis when safe → document everything in RECON.md and FINDINGS.md with evidence (offsets, function names, decompiled snippets). Prefer the REA MCP tools when available for static and dynamic binary analysis. Decompile BEFORE guessing; never claim behavior you did not observe. Keep original samples intact under samples/ and write extracted artifacts under extracted/.",
    skills: ["dynamic-workflows"],
  },
];

export function getBuiltinMode(slug: string): ModeDef | undefined {
  return BUILTIN_MODES.find((m) => m.slug === slug);
}

export function seedFilesFor(mode: string, framework: string): SeedFile[] {
  if (mode === "design") return DESIGN_SEED;
  if (mode === "document") return DOC_SEED;
  if (mode === "presentation") return SLIDES_SEED;
  if (mode === "data") return DATA_SEED;
  if (mode === "mobile") return EXPO_SEED;
  switch (framework) {
    case "nextjs":
      return NEXTJS_SEED;
    case "flask":
      return FLASK_SEED;
    case "express":
      return EXPRESS_SEED;
    default:
      return REACT_VITE_SEED;
  }
}

// ---------- system prompt composition ----------
export const BASE_SYSTEM = `You are ZCode Builder — an autonomous app-building agent running inside a managed workspace.
Your job: turn the user's request into a real, working artifact (app, design, document, deck, analysis) with verifiable results.

Rules:
- The platform manages dev servers and previews. Do NOT start long-running servers yourself unless told otherwise.
- Prefer small, verifiable steps; verify your work (run/compile/test) before claiming success.
- Keep files tidy; delete files you replaced; don't leave dead code.
- Write realistic content — never lorem ipsum, never placeholder gibberish.
- When you create something visual, make it genuinely beautiful: coherent typography, spacing, color tokens, real copy.
- Finish every turn with a short summary of what changed and what the user can try next.`;

export const WORKLOG_CONTRACT = `WORKLOG PROTOCOL:
- Keep PLAN.md (what you plan), TODO.md (current task checklist), and WORKLOG.md (append-only journal) updated in the workspace root.
- After each significant unit of work append to WORKLOG.md a section:
  "Task ID: <n>\nAgent: <name>\nTask: <one line>\n\nWork Log:\n- <steps>\n\nStage Summary:\n- <results>"`;

export interface PromptContext {
  mode: ModeDef;
  framework: string;
  modeConfig: Record<string, unknown>; // designSystem, style, tone, docType...
  instructions?: string | null;
  workspaceTree: string;
  planExcerpt?: string;
  skills: string[];
  mcps: string[];
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const parts: string[] = [BASE_SYSTEM];
  if (ctx.mode.directive) parts.push(`MODE: ${ctx.mode.name.toUpperCase()}\n${ctx.mode.directive}`);
  const fw = FRAMEWORK_PRESETS[ctx.framework];
  if (fw) parts.push(fw.block);

  const mc = ctx.modeConfig || {};
  const designSystem = mc.designSystem as string | undefined;
  if (designSystem) {
    parts.push(
      `DESIGN SYSTEM: the workspace contains design-systems/${designSystem}/ with DESIGN.md (design prose), tokens.css (CSS custom properties) and USAGE.md (how to apply). READ them before designing any UI and follow them strictly: paste the tokens.css :root block into your artifact's first <style> and reference values via var(--name).`,
    );
  }
  const style = mc.style as string | undefined;
  if (style) parts.push(`STYLE DIRECTION: ${style}.`);
  const tone = mc.tone as string | undefined;
  if (tone) parts.push(`TONE: ${tone}.`);
  const docType = mc.docType as string | undefined;
  if (docType) parts.push(`DELIVERABLE FORMAT: ${docType}.`);

  if (ctx.skills.length) parts.push(`SKILLS AVAILABLE: ${ctx.skills.join(", ")}. Load a skill with the Skill tool when relevant.`);
  if (ctx.mcps?.length) parts.push(`MCP servers configured for this session: ${ctx.mcps.join(", ")}. Their tools appear as mcp__<server>__<tool>.`);

  if (ctx.workspaceTree) parts.push(`WORKSPACE:\n${ctx.workspaceTree}`);
  if (ctx.planExcerpt) parts.push(ctx.planExcerpt);
  if (ctx.instructions) parts.push(`PROJECT INSTRUCTIONS (from the user, always obey):\n${ctx.instructions}`);
  parts.push(WORKLOG_CONTRACT);
  return parts.join("\n\n");
}

export function workspaceTreeString(root: string, depth = 3): string {
  try {
    const lines: string[] = [];
    const listDir = (dir: string, prefix: string, level: number) => {
      if (level > depth) return;
      let items: string[] = [];
      try {
        items = Array.from(new Bun.Glob("*").scanSync({ cwd: dir, onlyFiles: false, dot: false })).sort();
      } catch {
        return;
      }
      for (const item of items.slice(0, 60)) {
        if (item === "node_modules" || item === ".git" || item === ".next" || item === "dist") continue;
        const full = pathJoin(dir, item);
        const isDir = isDirectory(full);
        lines.push(`${prefix}${isDir ? "/" : ""}${item}`);
        if (isDir) listDir(full, prefix + "  ", level + 1);
      }
    };
    listDir(root, "", 0);
    return lines.join("\n");
  } catch {
    return "";
  }
}

import nodePath from "node:path";
import fs from "node:fs";
const pathJoin = (...p: string[]) => nodePath.join(...p);
const isDirectory = (p: string) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};
