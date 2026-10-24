// BFF catch-all: proxies /api/bff/* → agent-service :3031 (server-side only).
import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:3031";

async function proxy(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  // /health lives at the service root; everything else is under /api/*
  const sub = path[0] === "health" ? path.slice(1).join("/") : path.join("/");
  const target = path[0] === "health" ? `${AGENT_SERVICE}/health${url.search}` : `${AGENT_SERVICE}/api/${sub}${url.search}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const method = req.method;
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text();
  }
  try {
    const res = await fetch(target, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(120000),
    });
    const contentType = res.headers.get("content-type") || "application/json";
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    if (contentType.includes("application/json")) {
      const text = await res.text();
      return new NextResponse(text, { status: res.status, headers: { "Content-Type": contentType } });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, { status: res.status, headers: { "Content-Type": contentType } });
  } catch (e) {
    return NextResponse.json({ error: `agent-service unreachable: ${(e as Error).message}` }, { status: 502 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}
