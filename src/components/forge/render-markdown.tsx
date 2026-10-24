"use client";

// ZCode Builder — markdown-lite renderer ported from Forge ChatPanel.
// Supports: **bold**, `code`, ordered/unordered lists, ### headers, paragraphs.

export function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const inline = (s: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(s))) {
      if (m.index > last) parts.push(<span key={k++}>{s.slice(last, m.index)}</span>);
      const tok = m[0];
      if (tok.startsWith("**")) parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
      else parts.push(<code key={k++}>{tok.slice(1, -1)}</code>);
      last = m.index + tok.length;
    }
    if (last < s.length) parts.push(<span key={k++}>{s.slice(last)}</span>);
    return parts;
  };

  const flush = () => {
    if (!listBuf) return;
    const Tag = listBuf.ordered ? "ol" : "ul";
    out.push(
      <Tag key={key++}>
        {listBuf.items.map((it, i) => (
          <li key={i}>{inline(it)}</li>
        ))}
      </Tag>,
    );
    listBuf = null;
  };

  for (const line of lines) {
    const ol = line.match(/^\d+\.\s+(.*)/);
    const ul = line.match(/^[-•]\s+(.*)/);
    if (ol) {
      if (!listBuf || !listBuf.ordered) {
        flush();
        listBuf = { ordered: true, items: [] };
      }
      listBuf.items.push(ol[1]);
    } else if (ul) {
      if (!listBuf || listBuf.ordered) {
        flush();
        listBuf = { ordered: false, items: [] };
      }
      listBuf.items.push(ul[1]);
    } else {
      flush();
      if (line.trim() === "") out.push(<div key={key++} className="h-1" />);
      else if (line.startsWith("### ")) out.push(<h4 key={key++}>{inline(line.slice(4))}</h4>);
      else if (line.startsWith("## ")) out.push(<h4 key={key++}>{inline(line.slice(3))}</h4>);
      else if (line.startsWith("# ")) out.push(<h4 key={key++}>{inline(line.slice(2))}</h4>);
      else out.push(<p key={key++}>{inline(line)}</p>);
    }
  }
  flush();
  return out;
}
