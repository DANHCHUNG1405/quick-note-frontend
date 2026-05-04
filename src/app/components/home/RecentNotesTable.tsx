"use client";

import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import type { DashboardRecentNote } from "@/app/types/dashboard.types";

type RecentNotesTableProps = {
  notes: DashboardRecentNote[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "No activity";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const noteTopicLabel = (note: DashboardRecentNote) =>
  note.topicName || note.topic_name || note.topic || note.topic_id || "No topic";

export default function RecentNotesTable({ notes }: RecentNotesTableProps) {
  return (
    <section className="min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={18} />
          <h2 className="text-lg font-bold text-slate-900">Recent Notes</h2>
        </div>
        <Link href="/shared" className="text-sm font-semibold text-primary hover:underline">
          Shared notes
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Note
              </th>
              <th className="hidden px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:table-cell">
                Topic
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Activity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notes.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-10 text-center text-sm text-slate-400"
                >
                  No recent note activity yet.
                </td>
              </tr>
            )}

            {notes.map((note) => (
              <tr key={note.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    href={`/notes/${note.id}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <FileText size={18} className="shrink-0 text-slate-400" />
                    <span className="truncate text-sm font-medium text-slate-800">
                      {note.title || "Untitled"}
                    </span>
                  </Link>
                </td>
                <td className="hidden px-5 py-4 md:table-cell">
                  <span className="inline-flex max-w-44 truncate rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {noteTopicLabel(note)}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDate(
                    note.last_viewed_at || note.updated_at || note.created_at,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
