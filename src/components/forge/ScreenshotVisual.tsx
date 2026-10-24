"use client";

// ZCode Builder — screenshot visual. Real artifact image when a path exists,
// warm-paper CSS composition as fallback (ported 1:1 from Forge).

import { cn } from "@/lib/utils";
import * as api from "@/lib/api";

export type ShotVariant = "hero" | "cards" | "mobile" | "form" | "chart";

export function ScreenshotVisual({
  projectId,
  path,
  variant,
  large = false,
  alt,
}: {
  projectId?: string | null;
  path?: string | null;
  variant?: ShotVariant;
  large?: boolean;
  alt?: string;
}) {
  if (projectId && path) {
    return (
      <img
        src={api.artifactRawUrl(projectId, path)}
        alt={alt ?? path}
        className={cn("block h-full w-full object-cover object-top", large ? "min-h-[480px]" : "")}
      />
    );
  }
  return <ShotArt variant={variant ?? "hero"} large={large} />;
}

/** Themed CSS screenshot composition — fallback when no binary exists. */
function ShotArt({ variant, large = false }: { variant: ShotVariant; large?: boolean }) {
  if (variant === "mobile") {
    return (
      <div className={cn("relative overflow-hidden border-y border-line-soft bg-[#e7e1d3]", large ? "h-full" : "h-32")}>
        <div
          className={cn(
            "absolute left-1/2 top-3 -translate-x-1/2 rounded-[18px] border-4 border-[#292524] bg-[#faf7f0]",
            large ? "h-full w-[260px]" : "h-[112%] w-[128px]",
          )}
        >
          <div className="h-3 rounded-t-[14px] bg-[#292524]" />
          <div className="space-y-2 p-2.5">
            <div className="h-1.5 w-2/3 rounded-full bg-[#292524]/25" />
            <div className="h-14 rounded-lg bg-gradient-to-br from-[#292524] to-[#4a2f22]" />
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 flex-1 rounded-md bg-white" />
              ))}
            </div>
            <div className="h-10 rounded-md bg-white" />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "cards") {
    return (
      <div className={cn("relative overflow-hidden border-y border-line-soft bg-[#292524]", large ? "h-full" : "h-32")}>
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-[#3a3532] p-2">
              <div className="h-7 w-7 rounded bg-[#c98a2d]/40" />
              <div className="flex-1 space-y-1">
                <div className="h-1 w-1/2 rounded-full bg-white/30" />
                <div className="h-1 w-1/3 rounded-full bg-white/15" />
              </div>
              <div className="h-1.5 w-8 rounded-full bg-white/25" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (variant === "form") {
    return (
      <div className={cn("relative overflow-hidden border-y border-line-soft bg-[#b4532a]", large ? "h-full" : "h-32")}>
        <div className="absolute inset-x-0 top-6 flex flex-col items-center gap-2">
          <div className="h-2 w-1/2 rounded-full bg-white/70" />
          <div className="h-1 w-1/3 rounded-full bg-white/35" />
          <div className="mt-2 w-[62%] rounded-full bg-white px-3 py-2">
            <div className="h-1 w-1/3 rounded-full bg-[#b8b2a7]" />
          </div>
          <div className="w-[38%] rounded-full bg-[#292524] py-1.5">
            <div className="mx-auto h-1 w-1/2 rounded-full bg-white/55" />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "chart") {
    return (
      <div className={cn("relative overflow-hidden border-y border-line-soft bg-[#fdfcf9]", large ? "h-full" : "h-32")}>
        <div className="absolute inset-x-4 bottom-3 flex items-end gap-2" style={{ height: "68%" }}>
          {[38, 62, 45, 88, 70, 96, 54, 74].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-[#5b6b4c]/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden border-y border-line-soft bg-[#faf7f0]", large ? "h-full" : "h-32")}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 82% 18%, #f3e3c8 0%, transparent 70%)" }} />
      <div className={cn("absolute left-[7%] top-[24%]", large ? "scale-[2.2] origin-top-left" : "")}>
        <p className="text-[6px] font-bold tracking-wider text-clay">SMALL-BATCH · STONE-GROUND</p>
        <p className="mt-1 font-display text-[24px] leading-none">
          Bake with
          <br />
          <span className="font-display italic text-[#cc2b60]">Flavour</span> worth
          <br />
          remembering.
        </p>
        <span className="mt-3 inline-block rounded-full bg-ink px-3 py-1.5 text-[6px] text-white">Shop bestsellers →</span>
      </div>
      <div className="absolute bottom-[12%] right-[7%] w-[33%] rounded-xl bg-ink p-3 text-white" style={{ height: "46%" }}>
        <p className="text-[5px] tracking-wider text-honey">THIS WEEK&apos;S MILL</p>
        <p className="mt-1 font-display text-[16px]">Ceylon Cinnamon</p>
        <p className="mt-2 text-[5px] text-white/50">Galle, Sri Lanka · freshly ground</p>
      </div>
    </div>
  );
}
