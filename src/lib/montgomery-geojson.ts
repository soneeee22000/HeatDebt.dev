/**
 * GeoJSON FeatureCollection for Montgomery, AL neighborhoods.
 * 14 neighborhoods with census-tract-level heat vulnerability data.
 * Real polygon boundaries from US Census TIGER/Line 2020 census tracts.
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
 * Real Montgomery, AL neighborhoods with US Census TIGER/Line 2020 tract boundaries.
 * Coordinates are [longitude, latitude] per GeoJSON spec.
 * 14 districts organized from highest to lowest heat vulnerability.
 */
export const montgomeryDistricts: DistrictFeatureCollection = {
  type: "FeatureCollection",
  features: [
    /* ------------------------------------------------------------------ */
    /* 1. West End / Washington Park — CRITICAL */
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
            [-86.3, 32.3631],
            [-86.2996, 32.3446],
            [-86.2872, 32.3444],
            [-86.2835, 32.3454],
            [-86.2824, 32.3455],
            [-86.2826, 32.3583],
            [-86.2911, 32.3603],
            [-86.3, 32.3631]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 2. Chisholm — CRITICAL */
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
            [-86.3399, 32.3518],
            [-86.3372, 32.3515],
            [-86.3364, 32.3511],
            [-86.3212, 32.3515],
            [-86.3217, 32.357],
            [-86.3219, 32.3644],
            [-86.3227, 32.3694],
            [-86.322, 32.3747],
            [-86.3221, 32.3781],
            [-86.324, 32.3775],
            [-86.3295, 32.3741],
            [-86.3319, 32.3722],
            [-86.3339, 32.3699],
            [-86.3349, 32.3681],
            [-86.3357, 32.3663],
            [-86.3399, 32.3518]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 3. North Montgomery — CRITICAL */
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
            [-86.3731, 32.4299],
            [-86.3713, 32.4286],
            [-86.3703, 32.4273],
            [-86.3698, 32.4259],
            [-86.3697, 32.4247],
            [-86.3691, 32.423],
            [-86.3656, 32.4127],
            [-86.366, 32.4096],
            [-86.366, 32.4078],
            [-86.3655, 32.4065],
            [-86.3631, 32.4045],
            [-86.3612, 32.4034],
            [-86.3596, 32.4021],
            [-86.3572, 32.4011],
            [-86.3552, 32.3998],
            [-86.3508, 32.396],
            [-86.3476, 32.3936],
            [-86.3438, 32.3917],
            [-86.3348, 32.3886],
            [-86.3321, 32.3874],
            [-86.3294, 32.3854],
            [-86.3248, 32.3802],
            [-86.3235, 32.3795],
            [-86.322, 32.3792],
            [-86.3195, 32.3793],
            [-86.3165, 32.3805],
            [-86.3147, 32.3821],
            [-86.3143, 32.383],
            [-86.3142, 32.3839],
            [-86.3114, 32.3834],
            [-86.3117, 32.3828],
            [-86.3122, 32.3823],
            [-86.3121, 32.3822],
            [-86.3091, 32.3841],
            [-86.3082, 32.3844],
            [-86.3004, 32.3858],
            [-86.2984, 32.3859],
            [-86.298, 32.3897],
            [-86.2976, 32.3909],
            [-86.2917, 32.3976],
            [-86.2924, 32.3972],
            [-86.2918, 32.3982],
            [-86.2915, 32.3994],
            [-86.2908, 32.4072],
            [-86.2904, 32.4082],
            [-86.2898, 32.4089],
            [-86.2889, 32.4096],
            [-86.2876, 32.4101],
            [-86.2864, 32.4125],
            [-86.2842, 32.4231],
            [-86.286, 32.4226],
            [-86.288, 32.4218],
            [-86.2904, 32.4203],
            [-86.2923, 32.4187],
            [-86.2927, 32.4189],
            [-86.2967, 32.4157],
            [-86.3029, 32.411],
            [-86.303, 32.4207],
            [-86.3035, 32.4216],
            [-86.3044, 32.4198],
            [-86.305, 32.4195],
            [-86.3067, 32.4193],
            [-86.3067, 32.4184],
            [-86.307, 32.4175],
            [-86.309, 32.4133],
            [-86.3107, 32.4117],
            [-86.3119, 32.4112],
            [-86.313, 32.4111],
            [-86.315, 32.4117],
            [-86.3161, 32.4125],
            [-86.3177, 32.4179],
            [-86.3182, 32.4188],
            [-86.3189, 32.4192],
            [-86.3198, 32.4198],
            [-86.3253, 32.4222],
            [-86.328, 32.4231],
            [-86.3305, 32.4243],
            [-86.3328, 32.4257],
            [-86.3353, 32.4279],
            [-86.3381, 32.4298],
            [-86.3445, 32.4326],
            [-86.3465, 32.433],
            [-86.3503, 32.4334],
            [-86.3535, 32.4329],
            [-86.3556, 32.4319],
            [-86.3568, 32.4306],
            [-86.3728, 32.4305],
            [-86.3731, 32.4299]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 4. Hayneville Road — CRITICAL */
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
            [-86.2881, 32.3748],
            [-86.2861, 32.3722],
            [-86.284, 32.3701],
            [-86.2789, 32.3657],
            [-86.2698, 32.3662],
            [-86.2684, 32.366],
            [-86.2683, 32.368],
            [-86.2679, 32.3688],
            [-86.2674, 32.3692],
            [-86.2672, 32.3726],
            [-86.2666, 32.373],
            [-86.2646, 32.3757],
            [-86.2641, 32.3805],
            [-86.2631, 32.3817],
            [-86.2625, 32.3819],
            [-86.2604, 32.3819],
            [-86.2598, 32.3827],
            [-86.2592, 32.3831],
            [-86.2591, 32.3848],
            [-86.2592, 32.385],
            [-86.2666, 32.3832],
            [-86.2744, 32.3807],
            [-86.2748, 32.3802],
            [-86.277, 32.3786],
            [-86.2833, 32.3762],
            [-86.2881, 32.3748]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 5. Sheridan Heights — HIGH */
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
            [-86.3021, 32.368],
            [-86.302, 32.3673],
            [-86.3, 32.3637],
            [-86.3, 32.3631],
            [-86.2911, 32.3603],
            [-86.2828, 32.3584],
            [-86.2803, 32.3574],
            [-86.2692, 32.3523],
            [-86.2626, 32.3524],
            [-86.2649, 32.3539],
            [-86.2684, 32.3567],
            [-86.2732, 32.3611],
            [-86.2772, 32.3641],
            [-86.2789, 32.3657],
            [-86.2878, 32.3655],
            [-86.2895, 32.3659],
            [-86.2925, 32.3674],
            [-86.2943, 32.368],
            [-86.3021, 32.368]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 6. South Montgomery — MODERATE */
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
            [-86.2684, 32.3662],
            [-86.2684, 32.366],
            [-86.2664, 32.3651],
            [-86.26, 32.3612],
            [-86.2563, 32.3597],
            [-86.2543, 32.3592],
            [-86.2515, 32.3589],
            [-86.2476, 32.359],
            [-86.244, 32.3593],
            [-86.2442, 32.3627],
            [-86.2441, 32.3708],
            [-86.2459, 32.3727],
            [-86.2464, 32.3736],
            [-86.2463, 32.3784],
            [-86.2467, 32.3803],
            [-86.2461, 32.3831],
            [-86.2558, 32.3855],
            [-86.2572, 32.3854],
            [-86.2592, 32.385],
            [-86.259, 32.3844],
            [-86.2592, 32.3831],
            [-86.2598, 32.3827],
            [-86.2604, 32.3819],
            [-86.2625, 32.3819],
            [-86.2631, 32.3817],
            [-86.2641, 32.3805],
            [-86.2646, 32.3757],
            [-86.2666, 32.373],
            [-86.2672, 32.3726],
            [-86.2674, 32.3692],
            [-86.2679, 32.3688],
            [-86.2683, 32.368],
            [-86.2684, 32.3662]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 7. Capitol Heights — MODERATE */
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
            [-86.3223, 32.3673],
            [-86.3219, 32.3644],
            [-86.3217, 32.357],
            [-86.3212, 32.3515],
            [-86.3124, 32.3517],
            [-86.3126, 32.359],
            [-86.3147, 32.359],
            [-86.3148, 32.3639],
            [-86.3169, 32.3638],
            [-86.3169, 32.3677],
            [-86.3223, 32.3673]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 8. Downtown / Capitol Hill — MODERATE */
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
            [-86.3169, 32.3677],
            [-86.3169, 32.3638],
            [-86.3148, 32.3639],
            [-86.3147, 32.359],
            [-86.3086, 32.3591],
            [-86.3086, 32.3596],
            [-86.3069, 32.3596],
            [-86.3069, 32.3591],
            [-86.2999, 32.3592],
            [-86.3, 32.3637],
            [-86.302, 32.3673],
            [-86.3021, 32.368],
            [-86.3169, 32.3677]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 9. Airport / Gunter — MODERATE */
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
            [-86.2826, 32.3579],
            [-86.2821, 32.3268],
            [-86.2648, 32.3271],
            [-86.2651, 32.328],
            [-86.2619, 32.3325],
            [-86.2608, 32.3377],
            [-86.261, 32.348],
            [-86.2612, 32.3496],
            [-86.2634, 32.3517],
            [-86.2636, 32.3524],
            [-86.2692, 32.3523],
            [-86.2803, 32.3574],
            [-86.2826, 32.3583],
            [-86.2826, 32.3579]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 10. Maxwell / Near SW — MODERATE */
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
            [-86.3766, 32.3936],
            [-86.3755, 32.3887],
            [-86.3728, 32.3813],
            [-86.3725, 32.38],
            [-86.3714, 32.3689],
            [-86.3714, 32.3661],
            [-86.3707, 32.3655],
            [-86.37, 32.3655],
            [-86.3658, 32.3677],
            [-86.3643, 32.3658],
            [-86.3564, 32.3685],
            [-86.354, 32.3697],
            [-86.3485, 32.3736],
            [-86.3466, 32.3744],
            [-86.3421, 32.3755],
            [-86.3335, 32.3767],
            [-86.334, 32.3863],
            [-86.3339, 32.3882],
            [-86.3438, 32.3917],
            [-86.3459, 32.3927],
            [-86.3476, 32.3936],
            [-86.3494, 32.395],
            [-86.3537, 32.3985],
            [-86.355, 32.3983],
            [-86.3567, 32.399],
            [-86.3583, 32.3989],
            [-86.3586, 32.3987],
            [-86.3588, 32.3981],
            [-86.3612, 32.3986],
            [-86.3626, 32.3986],
            [-86.3626, 32.3943],
            [-86.3646, 32.3943],
            [-86.3648, 32.3936],
            [-86.3705, 32.3943],
            [-86.3728, 32.394],
            [-86.3745, 32.3945],
            [-86.3766, 32.3936]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 11. Forest Hills — LOW */
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
            [-86.2592, 32.3979],
            [-86.259, 32.397],
            [-86.2574, 32.3937],
            [-86.2566, 32.3912],
            [-86.2564, 32.39],
            [-86.2565, 32.3855],
            [-86.2551, 32.3854],
            [-86.2461, 32.3831],
            [-86.2458, 32.3837],
            [-86.2449, 32.4022],
            [-86.2482, 32.4021],
            [-86.2481, 32.4033],
            [-86.2573, 32.4032],
            [-86.2586, 32.3993],
            [-86.2589, 32.3988],
            [-86.2592, 32.3979]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 12. Old Cloverdale — LOW */
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
            [-86.3166, 32.3516],
            [-86.3164, 32.3443],
            [-86.3138, 32.3445],
            [-86.3121, 32.3444],
            [-86.2996, 32.3446],
            [-86.2999, 32.3592],
            [-86.3069, 32.3591],
            [-86.3069, 32.3596],
            [-86.3086, 32.3596],
            [-86.3086, 32.3591],
            [-86.3126, 32.359],
            [-86.3124, 32.3517],
            [-86.3166, 32.3516]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 13. Dalraida — LOW */
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
            [-86.2779, 32.388],
            [-86.2779, 32.3879],
            [-86.2725, 32.388],
            [-86.2723, 32.3812],
            [-86.2666, 32.3832],
            [-86.2565, 32.3855],
            [-86.2564, 32.39],
            [-86.2566, 32.3912],
            [-86.2574, 32.3937],
            [-86.2592, 32.3977],
            [-86.2557, 32.4075],
            [-86.2739, 32.4105],
            [-86.2737, 32.4036],
            [-86.2743, 32.3962],
            [-86.2762, 32.3907],
            [-86.2779, 32.388]
          ],
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    /* 14. Eastchase — LOW */
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
            [-86.2996, 32.3446],
            [-86.2992, 32.3267],
            [-86.2821, 32.3268],
            [-86.2824, 32.3455],
            [-86.2835, 32.3454],
            [-86.2872, 32.3444],
            [-86.2996, 32.3446]
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
