"use client";

import {
  LayoutDashboard,
  Star,
  Settings,
  Plus,
  FileText,
  ChevronRight,
  ChevronDown,
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
  const pathname = usePathname();
  // Load topics lần đầu
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const tree = await topicsService.getTree();
    setTopics(tree);
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
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active
        />
        <SidebarItem icon={<Star size={18} />} label="Favorites" />
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
    </aside>
  );
}
function TopicItem({
  topic,
  depth,
  expanded,
  toggleExpand,
  pathname,
}: {
  topic: TopicNode;
  depth: number;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  pathname: string;
}) {
  const hasChildren = topic.children?.length > 0;
  const isOpen = expanded.has(topic.id);
  const isActive = pathname === `/topics/${topic.id}`;

  return (
    <>
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
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
