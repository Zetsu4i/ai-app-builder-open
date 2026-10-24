"use client";

// Forge workspace — minimal single-line tokenizer for the textarea-over-highlight
// code editor. Local copy of the approach used by the source "Forge" UI
// (src/lib/highlight.tsx). Kept under a different filename to avoid colliding with
// src/lib/forge/highlight.tsx (owned by another agent). Emits .tok-* classes which
// must exist in globals.css (ported alongside the Forge theme tokens).

import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "import", "from", "export", "default", "const", "let", "var", "function",
  "return", "if", "else", "for", "while", "new", "typeof", "interface",
  "type", "extends", "as", "async", "await", "try", "catch", "throw",
  "switch", "case", "break", "continue", "in", "of", "class", "this",
  "public", "private", "readonly", "static", "enum", "implements", "namespace",
]);

function tokenizeLine(line: string, language?: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (text: string, cls: string) => {
    if (!text) return;
    nodes.push(<span key={key++} className={cls}>{text}</span>);
  };

  // full-line comment fast path
  const trimmed = line.trimStart();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    (language === "css" && trimmed.startsWith("@import")) ||
    (language === "sql" && trimmed.startsWith("--"))
  ) {
    const indentLen = line.length - trimmed.length;
    if (indentLen > 0) push(line.slice(0, indentLen), "tok-plain");
    push(trimmed, language === "css" && trimmed.startsWith("@") ? "tok-keyword" : "tok-comment");
    return nodes;
  }

  while (i < line.length) {
    const ch = line[i];

    // comments //
    if (ch === "/" && line[i + 1] === "/") {
      push(line.slice(i), "tok-comment");
      break;
    }
    // strings
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j += 2;
        else j++;
      }
      j = Math.min(j + 1, line.length);
      push(line.slice(i, j), "tok-string");
      i = j;
      continue;
    }
    // numbers + hex + px
    if (/[0-9]/.test(ch) || (ch === "#" && /[0-9a-fA-F]/.test(line[i + 1] || ""))) {
      let j = i + 1;
      while (j < line.length && /[0-9a-zA-Z.%#]/.test(line[j])) j++;
      push(line.slice(i, j), "tok-number");
      i = j;
      continue;
    }
    // JSX tags <Name or </ or >
    if (ch === "<" && /[A-Za-z/_!]/.test(line[i + 1] || "")) {
      let j = i + 1;
      if (line[j] === "/") j++;
      while (j < line.length && /[A-Za-z0-9._]/.test(line[j])) j++;
      push(line.slice(i, j), "tok-tag");
      i = j;
      continue;
    }
    // words
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const next = line[j];
      if (KEYWORDS.has(word)) push(word, "tok-keyword");
      else if (next === "(") push(word, "tok-func");
      else if (/^[A-Z]/.test(word)) push(word, "tok-type");
      else if (next === ":") push(word, "tok-prop");
      else push(word, "tok-plain");
      i = j;
      continue;
    }
    // braces/punct
    if ("{}()[]<>,.;:=+-*/!?&|".includes(ch)) {
      push(ch, "tok-punct");
      i++;
      continue;
    }
    // whitespace / other
    let j = i + 1;
    while (j < line.length && !/[A-Za-z0-9_$"'`#/<>(){}[\],.;:=+\-*!?&|]/.test(line[j])) j++;
    push(line.slice(i, j), "tok-plain");
    i = j;
  }
  return nodes;
}

export { tokenizeLine };
