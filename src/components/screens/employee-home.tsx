"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDemoStore } from "@/store/demo-store";

const metricIcons = [
  "solar:flame-linear",
  "solar:chart-square-linear",
  "solar:case-round-linear",
  "solar:graph-up-linear",
];

export const EmployeeHome = () => {
  const router = useRouter();
  const { streak, capabilityScore, completedCases, setStage } = useDemoStore();
  const metrics = [
    { value: `${streak} days`, label: "Current streak", change: "Personal rhythm" },
    { value: `${capabilityScore}%`, label: "Capability score", change: "+8% this month" },
    { value: String(completedCases), label: "Cases completed", change: "4 this week" },
    { value: "+12%", label: "KYC improvement", change: "Last 30 days" },
  ];

  const handleStartCase = () => {
    setStage("intro");
    router.push("/portal/ai-coach");
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
            Friday · 17 July
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Good morning, Anna. Your daily compliance case is ready.
          </h1>
        </div>
        <span className="w-fit rounded-full border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-600" />
          4 min estimated
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={metric.label} className="group border-border/80 shadow-none transition-transform hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary text-[var(--vidda-primary)]">
                  <Icon icon={metricIcons[index]} className="size-[18px]" />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{metric.change}</span>
              </div>
              <p className="metric-number mt-5 text-3xl font-extrabold">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <Card className="overflow-hidden border-none bg-[var(--vidda-primary)] text-white shadow-none">
          <CardContent className="relative p-6 sm:p-8">
            <div className="absolute -right-16 -top-20 size-64 rounded-full bg-[var(--vidda-accent)]/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[var(--vidda-accent)]">
                <Icon icon="solar:chat-round-dots-linear" className="size-5" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em]">Today’s adaptive case</p>
              </div>
              <h2 className="mt-5 max-w-xl text-3xl font-extrabold tracking-[-0.04em]">
                High-value cash transaction
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                Practice applying Enhanced Due Diligence and the updated escalation
                sequence for activity that differs from a corporate customer profile.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["AML / KYC", "Intermediate", "Policy v4.7", "Role-specific"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] text-white/68">{tag}</span>
                ))}
              </div>
              <Button
                size="lg"
                className="mt-8 gap-2 bg-[var(--vidda-accent)] text-[var(--vidda-primary)] hover:-translate-y-0.5 hover:bg-[#daf777]"
                onClick={handleStartCase}
              >
                Start today’s case
                <Icon icon="solar:arrow-right-linear" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[var(--vidda-primary)] text-[var(--vidda-accent)]">
                <Icon icon="solar:magic-stick-3-linear" />
              </span>
              <div>
                <p className="text-sm font-extrabold">AI progress summary</p>
                <p className="text-[10px] text-muted-foreground">Updated after your last case</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Your KYC performance has improved by 12% during the last month.
              Enhanced Due Diligence remains your primary development area.
            </p>
            <div className="mt-6 space-y-4">
              <ProgressLine label="KYC procedure" value={82} />
              <ProgressLine label="Source of funds" value={75} />
              <ProgressLine label="AML escalation" value={54} attention />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard icon="solar:danger-triangle-linear" title="2 areas require attention" detail="Escalation timing · Tipping-off prevention" tone="warning" />
        <InfoCard icon="solar:refresh-circle-linear" title="3 regulatory updates" detail="1 update affects your current role" tone="info" />
        <InfoCard icon="solar:calendar-linear" title="Next reassessment" detail="Enhanced Due Diligence · 22 July" tone="success" />
      </div>
    </div>
  );
};

const ProgressLine = ({ label, value, attention = false }: { label: string; value: number; attention?: boolean }) => (
  <div>
    <div className="mb-1.5 flex justify-between text-xs">
      <span>{label}</span>
      <span className={attention ? "font-bold text-amber-700" : "font-bold"}>{value}%</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

const InfoCard = ({ icon, title, detail, tone }: { icon: string; title: string; detail: string; tone: "warning" | "info" | "success" }) => {
  const tones = {
    warning: "bg-amber-50 text-amber-800",
    info: "bg-blue-50 text-blue-800",
    success: "bg-emerald-50 text-emerald-800",
  };
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon icon={icon} className="size-5" /></span>
        <div><p className="text-sm font-extrabold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail}</p></div>
      </CardContent>
    </Card>
  );
};
