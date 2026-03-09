/**
 * SolutionScene — What HEATDEBT does, high-level pipeline.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FadeIn, SceneTitle } from "./shared";

const PIPELINE_STEPS = [
  { emoji: "📡", title: "Ingest", desc: "Live weather, census, ArcGIS data" },
  { emoji: "🗺️", title: "Visualize", desc: "9 interactive choropleth layers" },
  { emoji: "🤖", title: "Analyze", desc: "Gemini AI risk scoring 0-100" },
  { emoji: "📄", title: "Report", desc: "14-page PDF & Word exports" },
  { emoji: "💰", title: "Fund", desc: "Grant matching & application drafts" },
];

export const SolutionScene: React.FC = () => {
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
        label="Our Solution"
        title="From raw data to grant-ready reports in minutes."
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 60,
        }}
      >
        {PIPELINE_STEPS.map((step, i) => (
          <React.Fragment key={step.title}>
            <FadeIn delay={25 + i * 12} direction="up">
              <div
                style={{
                  padding: "32px 28px",
                  borderRadius: 16,
                  border: `1px solid ${COLORS.border}`,
                  backgroundColor: COLORS.card,
                  textAlign: "center",
                  minWidth: 200,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {step.emoji}
                </div>
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 8,
                  }}
                >
                  {step.title}
                </h4>
                <p
                  style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5 }}
                >
                  {step.desc}
                </p>
              </div>
            </FadeIn>
            {i < PIPELINE_STEPS.length - 1 && (
              <FadeIn delay={30 + i * 12} direction="none">
                <div style={{ fontSize: 24, color: COLORS.orange }}>→</div>
              </FadeIn>
            )}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
