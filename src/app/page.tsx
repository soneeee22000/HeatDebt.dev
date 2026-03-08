/**
 * Landing page for HEATDEBT — public marketing page.
 */

import Link from "next/link";
import {
  Thermometer,
  DollarSign,
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 mx-auto">
          <h1 className="font-extrabold text-xl tracking-tight">
            <span className="text-primary-foreground">HEAT</span>
            <span className="text-orange-500">DEBT</span>
          </h1>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary-foreground transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container max-w-screen-xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs text-orange-400 mb-6">
          <Zap className="h-3 w-3" />
          Powered by Google Gemini AI
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground max-w-4xl mx-auto leading-tight">
          Every neighborhood has a{" "}
          <span className="text-orange-500">heat debt</span>. We help you
          measure and repay it.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Real-time urban thermal intelligence for Montgomery, Alabama. Identify
          the most heat-vulnerable communities, generate AI-powered risk
          analyses, and auto-fill EPA grant applications — in seconds.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#pillars"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:border-primary-foreground/30 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container max-w-screen-xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-orange-500">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
        className="container max-w-screen-xl mx-auto px-4 py-20"
      >
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-primary-foreground">
            Three Layers of Intelligence
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            From raw sensor data to grant-ready documents, HEATDEBT automates
            the entire environmental justice workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <pillar.icon className="h-6 w-6 text-orange-500" />
              </div>
              <h4 className="text-lg font-bold text-primary-foreground">
                {pillar.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="border-t border-border/50 bg-card/20">
        <div className="container max-w-screen-xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Data Sources
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            NWS Weather API &middot; Open-Meteo &middot; US Census ACS &middot;
            EPA AirNow &middot; Montgomery ArcGIS Open Data &middot; CartoDB
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container max-w-screen-xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </footer>
    </div>
  );
}
