/**
 * GeoJSON FeatureCollection for Montgomery, AL neighborhoods.
 * 14 neighborhoods with census-tract-level heat vulnerability data.
 * Approximate polygon boundaries traced from real geographic coordinates.
 * Each feature includes baseline demographic, infrastructure, and HEATDEBT data.
 */

import type { FeatureCollection, Feature, Polygon } from "geojson";

export interface DistrictProperties {
  id: number;
  name: string;
  population: number;
  greenSpacePercentage: number;
  acAccessPercentage: number;
  pollutionRate: "Low" | "Moderate" | "High";
  communityFacilities: string[];
  identifiedNeeds: string;
  /** Baseline heat index offset from city average (some areas are naturally hotter) */
  heatOffset: number;
  /** Census tract ID */
  censusTract: string;
  /** HEATDEBT vulnerability score (0-100) */
  heatScore: number;
  /** Tree canopy coverage percentage */
  treeCanopyPct: number;
  /** Vacancy rate percentage */
  vacancyRate: number;
  /** Poverty rate percentage */
  povertyRate: number;
  /** Risk tier: CRITICAL, HIGH, MODERATE, LOW */
  riskTier: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
}

export type DistrictFeature = Feature<Polygon, DistrictProperties>;
export type DistrictFeatureCollection = FeatureCollection<
  Polygon,
  DistrictProperties
>;

/**
 * Real Montgomery, AL neighborhoods with approximate polygon boundaries.
 * Coordinates are [longitude, latitude] per GeoJSON spec.
 * 14 districts organized from highest to lowest heat vulnerability.
 */
export const montgomeryDistricts: DistrictFeatureCollection = {
  type: "FeatureCollection",
  features: [
    /* ------------------------------------------------------------------ */
    /* 1. West End / Washington Park — CRITICAL                           */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 1,
        name: "West End / Washington Park",
        population: 3841,
        greenSpacePercentage: 4,
        acAccessPercentage: 69,
        pollutionRate: "High",
        communityFacilities: [
          "Washington Park Community Center",
          "Booker T. Washington Magnet",
        ],
        identifiedNeeds:
          "Emergency cooling infrastructure, urban tree planting corridors, cool pavement coating. HOLC Grade D since 1937 — highest heat burden in the city.",
        heatOffset: 8,
        censusTract: "14.02",
        heatScore: 87,
        treeCanopyPct: 3.8,
        vacancyRate: 34,
        povertyRate: 67.2,
        riskTier: "CRITICAL",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.3498, 32.3751],
            [-86.3398, 32.3771],
            [-86.3298, 32.3701],
            [-86.3298, 32.3601],
            [-86.3398, 32.3531],
            [-86.3498, 32.3581],
            [-86.3498, 32.3751],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 2. Chisholm — CRITICAL                                             */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 2,
        name: "Chisholm",
        population: 4200,
        greenSpacePercentage: 5,
        acAccessPercentage: 72,
        pollutionRate: "High",
        communityFacilities: [
          "Chisholm Community Center",
          "St. Jude Catholic Church",
        ],
        identifiedNeeds:
          "Tree canopy restoration, A/C unit distribution, cooling center expansion.",
        heatOffset: 7,
        censusTract: "11.01",
        heatScore: 82,
        treeCanopyPct: 5.1,
        vacancyRate: 26,
        povertyRate: 52,
        riskTier: "CRITICAL",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.34, 32.36],
            [-86.33, 32.362],
            [-86.32, 32.355],
            [-86.32, 32.345],
            [-86.33, 32.338],
            [-86.34, 32.343],
            [-86.34, 32.36],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 3. North Montgomery — CRITICAL                                     */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 3,
        name: "North Montgomery",
        population: 5100,
        greenSpacePercentage: 6,
        acAccessPercentage: 68,
        pollutionRate: "High",
        communityFacilities: ["Dozier Recreation Center", "Cleveland Ave YMCA"],
        identifiedNeeds:
          "Green space development, heat emergency shelters, public transit to cooling centers.",
        heatOffset: 6,
        censusTract: "03.02",
        heatScore: 79,
        treeCanopyPct: 6.2,
        vacancyRate: 31,
        povertyRate: 45,
        riskTier: "CRITICAL",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.32, 32.412],
            [-86.31, 32.414],
            [-86.3, 32.407],
            [-86.3, 32.394],
            [-86.31, 32.388],
            [-86.32, 32.393],
            [-86.32, 32.412],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 4. Hayneville Road — CRITICAL                                      */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 4,
        name: "Hayneville Road",
        population: 3200,
        greenSpacePercentage: 5,
        acAccessPercentage: 65,
        pollutionRate: "High",
        communityFacilities: ["Hayneville Road Community Center"],
        identifiedNeeds:
          "Flood-resilient cooling infrastructure, elevated emergency shelters, dual heat-flood warning system. FEMA Flood Zone A — compound heat+flood risk.",
        heatOffset: 6,
        censusTract: "16.01",
        heatScore: 76,
        treeCanopyPct: 4.9,
        vacancyRate: 18,
        povertyRate: 48,
        riskTier: "CRITICAL",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.36, 32.355],
            [-86.35, 32.357],
            [-86.34, 32.35],
            [-86.34, 32.338],
            [-86.35, 32.333],
            [-86.36, 32.338],
            [-86.36, 32.355],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 5. Sheridan Heights — HIGH                                         */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 5,
        name: "Sheridan Heights",
        population: 4800,
        greenSpacePercentage: 7,
        acAccessPercentage: 71,
        pollutionRate: "Moderate",
        communityFacilities: [
          "Sheridan Heights Community Center",
          "Senior Activity Center",
        ],
        identifiedNeeds:
          "Elderly heat wellness checks, medical cooling stations, shaded walkways to transit. 28.6% elderly population — highest elderly concentration.",
        heatOffset: 5,
        censusTract: "15.02",
        heatScore: 74,
        treeCanopyPct: 7.3,
        vacancyRate: 12,
        povertyRate: 38,
        riskTier: "HIGH",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.33, 32.365],
            [-86.32, 32.367],
            [-86.31, 32.36],
            [-86.31, 32.348],
            [-86.32, 32.343],
            [-86.33, 32.348],
            [-86.33, 32.365],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 6. South Montgomery — MODERATE                                     */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 6,
        name: "South Montgomery",
        population: 6234,
        greenSpacePercentage: 12,
        acAccessPercentage: 78,
        pollutionRate: "Moderate",
        communityFacilities: [
          "South Montgomery Recreation Center",
          "Carver High School",
        ],
        identifiedNeeds:
          "Expand park shade infrastructure, install misting stations, improve A/C access programs.",
        heatOffset: 3,
        censusTract: "17.01",
        heatScore: 62,
        treeCanopyPct: 12,
        vacancyRate: 21,
        povertyRate: 31,
        riskTier: "MODERATE",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.33, 32.345],
            [-86.32, 32.347],
            [-86.31, 32.34],
            [-86.31, 32.328],
            [-86.32, 32.323],
            [-86.33, 32.328],
            [-86.33, 32.345],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 7. Capitol Heights — MODERATE                                      */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 7,
        name: "Capitol Heights",
        population: 5500,
        greenSpacePercentage: 10,
        acAccessPercentage: 80,
        pollutionRate: "Moderate",
        communityFacilities: [
          "Capitol Heights Community Center",
          "Loveless Academic Magnet Program",
        ],
        identifiedNeeds:
          "Increase tree canopy, provide access to public cooling spaces.",
        heatOffset: 3,
        censusTract: "12.01",
        heatScore: 58,
        treeCanopyPct: 9.8,
        vacancyRate: 18,
        povertyRate: 28,
        riskTier: "MODERATE",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.295, 32.386],
            [-86.285, 32.388],
            [-86.275, 32.381],
            [-86.275, 32.369],
            [-86.285, 32.364],
            [-86.295, 32.369],
            [-86.295, 32.386],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 8. Downtown / Capitol Hill — MODERATE                              */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 8,
        name: "Downtown / Capitol Hill",
        population: 5500,
        greenSpacePercentage: 8,
        acAccessPercentage: 80,
        pollutionRate: "High",
        communityFacilities: [
          "Rosa Parks Museum",
          "Riverfront Park",
          "Montgomery Riverwalk",
          "Civil Rights Memorial Center",
        ],
        identifiedNeeds:
          "Cool pavement technologies, misting stations in high-traffic pedestrian areas. Transit score 78/100, 28 building permits/yr active development area.",
        heatOffset: 2,
        censusTract: "07.01",
        heatScore: 55,
        treeCanopyPct: 8,
        vacancyRate: 10,
        povertyRate: 25,
        riskTier: "MODERATE",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.3177, 32.3892],
            [-86.3077, 32.3912],
            [-86.2977, 32.3842],
            [-86.2977, 32.3722],
            [-86.3077, 32.3672],
            [-86.3177, 32.3722],
            [-86.3177, 32.3892],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 9. Airport / Gunter — MODERATE                                     */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 9,
        name: "Airport / Gunter",
        population: 4500,
        greenSpacePercentage: 11,
        acAccessPercentage: 82,
        pollutionRate: "Moderate",
        communityFacilities: [
          "Gunter Annex Gate",
          "Montgomery Regional Airport",
        ],
        identifiedNeeds:
          "Noise + heat compound mitigation, shade structures for outdoor workers. Adjacent to DoD facilities.",
        heatOffset: 1,
        censusTract: "20.01",
        heatScore: 48,
        treeCanopyPct: 11,
        vacancyRate: 19,
        povertyRate: 22,
        riskTier: "MODERATE",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.37, 32.392],
            [-86.36, 32.394],
            [-86.35, 32.386],
            [-86.35, 32.372],
            [-86.36, 32.367],
            [-86.37, 32.372],
            [-86.37, 32.392],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 10. Maxwell / Near SW — MODERATE                                   */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 10,
        name: "Maxwell / Near SW",
        population: 4000,
        greenSpacePercentage: 17,
        acAccessPercentage: 85,
        pollutionRate: "Moderate",
        communityFacilities: ["Maxwell AFB (adjacent)", "Near SW Park"],
        identifiedNeeds:
          "More shaded public seating, water fountains in parks. Near Maxwell Air Force Base.",
        heatOffset: 0,
        censusTract: "08.01",
        heatScore: 38,
        treeCanopyPct: 16.8,
        vacancyRate: 14,
        povertyRate: 18,
        riskTier: "MODERATE",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.375, 32.381],
            [-86.365, 32.383],
            [-86.355, 32.375],
            [-86.355, 32.362],
            [-86.365, 32.357],
            [-86.375, 32.362],
            [-86.375, 32.381],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 11. Forest Hills — LOW                                             */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 11,
        name: "Forest Hills",
        population: 7800,
        greenSpacePercentage: 25,
        acAccessPercentage: 94,
        pollutionRate: "Low",
        communityFacilities: ["Forest Hills Park", "Eastmont Shopping Area"],
        identifiedNeeds: "Maintain tree canopy, add splash pads for children.",
        heatOffset: -2,
        censusTract: "19.01",
        heatScore: 28,
        treeCanopyPct: 24.8,
        vacancyRate: 5,
        povertyRate: 9,
        riskTier: "LOW",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.27, 32.362],
            [-86.26, 32.364],
            [-86.25, 32.356],
            [-86.25, 32.342],
            [-86.26, 32.337],
            [-86.27, 32.342],
            [-86.27, 32.362],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 12. Old Cloverdale — LOW                                           */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 12,
        name: "Old Cloverdale",
        population: 8500,
        greenSpacePercentage: 28,
        acAccessPercentage: 95,
        pollutionRate: "Low",
        communityFacilities: [
          "Cloverdale Park",
          "Montgomery Museum of Fine Arts",
          "Alabama Shakespeare Festival",
        ],
        identifiedNeeds:
          "Improve walkability and shaded pathways. Historic HOLC Grade B neighborhood.",
        heatOffset: -3,
        censusTract: "13.01",
        heatScore: 24,
        treeCanopyPct: 28.4,
        vacancyRate: 8,
        povertyRate: 8,
        riskTier: "LOW",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.325, 32.367],
            [-86.315, 32.369],
            [-86.305, 32.362],
            [-86.305, 32.348],
            [-86.315, 32.344],
            [-86.325, 32.348],
            [-86.325, 32.367],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 13. Dalraida — LOW                                                 */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 13,
        name: "Dalraida",
        population: 8441,
        greenSpacePercentage: 26,
        acAccessPercentage: 92,
        pollutionRate: "Low",
        communityFacilities: [
          "Dalraida Elementary School",
          "Dalraida Park",
          "Maxwell AFB adjacent",
        ],
        identifiedNeeds:
          "More shaded public seating, water fountains, growing suburban area maintenance.",
        heatOffset: -3,
        censusTract: "18.01",
        heatScore: 22,
        treeCanopyPct: 26.1,
        vacancyRate: 6,
        povertyRate: 10,
        riskTier: "LOW",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.28, 32.417],
            [-86.27, 32.419],
            [-86.26, 32.412],
            [-86.26, 32.398],
            [-86.27, 32.393],
            [-86.28, 32.398],
            [-86.28, 32.417],
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 14. Eastchase — LOW                                                */
    /* ------------------------------------------------------------------ */
    {
      type: "Feature",
      properties: {
        id: 14,
        name: "Eastchase",
        population: 12000,
        greenSpacePercentage: 32,
        acAccessPercentage: 97,
        pollutionRate: "Low",
        communityFacilities: [
          "Eastchase Town Center",
          "The Shoppes at Eastchase",
          "Eastchase Medical Center",
        ],
        identifiedNeeds:
          "Maintain green standards in new development, ensure equitable transit connections. Newest development, highest tree canopy, lowest vulnerability.",
        heatOffset: -4,
        censusTract: "21.03",
        heatScore: 16,
        treeCanopyPct: 32.1,
        vacancyRate: 2,
        povertyRate: 5,
        riskTier: "LOW",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.24, 32.372],
            [-86.23, 32.374],
            [-86.22, 32.366],
            [-86.22, 32.35],
            [-86.23, 32.345],
            [-86.24, 32.35],
            [-86.24, 32.372],
          ],
        ],
      },
    },
  ],
};

/**
 * Get the centroid of a district polygon (simple average of coordinates).
 */
export function getDistrictCentroid(
  feature: DistrictFeature,
): [number, number] {
  const coords = feature.geometry.coordinates[0];
  const len = coords.length - 1; // Last coord duplicates first in GeoJSON
  let latSum = 0;
  let lngSum = 0;

  for (let i = 0; i < len; i++) {
    lngSum += coords[i][0];
    latSum += coords[i][1];
  }

  return [latSum / len, lngSum / len];
}
