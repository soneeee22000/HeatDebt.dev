/**
 * Heat risk color legend for the map overlay.
 * Shows either the 4-tier HEATDEBT risk classification (default)
 * or a continuous gradient bar for active vulnerability layers.
 */

import type { RiskTier } from "@/lib/constants";
import { RISK_TIER_HEX } from "@/lib/constants";
import type { MapLayer } from "@/lib/map-layers";
import { MAP_LAYER_CONFIG, computeLayerRange } from "@/lib/map-layers";
import type { District } from "@/lib/district-data";

const LEGEND_ITEMS: Array<{ tier: RiskTier; label: string; range: string }> = [
  { tier: "CRITICAL", label: "Critical", range: "75+" },
  { tier: "HIGH", label: "High", range: "50–74" },
  { tier: "MODERATE", label: "Moderate", range: "25–49" },
  { tier: "LOW", label: "Low", range: "0–24" },
];

interface HeatmapLegendProps {
  activeLayer: MapLayer;
  districts: District[];
}

export default function HeatmapLegend({
  activeLayer,
  districts,
}: HeatmapLegendProps) {
  // Default HEATDEBT Score legend
  if (activeLayer === "score") {
    return (
      <div className="rounded-lg border border-border bg-card/90 p-3 shadow-lg backdrop-blur-sm">
        <h3 className="mb-2 text-xs font-semibold text-primary-foreground uppercase tracking-wider">
          HEATDEBT Score
        </h3>
        <div className="flex items-center gap-3">
          {LEGEND_ITEMS.map(({ tier, label, range }) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div className="relative">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: RISK_TIER_HEX[tier] }}
                />
                {(tier === "CRITICAL" || tier === "HIGH") && (
                  <div
                    className="absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: RISK_TIER_HEX[tier] }}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {label}{" "}
                <span className="text-[10px] text-muted-foreground/60">
                  ({range})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Gradient legend for vulnerability layers
  const config = MAP_LAYER_CONFIG[activeLayer];
  const range =
    districts.length > 0 ? computeLayerRange(activeLayer, districts) : null;
  const [c0, c1, c2] = config.colorStops;

  return (
    <div className="rounded-lg border border-border bg-card/90 p-3 shadow-lg backdrop-blur-sm min-w-[220px]">
      <h3 className="mb-2 text-xs font-semibold text-primary-foreground uppercase tracking-wider">
        {config.label}
      </h3>
      <div
        className="h-2.5 rounded-full mb-1.5"
        style={{
          background: `linear-gradient(to right, ${c0}, ${c1}, ${c2})`,
        }}
      />
      <div className="flex justify-between">
        <span className="text-[10px] text-muted-foreground">
          {config.legendLabels.low}
          {range ? ` (${Math.round(range.min)}${config.unit})` : ""}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {config.legendLabels.high}
          {range ? ` (${Math.round(range.max)}${config.unit})` : ""}
        </span>
      </div>
    </div>
  );
}
