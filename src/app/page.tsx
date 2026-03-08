/**
 * Landing page for HEATDEBT — public marketing page.
 */

import Link from "next/link";
import {
  Thermometer,
  MapPin,
  Zap,
  Brain,
  FileText,
  ArrowRight,
  Database,
} from "lucide-react";

const STATS = [
  { value: "60s", label: "Time to generate a full risk report" },
  { value: "$127K", label: "Average grant value per neighborhood" },
  { value: "14", label: "Montgomery neighborhoods analyzed" },
  { value: "8x", label: "Faster than manual EJ assessments" },
  { value: "6", label: "Live data layers integrated" },
];

const PILLARS = [
  {
    icon: Thermometer,
    title: "Live Intelligence",
    description:
      "Real-time thermal, demographic, and environmental data from NWS, Census ACS, EPA AirNow, and Montgomery Open Data — updated every 10 minutes.",
  },
  {
    icon: Brain,
    title: "AI Correlation",
    description:
      "Google Gemini analyzes the intersection of heat exposure, poverty, tree canopy, A/C access, and vacancy rates to score neighborhood vulnerability 0-100.",
  },
  {
    icon: FileText,
    title: "Grant Automation",
    description:
      "One-click EPA Environmental Justice grant narratives with auto-filled budget tables, intervention priorities, and copy-ready application text.",
  },
];

const DATA_SOURCES = [
  "NWS Weather API",
  "Open-Meteo",
  "US Census ACS",
  "EPA AirNow",
  "Montgomery ArcGIS",
  "CartoDB",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 noise-overlay z-0" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between px-4 mx-auto">
          <h1 className="font-extrabold text-2xl tracking-tight">
            <span className="text-primary-foreground">HEAT</span>
            <span className="text-orange-500">DEBT</span>
          </h1>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-400 hover:bg-orange-500/20 transition-colors"
          >
            Login
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative container max-w-screen-xl mx-auto px-4 pt-32 pb-24 lg:pt-40 lg:pb-32 text-center">
        {/* Ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full glow-orange animate-pulse-glow pointer-events-none" />
        <div
          className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-full h-full glow-rose animate-pulse-glow pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10">
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs text-orange-400 mb-8">
            <Zap className="h-3 w-3" />
            Powered by Google Gemini AI
          </div>
          <h2 className="animate-fade-in-delay-1 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary-foreground max-w-4xl mx-auto leading-[1.1]">
            Every neighborhood has a{" "}
            <span className="text-orange-500">heat debt</span>. We help you
            measure and repay it.
          </h2>
          <p className="animate-fade-in-delay-2 mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-time urban thermal intelligence for Montgomery, Alabama.
            Identify the most heat-vulnerable communities, generate AI-powered
            risk analyses, and auto-fill EPA grant applications — in seconds.
          </p>
          <div className="animate-fade-in-delay-3 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pillars"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-orange-400 hover:border-orange-500/30 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Mock */}
      <section className="container max-w-screen-xl mx-auto px-4 pb-24 lg:pb-32">
        <div className="animate-fade-in-up-delay-4 max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-2xl shadow-orange-500/5 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="rounded-md bg-muted/30 border border-border/30 px-4 py-1 text-xs text-muted-foreground font-mono">
                heatdebt.app/dashboard
              </div>
            </div>
          </div>
          {/* Mock content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score ring */}
            <div className="flex flex-col items-center justify-center gap-3">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="drop-shadow-lg"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                  opacity="0.3"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="70"
                  className="animate-score-fill"
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="56"
                  textAnchor="middle"
                  className="fill-primary-foreground text-3xl font-extrabold"
                  style={{ fontSize: "28px" }}
                >
                  78
                </text>
                <text
                  x="60"
                  y="74"
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: "10px" }}
                >
                  RISK SCORE
                </text>
              </svg>
              <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
                High Risk
              </span>
            </div>
            {/* Mock map */}
            <div className="md:col-span-2 rounded-xl bg-muted/20 border border-border/30 p-4 relative min-h-[160px]">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-orange-500" />
                Montgomery, AL
              </div>
              {/* Dots representing districts */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
              <div
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-orange-500/80 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-2/3 left-2/3 w-2.5 h-2.5 rounded-full bg-yellow-500/80 animate-pulse"
                style={{ animationDelay: "1s" }}
              />
              <div
                className="absolute top-1/4 right-1/4 w-2.5 h-2.5 rounded-full bg-green-500/80 animate-pulse"
                style={{ animationDelay: "1.5s" }}
              />
              <div
                className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-orange-400/80 animate-pulse"
                style={{ animationDelay: "0.8s" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container max-w-screen-xl mx-auto px-4 py-12 lg:py-16">
          {/* Desktop: flex with dividers */}
          <div className="hidden lg:flex items-start justify-between">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center flex-1 stat-divider px-4"
              >
                <p className="text-4xl lg:text-5xl font-extrabold text-orange-500 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-2 max-w-[160px] mx-auto">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          {/* Mobile: grid */}
          <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-orange-500 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section
        id="pillars"
        className="container max-w-screen-xl mx-auto px-4 py-24 lg:py-32"
      >
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground">
            Three Layers of Intelligence
          </h3>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed">
            From raw sensor data to grant-ready documents, HEATDEBT automates
            the entire environmental justice workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => {
            const delayClass =
              i === 0
                ? "animate-fade-in-up-delay-1"
                : i === 1
                  ? "animate-fade-in-up-delay-2"
                  : "animate-fade-in-up-delay-3";
            return (
              <div
                key={pillar.title}
                className={`card-glow rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-8 space-y-4 ${delayClass}`}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <pillar.icon className="h-7 w-7 text-orange-500" />
                </div>
                <h4 className="text-lg font-bold text-primary-foreground">
                  {pillar.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data Sources */}
      <section className="border-t border-border/50 bg-card/20">
        <div className="container max-w-screen-xl mx-auto px-4 py-14 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Database className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Data Sources
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {DATA_SOURCES.map((source) => (
              <span
                key={source}
                className="rounded-full border border-border/30 bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container max-w-screen-xl mx-auto px-4 pt-16 pb-8">
          {/* Brand */}
          <div className="text-center mb-10">
            <h2 className="font-extrabold text-2xl tracking-tight">
              <span className="text-primary-foreground">HEAT</span>
              <span className="text-orange-500">DEBT</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
              Urban Thermal Intelligence
            </p>
          </div>
          {/* Bottom */}
          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                Montgomery, Alabama
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built by Erisa &amp; Adeline &middot; GenAI Hackathon 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
