/**
 * ProblemScene — Presents the urban heat inequality problem.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FadeIn, SceneTitle, AnimatedNumber } from "./shared";

const STATS = [
  { value: 15, suffix: "°F", label: "Temperature gap between neighborhoods" },
  { value: 72, suffix: "%", label: "Low-income areas lack tree canopy" },
  { value: 3, suffix: "x", label: "Higher heat mortality in vulnerable zones" },
];

export const ProblemScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <SceneTitle
        label="The Problem"
        title="Heat inequality is invisible — and deadly."
      />

      <div
        style={{
          display: "flex",
          gap: 60,
          marginTop: 60,
          justifyContent: "center",
        }}
      >
        {STATS.map((stat, i) => (
          <FadeIn
            key={stat.label}
            delay={30 + i * 15}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                padding: "40px 48px",
                borderRadius: 20,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: `${COLORS.card}`,
                minWidth: 280,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: COLORS.red,
                  lineHeight: 1,
                }}
              >
                <AnimatedNumber
                  value={stat.value}
                  delay={40 + i * 15}
                  suffix={stat.suffix}
                />
              </div>
              <p
                style={{
                  fontSize: 16,
                  color: COLORS.muted,
                  marginTop: 16,
                  maxWidth: 220,
                  lineHeight: 1.5,
                }}
              >
                {stat.label}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
};
