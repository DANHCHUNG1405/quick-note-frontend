import { TrendingUp, Repeat, GraduationCap } from "lucide-react";

export default function TopicOverview() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-primary" />
        <h2 className="text-lg font-bold text-slate-900">Topic Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Product Design"
          subtitle="8 notes added this week"
          icon={<TrendingUp />}
        />
        <OverviewCard
          title="Weekly Meetings"
          subtitle="Last updated 4 hours ago"
          icon={<Repeat />}
        />
        <OverviewCard
          title="Learning React"
          subtitle="31 notes • 4 tags"
          icon={<GraduationCap />}
        />
      </div>
    </section>
  );
}

function OverviewCard({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}
