/**
 * MapScene — Showcases the 9-layer interactive choropleth map.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, FadeIn, SceneTitle } from "./shared";

/** Simulated Montgomery tract polygons (simplified outlines) */
const TRACTS = [
  {
    id: 1,
    x: 520,
    y: 280,
    w: 180,
    h: 140,
    color: COLORS.red,
    name: "West End",
    score: 82,
  },
  {
    id: 2,
    x: 720,
    y: 220,
    w: 160,
    h: 130,
    color: COLORS.orange,
    name: "Old Cloverdale",
    score: 65,
  },
  {
    id: 3,
    x: 900,
    y: 300,
    w: 140,
    h: 120,
    color: "#eab308",
    name: "Capitol Heights",
    score: 48,
  },
  {
    id: 4,
    x: 600,
    y: 440,
    w: 170,
    h: 110,
    color: COLORS.red,
    name: "Centennial Hill",
    score: 78,
  },
  {
    id: 5,
    x: 800,
    y: 460,
    w: 150,
    h: 100,
    color: COLORS.green,
    name: "Dalraida",
    score: 28,
  },
  {
    id: 6,
    x: 450,
    y: 450,
    w: 130,
    h: 120,
    color: "#eab308",
    name: "Chisholm",
    score: 55,
  },
  {
    id: 7,
    x: 1000,
    y: 400,
    w: 130,
    h: 130,
    color: COLORS.green,
    name: "Hampstead",
    score: 22,
  },
];

const LAYERS = [
  "Heat Score",
  "Heat Exposure",
  "Tree Canopy",
  "A/C Access",
  "Poverty Rate",
  "Vacancy Rate",
  "Population",
  "Air Quality",
  "Cooling Centers",
];

export const MapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeLayerIndex = Math.floor(
    interpolate(frame, [120, 270], [0, 8.99], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 60,
      }}
    >
      <SceneTitle
        label="Interactive Map"
        title="9 switchable choropleth layers"
      />

      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 50,
          flex: 1,
        }}
      >
        {/* Map area */}
        <FadeIn delay={20} style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              width: "100%",
              height: 520,
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: "#1a1a2e",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Dark map background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              }}
            />

            {/* Grid lines simulating map */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`h-${i}`}
                style={{
                  position: "absolute",
                  top: `${(i + 1) * 12}%`,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: `${COLORS.muted}10`,
                }}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`v-${i}`}
                style={{
                  position: "absolute",
                  left: `${(i + 1) * 8}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: `${COLORS.muted}10`,
                }}
              />
            ))}

            {/* Tract polygons */}
            {TRACTS.map((tract, i) => {
              const tractOpacity = spring({
                frame: frame - 15 - i * 5,
                fps,
                config: { damping: 20, stiffness: 80 },
              });

              return (
                <div
                  key={tract.id}
                  style={{
                    position: "absolute",
                    left: tract.x - 400,
                    top: tract.y - 180,
                    width: tract.w,
                    height: tract.h,
                    borderRadius: 8,
                    backgroundColor: `${tract.color}40`,
                    border: `2px solid ${tract.color}80`,
                    opacity: tractOpacity,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: COLORS.text,
                    }}
                  >
                    {tract.score}
                  </span>
                  <span
                    style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}
                  >
                    {tract.name}
                  </span>
                </div>
              );
            })}

            {/* Map label */}
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: COLORS.muted,
              }}
            >
              <span style={{ color: COLORS.orange }}>📍</span> Montgomery, AL
            </div>
          </div>
        </FadeIn>

        {/* Layer list */}
        <FadeIn delay={40} style={{ width: 320 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 16,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Map Layers
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LAYERS.map((layer, i) => {
              const isActive = i === activeLayerIndex;
              return (
                <FadeIn key={layer} delay={50 + i * 6}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: `1px solid ${isActive ? COLORS.orange : COLORS.border}`,
                      backgroundColor: isActive
                        ? `${COLORS.orange}15`
                        : COLORS.card,
                      fontSize: 15,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? COLORS.orange : COLORS.muted,
                      transition: "all 0.3s",
                    }}
                  >
                    {layer}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
