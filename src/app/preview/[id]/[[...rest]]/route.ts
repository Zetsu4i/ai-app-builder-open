// Preview proxy: /preview/<id>/<path> → agent-service /preview/<id>/<path>
// (agent-service serves static workspace files or reverse-proxies the live dev server).
import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:3031";

async function proxy(req: NextRequest, id: string, rest: string[] | undefined) {
  const rel = rest && rest.length ? `/${rest.join("/")}` : "/";
  const url = new URL(req.url);
  const target = `${AGENT_SERVICE}/preview/${id}${rel}${url.search}`;
  try {
    const headers: Record<string, string> = {};
    for (const [k, v] of req.headers.entries()) {
      if (["host", "connection", "accept-encoding", "content-length"].includes(k)) continue;
      headers[k] = v;
    }
    const res = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : new Uint8Array(await req.arrayBuffer()),
      signal: AbortSignal.timeout(30000),
    });
    const respHeaders = new Headers();
    res.headers.forEach((v, k) => {
      if (!["content-encoding", "transfer-encoding", "connection", "content-length"].includes(k)) respHeaders.set(k, v);
    });
    respHeaders.set("Access-Control-Allow-Origin", "*");
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, { status: res.status, headers: respHeaders });
  } catch {
    return new NextResponse(
      `<!doctype html><html><body style="font-family:system-ui;padding:48px;background:#f4f1eb"><h2>Preview warming up…</h2></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*" } },
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
