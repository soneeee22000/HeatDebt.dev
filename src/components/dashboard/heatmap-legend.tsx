/**
 * Heat risk color legend for the map overlay.
 * Shows the 4-tier risk classification with hex colors matching Leaflet polygons.
 */

import type { HeatRisk } from "@/lib/constants";
import { HEAT_RISK_HEX } from "@/lib/constants";

const LEGEND_ITEMS: Array<{ level: HeatRisk; label: string }> = [
  { level: "Low", label: "Low Risk" },
  { level: "Medium", label: "Medium" },
  { level: "High", label: "High" },
  { level: "Very High", label: "Very High" },
];

export default function HeatmapLegend() {
  return (
    <div className="rounded-lg border border-border bg-card/90 p-3 shadow-lg backdrop-blur-sm">
      <h3 className="mb-2 text-xs font-semibold text-primary-foreground uppercase tracking-wider">
        Heat Risk
      </h3>
      <div className="flex items-center gap-3">
        {LEGEND_ITEMS.map(({ level, label }) => (
          <div key={level} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: HEAT_RISK_HEX[level] }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
