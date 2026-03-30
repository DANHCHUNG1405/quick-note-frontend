"use client";

import { Search, Bell } from "lucide-react";

export default function NoteHeader() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200">
      <div className="text-sm text-slate-600">
        Work / Projects /{" "}
        <span className="text-slate-900 font-semibold">New Note</span>
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

        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
