/**
 * NWS (National Weather Service) API client for Montgomery, AL weather data.
 * Free, no API key required — just needs a User-Agent header.
 */

import { NWS_API_BASE, NWS_STATION_ID } from "@/lib/constants";

export interface WeatherData {
  temperature: number; // Fahrenheit
  heatIndex: number | null; // Fahrenheit (null when not applicable)
  relativeHumidity: number; // Percentage
  windSpeed: number; // mph
  windDirection: string;
  textDescription: string;
  timestamp: string; // ISO 8601
  icon: string; // NWS icon URL
  precipitation: number; // mm
  uvIndex: number; // 0-11+ scale
}

/** Fallback weather data for Montgomery, AL if NWS API is down */
const FALLBACK_WEATHER: WeatherData = {
  temperature: 92,
  heatIndex: 98,
  relativeHumidity: 65,
  windSpeed: 5,
  windDirection: "SW",
  textDescription: "Partly Cloudy",
  timestamp: new Date().toISOString(),
  icon: "",
  precipitation: 0,
  uvIndex: 6,
};

/**
 * Convert Celsius to Fahrenheit.
 */
function celsiusToFahrenheit(celsius: number): number {
  return Math.round(celsius * 1.8 + 32);
}

/**
 * Convert km/h to mph.
 */
function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

/**
 * Fetch current weather observations from NWS for Montgomery.
 * Falls back to static data if the API is unavailable.
 */
export async function fetchCurrentWeather(): Promise<WeatherData> {
  try {
    const url = `${NWS_API_BASE}/stations/${NWS_STATION_ID}/observations/latest`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HeatAlert-Dashboard (heatalert@example.com)",
        Accept: "application/geo+json",
      },
      next: { revalidate: 600 }, // Cache for 10 minutes in Next.js
    });

    if (!response.ok) {
      console.error(`NWS API returned ${response.status}`);
      return FALLBACK_WEATHER;
    }

    const data = await response.json();
    const props = data.properties;

    const tempC = props.temperature?.value;
    const heatIndexC = props.heatIndex?.value;
    const humidity = props.relativeHumidity?.value;
    const windKmh = props.windSpeed?.value;

    return {
      temperature:
        tempC != null
          ? celsiusToFahrenheit(tempC)
          : FALLBACK_WEATHER.temperature,
      heatIndex: heatIndexC != null ? celsiusToFahrenheit(heatIndexC) : null,
      relativeHumidity:
        humidity != null
          ? Math.round(humidity)
          : FALLBACK_WEATHER.relativeHumidity,
      windSpeed:
        windKmh != null ? kmhToMph(windKmh) : FALLBACK_WEATHER.windSpeed,
      windDirection:
        props.windDirection?.value != null
          ? degreesToCardinal(props.windDirection.value)
          : FALLBACK_WEATHER.windDirection,
      textDescription:
        props.textDescription || FALLBACK_WEATHER.textDescription,
      timestamp: props.timestamp || new Date().toISOString(),
      icon: props.icon || "",
    };
  } catch (error) {
    console.error("Failed to fetch NWS weather data:", error);
    return FALLBACK_WEATHER;
  }
}

/**
 * Convert wind direction in degrees to cardinal direction.
 */
function degreesToCardinal(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
