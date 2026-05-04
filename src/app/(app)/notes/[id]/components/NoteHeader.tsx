"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { TopicNode } from "@/app/types/topic.types";

type NoteHeaderProps = {
  topicPath: TopicNode[];
  isCreateMode: boolean;
  title: string;
  topicsLoading: boolean;
};

export default function NoteHeader({
  topicPath,
  isCreateMode,
  title,
  topicsLoading,
}: NoteHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200">
      <div className="text-sm text-slate-600 flex items-center flex-wrap gap-1">
        {topicPath.length > 0 ? (
          <>
            {topicPath.map((topic) => (
              <span key={topic.id} className="flex items-center gap-1">
                <Link
                  href={`/topics/${topic.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {topic.name}
                </Link>
                <span className="text-slate-400">/</span>
              </span>
            ))}
          </>
        ) : (
          !isCreateMode && (
            <span className="text-slate-400">
              {topicsLoading ? "Loading..." : "No topic"}
            </span>
          )
        )}
        <span className="text-slate-900 font-semibold">
          {isCreateMode ? "New Note" : title || "Untitled"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search notes..."
            className="pl-10 pr-4 py-1.5 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none w-64"
          />
        </div>
      </div>
    </header>
  );
}
