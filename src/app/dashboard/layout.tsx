import { Sidebar } from "@/components/Sidebar";
import { DashboardTopBar } from "@/components/DashboardTopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-bg">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardTopBar />
        <main className="mx-auto max-w-6xl px-4 py-6 pt-20 lg:px-8 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
