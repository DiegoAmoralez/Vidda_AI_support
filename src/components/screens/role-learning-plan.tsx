"use client";

import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  capabilityCatalog,
  learningCatalog,
} from "@/data/role-intelligence";
import { employees } from "@/data/seed";
import { deriveCapabilityProfile } from "@/lib/role-intelligence/derive-capability-profile";
import {
  getEmployeeCapabilityLevels,
  getEmployeeRoleAssignments,
} from "@/lib/role-intelligence/employee-scope";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export const RoleLearningPlanScreen = () => {
  const {
    employeeRoleAssignments,
    jobRoles,
    selectedEmployeeId,
    setSelectedEmployeeId,
    riskExposure,
    learningRecommendations,
    approveRiskExposure,
    approveLearningRecommendation,
    reassessRoleIntelligence,
  } = useDemoStore();
  const selectedEmployee =
    employees.find((employee) => employee.id === selectedEmployeeId) ??
    employees[0];
  const scopedAssignments = getEmployeeRoleAssignments({
    employeeId: selectedEmployee.id,
    persistedAssignments: employeeRoleAssignments,
    roles: jobRoles,
  });
  const profile = deriveCapabilityProfile({
    employeeId: selectedEmployee.id,
    assignments: scopedAssignments,
    roles: jobRoles,
    capabilities: capabilityCatalog,
    demonstratedLevels: getEmployeeCapabilityLevels(selectedEmployee.id),
    asOf: "2026-08-10",
  });
  const selectedRoles = profile.activeAssignments
    .map((assignment) =>
      jobRoles.find((role) => role.id === assignment.roleId),
    )
    .filter((role) => Boolean(role));
  const employeeOptions = employees.slice(0, 100);
  const priorityEmployees = employees
    .filter((employee) =>
      ["critical", "high"].includes(employee.riskLevel),
    )
    .slice(0, 5);
  const approvedCount = learningRecommendations.filter(
    (item) => item.approvalStatus === "approved",
  ).length;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
            Individual learning plan · {selectedEmployee.name}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Role-based learning workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Every intervention states the capability gap, role source, risk rationale,
            approved content version and evidence expected.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            reassessRoleIntelligence();
            toast.success("Plan regenerated from the current approved snapshot");
          }}
        >
          <Icon icon="solar:restart-linear" />
          Recalculate plan
        </Button>
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="grid lg:grid-cols-[1fr_360px]">
          <CardContent className="flex flex-col gap-5 bg-[var(--vidda-primary)] p-6 text-white sm:flex-row sm:items-center">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--vidda-accent)] text-lg font-extrabold text-[var(--vidda-primary)]">
              {selectedEmployee.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold">{selectedEmployee.name}</h2>
                <Badge className="border-white/15 bg-white/10 text-white">
                  {selectedEmployee.riskLevel} risk
                </Badge>
              </div>
              <p className="mt-1 text-xs text-white/50">
                {selectedEmployee.id} · {selectedEmployee.department} ·{" "}
                {selectedEmployee.country}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedRoles.map((role) => (
                  <Badge
                    key={role?.id}
                    className="border-white/15 bg-white/[0.06] text-white"
                  >
                    {role?.standardizedTitle}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardContent className="p-6">
            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Change employee scope
            </p>
            <Select
              value={selectedEmployee.id}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger className="mt-3 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {employeeOptions.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} · {employee.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
              Selection is shared with Role Mapping, Employees and Traceability.
            </p>
          </CardContent>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          Priority queue
        </span>
        {priorityEmployees.map((employee) => (
          <button
            key={employee.id}
            onClick={() => setSelectedEmployeeId(employee.id)}
            className={cn(
              "rounded-full border bg-white px-3 py-1.5 text-[10px] font-bold hover:-translate-y-0.5 hover:border-[var(--vidda-primary)]",
              employee.id === selectedEmployee.id &&
                "border-[var(--vidda-primary)] bg-secondary",
            )}
          >
            {employee.name} · {employee.riskLevel}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Risk exposure" value={`${riskExposure.normalizedScore}/100`} detail={riskExposure.level} icon="solar:shield-warning-linear" alert />
        <SummaryCard label="Capability gaps" value={profile.capabilities.filter((item) => item.gap > 0).length} detail={`${profile.capabilities.length} assessed`} icon="solar:graph-down-linear" />
        <SummaryCard label="Plan items" value={learningRecommendations.length} detail={`${approvedCount} approved`} icon="solar:notebook-bookmark-linear" />
        <SummaryCard label="Duplicate learning" value="0" detail="Coverage preserved" icon="solar:check-circle-linear" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-lg font-extrabold">Factorized exposure</p><p className="mt-1 text-xs text-muted-foreground">Formula {riskExposure.formulaVersion} · {riskExposure.confidence}% confidence</p></div>
              <Badge variant="destructive" className="capitalize">{riskExposure.level}</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {riskExposure.factors.map((factor) => (
                <div key={factor.id}>
                  <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold">{factor.name}</p><p className="mt-1 text-[9px] text-muted-foreground">{factor.source}</p></div><p className="font-mono text-sm font-extrabold">× {factor.weightedValue}</p></div>
                  <Progress value={Math.min(100, factor.weightedValue * 50)} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary p-4"><p className="font-mono text-[9px] uppercase text-muted-foreground">Intermediate result</p><p className="metric-number mt-2 text-2xl font-extrabold">{riskExposure.rawScore}</p></div>
              <div className="rounded-xl bg-secondary p-4"><p className="font-mono text-[9px] uppercase text-muted-foreground">Normalized</p><p className="metric-number mt-2 text-2xl font-extrabold">{riskExposure.normalizedScore}</p></div>
            </div>
            {riskExposure.approvalStatus === "pending" ? (
              <Button className="mt-5 w-full" onClick={() => { approveRiskExposure(); toast.success("High exposure approved with immutable rationale"); }}>Approve High exposure</Button>
            ) : riskExposure.approvalStatus === "approved" ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-950"><Icon icon="solar:shield-check-linear" />Risk classification approved by Risk</div>
            ) : (
              <div className="mt-5 flex items-center gap-2 rounded-xl border bg-secondary p-4 text-xs font-bold"><Icon icon="solar:check-circle-linear" />Human approval is not required at this risk level</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-6">
            <p className="text-lg font-extrabold">Required vs demonstrated</p>
            <p className="mt-1 text-xs text-muted-foreground">Course completion never increases demonstrated level by itself.</p>
            <div className="mt-5 space-y-3">
              {profile.capabilities.filter((item) => item.gap > 0).map((capability) => (
                <div key={capability.capabilityId} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-extrabold">{capability.capabilityName}</p><p className="mt-1 text-[10px] text-muted-foreground">{capability.sourceRoles.map((source) => source.title).join(" · ")}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">L{capability.demonstratedLevel}</Badge><Icon icon="solar:arrow-right-linear" /><Badge variant="destructive">L{capability.requiredLevel}</Badge></div></div>
                  <div className="mt-3 flex flex-wrap gap-1">{capability.evidenceRequired.map((evidence) => <Badge key={evidence} variant="outline">{evidence}</Badge>)}</div>
                </div>
              ))}
              {!profile.capabilities.some((item) => item.gap > 0) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <Icon icon="solar:shield-check-linear" className="mx-auto size-7 text-emerald-700" />
                  <p className="mt-3 text-sm font-extrabold">No current capability gaps</p>
                  <p className="mt-1 text-xs text-muted-foreground">Existing evidence covers this employee’s active role requirements.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-lg font-extrabold">Deduplicated interventions</p><p className="mt-1 text-xs text-muted-foreground">Ranked by approved outcome, evidence sufficiency, risk and employee burden.</p></div>
            <Badge variant="outline">{learningRecommendations.reduce((sum, item) => sum + item.coveredRequirementIds.length, 0)} requirements covered</Badge>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {learningRecommendations.map((recommendation, index) => {
              const learningItem = learningCatalog.find(
                (item) => item.id === recommendation.learningItemId,
              );
              return (
                <div key={recommendation.id} className={cn("rounded-2xl border p-5", recommendation.classification === "conditionally-mandatory" && "border-amber-300 bg-amber-50/40")}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--vidda-primary)] font-mono text-xs font-extrabold text-[var(--vidda-accent)]">{index + 1}</span>
                    <div className="flex flex-wrap justify-end gap-1"><Badge variant={recommendation.classification === "mandatory" ? "destructive" : "secondary"}>{recommendation.classification}</Badge><Badge variant="outline">{recommendation.approvalStatus}</Badge></div>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold">{learningItem?.title}</h3>
                  <p className="mt-1 text-[10px] text-muted-foreground">{learningItem?.type} · v{learningItem?.version} · {learningItem?.durationMinutes} min · Due {recommendation.dueDate}</p>
                  <div className="mt-4 space-y-2">{recommendation.whySelected.map((reason) => <div key={reason} className="flex gap-2 text-xs leading-5"><Icon icon="solar:check-circle-linear" className="mt-0.5 shrink-0 text-emerald-700" /><span>{reason}</span></div>)}</div>
                  <div className="mt-4 rounded-xl bg-secondary p-4"><p className="font-mono text-[9px] uppercase text-muted-foreground">Evidence expected</p><p className="mt-2 text-xs font-bold">{recommendation.evidenceExpected.join(" · ")}</p></div>
                  {recommendation.alternativesRejected.length > 0 && (
                    <details className="mt-4 rounded-xl border p-3 text-xs"><summary className="cursor-pointer font-bold">Why alternatives were rejected</summary>{recommendation.alternativesRejected.map((alternative) => <p key={alternative.learningItemId} className="mt-2 text-muted-foreground">{alternative.learningItemId}: {alternative.reason}</p>)}</details>
                  )}
                  {recommendation.approvalStatus === "preview" ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-950">Human review of the inferred EDD responsibility is required first.</div>
                  ) : recommendation.approvalStatus === "pending" ? (
                    <Button className="mt-4 w-full" onClick={() => { approveLearningRecommendation(recommendation.id); toast.success(`${learningItem?.title} approved as ${recommendation.classification}`); }}>Approve recommendation</Button>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-800"><Icon icon="solar:check-read-linear" />Approved and ready to assign</div>
                  )}
                </div>
              );
            })}
            {learningRecommendations.length === 0 && (
              <div className="rounded-2xl border border-dashed p-8 text-center lg:col-span-2">
                <Icon icon="solar:check-circle-linear" className="mx-auto size-8 text-emerald-700" />
                <p className="mt-3 text-sm font-extrabold">No intervention is required</p>
                <p className="mt-1 text-xs text-muted-foreground">Current approved evidence covers the active role profile. The next scheduled reassessment remains in place.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryCard = ({ label, value, detail, icon, alert = false }: { label: string; value: string | number; detail: string; icon: string; alert?: boolean }) => (
  <Card className={cn("shadow-none", alert && "border-amber-200 bg-amber-50/50")}><CardContent className="p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground">{label}</p><Icon icon={icon} className={alert ? "text-amber-800" : "text-[var(--vidda-primary)]"} /></div><p className="metric-number mt-3 text-2xl font-extrabold">{value}</p><p className="mt-1 text-[10px] capitalize text-muted-foreground">{detail}</p></CardContent></Card>
);
