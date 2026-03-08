/**
 * PDF report generation for HeatAlert district analysis.
 * Uses jsPDF to create a formatted, downloadable report.
 */

"use client";

import { jsPDF } from "jspdf";
import type { District } from "@/lib/district-data";
import type { DistrictSummaryOutput } from "@/ai/flows/generate-district-summary-flow";
import type { GenerateGrantReportSummaryOutput } from "@/ai/flows/generate-grant-report-summary-flow";

/** Brand colors matching the app theme */
const COLORS = {
  primary: [232, 61, 96] as [number, number, number], // #E83D60
  dark: [37, 26, 29] as [number, number, number], // #251A1D
  text: [255, 255, 255] as [number, number, number],
  muted: [160, 160, 160] as [number, number, number],
  accent: [170, 33, 130] as [number, number, number], // #AA2182
};

/**
 * Generate and download a PDF report for a district.
 */
export function generateDistrictPDF(
  district: District,
  aiSummary?: DistrictSummaryOutput | null,
  grantReport?: GenerateGrantReportSummaryOutput | null,
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // --- Header ---
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 42, pageWidth, 3, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("HeatAlert", margin, 18);

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Montgomery, Alabama — District Risk Report", margin, 26);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(district.name, margin, 38);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    pageWidth - margin,
    38,
    { align: "right" },
  );

  y = 55;

  // --- District Overview ---
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DISTRICT OVERVIEW", margin, y);
  y += 8;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const overviewData = [
    ["Heat Risk Level", district.heatRisk],
    ["Heat Index", `${district.heatIndex}°F`],
    ["Population", district.population.toLocaleString()],
    ["Green Space", `${district.greenSpacePercentage}%`],
    ["Air Quality", district.pollutionRate],
    ["A/C Access", `${district.acAccessPercentage}%`],
  ];

  overviewData.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(String(value), margin + 45, y);
    y += 6;
  });

  y += 4;

  // --- Facilities ---
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("COMMUNITY FACILITIES", margin, y);
  y += 7;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  district.communityFacilities.forEach((facility) => {
    doc.text(`• ${facility}`, margin + 4, y);
    y += 5;
  });

  y += 4;

  // --- Identified Needs ---
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IDENTIFIED NEEDS", margin, y);
  y += 7;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const needsLines = doc.splitTextToSize(
    district.identifiedNeeds,
    contentWidth,
  );
  doc.text(needsLines, margin, y);
  y += needsLines.length * 5 + 6;

  // --- AI Risk Analysis (if available) ---
  if (aiSummary) {
    if (y > 220) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(245, 245, 250);
    doc.roundedRect(margin - 2, y - 4, contentWidth + 4, 12, 2, 2, "F");

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AI RISK ANALYSIS", margin, y + 4);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(
      `Vulnerability Score: ${aiSummary.vulnerabilityScore}/100 | Priority: ${aiSummary.priorityLevel} | Budget: ${aiSummary.estimatedBudget}`,
      pageWidth - margin,
      y + 4,
      { align: "right" },
    );
    y += 14;

    // Risk Assessment
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const assessmentLines = doc.splitTextToSize(
      aiSummary.riskAssessment,
      contentWidth,
    );
    doc.text(assessmentLines, margin, y);
    y += assessmentLines.length * 5 + 6;

    // Key Findings
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Key Findings", margin, y);
    y += 6;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    aiSummary.keyFindings.forEach((finding) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      const lines = doc.splitTextToSize(`• ${finding}`, contentWidth - 4);
      doc.text(lines, margin + 4, y);
      y += lines.length * 5 + 2;
    });
    y += 4;

    // Recommendations
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations", margin, y);
    y += 6;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    aiSummary.recommendations.forEach((rec, i) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, contentWidth - 4);
      doc.text(lines, margin + 4, y);
      y += lines.length * 5 + 2;
    });
    y += 6;
  }

  // --- Grant Report (if available) ---
  if (grantReport) {
    if (y > 200) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("GRANT APPLICATION SUMMARY", margin, y);
    y += 8;

    const grantInfo = [
      ["Grant", grantReport.grantTitle],
      ["Source", grantReport.grantSource],
      ["Amount", grantReport.grantAmount],
      ["Deadline", grantReport.applicationDeadline],
      ["Eligible", grantReport.eligibleApplicants],
    ];

    doc.setFontSize(9);
    grantInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(label, margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      const valueLines = doc.splitTextToSize(String(value), contentWidth - 35);
      doc.text(valueLines, margin + 30, y);
      y += valueLines.length * 5 + 2;
    });

    y += 4;

    // Narrative
    const narrative = grantReport.narrative
      .replace(/\[DISTRICT_NAME\]/g, district.name)
      .replace(/\[CITY_NAME\]/g, "Montgomery")
      .replace(/\[STATE_NAME\]/g, "Alabama")
      .replace(/\[DYNAMIC_YEAR\]/g, new Date().getFullYear().toString())
      .replace(/\[HEAT_INDEX_F\]/g, `${district.heatIndex}°F`)
      .replace(/\[POPULATION\]/g, district.population.toLocaleString())
      .replace(/\[GREEN_SPACE_PERCENT\]/g, `${district.greenSpacePercentage}%`)
      .replace(/\[AC_ACCESS_PERCENT\]/g, `${district.acAccessPercentage}%`);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const narrativeLines = doc.splitTextToSize(narrative, contentWidth);

    narrativeLines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 4.5;
    });
  }

  // --- Footer on every page ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 285, pageWidth, 12, "F");
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      "HeatAlert Dashboard — Powered by Google Gemini AI | Data: Montgomery, AL Open Data Portal & NWS",
      margin,
      291,
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 291, {
      align: "right",
    });
  }

  // Download
  const filename = `HeatAlert_${district.name.replace(/\s+/g, "_")}_Report.pdf`;
  doc.save(filename);
}
