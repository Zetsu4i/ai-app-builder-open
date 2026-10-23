// agent-service — zai-bridge: OpenAI-compatible endpoint backed by z-ai-web-dev-sdk.
// This is the FREE builtin provider the ZCode core talks to (provider id: zai-bridge).
// Wire format: POST /llm/v1/chat/completions  (stream + non-stream)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

interface ZaiConfig {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  chatId?: string;
  userId?: string;
  token?: string;
}

function readZaiConfig(): ZaiConfig | null {
  const candidates = [
    process.env.Z_AI_CONFIG_FILE,
    path.join(process.cwd(), ".z-ai-config"),
    path.join(os.homedir(), ".z-ai-config"),
    "/etc/.z-ai-config",
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        return JSON.parse(raw) as ZaiConfig;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

export function bridgeHealthy(): boolean {
  return readZaiConfig() !== null || !!process.env.ZAI_API_KEY;
}

function upstreamHeaders(cfg: ZaiConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey || "Z.ai"}`,
    "X-Z-AI-From": "Z",
  };
  if (cfg.chatId) headers["X-Chat-Id"] = cfg.chatId;
  if (cfg.userId) headers["X-User-Id"] = cfg.userId;
  if (cfg.token) headers["X-Token"] = cfg.token;
  return headers;
}

function sanitizeMessages(messages: unknown[]): unknown[] {
  // Upstream rejects role:"tool" in some paths; normalize to user with prefix.
  return (messages || []).map((m) => {
    const msg = m as Record<string, unknown>;
    if (msg?.role === "tool") {
      return { role: "user", content: `[tool result] ${String(msg.content ?? "")}` };
    }
    return msg;
  });
}

async function sdkCompletion(body: Record<string, unknown>): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("z-ai-web-dev-sdk")) as unknown as { default: { create(): Promise<any> } };
  const ZAI = mod.default;
  const zai = await ZAI.create();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (await zai.chat.completions.create({
    ...body,
    stream: false,
    thinking: { type: "disabled" },
  })) as { choices?: { message?: { content?: string; reasoning_content?: string } }[]; usage?: unknown };
  const message = result?.choices?.[0]?.message ?? { content: "" };
  const chunk = {
    id: `chatcmpl-sdk-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: body.model || "zai-glm",
    choices: [{ index: 0, message, finish_reason: "stop" }],
    usage: result?.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
  return new Response(JSON.stringify(chunk), { status: 200, headers: { "Content-Type": "application/json" } });
}

async function upstreamCompletion(body: Record<string, unknown>, stream: boolean): Promise<Response> {
  const cfg = readZaiConfig();
  if (!cfg) throw new Error("No .z-ai-config found for zai-bridge upstream");
  const base = (cfg.baseUrl || "https://api.z.ai/api/paas/v4").replace(/\/$/, "");
  const url = base.endsWith("/v1") || base.includes("/paas/v4") ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
  const payload = {
    ...body,
    model: body.model || cfg.model || "GLM-4.7",
    thinking: { type: "disabled" },
  };
  const upstream = await fetch(url, {
    method: "POST",
    headers: upstreamHeaders(cfg),
    body: JSON.stringify(payload),
  });
  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    throw new Error(`Upstream ${upstream.status}: ${text.slice(0, 400)}`);
  }
  if (!stream) return new Response(await upstream.text(), { status: 200, headers: { "Content-Type": "application/json" } });

  // Re-emit upstream SSE as-is (already OpenAI chunk format); normalize just in case.
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  const sse = new ReadableStream({
    async start(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      }
      controller.close();
    },
  });
  return new Response(sse, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/** Handle POST /llm/v1/chat/completions */
export async function handleBridge(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: { message: "invalid json" } }, { status: 400 });
  }
  const stream = body.stream === true;
  if (body.messages) body.messages = sanitizeMessages(body.messages as unknown[]);

  // Prefer direct upstream (supports real streaming). Fall back to SDK.
  try {
    return await upstreamCompletion(body, stream);
  } catch (e) {
    try {
      return await sdkCompletion(body);
    } catch (e2) {
      return Response.json(
        { error: { message: `bridge upstream failed: ${(e as Error).message} / sdk: ${(e2 as Error).message}` } },
        { status: 502 },
      );
    }
  }
}

export async function bridgeText(prompt: string, system?: string, maxTokens = 512): Promise<string> {
  const body = {
    model: "GLM-4.7",
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    stream: false,
  };
  const res = await handleBridge(new Request("http://bridge/internal", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }));
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  if (json.error) throw new Error(json.error.message || "bridge error");
  return json.choices?.[0]?.message?.content ?? "";
}
