import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AttributionDashboardView } from "@/components/attribution/AttributionDashboardView";

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <AttributionDashboardView />
    </Suspense>
  );
}
