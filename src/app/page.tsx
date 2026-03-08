/**
 * Main dashboard page for HeatAlert.
 * Two-panel layout: interactive Leaflet map (left) + district detail panel (right).
 * Fetches real data from NWS weather API and Montgomery ArcGIS Open Data.
 */

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { District } from "@/lib/district-data";
import { useDistrictData } from "@/hooks/use-district-data";
import DistrictDetailPanel from "@/components/dashboard/district-detail-panel";
import HeatmapLegend from "@/components/dashboard/heatmap-legend";
import CityOverviewBar from "@/components/dashboard/city-overview-bar";
import { MapPin, Loader2 } from "lucide-react";

/** Dynamically import Leaflet map (no SSR — Leaflet requires window) */
const DistrictMap = dynamic(
  () => import("@/components/dashboard/district-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-card/20 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
        </div>
      </div>
    ),
  },
);

export default function Home() {
  const { districts, weather, isLoading, error, dataSource, lastUpdated } =
    useDistrictData();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );

  // Auto-select first district once data loads
  if (districts.length > 0 && !selectedDistrict) {
    setSelectedDistrict(districts[0]);
  }

  return (
    <>
      {/* City overview bar with live weather */}
      <CityOverviewBar
        weather={weather}
        districts={districts}
        dataSource={dataSource}
        lastUpdated={lastUpdated}
      />

      {error && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-1.5">
          <p className="text-xs text-orange-400 text-center">{error}</p>
        </div>
      )}

      <main className="flex h-[calc(100vh-3.5rem-2.5rem)] flex-col lg:flex-row">
        {/* Map panel */}
        <div className="flex-1 relative p-2 lg:p-4 hidden lg:block">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full bg-card/20 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Fetching live data from Montgomery...
                </p>
              </div>
            </div>
          ) : (
            <DistrictMap
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
            />
          )}

          {/* Map legend overlay */}
          <div className="absolute bottom-6 left-6 z-[1000]">
            <HeatmapLegend />
          </div>
        </div>

        {/* Mobile district selector */}
        <div className="lg:hidden px-4 pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {districts.map((district) => (
              <button
                key={district.id}
                onClick={() => setSelectedDistrict(district)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedDistrict?.id === district.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {district.name}
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-[420px] lg:max-w-md xl:w-[480px] xl:max-w-xl bg-card/50 lg:border-l lg:border-border overflow-y-auto">
          {selectedDistrict ? (
            <DistrictDetailPanel district={selectedDistrict} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">
                  Select a District
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Click on the map to view detailed heat and community data.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
