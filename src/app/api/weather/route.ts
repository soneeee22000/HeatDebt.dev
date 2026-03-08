/**
 * Server-side proxy for weather data.
 * Uses Open-Meteo for Montgomery center coordinates (free, no auth).
 * Falls back to NWS if Open-Meteo fails.
 */

import { NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/api/weather";

/** Montgomery city center coordinates */
const MONTGOMERY_LAT = 32.3792;
const MONTGOMERY_LNG = -86.3077;

/** Weather code to description mapping */
function weatherCodeToDesc(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] ?? "Unknown";
}

/** Convert Celsius to Fahrenheit */
function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** Convert km/h to mph */
function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

export async function GET() {
  try {
    // Try Open-Meteo first (free, no API key, per-location)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${MONTGOMERY_LAT}&longitude=${MONTGOMERY_LNG}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,wind_direction_10m&timezone=America%2FChicago`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const current = data.current;

      return NextResponse.json(
        {
          temperature: cToF(current.temperature_2m),
          heatIndex: cToF(current.apparent_temperature),
          relativeHumidity: Math.round(current.relative_humidity_2m),
          windSpeed: kmhToMph(current.wind_speed_10m),
          windDirection: degreesToCardinal(current.wind_direction_10m),
          textDescription: weatherCodeToDesc(current.weather_code),
          timestamp: data.current.time,
          source: "Open-Meteo",
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=600, stale-while-revalidate=1200",
          },
        },
      );
    }
  } catch {
    // Fall through to NWS fallback
  }

  // Fallback to NWS
  const weather = await fetchCurrentWeather();
  return NextResponse.json(
    { ...weather, source: "NWS" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    },
  );
}

/** Convert wind direction degrees to cardinal direction */
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
