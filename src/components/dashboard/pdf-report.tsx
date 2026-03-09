/**
 * Premium HTML report generator for HEATDEBT district analysis.
 * Generates a 14-page report matching the reference template with
 * 5 sections: Overview, Dashboard, Risk Matrix, Correlations, Recommendations.
 * Opens in a new browser window and triggers print-to-PDF.
 */

"use client";

import type { District } from "@/lib/district-data";
import type { DistrictSummaryOutput } from "@/ai/flows/generate-district-summary-flow";
import type { GenerateGrantReportSummaryOutput } from "@/ai/flows/generate-grant-report-summary-flow";
import {
  handleGenerateDistrictSummary,
  handleGenerateReport,
} from "@/app/actions";
import {
  computeCityAverages,
  computeDeltas,
  computeScoreBreakdown,
  computeSubGroups,
  computeCostEstimates,
  computeROI,
  getCorrelationMatrix,
  getGrantDatabase,
  getImplementationTimeline,
  buildCorrelationNarratives,
  buildProblemSummaryMatrix,
  formatCurrency,
  generateReportId,
} from "@/lib/report-computations";

/** Serialize district for server actions (no GeoJSON feature) */
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

/** Escape HTML entities */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Replace template variables in grant narrative */
function replaceNarrativeVars(text: string, d: District): string {
  return text
    .replace(/\[DISTRICT_NAME\]/g, d.name)
    .replace(/\[CITY_NAME\]/g, "Montgomery")
    .replace(/\[STATE_NAME\]/g, "Alabama")
    .replace(/\[DYNAMIC_YEAR\]/g, new Date().getFullYear().toString())
    .replace(/\[HEAT_INDEX_F\]/g, `${d.heatIndex}\u00B0F`)
    .replace(/\[POPULATION\]/g, d.population.toLocaleString())
    .replace(/\[GREEN_SPACE_PERCENT\]/g, `${d.greenSpacePercentage}%`)
    .replace(/\[AC_ACCESS_PERCENT\]/g, `${d.acAccessPercentage}%`);
}

/** Format delta with sign and color class */
function deltaHTML(v: number, suffix = "", invertColor = false): string {
  const sign = v > 0 ? "+" : "";
  const cls = invertColor
    ? v > 0
      ? "delta-positive"
      : "delta-negative"
    : v > 0
      ? "delta-negative"
      : "delta-positive";
  return `<span class="${cls}">${sign}${v}${suffix}</span>`;
}

/** Build the full HTML document string */
function buildReportHTML(
  district: District,
  allDistricts: District[],
  aiSummary: DistrictSummaryOutput | null,
  grantReport: GenerateGrantReportSummaryOutput | null,
): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const reportId = generateReportId(district);
  const cityAvg = computeCityAverages(allDistricts);
  const deltas = computeDeltas(district, cityAvg);
  const scoreBreakdown = computeScoreBreakdown(district, allDistricts);
  const subGroups = computeSubGroups(district);
  const costItems = computeCostEstimates(district, subGroups);
  const subtotal = costItems.reduce((s, c) => s + c.total, 0);
  const pmCost = Math.round(subtotal * 0.05);
  const totalCost = subtotal + pmCost;
  const roi = computeROI(totalCost, district);
  const corrMatrix = getCorrelationMatrix();
  const grants = getGrantDatabase();
  const timeline = getImplementationTimeline();
  const narratives = buildCorrelationNarratives(
    district,
    cityAvg,
    deltas,
    subGroups,
  );
  const problemMatrix = buildProblemSummaryMatrix(district, cityAvg, deltas);
  const sorted = [...allDistricts].sort((a, b) => b.heatScore - a.heatScore);
  const facilityCount =
    district.communityFacilities.length + district.nearbyFacilities.length;

  const riskBadgeColor =
    district.heatScore >= 75
      ? "#C0392B"
      : district.heatScore >= 50
        ? "#E67E22"
        : district.heatScore >= 25
          ? "#f59e0b"
          : "#0D6E6E";

  const scoreTotal = scoreBreakdown
    .reduce((s, c) => s + c.weighted, 0)
    .toFixed(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>HEATDEBT Report \u2014 ${esc(district.name)} Census Tract ${esc(district.censusTract)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --red:    #C0392B;
    --orange: #E67E22;
    --ink:    #1A1A2A;
    --mid:    #5A5A72;
    --light:  #F4F3EF;
    --white:  #FFFFFF;
    --rule:   #D8D6CE;
    --teal:   #0D6E6E;
    --gold:   #B8860B;
    --purple: #8E44AD;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #E8E6DE;
    color: var(--ink);
    font-size: 14px;
    line-height: 1.7;
  }

  .page {
    max-width: 820px;
    margin: 40px auto;
    background: var(--white);
    box-shadow: 0 4px 40px rgba(0,0,0,0.18);
  }

  /* ── Cover ──────────────────────────────────────── */
  .cover {
    background: var(--ink);
    padding: 56px 60px 48px;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(192,57,43,0.15);
  }
  .cover-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--orange);
    margin-bottom: 20px; position: relative;
  }
  .confidential {
    position: absolute; top: 20px; right: 60px;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,0.25);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 4px 12px;
  }
  .cover h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 42px; line-height: 1.15;
    color: #FFFFFF; margin-bottom: 8px;
    position: relative;
  }
  .cover h1 em { font-style: italic; color: var(--orange); }
  .cover-sub {
    color: rgba(255,255,255,0.55);
    font-size: 15px; margin-bottom: 40px;
    position: relative;
  }
  .cover-meta {
    display: flex; gap: 32px; flex-wrap: wrap;
    position: relative;
  }
  .meta-label { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
  .meta-value { font-size: 15px; font-weight: 600; color: #FFFFFF; }
  .risk-badge {
    display: inline-flex; align-items: center; gap: 8px;
    color: #fff;
    padding: 6px 16px; border-radius: 4px;
    font-size: 13px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; margin-top: 28px;
    position: relative;
  }
  .score-ring {
    position: absolute; right: 60px; top: 50px;
    width: 100px; height: 100px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    border: 3px solid; border-radius: 50%;
  }
  .score-num { font-size: 32px; font-weight: 700; line-height: 1; }
  .score-lbl { font-size: 10px; color: rgba(255,255,255,0.45); letter-spacing: 1px; }

  /* ── TOC ────────────────────────────────────────── */
  .toc {
    background: var(--light);
    padding: 32px 60px;
    border-bottom: 1px solid var(--rule);
  }
  .toc h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 18px; color: var(--ink);
    margin-bottom: 16px;
  }
  .toc-row {
    display: flex; justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px dotted var(--rule);
    font-size: 13px;
  }
  .toc-row .toc-section { color: var(--orange); font-weight: 700; margin-right: 10px; }
  .toc-row .toc-title { color: var(--ink); flex: 1; }
  .toc-row .toc-page { color: var(--mid); }
  .report-id {
    margin-top: 16px;
    font-size: 11px; color: var(--mid);
  }

  /* ── Sections ───────────────────────────────────── */
  .body { padding: 0; }
  .sec {
    padding: 40px 60px;
    border-bottom: 1px solid var(--rule);
  }
  .sec:last-child { border-bottom: none; }
  .sec-num {
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: var(--orange);
    margin-bottom: 6px;
  }
  .sec h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 26px; color: var(--ink);
    margin-bottom: 18px; line-height: 1.2;
  }
  .sec h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px; color: var(--ink);
    margin: 24px 0 12px;
  }
  .sec p {
    color: #3A3A4A; font-size: 14px; line-height: 1.8;
    margin-bottom: 14px;
  }

  /* ── Data Grid ──────────────────────────────────── */
  .data-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    margin: 24px 0;
  }
  .data-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .data-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .data-cell {
    background: var(--white);
    padding: 16px 18px;
  }
  .data-cell.header-cell {
    background: var(--light);
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--mid);
    padding: 10px 18px;
  }
  .data-cell.highlight { background: #FFF5F5; }
  .dc-label { font-size: 11px; color: var(--mid); margin-bottom: 4px; }
  .dc-value { font-size: 20px; font-weight: 700; color: var(--ink); line-height: 1; }
  .dc-value.hot  { color: var(--red); }
  .dc-value.warn { color: var(--orange); }
  .dc-value.ok   { color: var(--teal); }
  .dc-sub { font-size: 11px; color: var(--mid); margin-top: 3px; }

  /* ── Tables ─────────────────────────────────────── */
  .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
  .report-table th {
    background: var(--ink); color: #fff;
    padding: 10px 14px; text-align: left;
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase;
  }
  .report-table td {
    padding: 10px 14px; border-bottom: 1px solid var(--rule);
    color: #3A3A4A;
  }
  .report-table tr:nth-child(even) td { background: var(--light); }
  .report-table .val-bad  { color: var(--red);    font-weight: 700; }
  .report-table .val-warn { color: var(--orange); font-weight: 700; }
  .report-table .val-ok   { color: var(--teal);   font-weight: 600; }
  .report-table .current-row td { background: #FFF5F5; font-weight: 600; }

  /* ── Layer Headers ──────────────────────────────── */
  .layer-header {
    background: var(--ink);
    color: var(--orange);
    font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 8px 14px;
    margin-top: 24px;
  }

  /* ── Deltas ─────────────────────────────────────── */
  .delta-positive { color: var(--teal); font-weight: 600; }
  .delta-negative { color: var(--red); font-weight: 600; }

  /* ── Correlation Matrix ─────────────────────────── */
  .corr-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; text-align: center; }
  .corr-table th {
    background: var(--ink); color: #fff;
    padding: 8px 6px; font-size: 10px; font-weight: 600;
    letter-spacing: 0.5px;
  }
  .corr-table td {
    padding: 8px 6px; border: 1px solid var(--rule);
    font-weight: 600;
  }
  .corr-strong { background: #FADBD8; color: var(--red); }
  .corr-moderate { background: #FDEBD0; color: var(--orange); }
  .corr-weak { background: #F4F3EF; color: var(--mid); }
  .corr-none { background: #E8E6DE; color: var(--mid); }

  /* ── Severity Badges ────────────────────────────── */
  .sev-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .sev-critical { background: rgba(192,57,43,0.12); color: var(--red); }
  .sev-high { background: rgba(230,126,34,0.12); color: var(--orange); }
  .sev-moderate { background: rgba(245,158,11,0.12); color: #B8860B; }
  .sev-low { background: rgba(13,110,110,0.12); color: var(--teal); }

  /* ── Callout Box ────────────────────────────────── */
  .callout-box {
    background: #FFF5F5;
    border-left: 4px solid var(--red);
    padding: 16px 20px;
    margin: 20px 0;
    font-size: 13px;
  }
  .callout-box .callout-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--red); margin-bottom: 6px;
  }

  /* ── Correlation Narrative Blocks ───────────────── */
  .corr-block {
    border-left: 4px solid var(--teal);
    padding: 16px 20px;
    margin: 16px 0;
    background: var(--light);
  }
  .corr-block h4 {
    font-size: 15px; font-weight: 700;
    color: var(--ink); margin-bottom: 8px;
  }
  .corr-block p {
    font-size: 13px; line-height: 1.7;
    color: #3A3A4A; margin: 0;
  }

  /* ── Interventions ──────────────────────────────── */
  .intervention {
    border: 1px solid var(--rule);
    border-left: 4px solid var(--teal);
    padding: 20px 24px;
    margin: 16px 0;
    background: var(--white);
  }
  .intervention.priority-1 { border-left-color: var(--red); }
  .intervention.priority-2 { border-left-color: var(--orange); }
  .intervention.priority-3 { border-left-color: var(--teal); }
  .int-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .int-title { font-size: 15px; font-weight: 700; color: var(--ink); }
  .int-priority { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 8px; border-radius: 3px; }
  .pr1 { background: rgba(192,57,43,0.1); color: var(--red); }
  .pr2 { background: rgba(230,126,34,0.1); color: var(--orange); }
  .pr3 { background: rgba(13,110,110,0.1); color: var(--teal); }

  /* ── Grant Box ──────────────────────────────────── */
  .grant-box {
    background: var(--light);
    border: 1px solid var(--rule);
    padding: 24px 28px;
    margin: 20px 0;
  }
  .grant-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .grant-name { font-family: 'DM Serif Display', serif; font-size: 18px; color: var(--ink); }
  .grant-amount { font-size: 20px; font-weight: 700; color: var(--teal); }
  .grant-meta { display: flex; gap: 24px; flex-wrap: wrap; }
  .gm-label { font-size: 10px; color: var(--mid); text-transform: uppercase; letter-spacing: 1px; }
  .gm-value { font-size: 13px; font-weight: 600; color: var(--ink); }

  /* ── Narrative Box ──────────────────────────────── */
  .narrative {
    border: 1px solid var(--rule);
    border-top: 3px solid var(--gold);
    padding: 28px 32px;
    margin: 20px 0;
    background: #FFFDF5;
  }
  .narrative-label {
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: var(--gold);
    margin-bottom: 14px;
  }
  .narrative p.plain {
    font-size: 14px;
    color: var(--ink); line-height: 1.85;
    margin-bottom: 14px;
  }

  /* ── Next Steps ─────────────────────────────────── */
  .next-step {
    display: flex; gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--rule);
    font-size: 13px;
  }
  .next-step .step-num {
    background: var(--ink);
    color: var(--orange);
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    flex-shrink: 0;
  }
  .next-step .step-text { color: #3A3A4A; line-height: 1.6; }
  .next-step .step-text strong { color: var(--ink); }

  /* ── Footer ─────────────────────────────────────── */
  .report-footer {
    background: var(--ink);
    padding: 24px 60px;
  }
  .report-footer .brand { color: var(--orange); font-weight: 700; font-size: 15px; }
  .report-footer .sources { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; line-height: 1.8; }
  .report-footer .disclaimer {
    font-size: 10px; color: rgba(255,255,255,0.25);
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
    line-height: 1.6;
  }

  /* ── Print ──────────────────────────────────────── */
  .page-break { page-break-after: always; }

  @media print {
    body { background: white; }
    .page { margin: 0; box-shadow: none; }
    .page-break { page-break-after: always; }
    .sec { page-break-inside: avoid; }
  }

  @media(max-width:600px) {
    .cover, .sec, .toc { padding-left: 24px; padding-right: 24px; }
    .data-grid { grid-template-columns: 1fr 1fr; }
    .score-ring { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ═══════════════════ COVER ═══════════════════ -->
  <div class="cover">
    <div class="confidential">CONFIDENTIAL</div>
    <div class="score-ring" style="border-color:${riskBadgeColor};">
      <div class="score-num" style="color:${riskBadgeColor};">${district.heatScore}</div>
      <div class="score-lbl">/ 100</div>
    </div>
    <div class="cover-eyebrow">HEATDEBT &middot; DUE DILIGENCE REPORT</div>
    <h1>${esc(district.name)}<br><em>${district.heatScore >= 75 ? "Is Burning." : district.heatScore >= 50 ? "Is Heating Up." : "Needs Attention."}</em></h1>
    <p class="cover-sub">Census Tract ${esc(district.censusTract)} &middot; Montgomery, Alabama</p>
    <div class="cover-meta">
      <div class="meta-item">
        <div class="meta-label">Generated</div>
        <div class="meta-value">${date}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Population</div>
        <div class="meta-value">${district.population.toLocaleString()} residents</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Heat Index</div>
        <div class="meta-value">${district.heatIndex}&deg;F</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Data Sources</div>
        <div class="meta-value">Open-Meteo &middot; Census &middot; NWS</div>
      </div>
    </div>
    <div class="risk-badge" style="background:${riskBadgeColor};">${district.riskTier} Risk Zone</div>
  </div>

  <!-- ═══════════════════ TABLE OF CONTENTS ═══════════════════ -->
  <div class="toc">
    <h3>Table of Contents</h3>
    <div class="toc-row"><span class="toc-section">01</span><span class="toc-title">District Overview</span><span class="toc-page">2</span></div>
    <div class="toc-row"><span class="toc-section">02</span><span class="toc-title">Real-Time Data Dashboard</span><span class="toc-page">3\u20134</span></div>
    <div class="toc-row"><span class="toc-section">03</span><span class="toc-title">Risk Matrix &amp; Vulnerability Analysis</span><span class="toc-page">5\u20136</span></div>
    <div class="toc-row"><span class="toc-section">04</span><span class="toc-title">Cross-Layer Correlations</span><span class="toc-page">7\u20138</span></div>
    <div class="toc-row"><span class="toc-section">05</span><span class="toc-title">Recommendations &amp; Grant Strategy</span><span class="toc-page">9\u201314</span></div>
    <div class="report-id">Report ID: ${esc(reportId)} &middot; Generated ${date}</div>
  </div>

  <div class="body">

    <!-- ═══════════════════ SECTION 01: DISTRICT OVERVIEW (p2) ═══════════════════ -->
    <div class="sec">
      <div class="sec-num">Section 01</div>
      <h2>District Overview</h2>
      <p>
        ${esc(district.name)} (Census Tract ${esc(district.censusTract)}) is located in
        Montgomery, Alabama, with a population of ${district.population.toLocaleString()} residents.
        This neighborhood recorded a heat index of <strong>${district.heatIndex}&deg;F</strong>
        with a HEATDEBT vulnerability score of <strong>${district.heatScore}/100</strong>,
        placing it in the <strong>${district.riskTier}</strong> risk tier.
        The combination of ${district.treeCanopyPct}% tree canopy coverage,
        ${district.povertyRate}% poverty rate, and ${district.acAccessPercentage}% A/C access
        creates compounding thermal risk for residents.
      </p>

      <div class="data-grid">
        <div class="data-cell header-cell">Temperature</div>
        <div class="data-cell header-cell">Demographics</div>
        <div class="data-cell header-cell">Environment</div>
        <div class="data-cell header-cell">Infrastructure</div>

        <div class="data-cell highlight">
          <div class="dc-label">Heat Index</div>
          <div class="dc-value hot">${district.heatIndex}&deg;F</div>
          <div class="dc-sub">City Avg: ${cityAvg.heatIndex}&deg;F | ${deltaHTML(deltas.heatIndex, "\u00B0F")}</div>
        </div>
        <div class="data-cell highlight">
          <div class="dc-label">Poverty Rate</div>
          <div class="dc-value ${district.povertyRate >= 40 ? "hot" : district.povertyRate >= 20 ? "warn" : "ok"}">${district.povertyRate}%</div>
          <div class="dc-sub">City Avg: ${cityAvg.povertyRate}% | ${deltaHTML(deltas.povertyRate, "%")}</div>
        </div>
        <div class="data-cell highlight">
          <div class="dc-label">Tree Canopy</div>
          <div class="dc-value ${district.treeCanopyPct < 10 ? "hot" : district.treeCanopyPct < 20 ? "warn" : "ok"}">${district.treeCanopyPct}%</div>
          <div class="dc-sub">City Avg: ${cityAvg.treeCanopyPct}% | ${deltaHTML(deltas.treeCanopyPct, "%", true)}</div>
        </div>
        <div class="data-cell highlight">
          <div class="dc-label">A/C Access</div>
          <div class="dc-value ${district.acAccessPercentage < 60 ? "hot" : district.acAccessPercentage < 75 ? "warn" : "ok"}">${district.acAccessPercentage}%</div>
          <div class="dc-sub">City Avg: ${cityAvg.acAccessPercentage}% | ${deltaHTML(deltas.acAccessPercentage, "%", true)}</div>
        </div>

        <div class="data-cell">
          <div class="dc-label">HEATDEBT Score</div>
          <div class="dc-value ${district.heatScore >= 75 ? "hot" : district.heatScore >= 50 ? "warn" : "ok"}">${district.heatScore}/100</div>
          <div class="dc-sub">City Avg: ${cityAvg.heatScore} | ${deltaHTML(deltas.heatScore)}</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Population</div>
          <div class="dc-value">${district.population.toLocaleString()}</div>
          <div class="dc-sub">City Avg: ${cityAvg.population.toLocaleString()}</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Green Space</div>
          <div class="dc-value ${district.greenSpacePercentage < 10 ? "hot" : district.greenSpacePercentage < 20 ? "warn" : "ok"}">${district.greenSpacePercentage}%</div>
          <div class="dc-sub">City Avg: ${cityAvg.greenSpacePercentage}% | ${deltaHTML(deltas.greenSpacePercentage, "%", true)}</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Vacancy Rate</div>
          <div class="dc-value ${district.vacancyRate >= 20 ? "hot" : district.vacancyRate >= 10 ? "warn" : "ok"}">${district.vacancyRate}%</div>
          <div class="dc-sub">City Avg: ${cityAvg.vacancyRate}% | ${deltaHTML(deltas.vacancyRate, "%")}</div>
        </div>
      </div>

      ${
        aiSummary
          ? `<div class="callout-box">
              <div class="callout-label">Critical Finding</div>
              ${esc(aiSummary.riskAssessment)}
            </div>`
          : `<div class="callout-box">
              <div class="callout-label">Key Finding</div>
              ${esc(district.identifiedNeeds)}
            </div>`
      }
    </div>
    <div class="page-break"></div>

    <!-- ═══════════════════ SECTION 02: REAL-TIME DATA DASHBOARD (p3-4) ═══════════════════ -->
    <div class="sec">
      <div class="sec-num">Section 02</div>
      <h2>Real-Time Data Dashboard</h2>
      <p>
        Comprehensive data comparison across all monitored indicators for
        ${esc(district.name)} versus city-wide averages. Data sourced from
        Open-Meteo weather API, US Census ACS, and Montgomery Open Data portal.
      </p>

      <!-- Layer 1: Heat & Temperature -->
      <div class="layer-header">Layer 1: Heat &amp; Temperature</div>
      <table class="report-table">
        <thead><tr>
          <th>Indicator</th><th>This District</th><th>City Average</th><th>Delta</th><th>Source</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>Heat Index</td>
            <td class="val-bad">${district.heatIndex}&deg;F</td>
            <td>${cityAvg.heatIndex}&deg;F</td>
            <td>${deltaHTML(deltas.heatIndex, "\u00B0F")}</td>
            <td>Open-Meteo</td>
          </tr>
          <tr>
            <td>HEATDEBT Score</td>
            <td class="${district.heatScore >= 75 ? "val-bad" : district.heatScore >= 50 ? "val-warn" : "val-ok"}">${district.heatScore}/100</td>
            <td>${cityAvg.heatScore}/100</td>
            <td>${deltaHTML(deltas.heatScore)}</td>
            <td>Computed</td>
          </tr>
          <tr>
            <td>Heat Risk Level</td>
            <td class="${district.heatRisk === "Very High" || district.heatRisk === "High" ? "val-bad" : "val-warn"}">${esc(district.heatRisk)}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>NWS Categories</td>
          </tr>
          <tr>
            <td>Risk Tier</td>
            <td class="${district.riskTier === "CRITICAL" ? "val-bad" : district.riskTier === "HIGH" ? "val-warn" : "val-ok"}">${district.riskTier}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>HEATDEBT Model</td>
          </tr>
          <tr>
            <td>Air Quality</td>
            <td class="${district.pollutionRate === "High" ? "val-bad" : district.pollutionRate === "Moderate" ? "val-warn" : "val-ok"}">${esc(district.pollutionRate)}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>EPA AirNow</td>
          </tr>
        </tbody>
      </table>

      <!-- Layer 2: Demographics & Vulnerability -->
      <div class="layer-header">Layer 2: Demographics &amp; Vulnerability</div>
      <table class="report-table">
        <thead><tr>
          <th>Indicator</th><th>This District</th><th>City Average</th><th>Delta</th><th>Source</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>Population</td>
            <td>${district.population.toLocaleString()}</td>
            <td>${cityAvg.population.toLocaleString()}</td>
            <td>${deltaHTML(district.population - cityAvg.population)}</td>
            <td>US Census ACS</td>
          </tr>
          <tr>
            <td>Poverty Rate</td>
            <td class="${district.povertyRate >= 40 ? "val-bad" : district.povertyRate >= 20 ? "val-warn" : "val-ok"}">${district.povertyRate}%</td>
            <td>${cityAvg.povertyRate}%</td>
            <td>${deltaHTML(deltas.povertyRate, "%")}</td>
            <td>US Census ACS</td>
          </tr>
          <tr>
            <td>Estimated Elderly (65+)</td>
            <td>${subGroups.elderly.toLocaleString()}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Census estimate</td>
          </tr>
          <tr>
            <td>Children Under 5</td>
            <td>${subGroups.childrenUnder5.toLocaleString()}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Census estimate</td>
          </tr>
          <tr>
            <td>No-A/C Households</td>
            <td class="val-bad">${subGroups.noAcHouseholds.toLocaleString()}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Computed</td>
          </tr>
          <tr>
            <td>Below Poverty + No A/C</td>
            <td class="val-bad">${subGroups.belowPovertyNoAc.toLocaleString()}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Computed</td>
          </tr>
        </tbody>
      </table>

      <!-- Layer 3: Environment & Infrastructure -->
      <div class="layer-header">Layer 3: Environment &amp; Infrastructure</div>
      <table class="report-table">
        <thead><tr>
          <th>Indicator</th><th>This District</th><th>City Average</th><th>Delta</th><th>Source</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>Tree Canopy Coverage</td>
            <td class="${district.treeCanopyPct < 10 ? "val-bad" : district.treeCanopyPct < 20 ? "val-warn" : "val-ok"}">${district.treeCanopyPct}%</td>
            <td>${cityAvg.treeCanopyPct}%</td>
            <td>${deltaHTML(deltas.treeCanopyPct, "%", true)}</td>
            <td>USDA NLCD</td>
          </tr>
          <tr>
            <td>Green Space</td>
            <td class="${district.greenSpacePercentage < 10 ? "val-bad" : district.greenSpacePercentage < 20 ? "val-warn" : "val-ok"}">${district.greenSpacePercentage}%</td>
            <td>${cityAvg.greenSpacePercentage}%</td>
            <td>${deltaHTML(deltas.greenSpacePercentage, "%", true)}</td>
            <td>Montgomery GIS</td>
          </tr>
          <tr>
            <td>A/C Access</td>
            <td class="${district.acAccessPercentage < 60 ? "val-bad" : district.acAccessPercentage < 75 ? "val-warn" : "val-ok"}">${district.acAccessPercentage}%</td>
            <td>${cityAvg.acAccessPercentage}%</td>
            <td>${deltaHTML(deltas.acAccessPercentage, "%", true)}</td>
            <td>US Census ACS</td>
          </tr>
          <tr>
            <td>Cooling Centers</td>
            <td>${facilityCount}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Montgomery ArcGIS</td>
          </tr>
          <tr>
            <td>Code Violations</td>
            <td class="${district.violationsCount > 10 ? "val-bad" : district.violationsCount > 5 ? "val-warn" : "val-ok"}">${district.violationsCount}</td>
            <td>${cityAvg.violationsCount}</td>
            <td>${deltaHTML(district.violationsCount - cityAvg.violationsCount)}</td>
            <td>Montgomery ArcGIS</td>
          </tr>
        </tbody>
      </table>

      <!-- Layer 4: Property Market -->
      <div class="layer-header">Layer 4: Property &amp; Safety</div>
      <table class="report-table">
        <thead><tr>
          <th>Indicator</th><th>This District</th><th>City Average</th><th>Delta</th><th>Source</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>Vacancy Rate</td>
            <td class="${district.vacancyRate >= 20 ? "val-bad" : district.vacancyRate >= 10 ? "val-warn" : "val-ok"}">${district.vacancyRate}%</td>
            <td>${cityAvg.vacancyRate}%</td>
            <td>${deltaHTML(deltas.vacancyRate, "%")}</td>
            <td>US Census ACS</td>
          </tr>
          <tr>
            <td>Crime Incidents</td>
            <td class="${district.crimeCount > 15 ? "val-bad" : district.crimeCount > 8 ? "val-warn" : "val-ok"}">${district.crimeCount}</td>
            <td>${cityAvg.crimeCount}</td>
            <td>${deltaHTML(district.crimeCount - cityAvg.crimeCount)}</td>
            <td>Montgomery PD</td>
          </tr>
          <tr>
            <td>Community Facilities</td>
            <td>${district.communityFacilities.length}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Montgomery GIS</td>
          </tr>
          <tr>
            <td>Total At-Risk Population</td>
            <td class="val-bad">${subGroups.totalAtRisk.toLocaleString()}</td>
            <td>\u2014</td>
            <td>\u2014</td>
            <td>Computed</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="page-break"></div>

    <!-- ═══════════════════ SECTION 03: RISK MATRIX & VULNERABILITY (p5-6) ═══════════════════ -->
    <div class="sec">
      <div class="sec-num">Section 03</div>
      <h2>Risk Matrix &amp; Vulnerability Analysis</h2>

      <h3>Composite Score Breakdown</h3>
      <p>
        The HEATDEBT vulnerability score is a weighted composite of five factors,
        each normalized across all 14 Montgomery census tracts.
      </p>
      <table class="report-table">
        <thead><tr>
          <th>Factor</th><th>Weight</th><th>Raw Value</th><th>Normalized (0\u20131)</th><th>Weighted Score</th>
        </tr></thead>
        <tbody>
          ${scoreBreakdown
            .map(
              (c) => `<tr>
            <td>${esc(c.factor)}</td>
            <td>${(c.weight * 100).toFixed(0)}%</td>
            <td>${c.factor.includes("Temperature") ? c.rawValue + "\u00B0F" : c.rawValue.toFixed(1) + "%"}</td>
            <td>${c.normalized.toFixed(3)}</td>
            <td class="${c.weighted >= 20 ? "val-bad" : c.weighted >= 10 ? "val-warn" : "val-ok"}">${c.weighted}</td>
          </tr>`,
            )
            .join("\n")}
          <tr style="background:var(--light);font-weight:700;">
            <td colspan="4" style="text-align:right;">Total Composite Score</td>
            <td class="${district.heatScore >= 75 ? "val-bad" : "val-warn"}">${scoreTotal}</td>
          </tr>
        </tbody>
      </table>

      <h3>Cross-Layer Correlation Matrix</h3>
      <p>Pearson correlation coefficients between key urban heat factors in Montgomery census tracts.</p>
      <table class="corr-table">
        <thead>
          <tr>
            <th></th>
            ${corrMatrix.labels.map((l) => `<th>${esc(l)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${corrMatrix.labels
            .map(
              (label, i) =>
                `<tr>
              <td style="background:var(--ink);color:#fff;font-weight:600;text-align:left;padding-left:8px;">${esc(label)}</td>
              ${corrMatrix.cells[i]
                .map(
                  (cell) =>
                    `<td class="corr-${cell.strength}">${cell.value}</td>`,
                )
                .join("")}
            </tr>`,
            )
            .join("\n")}
        </tbody>
      </table>

      <h3>Vulnerability by Sub-Group</h3>
      <table class="report-table">
        <thead><tr>
          <th>Sub-Group</th><th>Estimated Count</th><th>% of Population</th><th>Risk Level</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>Elderly (65+)</td>
            <td>${subGroups.elderly.toLocaleString()}</td>
            <td>16.0%</td>
            <td><span class="sev-badge sev-high">HIGH</span></td>
          </tr>
          <tr>
            <td>Children Under 5</td>
            <td>${subGroups.childrenUnder5.toLocaleString()}</td>
            <td>6.5%</td>
            <td><span class="sev-badge sev-high">HIGH</span></td>
          </tr>
          <tr>
            <td>No-A/C Households</td>
            <td>${subGroups.noAcHouseholds.toLocaleString()}</td>
            <td>${((subGroups.noAcHouseholds / Math.max(district.population, 1)) * 100).toFixed(1)}%</td>
            <td><span class="sev-badge sev-critical">CRITICAL</span></td>
          </tr>
          <tr>
            <td>Below Poverty + No A/C</td>
            <td>${subGroups.belowPovertyNoAc.toLocaleString()}</td>
            <td>${((subGroups.belowPovertyNoAc / Math.max(district.population, 1)) * 100).toFixed(1)}%</td>
            <td><span class="sev-badge sev-critical">CRITICAL</span></td>
          </tr>
          <tr style="background:var(--light);font-weight:600;">
            <td>Total At-Risk</td>
            <td>${subGroups.totalAtRisk.toLocaleString()}</td>
            <td>${((subGroups.totalAtRisk / Math.max(district.population, 1)) * 100).toFixed(1)}%</td>
            <td>\u2014</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="page-break"></div>

    <!-- 14-Tract Comparison -->
    <div class="sec">
      <h3>14-Tract Comparison Table</h3>
      <p>All Montgomery census tracts ranked by HEATDEBT vulnerability score.</p>
      <table class="report-table">
        <thead><tr>
          <th>#</th><th>Neighborhood</th><th>Heat Score</th><th>Poverty</th><th>Tree Cover</th><th>A/C Access</th><th>Vacancy</th>
        </tr></thead>
        <tbody>
          ${sorted
            .map(
              (d, i) =>
                `<tr class="${d.id === district.id ? "current-row" : ""}">
              <td>${i + 1}</td>
              <td>${d.id === district.id ? `<strong>${esc(d.name)}</strong>` : esc(d.name)}</td>
              <td class="${d.heatScore >= 75 ? "val-bad" : d.heatScore >= 50 ? "val-warn" : "val-ok"}">${d.heatScore}</td>
              <td class="${d.povertyRate >= 40 ? "val-bad" : d.povertyRate >= 20 ? "val-warn" : ""}">${d.povertyRate}%</td>
              <td class="${d.treeCanopyPct < 10 ? "val-bad" : d.treeCanopyPct < 20 ? "val-warn" : ""}">${d.treeCanopyPct}%</td>
              <td class="${d.acAccessPercentage < 60 ? "val-bad" : d.acAccessPercentage < 75 ? "val-warn" : ""}">${d.acAccessPercentage}%</td>
              <td class="${d.vacancyRate >= 20 ? "val-bad" : d.vacancyRate >= 10 ? "val-warn" : ""}">${d.vacancyRate}%</td>
            </tr>`,
            )
            .join("\n")}
        </tbody>
      </table>

      ${
        aiSummary?.keyFindings
          ? `<h3>AI Key Findings</h3>
          <ul style="margin:16px 0;padding-left:20px;">
            ${aiSummary.keyFindings.map((f) => `<li style="margin-bottom:8px;color:#3A3A4A;font-size:14px;line-height:1.7;">${esc(f)}</li>`).join("\n")}
          </ul>`
          : ""
      }
    </div>
    <div class="page-break"></div>

    <!-- ═══════════════════ SECTION 04: CROSS-LAYER CORRELATIONS (p7-8) ═══════════════════ -->
    <div class="sec">
      <div class="sec-num">Section 04</div>
      <h2>Cross-Layer Correlations</h2>
      <p>
        Analysis of how multiple vulnerability factors interact and compound heat risk
        in ${esc(district.name)}.
      </p>

      ${narratives
        .map(
          (n) => `
        <div class="corr-block" style="border-left-color:${n.color};">
          <h4>${esc(n.title)}</h4>
          <p>${esc(n.text)}</p>
        </div>`,
        )
        .join("\n")}

      <h3>Problem Summary Matrix</h3>
      <table class="report-table">
        <thead><tr>
          <th>Problem</th><th>Indicator</th><th>District</th><th>City Avg</th><th>Delta</th><th>Severity</th>
        </tr></thead>
        <tbody>
          ${problemMatrix
            .map(
              (row) => `<tr>
            <td><strong>${esc(row.problem)}</strong></td>
            <td>${esc(row.indicator)}</td>
            <td>${esc(row.districtValue)}</td>
            <td>${esc(row.cityAvg)}</td>
            <td>${esc(row.delta)}</td>
            <td><span class="sev-badge sev-${row.severity}">${row.severity.toUpperCase()}</span></td>
          </tr>`,
            )
            .join("\n")}
        </tbody>
      </table>
    </div>
    <div class="page-break"></div>

    <!-- ═══════════════════ SECTION 05: RECOMMENDATIONS & GRANT STRATEGY (p9-14) ═══════════════════ -->
    <div class="sec">
      <div class="sec-num">Section 05</div>
      <h2>Recommendations &amp; Grant Strategy</h2>

      <!-- Ranked Interventions -->
      <h3>Ranked Interventions</h3>
      ${
        aiSummary?.recommendations
          ? (() => {
              const priorities = ["priority-1", "priority-2", "priority-3"];
              const prClasses = ["pr1", "pr2", "pr3"];
              const prLabels = ["Priority 1", "Priority 2", "Priority 3"];
              return aiSummary.recommendations
                .map(
                  (rec, i) => `
                <div class="intervention ${priorities[Math.min(i, 2)]}">
                  <div class="int-header">
                    <div class="int-title">${esc(rec)}</div>
                    <span class="int-priority ${prClasses[Math.min(i, 2)]}">${prLabels[Math.min(i, 2)]}</span>
                  </div>
                </div>`,
                )
                .join("\n");
            })()
          : `<p style="color:var(--mid);font-style:italic;">AI intervention recommendations not available. Generate a Risk Analysis from the dashboard to populate this section.</p>`
      }

      <!-- Cost Estimates Table -->
      <h3>Cost Estimates</h3>
      <table class="report-table">
        <thead><tr>
          <th>Intervention</th><th>Unit Cost</th><th>Quantity</th><th>Total</th>
        </tr></thead>
        <tbody>
          ${costItems
            .map(
              (c) => `<tr>
            <td>${esc(c.intervention)}</td>
            <td>${esc(c.unitCost)}</td>
            <td>${c.quantity.toLocaleString()}</td>
            <td>${formatCurrency(c.total)}</td>
          </tr>`,
            )
            .join("\n")}
          <tr>
            <td colspan="3" style="text-align:right;">Project Management (5%)</td>
            <td>${formatCurrency(pmCost)}</td>
          </tr>
          <tr style="background:var(--ink);color:#fff;font-weight:700;">
            <td colspan="3" style="text-align:right;color:#fff;">TOTAL ESTIMATED COST</td>
            <td style="color:var(--orange);">${formatCurrency(totalCost)}</td>
          </tr>
        </tbody>
      </table>

      <!-- ROI Analysis -->
      <h3>Return on Investment</h3>
      <div class="data-grid cols-3">
        <div class="data-cell">
          <div class="dc-label">Total Investment</div>
          <div class="dc-value">${formatCurrency(roi.totalCost)}</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Hospitalization Costs Avoided</div>
          <div class="dc-value ok">${formatCurrency(roi.hospitalizationAvoided)}</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Total Social Benefit</div>
          <div class="dc-value ok">${formatCurrency(roi.socialCostAvoided)}</div>
        </div>
      </div>
      <p style="margin-top:12px;">
        <strong>Benefit-Cost Ratio: ${roi.benefitCostRatio}x</strong> \u2014
        For every $1 invested, the community avoids an estimated $${roi.benefitCostRatio} in
        heat-related hospitalization and social costs over a 3-year period.
      </p>
    </div>
    <div class="page-break"></div>

    <!-- Implementation Timeline -->
    <div class="sec">
      <h3>Implementation Timeline</h3>
      <table class="report-table">
        <thead><tr>
          <th>Phase</th><th>Activity</th><th>Timeframe</th><th>Responsible</th>
        </tr></thead>
        <tbody>
          ${timeline
            .map(
              (t) => `<tr>
            <td><strong>${esc(t.phase)}</strong></td>
            <td>${esc(t.activity)}</td>
            <td>${esc(t.timeframe)}</td>
            <td>${esc(t.responsible)}</td>
          </tr>`,
            )
            .join("\n")}
        </tbody>
      </table>

      <!-- Featured Grant -->
      <h3>Featured Grant Opportunity</h3>
      ${
        grantReport
          ? `<div class="grant-box">
              <div class="grant-header">
                <div>
                  <div class="grant-name">${esc(grantReport.grantTitle)}</div>
                  <div style="font-size:12px;color:var(--mid);margin-top:4px;">${esc(grantReport.grantSource)}</div>
                </div>
                <div class="grant-amount">${esc(grantReport.grantAmount)}</div>
              </div>
              <div class="grant-meta">
                <div class="grant-meta-item">
                  <div class="gm-label">Application Deadline</div>
                  <div class="gm-value">${esc(grantReport.applicationDeadline)}</div>
                </div>
                <div class="grant-meta-item">
                  <div class="gm-label">Eligible Applicants</div>
                  <div class="gm-value">${esc(grantReport.eligibleApplicants)}</div>
                </div>
              </div>
            </div>
            <div class="narrative">
              <div class="narrative-label">Grant Application Narrative</div>
              ${replaceNarrativeVars(grantReport.narrative, district)
                .split("\n")
                .filter((p) => p.trim())
                .map((p) => `<p class="plain">${esc(p.trim())}</p>`)
                .join("\n")}
            </div>`
          : `<p style="color:var(--mid);font-style:italic;">Grant recommendations require AI analysis. Generate a Risk Analysis from the dashboard to populate this section.</p>`
      }
    </div>
    <div class="page-break"></div>

    <!-- Additional Grants Database -->
    <div class="sec">
      <h3>Grant Database</h3>
      <p>Additional federal, state, and utility grants applicable to heat equity interventions in Montgomery, AL.</p>
      <table class="report-table">
        <thead><tr>
          <th>Grant Program</th><th>Source</th><th>Amount</th><th>Deadline</th><th>Match Req.</th>
        </tr></thead>
        <tbody>
          ${grants
            .map(
              (g) => `<tr>
            <td><strong>${esc(g.name)}</strong></td>
            <td>${esc(g.source)}</td>
            <td>${esc(g.amount)}</td>
            <td>${esc(g.deadline)}</td>
            <td>${esc(g.match)}</td>
          </tr>`,
            )
            .join("\n")}
        </tbody>
      </table>

      <!-- Community Resources -->
      <h3>Community Resources</h3>
      ${
        district.communityFacilities.length > 0
          ? `<div style="margin-bottom:16px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--orange);margin-bottom:8px;">Community Facilities</div>
              <ul style="list-style:none;padding:0;">
                ${district.communityFacilities.map((f) => `<li style="padding:8px 16px;border-left:3px solid var(--teal);margin-bottom:6px;background:var(--light);font-size:13px;">${esc(f)}</li>`).join("\n")}
              </ul>
            </div>`
          : ""
      }
      ${
        district.nearbyFacilities.length > 0
          ? `<div style="margin-bottom:16px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--orange);margin-bottom:8px;">Nearby Facilities</div>
              <ul style="list-style:none;padding:0;">
                ${district.nearbyFacilities
                  .slice(0, 8)
                  .map(
                    (f) =>
                      `<li style="padding:8px 16px;border-left:3px solid var(--teal);margin-bottom:6px;background:var(--light);font-size:13px;"><strong>${esc(f.name)}</strong>${f.type ? ` \u2014 ${esc(f.type)}` : ""}${f.address ? `<br><span style="color:var(--mid);font-size:12px;">${esc(f.address)}</span>` : ""}</li>`,
                  )
                  .join("\n")}
              </ul>
            </div>`
          : ""
      }
      ${
        district.violationsCount > 0 || district.crimeCount > 0
          ? `<div class="data-grid cols-2">
              ${district.violationsCount > 0 ? `<div class="data-cell"><div class="dc-label">Code Violations</div><div class="dc-value ${district.violationsCount > 10 ? "hot" : "warn"}">${district.violationsCount}</div><div class="dc-sub">within census tract</div></div>` : ""}
              ${district.crimeCount > 0 ? `<div class="data-cell"><div class="dc-label">Safety Incidents</div><div class="dc-value ${district.crimeCount > 15 ? "hot" : "warn"}">${district.crimeCount}</div><div class="dc-sub">within census tract</div></div>` : ""}
            </div>`
          : ""
      }

      <!-- Next Steps -->
      <h3>Next Steps for City Council</h3>
      <div style="margin:16px 0;">
        <div class="next-step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Review & Approve</strong> \u2014 Present this report to the Montgomery City Council for review and budget allocation approval.</div>
        </div>
        <div class="next-step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Stakeholder Engagement</strong> \u2014 Conduct community meetings in ${esc(district.name)} to gather resident input and build support.</div>
        </div>
        <div class="next-step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Grant Applications</strong> \u2014 Submit applications to EPA EJCPS and FEMA BRIC programs within their respective deadlines.</div>
        </div>
        <div class="next-step">
          <div class="step-num">4</div>
          <div class="step-text"><strong>Emergency Cooling</strong> \u2014 Launch A/C distribution program targeting ${subGroups.noAcHouseholds.toLocaleString()} households without cooling access.</div>
        </div>
        <div class="next-step">
          <div class="step-num">5</div>
          <div class="step-text"><strong>Infrastructure Investment</strong> \u2014 Begin cool pavement and tree planting programs per the implementation timeline above.</div>
        </div>
        <div class="next-step">
          <div class="step-num">6</div>
          <div class="step-text"><strong>Monitor & Report</strong> \u2014 Use the HEATDEBT platform for ongoing monitoring; publish annual progress reports to the community.</div>
        </div>
      </div>
    </div>

  </div>

  <!-- ═══════════════════ FOOTER ═══════════════════ -->
  <div class="report-footer">
    <div class="brand">HEATDEBT</div>
    <div class="sources">
      Data Sources: Open-Meteo Weather API &middot; US Census American Community Survey &middot;
      National Weather Service &middot; Montgomery ArcGIS Open Data &middot; EPA AirNow<br>
      Report ID: ${esc(reportId)} &middot; Generated ${date}
    </div>
    <div class="disclaimer">
      AI-generated content powered by Google Gemini. Cost estimates are preliminary projections
      for planning purposes only and do not constitute financial commitments. Correlation values
      are derived from aggregate Montgomery census tract analysis. All data should be verified
      before policy implementation.
    </div>
  </div>

</div>
</body>
</html>`;
}

/** Loading page shown while AI data is being fetched */
function buildLoadingHTML(districtName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>HEATDEBT Report \u2014 Generating...</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap');
  body {
    font-family: 'DM Sans', sans-serif;
    background: #1A1A2A;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
  }
  .loader {
    text-align: center;
  }
  .spinner {
    width: 48px; height: 48px;
    border: 4px solid rgba(255,255,255,0.15);
    border-top-color: #E67E22;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 24px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  h1 { font-size: 24px; margin-bottom: 8px; }
  p { color: rgba(255,255,255,0.5); font-size: 14px; }
</style>
</head>
<body>
<div class="loader">
  <div class="spinner"></div>
  <h1>Generating Report</h1>
  <p>${districtName} \u2014 Fetching AI analysis...</p>
</div>
</body>
</html>`;
}

export type ReportFormat = "pdf" | "docx";

/**
 * Generate a premium full report for a district.
 * PDF: Opens a new window with styled HTML + print dialog.
 * DOCX: Downloads a formatted Word document.
 */
export async function generateFullReport(
  district: District,
  allDistricts: District[],
  format: ReportFormat = "pdf",
): Promise<void> {
  let reportWindow: Window | null = null;
  if (format === "pdf") {
    reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Please allow popups for this site to generate reports.");
      return;
    }
    reportWindow.document.write(buildLoadingHTML(district.name));
    reportWindow.document.close();
  }

  const input = toDistrictInput(district);

  const [summaryResult, grantResult] = await Promise.allSettled([
    handleGenerateDistrictSummary(input),
    handleGenerateReport(input),
  ]);

  const aiSummary =
    summaryResult.status === "fulfilled"
      ? (summaryResult.value.summary ?? null)
      : null;
  const grantReport =
    grantResult.status === "fulfilled"
      ? (grantResult.value.summary ?? null)
      : null;

  if (format === "docx") {
    const { generateDocxReport } = await import("./docx-report");
    await generateDocxReport(district, allDistricts, aiSummary, grantReport);
    return;
  }

  const html = buildReportHTML(district, allDistricts, aiSummary, grantReport);
  reportWindow!.document.open();
  reportWindow!.document.write(html);
  reportWindow!.document.close();

  setTimeout(() => {
    reportWindow!.print();
  }, 1500);
}
