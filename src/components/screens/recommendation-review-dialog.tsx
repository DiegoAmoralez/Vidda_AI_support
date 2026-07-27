"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RecommendationReview } from "@/lib/knowledge/recommendation-review";
import { useAiSettingsStore } from "@/store/ai-settings-store";

type RecommendationReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary: string;
};

export const RecommendationReviewDialog = ({
  open,
  onOpenChange,
  title,
  summary,
}: RecommendationReviewDialogProps) => {
  const neuralEnabled = useAiSettingsStore((state) => state.neuralEnabled);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<RecommendationReview | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setReview(null);
      try {
        const response = await fetch("/api/recommendation-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, summary, neuralEnabled }),
        });
        const payload = (await response.json()) as RecommendationReview & {
          error?: string;
        };
        if (!response.ok) {
          toast.error(payload.error ?? "Could not review recommendation");
          return;
        }
        if (!cancelled) {
          setReview(payload);
          if (payload.warning) toast.message(payload.warning);
        }
      } catch {
        if (!cancelled) toast.error("Network error while reviewing recommendation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, title, summary, neuralEnabled]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review recommendation</DialogTitle>
          <DialogDescription>
            AI review package based on the improvement signal and proposed microlearning theme.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-secondary/50 p-4">
          <p className="text-sm font-extrabold">{title}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{summary}</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-xl border p-6 text-sm text-muted-foreground">
            <Icon icon="solar:refresh-circle-linear" className="size-5 animate-spin text-[var(--vidda-accent)]" />
            Generating review suggestions…
          </div>
        ) : null}

        {review ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {review.mode === "neural" ? "Mistral review" : "Demo review"}
              </Badge>
              {review.warning ? (
                <span className="text-[11px] text-amber-700">{review.warning}</span>
              ) : null}
            </div>

            <section className="rounded-xl border p-4">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Analysis
              </p>
              <p className="mt-2 text-sm leading-6">{review.analysis}</p>
            </section>

            <section className="rounded-xl border p-4">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Learning objective
              </p>
              <p className="mt-2 text-sm leading-6">{review.learningObjective}</p>
            </section>

            <section className="rounded-xl border p-4">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Suggested case
              </p>
              <p className="mt-2 text-sm leading-6">{review.caseIdea}</p>
            </section>

            <section className="rounded-xl border p-4">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Key teaching points
              </p>
              <ul className="mt-3 space-y-2">
                {review.keyTeachingPoints.map((point) => (
                  <li key={point} className="flex gap-2 text-sm leading-5">
                    <Icon icon="solar:check-circle-linear" className="mt-0.5 size-4 shrink-0 text-[var(--vidda-accent)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border p-4">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Recommended next actions
              </p>
              <ul className="mt-3 space-y-2">
                {review.recommendedActions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm leading-5">
                    <Icon icon="solar:arrow-right-linear" className="mt-0.5 size-4 shrink-0 text-[var(--vidda-primary)]" />
                    {action}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="font-mono text-[9px] uppercase tracking-wider text-amber-900/70">
                Expert checklist
              </p>
              <ul className="mt-3 space-y-2">
                {review.expertChecklist.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-5 text-amber-950">
                    <Icon icon="solar:shield-check-linear" className="mt-0.5 size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  toast.success("Review package marked ready for expert validation");
                  onOpenChange(false);
                }}
              >
                Accept for expert review
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
