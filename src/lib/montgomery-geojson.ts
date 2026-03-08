/**
 * GeoJSON FeatureCollection for Montgomery, AL neighborhoods.
 * Approximate polygon boundaries traced from real geographic coordinates.
 * Each feature includes baseline demographic and infrastructure data.
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
}

export type DistrictFeature = Feature<Polygon, DistrictProperties>;
export type DistrictFeatureCollection = FeatureCollection<
  Polygon,
  DistrictProperties
>;

/**
 * Real Montgomery, AL neighborhoods with approximate polygon boundaries.
 * Coordinates are [longitude, latitude] per GeoJSON spec.
 */
export const montgomeryDistricts: DistrictFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        name: "Capitol Heights",
        population: 12500,
        greenSpacePercentage: 15,
        acAccessPercentage: 65,
        pollutionRate: "High",
        communityFacilities: [
          "Capitol Heights Community Center",
          "Loveless Academic Magnet Program",
        ],
        identifiedNeeds:
          "Increase tree canopy and provide access to public cooling spaces. High impervious surface coverage traps heat.",
        heatOffset: 4,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.2875, 32.385],
            [-86.28, 32.385],
            [-86.275, 32.38],
            [-86.275, 32.372],
            [-86.28, 32.368],
            [-86.29, 32.368],
            [-86.295, 32.372],
            [-86.295, 32.38],
            [-86.2875, 32.385],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 2,
        name: "Old Cloverdale",
        population: 8500,
        greenSpacePercentage: 45,
        acAccessPercentage: 95,
        pollutionRate: "Low",
        communityFacilities: [
          "Cloverdale Park",
          "Montgomery Museum of Fine Arts",
          "Alabama Shakespeare Festival (nearby)",
        ],
        identifiedNeeds:
          "Improve walkability and shaded pathways. Already well-vegetated but pedestrian infrastructure needs upgrades.",
        heatOffset: -3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.325, 32.365],
            [-86.31, 32.365],
            [-86.305, 32.36],
            [-86.305, 32.352],
            [-86.31, 32.348],
            [-86.32, 32.348],
            [-86.33, 32.352],
            [-86.33, 32.36],
            [-86.325, 32.365],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 3,
        name: "Downtown",
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
          "Implement cool pavement technologies and misting stations in high-traffic pedestrian areas. Dense urban core with extreme heat island effect.",
        heatOffset: 6,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.315, 32.385],
            [-86.3, 32.385],
            [-86.295, 32.38],
            [-86.295, 32.372],
            [-86.3, 32.368],
            [-86.31, 32.368],
            [-86.32, 32.372],
            [-86.32, 32.38],
            [-86.315, 32.385],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 4,
        name: "Garden District",
        population: 6200,
        greenSpacePercentage: 30,
        acAccessPercentage: 88,
        pollutionRate: "Moderate",
        communityFacilities: [
          "Huntingdon College",
          "Garden District Park",
          "Historic Walking Trails",
        ],
        identifiedNeeds:
          "Expand community garden programs and create shaded rest areas along trails. Mixed residential-commercial with moderate canopy.",
        heatOffset: -1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.325, 32.348],
            [-86.31, 32.348],
            [-86.305, 32.343],
            [-86.305, 32.335],
            [-86.31, 32.33],
            [-86.32, 32.33],
            [-86.33, 32.335],
            [-86.33, 32.343],
            [-86.325, 32.348],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 5,
        name: "Eastwood",
        population: 25000,
        greenSpacePercentage: 20,
        acAccessPercentage: 75,
        pollutionRate: "Moderate",
        communityFacilities: [
          "Eastdale Mall area",
          "Vaughn Road Churches",
          "Eastwood Medical Center",
        ],
        identifiedNeeds:
          "Establish a dedicated cooling center and improve public transit routes. Large commercial corridors generate significant heat.",
        heatOffset: 3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.265, 32.385],
            [-86.248, 32.385],
            [-86.243, 32.38],
            [-86.243, 32.368],
            [-86.248, 32.362],
            [-86.26, 32.362],
            [-86.27, 32.368],
            [-86.27, 32.378],
            [-86.265, 32.385],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 6,
        name: "Dalraida",
        population: 18000,
        greenSpacePercentage: 25,
        acAccessPercentage: 85,
        pollutionRate: "Moderate",
        communityFacilities: [
          "Dalraida Elementary School",
          "Dalraida Park",
          "Maxwell Air Force Base (adjacent)",
        ],
        identifiedNeeds:
          "More shaded public seating and water fountains in parks. Growing suburban area with increasing impervious surfaces.",
        heatOffset: 1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.275, 32.41],
            [-86.258, 32.41],
            [-86.253, 32.405],
            [-86.253, 32.395],
            [-86.258, 32.39],
            [-86.27, 32.39],
            [-86.28, 32.395],
            [-86.28, 32.405],
            [-86.275, 32.41],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 7,
        name: "Southmont",
        population: 9500,
        greenSpacePercentage: 35,
        acAccessPercentage: 92,
        pollutionRate: "Low",
        communityFacilities: [
          "Southmont Park",
          "Carver Creative & Performing Arts School",
          "Lagoon Park (nearby)",
        ],
        identifiedNeeds:
          "Enhance park facilities with splash pads and additional shade structures. Well-maintained residential area.",
        heatOffset: -2,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-86.315, 32.348],
            [-86.3, 32.348],
            [-86.295, 32.343],
            [-86.295, 32.333],
            [-86.3, 32.328],
            [-86.31, 32.328],
            [-86.32, 32.333],
            [-86.32, 32.343],
            [-86.315, 32.348],
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
