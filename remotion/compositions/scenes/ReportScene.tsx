/**
 * ReportScene — 14-page due diligence report generation.
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

const REPORT_SECTIONS = [
  {
    num: "01",
    title: "District Overview",
    pages: "pp 1-2",
    desc: "Demographics, geography, heat baseline",
  },
  {
    num: "02",
    title: "Real-Time Dashboard",
    pages: "pp 3-5",
    desc: "Weather data, 9-layer map analysis",
  },
  {
    num: "03",
    title: "Risk Matrix",
    pages: "pp 6-8",
    desc: "AI scores, vulnerability breakdown",
  },
  {
    num: "04",
    title: "Cross-Layer Analysis",
    pages: "pp 9-11",
    desc: "Correlations, comparison tables",
  },
  {
    num: "05",
    title: "Grant Strategy",
    pages: "pp 12-14",
    desc: "Eligibility, cost estimates, ROI",
  },
];

export const ReportScene: React.FC = () => {
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
        label="Report Export"
        title="14-page due diligence reports in PDF & Word"
      />

      <div style={{ display: "flex", gap: 50, marginTop: 50 }}>
        {/* Report preview mock */}
        <FadeIn delay={20} style={{ width: 480 }}>
          <div
            style={{
              position: "relative",
              width: 420,
              height: 540,
              margin: "0 auto",
            }}
          >
            {/* Stacked pages effect */}
            {[2, 1, 0].map((offset) => (
              <div
                key={offset}
                style={{
                  position: "absolute",
                  top: offset * 6,
                  left: offset * 6,
                  width: 400,
                  height: 520,
                  borderRadius: 12,
                  backgroundColor: offset === 0 ? "#fafafa" : "#e4e4e7",
                  border: `1px solid ${offset === 0 ? "#d4d4d8" : "#a1a1aa"}`,
                  boxShadow:
                    offset === 0 ? "0 20px 60px rgba(0,0,0,0.3)" : "none",
                }}
              />
            ))}

            {/* Front page content */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 400,
                height: 520,
                borderRadius: 12,
                padding: 36,
                display: "flex",
                flexDirection: "column",
                zIndex: 3,
              }}
            >
              {/* Report header */}
              <div
                style={{
                  borderBottom: "2px solid #f97316",
                  paddingBottom: 16,
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    color: "#71717a",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  HEATDEBT Due Diligence Report
                </p>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#18181b",
                    marginTop: 8,
                  }}
                >
                  West End
                </h3>
                <p style={{ fontSize: 12, color: "#71717a" }}>
                  Tract 1402 — Montgomery, AL
                </p>
              </div>

              {/* Mini section list */}
              {REPORT_SECTIONS.map((section, i) => {
                const sectionOpacity = spring({
                  frame: frame - 40 - i * 8,
                  fps,
                  config: { damping: 20, stiffness: 80 },
                });

                return (
                  <div
                    key={section.num}
                    style={{
                      opacity: sectionOpacity,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: "1px solid #e4e4e7",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: COLORS.orange,
                        width: 28,
                      }}
                    >
                      {section.num}
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#18181b",
                        }}
                      >
                        {section.title}
                      </p>
                      <p style={{ fontSize: 10, color: "#71717a" }}>
                        {section.pages}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Page count */}
              <div style={{ marginTop: "auto", textAlign: "center" }}>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: COLORS.orange,
                  }}
                >
                  14
                </span>
                <p
                  style={{
                    fontSize: 10,
                    color: "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  Pages
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Section details */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}
        >
          {REPORT_SECTIONS.map((section, i) => (
            <FadeIn key={section.num} delay={30 + i * 10} direction="left">
              <div
                style={{
                  padding: "20px 24px",
                  borderRadius: 14,
                  border: `1px solid ${COLORS.border}`,
                  backgroundColor: COLORS.card,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: `${COLORS.orange}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    color: COLORS.orange,
                    flexShrink: 0,
                  }}
                >
                  {section.num}
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    {section.title}
                  </h4>
                  <p
                    style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}
                  >
                    {section.desc}
                  </p>
                  <span style={{ fontSize: 11, color: `${COLORS.muted}80` }}>
                    {section.pages}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}

          <FadeIn delay={90} style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <div
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                backgroundColor: `${COLORS.red}20`,
                border: `1px solid ${COLORS.red}40`,
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.red,
              }}
            >
              PDF Export
            </div>
            <div
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                backgroundColor: `${COLORS.blue}20`,
                border: `1px solid ${COLORS.blue}40`,
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.blue,
              }}
            >
              Word Export
            </div>
          </FadeIn>
        </div>
      </div>
    </AbsoluteFill>
  );
};
