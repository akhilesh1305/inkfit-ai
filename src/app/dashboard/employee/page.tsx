import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MarketingEmployeeView } from "@/components/employee/MarketingEmployeeView";

export default function EmployeePage() {
  return (
    <div className="-mx-2 lg:-mx-4">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        }
      >
        <MarketingEmployeeView />
      </Suspense>
    </div>
  );
}
