/**
 * @fileoverview US Census ACS API client for Montgomery County poverty data.
 *
 * Fetches poverty count and total population per census tract from the
 * 2022 American Community Survey 5-Year Estimates (ACS5) for
 * Montgomery County, Alabama (FIPS state:01, county:101).
 *
 * @see https://www.census.gov/data/developers/data-sets/acs-5year.html
 */

const CENSUS_API_BASE_URL = "https://api.census.gov/data/2022/acs/acs5";
const CENSUS_API_KEY = process.env.CENSUS_API_KEY ?? "";
const MONTGOMERY_STATE_FIPS = "01";
const MONTGOMERY_COUNTY_FIPS = "101";
const REQUEST_TIMEOUT_MS = 8000;

/** Processed census tract data with computed poverty rate. */
export interface CensusTractData {
  /** Census tract identifier (e.g., "000100"). */
  tract: string;
  /** Total population of the tract. */
  population: number;
  /** Number of individuals below the poverty line. */
  povertyCount: number;
  /** Poverty rate as a percentage (0-100). */
  povertyRate: number;
}

/**
 * Raw Census API response shape.
 *
 * The API returns a JSON array of string arrays. The first element is
 * the header row; subsequent elements are data rows with the format:
 * [poverty_count, total_population, state, county, tract].
 */
type CensusApiResponse = string[][];

/**
 * Fetch census poverty data for all tracts in Montgomery County, AL.
 *
 * Retrieves variables B17001_002E (population below poverty level) and
 * B01003_001E (total population) from ACS 2022 5-Year Estimates, then
 * computes a poverty rate for each tract.
 *
 * @returns An array of census tract records, or an empty array on failure.
 */
export async function fetchCensusData(): Promise<CensusTractData[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const params = new URLSearchParams({
    get: "B17001_002E,B01003_001E",
    for: "tract:*",
    in: `state:${MONTGOMERY_STATE_FIPS} county:${MONTGOMERY_COUNTY_FIPS}`,
    key: CENSUS_API_KEY,
  });

  try {
    const response = await fetch(
      `${CENSUS_API_BASE_URL}?${params.toString()}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      console.error(
        `Census API returned ${response.status}: ${response.statusText}`,
      );
      return [];
    }

    const json = (await response.json()) as CensusApiResponse;

    if (!Array.isArray(json) || json.length < 2) {
      console.error("Census API returned unexpected response format");
      return [];
    }

    // Skip the header row (index 0); parse each data row.
    const dataRows = json.slice(1);

    return dataRows
      .map((row): CensusTractData | null => {
        const povertyCount = parseInt(row[0], 10);
        const population = parseInt(row[1], 10);
        const tract = row[4];

        if (isNaN(povertyCount) || isNaN(population) || !tract) {
          return null;
        }

        const povertyRate =
          population > 0
            ? Math.round((povertyCount / population) * 100 * 100) / 100
            : 0;

        return { tract, population, povertyCount, povertyRate };
      })
      .filter((item): item is CensusTractData => item !== null);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Census API request timed out");
    } else {
      console.error("Failed to fetch census data:", error);
    }
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
