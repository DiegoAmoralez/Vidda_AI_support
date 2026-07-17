"use client";

import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auditEvents } from "@/data/seed";
import { useDemoStore } from "@/store/demo-store";

const downloadReport = (format: "csv" | "pdf") => {
  const content =
    format === "csv"
      ? "metric,value\nOverall readiness,78%\nEmployees assessed,1248\nCases completed,8420\nHigh-risk employees,46\n"
      : "VIDDA COMPLIANCE READINESS REPORT\nNordBank International\n\nOverall readiness: 78%\nEmployees assessed: 1,248\nCases completed: 8,420\nCritical capability gaps: 7\n\nSimulated data — training prototype.";
  const blob = new Blob([content], {
    type: format === "csv" ? "text/csv" : "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vidda-compliance-readiness.${format === "csv" ? "csv" : "txt"}`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`${format.toUpperCase()} report downloaded`);
};

const reportTypes = [
  "Executive Compliance Readiness Report",
  "Capability Gap Report",
  "Regulatory Change Coverage",
  "High-Risk Employee Report",
  "Department Comparison",
  "Learning Campaign Performance",
  "Repeated Error Analysis",
  "Audit and Evidence Report",
  "Policy-to-Capability Mapping",
  "Assessment History",
];

export const ReportsScreen = () => (
  <Page title="Reports" eyebrow="Board-ready evidence" description="Generate consistent evidence for executives, auditors and regulatory stakeholders.">
    <Card className="border-none bg-[var(--vidda-primary)] text-white shadow-none"><CardContent className="p-7 sm:p-9"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--vidda-accent)] text-[var(--vidda-primary)]"><Icon icon="solar:magic-stick-3-linear" className="size-5" /></span><div><p className="text-sm font-extrabold">Executive summary · Q2 2026</p><p className="mt-3 max-w-4xl text-sm leading-7 text-white/65">During the reporting period, 1,248 employees completed 8,420 practical compliance cases. Overall readiness increased from 69% to 78%. The most significant remaining risk concerns escalation timing in high-value cash transaction scenarios.</p></div></div></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reportTypes.map((report, index) => <Card key={report} className="group shadow-none transition-transform hover:-translate-y-1"><CardContent className="p-5"><div className="flex justify-between"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-[var(--vidda-primary)]"><Icon icon={index % 2 ? "solar:chart-2-linear" : "solar:document-text-linear"} className="size-5" /></span><Badge variant="outline">{index < 3 ? "Recommended" : "Template"}</Badge></div><h2 className="mt-5 text-base font-extrabold">{report}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Current NordBank scope · Last 90 days · Simulated evidence.</p><Button variant="ghost" className="mt-4 px-0" onClick={() => toast.info(`${report} preview opened`)}>Open report <Icon icon="solar:arrow-right-linear" /></Button></CardContent></Card>)}</div>
    <div className="flex flex-wrap gap-2"><Button onClick={() => downloadReport("pdf")} className="gap-2"><Icon icon="solar:file-download-linear" />Export PDF</Button><Button variant="outline" onClick={() => downloadReport("csv")}>Export CSV</Button><Button variant="outline" onClick={() => toast.success("Report scheduled for the first business day monthly")}>Schedule report</Button><Button variant="ghost" onClick={() => toast.success("Secure stakeholder link generated")}>Send to stakeholder</Button><Button variant="secondary" className="ml-auto gap-2" onClick={() => window.location.assign("/portal/executive-demo")}>Open executive demo screen<Icon icon="solar:arrow-right-linear" /></Button></div>
  </Page>
);

export const AuditTrailScreen = () => {
  const overlay = useDemoStore((state) => state.auditOverlay);
  const events = [...overlay, ...auditEvents];
  return (
    <Page title="Audit Trail" eyebrow="Immutable evidence record" description="Every policy, AI, expert and employee action is versioned with actor, source and reason.">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4"><Badge variant="outline" className="gap-1.5"><Icon icon="solar:lock-keyhole-linear" />Immutable record</Badge><span className="text-xs text-muted-foreground">Hash chain verified · Last validation 17 Jul 2026, 15:00 CET</span><Button variant="outline" size="sm" className="ml-auto" onClick={() => downloadReport("csv")}>Export evidence</Button></div>
      <Card className="overflow-hidden shadow-none"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Previous</TableHead><TableHead>New value</TableHead><TableHead>Reason / source</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{events.map((event) => <TableRow key={event.id}><TableCell className="whitespace-nowrap font-mono text-[10px]">{event.timestamp}</TableCell><TableCell><p className="text-xs font-bold">{event.actor}</p><Badge variant="outline" className="mt-1 text-[9px]">{event.actorType}</Badge></TableCell><TableCell className="text-xs font-bold">{event.action}</TableCell><TableCell className="max-w-44 text-xs">{event.entity}</TableCell><TableCell className="max-w-36 text-[10px] text-muted-foreground">{event.previousValue}</TableCell><TableCell className="max-w-36 text-[10px]">{event.newValue}</TableCell><TableCell className="max-w-48"><p className="text-[10px]">{event.reason}</p><p className="mt-1 text-[9px] text-muted-foreground">{event.source}</p></TableCell><TableCell><Badge variant="outline">{event.status}</Badge></TableCell></TableRow>)}</TableBody></Table></div></Card>
    </Page>
  );
};

const guardrails = [
  "Answers grounded in approved documents",
  "Sources always displayed",
  "Low-confidence answers escalated",
  "No autonomous regulatory decisions",
  "Human approval for generated cases",
  "No automatic disciplinary decisions",
  "Employee data access based on role",
  "Full audit logging",
];

export const AiGovernanceScreen = () => (
  <Page title="AI Governance" eyebrow="Controlled, explainable, reviewable" description="The coach operates within approved knowledge, confidence thresholds and human oversight.">
    <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
      <Card className="shadow-none"><CardContent className="p-6"><p className="text-lg font-extrabold">AI model information</p><div className="mt-5 space-y-3">{[["Model", "Vidda Compliance Reasoning Engine"], ["Version", "0.9 Demo"], ["Knowledge base", "2026.07.17"], ["Last validation", "15 Jul 2026"], ["Approved use", "Training and capability assessment"], ["Responsible owner", "NordBank Model Risk Committee"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b pb-3 text-xs"><span className="text-muted-foreground">{label}</span><span className="text-right font-bold">{value}</span></div>)}</div></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-6"><p className="text-lg font-extrabold">Guardrails</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{guardrails.map((guardrail) => <div key={guardrail} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Icon icon="solar:check-read-linear" /></span><span className="text-xs font-medium">{guardrail}</span></div>)}</div></CardContent></Card>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="shadow-none"><CardContent className="p-6"><p className="text-lg font-extrabold">Confidence thresholds</p><div className="mt-5 space-y-3">{[[92, "Above 85% · Standard cited response", "bg-emerald-600"], [76, "65–85% · Response with warning", "bg-amber-500"], [54, "Below 65% · Expert review required", "bg-red-600"]].map(([value, label, tone]) => <div key={String(label)} className="rounded-xl border p-4"><div className="flex justify-between text-xs"><span className="font-bold">{label}</span><span className="font-mono">{value}% example</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full ${tone}`} style={{ width: `${value}%` }} /></div></div>)}</div></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-6"><p className="text-lg font-extrabold">AI monitoring</p><div className="mt-5 space-y-4">{[["Grounded answer rate", 98], ["Citation coverage", 100], ["Case approval rate", 91], ["Outdated source detection", 97], ["Human agreement rate", 94]].map(([label, value]) => <div key={String(label)}><div className="mb-2 flex justify-between text-xs"><span>{label}</span><span className="font-mono font-bold">{value}%</span></div><Progress value={Number(value)} className="h-1.5" /></div>)}</div></CardContent></Card>
    </div>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">AI-generated content must be reviewed against approved bank policies. Training results must not be used as the sole basis for disciplinary or employment decisions.</p>
  </Page>
);

export const SettingsScreen = () => (
  <Page title="Platform settings" eyebrow="System administration" description="Manage role access, simulated integrations, notifications and AI behavior for this tenant.">
    <div className="grid gap-5 lg:grid-cols-2">
      <SettingsCard title="Integrations" icon="solar:link-round-linear" rows={["Microsoft Teams", "Slack", "NordBank HRIS", "Policy repository"]} />
      <SettingsCard title="Notification channels" icon="solar:bell-linear" rows={["In-app notifications", "Email delivery", "Mobile push", "Manager escalation"]} />
      <SettingsCard title="AI settings" icon="solar:magic-stick-3-linear" rows={["Grounded responses only", "Expert review below 65%", "Source version enforcement", "Assessment dispute workflow"]} />
      <SettingsCard title="Security and access" icon="solar:shield-keyhole-linear" rows={["Role-based employee data", "SSO simulation", "Session timeout", "Immutable audit log"]} />
    </div>
    <div className="flex justify-end"><Button onClick={() => toast.success("Tenant settings saved")}>Save settings</Button></div>
  </Page>
);

const SettingsCard = ({ title, icon, rows }: { title: string; icon: string; rows: string[] }) => <Card className="shadow-none"><CardContent className="p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-secondary"><Icon icon={icon} /></span><p className="text-lg font-extrabold">{title}</p></div><div className="mt-5 space-y-3">{rows.map((row, index) => <div key={row} className="flex items-center justify-between rounded-xl border p-3"><div><p className="text-xs font-bold">{row}</p><p className="mt-1 text-[10px] text-muted-foreground">{index % 3 === 0 ? "Connected · checked 4 min ago" : "Configured for NordBank demo"}</p></div><Switch defaultChecked={index !== 2} aria-label={`Toggle ${row}`} /></div>)}</div></CardContent></Card>;

export const ExecutiveDemoScreen = () => (
  <div className="space-y-8">
    <div className="rounded-[2rem] bg-[var(--vidda-primary)] p-8 text-white sm:p-12"><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[var(--vidda-accent)]">Executive demo conclusion</p><h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">From regulatory change to measurable readiness</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Transform regulatory updates into measurable employee capabilities.</p></div>
    <div className="grid gap-3 md:grid-cols-5">{["Regulation changes", "AI identifies impacted requirements", "Employees receive role-specific cases", "Capabilities are measured continuously", "Compliance risks become actionable"].map((step, index) => <Card key={step} className="shadow-none"><CardContent className="p-5"><span className="font-mono text-xs font-bold text-[var(--vidda-primary)]">0{index + 1}</span><p className="mt-6 text-sm font-extrabold leading-5">{step}</p></CardContent></Card>)}</div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["Faster response to regulatory change", "Personalized learning at scale", "Evidence-based capability management", "Early identification of compliance risk", "Reduced dependency on static courses", "Measurable readiness across the organization"].map((outcome) => <div key={outcome} className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm font-bold"><span className="grid size-7 place-items-center rounded-full bg-[var(--vidda-accent)] text-[var(--vidda-primary)]"><Icon icon="solar:check-read-linear" /></span>{outcome}</div>)}</div>
    <Card className="border-none bg-[var(--vidda-accent)] shadow-none"><CardContent className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-2xl font-extrabold text-[var(--vidda-primary)]">Explore a pilot for your compliance team</p><p className="mt-1 text-sm text-[var(--vidda-primary)]/65">Start with one policy change, one role group and measurable readiness goals.</p></div><Button size="lg" className="gap-2" onClick={() => toast.success("Pilot brief created for NordBank International")}>Create pilot brief<Icon icon="solar:arrow-right-linear" /></Button></CardContent></Card>
  </div>
);

const Page = ({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) => <div className="space-y-7"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div>{children}</div>;
