/**
 * Server-side proxy for NWS weather API.
 * Avoids CORS issues and enables server-side caching.
 */

import { NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/api/weather";

export async function GET() {
  const weather = await fetchCurrentWeather();
  return NextResponse.json(weather, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}
