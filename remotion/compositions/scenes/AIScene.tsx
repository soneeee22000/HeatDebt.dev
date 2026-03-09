/**
 * AIScene — AI risk analysis powered by Google Gemini.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { COLORS, FadeIn, SceneTitle, ScoreRing, AnimatedBar } from "./shared";

const RISK_FACTORS = [
  { label: "Heat Exposure", value: 85, color: COLORS.red },
  { label: "Poverty Rate", value: 72, color: COLORS.orange },
  { label: "Tree Canopy Deficit", value: 68, color: "#eab308" },
  { label: "A/C Access Gap", value: 58, color: COLORS.orange },
  { label: "Vacancy Rate", value: 45, color: "#eab308" },
];

const RECOMMENDATIONS = [
  "Deploy 200+ shade trees along major corridors",
  "Distribute 150 portable A/C units to low-income households",
  "Establish 3 new cooling centers in high-risk zones",
  "Apply cool pavement coating on 12 priority streets",
];

export const AIScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 60,
      }}
    >
      <SceneTitle
        label="AI Analysis"
        title="Gemini-powered risk scoring for every neighborhood"
      />

      <div
        style={{
          display: "flex",
          gap: 50,
          marginTop: 50,
          alignItems: "flex-start",
        }}
      >
        {/* Score ring + factors */}
        <FadeIn delay={20} style={{ flex: 1 }}>
          <div
            style={{
              padding: 40,
              borderRadius: 20,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.card,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
              <ScoreRing score={78} size={180} delay={25} />

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {RISK_FACTORS.map((factor, i) => (
                  <div key={factor.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 14, color: COLORS.muted }}>
                        {factor.label}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: factor.color,
                        }}
                      >
                        {factor.value}%
                      </span>
                    </div>
                    <AnimatedBar
                      value={factor.value}
                      maxValue={100}
                      color={factor.color}
                      delay={30 + i * 8}
                      width={400}
                      height={8}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                padding: "12px 16px",
                borderRadius: 10,
                backgroundColor: `${COLORS.orange}10`,
                border: `1px solid ${COLORS.orange}30`,
                fontSize: 14,
                color: COLORS.orange,
                fontWeight: 500,
              }}
            >
              West End (Tract 1402) — HIGH RISK — Immediate intervention
              recommended
            </div>
          </div>
        </FadeIn>

        {/* Recommendations */}
        <FadeIn delay={50} style={{ width: 420 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 20,
            }}
          >
            AI Recommendations
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RECOMMENDATIONS.map((rec, i) => {
              const opacity = spring({
                frame: frame - 60 - i * 10,
                fps,
                config: { damping: 20, stiffness: 80 },
              });

              return (
                <div
                  key={rec}
                  style={{
                    opacity,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.card,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: `${COLORS.green}20`,
                      color: COLORS.green,
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: COLORS.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    {rec}
                  </span>
                </div>
              );
            })}
          </div>

          <FadeIn delay={110}>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: COLORS.muted,
              }}
            >
              <span style={{ color: COLORS.purple }}>✨</span>
              Powered by Google Gemini 2.5 Flash
            </div>
          </FadeIn>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
