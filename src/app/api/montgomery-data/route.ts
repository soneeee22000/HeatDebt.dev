/**
 * Server-side proxy for Montgomery ArcGIS Open Data.
 * Aggregates parks, code violations, and crime data.
 * Uses allSettled so one failing/slow endpoint doesn't block others.
 */

import { NextResponse } from "next/server";
import {
  fetchParksAndRecreation,
  fetchCodeViolations,
  fetchCrimeStatistics,
} from "@/lib/api/arcgis";

export const maxDuration = 15;

export async function GET() {
  const results = await Promise.allSettled([
    fetchParksAndRecreation(),
    fetchCodeViolations(),
    fetchCrimeStatistics(),
  ]);

  const facilities = results[0].status === "fulfilled" ? results[0].value : [];
  const violations = results[1].status === "fulfilled" ? results[1].value : [];
  const crimes = results[2].status === "fulfilled" ? results[2].value : [];

  return NextResponse.json(
    {
      facilities,
      violations,
      crimes,
      meta: {
        facilitiesCount: facilities.length,
        violationsCount: violations.length,
        crimesCount: crimes.length,
        fetchedAt: new Date().toISOString(),
        source: "Montgomery, AL Open Data Portal (opendata.montgomeryal.gov)",
        errors: results
          .map((r, i) =>
            r.status === "rejected"
              ? `${["facilities", "violations", "crimes"][i]}: ${r.reason}`
              : null,
          )
          .filter(Boolean),
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
