import { Sidebar } from "@/components/Sidebar";
import { DashboardTopBar } from "@/components/DashboardTopBar";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { DashboardCreditsBanner } from "@/components/credits/DashboardCreditsBanner";
import { UpgradeBanner } from "@/components/billing/UpgradePrompt";
import { DemoModeBanner } from "@/components/system/DemoModeBanner";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <OnboardingGate>
        <div className="min-h-screen bg-ink-bg">
          <Sidebar />
          <div className="lg:pl-72">
            <DashboardTopBar />
            <main className="mx-auto max-w-6xl px-4 py-6 pt-20 lg:px-8 lg:pt-6">
              <div className="mb-6 space-y-3">
                <DemoModeBanner />
                <UpgradeBanner />
                <DashboardCreditsBanner />
              </div>
              {children}
            </main>
          </div>
        </div>
      </OnboardingGate>
    </QueryProvider>
  );
}
