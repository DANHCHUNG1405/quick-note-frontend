"use client";

import { FileText, MoreHorizontal, Clock } from "lucide-react";
import { recentNotes } from "@/app/constants/home";

export default function RecentNotesTable() {
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
            {recentNotes.map((note) => (
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
                    className={`px-2 py-1 bg-${note.topicColor}-50 text-${note.topicColor}-600 text-[10px] font-bold rounded uppercase tracking-wide`}
                  >
                    {note.topic}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {note.lastModified}
                </td>

                <td className="px-6 py-4 text-right">
                  <MoreHorizontal
                    size={18}
                    className="text-slate-300 group-hover:text-primary transition-colors"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
