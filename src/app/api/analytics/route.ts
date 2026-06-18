import { NextResponse } from "next/server";
import {
  ANALYTICS_SUMMARY,
  MONTHLY_TREND,
  CONTENT_DISTRIBUTION,
  WEEKLY_USAGE,
  CONTENT_METRICS,
} from "@/lib/analytics-data";

export async function GET() {
  return NextResponse.json({
    summary: ANALYTICS_SUMMARY,
    monthlyTrend: MONTHLY_TREND,
    contentDistribution: CONTENT_DISTRIBUTION,
    weeklyUsage: WEEKLY_USAGE,
    contentMetrics: CONTENT_METRICS,
  });
}
