/**
 * TechStackScene — Technologies and data sources.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FadeIn, SceneTitle } from "./shared";

const STACK_CATEGORIES = [
  {
    title: "Frontend",
    items: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "Leaflet",
      "shadcn/ui",
    ],
    color: COLORS.blue,
  },
  {
    title: "AI / ML",
    items: ["Google Gemini 2.5 Flash", "Google Genkit", "Zod Schemas"],
    color: COLORS.purple,
  },
  {
    title: "Data Sources",
    items: [
      "Open-Meteo API",
      "NWS Weather",
      "US Census ACS",
      "EPA AirNow",
      "Montgomery ArcGIS",
      "USDA NLCD",
    ],
    color: COLORS.green,
  },
  {
    title: "Infrastructure",
    items: ["Vercel", "Server Actions", "API Route Proxies", "Edge Runtime"],
    color: COLORS.orange,
  },
];

export const TechStackScene: React.FC = () => {
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
        label="Tech Stack"
        title="Built with modern, production-grade tools"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          marginTop: 50,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {STACK_CATEGORIES.map((cat, i) => (
          <FadeIn key={cat.title} delay={20 + i * 12}>
            <div
              style={{
                padding: "32px 28px",
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.card,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "4px 12px",
                  borderRadius: 9999,
                  backgroundColor: `${cat.color}15`,
                  border: `1px solid ${cat.color}30`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: cat.color,
                  marginBottom: 20,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {cat.title}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {cat.items.map((item) => (
                  <div
                    key={item}
                    style={{
                      fontSize: 15,
                      color: COLORS.text,
                      fontWeight: 500,
                      paddingLeft: 12,
                      borderLeft: `2px solid ${cat.color}40`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
};
