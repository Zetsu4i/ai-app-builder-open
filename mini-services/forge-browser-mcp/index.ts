// forge-browser-mcp — stdio MCP server giving the agent a REAL headless Chromium.
// Fixes "MCP tool returned an error: browsers expected array" from the node_repl
// browser plugin (no browser backend in this environment): the agent should call
// these tools instead. Tools:
//   forge_screenshot  {url, fullPage?, width?, height?, delayMs?, selector?}  → PNG image
//   forge_navigate    {url}                                                   → title + text excerpt
//   forge_get_text    {url?, selector?}                                       → innerText
//   forge_click       {url, selector, delayMs?}                               → click, then text excerpt
// Protocol: newline-delimited JSON-RPC (MCP stdio transport). Run with bun.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium = null;
try {
  chromium = require("playwright-core").chromium;
} catch (e) {
  console.error(`[forge-browser-mcp] playwright-core unavailable: ${e?.message ?? e}`);
}

const CANDIDATE_CHROMES = [
  process.env.FORGE_CHROME_PATH,
  path.join(process.env.HOME ?? "/home/z", ".cache/ms-playwright/chromium-1200/chrome-linux64/chrome"),
  path.join(process.env.HOME ?? "/home/z", ".cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell"),
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter(Boolean);

function chromePath(): string | null {
  for (const p of CANDIDATE_CHROMES) {
    try {
      if (require("node:fs").existsSync(p)) return p;
    } catch {
      /* noop */
    }
  }
  return null;
}

// ---------------- browser singleton ----------------

let browserPromise: Promise<import("playwright-core").Browser> | null = null;

async function getBrowser(): Promise<import("playwright-core").Browser> {
  if (!chromium) throw new Error("playwright-core is not installed for forge-browser-mcp");
  if (!browserPromise) {
    const exe = chromePath();
    browserPromise = chromium.launch({
      headless: true,
      executablePath: exe ?? undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--hide-scrollbars"],
    });
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

async function withPage<T>(opts: { width?: number; height?: number }, fn: (page: import("playwright-core").Page) => Promise<T>): Promise<T> {
  const browser = await getBrowser();
  const ctx = await browser.newContext({
    viewport: { width: Math.min(1920, Math.max(320, opts.width ?? 1280)), height: Math.min(1080, Math.max(240, opts.height ?? 800)) },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  try {
    return await fn(page);
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

async function goto(page: import("playwright-core").Page, url: string): Promise<void> {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
  } catch {
    try {
      await page.goto(url, { waitUntil: "load", timeout: 20000 });
    } catch {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    }
  }
}

// ---------------- tool impls ----------------

async function toolScreenshot(args: Record<string, unknown>) {
  const url = String(args.url ?? "");
  if (!url) throw new Error("url is required");
  const fullPage = args.fullPage === true;
  const delayMs = Math.min(15000, Math.max(0, Number(args.delayMs ?? 900)));
  const selector = typeof args.selector === "string" ? args.selector : undefined;
  const image = await withPage({ width: Number(args.width) || undefined, height: Number(args.height) || undefined }, async (page) => {
    await goto(page, url);
    if (delayMs > 0) await page.waitForTimeout(delayMs);
    const target = selector ? page.locator(selector).first() : page;
    return (target as import("playwright-core").Locator | import("playwright-core").Page).screenshot({
      fullPage: selector ? false : fullPage,
      type: "png",
    });
  });
  return {
    content: [
      { type: "image", data: Buffer.from(image).toString("base64"), mimeType: "image/png" },
      { type: "text", text: `Screenshot of ${url}${selector ? ` (selector ${selector})` : ""} captured (${image.length} bytes).` },
    ],
  };
}

async function toolNavigate(args: Record<string, unknown>) {
  const url = String(args.url ?? "");
  if (!url) throw new Error("url is required");
  const out = await withPage({}, async (page) => {
    await goto(page, url);
    await page.waitForTimeout(500);
    const title = await page.title();
    const text = await page.evaluate(() => (document.body?.innerText ?? "").slice(0, 3000));
    return { title, text };
  });
  return {
    content: [{ type: "text", text: `Navigated to ${url}\nTitle: ${out.title}\n\n${out.text || "(empty page)"}` }],
  };
}

async function toolGetText(args: Record<string, unknown>) {
  const url = typeof args.url === "string" ? args.url : "";
  const selector = typeof args.selector === "string" ? args.selector : undefined;
  const out = await withPage({}, async (page) => {
    if (url) await goto(page, url);
    await page.waitForTimeout(300);
    if (selector) {
      const el = page.locator(selector).first();
      return await el.innerText({ timeout: 5000 }).catch(() => `(no element matches ${selector})`);
    }
    return await page.evaluate(() => (document.body?.innerText ?? "").slice(0, 6000));
  });
  return { content: [{ type: "text", text: out || "(empty)" }] };
}

async function toolClick(args: Record<string, unknown>) {
  const url = String(args.url ?? "");
  const selector = String(args.selector ?? "");
  if (!url || !selector) throw new Error("url and selector are required");
  const out = await withPage({}, async (page) => {
    await goto(page, url);
    await page.locator(selector).first().click({ timeout: 8000 });
    await page.waitForTimeout(Math.min(10000, Math.max(0, Number(args.delayMs ?? 900))));
    const text = await page.evaluate(() => (document.body?.innerText ?? "").slice(0, 3000));
    return text;
  });
  return { content: [{ type: "text", text: `Clicked ${selector}.\n\n${out || "(empty page)"}` }] };
}

// ---------------- MCP stdio server ----------------

const TOOLS = [
  {
    name: "forge_screenshot",
    description:
      "Take a REAL screenshot of a URL with a headless Chromium (returns a PNG image). Use this for visual verification of the running preview instead of the node_repl browser plugin.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Full URL to open (e.g. the platform preview URL)" },
        fullPage: { type: "boolean", description: "Capture the full scrollable page" },
        width: { type: "number" },
        height: { type: "number" },
        delayMs: { type: "number", description: "Wait after load before capturing (default 900)" },
        selector: { type: "string", description: "Capture a specific element instead of the viewport" },
      },
      required: ["url"],
    },
  },
  {
    name: "forge_navigate",
    description: "Open a URL in headless Chromium and return the page title and visible text (verification without screenshots).",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
  {
    name: "forge_get_text",
    description: "Return the innerText of a selector (or the whole body) from a URL — for asserting rendered content.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" }, selector: { type: "string" } },
    },
  },
  {
    name: "forge_click",
    description: "Click a selector on a URL in headless Chromium and return the page text afterwards.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" }, selector: { type: "string" }, delayMs: { type: "number" } },
      required: ["url", "selector"],
    },
  },
];

const IMPLS: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  forge_screenshot: toolScreenshot,
  forge_navigate: toolNavigate,
  forge_get_text: toolGetText,
  forge_click: toolClick,
};

function write(msg: unknown): void {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function rpcError(id: unknown, code: number, message: string): unknown {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

const buffer: string[] = [];
let acc = "";
let inFlight = 0;
let stdinClosed = false;

function maybeExit(): void {
  if (stdinClosed && inFlight === 0) process.exit(0);
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  acc += chunk;
  let idx: number;
  while ((idx = acc.indexOf("\n")) >= 0) {
    const line = acc.slice(0, idx).trim();
    acc = acc.slice(idx + 1);
    if (line) buffer.push(line);
  }
  drain();
});
process.stdin.on("end", () => {
  stdinClosed = true;
  maybeExit();
  // give in-flight work a grace period
  setInterval(maybeExit, 250).unref();
});

function drain(): void {
  while (buffer.length > 0) {
    const line = buffer.shift()!;
    let msg: { id?: unknown; method?: string; params?: Record<string, unknown> };
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    void handle(msg);
  }
}

async function handle(msg: { id?: unknown; method?: string; params?: Record<string, unknown> }): Promise<void> {
  const { id, method, params = {} } = msg;
  inFlight++;
  try {
    if (method === "initialize") {
      write({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "forge-browser", version: "1.0.0" },
        },
      });
      return;
    }
    if (method === "notifications/initialized" || (method ?? "").startsWith("notifications/")) return;
    if (method === "tools/list") {
      write({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
      return;
    }
    if (method === "tools/call") {
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const impl = IMPLS[name];
      if (!impl) {
        write(rpcError(id, -32602, `unknown tool: ${name}`));
        return;
      }
      try {
        const result = await impl(args);
        write({ jsonrpc: "2.0", id, result });
      } catch (e) {
        write({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: `forge-browser error: ${(e as Error).message}` }], isError: true },
        });
      }
      return;
    }
    if (method === "ping") {
      write({ jsonrpc: "2.0", id, result: {} });
      return;
    }
    if (id !== undefined) write(rpcError(id, -32601, `method not found: ${method}`));
  } catch (e) {
    if (id !== undefined) write(rpcError(id, -32603, (e as Error).message));
  } finally {
    inFlight--;
    maybeExit();
  }
}

console.error(`[forge-browser-mcp] ready (chrome: ${chromePath() ?? "NOT FOUND"})`);
