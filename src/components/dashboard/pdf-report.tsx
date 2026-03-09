/**
 * Premium HTML report generator for HEATDEBT district analysis.
 * Builds a self-contained HTML document matching the HEATDEBT Report Template,
 * opens it in a new browser window, and triggers print-to-PDF.
 */

"use client";

import type { District } from "@/lib/district-data";
import type { DistrictSummaryOutput } from "@/ai/flows/generate-district-summary-flow";
import type { GenerateGrantReportSummaryOutput } from "@/ai/flows/generate-grant-report-summary-flow";
import {
  handleGenerateDistrictSummary,
  handleGenerateReport,
} from "@/app/actions";

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

/** CSS class for data cell coloring */
function severity(
  value: number,
  thresholds: { hot: number; warn: number },
  inverted = false,
): string {
  if (inverted) {
    return value < thresholds.hot
      ? "hot"
      : value < thresholds.warn
        ? "warn"
        : "ok";
  }
  return value >= thresholds.hot
    ? "hot"
    : value >= thresholds.warn
      ? "warn"
      : "ok";
}

/** Replace template variables in grant narrative */
function replaceNarrativeVars(text: string, d: District): string {
  return text
    .replace(/\[DISTRICT_NAME\]/g, d.name)
    .replace(/\[CITY_NAME\]/g, "Montgomery")
    .replace(/\[STATE_NAME\]/g, "Alabama")
    .replace(/\[DYNAMIC_YEAR\]/g, new Date().getFullYear().toString())
    .replace(/\[HEAT_INDEX_F\]/g, `${d.heatIndex}°F`)
    .replace(/\[POPULATION\]/g, d.population.toLocaleString())
    .replace(/\[GREEN_SPACE_PERCENT\]/g, `${d.greenSpacePercentage}%`)
    .replace(/\[AC_ACCESS_PERCENT\]/g, `${d.acAccessPercentage}%`);
}

/** Escape HTML entities */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a comparison table row */
function buildCompareRow(d: District, isCurrent: boolean): string {
  const cls = (v: number, hot: number, warn: number) =>
    v >= hot ? "val-bad" : v >= warn ? "val-warn" : "val-ok";
  const clsInv = (v: number, hot: number, warn: number) =>
    v < hot ? "val-bad" : v < warn ? "val-warn" : "val-ok";
  return `<tr>
    <td>${isCurrent ? `<strong>${esc(d.name)} (this report)</strong>` : esc(d.name)}</td>
    <td class="${cls(d.heatScore, 75, 50)}">${d.heatScore} / 100</td>
    <td class="${cls(d.povertyRate, 40, 20)}">${d.povertyRate}%</td>
    <td class="${clsInv(d.treeCanopyPct, 10, 20)}">${d.treeCanopyPct}%</td>
    <td class="${clsInv(d.acAccessPercentage, 60, 75)}">${d.acAccessPercentage}%</td>
  </tr>`;
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

  // Build intervention cards from AI recommendations
  let interventionsHTML = "";
  if (aiSummary?.recommendations) {
    const priorities = ["priority-1", "priority-2", "priority-3"];
    const prClasses = ["pr1", "pr2", "pr3"];
    const prLabels = ["Priority 1", "Priority 2", "Priority 3"];
    interventionsHTML = aiSummary.recommendations
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
  }

  // Build grant section
  let grantHTML = "";
  if (grantReport) {
    const narrative = replaceNarrativeVars(grantReport.narrative, district);
    grantHTML = `
    <div class="sec">
      <div class="sec-num">Section 05</div>
      <h2>Recommended Grant &amp; Application Narrative</h2>
      <p>Based on this neighborhood's profile, the following federal grant is the strongest match.</p>
      <div class="grant-box">
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
        ${narrative
          .split("\n")
          .filter((p) => p.trim())
          .map((p) => `<p class="plain">${esc(p.trim())}</p>`)
          .join("\n")}
      </div>
    </div>`;
  }

  // Key findings list
  let findingsHTML = "";
  if (aiSummary?.keyFindings) {
    findingsHTML = `<ul style="margin:16px 0;padding-left:20px;">
      ${aiSummary.keyFindings.map((f) => `<li style="margin-bottom:8px;color:#3A3A4A;font-size:14px;line-height:1.7;">${esc(f)}</li>`).join("\n")}
    </ul>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>HEATDEBT Report — ${esc(district.name)} Census Tract ${esc(district.censusTract)}</title>
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
  .cover::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 30%;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(192,57,43,0.08);
  }
  .cover-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--orange);
    margin-bottom: 20px; position: relative;
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
  .sec p {
    color: #3A3A4A; font-size: 14px; line-height: 1.8;
    margin-bottom: 14px;
  }
  .sec p:last-of-type { margin-bottom: 0; }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    margin: 24px 0;
  }
  .data-cell {
    background: var(--white);
    padding: 18px 20px;
  }
  .data-cell.header-cell {
    background: var(--light);
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--mid);
    padding: 10px 20px;
  }
  .data-cell.highlight { background: #FFF5F5; }
  .dc-label { font-size: 11px; color: var(--mid); margin-bottom: 4px; }
  .dc-value { font-size: 22px; font-weight: 700; color: var(--ink); line-height: 1; }
  .dc-value.hot  { color: var(--red); }
  .dc-value.warn { color: var(--orange); }
  .dc-value.ok   { color: var(--teal); }
  .dc-sub { font-size: 11px; color: var(--mid); margin-top: 3px; }

  .compare-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
  .compare-table th {
    background: var(--ink); color: #fff;
    padding: 10px 16px; text-align: left;
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase;
  }
  .compare-table td {
    padding: 11px 16px; border-bottom: 1px solid var(--rule);
    color: #3A3A4A;
  }
  .compare-table tr:nth-child(even) td { background: var(--light); }
  .compare-table .val-bad  { color: var(--red);    font-weight: 700; }
  .compare-table .val-warn { color: var(--orange); font-weight: 700; }
  .compare-table .val-ok   { color: var(--teal);   font-weight: 600; }

  .facility-list { list-style: none; padding: 0; margin: 16px 0; }
  .facility-list li {
    padding: 8px 16px; border-left: 3px solid var(--teal);
    margin-bottom: 8px; background: var(--light);
    font-size: 13px; color: var(--ink);
  }

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

  .grant-box {
    background: var(--light);
    border: 1px solid var(--rule);
    padding: 28px 32px;
    margin: 20px 0;
  }
  .grant-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .grant-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink); }
  .grant-amount { font-size: 22px; font-weight: 700; color: var(--teal); }
  .grant-meta { display: flex; gap: 24px; margin-bottom: 20px; flex-wrap: wrap; }
  .gm-label { font-size: 10px; color: var(--mid); text-transform: uppercase; letter-spacing: 1px; }
  .gm-value { font-size: 13px; font-weight: 600; color: var(--ink); }

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
    font-family: 'DM Sans', sans-serif;
    font-style: normal; font-size: 14px;
    color: var(--ink); line-height: 1.85;
    margin-bottom: 14px;
  }

  .report-footer {
    background: var(--ink);
    padding: 24px 60px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .report-footer .brand { color: var(--orange); font-weight: 700; font-size: 15px; }
  .report-footer .sources { font-size: 11px; color: rgba(255,255,255,0.4); text-align: right; }

  @media print {
    body { background: white; }
    .page { margin: 0; box-shadow: none; }
    .sec { page-break-inside: avoid; }
  }

  @media(max-width:600px) {
    .cover, .sec { padding-left: 24px; padding-right: 24px; }
    .data-grid { grid-template-columns: 1fr 1fr; }
    .score-ring { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="score-ring" style="border-color:${riskBadgeColor};">
      <div class="score-num" style="color:${riskBadgeColor};">${district.heatScore}</div>
      <div class="score-lbl">/ 100</div>
    </div>
    <div class="cover-eyebrow">HEATDEBT &middot; THERMAL EQUITY REPORT</div>
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
        <div class="meta-label">Data Sources</div>
        <div class="meta-value">Open-Meteo &middot; US Census &middot; NWS</div>
      </div>
    </div>
    <div class="risk-badge" style="background:${riskBadgeColor};">${district.riskTier} Risk Zone</div>
  </div>

  <div class="body">

    <!-- SECTION 1: THE NUMBERS -->
    <div class="sec">
      <div class="sec-num">Section 01</div>
      <h2>The Thermal Reality</h2>
      <p>
        This neighborhood recorded a heat index of <strong>${district.heatIndex}&deg;F</strong>
        with a HEATDEBT vulnerability score of <strong>${district.heatScore}/100</strong>.
        The combination of limited tree canopy, high poverty, and infrastructure gaps
        creates compounding thermal risk for its ${district.population.toLocaleString()} residents.
      </p>

      <div class="data-grid">
        <div class="data-cell header-cell">Temperature</div>
        <div class="data-cell header-cell">Demographics</div>
        <div class="data-cell header-cell">Infrastructure</div>

        <div class="data-cell highlight">
          <div class="dc-label">Heat Index</div>
          <div class="dc-value hot">${district.heatIndex}&deg;F</div>
          <div class="dc-sub">HEATDEBT Score: ${district.heatScore}/100</div>
        </div>
        <div class="data-cell highlight">
          <div class="dc-label">Poverty Rate</div>
          <div class="dc-value ${severity(district.povertyRate, { hot: 40, warn: 20 })}">${district.povertyRate}%</div>
          <div class="dc-sub">of residents</div>
        </div>
        <div class="data-cell highlight">
          <div class="dc-label">Tree Canopy Coverage</div>
          <div class="dc-value ${severity(district.treeCanopyPct, { hot: 10, warn: 20 }, true)}">${district.treeCanopyPct}%</div>
          <div class="dc-sub">of district area</div>
        </div>

        <div class="data-cell">
          <div class="dc-label">Air Quality</div>
          <div class="dc-value ${district.pollutionRate === "High" ? "hot" : district.pollutionRate === "Moderate" ? "warn" : "ok"}">${esc(district.pollutionRate)}</div>
          <div class="dc-sub">pollution level</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Population</div>
          <div class="dc-value">${district.population.toLocaleString()}</div>
          <div class="dc-sub">residents in tract</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">A/C Access</div>
          <div class="dc-value ${severity(district.acAccessPercentage, { hot: 60, warn: 75 }, true)}">${district.acAccessPercentage}%</div>
          <div class="dc-sub">of households</div>
        </div>

        <div class="data-cell">
          <div class="dc-label">Vacancy Rate</div>
          <div class="dc-value ${severity(district.vacancyRate, { hot: 20, warn: 10 })}">${district.vacancyRate}%</div>
          <div class="dc-sub">of properties</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Green Space</div>
          <div class="dc-value ${severity(district.greenSpacePercentage, { hot: 10, warn: 20 }, true)}">${district.greenSpacePercentage}%</div>
          <div class="dc-sub">of district area</div>
        </div>
        <div class="data-cell">
          <div class="dc-label">Cooling Centers</div>
          <div class="dc-value ${severity(facilityCount, { hot: 2, warn: 4 }, true)}">${facilityCount}</div>
          <div class="dc-sub">nearby facilities</div>
        </div>
      </div>

      <!-- Neighborhood comparison -->
      ${(() => {
        const sorted = [...allDistricts].sort(
          (a, b) => a.heatScore - b.heatScore,
        );
        const lowest = sorted[0];
        const mid = sorted[Math.floor(sorted.length / 2)];
        const avgPoverty = Math.round(
          allDistricts.reduce((s, d) => s + d.povertyRate, 0) /
            allDistricts.length,
        );
        const avgTree = Math.round(
          allDistricts.reduce((s, d) => s + d.treeCanopyPct, 0) /
            allDistricts.length,
        );
        const avgAC = Math.round(
          allDistricts.reduce((s, d) => s + d.acAccessPercentage, 0) /
            allDistricts.length,
        );
        return `<table class="compare-table">
          <thead><tr>
            <th>Neighborhood</th><th>Heat Score</th><th>Poverty</th><th>Tree Cover</th><th>A/C Access</th>
          </tr></thead>
          <tbody>
            ${buildCompareRow(district, true)}
            ${mid.id !== district.id ? buildCompareRow(mid, false) : ""}
            ${lowest.id !== district.id && lowest.id !== mid.id ? buildCompareRow(lowest, false) : ""}
            <tr>
              <td>City Average</td>
              <td>${Math.round(allDistricts.reduce((s, d) => s + d.heatScore, 0) / allDistricts.length)} / 100</td>
              <td>${avgPoverty}%</td>
              <td>${avgTree}%</td>
              <td>${avgAC}%</td>
            </tr>
          </tbody>
        </table>`;
      })()}
    </div>

    <!-- SECTION 2: WHY -->
    <div class="sec">
      <div class="sec-num">Section 02</div>
      <h2>Vulnerability Analysis</h2>
      ${
        aiSummary
          ? `<p>${esc(aiSummary.riskAssessment)}</p>
             <p style="font-size:12px;color:var(--mid);margin-top:8px;">
               <strong>Vulnerability Score:</strong> ${aiSummary.vulnerabilityScore}/100 &middot;
               <strong>Priority:</strong> ${esc(aiSummary.priorityLevel)} &middot;
               <strong>Est. Budget:</strong> ${esc(aiSummary.estimatedBudget)}
             </p>
             <h3 style="font-family:'DM Serif Display',serif;font-size:20px;margin:24px 0 12px;">Key Findings</h3>
             ${findingsHTML}`
          : `<p>${esc(district.identifiedNeeds)}</p>
             <p style="font-size:12px;color:var(--mid);font-style:italic;">
               AI analysis was not available. This section shows identified needs from baseline data.
             </p>`
      }
    </div>

    <!-- SECTION 3: INTERVENTIONS -->
    <div class="sec">
      <div class="sec-num">Section 03</div>
      <h2>Recommended Interventions</h2>
      ${
        aiSummary?.recommendations
          ? `<p>The following interventions are recommended based on AI analysis of this district's vulnerability profile.</p>
             ${interventionsHTML}`
          : `<p>Intervention recommendations require AI analysis. Generate a Risk Analysis from the dashboard to populate this section.</p>`
      }
    </div>

    <!-- SECTION 4: COMMUNITY RESOURCES -->
    <div class="sec">
      <div class="sec-num">Section 04</div>
      <h2>Community Resources &amp; Facilities</h2>
      <p>The following community facilities and cooling centers are located within or near this census tract.</p>
      ${
        district.communityFacilities.length > 0
          ? `
        <h3 style="font-family:'DM Serif Display',serif;font-size:18px;margin:20px 0 10px;">Community Facilities</h3>
        <ul class="facility-list">
          ${district.communityFacilities.map((f) => `<li>${esc(f)}</li>`).join("\n")}
        </ul>
      `
          : ""
      }
      ${
        district.nearbyFacilities.length > 0
          ? `
        <h3 style="font-family:'DM Serif Display',serif;font-size:18px;margin:20px 0 10px;">Nearby Facilities</h3>
        <ul class="facility-list">
          ${district.nearbyFacilities
            .slice(0, 8)
            .map(
              (f) =>
                `<li><strong>${esc(f.name)}</strong>${f.type ? ` — ${esc(f.type)}` : ""}${f.address ? `<br><span style="color:var(--mid);font-size:12px;">${esc(f.address)}</span>` : ""}</li>`,
            )
            .join("\n")}
        </ul>
      `
          : ""
      }
      ${
        district.violationsCount > 0 || district.crimeCount > 0
          ? `
        <h3 style="font-family:'DM Serif Display',serif;font-size:18px;margin:20px 0 10px;">Safety Indicators</h3>
        <div class="data-grid" style="grid-template-columns: repeat(2, 1fr);">
          ${
            district.violationsCount > 0
              ? `<div class="data-cell">
            <div class="dc-label">Code Violations</div>
            <div class="dc-value ${severity(district.violationsCount, { hot: 10, warn: 5 })}">${district.violationsCount}</div>
            <div class="dc-sub">within census tract</div>
          </div>`
              : ""
          }
          ${
            district.crimeCount > 0
              ? `<div class="data-cell">
            <div class="dc-label">Safety Incidents</div>
            <div class="dc-value ${severity(district.crimeCount, { hot: 15, warn: 8 })}">${district.crimeCount}</div>
            <div class="dc-sub">within census tract</div>
          </div>`
              : ""
          }
        </div>
      `
          : ""
      }
    </div>

    <!-- SECTION 5: GRANT -->
    ${
      grantHTML ||
      `
    <div class="sec">
      <div class="sec-num">Section 05</div>
      <h2>Grant Application Narrative</h2>
      <p>Grant recommendations require AI analysis. Generate a Risk Analysis from the dashboard to populate this section.</p>
    </div>`
    }

  </div>

  <!-- FOOTER -->
  <div class="report-footer">
    <div>
      <div class="brand">HEATDEBT</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;">Thermal Equity Intelligence Platform</div>
    </div>
    <div class="sources">
      Data: Open-Meteo &middot; US Census ACS &middot; NWS &middot; Montgomery Open Data<br>
      Generated by HEATDEBT &middot; ${date}
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
<title>HEATDEBT Report — Generating...</title>
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
  <p>${districtName} — Fetching AI analysis...</p>
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
  // For PDF: open window SYNCHRONOUSLY (on user click) to avoid popup blockers
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

  // Fetch both AI analyses in parallel — gracefully handle failures
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

  // PDF path
  const html = buildReportHTML(district, allDistricts, aiSummary, grantReport);
  reportWindow!.document.open();
  reportWindow!.document.write(html);
  reportWindow!.document.close();

  setTimeout(() => {
    reportWindow!.print();
  }, 1500);
}
