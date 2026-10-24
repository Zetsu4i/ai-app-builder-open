"use client";

// Forge workspace — file explorer tree over the real project file tree.

import { useMemo, useState } from "react";
import {
  ChevronDown, ChevronRight, FileCode2, FileJson2, FileText, FileType2,
  FolderOpen, Folder, Search, FilePlus2, FolderPlus, RotateCw, MoreHorizontal,
  Paintbrush, Braces, Loader2,
} from "lucide-react";
import { useForge } from "@/lib/store";
import type { FileNode } from "@/lib/types";
import { cn, countFiles } from "./forge-utils";

function iconFor(name: string) {
  if (name.endsWith(".tsx") || name.endsWith(".jsx")) return <FileCode2 size={15} className="text-[#2f6bff]" strokeWidth={1.8} />;
  if (name.endsWith(".ts")) return <FileType2 size={15} className="text-[#0e7490]" strokeWidth={1.8} />;
  if (name.endsWith(".css") || name.endsWith(".scss")) return <Paintbrush size={15} className="text-[#7c3aed]" strokeWidth={1.8} />;
  if (name.endsWith(".json")) return <FileJson2 size={15} className="text-[#b4532a]" strokeWidth={1.8} />;
  if (name.endsWith(".md") || name.endsWith(".mdx")) return <FileText size={15} className="text-muted" strokeWidth={1.8} />;
  if (name.endsWith(".mjs") || name.endsWith(".js") || name.endsWith(".cjs")) return <Braces size={15} className="text-[#c98a2d]" strokeWidth={1.8} />;
  return <FileText size={15} className="text-muted" strokeWidth={1.8} />;
}

function TreeRow({ node, depth, activePath, dirtyPaths, onSelect, open, onToggle }: {
  node: FileNode; depth: number; activePath: string | null; dirtyPaths: Record<string, boolean>;
  onSelect: (p: string) => void; open: boolean; onToggle: () => void;
}) {
  const dirty = !!dirtyPaths[node.path];
  if (node.type === "dir") {
    return (
      <button
        onClick={onToggle}
        style={{ paddingLeft: 8 + depth * 14 }}
        className="flex w-full items-center gap-1.5 rounded-md py-[5px] pr-2 text-[12.5px] font-medium text-ink-soft transition hover:bg-black/[0.05] hover:text-ink"
      >
        {open ? <ChevronDown size={13} className="text-muted" /> : <ChevronRight size={13} className="text-muted" />}
        {open ? <FolderOpen size={15} className="text-honey" strokeWidth={1.8} /> : <Folder size={15} className="text-honey" strokeWidth={1.8} />}
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
  const active = activePath === node.path;
  return (
    <button
      onClick={() => onSelect(node.path)}
      style={{ paddingLeft: 8 + depth * 14 + 19 }}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded-md py-[5px] pr-2 text-[12.5px] transition",
        active ? "bg-ink/[0.07] font-medium text-ink" : "text-ink-soft hover:bg-black/[0.05] hover:text-ink",
      )}
    >
      {iconFor(node.name)}
      <span className="truncate">{node.name}</span>
      {node.added && <span className="ml-auto text-[10px] font-bold text-moss">A</span>}
      {dirty && !node.added && <span className="ml-auto text-[10px] font-bold text-honey">M</span>}
      {node.modified && !dirty && !node.added && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-honey/60" />}
    </button>
  );
}

export default function FileExplorer() {
  const project = useForge((s) => s.activeProject);
  const tree = useForge((s) => s.fileTree);
  const activePath = useForge((s) => s.activePath);
  const dirtyPaths = useForge((s) => s.dirtyPaths);
  const openFile = useForge((s) => s.openFile);
  const refreshFileTree = useForge((s) => s.refreshFileTree);
  const setOverlay = useForge((s) => s.setOverlay);

  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const toggle = (p: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const match = (n: FileNode): FileNode | null => {
      if (n.type === "file") return n.path.toLowerCase().includes(q) ? n : null;
      const kids = (n.children ?? []).map(match).filter(Boolean) as FileNode[];
      if (kids.length > 0 || n.name.toLowerCase().includes(q)) {
        return { ...n, children: n.name.toLowerCase().includes(q) ? n.children : kids };
      }
      return null;
    };
    return tree.map(match).filter(Boolean) as FileNode[];
  }, [tree, search]);

  const renderNodes = (nodes: FileNode[], depth: number): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    for (const n of nodes) {
      const isOpen = search.trim() ? true : openFolders.has(n.path);
      out.push(
        <TreeRow
          key={n.path}
          node={n}
          depth={depth}
          activePath={activePath}
          dirtyPaths={dirtyPaths}
          onSelect={(p) => void openFile(p)}
          open={isOpen}
          onToggle={() => toggle(n.path)}
        />,
      );
      if (n.type === "dir" && n.children && isOpen) out.push(...renderNodes(n.children, depth + 1));
    }
    return out;
  };

  const doRefresh = async () => {
    setRefreshing(true);
    await refreshFileTree();
    setRefreshing(false);
  };

  const fileCount = countFiles(tree);

  return (
    <div className="flex h-full w-[212px] shrink-0 flex-col border-r border-line bg-cream">
      <div className="flex items-center gap-0.5 border-b border-line-soft px-2 py-1.5">
        <span className="px-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">Explorer</span>
        <div className="ml-auto flex items-center">
          <button onClick={() => setOverlay("newFileOpen", true)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="New file">
            <FilePlus2 size={14} />
          </button>
          <button onClick={() => setOverlay("newFileOpen", true)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="New folder">
            <FolderPlus size={14} />
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={cn("flex h-7 w-7 items-center justify-center rounded-md transition", searchOpen ? "bg-ink/[0.07] text-ink" : "text-muted hover:bg-black/5 hover:text-ink")}
            title="Search files"
          >
            <Search size={14} />
          </button>
          <button onClick={() => void doRefresh()} className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="Refresh">
            {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-black/5 hover:text-ink" title="More">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-line-soft p-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1.5">
            <Search size={13} className="text-muted" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter files…"
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-faint"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3.5 pb-1 pt-2">
        <span className="truncate text-[10.5px] font-bold tracking-wide text-faint">
          {(project?.title ?? "workspace").toUpperCase().slice(0, 22)}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-3">
        {renderNodes(filtered, 0)}
        {filtered.length === 0 && (
          <p className="px-3 py-4 text-[12px] text-muted">
            {tree.length === 0 ? "No files yet — the workspace is empty." : <>No files match “{search}”.</>}
          </p>
        )}
      </div>

      <div className="border-t border-line-soft px-3 py-2">
        <div className="flex items-center gap-2 text-[10.5px] text-muted">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-honey" /> Modified</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> Added</span>
          <span className="ml-auto">{fileCount} file{fileCount === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
