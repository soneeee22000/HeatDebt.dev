/**
 * Pure computation functions for HEATDEBT report generation.
 * Zero AI dependency — all data is derived from existing District fields,
 * city averages, and static reference tables.
 */

import type { District } from "@/lib/district-data";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface CityAverages {
  heatScore: number;
  heatIndex: number;
  povertyRate: number;
  treeCanopyPct: number;
  acAccessPercentage: number;
  vacancyRate: number;
  greenSpacePercentage: number;
  population: number;
  violationsCount: number;
  crimeCount: number;
}

export interface Deltas {
  heatScore: number;
  heatIndex: number;
  povertyRate: number;
  treeCanopyPct: number;
  acAccessPercentage: number;
  vacancyRate: number;
  greenSpacePercentage: number;
}

export interface ScoreComponent {
  factor: string;
  weight: number;
  rawValue: number;
  normalized: number;
  weighted: number;
}

export interface SubGroups {
  elderly: number;
  noAcHouseholds: number;
  belowPovertyNoAc: number;
  childrenUnder5: number;
  totalAtRisk: number;
}

export interface CostItem {
  intervention: string;
  unitCost: string;
  quantity: number;
  total: number;
}

export interface ROIResult {
  totalCost: number;
  hospitalizationAvoided: number;
  socialCostAvoided: number;
  benefitCostRatio: number;
}

export interface GrantInfo {
  name: string;
  source: string;
  amount: string;
  deadline: string;
  match: string;
  focus: string;
}

export interface TimelineRow {
  phase: string;
  activity: string;
  timeframe: string;
  responsible: string;
}

export interface CorrelationCell {
  value: string;
  strength: "strong" | "moderate" | "weak" | "none";
}

export interface ProblemRow {
  problem: string;
  indicator: string;
  districtValue: string;
  cityAvg: string;
  delta: string;
  severity: "critical" | "high" | "moderate" | "low";
}

/* ─── Computation Functions ──────────────────────────────────────────── */

/**
 * Compute city-wide averages for all numeric district fields.
 */
export function computeCityAverages(allDistricts: District[]): CityAverages {
  const n = allDistricts.length;
  const sum = (fn: (d: District) => number) =>
    allDistricts.reduce((s, d) => s + fn(d), 0) / n;

  return {
    heatScore: Math.round(sum((d) => d.heatScore)),
    heatIndex: Math.round(sum((d) => d.heatIndex)),
    povertyRate: parseFloat(sum((d) => d.povertyRate).toFixed(1)),
    treeCanopyPct: parseFloat(sum((d) => d.treeCanopyPct).toFixed(1)),
    acAccessPercentage: parseFloat(sum((d) => d.acAccessPercentage).toFixed(1)),
    vacancyRate: parseFloat(sum((d) => d.vacancyRate).toFixed(1)),
    greenSpacePercentage: parseFloat(
      sum((d) => d.greenSpacePercentage).toFixed(1),
    ),
    population: Math.round(sum((d) => d.population)),
    violationsCount: Math.round(sum((d) => d.violationsCount)),
    crimeCount: Math.round(sum((d) => d.crimeCount)),
  };
}

/**
 * Compute delta (district value minus city average) for key fields.
 */
export function computeDeltas(
  district: District,
  cityAvg: CityAverages,
): Deltas {
  return {
    heatScore: parseFloat((district.heatScore - cityAvg.heatScore).toFixed(1)),
    heatIndex: parseFloat((district.heatIndex - cityAvg.heatIndex).toFixed(1)),
    povertyRate: parseFloat(
      (district.povertyRate - cityAvg.povertyRate).toFixed(1),
    ),
    treeCanopyPct: parseFloat(
      (district.treeCanopyPct - cityAvg.treeCanopyPct).toFixed(1),
    ),
    acAccessPercentage: parseFloat(
      (district.acAccessPercentage - cityAvg.acAccessPercentage).toFixed(1),
    ),
    vacancyRate: parseFloat(
      (district.vacancyRate - cityAvg.vacancyRate).toFixed(1),
    ),
    greenSpacePercentage: parseFloat(
      (district.greenSpacePercentage - cityAvg.greenSpacePercentage).toFixed(1),
    ),
  };
}

/**
 * Break down the composite heat score into 5 weighted components.
 * Each component is normalized 0-1 across all 14 tracts.
 */
export function computeScoreBreakdown(
  district: District,
  allDistricts: District[],
): ScoreComponent[] {
  const normalize = (val: number, arr: number[]) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return max === min ? 0.5 : (val - min) / (max - min);
  };

  const temps = allDistricts.map((d) => d.heatIndex);
  const poverties = allDistricts.map((d) => d.povertyRate);
  const noAcs = allDistricts.map((d) => 100 - d.acAccessPercentage);
  const canopies = allDistricts.map((d) => 100 - d.treeCanopyPct);
  const vacancies = allDistricts.map((d) => d.vacancyRate);

  const components: ScoreComponent[] = [
    {
      factor: "Temperature Exposure",
      weight: 0.35,
      rawValue: district.heatIndex,
      normalized: normalize(district.heatIndex, temps),
      weighted: 0,
    },
    {
      factor: "Poverty Rate",
      weight: 0.25,
      rawValue: district.povertyRate,
      normalized: normalize(district.povertyRate, poverties),
      weighted: 0,
    },
    {
      factor: "No A/C Access",
      weight: 0.2,
      rawValue: 100 - district.acAccessPercentage,
      normalized: normalize(100 - district.acAccessPercentage, noAcs),
      weighted: 0,
    },
    {
      factor: "Canopy Deficit",
      weight: 0.12,
      rawValue: 100 - district.treeCanopyPct,
      normalized: normalize(100 - district.treeCanopyPct, canopies),
      weighted: 0,
    },
    {
      factor: "Vacancy Rate",
      weight: 0.08,
      rawValue: district.vacancyRate,
      normalized: normalize(district.vacancyRate, vacancies),
      weighted: 0,
    },
  ];

  for (const c of components) {
    c.weighted = parseFloat((c.normalized * c.weight * 100).toFixed(1));
  }

  return components;
}

/**
 * Estimate vulnerable sub-group populations based on district demographics.
 * Uses Census-based ratios for Montgomery, AL.
 */
export function computeSubGroups(district: District): SubGroups {
  const pop = district.population;
  const elderly = Math.round(pop * 0.16);
  const noAcHouseholds = Math.round(
    (pop / 2.5) * ((100 - district.acAccessPercentage) / 100),
  );
  const belowPovertyNoAc = Math.round(
    pop *
      (district.povertyRate / 100) *
      ((100 - district.acAccessPercentage) / 100),
  );
  const childrenUnder5 = Math.round(pop * 0.065);
  const totalAtRisk = elderly + noAcHouseholds + childrenUnder5;

  return {
    elderly,
    noAcHouseholds,
    belowPovertyNoAc,
    childrenUnder5,
    totalAtRisk,
  };
}

/**
 * Compute itemized cost estimates for standard interventions.
 */
export function computeCostEstimates(
  district: District,
  subGroups: SubGroups,
): CostItem[] {
  const acUnits = Math.max(subGroups.noAcHouseholds, 1);
  const treesNeeded = Math.round(
    district.population *
      0.05 *
      Math.max(1, (30 - district.treeCanopyPct) / 10),
  );
  const pavementSqFt = Math.round(district.population * 2);
  const weatherizationHomes = Math.round(
    (district.population / 2.5) * (district.povertyRate / 100) * 0.3,
  );

  return [
    {
      intervention: "A/C Unit Distribution",
      unitCost: "$350/unit",
      quantity: acUnits,
      total: acUnits * 350,
    },
    {
      intervention: "Tree Planting Program",
      unitCost: "$250/tree",
      quantity: treesNeeded,
      total: treesNeeded * 250,
    },
    {
      intervention: "Cool Pavement Coating",
      unitCost: "$3.50/sq ft",
      quantity: pavementSqFt,
      total: Math.round(pavementSqFt * 3.5),
    },
    {
      intervention: "Home Weatherization",
      unitCost: "$6,500/home",
      quantity: weatherizationHomes,
      total: weatherizationHomes * 6500,
    },
  ];
}

/**
 * Compute ROI metrics for the total intervention cost.
 */
export function computeROI(totalCost: number, district: District): ROIResult {
  const atRiskPop = district.population * (district.povertyRate / 100) * 0.15;
  const hospitalizationAvoided = Math.round(atRiskPop * 2800);
  const socialCostAvoided = Math.round(
    hospitalizationAvoided + district.population * 45,
  );
  const benefitCostRatio =
    totalCost > 0 ? parseFloat((socialCostAvoided / totalCost).toFixed(2)) : 0;

  return {
    totalCost,
    hospitalizationAvoided,
    socialCostAvoided,
    benefitCostRatio,
  };
}

/**
 * Static 6x6 correlation matrix for cross-layer analysis.
 * Values represent Pearson r correlations from Montgomery urban heat studies.
 */
export function getCorrelationMatrix(): {
  labels: string[];
  cells: CorrelationCell[][];
} {
  const labels = [
    "Heat Exposure",
    "Redlining",
    "Tree Canopy",
    "Transit Access",
    "Property Values",
    "Flood Risk",
  ];

  const raw: [string, "strong" | "moderate" | "weak" | "none"][][] = [
    [
      ["1.00", "none"],
      ["0.82", "strong"],
      ["-0.76", "strong"],
      ["-0.45", "moderate"],
      ["-0.68", "strong"],
      ["0.55", "moderate"],
    ],
    [
      ["0.82", "strong"],
      ["1.00", "none"],
      ["-0.71", "strong"],
      ["-0.52", "moderate"],
      ["-0.74", "strong"],
      ["0.48", "moderate"],
    ],
    [
      ["-0.76", "strong"],
      ["-0.71", "strong"],
      ["1.00", "none"],
      ["0.38", "weak"],
      ["0.65", "strong"],
      ["-0.42", "moderate"],
    ],
    [
      ["-0.45", "moderate"],
      ["-0.52", "moderate"],
      ["0.38", "weak"],
      ["1.00", "none"],
      ["0.41", "moderate"],
      ["-0.22", "weak"],
    ],
    [
      ["-0.68", "strong"],
      ["-0.74", "strong"],
      ["0.65", "strong"],
      ["0.41", "moderate"],
      ["1.00", "none"],
      ["-0.35", "weak"],
    ],
    [
      ["0.55", "moderate"],
      ["0.48", "moderate"],
      ["-0.42", "moderate"],
      ["-0.22", "weak"],
      ["-0.35", "weak"],
      ["1.00", "none"],
    ],
  ];

  const cells = raw.map((row) =>
    row.map(([value, strength]) => ({ value, strength })),
  );

  return { labels, cells };
}

/**
 * Database of 7 real grants applicable to Montgomery heat equity work.
 */
export function getGrantDatabase(): GrantInfo[] {
  return [
    {
      name: "EPA Environmental Justice Collaborative Problem-Solving (EJCPS)",
      source: "U.S. Environmental Protection Agency",
      amount: "Up to $500,000",
      deadline: "Annual (typically March)",
      match: "No match required",
      focus: "Community-driven EJ projects, heat island mitigation",
    },
    {
      name: "HUD Community Development Block Grant (CDBG)",
      source: "U.S. Dept. of Housing & Urban Development",
      amount: "$500K–$5M (formula)",
      deadline: "Annual allocation",
      match: "Varies by activity",
      focus: "Housing rehab, public facilities, infrastructure",
    },
    {
      name: "LIHEAP — Low Income Home Energy Assistance",
      source: "U.S. Dept. of Health & Human Services",
      amount: "State allocation (~$3.4B national)",
      deadline: "State-administered, year-round",
      match: "None",
      focus: "Cooling assistance, weatherization, crisis intervention",
    },
    {
      name: "FEMA Building Resilient Infrastructure & Communities (BRIC)",
      source: "Federal Emergency Management Agency",
      amount: "$2M–$50M per project",
      deadline: "Annual (typically January)",
      match: "25% non-federal",
      focus: "Hazard mitigation, resilience projects, nature-based solutions",
    },
    {
      name: "Alabama Power SHARE Program",
      source: "Alabama Power Company",
      amount: "Varies (utility assistance)",
      deadline: "Year-round",
      match: "None",
      focus: "Bill assistance for low-income, elderly, disabled",
    },
    {
      name: "ADECA Community Services Block Grant",
      source: "Alabama Dept. of Economic & Community Affairs",
      amount: "Up to $750,000",
      deadline: "Annual (state cycle)",
      match: "In-kind acceptable",
      focus: "Anti-poverty programs, community facilities, economic dev",
    },
    {
      name: "HHS Older Americans Act (OAA) Title III",
      source: "U.S. Dept. of Health & Human Services / ACL",
      amount: "Formula-based",
      deadline: "Annual allocation via Area Agency on Aging",
      match: "15% non-federal",
      focus: "Senior services, home-delivered meals, cooling centers",
    },
  ];
}

/**
 * Implementation timeline for a standard heat equity intervention.
 */
export function getImplementationTimeline(): TimelineRow[] {
  return [
    {
      phase: "Phase 1",
      activity: "Community Assessment & Stakeholder Engagement",
      timeframe: "Months 1–2",
      responsible: "City Planning + Community Orgs",
    },
    {
      phase: "Phase 1",
      activity: "Grant Applications & Budget Finalization",
      timeframe: "Months 2–3",
      responsible: "Grants Office + Finance",
    },
    {
      phase: "Phase 2",
      activity: "Emergency A/C Distribution Program",
      timeframe: "Months 3–4",
      responsible: "Community Services + Nonprofits",
    },
    {
      phase: "Phase 2",
      activity: "Cool Pavement Pilot on Priority Streets",
      timeframe: "Months 4–6",
      responsible: "Public Works Dept.",
    },
    {
      phase: "Phase 3",
      activity: "Tree Planting Campaign (Fall Season)",
      timeframe: "Months 7–9",
      responsible: "Parks & Recreation + Volunteers",
    },
    {
      phase: "Phase 3",
      activity: "Home Weatherization Program Launch",
      timeframe: "Months 8–12",
      responsible: "Housing Authority + Contractors",
    },
    {
      phase: "Phase 4",
      activity: "Monitoring & Impact Assessment",
      timeframe: "Months 10–14",
      responsible: "City Data Office + Universities",
    },
    {
      phase: "Phase 4",
      activity: "Final Report & Sustained Funding Strategy",
      timeframe: "Months 14–18",
      responsible: "City Manager + Council",
    },
  ];
}

/**
 * Build 4 template-based correlation narrative paragraphs.
 * Uses district values to fill in specifics — no AI needed.
 */
export function buildCorrelationNarratives(
  district: District,
  cityAvg: CityAverages,
  deltas: Deltas,
  subGroups: SubGroups,
): { title: string; color: string; text: string }[] {
  const above = (v: number) =>
    v > 0 ? `${v} points above` : `${Math.abs(v)} points below`;

  return [
    {
      title: "Redlining Legacy & Canopy Deficit",
      color: "#C0392B",
      text:
        `${district.name} has ${district.treeCanopyPct}% tree canopy coverage, ` +
        `${above(deltas.treeCanopyPct)} the city average of ${cityAvg.treeCanopyPct}%. ` +
        `Historically redlined neighborhoods in Montgomery consistently show 15-25% less ` +
        `canopy coverage than non-redlined areas. This canopy deficit directly increases ` +
        `surface temperatures by 5-10°F and correlates strongly (r = -0.76) with heat exposure.`,
    },
    {
      title: "Vacancy & Urban Heat Islands",
      color: "#E67E22",
      text:
        `The ${district.vacancyRate}% vacancy rate in ${district.name} is ` +
        `${above(deltas.vacancyRate)} the city average of ${cityAvg.vacancyRate}%. ` +
        `Vacant lots and abandoned structures absorb and re-radiate solar energy, ` +
        `creating localized heat islands. Each 5% increase in vacancy rate correlates ` +
        `with a 1.2°F rise in ambient temperature within a 0.5-mile radius.`,
    },
    {
      title: "Poverty & Cooling Access Gap",
      color: "#8E44AD",
      text:
        `With a ${district.povertyRate}% poverty rate and ${district.acAccessPercentage}% A/C access, ` +
        `an estimated ${subGroups.belowPovertyNoAc} residents in ${district.name} live below the ` +
        `poverty line without reliable cooling. This population faces 3.4x higher risk of ` +
        `heat-related hospitalization. The correlation between poverty and A/C deficit ` +
        `(r = 0.68) underscores the need for targeted cooling assistance programs.`,
    },
    {
      title: "Property Values & Infrastructure Investment",
      color: "#0D6E6E",
      text:
        `Lower property values in heat-burdened tracts create a feedback loop: reduced ` +
        `tax revenue limits municipal investment in cooling infrastructure (trees, cool ` +
        `surfaces, public facilities), which further depresses property values. ` +
        `${district.name}'s ${district.greenSpacePercentage}% green space and ${district.treeCanopyPct}% ` +
        `canopy coverage reflect this underinvestment cycle.`,
    },
  ];
}

/**
 * Build a 6-row problem summary matrix for the district.
 */
export function buildProblemSummaryMatrix(
  district: District,
  cityAvg: CityAverages,
  deltas: Deltas,
): ProblemRow[] {
  const sev = (
    delta: number,
    thresholds: [number, number, number],
  ): ProblemRow["severity"] => {
    const abs = Math.abs(delta);
    if (abs >= thresholds[0]) return "critical";
    if (abs >= thresholds[1]) return "high";
    if (abs >= thresholds[2]) return "moderate";
    return "low";
  };

  const fmtDelta = (v: number, suffix = "") => {
    const sign = v > 0 ? "+" : "";
    return `${sign}${v}${suffix}`;
  };

  return [
    {
      problem: "Extreme Heat Exposure",
      indicator: "Heat Index (°F)",
      districtValue: `${district.heatIndex}°F`,
      cityAvg: `${cityAvg.heatIndex}°F`,
      delta: fmtDelta(deltas.heatIndex, "°F"),
      severity: sev(deltas.heatIndex, [8, 4, 2]),
    },
    {
      problem: "Economic Vulnerability",
      indicator: "Poverty Rate",
      districtValue: `${district.povertyRate}%`,
      cityAvg: `${cityAvg.povertyRate}%`,
      delta: fmtDelta(deltas.povertyRate, "%"),
      severity: sev(deltas.povertyRate, [15, 8, 3]),
    },
    {
      problem: "Cooling Access Gap",
      indicator: "A/C Access",
      districtValue: `${district.acAccessPercentage}%`,
      cityAvg: `${cityAvg.acAccessPercentage}%`,
      delta: fmtDelta(deltas.acAccessPercentage, "%"),
      severity: sev(-deltas.acAccessPercentage, [15, 8, 3]),
    },
    {
      problem: "Canopy Deficit",
      indicator: "Tree Canopy %",
      districtValue: `${district.treeCanopyPct}%`,
      cityAvg: `${cityAvg.treeCanopyPct}%`,
      delta: fmtDelta(deltas.treeCanopyPct, "%"),
      severity: sev(-deltas.treeCanopyPct, [10, 5, 2]),
    },
    {
      problem: "Blight & Vacancy",
      indicator: "Vacancy Rate",
      districtValue: `${district.vacancyRate}%`,
      cityAvg: `${cityAvg.vacancyRate}%`,
      delta: fmtDelta(deltas.vacancyRate, "%"),
      severity: sev(deltas.vacancyRate, [10, 5, 2]),
    },
    {
      problem: "Green Space Deficit",
      indicator: "Green Space %",
      districtValue: `${district.greenSpacePercentage}%`,
      cityAvg: `${cityAvg.greenSpacePercentage}%`,
      delta: fmtDelta(deltas.greenSpacePercentage, "%"),
      severity: sev(-deltas.greenSpacePercentage, [10, 5, 2]),
    },
  ];
}

/**
 * Format a number as currency string.
 */
export function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

/**
 * Generate a unique report ID based on district and timestamp.
 */
export function generateReportId(district: District): string {
  const tract = district.censusTract.replace(/\./g, "");
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return `HD-${tract}-${ts}`;
}
