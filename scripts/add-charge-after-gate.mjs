import fs from "fs";

const patches = [
  ["src/app/api/analyzer/route.ts", "content_generation"],
  ["src/app/api/keywords/route.ts", "seo_article"],
  ["src/app/api/topics/route.ts", "seo_article"],
  ["src/app/api/repurpose/route.ts", "content_generation"],
  ["src/app/api/carousel/route.ts", "content_generation"],
  ["src/app/api/personal-brand/route.ts", "content_generation"],
  ["src/app/api/video/route.ts", "content_generation"],
  ["src/app/api/landing-pages/route.ts", "content_generation"],
  ["src/app/api/agent/route.ts", "agent_request"],
  ["src/app/api/attribution/route.ts", "content_generation"],
  ["src/app/api/marketing-os/route.ts", "marketing_plan"],
  ["src/app/api/onboarding/route.ts", "marketing_plan"],
  ["src/app/api/workflows/route.ts", "content_generation"],
];

for (const [file, action] of patches) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("chargeAfterGate")) {
    s = s.replace(
      'import { gateCredits } from "@/lib/credit-api";',
      'import { gateCredits, chargeAfterGate } from "@/lib/credit-api";'
    );
    s = s.replace(
      'import { gateAuth, gateCredits } from "@/lib/credit-api";',
      'import { gateAuth, gateCredits, chargeAfterGate } from "@/lib/credit-api";'
    );
  }
  fs.writeFileSync(file, s);
  console.log("import updated:", file);
}
