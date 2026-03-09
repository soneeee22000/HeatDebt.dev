/**
 * Premium DOCX report generator for HEATDEBT district analysis.
 * Mirrors the 5-section PDF structure for a 14-page Word document:
 * Cover + TOC, Overview, Dashboard, Risk Matrix, Correlations, Recommendations.
 */

import type { District } from "@/lib/district-data";
import type { DistrictSummaryOutput } from "@/ai/flows/generate-district-summary-flow";
import type { GenerateGrantReportSummaryOutput } from "@/ai/flows/generate-grant-report-summary-flow";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
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

/* ─── Color Constants ────────────────────────────────────────────────── */

const COLOR_RED = "C0392B";
const COLOR_ORANGE = "E67E22";
const COLOR_INK = "1A1A2A";
const COLOR_TEAL = "0D6E6E";
const COLOR_MID = "5A5A72";
const COLOR_WHITE = "FFFFFF";
const COLOR_LIGHT_BG = "F4F3EF";
const COLOR_RULE = "D8D6CE";
const COLOR_GOLD = "B8860B";

/* ─── Shared Border Styles ───────────────────────────────────────────── */

const THIN_BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLOR_RULE,
};

const TABLE_BORDERS = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
  insideHorizontal: THIN_BORDER,
  insideVertical: THIN_BORDER,
};

/* ─── Utility Helpers ────────────────────────────────────────────────── */

/**
 * Replace template placeholders in the grant narrative with actual data.
 */
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

/**
 * Format the current date in a professional report style.
 */
function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Determine color based on the district heat score.
 */
function riskColor(score: number): string {
  if (score >= 75) return COLOR_RED;
  if (score >= 50) return COLOR_ORANGE;
  if (score >= 25) return COLOR_ORANGE;
  return COLOR_TEAL;
}

/**
 * Build a blank paragraph used as a spacer.
 */
function spacer(size = 200): Paragraph {
  return new Paragraph({ spacing: { after: size } });
}

/**
 * Build a section number label (e.g. "SECTION 01").
 */
function sectionNumber(num: string): Paragraph {
  return new Paragraph({
    spacing: { before: 100, after: 60 },
    children: [
      new TextRun({
        text: `SECTION ${num}`,
        font: "Calibri",
        size: 18,
        bold: true,
        color: COLOR_ORANGE,
        characterSpacing: 120,
      }),
    ],
  });
}

/**
 * Build a section title paragraph.
 */
function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text,
        font: "Cambria",
        size: 36,
        bold: true,
        color: COLOR_INK,
      }),
    ],
  });
}

/**
 * Build a sub-heading paragraph.
 */
function subHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text,
        font: "Cambria",
        size: 28,
        bold: true,
        color: COLOR_INK,
      }),
    ],
  });
}

/**
 * Build a body text paragraph.
 */
function bodyText(text: string, spacing = 160): Paragraph {
  return new Paragraph({
    spacing: { after: spacing },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 22,
        color: "3A3A4A",
      }),
    ],
  });
}

/**
 * Build a bullet point paragraph.
 */
function bulletPoint(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 22,
        color: "3A3A4A",
      }),
    ],
  });
}

/**
 * Build a layer header label.
 */
function layerHeader(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    shading: {
      type: ShadingType.SOLID,
      color: COLOR_INK,
      fill: COLOR_INK,
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: "Calibri",
        size: 18,
        bold: true,
        color: COLOR_ORANGE,
        characterSpacing: 80,
      }),
    ],
  });
}

/**
 * Create a shaded header cell for tables.
 */
function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    shading: {
      type: ShadingType.SOLID,
      color: COLOR_INK,
      fill: COLOR_INK,
    },
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: text.toUpperCase(),
            font: "Calibri",
            size: 18,
            bold: true,
            color: COLOR_WHITE,
            characterSpacing: 60,
          }),
        ],
      }),
    ],
  });
}

/**
 * Create a simple text-only cell for tables.
 */
function simpleCell(
  text: string,
  bold = false,
  color = COLOR_INK,
  shading?: string,
): TableCell {
  return new TableCell({
    shading: shading
      ? { type: ShadingType.SOLID, color: shading, fill: shading }
      : undefined,
    margins: {
      top: 60,
      bottom: 60,
      left: 100,
      right: 100,
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            font: "Calibri",
            size: 20,
            bold,
            color,
          }),
        ],
      }),
    ],
  });
}

/**
 * Create a left-aligned text cell.
 */
function leftCell(
  text: string,
  bold = false,
  color = COLOR_INK,
  shading?: string,
): TableCell {
  return new TableCell({
    shading: shading
      ? { type: ShadingType.SOLID, color: shading, fill: shading }
      : undefined,
    margins: {
      top: 60,
      bottom: 60,
      left: 100,
      right: 100,
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: "Calibri",
            size: 20,
            bold,
            color,
          }),
        ],
      }),
    ],
  });
}

/**
 * Create a data cell with label and large value.
 */
function dataCell(
  label: string,
  value: string,
  sub: string,
  valueColor = COLOR_INK,
  highlight = false,
): TableCell {
  return new TableCell({
    shading: highlight
      ? { type: ShadingType.SOLID, color: "FFF5F5", fill: "FFF5F5" }
      : { type: ShadingType.SOLID, color: COLOR_WHITE, fill: COLOR_WHITE },
    margins: {
      top: 80,
      bottom: 80,
      left: 100,
      right: 100,
    },
    children: [
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: label,
            font: "Calibri",
            size: 17,
            color: COLOR_MID,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: value,
            font: "Calibri",
            size: 28,
            bold: true,
            color: valueColor,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 30 },
        children: [
          new TextRun({
            text: sub,
            font: "Calibri",
            size: 16,
            color: COLOR_MID,
          }),
        ],
      }),
    ],
  });
}

/**
 * Build a 5-column data row for the dashboard tables.
 */
function dashboardRow(
  indicator: string,
  districtVal: string,
  cityAvgVal: string,
  delta: string,
  source: string,
  valColor?: string,
  altBg = false,
): TableRow {
  return new TableRow({
    children: [
      leftCell(indicator, false, COLOR_INK, altBg ? COLOR_LIGHT_BG : undefined),
      simpleCell(
        districtVal,
        true,
        valColor ?? COLOR_INK,
        altBg ? COLOR_LIGHT_BG : undefined,
      ),
      simpleCell(
        cityAvgVal,
        false,
        COLOR_MID,
        altBg ? COLOR_LIGHT_BG : undefined,
      ),
      simpleCell(delta, false, COLOR_INK, altBg ? COLOR_LIGHT_BG : undefined),
      leftCell(source, false, COLOR_MID, altBg ? COLOR_LIGHT_BG : undefined),
    ],
  });
}

/* ─── Section Builders ───────────────────────────────────────────────── */

/**
 * Build the cover page with TOC.
 */
function buildCoverWithTOC(district: District, reportId: string): Paragraph[] {
  const date = formatDate();
  const badgeColor = riskColor(district.heatScore);
  const tagline =
    district.heatScore >= 75
      ? "Is Burning."
      : district.heatScore >= 50
        ? "Is Heating Up."
        : "Needs Attention.";

  return [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "CONFIDENTIAL",
          font: "Calibri",
          size: 16,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 100,
        }),
      ],
    }),
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "HEATDEBT",
          font: "Cambria",
          size: 72,
          bold: true,
          color: COLOR_ORANGE,
          characterSpacing: 200,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "DUE DILIGENCE REPORT",
          font: "Calibri",
          size: 22,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 200,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: district.name,
          font: "Cambria",
          size: 56,
          bold: true,
          color: COLOR_INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: tagline,
          font: "Cambria",
          size: 36,
          italics: true,
          color: badgeColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Census Tract ${district.censusTract} \u2022 Montgomery, Alabama`,
          font: "Calibri",
          size: 22,
          color: COLOR_MID,
        }),
      ],
    }),
    spacer(100),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `${district.heatScore}`,
          font: "Cambria",
          size: 64,
          bold: true,
          color: badgeColor,
        }),
        new TextRun({
          text: " / 100",
          font: "Calibri",
          size: 28,
          color: COLOR_MID,
        }),
        new TextRun({
          text: `  \u2022  ${district.riskTier} RISK`,
          font: "Calibri",
          size: 24,
          bold: true,
          color: badgeColor,
        }),
      ],
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${date}  \u2022  ${district.population.toLocaleString()} residents  \u2022  ${district.heatIndex}\u00B0F Heat Index`,
          font: "Calibri",
          size: 20,
          color: COLOR_MID,
        }),
      ],
    }),
    spacer(400),
    // Table of Contents
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "TABLE OF CONTENTS",
          font: "Calibri",
          size: 18,
          bold: true,
          color: COLOR_ORANGE,
          characterSpacing: 120,
        }),
      ],
    }),
    ...[
      "01  District Overview",
      "02  Real-Time Data Dashboard",
      "03  Risk Matrix & Vulnerability Analysis",
      "04  Cross-Layer Correlations",
      "05  Recommendations & Grant Strategy",
    ].map(
      (item) =>
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: item,
              font: "Calibri",
              size: 20,
              color: COLOR_INK,
            }),
          ],
        }),
    ),
    spacer(100),
    new Paragraph({
      children: [
        new TextRun({
          text: `Report ID: ${reportId}`,
          font: "Calibri",
          size: 16,
          color: COLOR_MID,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

/**
 * Build Section 01: District Overview.
 */
function buildSection01Overview(
  district: District,
  allDistricts: District[],
  cityAvg: ReturnType<typeof computeCityAverages>,
  deltas: ReturnType<typeof computeDeltas>,
  aiSummary: DistrictSummaryOutput | null,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    sectionNumber("01"),
    sectionTitle("District Overview"),
    bodyText(
      `${district.name} (Census Tract ${district.censusTract}) is located in ` +
        `Montgomery, Alabama, with a population of ${district.population.toLocaleString()} residents. ` +
        `This neighborhood recorded a heat index of ${district.heatIndex}\u00B0F ` +
        `with a HEATDEBT vulnerability score of ${district.heatScore}/100, ` +
        `placing it in the ${district.riskTier} risk tier.`,
    ),
  ];

  // 4x2 data grid
  const gridTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell("Temperature", 25),
          headerCell("Demographics", 25),
          headerCell("Environment", 25),
          headerCell("Infrastructure", 25),
        ],
      }),
      new TableRow({
        children: [
          dataCell(
            "Heat Index",
            `${district.heatIndex}\u00B0F`,
            `City: ${cityAvg.heatIndex}\u00B0F`,
            COLOR_RED,
            true,
          ),
          dataCell(
            "Poverty Rate",
            `${district.povertyRate}%`,
            `City: ${cityAvg.povertyRate}%`,
            district.povertyRate >= 40
              ? COLOR_RED
              : district.povertyRate >= 20
                ? COLOR_ORANGE
                : COLOR_TEAL,
            true,
          ),
          dataCell(
            "Tree Canopy",
            `${district.treeCanopyPct}%`,
            `City: ${cityAvg.treeCanopyPct}%`,
            district.treeCanopyPct < 10
              ? COLOR_RED
              : district.treeCanopyPct < 20
                ? COLOR_ORANGE
                : COLOR_TEAL,
            true,
          ),
          dataCell(
            "A/C Access",
            `${district.acAccessPercentage}%`,
            `City: ${cityAvg.acAccessPercentage}%`,
            district.acAccessPercentage < 60
              ? COLOR_RED
              : district.acAccessPercentage < 75
                ? COLOR_ORANGE
                : COLOR_TEAL,
            true,
          ),
        ],
      }),
      new TableRow({
        children: [
          dataCell(
            "HEATDEBT Score",
            `${district.heatScore}/100`,
            `City: ${cityAvg.heatScore}`,
            riskColor(district.heatScore),
          ),
          dataCell(
            "Population",
            district.population.toLocaleString(),
            `City Avg: ${cityAvg.population.toLocaleString()}`,
            COLOR_INK,
          ),
          dataCell(
            "Green Space",
            `${district.greenSpacePercentage}%`,
            `City: ${cityAvg.greenSpacePercentage}%`,
            district.greenSpacePercentage < 15 ? COLOR_ORANGE : COLOR_TEAL,
          ),
          dataCell(
            "Vacancy Rate",
            `${district.vacancyRate}%`,
            `City: ${cityAvg.vacancyRate}%`,
            district.vacancyRate >= 20
              ? COLOR_RED
              : district.vacancyRate >= 10
                ? COLOR_ORANGE
                : COLOR_TEAL,
          ),
        ],
      }),
    ],
  });
  elements.push(spacer(100));
  elements.push(gridTable);

  // Critical finding callout
  if (aiSummary) {
    elements.push(spacer(200));
    elements.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "CRITICAL FINDING",
            font: "Calibri",
            size: 18,
            bold: true,
            color: COLOR_RED,
            characterSpacing: 80,
          }),
        ],
      }),
    );
    elements.push(bodyText(aiSummary.riskAssessment));
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 02: Real-Time Data Dashboard.
 */
function buildSection02Dashboard(
  district: District,
  cityAvg: ReturnType<typeof computeCityAverages>,
  deltas: ReturnType<typeof computeDeltas>,
  subGroups: ReturnType<typeof computeSubGroups>,
): (Paragraph | Table)[] {
  const facilityCount =
    district.communityFacilities.length + district.nearbyFacilities.length;
  const fmtD = (v: number, suffix = "") => `${v > 0 ? "+" : ""}${v}${suffix}`;

  const dashHeaders = [
    headerCell("Indicator", 28),
    headerCell("This District", 18),
    headerCell("City Average", 18),
    headerCell("Delta", 18),
    headerCell("Source", 18),
  ];

  const elements: (Paragraph | Table)[] = [
    sectionNumber("02"),
    sectionTitle("Real-Time Data Dashboard"),
    bodyText(
      `Comprehensive data comparison across all monitored indicators for ` +
        `${district.name} versus city-wide averages.`,
    ),
  ];

  // Layer 1: Heat & Temperature
  elements.push(layerHeader("Layer 1: Heat & Temperature"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({ tableHeader: true, children: dashHeaders }),
        dashboardRow(
          "Heat Index",
          `${district.heatIndex}\u00B0F`,
          `${cityAvg.heatIndex}\u00B0F`,
          fmtD(deltas.heatIndex, "\u00B0F"),
          "Open-Meteo",
          COLOR_RED,
        ),
        dashboardRow(
          "HEATDEBT Score",
          `${district.heatScore}/100`,
          `${cityAvg.heatScore}/100`,
          fmtD(deltas.heatScore),
          "Computed",
          riskColor(district.heatScore),
          true,
        ),
        dashboardRow(
          "Heat Risk Level",
          district.heatRisk,
          "\u2014",
          "\u2014",
          "NWS Categories",
        ),
        dashboardRow(
          "Risk Tier",
          district.riskTier,
          "\u2014",
          "\u2014",
          "HEATDEBT Model",
          riskColor(district.heatScore),
          true,
        ),
        dashboardRow(
          "Air Quality",
          district.pollutionRate,
          "\u2014",
          "\u2014",
          "EPA AirNow",
        ),
      ],
    }),
  );

  // Layer 2: Demographics
  elements.push(layerHeader("Layer 2: Demographics & Vulnerability"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Indicator", 28),
            headerCell("This District", 18),
            headerCell("City Average", 18),
            headerCell("Delta", 18),
            headerCell("Source", 18),
          ],
        }),
        dashboardRow(
          "Population",
          district.population.toLocaleString(),
          cityAvg.population.toLocaleString(),
          fmtD(district.population - cityAvg.population),
          "Census ACS",
        ),
        dashboardRow(
          "Poverty Rate",
          `${district.povertyRate}%`,
          `${cityAvg.povertyRate}%`,
          fmtD(deltas.povertyRate, "%"),
          "Census ACS",
          district.povertyRate >= 40 ? COLOR_RED : undefined,
          true,
        ),
        dashboardRow(
          "Elderly (65+)",
          subGroups.elderly.toLocaleString(),
          "\u2014",
          "\u2014",
          "Census est.",
        ),
        dashboardRow(
          "Children Under 5",
          subGroups.childrenUnder5.toLocaleString(),
          "\u2014",
          "\u2014",
          "Census est.",
          undefined,
          true,
        ),
        dashboardRow(
          "No-A/C Households",
          subGroups.noAcHouseholds.toLocaleString(),
          "\u2014",
          "\u2014",
          "Computed",
          COLOR_RED,
        ),
        dashboardRow(
          "Below Poverty + No A/C",
          subGroups.belowPovertyNoAc.toLocaleString(),
          "\u2014",
          "\u2014",
          "Computed",
          COLOR_RED,
          true,
        ),
      ],
    }),
  );

  // Layer 3: Environment
  elements.push(layerHeader("Layer 3: Environment & Infrastructure"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Indicator", 28),
            headerCell("This District", 18),
            headerCell("City Average", 18),
            headerCell("Delta", 18),
            headerCell("Source", 18),
          ],
        }),
        dashboardRow(
          "Tree Canopy",
          `${district.treeCanopyPct}%`,
          `${cityAvg.treeCanopyPct}%`,
          fmtD(deltas.treeCanopyPct, "%"),
          "USDA NLCD",
          district.treeCanopyPct < 10 ? COLOR_RED : undefined,
        ),
        dashboardRow(
          "Green Space",
          `${district.greenSpacePercentage}%`,
          `${cityAvg.greenSpacePercentage}%`,
          fmtD(deltas.greenSpacePercentage, "%"),
          "Montgomery GIS",
          undefined,
          true,
        ),
        dashboardRow(
          "A/C Access",
          `${district.acAccessPercentage}%`,
          `${cityAvg.acAccessPercentage}%`,
          fmtD(deltas.acAccessPercentage, "%"),
          "Census ACS",
          district.acAccessPercentage < 60 ? COLOR_RED : undefined,
        ),
        dashboardRow(
          "Cooling Centers",
          `${facilityCount}`,
          "\u2014",
          "\u2014",
          "ArcGIS",
          undefined,
          true,
        ),
        dashboardRow(
          "Code Violations",
          `${district.violationsCount}`,
          `${cityAvg.violationsCount}`,
          fmtD(district.violationsCount - cityAvg.violationsCount),
          "ArcGIS",
        ),
      ],
    }),
  );

  // Layer 4: Property & Safety
  elements.push(layerHeader("Layer 4: Property & Safety"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Indicator", 28),
            headerCell("This District", 18),
            headerCell("City Average", 18),
            headerCell("Delta", 18),
            headerCell("Source", 18),
          ],
        }),
        dashboardRow(
          "Vacancy Rate",
          `${district.vacancyRate}%`,
          `${cityAvg.vacancyRate}%`,
          fmtD(deltas.vacancyRate, "%"),
          "Census ACS",
          district.vacancyRate >= 20 ? COLOR_RED : undefined,
        ),
        dashboardRow(
          "Crime Incidents",
          `${district.crimeCount}`,
          `${cityAvg.crimeCount}`,
          fmtD(district.crimeCount - cityAvg.crimeCount),
          "Montgomery PD",
          undefined,
          true,
        ),
        dashboardRow(
          "Community Facilities",
          `${district.communityFacilities.length}`,
          "\u2014",
          "\u2014",
          "Montgomery GIS",
        ),
        dashboardRow(
          "Total At-Risk Pop.",
          subGroups.totalAtRisk.toLocaleString(),
          "\u2014",
          "\u2014",
          "Computed",
          COLOR_RED,
          true,
        ),
      ],
    }),
  );

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 03: Risk Matrix & Vulnerability Analysis.
 */
function buildSection03RiskMatrix(
  district: District,
  allDistricts: District[],
  scoreBreakdown: ReturnType<typeof computeScoreBreakdown>,
  subGroups: ReturnType<typeof computeSubGroups>,
  aiSummary: DistrictSummaryOutput | null,
): (Paragraph | Table)[] {
  const sorted = [...allDistricts].sort((a, b) => b.heatScore - a.heatScore);
  const corrMatrix = getCorrelationMatrix();
  const scoreTotal = scoreBreakdown
    .reduce((s, c) => s + c.weighted, 0)
    .toFixed(1);

  const elements: (Paragraph | Table)[] = [
    sectionNumber("03"),
    sectionTitle("Risk Matrix & Vulnerability Analysis"),
  ];

  // Composite Score Breakdown
  elements.push(subHeading("Composite Score Breakdown"));
  elements.push(
    bodyText(
      "The HEATDEBT vulnerability score is a weighted composite of five factors, " +
        "each normalized across all 14 Montgomery census tracts.",
    ),
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Factor", 25),
            headerCell("Weight", 15),
            headerCell("Raw Value", 20),
            headerCell("Normalized", 20),
            headerCell("Weighted", 20),
          ],
        }),
        ...scoreBreakdown.map(
          (c) =>
            new TableRow({
              children: [
                leftCell(c.factor, false, COLOR_INK),
                simpleCell(`${(c.weight * 100).toFixed(0)}%`, false, COLOR_MID),
                simpleCell(
                  c.factor.includes("Temperature")
                    ? `${c.rawValue}\u00B0F`
                    : `${c.rawValue.toFixed(1)}%`,
                  false,
                  COLOR_INK,
                ),
                simpleCell(c.normalized.toFixed(3), false, COLOR_INK),
                simpleCell(
                  `${c.weighted}`,
                  true,
                  c.weighted >= 20
                    ? COLOR_RED
                    : c.weighted >= 10
                      ? COLOR_ORANGE
                      : COLOR_TEAL,
                ),
              ],
            }),
        ),
        new TableRow({
          children: [
            leftCell("Total Composite Score", true, COLOR_INK, COLOR_LIGHT_BG),
            simpleCell("", false, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell("", false, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell("", false, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(
              scoreTotal,
              true,
              riskColor(district.heatScore),
              COLOR_LIGHT_BG,
            ),
          ],
        }),
      ],
    }),
  );

  // Correlation Matrix
  elements.push(subHeading("Cross-Layer Correlation Matrix"));
  elements.push(
    bodyText(
      "Pearson r correlations between key urban heat factors in Montgomery.",
    ),
  );

  const corrRows = corrMatrix.labels.map(
    (label, i) =>
      new TableRow({
        children: [
          leftCell(label, true, COLOR_WHITE, COLOR_INK),
          ...corrMatrix.cells[i].map((cell) => {
            const bg =
              cell.strength === "strong"
                ? "FADBD8"
                : cell.strength === "moderate"
                  ? "FDEBD0"
                  : cell.strength === "weak"
                    ? COLOR_LIGHT_BG
                    : "E8E6DE";
            const clr =
              cell.strength === "strong"
                ? COLOR_RED
                : cell.strength === "moderate"
                  ? COLOR_ORANGE
                  : COLOR_MID;
            return simpleCell(cell.value, cell.strength === "strong", clr, bg);
          }),
        ],
      }),
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("", 17),
            ...corrMatrix.labels.map((l) => headerCell(l)),
          ],
        }),
        ...corrRows,
      ],
    }),
  );

  // Vulnerability by Sub-Group
  elements.push(subHeading("Vulnerability by Sub-Group"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Sub-Group", 30),
            headerCell("Est. Count", 20),
            headerCell("% of Pop.", 20),
            headerCell("Risk", 30),
          ],
        }),
        new TableRow({
          children: [
            leftCell("Elderly (65+)"),
            simpleCell(subGroups.elderly.toLocaleString()),
            simpleCell("16.0%"),
            simpleCell("HIGH", true, COLOR_ORANGE),
          ],
        }),
        new TableRow({
          children: [
            leftCell("Children Under 5"),
            simpleCell(subGroups.childrenUnder5.toLocaleString()),
            simpleCell("6.5%"),
            simpleCell("HIGH", true, COLOR_ORANGE),
          ],
        }),
        new TableRow({
          children: [
            leftCell("No-A/C Households"),
            simpleCell(subGroups.noAcHouseholds.toLocaleString()),
            simpleCell(
              `${((subGroups.noAcHouseholds / Math.max(district.population, 1)) * 100).toFixed(1)}%`,
            ),
            simpleCell("CRITICAL", true, COLOR_RED),
          ],
        }),
        new TableRow({
          children: [
            leftCell("Below Poverty + No A/C"),
            simpleCell(subGroups.belowPovertyNoAc.toLocaleString()),
            simpleCell(
              `${((subGroups.belowPovertyNoAc / Math.max(district.population, 1)) * 100).toFixed(1)}%`,
            ),
            simpleCell("CRITICAL", true, COLOR_RED),
          ],
        }),
        new TableRow({
          children: [
            leftCell("Total At-Risk", true, COLOR_INK, COLOR_LIGHT_BG),
            simpleCell(
              subGroups.totalAtRisk.toLocaleString(),
              true,
              COLOR_INK,
              COLOR_LIGHT_BG,
            ),
            simpleCell(
              `${((subGroups.totalAtRisk / Math.max(district.population, 1)) * 100).toFixed(1)}%`,
              false,
              COLOR_MID,
              COLOR_LIGHT_BG,
            ),
            simpleCell("\u2014", false, COLOR_MID, COLOR_LIGHT_BG),
          ],
        }),
      ],
    }),
  );

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // 14-Tract Comparison
  elements.push(subHeading("14-Tract Comparison Table"));
  elements.push(
    bodyText(
      "All Montgomery census tracts ranked by HEATDEBT vulnerability score.",
    ),
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("#", 6),
            headerCell("Neighborhood", 24),
            headerCell("Score", 14),
            headerCell("Poverty", 14),
            headerCell("Tree %", 14),
            headerCell("A/C %", 14),
            headerCell("Vacancy", 14),
          ],
        }),
        ...sorted.map(
          (d, i) =>
            new TableRow({
              children: [
                simpleCell(
                  `${i + 1}`,
                  false,
                  COLOR_MID,
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
                leftCell(
                  d.id === district.id ? `${d.name} *` : d.name,
                  d.id === district.id,
                  COLOR_INK,
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
                simpleCell(
                  `${d.heatScore}`,
                  true,
                  riskColor(d.heatScore),
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
                simpleCell(
                  `${d.povertyRate}%`,
                  false,
                  d.povertyRate >= 40 ? COLOR_RED : COLOR_INK,
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
                simpleCell(
                  `${d.treeCanopyPct}%`,
                  false,
                  d.treeCanopyPct < 10 ? COLOR_RED : COLOR_INK,
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
                simpleCell(
                  `${d.acAccessPercentage}%`,
                  false,
                  d.acAccessPercentage < 60 ? COLOR_RED : COLOR_INK,
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
                simpleCell(
                  `${d.vacancyRate}%`,
                  false,
                  d.vacancyRate >= 20 ? COLOR_RED : COLOR_INK,
                  d.id === district.id ? "FFF5F5" : undefined,
                ),
              ],
            }),
        ),
      ],
    }),
  );

  // AI Key Findings
  if (aiSummary?.keyFindings) {
    elements.push(subHeading("AI Key Findings"));
    for (const finding of aiSummary.keyFindings) {
      elements.push(bulletPoint(finding));
    }
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 04: Cross-Layer Correlations.
 */
function buildSection04Correlations(
  district: District,
  cityAvg: ReturnType<typeof computeCityAverages>,
  deltas: ReturnType<typeof computeDeltas>,
  subGroups: ReturnType<typeof computeSubGroups>,
): (Paragraph | Table)[] {
  const narratives = buildCorrelationNarratives(
    district,
    cityAvg,
    deltas,
    subGroups,
  );
  const problemMatrix = buildProblemSummaryMatrix(district, cityAvg, deltas);

  const elements: (Paragraph | Table)[] = [
    sectionNumber("04"),
    sectionTitle("Cross-Layer Correlations"),
    bodyText(
      `Analysis of how multiple vulnerability factors interact and compound heat risk in ${district.name}.`,
    ),
  ];

  // Narrative blocks
  for (const n of narratives) {
    elements.push(
      new Paragraph({
        spacing: { before: 160, after: 40 },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: n.color.replace("#", ""),
          },
        },
        indent: { left: 200 },
        children: [
          new TextRun({
            text: n.title,
            font: "Calibri",
            size: 24,
            bold: true,
            color: COLOR_INK,
          }),
        ],
      }),
    );
    elements.push(
      new Paragraph({
        spacing: { after: 160 },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: n.color.replace("#", ""),
          },
        },
        indent: { left: 200 },
        children: [
          new TextRun({
            text: n.text,
            font: "Calibri",
            size: 20,
            color: "3A3A4A",
          }),
        ],
      }),
    );
  }

  // Problem Summary Matrix
  elements.push(subHeading("Problem Summary Matrix"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Problem", 22),
            headerCell("Indicator", 16),
            headerCell("District", 16),
            headerCell("City Avg", 16),
            headerCell("Delta", 14),
            headerCell("Severity", 16),
          ],
        }),
        ...problemMatrix.map(
          (row) =>
            new TableRow({
              children: [
                leftCell(row.problem, true),
                leftCell(row.indicator),
                simpleCell(row.districtValue),
                simpleCell(row.cityAvg),
                simpleCell(row.delta),
                simpleCell(
                  row.severity.toUpperCase(),
                  true,
                  row.severity === "critical"
                    ? COLOR_RED
                    : row.severity === "high"
                      ? COLOR_ORANGE
                      : row.severity === "moderate"
                        ? COLOR_GOLD
                        : COLOR_TEAL,
                ),
              ],
            }),
        ),
      ],
    }),
  );

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 05: Recommendations & Grant Strategy.
 */
function buildSection05Recommendations(
  district: District,
  allDistricts: District[],
  aiSummary: DistrictSummaryOutput | null,
  grantReport: GenerateGrantReportSummaryOutput | null,
  subGroups: ReturnType<typeof computeSubGroups>,
): (Paragraph | Table)[] {
  const costItems = computeCostEstimates(district, subGroups);
  const subtotal = costItems.reduce((s, c) => s + c.total, 0);
  const pmCost = Math.round(subtotal * 0.05);
  const totalCost = subtotal + pmCost;
  const roi = computeROI(totalCost, district);
  const timeline = getImplementationTimeline();
  const grants = getGrantDatabase();

  const elements: (Paragraph | Table)[] = [
    sectionNumber("05"),
    sectionTitle("Recommendations & Grant Strategy"),
  ];

  // Ranked Interventions
  elements.push(subHeading("Ranked Interventions"));
  if (aiSummary?.recommendations && aiSummary.recommendations.length > 0) {
    const priorityLabels = ["PRIORITY 1", "PRIORITY 2", "PRIORITY 3"];
    const priorityColors = [COLOR_RED, COLOR_ORANGE, COLOR_TEAL];

    for (let i = 0; i < aiSummary.recommendations.length; i++) {
      const rec = aiSummary.recommendations[i];
      const pLabel = priorityLabels[Math.min(i, 2)];
      const pColor = priorityColors[Math.min(i, 2)];

      elements.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: pColor },
          },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: `${pLabel}  `,
              font: "Calibri",
              size: 16,
              bold: true,
              color: pColor,
              characterSpacing: 60,
            }),
          ],
        }),
      );
      elements.push(
        new Paragraph({
          spacing: { after: 120 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: pColor },
          },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: rec,
              font: "Calibri",
              size: 22,
              color: COLOR_INK,
            }),
          ],
        }),
      );
    }
  } else {
    elements.push(
      bodyText(
        "AI intervention recommendations not available. Generate a Risk Analysis from the dashboard.",
      ),
    );
  }

  // Cost Estimates
  elements.push(subHeading("Cost Estimates"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Intervention", 35),
            headerCell("Unit Cost", 20),
            headerCell("Quantity", 20),
            headerCell("Total", 25),
          ],
        }),
        ...costItems.map(
          (c) =>
            new TableRow({
              children: [
                leftCell(c.intervention),
                simpleCell(c.unitCost),
                simpleCell(c.quantity.toLocaleString()),
                simpleCell(formatCurrency(c.total), false, COLOR_INK),
              ],
            }),
        ),
        new TableRow({
          children: [
            leftCell(
              "Project Management (5%)",
              false,
              COLOR_MID,
              COLOR_LIGHT_BG,
            ),
            simpleCell("", false, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell("", false, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(
              formatCurrency(pmCost),
              false,
              COLOR_INK,
              COLOR_LIGHT_BG,
            ),
          ],
        }),
        new TableRow({
          children: [
            leftCell("TOTAL ESTIMATED COST", true, COLOR_WHITE, COLOR_INK),
            simpleCell("", false, COLOR_MID, COLOR_INK),
            simpleCell("", false, COLOR_MID, COLOR_INK),
            simpleCell(
              formatCurrency(totalCost),
              true,
              COLOR_ORANGE,
              COLOR_INK,
            ),
          ],
        }),
      ],
    }),
  );

  // ROI Analysis
  elements.push(subHeading("Return on Investment"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          children: [
            leftCell("Total Investment", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(formatCurrency(roi.totalCost), true, COLOR_INK),
          ],
        }),
        new TableRow({
          children: [
            leftCell(
              "Hospitalization Costs Avoided",
              true,
              COLOR_MID,
              COLOR_LIGHT_BG,
            ),
            simpleCell(
              formatCurrency(roi.hospitalizationAvoided),
              true,
              COLOR_TEAL,
            ),
          ],
        }),
        new TableRow({
          children: [
            leftCell("Total Social Benefit", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(formatCurrency(roi.socialCostAvoided), true, COLOR_TEAL),
          ],
        }),
        new TableRow({
          children: [
            leftCell("Benefit-Cost Ratio", true, COLOR_WHITE, COLOR_INK),
            simpleCell(
              `${roi.benefitCostRatio}x`,
              true,
              COLOR_ORANGE,
              COLOR_INK,
            ),
          ],
        }),
      ],
    }),
  );
  elements.push(
    bodyText(
      `For every $1 invested, the community avoids an estimated $${roi.benefitCostRatio} in ` +
        `heat-related hospitalization and social costs over a 3-year period.`,
    ),
  );

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // Implementation Timeline
  elements.push(subHeading("Implementation Timeline"));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Phase", 15),
            headerCell("Activity", 35),
            headerCell("Timeframe", 25),
            headerCell("Responsible", 25),
          ],
        }),
        ...timeline.map(
          (t) =>
            new TableRow({
              children: [
                simpleCell(t.phase, true, COLOR_ORANGE),
                leftCell(t.activity),
                simpleCell(t.timeframe),
                leftCell(t.responsible, false, COLOR_MID),
              ],
            }),
        ),
      ],
    }),
  );

  // Featured Grant
  elements.push(subHeading("Featured Grant Opportunity"));
  if (grantReport) {
    elements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: TABLE_BORDERS,
        rows: [
          new TableRow({
            children: [
              leftCell("Grant Title", true, COLOR_MID, COLOR_LIGHT_BG),
              leftCell(grantReport.grantTitle, true, COLOR_INK),
            ],
          }),
          new TableRow({
            children: [
              leftCell("Source", true, COLOR_MID, COLOR_LIGHT_BG),
              leftCell(grantReport.grantSource),
            ],
          }),
          new TableRow({
            children: [
              leftCell("Funding Amount", true, COLOR_MID, COLOR_LIGHT_BG),
              leftCell(grantReport.grantAmount, true, COLOR_TEAL),
            ],
          }),
          new TableRow({
            children: [
              leftCell("Deadline", true, COLOR_MID, COLOR_LIGHT_BG),
              leftCell(grantReport.applicationDeadline),
            ],
          }),
          new TableRow({
            children: [
              leftCell("Eligible Applicants", true, COLOR_MID, COLOR_LIGHT_BG),
              leftCell(grantReport.eligibleApplicants),
            ],
          }),
        ],
      }),
    );
    elements.push(spacer(200));

    // Narrative
    elements.push(
      new Paragraph({
        spacing: { after: 60 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_ORANGE },
        },
        children: [
          new TextRun({
            text: "GRANT APPLICATION NARRATIVE",
            font: "Calibri",
            size: 18,
            bold: true,
            color: COLOR_ORANGE,
            characterSpacing: 100,
          }),
        ],
      }),
    );

    const narrativeText = replaceNarrativeVars(grantReport.narrative, district);
    for (const para of narrativeText.split("\n").filter((p) => p.trim())) {
      elements.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: para.trim(),
              font: "Calibri",
              size: 22,
              color: COLOR_INK,
            }),
          ],
        }),
      );
    }
  } else {
    elements.push(
      bodyText(
        "Grant recommendations require AI analysis. Generate a Risk Analysis from the dashboard.",
      ),
    );
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // Grant Database
  elements.push(subHeading("Grant Database"));
  elements.push(
    bodyText(
      "Additional federal, state, and utility grants applicable to heat equity interventions.",
    ),
  );
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Grant", 30),
            headerCell("Source", 25),
            headerCell("Amount", 15),
            headerCell("Deadline", 15),
            headerCell("Match", 15),
          ],
        }),
        ...grants.map(
          (g) =>
            new TableRow({
              children: [
                leftCell(g.name, false, COLOR_INK),
                leftCell(g.source, false, COLOR_MID),
                simpleCell(g.amount, false, COLOR_INK),
                simpleCell(g.deadline, false, COLOR_MID),
                simpleCell(g.match, false, COLOR_MID),
              ],
            }),
        ),
      ],
    }),
  );

  // Community Resources
  elements.push(subHeading("Community Resources"));
  if (district.communityFacilities.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [
          new TextRun({
            text: "COMMUNITY FACILITIES",
            font: "Calibri",
            size: 18,
            bold: true,
            color: COLOR_ORANGE,
            characterSpacing: 80,
          }),
        ],
      }),
    );
    for (const f of district.communityFacilities) {
      elements.push(bulletPoint(f));
    }
  }

  if (district.nearbyFacilities.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: "NEARBY FACILITIES",
            font: "Calibri",
            size: 18,
            bold: true,
            color: COLOR_ORANGE,
            characterSpacing: 80,
          }),
        ],
      }),
    );
    elements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: TABLE_BORDERS,
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              headerCell("Name", 40),
              headerCell("Type", 25),
              headerCell("Address", 35),
            ],
          }),
          ...district.nearbyFacilities.slice(0, 8).map(
            (f) =>
              new TableRow({
                children: [
                  leftCell(f.name),
                  leftCell(
                    f.type.replace("_", " ").toUpperCase(),
                    false,
                    COLOR_MID,
                  ),
                  leftCell(f.address ?? "N/A", false, COLOR_MID),
                ],
              }),
          ),
        ],
      }),
    );
  }

  // Safety indicators
  if (district.violationsCount > 0 || district.crimeCount > 0) {
    elements.push(spacer(100));
    const safetyRows: TableRow[] = [];
    if (district.violationsCount > 0) {
      safetyRows.push(
        new TableRow({
          children: [
            leftCell("Code Violations", true),
            simpleCell(
              `${district.violationsCount}`,
              true,
              district.violationsCount > 10 ? COLOR_RED : COLOR_ORANGE,
            ),
          ],
        }),
      );
    }
    if (district.crimeCount > 0) {
      safetyRows.push(
        new TableRow({
          children: [
            leftCell("Crime Incidents", true),
            simpleCell(
              `${district.crimeCount}`,
              true,
              district.crimeCount > 20 ? COLOR_RED : COLOR_ORANGE,
            ),
          ],
        }),
      );
    }
    elements.push(
      new Table({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: TABLE_BORDERS,
        rows: [
          new TableRow({
            tableHeader: true,
            children: [headerCell("Indicator", 60), headerCell("Count", 40)],
          }),
          ...safetyRows,
        ],
      }),
    );
  }

  // Next Steps
  elements.push(subHeading("Next Steps for City Council"));
  const steps = [
    "Review & Approve \u2014 Present this report to the Montgomery City Council for review and budget allocation.",
    `Stakeholder Engagement \u2014 Conduct community meetings in ${district.name} to gather resident input.`,
    "Grant Applications \u2014 Submit applications to EPA EJCPS and FEMA BRIC programs within deadlines.",
    `Emergency Cooling \u2014 Launch A/C distribution program targeting ${subGroups.noAcHouseholds.toLocaleString()} households.`,
    "Infrastructure Investment \u2014 Begin cool pavement and tree planting per the implementation timeline.",
    "Monitor & Report \u2014 Use the HEATDEBT platform for ongoing monitoring; publish annual progress reports.",
  ];
  for (let i = 0; i < steps.length; i++) {
    elements.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `${i + 1}. `,
            font: "Calibri",
            size: 22,
            bold: true,
            color: COLOR_ORANGE,
          }),
          new TextRun({
            text: steps[i],
            font: "Calibri",
            size: 22,
            color: COLOR_INK,
          }),
        ],
      }),
    );
  }

  return elements;
}

/* ─── Main Export ─────────────────────────────────────────────────────── */

/**
 * Generate and download a premium DOCX report for a HEATDEBT district.
 * 14-page Word document with 5 sections mirroring the PDF structure.
 */
export async function generateDocxReport(
  district: District,
  allDistricts: District[],
  aiSummary: DistrictSummaryOutput | null,
  grantReport: GenerateGrantReportSummaryOutput | null,
): Promise<void> {
  const date = formatDate();
  const reportId = generateReportId(district);
  const cityAvg = computeCityAverages(allDistricts);
  const deltas = computeDeltas(district, cityAvg);
  const scoreBreakdown = computeScoreBreakdown(district, allDistricts);
  const subGroups = computeSubGroups(district);

  const children: (Paragraph | Table)[] = [
    ...buildCoverWithTOC(district, reportId),
    ...buildSection01Overview(
      district,
      allDistricts,
      cityAvg,
      deltas,
      aiSummary,
    ),
    ...buildSection02Dashboard(district, cityAvg, deltas, subGroups),
    ...buildSection03RiskMatrix(
      district,
      allDistricts,
      scoreBreakdown,
      subGroups,
      aiSummary,
    ),
    ...buildSection04Correlations(district, cityAvg, deltas, subGroups),
    ...buildSection05Recommendations(
      district,
      allDistricts,
      aiSummary,
      grantReport,
      subGroups,
    ),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: COLOR_INK,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1200,
              bottom: 1000,
              left: 1200,
            },
          },
        },
        headers: {},
        footers: {
          default: {
            options: {
              children: [
                new Paragraph({
                  border: {
                    top: {
                      style: BorderStyle.SINGLE,
                      size: 1,
                      color: COLOR_RULE,
                    },
                  },
                  spacing: { before: 100 },
                  children: [
                    new TextRun({
                      text: "HEATDEBT",
                      font: "Calibri",
                      size: 16,
                      bold: true,
                      color: COLOR_ORANGE,
                    }),
                    new TextRun({
                      text: `  \u2014  Due Diligence Report  \u2022  ${reportId}`,
                      font: "Calibri",
                      size: 14,
                      color: COLOR_MID,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40 },
                  children: [
                    new TextRun({
                      text: `Data: Open-Meteo | Census ACS | NWS | Montgomery Open Data    \u2022    ${date}`,
                      font: "Calibri",
                      size: 14,
                      color: COLOR_MID,
                    }),
                  ],
                }),
              ],
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = district.name.replace(/[^a-zA-Z0-9]/g, "_");
  saveAs(blob, `HEATDEBT_${safeName}_Report.docx`);
}
