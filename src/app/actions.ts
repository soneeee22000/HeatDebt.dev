/**
 * Server actions for AI-powered report generation.
 */

"use server";

import {
  generateGrantReportSummary,
  type GenerateGrantReportSummaryInput,
  type GenerateGrantReportSummaryOutput,
} from "@/ai/flows/generate-grant-report-summary-flow";
import {
  generateDistrictSummary,
  type DistrictSummaryInput,
  type DistrictSummaryOutput,
} from "@/ai/flows/generate-district-summary-flow";

/** Serializable subset of District data for server actions */
interface DistrictInput {
  name: string;
  heatRisk: string;
  heatIndex: number;
  population: number;
  greenSpacePercentage: number;
  pollutionRate: string;
  acAccessPercentage: number;
  communityFacilities: string[];
  identifiedNeeds: string;
  violationsCount?: number;
  crimeCount?: number;
}

export async function handleGenerateReport(
  district: DistrictInput,
): Promise<{ summary?: GenerateGrantReportSummaryOutput; error?: string }> {
  try {
    const input: GenerateGrantReportSummaryInput = {
      districtName: district.name,
      heatRiskLevel: district.heatRisk,
      currentHeatIndex: `${district.heatIndex}°F`,
      population: district.population,
      greenSpacePercentage: district.greenSpacePercentage,
      pollutionRate: district.pollutionRate,
      acAccessPercentage: district.acAccessPercentage,
      communityFacilities: district.communityFacilities,
      identifiedNeeds: district.identifiedNeeds,
    };
    const summary = await generateGrantReportSummary(input);
    return { summary };
  } catch (error) {
    console.error("Error generating grant report:", error);
    return {
      error: "Failed to generate summary. Please try again later.",
    };
  }
}

export async function handleGenerateDistrictSummary(
  district: DistrictInput,
): Promise<{ summary?: DistrictSummaryOutput; error?: string }> {
  try {
    const input: DistrictSummaryInput = {
      districtName: district.name,
      heatRiskLevel: district.heatRisk,
      heatIndex: district.heatIndex,
      population: district.population,
      greenSpacePercentage: district.greenSpacePercentage,
      pollutionRate: district.pollutionRate,
      acAccessPercentage: district.acAccessPercentage,
      communityFacilities: district.communityFacilities,
      identifiedNeeds: district.identifiedNeeds,
      violationsCount: district.violationsCount ?? 0,
      crimeCount: district.crimeCount ?? 0,
    };
    const summary = await generateDistrictSummary(input);
    return { summary };
  } catch (error) {
    console.error("Error generating district summary:", error);
    return {
      error: "Failed to generate analysis. Please try again later.",
    };
  }
}
