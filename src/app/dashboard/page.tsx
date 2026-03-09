/**
 * Dashboard page for HEATDEBT.
 * Two-panel layout: interactive Leaflet map (left) + district detail panel (right).
 * Fetches real data from Open-Meteo, Census ACS, AirNow, and Montgomery ArcGIS.
 */

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { District } from "@/lib/district-data";
import type { MapLayer } from "@/lib/map-layers";
import { RISK_TIER_HEX } from "@/lib/constants";
import { useDistrictData } from "@/hooks/use-district-data";
import DistrictDetailPanel from "@/components/dashboard/district-detail-panel";
import HeatmapLegend from "@/components/dashboard/heatmap-legend";
import MapLayerControl from "@/components/dashboard/map-layer-control";
import CityOverviewBar from "@/components/dashboard/city-overview-bar";
import Header from "@/components/layout/header";
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

export default function DashboardPage() {
  const { districts, weather, isLoading, error, dataSource, lastUpdated } =
    useDistrictData();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [activeLayer, setActiveLayer] = useState<MapLayer>("score");
  const [polygonsVisible, setPolygonsVisible] = useState(true);

  // Auto-select first district once data loads
  useEffect(() => {
    if (districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0]);
    }
  }, [districts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header />

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

      <main className="flex h-[calc(100vh-3.5rem-3.5rem)] flex-col lg:flex-row">
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
              activeLayer={activeLayer}
              polygonsVisible={polygonsVisible}
            />
          )}

          {/* Layer control overlay */}
          <div className="absolute bottom-24 left-6 z-[1000]">
            <MapLayerControl
              activeLayer={activeLayer}
              onLayerChange={setActiveLayer}
              polygonsVisible={polygonsVisible}
              onTogglePolygons={() => setPolygonsVisible((v) => !v)}
            />
          </div>

          {/* Map legend overlay */}
          <div className="absolute bottom-6 left-6 z-[1000]">
            <HeatmapLegend activeLayer={activeLayer} districts={districts} />
          </div>
        </div>

        {/* Mobile district selector */}
        <div className="lg:hidden px-4 pt-3 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Select Neighborhood
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {districts.map((district) => {
              const isActive = selectedDistrict?.id === district.id;
              const tierColor = RISK_TIER_HEX[district.riskTier];
              return (
                <button
                  key={district.id}
                  onClick={() => setSelectedDistrict(district)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    isActive
                      ? "text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${tierColor}30`,
                          borderColor: tierColor,
                          color: tierColor,
                        }
                      : undefined
                  }
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: tierColor }}
                  />
                  {district.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-[420px] lg:max-w-md xl:w-[480px] xl:max-w-xl bg-card/50 lg:border-l lg:border-border overflow-y-auto">
          {selectedDistrict ? (
            <DistrictDetailPanel
              district={selectedDistrict}
              allDistricts={districts}
              activeLayer={activeLayer}
              onLayerChange={setActiveLayer}
              weather={weather}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">
                  Select a Neighborhood
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Click on the map to view detailed heat and community data for
                  any of Montgomery&apos;s 14 neighborhoods.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
