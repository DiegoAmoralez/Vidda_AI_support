"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  departmentRanking,
  employees,
} from "@/data/seed";
import type { Employee, RiskLevel } from "@/domain/types";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const riskVariant = (risk: RiskLevel) => {
  if (risk === "critical") return "destructive";
  if (risk === "high") return "destructive";
  if (risk === "medium") return "secondary";
  return "outline";
};

export const EmployeesScreen = () => {
  const router = useRouter();
  const setSelectedEmployeeId = useDemoStore(
    (state) => state.setSelectedEmployeeId,
  );
  const [query, setQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [descending, setDescending] = useState(true);
  const visibleEmployees = useMemo(
    () =>
      employees
        .filter((employee) =>
          `${employee.name} ${employee.role} ${employee.department}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          descending
            ? b.capabilityScore - a.capabilityScore
            : a.capabilityScore - b.capabilityScore,
        )
        .slice(0, 12),
    [query, descending],
  );
  return (
    <Page title="Employee risk analytics" eyebrow="1,248 employee profiles" description="Practical capability signals support targeted learning. They are not a standalone basis for employment decisions.">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employee, role or department" className="max-w-md bg-white" />
        <Button variant="outline" onClick={() => setDescending((value) => !value)} className="gap-2"><Icon icon="solar:sort-vertical-linear" />Score {descending ? "high to low" : "low to high"}</Button>
        <Button variant="outline" onClick={() => toast.success("Risk filters applied")}>Filter: all risk levels</Button>
      </div>
      <Card className="overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Department</TableHead><TableHead>Capability score</TableHead><TableHead>Risk</TableHead><TableHead>Cases</TableHead><TableHead>Repeated errors</TableHead><TableHead>Trend</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {visibleEmployees.map((employee) => (
                <TableRow key={employee.id} id={`employee-${employee.id}`}>
                  <TableCell><p className="font-bold">{employee.name}</p><p className="text-[10px] text-muted-foreground">{employee.role}</p></TableCell>
                  <TableCell className="text-xs">{employee.department}</TableCell>
                  <TableCell><span className="font-mono font-bold">{employee.capabilityScore}%</span></TableCell>
                  <TableCell><Badge variant={riskVariant(employee.riskLevel)} className="capitalize">{employee.riskLevel}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{employee.casesCompleted}</TableCell>
                  <TableCell className="font-mono text-xs">{employee.repeatedErrors}</TableCell>
                  <TableCell className={cn("font-mono text-xs font-bold", employee.trend < 0 ? "text-red-700" : "text-emerald-700")}>{employee.trend > 0 ? "+" : ""}{employee.trend}%</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => setSelectedEmployee(employee)}>Open profile</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <EmployeeProfile
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onOpenLearningPlan={(employeeId) => {
          setSelectedEmployeeId(employeeId);
          router.push("/portal/role-learning-plans");
        }}
      />
    </Page>
  );
};

const EmployeeProfile = ({
  employee,
  onClose,
  onOpenLearningPlan,
}: {
  employee: Employee | null;
  onClose: () => void;
  onOpenLearningPlan: (employeeId: string) => void;
}) => (
  <Dialog open={Boolean(employee)} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader><DialogTitle>{employee?.name}</DialogTitle><DialogDescription>{employee?.role} · {employee?.department} · {employee?.branch}</DialogDescription></DialogHeader>
      <div className="grid gap-3 sm:grid-cols-4">
        {[["Readiness", `${employee?.capabilityScore}%`], ["Role benchmark", "80%"], ["Team benchmark", "63%"], ["Cases completed", employee?.casesCompleted]].map(([label, value]) => <div key={label} className="rounded-xl border p-4"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-xl font-extrabold">{value}</p></div>)}
      </div>
      <div className="rounded-xl bg-[var(--vidda-primary)] p-5 text-white">
        <p className="flex items-center gap-2 text-xs font-extrabold text-[var(--vidda-accent)]"><Icon icon="solar:magic-stick-3-linear" />AI summary</p>
        <p className="mt-3 text-sm leading-6 text-white/65">{employee && employee.repeatedErrors >= 4 ? `${employee.name} shows repeated practical execution errors despite partial knowledge evidence. The next plan should prioritize observed practice and manager validation.` : `${employee?.name} identifies core risks consistently. Recent evidence indicates that targeted practice should focus on the lowest role-specific capability gap.`}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Risk identification", 88],
          ["KYC procedure", 76],
          ["Source of funds", 69],
          ["AML escalation", employee?.riskLevel === "critical" ? 39 : 54],
        ].map(([label, score]) => <div key={label} className="rounded-xl border p-4"><div className="mb-2 flex justify-between text-xs"><span>{label}</span><span className="font-mono font-bold">{score}%</span></div><Progress value={Number(score)} className="h-1.5" /></div>)}
      </div>
      <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => toast.success("Manager note saved")}>Add manager note</Button><Button variant="outline" disabled={!employee} onClick={() => employee && onOpenLearningPlan(employee.id)}>Open learning plan</Button><Button onClick={() => toast.success("Targeted reassessment assigned")}>Assign reassessment</Button></div>
    </DialogContent>
  </Dialog>
);

export const TeamsScreen = () => (
  <Page title="Team overview" eyebrow="Risk prioritization" description="Department comparison identifies where support is needed. It is not published as an employee leaderboard.">
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Card className="shadow-none"><CardContent className="p-6"><p className="text-sm font-extrabold">Department readiness</p><p className="text-xs text-muted-foreground">Compared with bank target of 85%</p><div className="mt-5 h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={departmentRanking} layout="vertical" margin={{ left: 20 }}><CartesianGrid horizontal={false} stroke="#e4e8e3" /><XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} fontSize={10} /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={130} fontSize={10} /><Tooltip /><Bar dataKey="readiness" fill="#173f3a" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {[["Team readiness", "76%", "+7% over 90 days"], ["Weekly engagement", "84%", "1,047 active employees"], ["Regulation coverage", "68%", "87 reassessments due"], ["High-risk distribution", "3.7%", "46 employees"]].map(([label, value, detail]) => <Card key={label} className="shadow-none"><CardContent className="p-5"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="metric-number mt-2 text-2xl font-extrabold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{detail}</p></CardContent></Card>)}
      </div>
    </div>
  </Page>
);

export const RiskAnalyticsScreen = () => (
  <Page title="Risk analytics" eyebrow="Early capability signals" description="Explore where repeated practical errors create organizational exposure.">
    <Card className="shadow-none"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-lg font-extrabold">Capability risk map</p><p className="text-xs text-muted-foreground">Readiness by team and control behavior</p></div><Badge variant="destructive">7 critical gaps</Badge></div><CapabilityHeatmap /></CardContent></Card>
  </Page>
);

const capabilityGroups = [
  { group: "AML", capabilities: ["AML Escalation", "Suspicious Activity Recognition", "Transaction Monitoring"] },
  { group: "KYC", capabilities: ["Customer Identification", "Beneficial Ownership", "Source of Funds"] },
  { group: "Sanctions", capabilities: ["Screening Resolution", "Payment Controls"] },
  { group: "Fraud", capabilities: ["Fraud Detection", "Customer Safeguarding"] },
  { group: "Conduct", capabilities: ["Conflict Recognition", "Customer Communication"] },
  { group: "Data Protection", capabilities: ["Data Handling", "Incident Reporting"] },
  { group: "Cybersecurity", capabilities: ["Phishing Recognition", "Endpoint Security"] },
];

export const CapabilitiesScreen = () => (
  <Page title="Capability framework" eyebrow="Financial Crime Compliance" description="Policies are mapped to observable behaviors, roles, cases and target proficiency.">
    <div id="capability-cap-escalation" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
      <p className="text-xs text-muted-foreground">Canonical capability IDs now connect approved role requirements to evidence.</p>
      <div className="flex gap-2"><Button variant="outline" asChild><Link href="/portal/role-catalog">View role requirements</Link></Button><Button asChild><Link href="/portal/traceability">Trace to evidence</Link></Button></div>
    </div>
    <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
      <Card className="shadow-none"><CardContent className="p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Domain hierarchy</p><div className="mt-4 space-y-2">{capabilityGroups.map((group, index) => <button key={group.group} className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm font-bold hover:bg-secondary", index === 0 && "border-[var(--vidda-primary)] bg-secondary")}><span>{group.group}</span><Badge variant="outline">{group.capabilities.length}</Badge></button>)}</div></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-6"><div className="flex flex-wrap items-center gap-2"><Badge>High criticality</Badge><Badge variant="outline">Target level 4</Badge></div><h2 className="mt-4 text-2xl font-extrabold">AML Escalation</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Recognizes escalation triggers and follows the authorized sequence before transaction execution.</p><div className="mt-6 grid gap-2">{["Recognizes escalation trigger", "Pauses transaction when required", "Collects supporting evidence", "Uses correct escalation channel", "Avoids tipping-off", "Documents decision", "Waits for authorized approval"].map((behavior, index) => <div key={behavior} className="flex items-center gap-3 rounded-xl border p-3"><span className={cn("grid size-7 place-items-center rounded-full font-mono text-[10px]", index < 4 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{index < 4 ? "✓" : "!"}</span><span className="text-xs font-medium">{behavior}</span><span className="ml-auto font-mono text-[10px] text-muted-foreground">{index < 4 ? "72–84%" : "49–61%"}</span></div>)}</div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Bank benchmark", "80%"], ["Current average", "64%"], ["Linked policies", "4"], ["Linked cases", "11"]].map(([label, value]) => <div key={label} className="rounded-xl bg-secondary p-3"><p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-2 font-extrabold">{value}</p></div>)}</div></CardContent></Card>
    </div>
  </Page>
);

const Page = ({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) => <div className="space-y-7"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div>{children}</div>;
