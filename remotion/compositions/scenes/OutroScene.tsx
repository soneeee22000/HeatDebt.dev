/**
 * OutroScene — Final CTA with logo and URL.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FadeIn } from "./shared";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const glowOpacity = interpolate(frame, [0, 30, 60, 90], [0, 0.5, 0.7, 0.5], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.orange}25 0%, transparent 70%)`,
          opacity: glowOpacity,
          filter: "blur(100px)",
        }}
      />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <FadeIn delay={5}>
          <h1
            style={{
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: COLORS.text }}>HEAT</span>
            <span style={{ color: COLORS.orange }}>DEBT</span>
          </h1>
        </FadeIn>

        <FadeIn delay={20}>
          <p
            style={{
              fontSize: 24,
              color: COLORS.muted,
              marginTop: 24,
              fontWeight: 500,
            }}
          >
            Every neighborhood has a heat debt. We help you measure and repay
            it.
          </p>
        </FadeIn>

        <FadeIn delay={35}>
          <div
            style={{
              marginTop: 40,
              display: "inline-flex",
              padding: "14px 32px",
              borderRadius: 12,
              backgroundColor: COLORS.orange,
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            heatdebt.dev
          </div>
        </FadeIn>

        <FadeIn delay={50}>
          <p
            style={{
              fontSize: 15,
              color: `${COLORS.muted}80`,
              marginTop: 40,
            }}
          >
            GenAI Hackathon 2026 — Sone, Erisa & Adeline
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
