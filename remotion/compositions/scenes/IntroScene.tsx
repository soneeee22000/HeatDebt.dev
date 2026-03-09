/**
 * IntroScene — HEATDEBT logo reveal with ambient glow.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, FadeIn } from "./shared";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const glowOpacity = interpolate(frame, [0, 30, 60, 90], [0, 0.4, 0.6, 0.4], {
    extrapolateRight: "clamp",
  });

  const taglineOpacity = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Ambient orange glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.orange}30 0%, transparent 70%)`,
          opacity: glowOpacity,
          filter: "blur(80px)",
        }}
      />

      {/* Secondary rose glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, #f4364c30 0%, transparent 70%)`,
          opacity: glowOpacity * 0.7,
          filter: "blur(60px)",
          transform: "translate(-200px, -100px)",
        }}
      />

      <div style={{ textAlign: "center", transform: `scale(${logoScale})` }}>
        <h1
          style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: COLORS.text }}>HEAT</span>
          <span style={{ color: COLORS.orange }}>DEBT</span>
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "35%",
          opacity: taglineOpacity,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 22,
            color: COLORS.muted,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Urban Thermal Equity Intelligence
        </p>
      </div>

      <FadeIn delay={50} style={{ position: "absolute", bottom: "22%" }}>
        <p
          style={{
            fontSize: 18,
            color: `${COLORS.muted}90`,
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Real-time heat vulnerability monitoring for Montgomery, Alabama
        </p>
      </FadeIn>

      {/* GenAI Hackathon 2026 badge */}
      <FadeIn delay={70} style={{ position: "absolute", bottom: 80 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: `${COLORS.card}`,
            padding: "8px 20px",
            fontSize: 14,
            color: COLORS.muted,
            fontWeight: 500,
          }}
        >
          GenAI Hackathon 2026
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};
