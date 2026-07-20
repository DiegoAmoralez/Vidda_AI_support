"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  traceabilityEdges,
  traceabilityNodes,
} from "@/data/role-intelligence";
import { employees } from "@/data/seed";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const nodeIcons: Record<string, string> = {
  obligation: "solar:document-text-linear",
  policy: "solar:notebook-bookmark-linear",
  process: "solar:route-linear",
  control: "solar:shield-check-linear",
  responsibility: "solar:user-check-linear",
  risk: "solar:shield-warning-linear",
  capability: "solar:graph-up-linear",
  learning: "solar:square-academic-cap-linear",
  assignment: "solar:calendar-add-linear",
  evidence: "solar:verified-check-linear",
};

export const TraceabilityExplorerScreen = () => {
  const selectedEmployeeId = useDemoStore(
    (state) => state.selectedEmployeeId,
  );
  const setSelectedEmployeeId = useDemoStore(
    (state) => state.setSelectedEmployeeId,
  );
  const [selectedId, setSelectedId] = useState("cap-escalation");
  const [asOf, setAsOf] = useState("2026-08-10");
  const selectedEmployee =
    employees.find((employee) => employee.id === selectedEmployeeId) ??
    employees[0];
  const scopedNodes = traceabilityNodes.map((node) => {
    if (node.type === "assignment") {
      return {
        ...node,
        label: `${selectedEmployee.name} · Role-specific learning assignment`,
        metadata: {
          ...node.metadata,
          employeeId: selectedEmployee.id,
          role: selectedEmployee.role,
        },
      };
    }
    if (node.type === "evidence") {
      return {
        ...node,
        label: `${selectedEmployee.name} · Practical evidence result`,
        metadata: {
          ...node.metadata,
          employeeId: selectedEmployee.id,
          readiness: selectedEmployee.capabilityScore,
        },
      };
    }
    return node;
  });
  const selected =
    scopedNodes.find((node) => node.id === selectedId) ??
    scopedNodes[0];
  const incoming = traceabilityEdges.filter((edge) => edge.to === selected.id);
  const outgoing = traceabilityEdges.filter((edge) => edge.from === selected.id);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
            Evidence chain · {selectedEmployee.name} · reproducibility snapshot
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Obligation-to-evidence traceability
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Follow any requirement forward to employee evidence—or work backward
            from an assignment to the exact source and approved role version.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={selectedEmployee.id}
            onValueChange={setSelectedEmployeeId}
          >
            <SelectTrigger className="w-64 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {employees.slice(0, 100).map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} · {employee.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={asOf}
            onChange={(event) => setAsOf(event.target.value)}
            className="w-40"
            aria-label="Traceability as-of date"
          />
          <Button
            className="gap-2"
            onClick={() =>
              toast.success(
                `${selectedEmployee.name} evidence manifest generated as of ${asOf}`,
              )
            }
          >
            <Icon icon="solar:download-linear" />
            Export evidence pack
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Graph coverage" value="100%" detail="10 of 10 nodes resolve" />
        <Stat label="Source versions" value="8" detail="All effective-dated" />
        <Stat label="Approval gates" value="3" detail="2 complete · 1 pending" />
        <Stat label="Employee scope" value={selectedEmployee.id.replace("emp-", "#")} detail={selectedEmployee.name} />
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="border-b bg-secondary/60 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-sm font-extrabold">Retail RM · AML escalation chain</p><p className="mt-1 text-[10px] text-muted-foreground">Effective graph on {asOf} · Snapshot formula risk-multiplicative-v2</p></div>
            <Badge variant="outline" className="gap-1"><Icon icon="solar:check-circle-linear" className="text-emerald-700" />No broken links</Badge>
          </div>
        </div>
        <CardContent className="overflow-x-auto p-6">
          <div className="flex min-w-[1280px] items-stretch gap-2">
            {scopedNodes.map((node, index) => (
              <div key={node.id} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => setSelectedId(node.id)}
                  className={cn(
                    "group flex h-full min-h-44 w-full flex-col rounded-2xl border p-4 text-left hover:-translate-y-1 hover:shadow-md",
                    selected.id === node.id &&
                      "border-[var(--vidda-primary)] bg-[var(--vidda-primary)] text-white shadow-lg",
                  )}
                >
                  <span className={cn("grid size-9 place-items-center rounded-xl bg-secondary", selected.id === node.id && "bg-white/10 text-[var(--vidda-accent)]")}>
                    <Icon icon={nodeIcons[node.type]} className="size-5" />
                  </span>
                  <Badge variant="outline" className={cn("mt-4 w-fit capitalize", selected.id === node.id && "border-white/20 text-white")}>{node.type}</Badge>
                  <p className="mt-3 text-xs font-extrabold leading-5">{node.label}</p>
                  <p className={cn("mt-auto pt-4 font-mono text-[9px] text-muted-foreground", selected.id === node.id && "text-white/50")}>v{node.version} · {node.status}</p>
                </button>
                {index < traceabilityNodes.length - 1 && <div className="grid shrink-0 place-items-center text-muted-foreground"><Icon icon="solar:arrow-right-linear" /><span className="mt-1 w-16 text-center text-[7px]">{traceabilityEdges[index]?.relationship}</span></div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><Badge variant="secondary" className="capitalize">{selected.type}</Badge><h2 className="mt-3 text-xl font-extrabold">{selected.label}</h2><p className="mt-1 font-mono text-[10px] text-muted-foreground">{selected.id} · Version {selected.version}</p></div>
              <Badge variant={selected.status.includes("pending") ? "destructive" : "outline"}>{selected.status}</Badge>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Detail label="Effective from" value={selected.effectiveFrom} />
              <Detail label="Snapshot as of" value={asOf} />
              {Object.entries(selected.metadata).map(([key, value]) => (
                <Detail key={key} label={key} value={String(value)} />
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <RelationshipList title="Upstream sources" edges={incoming} nodes={scopedNodes} direction="backward" onSelect={setSelectedId} />
              <RelationshipList title="Downstream evidence" edges={outgoing} nodes={scopedNodes} direction="forward" onSelect={setSelectedId} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--vidda-primary)] text-white shadow-none">
          <CardContent className="p-6">
            <Icon icon="solar:history-linear" className="size-6 text-[var(--vidda-accent)]" />
            <h3 className="mt-5 text-lg font-extrabold">Reproducibility snapshot</h3>
            <p className="mt-2 text-xs leading-5 text-white/55">This decision can be reconstructed even after policies, roles or models change.</p>
            <div className="mt-5 space-y-3">{[
              ["Role version", "Retail RM PL v1.1"],
              ["Policy", "AML Policy v4.7"],
              ["Risk formula", "risk-multiplicative-v2"],
              ["Parser", "role-parser-v12"],
              ["AI model", "Vidda Role Reasoning 0.9"],
              ["Taxonomy", "capability-taxonomy-v2"],
            ].map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.06] p-3"><p className="font-mono text-[8px] uppercase text-white/40">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Stat = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <Card className="shadow-none"><CardContent className="p-5"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="metric-number mt-2 text-2xl font-extrabold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{detail}</p></CardContent></Card>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary p-4"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label.replace(/([A-Z])/g, " $1")}</p><p className="mt-2 text-xs font-extrabold">{value}</p></div>
);

const RelationshipList = ({ title, edges, nodes, direction, onSelect }: { title: string; edges: typeof traceabilityEdges; nodes: typeof traceabilityNodes; direction: "forward" | "backward"; onSelect: (id: string) => void }) => (
  <div className="rounded-xl border p-4"><p className="text-xs font-extrabold">{title}</p>{edges.length ? edges.map((edge) => { const targetId = direction === "forward" ? edge.to : edge.from; const target = nodes.find((node) => node.id === targetId); return <button key={edge.id} onClick={() => onSelect(targetId)} className="mt-3 flex w-full items-center gap-3 rounded-lg bg-secondary p-3 text-left hover:bg-secondary/70"><Icon icon={direction === "forward" ? "solar:arrow-right-linear" : "solar:arrow-left-linear"} /><span><span className="block text-[10px] font-bold">{edge.relationship}</span><span className="mt-1 block text-[9px] text-muted-foreground">{target?.label}</span></span></button>; }) : <p className="mt-3 text-[10px] text-muted-foreground">End of chain</p>}</div>
);
