"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { learningCases } from "@/data/cases";
import { policyDocuments } from "@/data/seed";
import type { PolicyDocument } from "@/domain/types";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export const KnowledgeBaseScreen = () => {
  const [query, setQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<PolicyDocument | null>(null);
  const documents = useMemo(
    () =>
      policyDocuments.filter((document) =>
        `${document.title} ${document.category} ${document.owner}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <Page title="Knowledge Base" eyebrow="Approved regulatory sources" description="Policies, standards and procedures are structured into requirements, affected roles and practical capability mappings.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {[["Active documents", "128"], ["Regulatory sources", "17"], ["Internal policies", "54"], ["Procedures", "42"], ["Recently updated", "8"], ["Require review", "3"], ["AI processed", "98%"]].map(([label, value]) => <Card key={label} className="shadow-none"><CardContent className="p-4"><p className="text-[10px] font-bold text-muted-foreground">{label}</p><p className="metric-number mt-2 text-xl font-extrabold">{value}</p></CardContent></Card>)}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="max-w-md bg-white" placeholder="Search documents, owners or categories" />
        <Button onClick={() => toast.success("Document upload processed in simulation")} className="gap-2"><Icon icon="solar:upload-linear" />Upload document</Button>
      </div>
      <Card className="overflow-hidden shadow-none"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Category</TableHead><TableHead>Version</TableHead><TableHead>Effective</TableHead><TableHead>AI status</TableHead><TableHead>Linked cases</TableHead><TableHead>Owner</TableHead><TableHead /></TableRow></TableHeader><TableBody>{documents.map((document) => <TableRow key={document.id}><TableCell><p className="font-bold">{document.title}</p><p className="text-[10px] text-muted-foreground">{document.source} · {document.jurisdiction}</p></TableCell><TableCell><Badge variant="secondary">{document.category}</Badge></TableCell><TableCell className="font-mono text-xs">{document.version}</TableCell><TableCell className="text-xs">{document.effectiveDate}</TableCell><TableCell><Badge variant={document.aiStatus === "Processed" ? "outline" : "destructive"}>{document.aiStatus}</Badge></TableCell><TableCell className="font-mono text-xs">{document.linkedCases}</TableCell><TableCell className="text-xs">{document.owner}</TableCell><TableCell><Button size="sm" variant="ghost" onClick={() => setSelectedDocument(document)}>Open</Button></TableCell></TableRow>)}</TableBody></Table></div></Card>
      <DocumentDialog document={selectedDocument} onClose={() => setSelectedDocument(null)} />
    </Page>
  );
};

const DocumentDialog = ({ document, onClose }: { document: PolicyDocument | null; onClose: () => void }) => (
  <Dialog open={Boolean(document)} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader><DialogTitle>{document?.title}</DialogTitle><DialogDescription>Version {document?.version} · {document?.status} · Owner: {document?.owner}</DialogDescription></DialogHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Effective", document?.effectiveDate], ["Requirements", document?.requirements], ["Linked cases", document?.linkedCases], ["Affected roles", document?.affectedRoles]].map(([label, value]) => <div key={label} className="rounded-xl border p-4"><p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-2 font-extrabold">{value}</p></div>)}</div>
      <div className="rounded-xl bg-secondary p-5"><p className="text-xs font-extrabold">AI document processing</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{["Document uploaded", "Text extracted", "Sections identified", "Requirements classified", "Roles mapped", "Capabilities mapped", "Changes detected", "Cases suggested", "Expert review requested"].map((step, index) => <div key={step} className="flex items-center gap-2 rounded-lg bg-white p-2 text-[10px]"><span className={cn("grid size-5 place-items-center rounded-full", index < 8 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{index < 8 ? "✓" : "!"}</span>{step}</div>)}</div></div>
      <Tabs defaultValue="preview"><TabsList><TabsTrigger value="preview">Document preview</TabsTrigger><TabsTrigger value="changes">Version history</TabsTrigger></TabsList><TabsContent value="preview" className="mt-4 rounded-xl border p-5"><p className="font-mono text-[10px] uppercase text-muted-foreground">Section 8.3 · Enhanced due diligence</p><p className="mt-3 text-sm leading-7">High-value transactions inconsistent with expected customer activity must remain pending while supporting evidence is assessed and the approved escalation procedure is completed.</p></TabsContent><TabsContent value="changes" className="mt-4 space-y-2">{["v4.7 · 12 Jul 2026 · Escalation threshold updated", "v4.6 · 04 Jan 2026 · Annual review", "v4.5 · 18 Sep 2025 · Source-of-funds controls clarified"].map((change) => <div key={change} className="rounded-xl border p-3 text-xs">{change}</div>)}</TabsContent></Tabs>
    </DialogContent>
  </Dialog>
);

export const RegulatoryUpdatesScreen = () => {
  const { regulatoryUpdateTriggered, triggerRegulatoryUpdate, generateCase } = useDemoStore();
  return (
    <Page title="Regulatory Change Impact" eyebrow="Policy v4.6 → v4.7" description="Turn a document change into role-specific communication, reassessment and measurable readiness.">
      {!regulatoryUpdateTriggered && (
        <Card className="border-dashed shadow-none"><CardContent className="p-10 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary"><Icon icon="solar:refresh-circle-linear" className="size-7 text-[var(--vidda-primary)]" /></span><h2 className="mt-5 text-xl font-extrabold">A policy update is ready to simulate.</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Trigger the update to create an impact assessment and targeted workflow.</p><Button className="mt-6" onClick={() => { triggerRegulatoryUpdate(); toast.success("Impact assessment generated"); }}>Trigger Regulatory Update</Button></CardContent></Card>
      )}
      <Card className="overflow-hidden border-none bg-[var(--vidda-primary)] text-white shadow-none"><CardContent className="p-7 sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><Badge className="bg-[var(--vidda-accent)] text-[var(--vidda-primary)]">Impact assessment ready</Badge><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">Enhanced Due Diligence Requirements Updated</h2><p className="mt-2 text-sm text-white/55">Internal AML Policy v4.7 · Effective 12 July 2026</p></div><div className="rounded-xl bg-white/[0.07] p-4 text-right"><p className="font-mono text-[9px] uppercase text-white/45">Change confidence</p><p className="mt-1 text-2xl font-extrabold">97%</p></div></div><div className="mt-7 grid gap-2 sm:grid-cols-2">{["New escalation threshold for high-value cash transactions", "Additional source-of-funds evidence required", "Updated approval authority", "Revised customer communication instructions"].map((change) => <div key={change} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs"><Icon icon="solar:check-circle-linear" className="shrink-0 text-[var(--vidda-accent)]" />{change}</div>)}</div></CardContent></Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{[["Business units", "4"], ["Employee roles", "7"], ["Notify", "326"], ["Reassess", "87"], ["Cases to update", "6"], ["AI case drafts", "2"], ["Due", "7 days"]].map(([label, value]) => <Card key={label} className="shadow-none"><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">{label}</p><p className="metric-number mt-2 text-2xl font-extrabold">{value}</p></CardContent></Card>)}</div>
      <Card className="shadow-none"><CardContent className="p-6"><p className="text-lg font-extrabold">Controlled workflow</p><div className="mt-6 grid gap-2 md:grid-cols-6">{["Regulation updated", "Impact identified", "Cases generated", "Expert approved", "Employees assessed", "Readiness measured"].map((step, index) => <div key={step} className="relative rounded-xl border p-3 text-center"><span className={cn("mx-auto grid size-7 place-items-center rounded-full font-mono text-[10px]", index < 2 || regulatoryUpdateTriggered ? "bg-[var(--vidda-primary)] text-white" : "bg-secondary text-muted-foreground")}>{index + 1}</span><p className="mt-2 text-[10px] font-bold">{step}</p></div>)}</div><div className="mt-6 flex flex-wrap gap-2"><Button variant="outline" onClick={() => toast.info("Policy diff opened")}>View policy changes</Button><Button variant="outline" onClick={() => { generateCase(); toast.success("2 AI case drafts created for expert review"); }}>Review AI-generated cases</Button><Button onClick={() => toast.success("Learning campaign draft created")}>Generate learning campaign</Button><Button variant="ghost" onClick={() => toast.success("326 affected employees notified")}>Notify affected employees</Button></div></CardContent></Card>
    </Page>
  );
};

export const DailyCasesScreen = () => (
  <Page title="Daily case library" eyebrow={`${learningCases.length} complete demo cases`} description="Cases cover practical decisions across AML, sanctions, fraud, privacy, conduct and cybersecurity.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{learningCases.map((learningCase) => <Card key={learningCase.id} className="shadow-none"><CardContent className="p-5"><div className="flex justify-between gap-2"><Badge variant="secondary">{learningCase.category}</Badge><Badge variant={learningCase.status === "expert-review" ? "destructive" : "outline"}>{learningCase.status}</Badge></div><h2 className="mt-4 text-base font-extrabold">{learningCase.title}</h2><p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{learningCase.scenario}</p><div className="mt-4 flex flex-wrap gap-1">{learningCase.capabilityTags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-secondary px-2 py-1 text-[9px]">{tag}</span>)}</div><Button variant="ghost" size="sm" className="mt-4 px-0" onClick={() => toast.info(`${learningCase.title} review modal opened`)}>Review case <Icon icon="solar:arrow-right-linear" /></Button></CardContent></Card>)}</div>
  </Page>
);

export const AiImprovementScreen = () => {
  const { generatedCaseStatus, generateCase, approveGeneratedCase } = useDemoStore();
  return (
    <Page title="AI Improvement Center" eyebrow="Human-in-the-loop governance" description="AI proposes patterns and draft cases. Compliance experts validate every scoring or content change before publication.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Low-confidence answers", "18"], ["Disputed assessments", "12"], ["Misunderstood policies", "7"], ["Human override rate", "2.8%"]].map(([label, value]) => <Card key={label} className="shadow-none"><CardContent className="p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="metric-number mt-2 text-2xl font-extrabold">{value}</p></CardContent></Card>)}</div>
      <Card className="border-amber-200 bg-amber-50/50 shadow-none"><CardContent className="p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-950"><Icon icon="solar:magic-stick-3-linear" className="size-5" /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant="destructive">Expert review required</Badge><Badge variant="outline">AI Suggested</Badge></div><h2 className="mt-4 text-xl font-extrabold">Tipping-off restrictions are frequently misunderstood</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">38% of employees selected “Notify the customer” in suspicious transaction scenarios. Create a targeted microlearning case explaining tipping-off restrictions.</p><div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => toast.info("Recommendation evidence opened")}>Review recommendation</Button><Button onClick={() => { generateCase(); toast.success("Draft case generated for expert review"); }}>Generate draft case</Button><Button variant="ghost" onClick={() => toast.success("Assigned to Julia Meyer · AML expert")}>Assign to expert</Button></div></div></div></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-lg font-extrabold">Generated case · EDD-CASH-02</p><p className="mt-1 text-xs text-muted-foreground">Prompt v12 · Knowledge base 2026.07.17 · Model 0.9 Demo</p></div><Badge variant={generatedCaseStatus === "approved" ? "outline" : "secondary"}>{generatedCaseStatus === "idle" ? "Not generated" : generatedCaseStatus}</Badge></div><div className="mt-5 rounded-xl bg-secondary p-5"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Draft scenario</p><p className="mt-3 text-sm leading-6">A customer asks why a high-value transaction is pending and whether the bank intends to file a suspicious transaction report. Choose a response that protects the investigation while maintaining appropriate customer communication.</p></div><div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={generatedCaseStatus === "idle"} onClick={() => toast.info("Draft editor opened")}>Edit scoring logic</Button><Button variant="destructive" disabled={generatedCaseStatus === "idle"} onClick={() => toast.warning("Draft rejected and archived")}>Reject</Button><Button disabled={generatedCaseStatus !== "expert-review"} onClick={() => { approveGeneratedCase(); toast.success("Expert approved the draft case"); }}>Approve</Button></div></CardContent></Card>
    </Page>
  );
};

export const CampaignsScreen = () => {
  const { campaign, launchCampaign, completeCampaign } = useDemoStore();
  return (
    <Page title="Learning campaigns" eyebrow="Targeted risk response" description="Assign short sequences only where practical evidence shows a repeated capability gap.">
      <Card className="overflow-hidden shadow-none"><CardContent className="p-0"><div className="bg-[var(--vidda-primary)] p-6 text-white sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><Badge className="bg-[var(--vidda-accent)] text-[var(--vidda-primary)]">{campaign.status}</Badge><h2 className="mt-4 text-2xl font-extrabold">{campaign.title}</h2><p className="mt-2 text-sm text-white/55">Triggered by repeated escalation errors in Corporate Banking.</p></div><p className="metric-number text-4xl font-extrabold">{campaign.employees}<span className="block text-right text-[10px] font-normal tracking-normal text-white/45">employees</span></p></div></div><div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]"><div><p className="text-sm font-extrabold">Five-day content sequence</p><div className="mt-4 space-y-2">{["Day 1 · Escalation trigger recognition", "Day 2 · Correct decision sequence", "Day 3 · Tipping-off restrictions", "Day 4 · Complex scenario", "Day 5 · Final reassessment"].map((day, index) => <div key={day} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid size-7 place-items-center rounded-full bg-secondary font-mono text-[10px]">{index + 1}</span><span className="text-xs font-medium">{day}</span></div>)}</div></div><div><p className="text-sm font-extrabold">Campaign performance</p><div className="mt-4 grid grid-cols-2 gap-3">{[["Assigned", campaign.assigned], ["Started", campaign.started], ["Completed", campaign.completed], ["Passed", campaign.passed]].map(([label, value]) => <div key={label} className="rounded-xl border p-4"><p className="text-[10px] text-muted-foreground">{label}</p><p className="metric-number mt-2 text-xl font-extrabold">{value}</p></div>)}</div><div className="mt-4 rounded-xl bg-secondary p-4"><div className="flex justify-between text-xs"><span>Completion</span><span className="font-bold">{Math.round((campaign.completed / campaign.assigned) * 100)}%</span></div><Progress value={(campaign.completed / campaign.assigned) * 100} className="mt-2 h-1.5" />{campaign.scoreImprovement > 0 && <p className="mt-3 text-sm font-extrabold text-emerald-800">Readiness improved by +{campaign.scoreImprovement}%</p>}</div></div></div><div className="flex flex-wrap justify-end gap-2 border-t p-5"><Button variant="outline" onClick={() => toast.success("Campaign settings saved")}>Edit campaign</Button><Button disabled={campaign.status !== "Draft"} onClick={() => { launchCampaign(); toast.success("Campaign launched to 146 employees"); }}>Launch campaign</Button><Button variant="secondary" disabled={campaign.status === "Completed"} onClick={() => { completeCampaign(); toast.success("Campaign completed with +14% score improvement"); }}>Complete simulation</Button></div></CardContent></Card>
    </Page>
  );
};

const Page = ({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) => <div className="space-y-7"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div>{children}</div>;
