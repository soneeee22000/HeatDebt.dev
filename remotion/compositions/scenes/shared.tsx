/**
 * Shared animation utilities and style constants for all scenes.
 */
import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** Standard colors used across scenes */
export const COLORS = {
  bg: "#09090b",
  card: "#18181b",
  border: "#27272a",
  orange: "#f97316",
  orangeGlow: "rgba(249, 115, 22, 0.15)",
  text: "#fafafa",
  muted: "#a1a1aa",
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
};

/** Fade-in wrapper with optional delay and slide direction */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, direction = "up", distance = 40, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const translateMap = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const translate = translateMap[direction];
  const x = interpolate(opacity, [0, 1], [translate.x, 0]);
  const y = interpolate(opacity, [0, 1], [translate.y, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translate(${x}px, ${y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Scene title with orange accent */
export const SceneTitle: React.FC<{
  label: string;
  title: string;
  delay?: number;
}> = ({ label, title, delay = 0 }) => (
  <div style={{ textAlign: "center" }}>
    <FadeIn delay={delay}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 9999,
          border: `1px solid ${COLORS.orange}40`,
          backgroundColor: `${COLORS.orange}15`,
          padding: "6px 16px",
          fontSize: 14,
          color: COLORS.orange,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginBottom: 24,
        }}
      >
        {label}
      </div>
    </FadeIn>
    <FadeIn delay={delay + 8}>
      <h2
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.text,
          lineHeight: 1.15,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {title}
      </h2>
    </FadeIn>
  </div>
);

/** Animated progress bar */
export const AnimatedBar: React.FC<{
  value: number;
  maxValue: number;
  color: string;
  delay?: number;
  width?: number;
  height?: number;
}> = ({ value, maxValue, color, delay = 0, width = 300, height = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 40 },
  });

  const barWidth = interpolate(
    progress,
    [0, 1],
    [0, (value / maxValue) * width],
  );

  return (
    <div
      style={{
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: `${color}20`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: barWidth,
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

/** Animated counter number */
export const AnimatedNumber: React.FC<{
  value: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  style?: React.CSSProperties;
}> = ({ value, delay = 0, suffix = "", prefix = "", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 40 },
  });

  const current = Math.round(interpolate(progress, [0, 1], [0, value]));

  return (
    <span style={style}>
      {prefix}
      {current}
      {suffix}
    </span>
  );
};

/** Circular score ring (animated) */
export const ScoreRing: React.FC<{
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  delay?: number;
}> = ({
  score,
  size = 160,
  strokeWidth = 10,
  color = COLORS.orange,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 40 },
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference * progress;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`${color}20`}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: size * 0.25, fontWeight: 800, fill: COLORS.text }}
      >
        {Math.round(score * progress)}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: 11,
          fontWeight: 600,
          fill: COLORS.muted,
          letterSpacing: "0.15em",
          textTransform: "uppercase" as const,
        }}
      >
        RISK SCORE
      </text>
    </svg>
  );
};
