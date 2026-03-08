/**
 * City-wide overview bar showing live weather and aggregate heat risk stats.
 * Displays at the top of the dashboard for immediate context.
 */

"use client";

import type { WeatherData } from "@/lib/api/weather";
import type { District } from "@/lib/district-data";
import {
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Users,
  Cloud,
} from "lucide-react";

interface CityOverviewBarProps {
  weather: WeatherData | null;
  districts: District[];
  dataSource: string;
  lastUpdated: string | null;
}

export default function CityOverviewBar({
  weather,
  districts,
  dataSource,
  lastUpdated,
}: CityOverviewBarProps) {
  const highRiskCount = districts.filter(
    (d) => d.heatRisk === "High" || d.heatRisk === "Very High",
  ).length;

  const totalPopAtRisk = districts
    .filter((d) => d.heatRisk === "High" || d.heatRisk === "Very High")
    .reduce((sum, d) => sum + d.population, 0);

  const avgHeatIndex =
    districts.length > 0
      ? Math.round(
          districts.reduce((sum, d) => sum + d.heatIndex, 0) / districts.length,
        )
      : 0;

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div className="w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container max-w-screen-2xl px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {/* Live weather */}
          {weather && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {weather.textDescription}
              </span>
            </div>
          )}

          {/* Temperature */}
          {weather && (
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-primary-foreground">
                {weather.temperature}°F
              </span>
              {weather.heatIndex && weather.heatIndex > weather.temperature && (
                <span className="text-xs text-muted-foreground">
                  (Feels {weather.heatIndex}°F)
                </span>
              )}
            </div>
          )}

          {/* Humidity */}
          {weather && (
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-muted-foreground">
                {weather.relativeHumidity}% humidity
              </span>
            </div>
          )}

          {/* Wind */}
          {weather && (
            <div className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-xs text-muted-foreground">
                {weather.windSpeed} mph {weather.windDirection}
              </span>
            </div>
          )}

          {/* Separator */}
          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Risk summary */}
          {highRiskCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-medium text-orange-400">
                {highRiskCount} district{highRiskCount > 1 ? "s" : ""} at
                elevated risk
              </span>
            </div>
          )}

          {/* Population at risk */}
          {totalPopAtRisk > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {totalPopAtRisk.toLocaleString()} residents affected
              </span>
            </div>
          )}

          {/* Avg heat index */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Avg Index:{" "}
              <span className="font-semibold text-primary-foreground">
                {avgHeatIndex}°F
              </span>
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Data source + timestamp */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            {formattedTime && <span>Updated {formattedTime}</span>}
            <span className="hidden lg:inline">|</span>
            <span className="hidden lg:inline truncate max-w-[200px]">
              {dataSource}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
