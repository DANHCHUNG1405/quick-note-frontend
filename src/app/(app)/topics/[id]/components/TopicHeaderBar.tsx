"use client";

import { Search, Bell, Share2 } from "lucide-react";

export default function TopicHeaderBar() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 ">
      <div className="relative w-full max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          placeholder="Search notes, tags, or topics..."
          className="w-full bg-slate-100  rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <Bell size={18} />
        </button>

        <button className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 ">
          <Share2 size={16} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Share
          </span>
        </button>
      </div>
    </header>
  );
}
