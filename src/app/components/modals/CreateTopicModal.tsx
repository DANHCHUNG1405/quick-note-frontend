"use client";

import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { topicsService } from "@/app/services/topic.service";
import type { TopicNode } from "@/app/types/topic.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback reload sidebar
}

export default function CreateTopicModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const findTopicName = (
    nodes: TopicNode[],
    id: string,
  ): string | null => {
    for (const node of nodes) {
      if (node.id === id) return node.name;
      if (node.children?.length) {
        const found = findTopicName(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedParentName = parentId
    ? findTopicName(topics, parentId)
    : null;

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTopicNode = (node: TopicNode, depth = 0) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expandedIds.has(node.id);

    return (
      <div key={node.id} className="space-y-1">
        <div
          className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-slate-50"
          style={{ paddingLeft: `${Math.min(depth, 4) * 14 + 8}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="h-6 w-6" />
          )}

          <button
            type="button"
            onClick={() => {
              setParentId(node.id);
              setDropdownOpen(false);
            }}
            className="flex-1 text-left text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            {node.name}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children?.map((child) => renderTopicNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ESC close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Load parent topics khi modal mở
  useEffect(() => {
    if (!open) return;

    const fetchTopics = async () => {
      try {
        const tree = await topicsService.getTree();
        console.log("Fetched topic tree:", tree);
        setTopics(tree);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load topics"));
      }
    };

    fetchTopics();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDropdownOpen(false);
      setExpandedIds(new Set());
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Topic name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await topicsService.create({
        title,
        parent_id: parentId || null,
      });

      setTitle("");
      setParentId(null);

      onClose();
      onCreated?.(); // reload sidebar
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create topic"));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Create New Topic
            </h2>
            <p className="text-sm text-slate-500">
              Organize your notes into a new folder hierarchy.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Topic Name
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Marketing Strategy 2024"
              className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Parent Topic
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex w-full h-12 items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-4 text-left text-slate-900 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <span
                  className={`text-sm ${selectedParentName ? "text-slate-900" : "text-slate-400"}`}
                >
                  {selectedParentName || "None (Root Level)"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="max-h-64 overflow-auto py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setParentId(null);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      None (Root Level)
                    </button>

                    <div className="mt-1 space-y-1">
                      {topics.length ? (
                        topics.map((node) => renderTopicNode(node))
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-400">
                          No topics available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Optional. Select a parent to nest this topic.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Topic"}
          </button>
        </div>
      </div>
    </div>
  );
}


