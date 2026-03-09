/**
 * GrantScene — Grant database and AI-generated application narratives.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FadeIn, SceneTitle } from "./shared";

const GRANTS = [
  { name: "EPA EJCPS", amount: "$500K-$2M", match: "92%", color: COLORS.green },
  { name: "HUD CDBG", amount: "$200K-$1M", match: "88%", color: COLORS.green },
  { name: "FEMA BRIC", amount: "$1M-$50M", match: "76%", color: "#eab308" },
  { name: "LIHEAP", amount: "$100K-$500K", match: "95%", color: COLORS.green },
  {
    name: "Alabama Power SHARE",
    amount: "$50K-$200K",
    match: "84%",
    color: COLORS.green,
  },
  { name: "ADECA", amount: "$100K-$500K", match: "71%", color: "#eab308" },
  {
    name: "HHS OAA",
    amount: "$150K-$750K",
    match: "68%",
    color: COLORS.orange,
  },
];

export const GrantScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <SceneTitle
        label="Grant Strategy"
        title="7 real grants with AI-generated application narratives"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginTop: 50,
          width: "100%",
          maxWidth: 1200,
        }}
      >
        {GRANTS.map((grant, i) => (
          <FadeIn key={grant.name} delay={25 + i * 8}>
            <div
              style={{
                padding: "28px 24px",
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.card,
                textAlign: "center",
              }}
            >
              <h4
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: COLORS.text,
                  marginBottom: 8,
                }}
              >
                {grant.name}
              </h4>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: COLORS.orange,
                  marginBottom: 8,
                }}
              >
                {grant.amount}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  padding: "4px 12px",
                  borderRadius: 9999,
                  backgroundColor: `${grant.color}20`,
                  border: `1px solid ${grant.color}40`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: grant.color,
                }}
              >
                {grant.match} match
              </div>
            </div>
          </FadeIn>
        ))}

        {/* AI narrative card */}
        <FadeIn delay={85}>
          <div
            style={{
              padding: "28px 24px",
              borderRadius: 16,
              border: `1px solid ${COLORS.purple}40`,
              backgroundColor: `${COLORS.purple}10`,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 8 }}>✨</span>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.purple }}>
              AI-Generated
            </h4>
            <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              Application narratives auto-drafted by Gemini
            </p>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
