/**
 * ArcGIS REST API client for Montgomery, AL Open Data Portal.
 * Attempts to fetch from real endpoints; gracefully falls back to empty arrays.
 *
 * NOTE: Montgomery's ArcGIS organization ID and exact endpoint URLs may change.
 * The portal (opendata.montgomeryal.gov) federates global ArcGIS Hub data.
 * We attempt known endpoint patterns and fail fast if unreachable.
 */

export interface FacilityRecord {
  name: string;
  type: "park" | "recreation" | "fire_station" | "community_center" | "other";
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CodeViolationRecord {
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  date: string;
}

/**
 * Attempt to fetch from an ArcGIS FeatureServer endpoint with a fast timeout.
 * Returns null on any failure (timeout, bad URL, no data).
 */
async function fetchArcGIS(
  baseUrl: string,
  params: Record<string, string> = {},
): Promise<{
  features: Array<{
    attributes: Record<string, unknown>;
    geometry?: { x: number; y: number };
  }>;
} | null> {
  const defaults: Record<string, string> = {
    where: "1=1",
    outFields: "*",
    returnGeometry: "true",
    f: "json",
    resultRecordCount: "200",
  };
  const merged = { ...defaults, ...params };
  const searchParams = new URLSearchParams(merged);
  const url = `${baseUrl}/query?${searchParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error || !data.features) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Known and attempted Montgomery ArcGIS endpoints.
 * These may return 400/404 if the org has changed their service names.
 */
const ENDPOINT_CANDIDATES = {
  recreation: [
    "https://services8.arcgis.com/lDchLOqyFQHnIw15/arcgis/rest/services/City_Recreation/FeatureServer/0",
    "https://services2.arcgis.com/1Wc1wBApGNGLPbIM/arcgis/rest/services/City_Recreation/FeatureServer/0",
  ],
  violations: [
    "https://services8.arcgis.com/lDchLOqyFQHnIw15/arcgis/rest/services/Code_Violation_New/FeatureServer/0",
    "https://services2.arcgis.com/1Wc1wBApGNGLPbIM/arcgis/rest/services/Code_Violation_New/FeatureServer/0",
  ],
  crime: [
    "https://services8.arcgis.com/lDchLOqyFQHnIw15/arcgis/rest/services/Crime_Statistics/FeatureServer/0",
    "https://services8.arcgis.com/lDchLOqyFQHnIw15/arcgis/rest/services/Crime_Statistics_2/FeatureServer/0",
  ],
} as const;

/**
 * Try multiple endpoint candidates, return first successful result.
 */
async function tryEndpoints(
  candidates: readonly string[],
  params?: Record<string, string>,
): ReturnType<typeof fetchArcGIS> {
  for (const url of candidates) {
    const result = await fetchArcGIS(url, params);
    if (result && result.features.length > 0) {
      console.log(
        `ArcGIS: Found data at ${url} (${result.features.length} records)`,
      );
      return result;
    }
  }
  return null;
}

/**
 * Fetch parks and recreation facilities from Montgomery Open Data.
 */
export async function fetchParksAndRecreation(): Promise<FacilityRecord[]> {
  const data = await tryEndpoints(ENDPOINT_CANDIDATES.recreation);
  if (!data) return [];

  return data.features
    .filter((f) => f.geometry?.x != null && f.geometry?.y != null)
    .map((feature) => ({
      name: String(
        feature.attributes.NAME ||
          feature.attributes.FACILITY_NAME ||
          feature.attributes.PARK_NAME ||
          "Unknown Facility",
      ),
      type: classifyFacility(
        String(
          feature.attributes.TYPE || feature.attributes.FACILITY_TYPE || "",
        ),
      ),
      latitude: feature.geometry!.y,
      longitude: feature.geometry!.x,
      address: feature.attributes.ADDRESS
        ? String(feature.attributes.ADDRESS)
        : undefined,
    }));
}

/**
 * Fetch code violations from Montgomery Open Data.
 */
export async function fetchCodeViolations(): Promise<CodeViolationRecord[]> {
  const data = await tryEndpoints(ENDPOINT_CANDIDATES.violations);
  if (!data) return [];

  return data.features
    .filter((f) => f.geometry?.x != null && f.geometry?.y != null)
    .map((feature) => ({
      type: String(
        feature.attributes.VIOLATION_TYPE ||
          feature.attributes.TYPE ||
          "General",
      ),
      status: String(feature.attributes.STATUS || "Unknown"),
      latitude: feature.geometry!.y,
      longitude: feature.geometry!.x,
      date: feature.attributes.DATE_ENTERED
        ? new Date(feature.attributes.DATE_ENTERED as number).toISOString()
        : "",
    }));
}

/**
 * Fetch crime statistics from Montgomery Open Data.
 */
export async function fetchCrimeStatistics(): Promise<
  Array<{
    offense: string;
    latitude: number;
    longitude: number;
    date: string;
    district: string;
  }>
> {
  const data = await tryEndpoints(ENDPOINT_CANDIDATES.crime);
  if (!data) return [];

  return data.features
    .filter((f) => f.geometry?.x != null && f.geometry?.y != null)
    .map((feature) => ({
      offense: String(
        feature.attributes.OFFENSE || feature.attributes.Offense || "Unknown",
      ),
      latitude: feature.geometry!.y,
      longitude: feature.geometry!.x,
      date: feature.attributes.Date_Reported
        ? new Date(feature.attributes.Date_Reported as number).toISOString()
        : "",
      district: String(
        feature.attributes.DISTRICT || feature.attributes.District || "",
      ),
    }));
}

/**
 * Classify a facility type string into standard categories.
 */
function classifyFacility(type: string): FacilityRecord["type"] {
  const lower = type.toLowerCase();
  if (lower.includes("park")) return "park";
  if (lower.includes("recreation") || lower.includes("rec"))
    return "recreation";
  if (lower.includes("fire")) return "fire_station";
  if (lower.includes("community") || lower.includes("center"))
    return "community_center";
  return "other";
}
