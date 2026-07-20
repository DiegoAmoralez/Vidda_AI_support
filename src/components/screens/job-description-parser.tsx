"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { canCreateMandatoryRequirement } from "@/lib/role-intelligence/parse-job-description";
import { useDemoStore } from "@/store/demo-store";

type SimulatedSourceDocument = {
  id: string;
  fileName: string;
  title: string;
  type: string;
  owner: string;
  version: string;
  jurisdiction: string;
  effectiveDate: string;
  size: string;
  statementIds: string[];
  paragraphs: string[][];
};

const simulatedSourceDocuments: SimulatedSourceDocument[] = [
  {
    id: "retail-rm-jd",
    fileName: "Retail_RM_Warsaw_JD_v3.pdf",
    title: "Retail RM — Warsaw Branch Job Description",
    type: "Job description",
    owner: "NordBank Polska HR",
    version: "3.0",
    jurisdiction: "Poland / European Union",
    effectiveDate: "2026-08-01",
    size: "1.8 MB",
    statementIds: ["stmt-01", "stmt-02", "stmt-03", "stmt-04", "stmt-05", "stmt-06", "stmt-07"],
    paragraphs: [
      ["Role purpose", "Builds and maintains relationships with retail and small-business customers. Onboards customers and collects required customer documentation."],
      ["Responsibilities", "Performs initial customer due diligence, identifies beneficial owners and explains banking products to customers."],
      ["Risk and escalation", "Identifies suspicious behaviour and escalates potential AML, fraud or sanctions concerns. Cannot approve high-risk customers independently."],
      ["Systems and data", "Uses customer onboarding and CRM systems and handles personal and financial data."],
      ["Customer coverage", "May serve customers with cross-border activity."],
    ],
  },
  {
    id: "retail-role-standard",
    fileName: "Retail_Role_Standard_PL_v2.4.docx",
    title: "Retail Customer Management Role Standard",
    type: "Approved role standard",
    owner: "Retail Governance Poland",
    version: "2.4",
    jurisdiction: "Poland / European Union",
    effectiveDate: "2026-06-15",
    size: "940 KB",
    statementIds: ["stmt-01", "stmt-02", "stmt-04", "stmt-05", "stmt-06", "stmt-07"],
    paragraphs: [
      ["Role purpose", "Relationship managers execute standard customer onboarding and maintain complete customer records."],
      ["Responsibilities", "The role validates identity, ownership evidence and approved product suitability information."],
      ["Risk and escalation", "Financial-crime concerns must be paused and escalated. High-risk customer approval remains outside this role."],
      ["Systems and data", "Access is limited to assigned customers in onboarding, CRM and document systems."],
      ["Customer coverage", "The standard applies to Polish retail and small-business customer relationships."],
    ],
  },
  {
    id: "delegation-annex",
    fileName: "Branch_Delegation_Authority_Annex_v1.8.pdf",
    title: "Branch Delegation and Escalation Authority Annex",
    type: "Authority annex",
    owner: "Retail Risk Poland",
    version: "1.8",
    jurisdiction: "Poland / European Union",
    effectiveDate: "2026-07-01",
    size: "620 KB",
    statementIds: ["stmt-03", "stmt-04", "stmt-05"],
    paragraphs: [
      ["Role purpose", "Defines delegated authority and escalation boundaries for branch customer decisions."],
      ["Responsibilities", "Relationship managers may pause processing and request additional evidence."],
      ["Risk and escalation", "High-risk customers require independent approval. Potential AML, fraud and sanctions concerns must be escalated before execution."],
      ["Systems and data", "Delegated decisions and supporting evidence must be recorded in the onboarding platform."],
      ["Customer coverage", "Cross-border activity requires review against enhanced due diligence triggers."],
    ],
  },
];

type ParserStage = "upload" | "processing" | "review";

export const JobDescriptionParserScreen = () => {
  const { parsedStatements, reviewParsedStatement } = useDemoStore();
  const processingTimers = useRef<number[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(parsedStatements[0]?.id ?? "");
  const [stage, setStage] = useState<ParserStage>("upload");
  const [processingStep, setProcessingStep] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [fileName, setFileName] = useState("");
  const [documentOwner, setDocumentOwner] = useState("");
  const [documentVersion, setDocumentVersion] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const selectedSource =
    simulatedSourceDocuments.find((document) => document.id === selectedSourceId);
  const generatedStatements = selectedSource
    ? parsedStatements.filter((statement) =>
        selectedSource.statementIds.includes(statement.id),
      )
    : [];
  const selected =
    generatedStatements.find((statement) => statement.id === selectedId) ??
    generatedStatements[0];
  const visibleStatements = generatedStatements.filter((statement) => {
    if (filter === "all") return true;
    if (filter === "pending") return statement.reviewStatus === "pending";
    if (filter === "inferred") return statement.classification.startsWith("inferred");
    return statement.classification === filter;
  });
  const pendingCount = generatedStatements.filter(
    (statement) => statement.reviewStatus === "pending",
  ).length;
  const blockedCount = generatedStatements.filter(
    (statement) => !canCreateMandatoryRequirement(statement),
  ).length;

  useEffect(
    () => () => {
      processingTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const clearProcessingTimers = () => {
    processingTimers.current.forEach((timer) => window.clearTimeout(timer));
    processingTimers.current = [];
  };

  const handleSelectDocument = (document: SimulatedSourceDocument) => {
    setSelectedSourceId(document.id);
    setSelectedId(document.statementIds[0]);
    setFileName(document.fileName);
    setDocumentOwner(document.owner);
    setDocumentVersion(document.version);
    setJurisdiction(document.jurisdiction);
    setEffectiveDate(document.effectiveDate);
    setLibraryOpen(false);
    toast.success(`${document.title} selected`);
  };

  const handleProcessDocument = () => {
    if (
      !fileName ||
      !documentOwner ||
      !documentVersion ||
      !jurisdiction ||
      !effectiveDate
    ) {
      toast.error("Add the document and all required source metadata");
      return;
    }
    clearProcessingTimers();
    setStage("processing");
    setProcessingStep(0);
    processingTimers.current = [
      window.setTimeout(() => setProcessingStep(1), 280),
      window.setTimeout(() => setProcessingStep(2), 560),
      window.setTimeout(() => setProcessingStep(3), 840),
      window.setTimeout(() => setProcessingStep(4), 1120),
      window.setTimeout(() => {
        setProcessingStep(5);
        setStage("review");
        toast.success("Parsing complete — human review is required");
      }, 1400),
    ];
  };

  if (stage === "upload") {
    return (
      <div className="space-y-7">
        <ParserHeader />
        <UploadPanel
          fileName={fileName}
          documentOwner={documentOwner}
          documentVersion={documentVersion}
          jurisdiction={jurisdiction}
          effectiveDate={effectiveDate}
          libraryOpen={libraryOpen}
          onOwnerChange={setDocumentOwner}
          onVersionChange={setDocumentVersion}
          onJurisdictionChange={setJurisdiction}
          onEffectiveDateChange={setEffectiveDate}
          onToggleLibrary={() => setLibraryOpen((open) => !open)}
          onSelectDocument={handleSelectDocument}
          onProcess={handleProcessDocument}
        />
      </div>
    );
  }

  if (stage === "processing") {
    return (
      <div className="space-y-7">
        <ParserHeader />
        <ProcessingPanel
          fileName={fileName}
          currentStep={processingStep}
          onCancel={() => {
            clearProcessingTimers();
            setStage("upload");
            setProcessingStep(0);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <ParserHeader
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleProcessDocument}
          >
            <Icon icon="solar:restart-linear" />
            Re-run parser
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--vidda-primary)] text-[var(--vidda-accent)]">
              <Icon icon="solar:document-text-linear" className="size-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-extrabold">{selectedSource?.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Version {documentVersion} · Effective {effectiveDate} · Owner: {documentOwner}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Extracted" value={generatedStatements.length} />
              <Metric label="Pending review" value={pendingCount} />
              <Metric label="Blocked" value={blockedCount} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Text extracted", "Sections identified", "Responsibilities classified", "Capabilities mapped", "Review tasks created"].map((step) => (
              <Badge key={step} variant="outline" className="gap-1.5"><Icon icon="solar:check-read-linear" className="text-emerald-700" />{step}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[.82fr_1.18fr]">
        <Card className="shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-extrabold">Authorized source</p><p className="text-[10px] text-muted-foreground">Exact text remains unchanged</p></div>
              <Badge variant="secondary">Page {selected?.sourcePage ?? 1}</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {(selectedSource?.paragraphs ?? []).map(([title, paragraph]) => {
                const highlighted =
                  selected?.sourceSpan &&
                  (paragraph.includes(selected.sourceSpan) ||
                    selected.sourceParagraph.toLowerCase().includes(title.toLowerCase()));
                return (
                  <div key={title} className={cn("rounded-xl border p-4", highlighted && "border-[var(--vidda-primary)] bg-[var(--vidda-accent)]/15")}>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{title}</p>
                    <p className="mt-2 text-xs leading-6">{paragraph}</p>
                    {highlighted && <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[var(--vidda-primary)]"><Icon icon="solar:link-round-linear" />Linked to selected extraction</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-extrabold">Extraction review queue</p><p className="text-[10px] text-muted-foreground">Parser v12 · Vidda Role Reasoning 0.9 Demo</p></div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statements</SelectItem>
                  <SelectItem value="pending">Pending review</SelectItem>
                  <SelectItem value="explicit">Explicit only</SelectItem>
                  <SelectItem value="inferred">Inferred only</SelectItem>
                  <SelectItem value="ambiguous">Ambiguous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-5 space-y-3">
              {visibleStatements.map((statement) => (
                <button
                  key={statement.id}
                  onClick={() => setSelectedId(statement.id)}
                  className={cn("w-full rounded-xl border p-4 text-left hover:bg-secondary/50", selected?.id === statement.id && "border-[var(--vidda-primary)] bg-secondary/60")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <ClassificationBadge classification={statement.classification} />
                      <Badge variant={statement.reviewStatus === "approved" ? "outline" : statement.reviewStatus === "rejected" ? "destructive" : "secondary"}>{statement.reviewStatus}</Badge>
                    </div>
                    <span className={cn("font-mono text-xs font-bold", statement.confidence < 65 ? "text-red-700" : statement.confidence < 85 ? "text-amber-700" : "text-emerald-700")}>{statement.confidence}% confidence</span>
                  </div>
                  <p className="mt-3 text-sm font-extrabold">{statement.normalizedValue}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{statement.extractedStatement}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {statement.capabilityIds.map((capabilityId) => <Badge key={capabilityId} variant="outline">{capabilityId}</Badge>)}
                  </div>
                  {selected?.id === statement.id && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Detail label="Classification reason" value={statement.reason} />
                        <Detail label="Required reviewer" value={statement.requiredReviewer} />
                        <Detail label="Regulatory relevance" value={statement.potentialRegulatoryRelevance} />
                        <Detail label="Source span" value={`Page ${statement.sourcePage} · ${statement.sourceParagraph}`} />
                      </div>
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="destructive" onClick={(event) => { event.stopPropagation(); reviewParsedStatement(statement.id, "rejected"); toast.warning("Statement rejected; mandatory use remains blocked"); }}>Reject</Button>
                        <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); reviewParsedStatement(statement.id, "edited"); toast.success("Statement corrected and preserved with reviewer provenance"); }}>Edit & accept</Button>
                        <Button size="sm" onClick={(event) => { event.stopPropagation(); reviewParsedStatement(statement.id, "approved"); toast.success("Statement approved by human reviewer"); }}>Approve</Button>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn("flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center", blockedCount ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50")}>
        <Icon icon={blockedCount ? "solar:shield-warning-linear" : "solar:shield-check-linear"} className="size-6 shrink-0" />
        <div className="flex-1"><p className="text-sm font-extrabold">{blockedCount ? `${blockedCount} item(s) block mandatory generation` : "All critical extracted responsibilities are approved"}</p><p className="mt-1 text-xs text-muted-foreground">{blockedCount ? "Review inferred and ambiguous statements before publishing role obligations." : "The role profile may proceed to the approval workflow."}</p></div>
        <Button disabled={blockedCount > 0} onClick={() => toast.success("Approved extraction set attached to role draft v1.1")}>Attach to role draft</Button>
      </div>
    </div>
  );
};

const ParserHeader = ({ action }: { action?: React.ReactNode }) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
        AI-assisted role creation · human validation
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
        Job-description parsing
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        Select an authorized source first. Vidda then extracts responsibilities,
        preserves exact spans and routes every uncertain item to human review.
      </p>
    </div>
    {action}
  </div>
);

const UploadPanel = ({
  fileName,
  documentOwner,
  documentVersion,
  jurisdiction,
  effectiveDate,
  libraryOpen,
  onOwnerChange,
  onVersionChange,
  onJurisdictionChange,
  onEffectiveDateChange,
  onToggleLibrary,
  onSelectDocument,
  onProcess,
}: {
  fileName: string;
  documentOwner: string;
  documentVersion: string;
  jurisdiction: string;
  effectiveDate: string;
  libraryOpen: boolean;
  onOwnerChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onJurisdictionChange: (value: string) => void;
  onEffectiveDateChange: (value: string) => void;
  onToggleLibrary: () => void;
  onSelectDocument: (document: SimulatedSourceDocument) => void;
  onProcess: () => void;
}) => (
  <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
    <Card className="shadow-none">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold">1. Select source document</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose from the approved demo document library.
            </p>
          </div>
          <Badge variant="outline">Required</Badge>
        </div>
        <button
          type="button"
          onClick={onToggleLibrary}
          className={cn(
            "mt-6 flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center hover:border-[var(--vidda-primary)] hover:bg-secondary/40",
            fileName && "border-emerald-400 bg-emerald-50/50",
          )}
        >
          <span className={cn("grid size-14 place-items-center rounded-2xl bg-secondary text-[var(--vidda-primary)]", fileName && "bg-emerald-100 text-emerald-800")}>
            <Icon icon={fileName ? "solar:document-check-linear" : "solar:folder-with-files-linear"} className="size-7" />
          </span>
          <span className="mt-5 text-sm font-extrabold">
            {fileName || "No source selected"}
          </span>
          <span className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
            {fileName
              ? "Select another approved document or continue to deterministic processing."
              : "Three approved banking documents are available in this simulated environment."}
          </span>
          <span className="mt-4 rounded-lg bg-[var(--vidda-primary)] px-4 py-2 text-xs font-bold text-white">
            {libraryOpen ? "Close document library" : "Browse documents"}
          </span>
        </button>
        {libraryOpen && (
          <div className="mt-4 space-y-3">
            {simulatedSourceDocuments.map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => onSelectDocument(document)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:-translate-y-0.5 hover:border-[var(--vidda-primary)] hover:bg-secondary/50",
                  fileName === document.fileName &&
                    "border-[var(--vidda-primary)] bg-secondary",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-[var(--vidda-primary)]">
                  <Icon
                    icon={
                      document.fileName.endsWith(".docx")
                        ? "solar:file-text-linear"
                        : "solar:file-linear"
                    }
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold">
                    {document.title}
                  </span>
                  <span className="mt-1 block text-[9px] text-muted-foreground">
                    {document.type} · v{document.version} · {document.size}
                  </span>
                </span>
                <Badge variant={fileName === document.fileName ? "secondary" : "outline"}>
                  {fileName === document.fileName ? "Selected" : "Select"}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Card className="shadow-none">
      <CardContent className="p-6 sm:p-8">
        <div>
          <p className="text-lg font-extrabold">2. Register source metadata</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            These fields determine applicability, ownership and historical
            reproducibility.
          </p>
        </div>
        <div className="mt-6 space-y-5">
          <Field label="Document owner">
            <Input
              value={documentOwner}
              onChange={(event) => onOwnerChange(event.target.value)}
              placeholder="e.g. NordBank Polska HR"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document version">
              <Input
                value={documentVersion}
                onChange={(event) => onVersionChange(event.target.value)}
                placeholder="e.g. 3.0"
              />
            </Field>
            <Field label="Effective date">
              <Input
                type="date"
                value={effectiveDate}
                onChange={(event) => onEffectiveDateChange(event.target.value)}
              />
            </Field>
          </div>
          <Field label="Jurisdiction">
            <Select value={jurisdiction} onValueChange={onJurisdictionChange}>
              <SelectTrigger><SelectValue placeholder="Select jurisdiction" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Poland / European Union">Poland / European Union</SelectItem>
                <SelectItem value="Germany / European Union">Germany / European Union</SelectItem>
                <SelectItem value="Group / European Union">Group / European Union</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-xs font-extrabold text-amber-950">
              <Icon icon="solar:shield-warning-linear" />
              Human approval remains mandatory
            </p>
            <p className="mt-2 text-[10px] leading-5 text-amber-950/70">
              Inferred statements are never converted into mandatory obligations
              until an authorized reviewer approves them.
            </p>
          </div>
          <Button className="h-11 w-full gap-2" onClick={onProcess}>
            Process document
            <Icon icon="solar:arrow-right-linear" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const processingSteps = [
  ["File security and access checks", "solar:shield-check-linear"],
  ["Text and section extraction", "solar:document-text-linear"],
  ["Responsibility classification", "solar:magic-stick-3-linear"],
  ["Capability and risk mapping", "solar:graph-up-linear"],
  ["Human review tasks created", "solar:user-check-linear"],
] as const;

const ProcessingPanel = ({
  fileName,
  currentStep,
  onCancel,
}: {
  fileName: string;
  currentStep: number;
  onCancel: () => void;
}) => (
  <Card className="mx-auto max-w-3xl shadow-none">
    <CardContent className="p-7 sm:p-10">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--vidda-primary)] text-[var(--vidda-accent)]">
          <Icon icon="solar:document-text-linear" className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Processing with parser v12 and approved taxonomy v2
          </p>
        </div>
        <Badge variant="secondary">Processing</Badge>
      </div>
      <Progress
        value={(currentStep / processingSteps.length) * 100}
        className="mt-7 h-2"
      />
      <div className="mt-7 space-y-3">
        {processingSteps.map(([label, icon], index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4",
                complete && "border-emerald-200 bg-emerald-50",
                active && "border-[var(--vidda-primary)] bg-secondary",
              )}
            >
              <span className={cn("grid size-9 place-items-center rounded-xl bg-secondary", complete && "bg-emerald-100 text-emerald-800")}>
                <Icon icon={complete ? "solar:check-read-linear" : icon} />
              </span>
              <p className="flex-1 text-xs font-extrabold">{label}</p>
              <span className="font-mono text-[9px] uppercase text-muted-foreground">
                {complete ? "Complete" : active ? "Running" : "Queued"}
              </span>
            </div>
          );
        })}
      </div>
      <Button variant="ghost" className="mt-6 w-full" onClick={onCancel}>
        Cancel and return to upload
      </Button>
    </CardContent>
  </Card>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="mb-2 text-xs font-bold">{label} *</p>
    {children}
  </div>
);

const ClassificationBadge = ({ classification }: { classification: string }) => {
  const inferred = classification.startsWith("inferred");
  return <Badge variant={classification === "explicit" ? "outline" : inferred ? "secondary" : "destructive"}>{classification}</Badge>;
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl bg-secondary px-3 py-2 text-center"><p className="font-mono text-lg font-extrabold">{value}</p><p className="text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p></div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-white p-3"><p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-[10px] leading-4">{value}</p></div>
);
