"use client";

import { useState } from "react";
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
import { capabilityColumns, heatmapData } from "@/data/seed";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const cellTone = (score: number) => {
  if (score >= 85) return "bg-emerald-700 text-white";
  if (score >= 75) return "bg-emerald-200 text-emerald-950";
  if (score >= 65) return "bg-amber-200 text-amber-950";
  if (score >= 55) return "bg-orange-400 text-white";
  return "bg-red-700 text-white";
};

export const CapabilityHeatmap = () => {
  const [selection, setSelection] = useState<{ department: string; capability: string; score: number } | null>(null);
  const launchCampaign = useDemoStore((state) => state.launchCampaign);

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[1020px]">
          <div className="grid grid-cols-[170px_repeat(10,1fr)] gap-1">
            <div />
            {capabilityColumns.map((capability) => (
              <div key={capability} className="flex h-32 items-end justify-center pb-2">
                <span className="origin-bottom-left -rotate-48 whitespace-nowrap text-[9px] font-bold text-muted-foreground">
                  {capability}
                </span>
              </div>
            ))}
            {heatmapData.flatMap((row) => [
              <div key={`${row.department}-label`} className="flex items-center pr-3 text-xs font-bold">
                {row.department}
              </div>,
              ...row.scores.map((score, column) => (
                <button
                  key={`${row.department}-${capabilityColumns[column]}`}
                  className={cn(
                    "grid h-11 place-items-center rounded-md font-mono text-[10px] font-bold hover:z-10 hover:scale-110 hover:shadow-lg focus-visible:z-10",
                    cellTone(score),
                  )}
                  title={`${row.department} · ${capabilityColumns[column]}: ${score}%`}
                  onClick={() =>
                    setSelection({
                      department: row.department,
                      capability: capabilityColumns[column],
                      score,
                    })
                  }
                >
                  {score}
                </button>
              )),
            ])}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        {[["Strong", "bg-emerald-700"], ["Acceptable", "bg-emerald-200"], ["Attention required", "bg-amber-200"], ["High risk", "bg-orange-400"], ["Critical", "bg-red-700"]].map(([label, tone]) => (
          <span key={label} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-sm ${tone}`} />{label}</span>
        ))}
      </div>
      <Dialog open={Boolean(selection)} onOpenChange={(open) => !open && setSelection(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selection?.department} × {selection?.capability}</DialogTitle>
            <DialogDescription>Capability drill-down based on practical case decisions.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[["Readiness", `${selection?.score}%`], ["Employees", selection?.department === "Corporate Banking" ? "146" : "118"], ["Cases completed", "820"], ["Incorrect decisions", selection?.department === "Corporate Banking" ? "238" : "96"], ["Trend", selection?.score && selection.score < 65 ? "−4%" : "+6%"], ["Risk level", selection?.score && selection.score < 65 ? "High" : "Acceptable"]].map(([label, value]) => (
              <div key={label} className="rounded-xl border p-4"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-lg font-extrabold">{value}</p></div>
            ))}
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-extrabold">Most common error</p>
            <p className="mt-1 text-xs">Transaction completed before escalation.</p>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline">Recommended: targeted 5-day campaign</Badge>
            <Button onClick={() => { launchCampaign(); toast.success("Targeted campaign launched"); setSelection(null); }}>
              Launch targeted campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
