"use client";

import {
  LayoutDashboard,
  Settings,
  Plus,
  FileText,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CreateTopicModal from "@/app/components/modals/CreateTopicModal";
import { topicsService } from "@/app/services/topic.service";
import type { TopicNode } from "@/app/types/topic.types";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<TopicNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busyTopicId, setBusyTopicId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<TopicNode | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TopicNode | null>(null);
  const pathname = usePathname();
  // Load topics lần đầu
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const tree = await topicsService.getTree();
    setTopics(tree);
  };

  const startRename = (topic: TopicNode) => {
    setRenameTarget(topic);
    setRenameValue(topic.name);
  };

  const cancelRename = () => {
    setRenameTarget(null);
    setRenameValue("");
  };

  const confirmRename = async () => {
    if (!renameTarget) return;
    const title = renameValue.trim();
    if (!title || title === renameTarget.name) {
      cancelRename();
      return;
    }

    try {
      setBusyTopicId(renameTarget.id);
      await topicsService.rename(renameTarget.id, { title });
      await loadTopics();
      cancelRename();
    } catch (err) {
      console.error("Failed to rename topic", err);
      alert(err instanceof Error ? err.message : "Failed to rename topic");
    } finally {
      setBusyTopicId(null);
    }
  };

  const requestDelete = (topic: TopicNode) => {
    setDeleteTarget(topic);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setBusyTopicId(deleteTarget.id);
      await topicsService.remove(deleteTarget.id);
      await loadTopics();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete topic", err);
      alert(err instanceof Error ? err.message : "Failed to delete topic");
    } finally {
      setBusyTopicId(null);
    }
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpanded(newSet);
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <FileText size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            QuickNote
          </span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span>New Topic</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <Link href="/">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={pathname === "/"}
          />
        </Link>

        <Link href="/shared">
          <SidebarItem
            icon={<Share2 size={18} />}
            label="Shared"
            active={pathname === "/shared"}
          />
        </Link>

        <Link href="/todos">
          <SidebarItem
            icon={<CheckSquare size={18} />}
            label="Todos"
            active={pathname === "/todos"}
          />
        </Link>

        <SidebarItem icon={<Settings size={18} />} label="Settings" />

        <div className="pt-8 px-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Your Topics
            </span>
            <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
              {topics.length}
            </span>
          </div>

          <div className="space-y-1">
            {topics.map((topic) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                depth={0}
                expanded={expanded}
                toggleExpand={toggleExpand}
                pathname={pathname}
                onRename={startRename}
                onDelete={requestDelete}
                busyTopicId={busyTopicId}
              />
            ))}
          </div>
        </div>
      </nav>

      <CreateTopicModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={loadTopics}
      />

      {renameTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={cancelRename}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                Rename Topic
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Update the name for <strong>{renameTarget.name}</strong>.
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="text-sm font-semibold text-slate-700">
                New Name
              </label>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void confirmRename();
                  }
                }}
                autoFocus
                className="mt-2 w-full h-11 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 outline-none text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={cancelRename}
                className="px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                disabled={busyTopicId === renameTarget.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {busyTopicId === renameTarget.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Topic
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                This will remove <strong>{deleteTarget.name}</strong> and all of
                its subtopics. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={busyTopicId === deleteTarget.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {busyTopicId === deleteTarget.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
function TopicItem({
  topic,
  depth,
  expanded,
  toggleExpand,
  pathname,
  onRename,
  onDelete,
  busyTopicId,
}: {
  topic: TopicNode;
  depth: number;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  pathname: string;
  onRename: (topic: TopicNode) => void;
  onDelete: (topic: TopicNode) => void;
  busyTopicId: string | null;
}) {
  const hasChildren = topic.children?.length > 0;
  const isOpen = expanded.has(topic.id);
  const isActive = pathname === `/topics/${topic.id}`;
  const isBusy = busyTopicId === topic.id;

  return (
    <>
      <div
        className={`group flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-slate-600 hover:bg-slate-50"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Chevron */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(topic.id);
              }}
              className="text-slate-400"
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {/* Link */}
          <Link
            href={`/topics/${topic.id}`}
            className="text-sm truncate flex-1"
          >
            {topic.name}
          </Link>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRename(topic);
            }}
            disabled={isBusy}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-50"
            aria-label="Rename topic"
            title="Rename"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(topic);
            }}
            disabled={isBusy}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-50"
            aria-label="Delete topic"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasChildren &&
        isOpen &&
        topic.children.map((child) => (
          <TopicItem
            key={child.id}
            topic={child}
            depth={depth + 1}
            expanded={expanded}
            toggleExpand={toggleExpand}
            pathname={pathname}
            onRename={onRename}
            onDelete={onDelete}
            busyTopicId={busyTopicId}
          />
        ))}
    </>
  );
}
function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
        active
          ? "text-primary bg-primary/5"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
