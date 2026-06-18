import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BillingPageContent from "./BillingPageContent";

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}
