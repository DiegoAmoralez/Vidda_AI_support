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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { capabilityCatalog, proficiencyLevels } from "@/data/role-intelligence";
import type { JobRole } from "@/domain/types";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export const RoleCatalogScreen = () => {
  const {
    jobRoles,
    selectedJobRoleId,
    selectJobRole,
    createJobRoleDraft,
    submitJobRoleForReview,
    approveJobRole,
    publishJobRole,
  } = useDemoStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const visibleRoles = useMemo(
    () =>
      jobRoles.filter(
        (role) =>
          `${role.title} ${role.family} ${role.code}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "all" || role.status === status),
      ),
    [jobRoles, query, status],
  );
  const selectedRole =
    jobRoles.find((role) => role.id === selectedJobRoleId) ?? jobRoles[0];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
            Role intelligence · governed catalog
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Banking role catalog
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Standardize what each role is responsible for, what the employee must
            demonstrate and which evidence proves readiness.
          </p>
        </div>
        <RoleCreationWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onCreate={(title, method) => {
            createJobRoleDraft(title, method);
            setWizardOpen(false);
            toast.success(`${title} created as Draft v0.1`);
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Published roles", jobRoles.filter((role) => role.status === "published").length, "solar:case-round-linear"],
          ["Awaiting approval", jobRoles.filter((role) => ["review", "approved"].includes(role.status)).length, "solar:hourglass-line-linear"],
          ["Role families", new Set(jobRoles.map((role) => role.family)).size, "solar:layers-minimalistic-linear"],
          ["Critical roles", jobRoles.filter((role) => role.criticality === "critical").length, "solar:shield-warning-linear"],
        ].map(([label, value, icon]) => (
          <Card key={String(label)} className="shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
                <Icon icon={String(icon)} className="text-[var(--vidda-primary)]" />
              </div>
              <p className="metric-number mt-3 text-2xl font-extrabold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit shadow-none">
          <CardContent className="p-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search role, family or code"
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 space-y-2">
              {visibleRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => selectJobRole(role.id)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left hover:-translate-y-0.5 hover:bg-secondary/60",
                    selectedRole.id === role.id &&
                      "border-[var(--vidda-primary)] bg-secondary",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-extrabold leading-5">{role.title}</span>
                    <RoleStatusBadge status={role.status} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {role.code} · {role.family}
                  </p>
                  <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase text-muted-foreground">
                    <span>v{role.version}</span>
                    <span>{role.jurisdiction}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <RoleDetail
          role={selectedRole}
          onSubmit={() => {
            submitJobRoleForReview(selectedRole.id);
            toast.success("Role submitted to the maker-checker review queue");
          }}
          onApprove={() => {
            approveJobRole(selectedRole.id);
            toast.success("Role approved with an immutable approval event");
          }}
          onPublish={() => {
            publishJobRole(selectedRole.id);
            toast.success("Approved role version published");
          }}
        />
      </div>
    </div>
  );
};

const RoleDetail = ({
  role,
  onSubmit,
  onApprove,
  onPublish,
}: {
  role: JobRole;
  onSubmit: () => void;
  onApprove: () => void;
  onPublish: () => void;
}) => (
  <Card className="overflow-hidden shadow-none">
    <div className="bg-[var(--vidda-primary)] p-6 text-white sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <RoleStatusBadge status={role.status} />
            <Badge className="border-white/15 bg-white/10 text-white">
              {role.defenceLine} line
            </Badge>
            <Badge className="border-white/15 bg-white/10 text-white">
              {role.criticality} criticality
            </Badge>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">
            {role.standardizedTitle}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {role.title} · {role.code} · Version {role.version}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {role.status === "draft" && <Button onClick={onSubmit}>Submit for review</Button>}
          {role.status === "review" && <Button onClick={onApprove}>Approve role</Button>}
          {role.status === "approved" && <Button onClick={onPublish}>Publish version</Button>}
          <Button
            variant="outline"
            className="border-white/15 bg-white/[0.05] text-white hover:bg-white/10 hover:text-white"
            onClick={() => toast.info("Version comparison opened: v1.0 → v1.1")}
          >
            Compare versions
          </Button>
        </div>
      </div>
    </div>
    <CardContent className="p-6 sm:p-8">
      <Tabs defaultValue="expectations">
        <TabsList className="grid h-auto w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="expectations">What you must do</TabsTrigger>
          <TabsTrigger value="capabilities">What you must know</TabsTrigger>
          <TabsTrigger value="exposure">Exposure</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="expectations" className="mt-6 space-y-6">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Role purpose</p>
            <p className="mt-2 max-w-4xl text-sm leading-7">{role.rolePurpose}</p>
          </div>
          <div className="grid gap-3">
            {role.responsibilities.map((responsibility, index) => (
              <div key={responsibility.id} className="rounded-xl border p-4">
                <div className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--vidda-primary)] font-mono text-[10px] text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">{responsibility.statement}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Decision boundary: {responsibility.decisionAuthority}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {responsibility.controlIds.map((control) => (
                        <Badge key={control} variant="outline">{control}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <MetadataGrid role={role} />
        </TabsContent>
        <TabsContent value="capabilities" className="mt-6">
          <div className="mb-5 rounded-xl bg-secondary p-4 text-xs leading-5">
            Required levels are derived from approved responsibility, authority,
            complexity, customer impact, control ownership and risk exposure.
          </div>
          <div className="space-y-3">
            {role.capabilityRequirements.map((requirement) => {
              const capability = capabilityCatalog.find(
                (item) => item.id === requirement.capabilityId,
              );
              const level = proficiencyLevels.find(
                (item) => item.level === requirement.requiredLevel,
              );
              return (
                <div key={requirement.id} className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-extrabold">{capability?.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {requirement.whyRequired}
                    </p>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Evidence: {requirement.evidenceRequired.join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-lg font-extrabold">L{requirement.requiredLevel}</p>
                      <p className="text-[9px] text-muted-foreground">{level?.name}</p>
                    </div>
                    <Badge variant={requirement.criticality === "critical" ? "destructive" : "secondary"}>
                      {requirement.criticality}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="exposure" className="mt-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <RoleList title="Risk domains" items={role.riskDomainIds} icon="solar:shield-warning-linear" />
            <RoleList title="Customer and markets" items={[...role.customerSegments, ...role.marketsCovered]} icon="solar:global-linear" />
            <RoleList title="Systems accessed" items={role.systemsAccessed} icon="solar:monitor-linear" />
            <RoleList title="Data accessed" items={role.dataAccessed} icon="solar:database-linear" />
          </div>
        </TabsContent>
        <TabsContent value="governance" className="mt-6">
          <MetadataGrid role={role} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <RoleList title="Decision rights" items={role.decisionRights} icon="solar:check-square-linear" />
            <RoleList title="Authority boundaries" items={[...role.approvalAuthorities, ...role.delegatedAuthorities]} icon="solar:lock-keyhole-linear" />
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6 space-y-3">
          {role.approvalHistory.length ? role.approvalHistory.map((approval) => (
            <div key={approval.id} className="flex gap-3 rounded-xl border p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Icon icon="solar:check-read-linear" /></span>
              <div><p className="text-sm font-extrabold">{approval.stage} · {approval.decision}</p><p className="mt-1 text-xs">{approval.actor} · {approval.actorRole}</p><p className="mt-2 text-xs text-muted-foreground">{approval.rationale}</p></div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No approvals yet. Submit the draft to start maker-checker review.</div>
          )}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

const RoleCreationWizard = ({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string, method: "manual" | "template" | "ai-assisted") => void;
}) => {
  const [title, setTitle] = useState("Retail Banking Service Specialist");
  const [method, setMethod] = useState<"manual" | "template" | "ai-assisted">("template");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><Button className="gap-2"><Icon icon="solar:add-circle-linear" />Create role</Button></DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>Create banking role</DialogTitle><DialogDescription>Choose the starting method. Every result remains a draft until human review and approval.</DialogDescription></DialogHeader>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ["manual", "Manual", "Start with required metadata"],
            ["template", "Template", "Use an approved role family"],
            ["ai-assisted", "AI-assisted", "Parse an authorized source"],
          ].map(([value, label, detail]) => (
            <button key={value} onClick={() => setMethod(value as typeof method)} className={cn("rounded-xl border p-4 text-left", method === value && "border-[var(--vidda-primary)] bg-secondary")}>
              <span className="block text-sm font-extrabold">{label}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{detail}</span>
            </button>
          ))}
        </div>
        <div><label className="text-xs font-bold" htmlFor="role-title">Role title</label><Input id="role-title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2" /></div>
        <div className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-950">AI-assisted responsibilities are labelled as inferred and cannot create mandatory learning before approval.</div>
        <Button disabled={!title.trim()} onClick={() => onCreate(title.trim(), method)}>Create Draft v0.1</Button>
      </DialogContent>
    </Dialog>
  );
};

const RoleStatusBadge = ({ status }: { status: JobRole["status"] }) => (
  <Badge variant={status === "published" ? "outline" : status === "review" ? "destructive" : "secondary"} className="capitalize">{status}</Badge>
);

const RoleList = ({ title, items, icon }: { title: string; items: string[]; icon: string }) => (
  <div className="rounded-xl border p-5"><p className="flex items-center gap-2 text-sm font-extrabold"><Icon icon={icon} className="text-[var(--vidda-primary)]" />{title}</p><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className="mt-2 size-1 shrink-0 rounded-full bg-current" />{item}</li>)}</ul></div>
);

const MetadataGrid = ({ role }: { role: JobRole }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {[
      ["Role owner", role.roleOwner],
      ["Compliance owner", role.complianceOwner],
      ["Risk owner", role.riskOwner],
      ["HR owner", role.hrOwner],
      ["Legal entity", role.legalEntity],
      ["Jurisdiction", role.jurisdiction],
      ["Reporting line", role.reportingLine],
      ["Effective from", role.effectiveFrom],
    ].map(([label, value]) => (
      <div key={label} className="rounded-xl bg-secondary p-4"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-xs font-extrabold">{value}</p></div>
    ))}
  </div>
);
