"use client";

import { useState, useTransition } from "react";
import type { District } from "@/lib/district-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateReport } from "@/app/actions";
import type { GenerateGrantReportSummaryOutput } from "@/ai/flows/generate-grant-report-summary-flow";

type GrantReportGeneratorProps = {
  district: District;
};

const GrantDetails = ({
  summary,
  district,
}: {
  summary: GenerateGrantReportSummaryOutput;
  district: District;
}) => {
  const narrative = summary.narrative
    .replace(/\[DISTRICT_NAME\]/g, district.name)
    .replace(/\[CITY_NAME\]/g, "Montgomery")
    .replace(/\[STATE_NAME\]/g, "Alabama")
    .replace(/\[DYNAMIC_YEAR\]/g, new Date().getFullYear().toString())
    .replace(/\[HEAT_INDEX_F\]/g, `${district.heatIndex}°F`)
    .replace(/\[POPULATION\]/g, district.population.toLocaleString())
    .replace(/\[GREEN_SPACE_PERCENT\]/g, `${district.greenSpacePercentage}%`)
    .replace(/\[AC_ACCESS_PERCENT\]/g, `${district.acAccessPercentage}%`);

  return (
    <div className="mt-6 space-y-6">
      <Card className="border-accent/30 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                {summary.grantSource}
              </p>
              <CardTitle className="text-lg font-bold text-primary-foreground mt-1">
                {summary.grantTitle}
              </CardTitle>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-2xl font-bold text-primary">
                {summary.grantAmount}
              </p>
              <p className="text-xs text-muted-foreground">Maximum Award</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
          <div>
            <p className="text-muted-foreground font-medium">
              Application Deadline
            </p>
            <p className="font-semibold text-primary-foreground">
              {summary.applicationDeadline}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">
              Eligible Applicants
            </p>
            <p className="font-semibold text-primary-foreground">
              {summary.eligibleApplicants}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-semibold text-primary-foreground/90 mb-2">
          Grant Application Narrative
        </h3>
        <p className="text-sm whitespace-pre-wrap text-primary-foreground/90 leading-relaxed">
          {narrative}
        </p>
      </div>
    </div>
  );
};

export default function GrantReportGenerator({
  district,
}: GrantReportGeneratorProps) {
  const [summary, setSummary] =
    useState<GenerateGrantReportSummaryOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const onGenerate = () => {
    setSummary(null);
    startTransition(async () => {
      // Only send serializable fields to server action (no GeoJSON feature)
      const result = await handleGenerateReport({
        name: district.name,
        heatRisk: district.heatRisk,
        heatIndex: district.heatIndex,
        population: district.population,
        greenSpacePercentage: district.greenSpacePercentage,
        pollutionRate: district.pollutionRate,
        acAccessPercentage: district.acAccessPercentage,
        communityFacilities: district.communityFacilities,
        identifiedNeeds: district.identifiedNeeds,
      });
      if (result.summary) {
        setSummary(result.summary);
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: result.error,
        });
      }
    });
  };

  return (
    <Card className="bg-card/70 border-accent/30">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-accent" />
          <div>
            <CardTitle className="text-xl text-primary-foreground">
              AI Grant Report Tool
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate a narrative summary for grant applications.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!summary && !isPending && (
          <div className="relative rounded-lg border border-dashed border-border bg-muted/20 p-4 overflow-hidden mb-4">
            <div className="space-y-2 filter blur-sm pointer-events-none">
              <div className="h-3 w-3/4 rounded bg-muted-foreground/20"></div>
              <div className="h-3 w-full rounded bg-muted-foreground/20"></div>
              <div className="h-3 w-5/6 rounded bg-muted-foreground/20"></div>
              <div className="h-3 w-full rounded bg-muted-foreground/20"></div>
            </div>
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center p-4 rounded-lg">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <p className="text-sm font-semibold text-primary-foreground mt-2">
                  Preview of AI-Generated Report
                </p>
                <p className="text-xs text-muted-foreground">
                  Generate to see the full report.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button onClick={onGenerate} disabled={isPending} className="w-full">
          {isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isPending
            ? "Generating Summary..."
            : "Generate for " + district.name}
        </Button>

        {isPending && !summary && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-4 w-4/6 animate-pulse rounded bg-muted-foreground/20"></div>
            </div>
          </div>
        )}
        {summary && <GrantDetails summary={summary} district={district} />}
      </CardContent>
    </Card>
  );
}
