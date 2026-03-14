import WelcomeSection from "@/app/components/home/WelcomeSection";
import RecentNotesTable from "@/app/components/home/RecentNotesTable";
import TopicOverview from "@/app/components/home/TopicOverview";
import QuickActions from "@/app/components/home/QuickActions";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <WelcomeSection />
      <RecentNotesTable />
      <TopicOverview />
      <QuickActions />
    </div>
  );
}
