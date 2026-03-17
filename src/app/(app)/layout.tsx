import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/layout/Header";
import AuthGuard from "@/app/components/auth/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
