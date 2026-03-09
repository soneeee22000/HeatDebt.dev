/**
 * TeamScene — Team members.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FadeIn, SceneTitle } from "./shared";

const TEAM = [
  { name: "Sone", role: "AI Engineering", color: COLORS.orange },
  { name: "Erisa", role: "Design & UX", color: COLORS.purple },
  { name: "Adeline", role: "Data & Research", color: COLORS.blue },
];

export const TeamScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <SceneTitle label="The Team" title="Built by" />

      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 60,
          justifyContent: "center",
        }}
      >
        {TEAM.map((member, i) => (
          <FadeIn key={member.name} delay={20 + i * 15}>
            <div
              style={{
                padding: "48px 64px",
                borderRadius: 20,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.card,
                textAlign: "center",
                minWidth: 280,
              }}
            >
              {/* Avatar placeholder */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: `${member.color}20`,
                  border: `2px solid ${member.color}50`,
                  margin: "0 auto 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 800,
                  color: member.color,
                }}
              >
                {member.name[0]}
              </div>
              <h4 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>
                {member.name}
              </h4>
              <p style={{ fontSize: 15, color: COLORS.muted, marginTop: 8 }}>
                {member.role}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
};
