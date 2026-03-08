/**
 * Heat risk color legend for the map overlay.
 * Shows the 4-tier HEATDEBT risk classification with hex colors matching Leaflet polygons.
 */

import type { RiskTier } from "@/lib/constants";
import { RISK_TIER_HEX } from "@/lib/constants";

const LEGEND_ITEMS: Array<{ tier: RiskTier; label: string; range: string }> = [
  { tier: "CRITICAL", label: "Critical", range: "75+" },
  { tier: "HIGH", label: "High", range: "50–74" },
  { tier: "MODERATE", label: "Moderate", range: "25–49" },
  { tier: "LOW", label: "Low", range: "0–24" },
];

export default function HeatmapLegend() {
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
