/**
 * Application-wide constants for HeatAlert Dashboard.
 * Single source of truth for coordinates, API URLs, thresholds, and color scales.
 */

/** Montgomery, AL center coordinates [lat, lng] */
export const MONTGOMERY_CENTER: [number, number] = [32.3668, -86.3];

/** Default map zoom level */
export const MAP_ZOOM = 12;

/** NWS weather station for Montgomery Regional Airport */
export const NWS_STATION_ID = "KMGM";

/** NWS API base URL */
export const NWS_API_BASE = "https://api.weather.gov";

/** Montgomery ArcGIS Open Data Portal base URL */
export const ARCGIS_PORTAL_BASE = "https://opendata.montgomeryal.gov";

/** ArcGIS Feature Server base (common org ID for Montgomery) */
export const ARCGIS_FEATURE_BASE =
  "https://services2.arcgis.com/1Wc1wBApGNGLPbIM/arcgis/rest/services";

/** Cache TTL values in milliseconds */
export const CACHE_TTL = {
  WEATHER: 10 * 60 * 1000, // 10 minutes
  ARCGIS: 30 * 60 * 1000, // 30 minutes
} as const;

/** Heat risk thresholds based on NWS Heat Index categories */
export const HEAT_RISK_THRESHOLDS = {
  LOW_MAX: 90,
  MEDIUM_MAX: 95,
  HIGH_MAX: 103,
  // Above 103 = Very High
} as const;

/** Heat risk levels */
export type HeatRisk = "Low" | "Medium" | "High" | "Very High";

/** Hex colors for heat risk levels (used by Leaflet — cannot use Tailwind classes) */
export const HEAT_RISK_HEX: Record<HeatRisk, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  "Very High": "#ef4444",
} as const;

/** Tailwind fill classes for heat risk levels (used by non-map UI) */
export const HEAT_RISK_FILL: Record<HeatRisk, string> = {
  Low: "bg-green-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  "Very High": "bg-red-500",
} as const;

/** CartoDB dark basemap tile URL (free, no API key) */
export const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

/** Map tile attribution */
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

/** Leaflet map style for district polygons */
export const DISTRICT_POLYGON_STYLE = {
  weight: 2,
  opacity: 0.8,
  fillOpacity: 0.5,
} as const;

/** Leaflet map style for selected district */
export const SELECTED_POLYGON_STYLE = {
  weight: 3,
  opacity: 1,
  fillOpacity: 0.7,
  color: "#ffffff",
} as const;

/**
 * Compute heat risk level from a heat index value (Fahrenheit).
 */
export function computeHeatRisk(heatIndex: number): HeatRisk {
  if (heatIndex <= HEAT_RISK_THRESHOLDS.LOW_MAX) return "Low";
  if (heatIndex <= HEAT_RISK_THRESHOLDS.MEDIUM_MAX) return "Medium";
  if (heatIndex <= HEAT_RISK_THRESHOLDS.HIGH_MAX) return "High";
  return "Very High";
}
