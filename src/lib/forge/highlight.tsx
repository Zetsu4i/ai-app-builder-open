import React from "react";

const KEYWORDS = new Set([
  "import", "from", "export", "default", "const", "let", "var", "function",
  "return", "if", "else", "for", "while", "new", "typeof", "interface",
  "type", "extends", "as", "async", "await", "try", "catch", "throw",
  "switch", "case", "break", "continue", "in", "of", "class", "this",
]);

const TYPES = new Set([
  "string", "number", "boolean", "React", "Metadata", "Viewport",
  "Product", "FileNode", "Promise", "Array",
]);

const FUNCS = new Set([
  "Inter", "Cormorant_Garamond", "Merriweather", "map", "formatPrice",
  "require", "useState", "useEffect",
]);

function escapeHtml(s: string) {
  return s;
}

export function tokenizeLine(line: string, language?: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (text: string, cls: string) => {
    if (!text) return;
    nodes.push(
      <span key={key++} className={cls}>{text}</span>
    );
  };

  // full-line comment fast path
  const trimmed = line.trimStart();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    (language === "css" && trimmed.startsWith("@import"))
  ) {
    // keep indent unstyled then comment
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
      // check if attr value (preceded by =)
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
      // lookahead for function call
      const next = line[j];
      if (KEYWORDS.has(word)) push(word, "tok-keyword");
      else if (TYPES.has(word)) push(word, "tok-type");
      else if (FUNCS.has(word) || next === "(") push(word, "tok-func");
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
    while (j < line.length && !/[A-Za-z0-9_$"'`#/<>/{}\(\)\[\],.;:=+\-*!?&|]/.test(line[j])) j++;
    push(line.slice(i, j), "tok-plain");
    i = j;
  }
  return nodes;
}

export function highlightCode(code: string, language?: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, idx) => (
    <div key={idx} className="flex">
      <span className="w-12 shrink-0 select-none pr-4 text-right text-[#c9c2b2]">
        {idx + 1}
      </span>
      <code className="whitespace-pre">
        {line.length === 0 ? "\u200b" : tokenizeLine(line, language)}
      </code>
    </div>
  ));
}

export function highlightInline(code: string): React.ReactNode {
  return <>{tokenizeLine(code)}</>;
}

export { escapeHtml };
