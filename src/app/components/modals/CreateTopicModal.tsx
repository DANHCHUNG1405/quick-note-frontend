"use client";

import { X } from "lucide-react";
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

  const flattenTopics = (
    nodes: TopicNode[],
    depth = 0,
  ): { id: string; name: string; depth: number }[] => {
    let result: { id: string; name: string; depth: number }[] = [];

    for (const node of nodes) {
      result.push({
        id: node.id,
        name: node.name,
        depth,
      });

      if (node.children?.length) {
        result = result.concat(flattenTopics(node.children, depth + 1));
      }
    }

    return result;
  };

  const flattenedTopics = flattenTopics(topics);

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
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchTopics();
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
    } catch (err: any) {
      setError(err.message || "Failed to create topic");
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
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
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

            <select
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="appearance-none w-full h-12 px-4 pr-10 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none cursor-pointer"
            >
              <option value="">None (Root Level)</option>

              {flattenedTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {"— ".repeat(t.depth)}
                  {t.name}
                </option>
              ))}
            </select>
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
