/**
 * Interactive Leaflet map displaying Montgomery, AL districts.
 * Each district is a clickable GeoJSON polygon color-coded by heat risk.
 * Uses CartoDB dark tiles to match the app's dark theme.
 */

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { District } from "@/lib/district-data";
import { heatRiskHexColors } from "@/lib/district-data";
import {
  MONTGOMERY_CENTER,
  MAP_ZOOM,
  MAP_TILE_URL,
  MAP_TILE_ATTRIBUTION,
  DISTRICT_POLYGON_STYLE,
  SELECTED_POLYGON_STYLE,
} from "@/lib/constants";

interface DistrictMapProps {
  districts: District[];
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
}

export default function DistrictMap({
  districts,
  selectedDistrict,
  onSelectDistrict,
}: DistrictMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<Map<number, L.GeoJSON>>(new Map());

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MONTGOMERY_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render district polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map || districts.length === 0) return;

    // Clear existing layers
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current.clear();

    districts.forEach((district) => {
      const isSelected = selectedDistrict?.id === district.id;
      const color = heatRiskHexColors[district.heatRisk];

      const layer = L.geoJSON(district.feature, {
        style: {
          ...DISTRICT_POLYGON_STYLE,
          fillColor: color,
          color: isSelected ? SELECTED_POLYGON_STYLE.color : color,
          weight: isSelected
            ? SELECTED_POLYGON_STYLE.weight
            : DISTRICT_POLYGON_STYLE.weight,
          fillOpacity: isSelected
            ? SELECTED_POLYGON_STYLE.fillOpacity
            : DISTRICT_POLYGON_STYLE.fillOpacity,
        },
      });

      // Tooltip with district info
      layer.bindTooltip(
        `<div class="text-sm font-semibold">${district.name}</div>
         <div class="text-xs">Heat Index: ${district.heatIndex}°F</div>
         <div class="text-xs">Risk: ${district.heatRisk}</div>`,
        {
          sticky: true,
          className: "district-tooltip",
        },
      );

      // Click handler
      layer.on("click", () => {
        onSelectDistrict(district);
      });

      // Hover effects
      layer.on("mouseover", (e) => {
        const target = e.target as L.GeoJSON;
        if (selectedDistrict?.id !== district.id) {
          target.setStyle({
            fillOpacity: 0.7,
            weight: 3,
          });
        }
      });

      layer.on("mouseout", (e) => {
        const target = e.target as L.GeoJSON;
        if (selectedDistrict?.id !== district.id) {
          target.setStyle({
            fillOpacity: DISTRICT_POLYGON_STYLE.fillOpacity,
            weight: DISTRICT_POLYGON_STYLE.weight,
          });
        }
      });

      layer.addTo(map);
      layersRef.current.set(district.id, layer);
    });
  }, [districts, selectedDistrict, onSelectDistrict]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-border/20">
      <div ref={containerRef} className="w-full h-full" />
      <style jsx global>{`
        .district-tooltip {
          background: hsl(345 15% 15% / 0.95) !important;
          border: 1px solid hsl(345 10% 30%) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          color: #fff !important;
          font-family: var(--font-inter), sans-serif !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
        }
        .district-tooltip .leaflet-tooltip-tip {
          display: none;
        }
        .leaflet-control-attribution {
          background: hsl(345 15% 12% / 0.8) !important;
          color: hsl(0 0% 60%) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: hsl(347 79% 57%) !important;
        }
        .leaflet-control-zoom a {
          background: hsl(345 15% 15%) !important;
          color: #fff !important;
          border-color: hsl(345 10% 22%) !important;
        }
        .leaflet-control-zoom a:hover {
          background: hsl(345 15% 20%) !important;
        }
      `}</style>
    </div>
  );
}
