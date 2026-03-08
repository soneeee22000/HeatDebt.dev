/**
 * District detail panel showing stats, facilities, and AI tools.
 * Displays when a district is selected from the map.
 */

"use client";

import type { District } from "@/lib/district-data";
import { HEAT_RISK_HEX, RISK_TIER_HEX } from "@/lib/constants";
import type { RiskTier } from "@/lib/constants";
import type { MapLayer } from "@/lib/map-layers";
import { Card, CardContent } from "@/components/ui/card";
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
  Home,
  TrendingDown,
  Download,
  FileBarChart,
} from "lucide-react";
import { useState } from "react";
import GrantReportGenerator from "./grant-report-generator";
import DistrictSummaryCard from "./district-summary-card";
import PaymentModal from "./payment-modal";
import { generateDistrictPDF } from "./pdf-report";
import { Button } from "@/components/ui/button";

interface DistrictDetailPanelProps {
  district: District;
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  isLive?: boolean;
}

/** Individual stat display */
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

/** Risk tier badge */
function RiskTierBadge({ tier }: { tier: RiskTier }) {
  const color = RISK_TIER_HEX[tier];
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
      style={{
        color,
        borderColor: `${color}50`,
        backgroundColor: `${color}15`,
      }}
    >
      {tier}
    </span>
  );
}

/** Map vulnerability bar labels to MapLayer keys */
const VULN_BAR_LAYERS: Record<string, Exclude<MapLayer, "score">> = {
  "Heat Exposure": "heatExposure",
  "Tree Canopy": "treeCanopy",
  "A/C Access Gap": "acAccess",
  "Poverty Rate": "povertyRate",
  "Vacancy Rate": "vacancyRate",
};

export default function DistrictDetailPanel({
  district,
  activeLayer,
  onLayerChange,
}: DistrictDetailPanelProps) {
  const riskColor = HEAT_RISK_HEX[district.heatRisk];
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <div className="h-full p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <RiskTierBadge tier={district.riskTier} />
          <span className="text-[10px] text-muted-foreground">
            Tract {district.censusTract}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-primary-foreground">
          {district.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Score {district.heatScore}/100 — Montgomery, AL
        </p>
      </div>

      {/* HEATDEBT Score Ring + Heat Index */}
      <Card className="bg-transparent border-accent/20 shadow-none">
        <CardContent className="p-3 space-y-2">
          {/* Score ring */}
          <div className="flex items-center gap-4">
            <HeatScoreRing score={district.heatScore} />
            <div className="flex-1 space-y-1">
              <StatItem
                icon={Thermometer}
                label="Current Heat Index"
                value={district.heatIndex}
                unit="°F"
                isLive
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Indicators */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
          Vulnerability Factors
        </h3>
        <div className="space-y-2.5">
          {[
            {
              label: "Heat Exposure",
              value: Math.min(100, Math.max(0, (district.heatIndex - 85) * 5)),
              color: "text-red-400",
            },
            {
              label: "Tree Canopy",
              value: district.treeCanopyPct,
              color: "text-green-400",
              inverted: true,
            },
            {
              label: "A/C Access Gap",
              value: 100 - district.acAccessPercentage,
              color: "text-blue-400",
            },
            {
              label: "Poverty Rate",
              value: district.povertyRate,
              color: "text-amber-400",
            },
            {
              label: "Vacancy Rate",
              value: district.vacancyRate,
              color: "text-purple-400",
            },
          ].map((bar) => {
            const layerKey = VULN_BAR_LAYERS[bar.label];
            const isActive = activeLayer === layerKey;
            return (
              <VulnerabilityBar
                key={bar.label}
                label={bar.label}
                value={bar.value}
                color={bar.color}
                inverted={bar.inverted}
                isActive={isActive}
                onClick={() => onLayerChange(isActive ? "score" : layerKey)}
              />
            );
          })}
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
            label="Tree Canopy"
            value={district.treeCanopyPct}
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
          <StatItem
            icon={Home}
            label="Vacancy"
            value={district.vacancyRate}
            unit="%"
          />
          <StatItem
            icon={TrendingDown}
            label="Poverty"
            value={district.povertyRate}
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

      {/* AI Risk Analysis — key forces remount on district change */}
      <div className="pt-2">
        <DistrictSummaryCard
          key={`summary-${district.id}`}
          district={district}
        />
      </div>

      {/* AI Grant Report Tool — key forces remount on district change */}
      <div>
        <GrantReportGenerator
          key={`grant-${district.id}`}
          district={district}
        />
      </div>

      {/* Full Report + PDF Download */}
      <div className="pt-2 pb-6 space-y-3">
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          onClick={() => setPaymentOpen(true)}
        >
          <FileBarChart className="mr-2 h-4 w-4" />
          Generate Full Report
        </Button>
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

      <PaymentModal
        district={district}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
      />
    </div>
  );
}

/** HEATDEBT vulnerability score ring (0-100) */
function HeatScoreRing({ score }: { score: number }) {
  const color =
    score >= 75
      ? "#ef4444"
      : score >= 50
        ? "#f97316"
        : score >= 25
          ? "#f59e0b"
          : "#22c55e";

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
      <svg className="transform -rotate-90 w-20 h-20" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r="36"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[8px] text-muted-foreground uppercase tracking-wide">
          / 100
        </span>
      </div>
    </div>
  );
}

/** Visual progress bar for vulnerability factors — clickable to toggle map layer */
function VulnerabilityBar({
  label,
  value,
  color,
  inverted = false,
  isActive = false,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  inverted?: boolean;
  isActive?: boolean;
  onClick?: () => void;
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
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left space-y-1 rounded-lg px-2.5 py-2 transition-all cursor-pointer ${
        isActive ? "bg-accent/10 ring-1 ring-accent/40" : "hover:bg-muted/30"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {label}
          {isActive && (
            <span className="text-[9px] font-semibold text-accent uppercase tracking-wider">
              on map
            </span>
          )}
        </span>
        <span className={`text-xs font-medium ${color}`}>
          {displayValue}% · {severity}
        </span>
      </div>
      <Progress value={displayValue} className="h-1.5" />
    </button>
  );
}
