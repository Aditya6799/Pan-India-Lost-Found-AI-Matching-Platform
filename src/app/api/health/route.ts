import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const region = process.env.VERCEL_REGION || "local";
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    status: "ok",
    timestamp,
    version: "1.0.0",
    platform: "FoundIt India Lost & Found AI Platform",
    region,
    runtime: "edge",
  });
}
