/**
 * Premium DOCX report generator for HEATDEBT district analysis.
 * Uses the `docx` npm package to build a multi-page Word document
 * with professional formatting, tables, and structured sections.
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

/* ─── Color Constants ────────────────────────────────────────────────── */

const COLOR_RED = "C0392B";
const COLOR_ORANGE = "E67E22";
const COLOR_INK = "1A1A2A";
const COLOR_TEAL = "0D6E6E";
const COLOR_MID = "5A5A72";
const COLOR_WHITE = "FFFFFF";
const COLOR_LIGHT_BG = "F4F3EF";
const COLOR_RULE = "D8D6CE";

/* ─── Shared Border Styles ───────────────────────────────────────────── */

const THIN_BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLOR_RULE,
};

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: COLOR_WHITE,
};

const TABLE_BORDERS = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
  insideHorizontal: THIN_BORDER,
  insideVertical: THIN_BORDER,
};

const NO_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER,
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
function riskBadgeColor(score: number): string {
  if (score >= 75) return COLOR_RED;
  if (score >= 50) return COLOR_ORANGE;
  if (score >= 25) return COLOR_ORANGE;
  return COLOR_TEAL;
}

/**
 * Return a risk tier label string for display.
 */
function riskTierLabel(tier: string): string {
  return `${tier} RISK`;
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
 * Build a horizontal rule paragraph (thin line).
 */
function horizontalRule(): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_RULE },
    },
    spacing: { after: 200 },
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
 * Create a standard data cell for tables.
 */
function dataCell(
  label: string,
  value: string,
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
    ],
  });
}

/**
 * Create a simple text-only cell for comparison tables.
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

/* ─── Section Builders ───────────────────────────────────────────────── */

/**
 * Build the cover page section.
 */
function buildCoverPage(district: District): Paragraph[] {
  const date = formatDate();
  const badgeColor = riskBadgeColor(district.heatScore);
  const tagline =
    district.heatScore >= 75
      ? "Is Burning."
      : district.heatScore >= 50
        ? "Is Heating Up."
        : "Needs Attention.";

  return [
    spacer(600),
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
          text: "THERMAL EQUITY REPORT",
          font: "Calibri",
          size: 22,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 200,
        }),
      ],
    }),
    horizontalRule(),
    spacer(200),
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
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "DATE GENERATED",
          font: "Calibri",
          size: 16,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 100,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: date,
          font: "Calibri",
          size: 24,
          color: COLOR_INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "POPULATION",
          font: "Calibri",
          size: 16,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 100,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${district.population.toLocaleString()} residents`,
          font: "Calibri",
          size: 24,
          color: COLOR_INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "RISK TIER",
          font: "Calibri",
          size: 16,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 100,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: riskTierLabel(district.riskTier),
          font: "Calibri",
          size: 28,
          bold: true,
          color: badgeColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "HEATDEBT SCORE",
          font: "Calibri",
          size: 16,
          bold: true,
          color: COLOR_MID,
          characterSpacing: 100,
        }),
      ],
    }),
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
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

/**
 * Build Section 01: The Thermal Reality.
 */
function buildSection01(
  district: District,
  allDistricts: District[],
): (Paragraph | Table)[] {
  const facilityCount =
    district.communityFacilities.length + district.nearbyFacilities.length;

  /* Color coding helpers */
  const povertyColor =
    district.povertyRate >= 40
      ? COLOR_RED
      : district.povertyRate >= 20
        ? COLOR_ORANGE
        : COLOR_TEAL;
  const treeColor =
    district.treeCanopyPct < 10
      ? COLOR_RED
      : district.treeCanopyPct < 20
        ? COLOR_ORANGE
        : COLOR_TEAL;
  const acColor =
    district.acAccessPercentage < 60
      ? COLOR_RED
      : district.acAccessPercentage < 75
        ? COLOR_ORANGE
        : COLOR_TEAL;
  const pollutionColor =
    district.pollutionRate === "High"
      ? COLOR_RED
      : district.pollutionRate === "Moderate"
        ? COLOR_ORANGE
        : COLOR_TEAL;
  const vacancyColor =
    district.vacancyRate >= 20
      ? COLOR_RED
      : district.vacancyRate >= 10
        ? COLOR_ORANGE
        : COLOR_TEAL;
  const greenColor =
    district.greenSpacePercentage < 10
      ? COLOR_RED
      : district.greenSpacePercentage < 20
        ? COLOR_ORANGE
        : COLOR_TEAL;
  const facilityColor =
    facilityCount < 2
      ? COLOR_RED
      : facilityCount < 4
        ? COLOR_ORANGE
        : COLOR_TEAL;

  /* Main data table */
  const dataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell("Temperature", 33),
          headerCell("Demographics", 33),
          headerCell("Infrastructure", 34),
        ],
      }),
      new TableRow({
        children: [
          dataCell(
            "Heat Index",
            `${district.heatIndex}\u00B0F`,
            COLOR_RED,
            true,
          ),
          dataCell(
            "Poverty Rate",
            `${district.povertyRate}%`,
            povertyColor,
            true,
          ),
          dataCell(
            "Tree Canopy",
            `${district.treeCanopyPct}%`,
            treeColor,
            true,
          ),
        ],
      }),
      new TableRow({
        children: [
          dataCell("Air Quality", district.pollutionRate, pollutionColor),
          dataCell(
            "Population",
            district.population.toLocaleString(),
            COLOR_INK,
          ),
          dataCell("A/C Access", `${district.acAccessPercentage}%`, acColor),
        ],
      }),
      new TableRow({
        children: [
          dataCell("Vacancy Rate", `${district.vacancyRate}%`, vacancyColor),
          dataCell(
            "Green Space",
            `${district.greenSpacePercentage}%`,
            greenColor,
          ),
          dataCell("Cooling Centers", `${facilityCount}`, facilityColor),
        ],
      }),
    ],
  });

  /* Comparison table: current district vs lowest-risk, mid-risk, city avg */
  const sorted = [...allDistricts].sort((a, b) => a.heatScore - b.heatScore);
  const lowestRisk = sorted[0];
  const midIndex = Math.floor(sorted.length / 2);
  const midRisk = sorted[midIndex];

  const avgScore = Math.round(
    allDistricts.reduce((s, d) => s + d.heatScore, 0) / allDistricts.length,
  );
  const avgPoverty = (
    allDistricts.reduce((s, d) => s + d.povertyRate, 0) / allDistricts.length
  ).toFixed(1);
  const avgTree = (
    allDistricts.reduce((s, d) => s + d.treeCanopyPct, 0) / allDistricts.length
  ).toFixed(1);
  const avgAC = (
    allDistricts.reduce((s, d) => s + d.acAccessPercentage, 0) /
    allDistricts.length
  ).toFixed(1);

  const comparisonTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell("Neighborhood", 28),
          headerCell("Heat Score", 18),
          headerCell("Poverty", 18),
          headerCell("Tree Cover", 18),
          headerCell("A/C Access", 18),
        ],
      }),
      new TableRow({
        children: [
          simpleCell(district.name, true, COLOR_INK, "FFF5F5"),
          simpleCell(
            `${district.heatScore}/100`,
            true,
            riskBadgeColor(district.heatScore),
            "FFF5F5",
          ),
          simpleCell(`${district.povertyRate}%`, false, COLOR_INK, "FFF5F5"),
          simpleCell(`${district.treeCanopyPct}%`, false, COLOR_INK, "FFF5F5"),
          simpleCell(
            `${district.acAccessPercentage}%`,
            false,
            COLOR_INK,
            "FFF5F5",
          ),
        ],
      }),
      new TableRow({
        children: [
          simpleCell(lowestRisk.name, false, COLOR_TEAL),
          simpleCell(`${lowestRisk.heatScore}/100`, false, COLOR_TEAL),
          simpleCell(`${lowestRisk.povertyRate}%`, false, COLOR_INK),
          simpleCell(`${lowestRisk.treeCanopyPct}%`, false, COLOR_INK),
          simpleCell(`${lowestRisk.acAccessPercentage}%`, false, COLOR_INK),
        ],
      }),
      new TableRow({
        children: [
          simpleCell(midRisk.name, false, COLOR_ORANGE),
          simpleCell(`${midRisk.heatScore}/100`, false, COLOR_ORANGE),
          simpleCell(`${midRisk.povertyRate}%`, false, COLOR_INK),
          simpleCell(`${midRisk.treeCanopyPct}%`, false, COLOR_INK),
          simpleCell(`${midRisk.acAccessPercentage}%`, false, COLOR_INK),
        ],
      }),
      new TableRow({
        children: [
          simpleCell("City Average", true, COLOR_MID, COLOR_LIGHT_BG),
          simpleCell(`${avgScore}/100`, true, COLOR_MID, COLOR_LIGHT_BG),
          simpleCell(`${avgPoverty}%`, false, COLOR_MID, COLOR_LIGHT_BG),
          simpleCell(`${avgTree}%`, false, COLOR_MID, COLOR_LIGHT_BG),
          simpleCell(`${avgAC}%`, false, COLOR_MID, COLOR_LIGHT_BG),
        ],
      }),
    ],
  });

  return [
    sectionNumber("01"),
    sectionTitle("The Thermal Reality"),
    bodyText(
      `This neighborhood recorded a heat index of ${district.heatIndex}\u00B0F ` +
        `with a HEATDEBT vulnerability score of ${district.heatScore}/100. ` +
        `The combination of limited tree canopy (${district.treeCanopyPct}%), ` +
        `high poverty (${district.povertyRate}%), and infrastructure gaps ` +
        `creates compounding thermal risk for its ${district.population.toLocaleString()} residents.`,
    ),
    spacer(100),
    dataTable,
    spacer(300),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "NEIGHBORHOOD COMPARISON",
          font: "Calibri",
          size: 18,
          bold: true,
          color: COLOR_ORANGE,
          characterSpacing: 100,
        }),
      ],
    }),
    comparisonTable,
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

/**
 * Build Section 02: Why This Neighborhood Overheats.
 */
function buildSection02(
  district: District,
  aiSummary: DistrictSummaryOutput | null,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    sectionNumber("02"),
    sectionTitle("Why This Neighborhood Overheats"),
  ];

  if (aiSummary) {
    elements.push(bodyText(aiSummary.riskAssessment));

    /* Vulnerability metrics row */
    const metricsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Vulnerability Score", 25),
            headerCell("Priority Level", 25),
            headerCell("Estimated Budget", 25),
            headerCell("Risk Assessment", 25),
          ],
        }),
        new TableRow({
          children: [
            simpleCell(
              `${aiSummary.vulnerabilityScore}/100`,
              true,
              riskBadgeColor(aiSummary.vulnerabilityScore),
            ),
            simpleCell(
              aiSummary.priorityLevel,
              true,
              aiSummary.priorityLevel === "IMMEDIATE"
                ? COLOR_RED
                : aiSummary.priorityLevel === "HIGH"
                  ? COLOR_ORANGE
                  : COLOR_TEAL,
            ),
            simpleCell(aiSummary.estimatedBudget, true, COLOR_INK),
            simpleCell(
              district.riskTier,
              true,
              riskBadgeColor(district.heatScore),
            ),
          ],
        }),
      ],
    });
    elements.push(spacer(100));
    elements.push(metricsTable);
    elements.push(spacer(200));

    /* Key Findings */
    elements.push(
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "KEY FINDINGS",
            font: "Calibri",
            size: 20,
            bold: true,
            color: COLOR_ORANGE,
            characterSpacing: 80,
          }),
        ],
      }),
    );

    for (const finding of aiSummary.keyFindings) {
      elements.push(bulletPoint(finding));
    }
  } else {
    elements.push(
      bodyText(
        `Based on baseline data, the following needs have been identified for ${district.name}:`,
      ),
    );
    elements.push(spacer(80));
    elements.push(bodyText(district.identifiedNeeds));
    elements.push(spacer(80));
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "AI analysis was not available. This section shows identified needs from baseline data.",
            font: "Calibri",
            size: 20,
            italics: true,
            color: COLOR_MID,
          }),
        ],
      }),
    );
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 03: Recommended Interventions.
 */
function buildSection03(
  aiSummary: DistrictSummaryOutput | null,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    sectionNumber("03"),
    sectionTitle("Recommended Interventions"),
  ];

  if (aiSummary?.recommendations && aiSummary.recommendations.length > 0) {
    elements.push(
      bodyText(
        "The following interventions are recommended based on AI analysis of " +
          "this district's vulnerability profile.",
      ),
    );
    elements.push(spacer(100));

    const priorityLabels = [
      "PRIORITY 1",
      "PRIORITY 2",
      "PRIORITY 3",
      "PRIORITY 4",
    ];
    const priorityColors = [COLOR_RED, COLOR_ORANGE, COLOR_TEAL, COLOR_MID];

    for (let i = 0; i < aiSummary.recommendations.length; i++) {
      const rec = aiSummary.recommendations[i];
      const pLabel = priorityLabels[Math.min(i, priorityLabels.length - 1)];
      const pColor = priorityColors[Math.min(i, priorityColors.length - 1)];

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

    elements.push(spacer(160));

    /* Budget and Priority summary */
    const summaryTable = new Table({
      width: { size: 60, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          children: [
            simpleCell("Estimated Budget", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(aiSummary.estimatedBudget, true, COLOR_INK),
          ],
        }),
        new TableRow({
          children: [
            simpleCell("Priority Level", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(aiSummary.priorityLevel, true, COLOR_RED),
          ],
        }),
      ],
    });
    elements.push(summaryTable);
  } else {
    elements.push(
      bodyText(
        "Intervention recommendations require AI analysis. Generate a Risk " +
          "Analysis from the dashboard to populate this section.",
      ),
    );
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 04: Community Resources & Facilities.
 */
function buildSection04(district: District): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    sectionNumber("04"),
    sectionTitle("Community Resources & Facilities"),
    bodyText(
      `The following community resources and facilities have been identified ` +
        `within and around ${district.name}.`,
    ),
  ];

  /* Community facilities */
  if (district.communityFacilities.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
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
    for (const facility of district.communityFacilities) {
      elements.push(bulletPoint(facility));
    }
  }

  /* Nearby facilities */
  const nearbySlice = district.nearbyFacilities.slice(0, 5);
  if (nearbySlice.length > 0) {
    elements.push(spacer(120));
    elements.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
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

    const facilityRows = nearbySlice.map(
      (f) =>
        new TableRow({
          children: [
            simpleCell(f.name, false, COLOR_INK),
            simpleCell(
              f.type.replace("_", " ").toUpperCase(),
              false,
              COLOR_MID,
            ),
            simpleCell(f.address ?? "N/A", false, COLOR_MID),
          ],
        }),
    );

    const facilityTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            headerCell("Facility Name", 40),
            headerCell("Type", 25),
            headerCell("Address", 35),
          ],
        }),
        ...facilityRows,
      ],
    });
    elements.push(facilityTable);
  }

  /* Violations and crime */
  if (district.violationsCount > 0 || district.crimeCount > 0) {
    elements.push(spacer(200));
    elements.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: "AREA SAFETY INDICATORS",
            font: "Calibri",
            size: 18,
            bold: true,
            color: COLOR_ORANGE,
            characterSpacing: 80,
          }),
        ],
      }),
    );

    const safetyRows: TableRow[] = [];
    if (district.violationsCount > 0) {
      safetyRows.push(
        new TableRow({
          children: [
            simpleCell("Code Violations", true, COLOR_INK),
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
            simpleCell("Crime Incidents (nearby)", true, COLOR_INK),
            simpleCell(
              `${district.crimeCount}`,
              true,
              district.crimeCount > 20 ? COLOR_RED : COLOR_ORANGE,
            ),
          ],
        }),
      );
    }

    const safetyTable = new Table({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: [headerCell("Indicator", 60), headerCell("Count", 40)],
        }),
        ...safetyRows,
      ],
    });
    elements.push(safetyTable);
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

/**
 * Build Section 05: Grant Application Narrative.
 */
function buildSection05(
  district: District,
  grantReport: GenerateGrantReportSummaryOutput | null,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    sectionNumber("05"),
    sectionTitle("Grant Application Narrative"),
  ];

  if (grantReport) {
    elements.push(
      bodyText(
        "Based on this neighborhood's thermal profile, the following federal " +
          "grant has been identified as the strongest match for funding.",
      ),
    );

    /* Grant info table */
    const grantTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          children: [
            simpleCell("Grant Title", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(grantReport.grantTitle, true, COLOR_INK),
          ],
        }),
        new TableRow({
          children: [
            simpleCell("Source", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(grantReport.grantSource, false, COLOR_INK),
          ],
        }),
        new TableRow({
          children: [
            simpleCell("Funding Amount", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(grantReport.grantAmount, true, COLOR_TEAL),
          ],
        }),
        new TableRow({
          children: [
            simpleCell("Application Deadline", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(grantReport.applicationDeadline, false, COLOR_INK),
          ],
        }),
        new TableRow({
          children: [
            simpleCell("Eligible Applicants", true, COLOR_MID, COLOR_LIGHT_BG),
            simpleCell(grantReport.eligibleApplicants, false, COLOR_INK),
          ],
        }),
      ],
    });

    elements.push(spacer(100));
    elements.push(grantTable);
    elements.push(spacer(300));

    /* Narrative label */
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
    elements.push(horizontalRule());

    /* Narrative paragraphs */
    const narrativeText = replaceNarrativeVars(grantReport.narrative, district);
    const paragraphs = narrativeText.split("\n").filter((p) => p.trim());
    for (const para of paragraphs) {
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
        "Grant recommendations require AI analysis. Generate a Grant Report " +
          "from the HEATDEBT dashboard to populate this section.",
      ),
    );
    elements.push(spacer(100));
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text:
              "To generate a grant narrative, select a district on the dashboard " +
              "and click 'Generate Grant Report' in the detail panel.",
            font: "Calibri",
            size: 20,
            italics: true,
            color: COLOR_MID,
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
 *
 * Builds a multi-page Word document with cover page, data tables,
 * AI analysis, recommended interventions, community resources,
 * and grant application narrative. Downloads via file-saver.
 */
export async function generateDocxReport(
  district: District,
  allDistricts: District[],
  aiSummary: DistrictSummaryOutput | null,
  grantReport: GenerateGrantReportSummaryOutput | null,
): Promise<void> {
  const date = formatDate();

  /* Assemble all section children */
  const children: (Paragraph | Table)[] = [
    ...buildCoverPage(district),
    ...buildSection01(district, allDistricts),
    ...buildSection02(district, aiSummary),
    ...buildSection03(aiSummary),
    ...buildSection04(district),
    ...buildSection05(district, grantReport),
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
                      text: "  \u2014  Thermal Equity Intelligence Platform",
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
                      text: `Data: Open-Meteo | US Census ACS | NWS | Montgomery Open Data    \u2022    Generated ${date}`,
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
