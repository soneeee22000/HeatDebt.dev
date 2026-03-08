/**
 * Interactive Leaflet map displaying Montgomery, AL districts.
 * Each district is a clickable GeoJSON polygon color-coded by the active layer.
 * Supports dynamic recoloring when the user switches vulnerability layers.
 * Uses CartoDB dark tiles to match the app's dark theme.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { District } from "@/lib/district-data";
import { heatRiskHexColors, riskTierHexColors } from "@/lib/district-data";
import type { MapLayer } from "@/lib/map-layers";
import {
  getLayerColor,
  computeLayerRange,
  MAP_LAYER_CONFIG,
} from "@/lib/map-layers";
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
  activeLayer: MapLayer;
}

/**
 * Get the fill color for a district based on the active layer.
 */
function getDistrictColor(
  district: District,
  layer: MapLayer,
  layerRange: { min: number; max: number } | null,
): string {
  if (layer === "score") {
    return heatRiskHexColors[district.heatRisk];
  }
  if (!layerRange) return heatRiskHexColors[district.heatRisk];
  const value = MAP_LAYER_CONFIG[layer].extractValue(district);
  return getLayerColor(layer, value, layerRange.min, layerRange.max);
}

export default function DistrictMap({
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeLayer,
}: DistrictMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<Map<number, L.GeoJSON>>(new Map());
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const districtsRef = useRef<Map<number, District>>(new Map());

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

  // Stable callback ref for district selection
  const onSelectRef = useRef(onSelectDistrict);
  onSelectRef.current = onSelectDistrict;

  // Build district polygon layers (only when districts change)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || districts.length === 0) return;

    // Clear existing layers
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current.clear();
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    districtsRef.current.clear();

    districts.forEach((district) => {
      districtsRef.current.set(district.id, district);

      const layer = L.geoJSON(district.feature, {
        style: {
          ...DISTRICT_POLYGON_STYLE,
          fillColor: "#666",
          color: "#666",
        },
      });

      layer.on("click", () => {
        onSelectRef.current(district);
      });

      layer.on("mouseover", (e) => {
        const target = e.target as L.GeoJSON;
        target.setStyle({ fillOpacity: 0.7, weight: 3 });
      });

      layer.on("mouseout", (e) => {
        const target = e.target as L.GeoJSON;
        target.setStyle({
          fillOpacity: DISTRICT_POLYGON_STYLE.fillOpacity,
          weight: DISTRICT_POLYGON_STYLE.weight,
        });
      });

      layer.addTo(map);
      layersRef.current.set(district.id, layer);

      // Pulsing dot marker at centroid
      const pulseClass =
        district.riskTier === "CRITICAL"
          ? "pulse-critical"
          : district.riskTier === "HIGH"
            ? "pulse-high"
            : district.riskTier === "MODERATE"
              ? "pulse-moderate"
              : "pulse-low";

      const dotIcon = L.divIcon({
        className: `district-pulse-dot ${pulseClass}`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        html: `<div class="pulse-ring"></div><div class="pulse-core"></div>`,
      });

      const marker = L.marker([district.centroid[0], district.centroid[1]], {
        icon: dotIcon,
        interactive: true,
      });

      marker.on("click", () => {
        onSelectRef.current(district);
      });

      marker.addTo(map);
      markersRef.current.set(district.id, marker);
    });
  }, [districts]);

  // Update polygon styles when activeLayer or selectedDistrict changes
  useEffect(() => {
    if (districts.length === 0) return;

    const layerRange =
      activeLayer !== "score"
        ? computeLayerRange(activeLayer, districts)
        : null;

    layersRef.current.forEach((geoLayer, districtId) => {
      const district = districtsRef.current.get(districtId);
      if (!district) return;

      const isSelected = selectedDistrict?.id === districtId;
      const fillColor = getDistrictColor(district, activeLayer, layerRange);
      const tierColor = riskTierHexColors[district.riskTier];

      // Build tooltip based on active layer
      let tooltipMetric = `<div class="text-xs" style="color:${tierColor}">${district.riskTier} · Score ${district.heatScore}/100</div>`;
      if (activeLayer !== "score") {
        const config = MAP_LAYER_CONFIG[activeLayer];
        const value = Math.round(config.extractValue(district));
        tooltipMetric = `<div class="text-xs" style="color:${fillColor}">${config.label}: ${value}${config.unit}</div>
         <div class="text-xs" style="color:${tierColor}">${district.riskTier} · Score ${district.heatScore}/100</div>`;
      }

      geoLayer.unbindTooltip();
      geoLayer.bindTooltip(
        `<div class="text-sm font-semibold">${district.name}</div>
         ${tooltipMetric}
         <div class="text-xs">Heat Index: ${district.heatIndex}°F</div>
         <div class="text-xs">Tract ${district.censusTract}</div>`,
        { sticky: true, className: "district-tooltip" },
      );

      geoLayer.setStyle({
        fillColor,
        color: isSelected ? SELECTED_POLYGON_STYLE.color : fillColor,
        weight: isSelected
          ? SELECTED_POLYGON_STYLE.weight
          : DISTRICT_POLYGON_STYLE.weight,
        fillOpacity: isSelected
          ? SELECTED_POLYGON_STYLE.fillOpacity
          : DISTRICT_POLYGON_STYLE.fillOpacity,
      });
    });
  }, [activeLayer, selectedDistrict, districts]);

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

        /* Pulsing dot markers */
        .district-pulse-dot {
          background: transparent !important;
          border: none !important;
        }
        .district-pulse-dot .pulse-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          z-index: 2;
        }
        .district-pulse-dot .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          opacity: 0;
          z-index: 1;
          animation: pulse-ring 2s ease-out infinite;
        }

        /* CRITICAL — red */
        .pulse-critical .pulse-core {
          background: #ef4444;
          box-shadow: 0 0 6px 2px rgba(239, 68, 68, 0.6);
        }
        .pulse-critical .pulse-ring {
          border: 2px solid #ef4444;
        }

        /* HIGH — orange */
        .pulse-high .pulse-core {
          background: #f97316;
          box-shadow: 0 0 6px 2px rgba(249, 115, 22, 0.5);
        }
        .pulse-high .pulse-ring {
          border: 2px solid #f97316;
        }

        /* MODERATE — amber */
        .pulse-moderate .pulse-core {
          background: #f59e0b;
          box-shadow: 0 0 4px 1px rgba(245, 158, 11, 0.4);
        }
        .pulse-moderate .pulse-ring {
          border: 2px solid #f59e0b;
        }

        /* LOW — green, no pulse animation */
        .pulse-low .pulse-core {
          background: #22c55e;
          box-shadow: 0 0 3px 1px rgba(34, 197, 94, 0.3);
        }
        .pulse-low .pulse-ring {
          display: none;
        }

        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
