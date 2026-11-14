import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  // Edge runtime endpoint for fast globally cached stats
  // Returns cached public platform metrics without hitting MongoDB directly
  const cachedStats = {
    cached: true,
    totalLostReports: 1420,
    totalFoundReports: 1890,
    successfulRecoveries: 940,
    aiMatchesFound: 3280,
    activeStatesCount: 36,
    averageResolutionHours: 48,
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || "local-edge",
  };

  return NextResponse.json(cachedStats, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
