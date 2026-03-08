/**
 * Full HEATDEBT report page for a single district.
 * Renders a 5-section HTML report with progressive AI loading.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/header";
import { useDistrictData } from "@/hooks/use-district-data";
import {
  handleGenerateDistrictSummary,
  handleGenerateReport,
} from "@/app/actions";
import type { DistrictSummaryOutput } from "@/ai/flows/generate-district-summary-flow";
import type { GenerateGrantReportSummaryOutput } from "@/ai/flows/generate-grant-report-summary-flow";
import type { District } from "@/lib/district-data";
import { RISK_TIER_HEX } from "@/lib/constants";
import {
  Printer,
  ArrowLeft,
  Loader2,
  Thermometer,
  Users,
  TreePine,
  AirVent,
  Home,
  TrendingDown,
  AlertTriangle,
  Check,
  Copy,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/** Extract serializable fields from District for server actions */
function toDistrictInput(d: District) {
  return {
    name: d.name,
    heatRisk: d.heatRisk,
    heatIndex: d.heatIndex,
    population: d.population,
    greenSpacePercentage: d.greenSpacePercentage,
    pollutionRate: d.pollutionRate,
    acAccessPercentage: d.acAccessPercentage,
    communityFacilities: d.communityFacilities,
    identifiedNeeds: d.identifiedNeeds,
    violationsCount: d.violationsCount,
    crimeCount: d.crimeCount,
    censusTract: d.censusTract,
    heatScore: d.heatScore,
    treeCanopyPct: d.treeCanopyPct,
    vacancyRate: d.vacancyRate,
    povertyRate: d.povertyRate,
    riskTier: d.riskTier,
  };
}

export default function ReportPage() {
  const params = useParams();
  const districtId = Number(params.districtId);
  const { districts, isLoading: dataLoading } = useDistrictData();

  const [district, setDistrict] = useState<District | null>(null);
  const [riskData, setRiskData] = useState<DistrictSummaryOutput | null>(null);
  const [grantData, setGrantData] =
    useState<GenerateGrantReportSummaryOutput | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Find district from loaded data
  useEffect(() => {
    if (districts.length > 0) {
      const found = districts.find((d) => d.id === districtId);
      if (found) setDistrict(found);
    }
  }, [districts, districtId]);

  // Fetch AI data once district is available
  const fetchAIData = useCallback(async (d: District) => {
    const input = toDistrictInput(d);

    setRiskLoading(true);
    setGrantLoading(true);

    // Run both in parallel
    const [riskResult, grantResult] = await Promise.all([
      handleGenerateDistrictSummary(input).catch((e) => ({
        error: String(e),
      })),
      handleGenerateReport(input).catch((e) => ({ error: String(e) })),
    ]);

    if ("summary" in riskResult && riskResult.summary) {
      setRiskData(riskResult.summary);
    } else {
      setRiskError(
        "error" in riskResult
          ? (riskResult.error ?? "Failed to load")
          : "Failed to load",
      );
    }
    setRiskLoading(false);

    if ("summary" in grantResult && grantResult.summary) {
      setGrantData(grantResult.summary);
    } else {
      setGrantError(
        "error" in grantResult
          ? (grantResult.error ?? "Failed to load")
          : "Failed to load",
      );
    }
    setGrantLoading(false);
  }, []);

  useEffect(() => {
    if (district && !riskData && !riskLoading && !riskError) {
      fetchAIData(district);
    }
  }, [district, riskData, riskLoading, riskError, fetchAIData]);

  async function handleCopyNarrative() {
    if (!grantData?.narrative) return;
    await navigator.clipboard.writeText(grantData.narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (dataLoading || !district) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Loading district data...
            </p>
          </div>
        </div>
      </>
    );
  }

  const tierColor = RISK_TIER_HEX[district.riskTier];

  return (
    <>
      <Header />

      {/* Print + nav bar */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-border/50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 print:py-0 print:space-y-6">
        {/* Section 1: Cover */}
        <section className="text-center space-y-4 pb-6 border-b border-border/50">
          <div className="flex justify-center">
            <ScoreRing score={district.heatScore} size={120} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-foreground">
            {district.name}
          </h1>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
              style={{
                color: tierColor,
                borderColor: `${tierColor}50`,
                backgroundColor: `${tierColor}15`,
              }}
            >
              {district.riskTier} Risk
            </span>
            <span className="text-sm text-muted-foreground">
              Score: {district.heatScore}/100
            </span>
            <span className="text-sm text-muted-foreground">
              Tract {district.censusTract}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            HEATDEBT Vulnerability Report &middot; Montgomery, Alabama &middot;{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </section>

        {/* Section 2: Thermal Reality — Data Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            Thermal Reality
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DataCard
              icon={Thermometer}
              label="Heat Index"
              value={`${district.heatIndex}°F`}
              highlight
            />
            <DataCard
              icon={TrendingDown}
              label="Poverty Rate"
              value={`${district.povertyRate}%`}
            />
            <DataCard
              icon={TreePine}
              label="Tree Canopy"
              value={`${district.treeCanopyPct}%`}
            />
            <DataCard
              icon={AirVent}
              label="A/C Access"
              value={`${district.acAccessPercentage}%`}
            />
            <DataCard
              icon={Home}
              label="Vacancy Rate"
              value={`${district.vacancyRate}%`}
            />
            <DataCard
              icon={Users}
              label="Population"
              value={district.population.toLocaleString()}
            />
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 text-muted-foreground font-medium">
                    Metric
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    {district.name}
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    City Average
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    Gap
                  </th>
                </tr>
              </thead>
              <tbody className="text-primary-foreground">
                <ComparisonRow
                  label="Tree Canopy"
                  value={district.treeCanopyPct}
                  cityAvg={22}
                  unit="%"
                />
                <ComparisonRow
                  label="A/C Access"
                  value={district.acAccessPercentage}
                  cityAvg={78}
                  unit="%"
                />
                <ComparisonRow
                  label="Poverty Rate"
                  value={district.povertyRate}
                  cityAvg={22}
                  unit="%"
                  inverted
                />
                <ComparisonRow
                  label="Vacancy Rate"
                  value={district.vacancyRate}
                  cityAvg={12}
                  unit="%"
                  inverted
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Why This Neighborhood Overheats */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Why This Neighborhood Overheats
          </h2>

          {riskLoading ? (
            <LoadingBlock label="Generating AI risk analysis..." />
          ) : riskError ? (
            <ErrorBlock message={riskError} />
          ) : riskData ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {riskData.riskAssessment}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
                  Key Findings
                </h3>
                <ul className="space-y-2">
                  {riskData.keyFindings.map((finding, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                        style={{
                          backgroundColor: `${tierColor}20`,
                          color: tierColor,
                        }}
                      >
                        {i + 1}
                      </span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </section>

        {/* Section 4: Interventions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Recommended Interventions
          </h2>

          {riskLoading ? (
            <LoadingBlock label="Generating intervention recommendations..." />
          ) : riskError ? (
            <ErrorBlock message={riskError} />
          ) : riskData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {riskData.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${tierColor}20`,
                          color: tierColor,
                        }}
                      >
                        P{i + 1}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Priority {i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Estimated Budget
                  </p>
                  <p className="text-lg font-bold text-primary-foreground">
                    {riskData.estimatedBudget}
                  </p>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Priority Level
                  </p>
                  <p className="text-lg font-bold" style={{ color: tierColor }}>
                    {riskData.priorityLevel}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Section 5: Grant Application */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            Grant Application
          </h2>

          {grantLoading ? (
            <LoadingBlock label="Generating grant narrative with Gemini..." />
          ) : grantError ? (
            <ErrorBlock message={grantError} />
          ) : grantData ? (
            <div className="space-y-4">
              {/* Grant metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Grant Title</p>
                  <p className="text-sm font-medium text-primary-foreground">
                    {grantData.grantTitle}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm font-medium text-primary-foreground">
                    {grantData.grantSource}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium text-primary-foreground">
                    {grantData.grantAmount}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium text-primary-foreground">
                    {grantData.applicationDeadline}
                  </p>
                </div>
              </div>

              {/* Narrative */}
              <div className="relative rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
                    Application Narrative
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyNarrative}
                    className="text-muted-foreground hover:text-primary-foreground print:hidden"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {grantData.narrative}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 pt-6 pb-8 text-center space-y-2">
          <h1 className="font-extrabold text-lg tracking-tight">
            <span className="text-primary-foreground">HEAT</span>
            <span className="text-orange-500">DEBT</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Urban Thermal Intelligence &middot; Montgomery, Alabama
          </p>
          <p className="text-[10px] text-muted-foreground">
            Data: NWS &middot; Open-Meteo &middot; Census ACS &middot; EPA
            AirNow &middot; Montgomery ArcGIS &middot; AI: Google Gemini
          </p>
        </footer>
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header,
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          main {
            max-width: 100% !important;
            padding: 0 1cm !important;
          }
          section {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

/** Score ring SVG */
function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const color =
    score >= 75
      ? "#ef4444"
      : score >= 50
        ? "#f97316"
        : score >= 25
          ? "#f59e0b"
          : "#22c55e";
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        viewBox="0 0 100 100"
        width={size}
        height={size}
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
          / 100
        </span>
      </div>
    </div>
  );
}

/** Data card for the thermal reality grid */
function DataCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${highlight ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card/50"}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className={`h-4 w-4 ${highlight ? "text-orange-500" : "text-muted-foreground"}`}
        />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold text-primary-foreground">{value}</p>
    </div>
  );
}

/** Comparison table row */
function ComparisonRow({
  label,
  value,
  cityAvg,
  unit,
  inverted = false,
}: {
  label: string;
  value: number;
  cityAvg: number;
  unit: string;
  inverted?: boolean;
}) {
  const gap = value - cityAvg;
  const isWorse = inverted ? gap > 0 : gap < 0;

  return (
    <tr className="border-b border-border/30">
      <td className="py-2 text-muted-foreground">{label}</td>
      <td className="py-2 text-right font-medium">
        {value}
        {unit}
      </td>
      <td className="py-2 text-right text-muted-foreground">
        {cityAvg}
        {unit}
      </td>
      <td
        className={`py-2 text-right font-medium ${isWorse ? "text-red-400" : "text-green-400"}`}
      >
        {gap > 0 ? "+" : ""}
        {gap}
        {unit}
      </td>
    </tr>
  );
}

/** Loading placeholder */
function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-8 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">{label}</p>
      </div>
    </div>
  );
}

/** Error placeholder */
function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
