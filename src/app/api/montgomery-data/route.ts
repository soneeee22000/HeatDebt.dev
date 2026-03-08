/**
 * Server-side proxy for Montgomery open data.
 * Aggregates: ArcGIS (parks, violations, crime), AirNow (air quality), Census ACS.
 * Uses allSettled so one failing/slow endpoint doesn't block others.
 */

import { NextResponse } from "next/server";
import {
  fetchParksAndRecreation,
  fetchCodeViolations,
  fetchCrimeStatistics,
} from "@/lib/api/arcgis";

export const maxDuration = 15;

/** AirNow API key from environment */
const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY ?? "";

/** Fetch air quality from AirNow for Montgomery */
async function fetchAirQuality(): Promise<{
  aqi: number;
  category: string;
  pollutant: string;
} | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://www.airnowapi.org/aq/observation/latLong/current/?latitude=32.3792&longitude=-86.3077&distance=50&API_KEY=${AIRNOW_API_KEY}&format=application/json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    // Return the primary pollutant (highest AQI)
    const primary = data.reduce(
      (max: Record<string, unknown>, d: Record<string, unknown>) =>
        (d.AQI as number) > (max.AQI as number) ? d : max,
      data[0],
    );

    return {
      aqi: primary.AQI as number,
      category: (primary.Category as { Name: string }).Name as string,
      pollutant: primary.ParameterName as string,
    };
  } catch {
    return null;
  }
}

/** Fetch Census ACS poverty + population data for Montgomery County */
async function fetchCensusData(): Promise<
  Array<{
    tract: string;
    population: number;
    povertyCount: number;
    povertyRate: number;
  }>
> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const censusKey = process.env.CENSUS_API_KEY ?? "";
    const url = `https://api.census.gov/data/2022/acs/acs5?get=B17001_002E,B01003_001E&for=tract:*&in=state:01%20county:101&key=${censusKey}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    // First row is headers: ["B17001_002E","B01003_001E","state","county","tract"]
    return data.slice(1).map((row: string[]) => {
      const povertyCount = parseInt(row[0], 10) || 0;
      const population = parseInt(row[1], 10) || 1;
      return {
        tract: row[4],
        population,
        povertyCount,
        povertyRate: Math.round((povertyCount / population) * 1000) / 10,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchParksAndRecreation(),
    fetchCodeViolations(),
    fetchCrimeStatistics(),
    fetchAirQuality(),
    fetchCensusData(),
  ]);

  const facilities = results[0].status === "fulfilled" ? results[0].value : [];
  const violations = results[1].status === "fulfilled" ? results[1].value : [];
  const crimes = results[2].status === "fulfilled" ? results[2].value : [];
  const airQuality =
    results[3].status === "fulfilled" ? results[3].value : null;
  const censusTracts =
    results[4].status === "fulfilled" ? results[4].value : [];

  return NextResponse.json(
    {
      facilities,
      violations,
      crimes,
      airQuality,
      censusTracts,
      meta: {
        facilitiesCount: facilities.length,
        violationsCount: violations.length,
        crimesCount: crimes.length,
        hasAirQuality: airQuality !== null,
        censusTractCount: censusTracts.length,
        fetchedAt: new Date().toISOString(),
        source: "Montgomery Open Data · EPA AirNow · US Census ACS",
        errors: results
          .map((r, i) =>
            r.status === "rejected"
              ? `${
                  [
                    "facilities",
                    "violations",
                    "crimes",
                    "airQuality",
                    "census",
                  ][i]
                }: ${r.reason}`
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
