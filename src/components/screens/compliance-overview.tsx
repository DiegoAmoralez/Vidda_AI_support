"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
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

const countrySnapshots: Record<
  string,
  {
    readiness: number;
    employees: number;
    highRisk: number;
    gaps: number;
    updateCoverage: number;
  }
> = {
  "All countries": { readiness: bankMetrics.readiness, employees: 1248, highRisk: 46, gaps: 7, updateCoverage: 68 },
  Poland: { readiness: 74, employees: 318, highRisk: 18, gaps: 5, updateCoverage: 61 },
  Austria: { readiness: 82, employees: 146, highRisk: 4, gaps: 2, updateCoverage: 78 },
  Germany: { readiness: 80, employees: 242, highRisk: 7, gaps: 3, updateCoverage: 73 },
  Sweden: { readiness: 85, employees: 105, highRisk: 2, gaps: 1, updateCoverage: 88 },
  Netherlands: { readiness: 79, employees: 96, highRisk: 3, gaps: 2, updateCoverage: 76 },
  "Czech Republic": { readiness: 72, employees: 87, highRisk: 6, gaps: 4, updateCoverage: 57 },
};

const roleSnapshots: Record<
  string,
  { employees: number; readinessDelta: number; highRisk: number; gaps: number }
> = {
  "Retail Banking Relationship Manager": { employees: 286, readinessDelta: -2, highRisk: 14, gaps: 4 },
  "Corporate Banking Relationship Manager": { employees: 164, readinessDelta: -5, highRisk: 16, gaps: 5 },
  "Branch Manager": { employees: 92, readinessDelta: 3, highRisk: 3, gaps: 2 },
  "KYC Analyst": { employees: 138, readinessDelta: 1, highRisk: 5, gaps: 3 },
  "AML Investigator": { employees: 64, readinessDelta: 5, highRisk: 2, gaps: 1 },
  "Payments Operations Specialist": { employees: 174, readinessDelta: -1, highRisk: 4, gaps: 3 },
  "Compliance Officer": { employees: 76, readinessDelta: 6, highRisk: 1, gaps: 1 },
};

const periodSnapshots: Record<
  string,
  { cases: string; active: string; average: string; trend: string }
> = {
  "30 days": { cases: "2,960", active: "88%", average: "77%", trend: "+2%" },
  "90 days": { cases: "8,420", active: "84%", average: "76%", trend: "+9%" },
  "180 days": { cases: "15,880", active: "81%", average: "75%", trend: "+13%" },
  "Year to date": { cases: "20,410", active: "79%", average: "74%", trend: "+17%" },
};

const overviewFilters = [
  {
    id: "period",
    label: "Period",
    defaultValue: "90 days",
    options: ["30 days", "90 days", "180 days", "Year to date"],
  },
  {
    id: "unit",
    label: "Business unit",
    defaultValue: "All business units",
    options: [
      "All business units",
      "Retail Banking",
      "Corporate Banking",
      "Payments & Operations",
      "Risk & Compliance",
      "Technology",
    ],
  },
  {
    id: "country",
    label: "Country",
    defaultValue: "All countries",
    options: [
      "All countries",
      "Poland",
      "Austria",
      "Germany",
      "Sweden",
      "Netherlands",
      "Czech Republic",
    ],
  },
  {
    id: "jobRole",
    label: "Job role",
    defaultValue: "All job roles",
    options: [
      "All job roles",
      "Retail Banking Relationship Manager",
      "Corporate Banking Relationship Manager",
      "Branch Manager",
      "KYC Analyst",
      "AML Investigator",
      "Payments Operations Specialist",
      "Compliance Officer",
    ],
  },
] as const;

type OverviewFilterId = (typeof overviewFilters)[number]["id"];

export const ComplianceOverview = () => {
  const riskAlertVisible = useDemoStore((state) => state.riskAlertVisible);
  const [filters, setFilters] = useState<Record<OverviewFilterId, string>>({
    period: "90 days",
    unit: "All business units",
    country: "All countries",
    jobRole: "All job roles",
  });
  const hasActiveScope = overviewFilters.some(
    (filter) => filters[filter.id] !== filter.defaultValue,
  );
  const countrySnapshot = countrySnapshots[filters.country];
  const roleSnapshot = roleSnapshots[filters.jobRole];
  const periodSnapshot = periodSnapshots[filters.period];
  const scopedReadiness = Math.max(
    0,
    Math.min(
      100,
      countrySnapshot.readiness + (roleSnapshot?.readinessDelta ?? 0),
    ),
  );
  const scopedEmployees = roleSnapshot?.employees ?? countrySnapshot.employees;
  const kpis = [
    ["Overall readiness", `${scopedReadiness}%`, "Target 85%", "solar:shield-check-linear"],
    ["Employees assessed", scopedEmployees.toLocaleString("en-US"), `${filters.country} scope`, "solar:users-group-rounded-linear"],
    ["Active this week", periodSnapshot.active, `${filters.period} view`, "solar:bolt-linear"],
    ["High-risk employees", String(roleSnapshot?.highRisk ?? countrySnapshot.highRisk), filters.jobRole, "solar:danger-triangle-linear"],
    ["Critical gaps", String(roleSnapshot?.gaps ?? countrySnapshot.gaps), `${filters.unit} coverage`, "solar:graph-down-linear"],
    ["Cases completed", periodSnapshot.cases, `${filters.period} total`, "solar:case-round-linear"],
    ["Average score", periodSnapshot.average, `${filters.country} assessment scope`, "solar:chart-square-linear"],
    ["Update coverage", `${countrySnapshot.updateCoverage}%`, `${100 - countrySnapshot.updateCoverage}% require action`, "solar:refresh-circle-linear"],
  ];

  const handleFilterChange = (filterId: OverviewFilterId, value: string) => {
    setFilters((current) => ({ ...current, [filterId]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      period: "90 days",
      unit: "All business units",
      country: "All countries",
      jobRole: "All job roles",
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">NordBank International · Group view</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Compliance Capability Overview</h1>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[.7fr_1fr_.8fr_1.25fr_auto] xl:items-end">
          {overviewFilters.map((filter) => (
            <div key={filter.id}>
              <p className="mb-2 font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                {filter.label}
              </p>
              <Select
                value={filters[filter.id]}
                onValueChange={(value) => handleFilterChange(filter.id, value)}
              >
                <SelectTrigger className="h-10 w-full bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button
            variant="ghost"
            className="h-10 gap-2"
            disabled={!hasActiveScope}
            onClick={handleResetFilters}
          >
            <Icon icon="solar:restart-linear" />
            Reset
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Current scope
          </span>
          {[filters.period, filters.unit, filters.country, filters.jobRole].map(
            (value) => (
              <Badge key={value} variant="secondary">
                {value}
              </Badge>
            ),
          )}
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
            <div className="flex items-start justify-between"><div><p className="text-sm font-extrabold">Readiness trend</p><p className="mt-1 text-xs text-muted-foreground">Practical capability signals · {filters.period.toLowerCase()}</p></div><Badge variant="secondary">{periodSnapshot.trend}</Badge></div>
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
