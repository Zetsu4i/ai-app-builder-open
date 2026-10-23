"use client";

// ZCode Builder — socket.io client. Always connect via the gateway: io("/?XTransformPort=3031") with path "/".

import { io, type Socket } from "socket.io-client";
import type {
  SocketAgentEvent,
  SocketMessageDelta,
  SocketMessageFinal,
  SocketMessagePart,
  SocketPermissionRequest,
  SocketQuestionRequest,
  SocketTerminalData,
} from "./types";

export interface ServerToClientEvents {
  hydrate: (payload: unknown) => void;
  "message:user": (payload: { id: string; role: "user"; parts: unknown[]; createdAt: string }) => void;
  "message:delta": (payload: SocketMessageDelta) => void;
  "message:reasoning-delta": (payload: SocketMessageDelta) => void;
  "message:part": (payload: SocketMessagePart) => void;
  "message:final": (payload: SocketMessageFinal) => void;
  "agent:event": (payload: SocketAgentEvent) => void;
  "permission:request": (payload: SocketPermissionRequest) => void;
  "question:request": (payload: SocketQuestionRequest) => void;
  terminal: (payload: SocketTerminalData) => void;
  devserver: (payload: Record<string, unknown>) => void;
  swarm: (payload: { type: string; payload: Record<string, unknown> }) => void;
  title: (payload: { projectId: string; title: string }) => void;
  usage: (payload: { projectId: string; contextUsed: number; contextWindow: number; totalTokens: number }) => void;
  error: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  "project:join": (payload: { projectId: string }) => void;
  "project:leave": (payload: { projectId: string }) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io("/", {
      query: { XTransformPort: "3031" },
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function joinProject(projectId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("project:join", { projectId });
}

export function leaveProject(projectId: string) {
  socket?.emit("project:leave", { projectId });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
