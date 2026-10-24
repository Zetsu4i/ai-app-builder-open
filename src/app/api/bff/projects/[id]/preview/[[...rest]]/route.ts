import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:3031";

// Dev-server responses must NEVER be cached: while the dev server boots we serve
// "warming up" placeholders that would otherwise stick in the browser's heuristic
// cache and randomly replace real modules on reload (the "blank preview" bug).
const NO_STORE = "no-store, no-cache, must-revalidate";

async function proxy(req: NextRequest, id: string, rest: string[] | undefined) {
  const rel = rest && rest.length ? `/${rest.join("/")}` : "/";
  const url = new URL(req.url);
  const target = `${AGENT_SERVICE}/preview/${id}${rel}${url.search}`;
  const headers: Record<string, string> = {};
  for (const [k, v] of req.headers.entries()) {
    if (["host", "connection", "accept-encoding", "content-length"].includes(k)) continue;
    headers[k] = v;
  }
  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : new Uint8Array(await req.arrayBuffer()),
      signal: AbortSignal.timeout(30000),
    });
    const respHeaders = new Headers();
    res.headers.forEach((v, k) => {
      if (["content-encoding", "transfer-encoding", "connection", "content-length", "cache-control"].includes(k)) return;
      respHeaders.set(k, v);
    });
    respHeaders.set("Access-Control-Allow-Origin", "*");
    respHeaders.set("Cache-Control", NO_STORE);
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, { status: res.status, headers: respHeaders });
  } catch {
    return new NextResponse(
      `<!doctype html><html><body style="font-family:system-ui;padding:48px;background:#f4f1eb"><h2>Preview warming up…</h2></body></html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": NO_STORE,
        },
      },
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; rest?: string[] }> }) {
  const { id, rest } = await params;
  return proxy(req, id, rest);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; rest?: string[] }> }) {
  const { id, rest } = await params;
  return proxy(req, id, rest);
}
