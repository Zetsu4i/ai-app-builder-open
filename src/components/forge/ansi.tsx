"use client";

// Forge workspace — ANSI escape renderer for terminal output.
// Supports SGR 0/2/3/4/22/23/24/39/49, 30-37/90-97 fg, 40-47/100-107 bg,
// 256-color (38;5;n / 48;5;n) and 24-bit (38;2;r;g;b / 48;2;r;g;b).
// Ported for the Forge dark terminal surfaces (#211d1a).

import type { CSSProperties, ReactNode } from "react";

// xterm-ish palette tuned for the warm dark Forge terminal.
const BASE16 = [
  "#2a2522", "#ff6b5c", "#8fd6a0", "#e8c47a", "#8ab8ff", "#f0a5c0", "#7fd4d4", "#e8e3da",
  "#6b6560", "#ff9c8a", "#b8e6c6", "#f5d9a0", "#b3ccff", "#f7c6da", "#a8e4e4", "#ffffff",
];

const CUBE_LEVELS = [0, 95, 135, 175, 215, 255];

function palette256(n: number): string | null {
  if (n < 16) return BASE16[n] ?? null;
  if (n < 232) {
    const idx = n - 16;
    const r = CUBE_LEVELS[Math.floor(idx / 36)];
    const g = CUBE_LEVELS[Math.floor((idx % 36) / 6)];
    const b = CUBE_LEVELS[idx % 6];
    return `rgb(${r},${g},${b})`;
  }
  const v = 8 + (n - 232) * 10;
  return `rgb(${v},${v},${v})`;
}

interface AnsiStyle {
  fg: string | null;
  bg: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  dim: boolean;
}

const RESET: AnsiStyle = { fg: null, bg: null, bold: false, italic: false, underline: false, dim: false };

function applySgr(style: AnsiStyle, codes: number[]) {
  let i = 0;
  while (i < codes.length) {
    const c = codes[i];
    if (c === 0) Object.assign(style, RESET);
    else if (c === 1) style.bold = true;
    else if (c === 2) style.dim = true;
    else if (c === 3) style.italic = true;
    else if (c === 4) style.underline = true;
    else if (c === 22) { style.bold = false; style.dim = false; }
    else if (c === 23) style.italic = false;
    else if (c === 24) style.underline = false;
    else if (c === 39) style.fg = null;
    else if (c === 49) style.bg = null;
    else if ((c >= 30 && c <= 37) || (c >= 90 && c <= 97)) style.fg = palette256(c >= 90 ? c - 90 + 8 : c - 30);
    else if ((c >= 40 && c <= 47) || (c >= 100 && c <= 107)) style.bg = palette256(c >= 100 ? c - 100 + 8 : c - 40);
    else if ((c === 38 || c === 48) && codes.length > i + 1) {
      const target = c === 38 ? "fg" : "bg";
      const mode = codes[i + 1];
      if (mode === 5 && codes.length > i + 2) {
        style[target] = palette256(codes[i + 2]);
        i += 2;
      } else if (mode === 2 && codes.length > i + 4) {
        style[target] = `rgb(${codes[i + 2]},${codes[i + 3]},${codes[i + 4]})`;
        i += 4;
      }
    }
    i += 1;
  }
}

function styleToCss(style: AnsiStyle): CSSProperties {
  const css: CSSProperties = {};
  if (style.fg) css.color = style.fg;
  if (style.bg) css.backgroundColor = style.bg;
  if (style.bold) css.fontWeight = 700;
  if (style.italic) css.fontStyle = "italic";
  if (style.underline) css.textDecoration = "underline";
  if (style.dim) css.opacity = 0.55;
  return css;
}

const SGR_RE = /\u001b\[([0-9;]*)m/g;

/** Render a single line of terminal text, resolving ANSI SGR sequences into styled spans. */
export function renderAnsi(text: string): ReactNode {
  if (!text.includes("\u001b")) return text;
  const out: ReactNode[] = [];
  const style: AnsiStyle = { ...RESET };
  let last = 0;
  let key = 0;
  SGR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SGR_RE.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={key++} style={styleToCss(style)}>{text.slice(last, m.index)}</span>);
    }
    const codes = m[1].length ? m[1].split(";").map((s) => parseInt(s, 10) || 0) : [0];
    applySgr(style, codes);
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push(<span key={key++} style={styleToCss(style)}>{text.slice(last)}</span>);
  }
  return out;
}

/** Strip ANSI sequences (for copy-to-clipboard). */
export function stripAnsi(text: string): string {
  return text.replace(SGR_RE, "").replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
}
