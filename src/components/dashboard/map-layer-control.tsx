/**
 * Floating map layer toggle control.
 * Renders pill buttons for switching between vulnerability choropleth layers.
 */

"use client";

import type { MapLayer } from "@/lib/map-layers";
import { MAP_LAYER_CONFIG } from "@/lib/map-layers";
import {
  Flame,
  TreePine,
  AirVent,
  TrendingDown,
  Home,
  BarChart3,
  Users,
  Wind,
  Building,
  Eye,
  EyeOff,
} from "lucide-react";

const LAYER_ICONS: Record<MapLayer, React.ElementType> = {
  score: BarChart3,
  heatExposure: Flame,
  treeCanopy: TreePine,
  acAccess: AirVent,
  povertyRate: TrendingDown,
  vacancyRate: Home,
  population: Users,
  airQuality: Wind,
  coolingCenters: Building,
};

const LAYERS: MapLayer[] = [
  "score",
  "heatExposure",
  "treeCanopy",
  "acAccess",
  "povertyRate",
  "vacancyRate",
  "population",
  "airQuality",
  "coolingCenters",
];

interface MapLayerControlProps {
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
  polygonsVisible: boolean;
  onTogglePolygons: () => void;
}

export default function MapLayerControl({
  activeLayer,
  onLayerChange,
  polygonsVisible,
  onTogglePolygons,
}: MapLayerControlProps) {
  return (
    <div className="rounded-lg border border-border bg-card/90 p-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Map Layer
        </p>
        <button
          type="button"
          onClick={onTogglePolygons}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
            polygonsVisible
              ? "text-accent hover:text-accent/80"
              : "text-muted-foreground hover:text-primary-foreground"
          }`}
          title={
            polygonsVisible
              ? "Hide district polygons"
              : "Show district polygons"
          }
        >
          {polygonsVisible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
          {polygonsVisible ? "On" : "Off"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {LAYERS.map((layer) => {
          const isActive = activeLayer === layer;
          const Icon = LAYER_ICONS[layer];
          const label =
            layer === "score" ? "Score" : MAP_LAYER_CONFIG[layer].shortLabel;
          const activeColor =
            layer === "score"
              ? "#ef4444"
              : MAP_LAYER_CONFIG[layer].colorStops[2];

          return (
            <button
              key={layer}
              onClick={() =>
                onLayerChange(isActive && layer !== "score" ? "score" : layer)
              }
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-primary-foreground hover:bg-muted/50"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${activeColor}25`,
                      color: activeColor,
                      boxShadow: `inset 0 0 0 1px ${activeColor}50`,
                    }
                  : undefined
              }
            >
              <Icon className="h-3 w-3 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
