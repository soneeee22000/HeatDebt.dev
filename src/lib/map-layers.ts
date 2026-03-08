/**
 * Map layer configuration for interactive choropleth switching.
 * Defines color scales, metric extractors, and interpolation logic
 * for each vulnerability "lens" the user can toggle on the map.
 */

import type { District } from "@/lib/district-data";

/** Available map visualization layers */
export type MapLayer =
  | "score"
  | "heatExposure"
  | "treeCanopy"
  | "acAccess"
  | "povertyRate"
  | "vacancyRate";

interface LayerConfig {
  /** Display label */
  label: string;
  /** Short label for pills */
  shortLabel: string;
  /** Unit suffix */
  unit: string;
  /** Color stops from low to high value (3 hex colors) */
  colorStops: [string, string, string];
  /** Extract the raw metric value from a district */
  extractValue: (d: District) => number;
  /** Whether higher values are "better" (inverted color mapping) */
  inverted: boolean;
  /** Legend end labels */
  legendLabels: { low: string; high: string };
}

/** Layer configuration for each visualization mode */
export const MAP_LAYER_CONFIG: Record<
  Exclude<MapLayer, "score">,
  LayerConfig
> = {
  heatExposure: {
    label: "Heat Exposure",
    shortLabel: "Heat",
    unit: "%",
    colorStops: ["#fef08a", "#f97316", "#dc2626"],
    extractValue: (d) => Math.min(100, Math.max(0, (d.heatIndex - 85) * 5)),
    inverted: false,
    legendLabels: { low: "Low exposure", high: "Severe exposure" },
  },
  treeCanopy: {
    label: "Tree Canopy",
    shortLabel: "Trees",
    unit: "%",
    colorStops: ["#dc2626", "#84cc16", "#16a34a"],
    extractValue: (d) => d.treeCanopyPct,
    inverted: true,
    legendLabels: { low: "No canopy", high: "Dense canopy" },
  },
  acAccess: {
    label: "A/C Access Gap",
    shortLabel: "A/C",
    unit: "%",
    colorStops: ["#22c55e", "#f59e0b", "#dc2626"],
    extractValue: (d) => 100 - d.acAccessPercentage,
    inverted: false,
    legendLabels: { low: "Good access", high: "No access" },
  },
  povertyRate: {
    label: "Poverty Rate",
    shortLabel: "Poverty",
    unit: "%",
    colorStops: ["#22c55e", "#f59e0b", "#d97706"],
    extractValue: (d) => d.povertyRate,
    inverted: false,
    legendLabels: { low: "Low poverty", high: "High poverty" },
  },
  vacancyRate: {
    label: "Vacancy Rate",
    shortLabel: "Vacancy",
    unit: "%",
    colorStops: ["#22c55e", "#a855f7", "#9333ea"],
    extractValue: (d) => d.vacancyRate,
    inverted: false,
    legendLabels: { low: "Low vacancy", high: "High vacancy" },
  },
};

/**
 * Linearly interpolate between two hex colors.
 */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const ca = parse(a);
  const cb = parse(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

/**
 * Get interpolated color for a value within a 3-stop color scale.
 */
export function getLayerColor(
  layer: Exclude<MapLayer, "score">,
  value: number,
  min: number,
  max: number,
): string {
  const config = MAP_LAYER_CONFIG[layer];
  const range = max - min;
  const t = range === 0 ? 0.5 : Math.max(0, Math.min(1, (value - min) / range));

  const [c0, c1, c2] = config.colorStops;
  if (t <= 0.5) {
    return lerpColor(c0, c1, t * 2);
  }
  return lerpColor(c1, c2, (t - 0.5) * 2);
}

/**
 * Compute the min/max range for a layer across all districts.
 */
export function computeLayerRange(
  layer: Exclude<MapLayer, "score">,
  districts: District[],
): { min: number; max: number } {
  const config = MAP_LAYER_CONFIG[layer];
  const values = districts.map(config.extractValue);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
