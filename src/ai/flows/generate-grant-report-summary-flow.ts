'use server';
/**
 * @fileOverview A Genkit flow for generating a summarized narrative report suitable for grant applications.
 *
 * - generateGrantReportSummary - A function that handles the generation of the grant report summary.
 * - GenerateGrantReportSummaryInput - The input type for the generateGrantReportSummary function.
 * - GenerateGrantReportSummaryOutput - The return type for the generateGrantReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGrantReportSummaryInputSchema = z.object({
  districtName: z.string().describe('The name of the district.'),
  heatRiskLevel: z
    .string()
    .describe('The current heat risk level for the district (e.g., High, Medium, Low).'),
  currentHeatIndex: z.string().describe('The current heat index or perceived temperature.'),
  population: z.number().describe('The population of the district.'),
  greenSpacePercentage: z
    .number()
    .describe('The percentage of green space within the district.'),
  pollutionRate: z.string().describe('The air pollution rate (e.g., Moderate, High, Low).'),
  acAccessPercentage: z
    .number()
    .describe('The percentage of households with access to air conditioning.'),
  communityFacilities: z
    .array(z.string())
    .describe('A list of available community facilities (e.g., cooling centers, parks).'),
  identifiedNeeds: z.string().describe('A summary of identified needs or challenges related to heat.'),
});
export type GenerateGrantReportSummaryInput = z.infer<
  typeof GenerateGrantReportSummaryInputSchema
>;

const GenerateGrantReportSummaryOutputSchema = z.object({
  grantTitle: z.string().describe("The official title of the recommended grant."),
  grantSource: z.string().describe("The source agency or organization for the grant."),
  grantAmount: z.string().describe("The funding amount available for the grant (e.g., 'Up to $1,000,000')."),
  applicationDeadline: z.string().describe("The deadline for the grant application."),
  eligibleApplicants: z.string().describe("A list of eligible applicants for the grant."),
  narrative: z.string().describe("A ready-to-submit grant application narrative. It must be a template with placeholders like [DISTRICT_NAME], [CITY_NAME], [STATE_NAME], [DYNAMIC_YEAR], [HEAT_INDEX_F], [POPULATION], [GREEN_SPACE_PERCENT], and [AC_ACCESS_PERCENT]."),
});
export type GenerateGrantReportSummaryOutput = z.infer<
  typeof GenerateGrantReportSummaryOutputSchema
>;

export async function generateGrantReportSummary(
  input: GenerateGrantReportSummaryInput
): Promise<GenerateGrantReportSummaryOutput> {
  return generateGrantReportSummaryFlow(input);
}

const grantReportPrompt = ai.definePrompt({
  name: 'generateGrantReportSummaryPrompt',
  input: {schema: GenerateGrantReportSummaryInputSchema},
  output: {schema: GenerateGrantReportSummaryOutputSchema},
  prompt: `You are an expert grant writer AI. Based on the provided neighborhood thermal profile, your task is to identify the most suitable federal grant and generate a ready-to-submit application narrative.

The output must be a JSON object that strictly follows the provided schema.

**Neighborhood Profile:**
- **District Name:** {{districtName}}
- **Heat Risk Level:** {{heatRiskLevel}}
- **Current Heat Index:** {{currentHeatIndex}}
- **Population:** {{population}}
- **Green Space:** {{greenSpacePercentage}}%
- **Air Pollution Rate:** {{pollutionRate}}
- **A/C Access:** {{acAccessPercentage}}% of households
- **Identified Needs:** {{identifiedNeeds}}

**Your Task:**

1.  **Identify a Grant:** Find a real, relevant federal grant. For a high heat risk, urban area in Montgomery, Alabama, the "EPA Environmental Justice Collaborative Problem-Solving Grant" is an excellent match. Use this as the target grant.
2.  **Generate Narrative:** Write a compelling, ready-to-submit grant narrative. This narrative should be a template. Use the exact placeholders provided below where specific data points should be inserted. Do not invent data for these placeholders.

**Placeholders to use in the narrative:**
*   \`[DISTRICT_NAME]\`
*   \`[CITY_NAME]\`
*   \`[STATE_NAME]\`
*   \`[DYNAMIC_YEAR]\`
*   \`[HEAT_INDEX_F]\`
*   \`[POPULATION]\`
*   \`[GREEN_SPACE_PERCENT]\`
*   \`[AC_ACCESS_PERCENT]\`

**Example Narrative Snippet:**
"The \`[DISTRICT_NAME]\` neighborhood in \`[CITY_NAME]\`, \`[STATE_NAME]\`, faces a documented environmental justice crisis driven by extreme urban heat inequality. During summer \`[DYNAMIC_YEAR]\`, the neighborhood records an average surface temperature of \`[HEAT_INDEX_F]\`, significantly above the city average. Of the \`[POPULATION]\` residents, many live below the federal poverty line..."

Make sure the full narrative is professional, empathetic, and highlights the key challenges to create a strong case for funding. Fill out all the fields in the output schema, including grant source, amount, deadline, and eligible applicants based on the "EPA Environmental Justice Collaborative Problem-Solving Grant".`,
});

const generateGrantReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateGrantReportSummaryFlow',
    inputSchema: GenerateGrantReportSummaryInputSchema,
    outputSchema: GenerateGrantReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await grantReportPrompt(input);
    return output!;
  }
);
