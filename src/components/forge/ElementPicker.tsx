"use client";

// Forge workspace — picked-element attach sheet + compact chips.
// The element selection itself happens inside the preview iframe via the
// message-based picker in PreviewPane (postMessage protocol, see below);
// this file owns the post-pick UX that was ElementPicker.tsx in the source UI.

import { useState } from "react";
import { X, SquareDashedMousePointer, MousePointer2, Check, Trash2, Sparkles, Type, Tag } from "lucide-react";
import type { PickedElement } from "@/lib/types";
import { cn } from "./forge-utils";

/** Messages posted to / received from the preview iframe bridge. */
export type ForgePickOutbound = { type: "forge:enable-pick" } | { type: "forge:disable-pick" };
export type ForgePickInbound = {
  type: "forge:picked";
  selector: string;
  tag: string;
  text?: string;
  styles?: Record<string, string>;
};
export const FORGE_PICK_FLAG = "forge_pick=1";

function stylesToString(styles?: Record<string, string>): string {
  if (!styles) return "";
  return Object.entries(styles)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

/**
 * The attach sheet shown after an element has been picked inside the preview.
 * Holds the optional instructions input; attach hands the element to the store.
 */
export function PickedElementSheet({ pick, onAttach, onDismiss, onPickAnother }: {
  pick: PickedElement | null;
  onAttach: (instructions?: string) => void;
  onDismiss: () => void;
  onPickAnother: () => void;
}) {
  const [note, setNote] = useState("");
  if (!pick) return null;
  return (
    <div className="anim-fade-up absolute bottom-7 left-1/2 z-20 w-[min(460px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-card shadow-xl">
      <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-clay/10 text-clay"><MousePointer2 size={12} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10.5px] font-semibold">Selected &lt;{pick.tag}&gt;</span>
          <span className="block truncate font-mono text-[8.5px] text-muted">{pick.selector}</span>
        </span>
        <button onClick={onDismiss} className="shrink-0 text-muted hover:text-ink"><X size={13} /></button>
      </div>
      <div className="px-3 py-2">
        {pick.text && <p className="line-clamp-2 text-[9.5px] leading-relaxed text-muted">“{pick.text}”</p>}
        {pick.styles && Object.keys(pick.styles).length > 0 && (
          <p className="mt-1 truncate font-mono text-[8.5px] text-faint">{stylesToString(pick.styles)}</p>
        )}
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-line bg-cream px-2.5 focus-within:border-ink/25">
          <Type size={11} className="shrink-0 text-muted" />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onAttach(note.trim() || undefined); }}
            placeholder="Optional instructions, e.g. make this larger…"
            className="h-8 w-full bg-transparent text-[10.5px] outline-none placeholder:text-faint"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t border-line-soft bg-cream px-3 py-2">
        <button
          onClick={() => onAttach(note.trim() || undefined)}
          className="flex h-7 items-center gap-1.5 rounded-md bg-ink px-2.5 text-[9.5px] font-semibold text-white transition hover:bg-stone-800"
        >
          <Tag size={10} /> Attach to message
        </button>
        <button
          onClick={onPickAnother}
          className="flex h-7 items-center gap-1.5 rounded-md border border-line bg-card px-2.5 text-[9.5px] font-semibold text-ink-soft transition hover:text-ink"
        >
          <SquareDashedMousePointer size={10} /> Pick another
        </button>
        <span className="ml-auto text-[9px] text-faint">↵ attach</span>
      </div>
    </div>
  );
}

/** Compact chips shown in toolbars while picked elements are attached to the next message. */
export function PickedChips({ picks, onOpen, onClear }: {
  picks: PickedElement[];
  onOpen?: () => void;
  onClear?: () => void;
}) {
  if (picks.length === 0) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button
        onClick={onOpen}
        title="View selected elements"
        className="flex h-7 shrink-0 items-center gap-1 rounded-md bg-[#2f6bff]/10 px-2 text-[9.5px] font-bold text-[#2f6bff]"
      >
        <SquareDashedMousePointer size={10} /> {picks.length} selected
        <Check size={9} strokeWidth={3} />
      </button>
      {onClear && (
        <button
          onClick={onClear}
          title="Clear all picked elements"
          className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-clay")}
        >
          <Trash2 size={11} />
        </button>
      )}
    </span>
  );
}

/** Small helper chip row listing the attached picks (used inside the sheet header area). */
export function PickedSummary({ picks }: { picks: PickedElement[] }) {
  if (picks.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <Sparkles size={10} className="shrink-0 text-honey" />
      <span className="truncate text-[10px] text-muted">
        {picks.length} element{picks.length > 1 ? "s" : ""} attached · {picks.map((p) => `<${p.tag}>`).join(" ")}
      </span>
    </div>
  );
}
