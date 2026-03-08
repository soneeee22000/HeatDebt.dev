/**
 * Payment gate modal shown before generating a full HEATDEBT report.
 * In demo mode, "Continue with Demo" bypasses payment.
 */

"use client";

import { useRouter } from "next/navigation";
import type { District } from "@/lib/district-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, FileText, ArrowRight } from "lucide-react";

interface PaymentModalProps {
  district: District;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  "Full 5-section vulnerability assessment",
  "AI-powered risk analysis with Gemini",
  "Intervention priority matrix with budgets",
  "EPA EJ grant narrative (copy-ready)",
  "Print-optimized PDF export",
];

export default function PaymentModal({
  district,
  open,
  onOpenChange,
}: PaymentModalProps) {
  const router = useRouter();

  function handleContinueDemo() {
    onOpenChange(false);
    router.push(`/report/${district.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Unlock Full HEATDEBT Report
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive vulnerability assessment for{" "}
            <span className="text-primary-foreground font-medium">
              {district.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-3xl font-extrabold text-primary-foreground">
                $49
              </span>
              <span className="text-sm text-muted-foreground">/report</span>
            </div>
            <div className="text-xs text-muted-foreground">
              or{" "}
              <span className="text-primary-foreground font-semibold">
                $299/mo
              </span>{" "}
              City Plan
            </div>
          </div>

          {/* Feature checklist */}
          <ul className="space-y-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleContinueDemo}
            >
              Continue with Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
