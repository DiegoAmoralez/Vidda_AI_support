"use client";

import { Icon } from "@iconify/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { CapabilityHeatmap } from "@/components/analytics/capability-heatmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bankMetrics, readinessTrend } from "@/data/seed";
import { useDemoStore } from "@/store/demo-store";

const kpis = [
  ["Overall readiness", `${bankMetrics.readiness}%`, "Target 85%", "solar:shield-check-linear"],
  ["Employees assessed", "1,248", "93% of scope", "solar:users-group-rounded-linear"],
  ["Active this week", "84%", "+5% vs last week", "solar:bolt-linear"],
  ["High-risk employees", "46", "24 in Corporate", "solar:danger-triangle-linear"],
  ["Critical gaps", "7", "2 newly detected", "solar:graph-down-linear"],
  ["Cases completed", "8,420", "76% daily completion", "solar:case-round-linear"],
  ["Average score", "76%", "+3% this month", "solar:chart-square-linear"],
  ["Update coverage", "68%", "87 require action", "solar:refresh-circle-linear"],
];

export const ComplianceOverview = () => {
  const riskAlertVisible = useDemoStore((state) => state.riskAlertVisible);
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">NordBank International · Group view</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Compliance Capability Overview</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {["90 days", "All units", "All countries", "All roles"].map((value, index) => (
            <Select key={value} defaultValue={value}>
              <SelectTrigger className="h-9 w-auto min-w-28 bg-white text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={value}>{value}</SelectItem>
                <SelectItem value={`Filtered ${index}`}>Corporate Banking</SelectItem>
                <SelectItem value={`Alternative ${index}`}>Poland</SelectItem>
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([label, value, detail, icon], index) => (
          <Card key={label} className="shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start justify-between"><p className="text-[11px] font-bold text-muted-foreground">{label}</p><Icon icon={icon} className={index === 3 || index === 4 ? "text-red-600" : "text-[var(--vidda-primary)]"} /></div>
              <p className="metric-number mt-3 text-2xl font-extrabold">{value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between"><div><p className="text-sm font-extrabold">Readiness trend</p><p className="mt-1 text-xs text-muted-foreground">Practical capability signals · last 90 days</p></div><Badge variant="secondary">+9%</Badge></div>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={readinessTrend}>
                  <defs><linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#173f3a" stopOpacity={0.32} /><stop offset="100%" stopColor="#173f3a" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="#e4e8e3" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} />
                  <YAxis domain={[60, 90]} axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="readiness" stroke="#173f3a" fill="url(#readinessFill)" strokeWidth={3} />
                  <Area type="monotone" dataKey="target" stroke="#b26a20" fill="transparent" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-[var(--vidda-primary)] text-white shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[var(--vidda-accent)] text-[var(--vidda-primary)]"><Icon icon="solar:magic-stick-3-linear" /></span><div><p className="text-sm font-extrabold">Executive AI summary</p><p className="text-[10px] text-white/45">Grounded in 8,420 assessments</p></div></div>
            <p className="mt-5 text-sm leading-7 text-white/66">
              Compliance readiness increased by 9% during the last 90 days. However,
              AML Escalation remains below target in Corporate Banking and Warsaw
              Branch 04. Employees understand customer due diligence requirements but
              frequently delay escalation until after transaction execution.
            </p>
            <Button variant="outline" size="sm" className="mt-5 border-white/15 bg-white/[0.05] text-white hover:bg-white/10 hover:text-white" onClick={() => toast.success("Executive summary copied to report draft")}>
              Add to executive report
            </Button>
          </CardContent>
        </Card>
      </div>

      {riskAlertVisible && (
        <Card className="border-amber-200 bg-amber-50/70 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-950"><Icon icon="solar:danger-triangle-linear" className="size-5" /></span>
              <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-extrabold">Priority risk alerts</h2><Badge variant="destructive">4 active</Badge></div><div className="mt-4 grid gap-3 md:grid-cols-2">{[
                "75% of Corporate Banking employees failed at least one KYC escalation case.",
                "28 employees repeated the same critical error three times.",
                "87 employees have not completed reassessment after Policy v4.7.",
                "Sanctions knowledge decreased by 6% among recently onboarded staff.",
              ].map((alert) => <button key={alert} onClick={() => toast.info("Risk detail opened")} className="rounded-xl border border-amber-200 bg-white/70 p-3 text-left text-xs leading-5 text-amber-950 hover:-translate-y-0.5 hover:bg-white">{alert}</button>)}</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-lg font-extrabold">Capability heatmap</p><p className="mt-1 text-xs text-muted-foreground">Click any cell to inspect the practical decision gap.</p></div><Button variant="outline" size="sm" onClick={() => toast.success("Heatmap filters applied")}>Filter capabilities</Button></div>
          <CapabilityHeatmap />
        </CardContent>
      </Card>
    </div>
  );
};
