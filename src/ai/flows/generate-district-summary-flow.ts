/**
 * Genkit AI flow for generating per-district heat risk analysis summaries.
 * Uses Google Gemini to produce structured risk assessments with
 * actionable recommendations specific to Montgomery, AL.
 */

"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const DistrictSummaryInputSchema = z.object({
  districtName: z.string().describe("The name of the district."),
  heatRiskLevel: z
    .string()
    .describe("Current heat risk level (Low, Medium, High, Very High)."),
  heatIndex: z.number().describe("Current heat index in Fahrenheit."),
  population: z.number().describe("District population."),
  greenSpacePercentage: z
    .number()
    .describe("Percentage of green space coverage."),
  pollutionRate: z
    .string()
    .describe("Air pollution rate (Low, Moderate, High)."),
  acAccessPercentage: z
    .number()
    .describe("Percentage of households with A/C access."),
  communityFacilities: z
    .array(z.string())
    .describe("List of community facilities."),
  identifiedNeeds: z.string().describe("Known needs and challenges."),
  violationsCount: z.number().describe("Number of nearby code violations."),
  crimeCount: z.number().describe("Number of nearby crime incidents."),
});

export type DistrictSummaryInput = z.infer<typeof DistrictSummaryInputSchema>;

const DistrictSummaryOutputSchema = z.object({
  riskAssessment: z
    .string()
    .describe(
      "A 2-3 sentence assessment of the district's overall heat vulnerability.",
    ),
  vulnerabilityScore: z
    .number()
    .describe("A vulnerability score from 0-100 (100 = most vulnerable)."),
  keyFindings: z
    .array(z.string())
    .describe("3-4 specific data-driven findings about this district."),
  recommendations: z
    .array(z.string())
    .describe("3-4 actionable recommendations for city officials."),
  priorityLevel: z
    .string()
    .describe("IMMEDIATE, HIGH, MODERATE, or LOW priority."),
  estimatedBudget: z
    .string()
    .describe(
      "Rough budget range for recommended interventions (e.g., '$50,000 - $200,000').",
    ),
});

export type DistrictSummaryOutput = z.infer<typeof DistrictSummaryOutputSchema>;

const districtSummaryPrompt = ai.definePrompt({
  name: "districtSummaryPrompt",
  input: { schema: DistrictSummaryInputSchema },
  output: { schema: DistrictSummaryOutputSchema },
  prompt: `You are an urban climate resilience analyst for the City of Montgomery, Alabama.
Analyze the following neighborhood data and produce a structured heat vulnerability assessment.

**District Profile:**
- **Name:** {{districtName}}
- **Heat Risk Level:** {{heatRiskLevel}}
- **Heat Index:** {{heatIndex}}°F
- **Population:** {{population}}
- **Green Space:** {{greenSpacePercentage}}%
- **Air Pollution:** {{pollutionRate}}
- **A/C Access:** {{acAccessPercentage}}%
- **Community Facilities:** {{#each communityFacilities}}{{this}}, {{/each}}
- **Code Violations Nearby:** {{violationsCount}}
- **Crime Incidents Nearby:** {{crimeCount}}
- **Identified Needs:** {{identifiedNeeds}}

**Montgomery Context:**
- Montgomery is in central Alabama (Deep South) with extreme summer heat
- The city has significant environmental justice concerns
- Key programs: Office of Violence Prevention, Access Montgomery, Envision Montgomery 2040
- Montgomery's population is ~200,000 with historic racial and economic disparities

**Your Task:**
1. Write a concise risk assessment (2-3 sentences)
2. Calculate a vulnerability score (0-100) based on heat exposure, green space deficit, A/C access gap, and pollution
3. List 3-4 specific, data-driven key findings
4. Provide 3-4 actionable recommendations that reference Montgomery's actual programs and resources
5. Assign a priority level (IMMEDIATE, HIGH, MODERATE, or LOW)
6. Estimate a budget range for the recommended interventions

Be specific, cite the data points provided, and reference Montgomery-specific context.`,
});

const generateDistrictSummaryFlow = ai.defineFlow(
  {
    name: "generateDistrictSummaryFlow",
    inputSchema: DistrictSummaryInputSchema,
    outputSchema: DistrictSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await districtSummaryPrompt(input);
    return output!;
  },
);

export async function generateDistrictSummary(
  input: DistrictSummaryInput,
): Promise<DistrictSummaryOutput> {
  return generateDistrictSummaryFlow(input);
}
