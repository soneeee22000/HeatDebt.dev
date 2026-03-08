/**
 * React hook that fetches and merges all data sources into enriched District objects.
 * Combines: static GeoJSON + NWS weather + ArcGIS facilities/violations/crime.
 */

"use client";

import { useState, useEffect } from "react";
import type { WeatherData } from "@/lib/api/weather";
import type { FacilityRecord, CodeViolationRecord } from "@/lib/api/arcgis";
import { montgomeryDistricts } from "@/lib/montgomery-geojson";
import { buildDistricts, type District } from "@/lib/district-data";

interface MontgomeryData {
  facilities: FacilityRecord[];
  violations: CodeViolationRecord[];
  crimes: Array<{ latitude: number; longitude: number }>;
  meta: {
    facilitiesCount: number;
    violationsCount: number;
    crimesCount: number;
    fetchedAt: string;
    source: string;
  };
}

interface UseDistrictDataReturn {
  districts: District[];
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  dataSource: string;
  lastUpdated: string | null;
}

/** Fallback temperature for Montgomery if weather API fails */
const FALLBACK_TEMP = 92;

export function useDistrictData(): UseDistrictDataReturn {
  const [districts, setDistricts] = useState<District[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch weather fast, montgomery data with longer timeout
        const weatherPromise = fetch("/api/weather").catch(() => null);
        const dataPromise = fetch("/api/montgomery-data", {
          signal: AbortSignal.timeout(12000),
        }).catch(() => null);

        const [weatherRes, dataRes] = await Promise.all([
          weatherPromise,
          dataPromise,
        ]);

        if (cancelled) return;

        let weatherData: WeatherData | null = null;
        let montgomeryData: MontgomeryData | null = null;

        if (weatherRes?.ok) {
          weatherData = await weatherRes.json();
        }

        if (dataRes?.ok) {
          montgomeryData = await dataRes.json();
        }

        const cityTemp =
          weatherData?.heatIndex ?? weatherData?.temperature ?? FALLBACK_TEMP;

        const enrichedDistricts = buildDistricts(
          montgomeryDistricts.features,
          cityTemp,
          montgomeryData?.facilities ?? [],
          montgomeryData?.violations ?? [],
          montgomeryData?.crimes ?? [],
        );

        if (cancelled) return;

        setDistricts(enrichedDistricts);
        setWeather(weatherData);
        setDataSource(
          montgomeryData?.meta?.source ?? "Montgomery, AL Open Data Portal",
        );
        setLastUpdated(
          montgomeryData?.meta?.fetchedAt ?? new Date().toISOString(),
        );
      } catch (err) {
        if (cancelled) return;
        console.error("Data loading error:", err);
        setError("Some data sources are unavailable. Showing baseline data.");

        // Build districts with fallback data even on error
        const fallbackDistricts = buildDistricts(
          montgomeryDistricts.features,
          FALLBACK_TEMP,
          [],
          [],
          [],
        );
        setDistricts(fallbackDistricts);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { districts, weather, isLoading, error, dataSource, lastUpdated };
}
