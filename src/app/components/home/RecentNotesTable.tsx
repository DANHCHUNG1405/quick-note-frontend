"use client";

import { FileText, MoreHorizontal, Clock } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { notesService } from "@/app/services/notes.service";
import { topicsService } from "@/app/services/topic.service";
import type { Note } from "@/app/types/note.types";
import type { TopicNode } from "@/app/types/topic.types";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const TAG_VARIANTS = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-rose-50 text-rose-600",
  "bg-amber-50 text-amber-700",
  "bg-slate-100 text-slate-600",
];

const tagClassFor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return TAG_VARIANTS[hash % TAG_VARIANTS.length];
};

export default function RecentNotesTable() {
  const recentNotesQuery = useQuery<Note[], Error>({
    queryKey: ["notes", "recent"],
    queryFn: () => notesService.getRecent(),
  });

  const topicsQuery = useQuery<TopicNode[], Error>({
    queryKey: ["topics", "tree"],
    queryFn: () => topicsService.getTree(),
  });

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: TopicNode[]) => {
      nodes.forEach((node) => {
        map.set(node.id, node.name);
        if (node.children?.length) {
          walk(node.children);
        }
      });
    };

    if (topicsQuery.data) {
      walk(topicsQuery.data);
    }

    return map;
  }, [topicsQuery.data]);

  const notes = recentNotesQuery.data ?? [];
  const isLoading = recentNotesQuery.isLoading || topicsQuery.isLoading;
  const errorMessage =
    recentNotesQuery.error?.message || topicsQuery.error?.message || null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={18} />
          <h2 className="text-lg font-bold text-slate-900">Recent Notes</h2>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Note Title
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Topic
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Last Modified
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {errorMessage && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-sm text-red-600 bg-red-50"
                >
                  {errorMessage}
                </td>
              </tr>
            )}

            {!errorMessage && isLoading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-slate-400"
                >
                  Loading recent notes...
                </td>
              </tr>
            )}

            {!errorMessage && !isLoading && notes.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-slate-400"
                >
                  No recent notes yet.
                </td>
              </tr>
            )}

            {notes.map((note) => {
              const topicName =
                topicNameById.get(note.topic_id) ?? "Unknown topic";
              const tagClass = tagClassFor(note.topic_id);
              const lastModified = formatDate(
                note.updated_at || note.created_at,
              );

              return (
              <tr
                key={note.id}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {note.title}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wide ${tagClass}`}
                  >
                    {topicName}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {lastModified}
                </td>

                <td className="px-6 py-4 text-right">
                  <MoreHorizontal
                    size={18}
                    className="text-slate-300 group-hover:text-primary transition-colors"
                  />
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
