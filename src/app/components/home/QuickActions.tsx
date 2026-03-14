import { PlusCircle, Upload, Bookmark, LayoutGrid } from "lucide-react";

export default function QuickActions() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Action icon={<PlusCircle />} title="Quick Note" sub="Ctrl + N" />
      <Action icon={<Upload />} title="Import File" sub="PDF, Markdown" />
      <Action icon={<Bookmark />} title="Saved Links" sub="Recent bookmarks" />
      <Action icon={<LayoutGrid />} title="Board View" sub="Visualize work" />
    </section>
  );
}

function Action({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all text-left">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500">{sub}</p>
      </div>
    </button>
  );
}
