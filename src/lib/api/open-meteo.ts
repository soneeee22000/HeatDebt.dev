/**
 * @fileoverview Open-Meteo API client for per-district weather data.
 *
 * Replaces the single NWS station approach with per-neighborhood
 * temperature data using the free Open-Meteo forecast API.
 *
 * @see https://open-meteo.com/en/docs
 */

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 5000;

/** Raw current weather fields returned by the Open-Meteo API. */
interface OpenMeteoApiResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

/** Processed weather data for a single location (imperial units). */
export interface OpenMeteoData {
  /** Air temperature in Fahrenheit. */
  temperature: number;
  /** Feels-like temperature in Fahrenheit. */
  apparentTemperature: number;
  /** Relative humidity as a percentage (0-100). */
  humidity: number;
  /** Wind speed in miles per hour. */
  windSpeed: number;
  /** WMO weather interpretation code. */
  weatherCode: number;
}

/** Weather data associated with a specific district. */
export interface DistrictWeather {
  /** Numeric district identifier (1-14). */
  districtId: number;
  /** Human-readable district name. */
  districtName: string;
  /** Weather data for the district, or null if the fetch failed. */
  data: OpenMeteoData | null;
}

/** District descriptor used as input to the batch fetch function. */
export interface DistrictDescriptor {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

/** Pre-defined district centers for Montgomery, AL. */
export const DISTRICT_CENTERS: DistrictDescriptor[] = [
  { id: 1, name: "West End / Washington Park", lat: 32.3651, lng: -86.3398 },
  { id: 2, name: "Chisholm", lat: 32.35, lng: -86.33 },
  { id: 3, name: "North Montgomery", lat: 32.4, lng: -86.31 },
  { id: 4, name: "Hayneville Road", lat: 32.345, lng: -86.35 },
  { id: 5, name: "Sheridan Heights", lat: 32.355, lng: -86.32 },
  { id: 6, name: "South Montgomery", lat: 32.335, lng: -86.32 },
  { id: 7, name: "Capitol Heights", lat: 32.376, lng: -86.285 },
  { id: 8, name: "Downtown / Capitol Hill", lat: 32.3792, lng: -86.3077 },
  { id: 9, name: "Airport / Gunter", lat: 32.38, lng: -86.36 },
  { id: 10, name: "Maxwell / Near SW", lat: 32.37, lng: -86.365 },
  { id: 11, name: "Forest Hills", lat: 32.35, lng: -86.26 },
  { id: 12, name: "Old Cloverdale", lat: 32.357, lng: -86.315 },
  { id: 13, name: "Dalraida", lat: 32.405, lng: -86.27 },
  { id: 14, name: "Eastchase", lat: 32.36, lng: -86.23 },
];

/** Mapping of WMO weather codes to human-readable descriptions. */
const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Rain",
  71: "Snow",
  73: "Snow",
  75: "Snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

/**
 * Convert a temperature from Celsius to Fahrenheit.
 *
 * @param celsius - Temperature in degrees Celsius.
 * @returns Temperature in degrees Fahrenheit, rounded to one decimal.
 */
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Convert a speed from km/h to mph.
 *
 * @param kmh - Speed in kilometres per hour.
 * @returns Speed in miles per hour, rounded to one decimal.
 */
function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

/**
 * Map a WMO weather code to a human-readable description.
 *
 * @param code - WMO weather interpretation code.
 * @returns A short description string, or "Unknown" for unrecognised codes.
 */
export function weatherCodeToDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] ?? "Unknown";
}

/**
 * Fetch current weather data for a single geographic coordinate.
 *
 * Calls the Open-Meteo forecast API and converts the response from
 * metric units (Celsius, km/h) to imperial units (Fahrenheit, mph).
 *
 * @param lat - Latitude of the location.
 * @param lng - Longitude of the location.
 * @returns Processed weather data in imperial units.
 * @throws {Error} If the network request fails or times out.
 */
export async function fetchDistrictWeather(
  lat: number,
  lng: number,
): Promise<OpenMeteoData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current:
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature",
    timezone: "America/Chicago",
  });

  try {
    const response = await fetch(
      `${OPEN_METEO_BASE_URL}?${params.toString()}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API returned ${response.status}: ${response.statusText}`,
      );
    }

    const json = (await response.json()) as OpenMeteoApiResponse;
    const { current } = json;

    return {
      temperature: celsiusToFahrenheit(current.temperature_2m),
      apparentTemperature: celsiusToFahrenheit(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: kmhToMph(current.wind_speed_10m),
      weatherCode: current.weather_code,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch current weather for all provided districts concurrently.
 *
 * Uses `Promise.allSettled` so that individual failures do not prevent
 * other districts from returning data. Each district result includes
 * `data: null` when its request failed.
 *
 * @param districts - Array of district descriptors with coordinates.
 * @returns An array of district weather results (one per input district).
 */
export async function fetchAllDistrictWeather(
  districts: DistrictDescriptor[],
): Promise<DistrictWeather[]> {
  const promises = districts.map((district) =>
    fetchDistrictWeather(district.lat, district.lng)
      .then((data) => ({
        districtId: district.id,
        districtName: district.name,
        data,
      }))
      .catch(() => ({
        districtId: district.id,
        districtName: district.name,
        data: null,
      })),
  );

  const results = await Promise.allSettled(promises);

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    // This branch should not be reached since inner promises never reject,
    // but we handle it defensively.
    return { districtId: 0, districtName: "Unknown", data: null };
  });
}
