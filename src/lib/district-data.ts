/**
 * District data types and utilities for HEATDEBT.
 * This module defines the enriched District type that combines
 * static GeoJSON data with live API data.
 */

import type { HeatRisk, RiskTier } from "@/lib/constants";
import {
  computeHeatRisk,
  HEAT_RISK_HEX,
  HEAT_RISK_FILL,
  RISK_TIER_HEX,
} from "@/lib/constants";
import type { DistrictFeature } from "@/lib/montgomery-geojson";
import type { FacilityRecord, CodeViolationRecord } from "@/lib/api/arcgis";

export type { HeatRisk, RiskTier };

/** Enriched district data combining static + live sources */
export interface District {
  id: number;
  name: string;
  heatRisk: HeatRisk;
  heatIndex: number;
  population: number;
  greenSpacePercentage: number;
  pollutionRate: "Low" | "Moderate" | "High";
  acAccessPercentage: number;
  communityFacilities: string[];
  identifiedNeeds: string;
  /** GeoJSON feature for map rendering */
  feature: DistrictFeature;
  /** Center point [lat, lng] */
  centroid: [number, number];
  /** Nearby facilities from ArcGIS */
  nearbyFacilities: FacilityRecord[];
  /** Code violations count in area */
  violationsCount: number;
  /** Crime incidents count in area */
  crimeCount: number;
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
  riskTier: RiskTier;
}

/**
 * Build enriched District objects from GeoJSON features + live data.
 */
export function buildDistricts(
  features: DistrictFeature[],
  cityTemp: number,
  facilities: FacilityRecord[],
  violations: CodeViolationRecord[],
  crimeData: Array<{ latitude: number; longitude: number }>,
): District[] {
  return features.map((feature) => {
    const props = feature.properties;
    const centroid = getCentroid(feature);
    // Use summer-projected heat index for risk assessment.
    // Montgomery summer avg heat index is ~95-105°F.
    // We use the higher of actual temp or summer baseline to ensure
    // meaningful risk differentiation in the demo.
    const SUMMER_BASELINE = 96;
    const effectiveTemp = Math.max(cityTemp, SUMMER_BASELINE);
    const heatIndex = effectiveTemp + props.heatOffset;
    const nearby = findNearbyFacilities(centroid, facilities, 0.02);
    const violationsCount = countNearbyPoints(centroid, violations, 0.02);
    const crimeCount = countNearbyPoints(centroid, crimeData, 0.02);

    return {
      id: props.id,
      name: props.name,
      heatRisk: computeHeatRisk(heatIndex),
      heatIndex,
      population: props.population,
      greenSpacePercentage: props.greenSpacePercentage,
      pollutionRate: props.pollutionRate,
      acAccessPercentage: props.acAccessPercentage,
      communityFacilities: props.communityFacilities,
      identifiedNeeds: props.identifiedNeeds,
      feature,
      centroid,
      nearbyFacilities: nearby,
      violationsCount,
      crimeCount,
      censusTract: props.censusTract,
      heatScore: props.heatScore,
      treeCanopyPct: props.treeCanopyPct,
      vacancyRate: props.vacancyRate,
      povertyRate: props.povertyRate,
      riskTier: props.riskTier,
    };
  });
}

/**
 * Calculate simple centroid of a polygon feature.
 */
function getCentroid(feature: DistrictFeature): [number, number] {
  const coords = feature.geometry.coordinates[0];
  const len = coords.length - 1;
  let latSum = 0;
  let lngSum = 0;
  for (let i = 0; i < len; i++) {
    lngSum += coords[i][0];
    latSum += coords[i][1];
  }
  return [latSum / len, lngSum / len];
}

/**
 * Find facilities within a given radius (in degrees, ~0.01 = ~1km).
 */
function findNearbyFacilities(
  centroid: [number, number],
  facilities: FacilityRecord[],
  radiusDeg: number,
): FacilityRecord[] {
  return facilities.filter((f) => {
    const dLat = Math.abs(f.latitude - centroid[0]);
    const dLng = Math.abs(f.longitude - centroid[1]);
    return dLat <= radiusDeg && dLng <= radiusDeg;
  });
}

/**
 * Count points within radius of a centroid.
 */
function countNearbyPoints(
  centroid: [number, number],
  points: Array<{ latitude: number; longitude: number }>,
  radiusDeg: number,
): number {
  return points.filter((p) => {
    const dLat = Math.abs(p.latitude - centroid[0]);
    const dLng = Math.abs(p.longitude - centroid[1]);
    return dLat <= radiusDeg && dLng <= radiusDeg;
  }).length;
}

/** Re-export color maps for backward compatibility */
export const heatRiskColors = HEAT_RISK_FILL;
export const heatRiskHexColors = HEAT_RISK_HEX;
export const riskTierHexColors = RISK_TIER_HEX;
