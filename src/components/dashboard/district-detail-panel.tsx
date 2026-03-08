/**
 * District detail panel showing stats, facilities, and AI tools.
 * Displays when a district is selected from the map.
 */

"use client";

import type { District } from "@/lib/district-data";
import { HEAT_RISK_HEX } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Thermometer,
  Users,
  TreePine,
  Wind,
  AirVent,
  Building,
  AlertTriangle,
  ShieldAlert,
  MapPin,
} from "lucide-react";
import GrantReportGenerator from "./grant-report-generator";
import DistrictSummaryCard from "./district-summary-card";
import { generateDistrictPDF } from "./pdf-report";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DistrictDetailPanelProps {
  district: District;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  isLive?: boolean;
}

function StatItem({
  icon: Icon,
  label,
  value,
  unit,
  isLive = false,
}: StatItemProps) {
  return (
    <div className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3">
      <Icon className="h-5 w-5 text-accent flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-primary-foreground">
          {value}
          {unit && (
            <span className="text-xs font-medium text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </p>
      </div>
      {isLive && (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] font-semibold text-green-500">Live</span>
        </div>
      )}
    </div>
  );
}

export default function DistrictDetailPanel({
  district,
}: DistrictDetailPanelProps) {
  const riskColor = HEAT_RISK_HEX[district.heatRisk];

  return (
    <div className="h-full p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: riskColor }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: riskColor }}
          >
            {district.heatRisk} Risk
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-primary-foreground">
          {district.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          District {district.id} — Montgomery, AL
        </p>
      </div>

      {/* Live Heat Index */}
      <Card className="bg-transparent border-accent/20 shadow-none">
        <CardContent className="p-3">
          <StatItem
            icon={Thermometer}
            label="Current Heat Index"
            value={district.heatIndex}
            unit="°F"
            isLive
          />
        </CardContent>
      </Card>

      {/* Vulnerability Indicators */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
          Vulnerability Factors
        </h3>
        <div className="space-y-2.5">
          <VulnerabilityBar
            label="Heat Exposure"
            value={Math.min(100, Math.max(0, (district.heatIndex - 85) * 5))}
            color="text-red-400"
          />
          <VulnerabilityBar
            label="Green Space Coverage"
            value={district.greenSpacePercentage}
            color="text-green-400"
            inverted
          />
          <VulnerabilityBar
            label="A/C Access Gap"
            value={100 - district.acAccessPercentage}
            color="text-blue-400"
          />
        </div>
      </div>

      {/* Neighborhood Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
          Neighborhood Vitals
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatItem
            icon={Users}
            label="Population"
            value={district.population.toLocaleString()}
          />
          <StatItem
            icon={TreePine}
            label="Green Space"
            value={district.greenSpacePercentage}
            unit="%"
          />
          <StatItem
            icon={Wind}
            label="Air Quality"
            value={district.pollutionRate}
          />
          <StatItem
            icon={AirVent}
            label="A/C Access"
            value={district.acAccessPercentage}
            unit="%"
          />
        </div>
      </div>

      {/* Data from Montgomery Open Data */}
      {(district.violationsCount > 0 || district.crimeCount > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
            Open Data Insights
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {district.violationsCount > 0 && (
              <StatItem
                icon={AlertTriangle}
                label="Code Violations"
                value={district.violationsCount}
                unit="nearby"
              />
            )}
            {district.crimeCount > 0 && (
              <StatItem
                icon={ShieldAlert}
                label="Incidents"
                value={district.crimeCount}
                unit="nearby"
              />
            )}
          </div>
        </div>
      )}

      {/* Community Facilities */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
          Community Facilities
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {district.communityFacilities.map((facility) => (
            <div
              key={facility}
              className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Building className="h-3 w-3 text-accent" />
              <span>{facility}</span>
            </div>
          ))}
          {district.nearbyFacilities.length > 0 && (
            <>
              {district.nearbyFacilities.slice(0, 3).map((f, i) => (
                <div
                  key={`nearby-${i}`}
                  className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{f.name}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Identified Needs */}
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <h3 className="text-xs font-semibold text-primary-foreground uppercase tracking-wider mb-1.5">
          Identified Needs
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {district.identifiedNeeds}
        </p>
      </div>

      {/* AI Risk Analysis */}
      <div className="pt-2">
        <DistrictSummaryCard district={district} />
      </div>

      {/* AI Grant Report Tool */}
      <div>
        <GrantReportGenerator district={district} />
      </div>

      {/* PDF Download */}
      <div className="pt-2 pb-6">
        <Button
          variant="outline"
          className="w-full border-accent/30 hover:bg-accent/10"
          onClick={() => generateDistrictPDF(district)}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF Report
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Generate AI analyses above first for a complete report
        </p>
      </div>
    </div>
  );
}

/** Visual progress bar for vulnerability factors */
function VulnerabilityBar({
  label,
  value,
  color,
  inverted = false,
}: {
  label: string;
  value: number;
  color: string;
  inverted?: boolean;
}) {
  const displayValue = Math.round(value);
  const severity = inverted
    ? value >= 30
      ? "Good"
      : value >= 15
        ? "Fair"
        : "Poor"
    : value >= 60
      ? "Critical"
      : value >= 30
        ? "Moderate"
        : "Low";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-medium ${color}`}>{severity}</span>
      </div>
      <Progress value={displayValue} className="h-1.5" />
    </div>
  );
}
