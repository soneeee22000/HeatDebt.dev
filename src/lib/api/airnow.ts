/**
 * @fileoverview EPA AirNow API client for Montgomery, AL air quality data.
 *
 * Fetches the current Air Quality Index (AQI) observation for the
 * Montgomery area using the AirNow observation-by-lat-long endpoint.
 *
 * @see https://docs.airnowapi.org/CurrentObservationsByLatLon/docs
 */

const AIRNOW_API_BASE_URL =
  "https://www.airnowapi.org/aq/observation/latLong/current/";
const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY ?? "";
const MONTGOMERY_LAT = 32.3792;
const MONTGOMERY_LNG = -86.3077;
const SEARCH_DISTANCE_MILES = 50;
const REQUEST_TIMEOUT_MS = 5000;

/** Processed air quality observation data. */
export interface AirQualityData {
  /** Air Quality Index value (0-500). */
  aqi: number;
  /** AQI category name (e.g., "Good", "Moderate"). */
  category: string;
  /** Primary pollutant name (e.g., "O3", "PM2.5"). */
  pollutant: string;
  /** Category colour as a hex string (e.g., "#00E400"). */
  color: string;
}

/** Shape of a single observation object from the AirNow API. */
interface AirNowApiObservation {
  AQI: number;
  Category: {
    Name: string;
    Number: number;
  };
  ParameterName: string;
  /** Hex colour string including the "#" prefix. */
  HtmlColor?: string;
}

/** AQI category number to hex colour fallback map. */
const CATEGORY_COLORS: Record<number, string> = {
  1: "#00E400", // Good
  2: "#FFFF00", // Moderate
  3: "#FF7E00", // Unhealthy for Sensitive Groups
  4: "#FF0000", // Unhealthy
  5: "#8F3F97", // Very Unhealthy
  6: "#7E0023", // Hazardous
};

/**
 * Fetch the current air quality observation for Montgomery, AL.
 *
 * Queries the AirNow API for the observation closest to the city center
 * within a 50-mile radius. When multiple pollutants are reported, the
 * observation with the highest AQI is returned.
 *
 * @returns The air quality data, or null if the request fails.
 */
export async function fetchAirQuality(): Promise<AirQualityData | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const params = new URLSearchParams({
    latitude: MONTGOMERY_LAT.toString(),
    longitude: MONTGOMERY_LNG.toString(),
    distance: SEARCH_DISTANCE_MILES.toString(),
    API_KEY: AIRNOW_API_KEY,
    format: "application/json",
  });

  try {
    const response = await fetch(
      `${AIRNOW_API_BASE_URL}?${params.toString()}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      console.error(
        `AirNow API returned ${response.status}: ${response.statusText}`,
      );
      return null;
    }

    const observations = (await response.json()) as AirNowApiObservation[];

    if (!Array.isArray(observations) || observations.length === 0) {
      console.error("AirNow API returned no observations");
      return null;
    }

    // Pick the observation with the highest AQI (worst air quality).
    const worst = observations.reduce((prev, curr) =>
      curr.AQI > prev.AQI ? curr : prev,
    );

    const color =
      worst.HtmlColor ?? CATEGORY_COLORS[worst.Category.Number] ?? "#808080";

    return {
      aqi: worst.AQI,
      category: worst.Category.Name,
      pollutant: worst.ParameterName,
      color,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("AirNow API request timed out");
    } else {
      console.error("Failed to fetch air quality data:", error);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
