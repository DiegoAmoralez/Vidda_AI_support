"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  capabilityCatalog,
} from "@/data/role-intelligence";
import { employees } from "@/data/seed";
import type { Employee } from "@/domain/types";
import { deriveCapabilityProfile } from "@/lib/role-intelligence/derive-capability-profile";
import {
  getEmployeeCapabilityLevels,
  getEmployeeRoleAssignments,
} from "@/lib/role-intelligence/employee-scope";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

type MappingStatus = "mapped" | "pending" | "unmapped" | "conflict" | "expired";

type EmployeeMappingRow = {
  employee: Employee;
  primaryRole: string;
  additionalRole?: string;
  assignmentType?: "secondary" | "temporary" | "acting";
  allocation: number;
  status: MappingStatus;
  managerValidated: boolean;
  hrValidated: boolean;
  complianceValidated: boolean;
  issue?: string;
};

const roleNameByEmployeeRole: Record<string, string> = {
  "Relationship Manager": "Retail Banking Relationship Manager",
  "KYC Analyst": "KYC Analyst",
  "Payments Specialist": "Payments Operations Specialist",
  "Branch Advisor": "Retail Branch Advisor",
  "Operations Analyst": "Banking Operations Analyst",
  "Risk Officer": "Risk Control Officer",
};

const buildEmployeeMappings = (): EmployeeMappingRow[] =>
  employees.map((employee, index) => {
    if (employee.id === "emp-0003") {
      return {
        employee,
        primaryRole: "Retail Banking Relationship Manager",
        additionalRole: "Branch Deputy",
        assignmentType: "temporary",
        allocation: 100,
        status: "conflict",
        managerValidated: true,
        hrValidated: true,
        complianceValidated: false,
        issue: "SoD warning · temporary approval authority requires Compliance review",
      };
    }
    if (index % 19 === 0 && index > 0) {
      return {
        employee,
        primaryRole: "No approved role",
        allocation: 0,
        status: "unmapped",
        managerValidated: false,
        hrValidated: true,
        complianceValidated: false,
        issue: "HR position has no matching approved JobRole",
      };
    }
    if (index % 23 === 0 && index > 0) {
      return {
        employee,
        primaryRole: roleNameByEmployeeRole[employee.role] ?? employee.role,
        allocation: 100,
        status: "expired",
        managerValidated: true,
        hrValidated: true,
        complianceValidated: false,
        issue: "Role assignment expired 12 Jul 2026",
      };
    }
    const hasAdditionalRole = index % 7 === 0;
    const pending = index % 11 === 0;
    return {
      employee,
      primaryRole: roleNameByEmployeeRole[employee.role] ?? employee.role,
      additionalRole: hasAdditionalRole ? "Local Control Owner" : undefined,
      assignmentType: hasAdditionalRole ? "secondary" : undefined,
      allocation: 100,
      status: pending ? "pending" : "mapped",
      managerValidated: !pending,
      hrValidated: true,
      complianceValidated: !pending,
      issue: pending ? "Manager validation due" : undefined,
    };
  });

const mappingRows = buildEmployeeMappings();

export const RoleMappingScreen = () => {
  const router = useRouter();
  const {
    employeeRoleAssignments,
    jobRoles,
    selectedEmployeeId,
    setSelectedEmployeeId,
    approveRoleAssignment,
    reassessRoleIntelligence,
  } = useDemoStore();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [department, setDepartment] = useState("all");
  const [mappingStatus, setMappingStatus] = useState("all");
  const [jobRole, setJobRole] = useState("all");
  const [selectedMapping, setSelectedMapping] =
    useState<EmployeeMappingRow | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [mappingDecisions, setMappingDecisions] = useState<
    Record<string, MappingStatus>
  >({});
  const detailEmployeeId =
    selectedMapping?.employee.id ?? selectedEmployeeId;
  const detailAssignments = getEmployeeRoleAssignments({
    employeeId: detailEmployeeId,
    persistedAssignments: employeeRoleAssignments,
    roles: jobRoles,
  });
  const detailProfile = deriveCapabilityProfile({
    employeeId: detailEmployeeId,
    assignments: detailAssignments,
    roles: jobRoles,
    capabilities: capabilityCatalog,
    demonstratedLevels: getEmployeeCapabilityLevels(detailEmployeeId),
    asOf: "2026-08-10",
  });
  const displayMappings = mappingRows.map((mapping) => {
    const decision = mappingDecisions[mapping.employee.id];
    if (!decision) return mapping;
    return {
      ...mapping,
      status: decision,
      managerValidated: decision === "mapped",
      complianceValidated: decision === "mapped",
      issue:
        decision === "unmapped"
          ? "Mapping rejected and returned to HR for correction"
          : decision === "pending"
            ? "Changes requested from the assignment owner"
            : undefined,
    };
  });
  const filteredMappings = displayMappings.filter((mapping) => {
    const matchesQuery = `${mapping.employee.name} ${mapping.employee.id} ${mapping.primaryRole} ${mapping.additionalRole ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return (
      matchesQuery &&
      (country === "all" || mapping.employee.country === country) &&
      (department === "all" || mapping.employee.department === department) &&
      (mappingStatus === "all" || mapping.status === mappingStatus) &&
      (jobRole === "all" || mapping.primaryRole === jobRole)
    );
  });
  const visibleMappings = filteredMappings.slice(0, 40);
  const visibleIds = visibleMappings.map((mapping) => mapping.employee.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((employeeId) => selectedEmployeeIds.includes(employeeId));
  const uniqueCountries = [...new Set(displayMappings.map((mapping) => mapping.employee.country))];
  const uniqueDepartments = [
    ...new Set(displayMappings.map((mapping) => mapping.employee.department)),
  ];
  const uniqueRoles = [...new Set(displayMappings.map((mapping) => mapping.primaryRole))];

  const handleToggleEmployee = (employeeId: string, checked: boolean) => {
    setSelectedEmployeeIds((current) =>
      checked
        ? [...new Set([...current, employeeId])]
        : current.filter((id) => id !== employeeId),
    );
  };

  const handleToggleVisible = (checked: boolean) => {
    setSelectedEmployeeIds((current) =>
      checked
        ? [...new Set([...current, ...visibleIds])]
        : current.filter((employeeId) => !visibleIds.includes(employeeId)),
    );
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
            Employee-to-role mapping · 1,248 employees
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Workforce role mapping
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review every employee’s primary, secondary, temporary and delegated
            responsibilities. Resolve missing mappings, expired assignments and
            access or SoD inconsistencies.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Employee-role mapping export generated")}
          >
            Export mappings
          </Button>
          <Button
            className="gap-2"
            onClick={() => toast.info("Select employees to start bulk assignment")}
          >
            <Icon icon="solar:add-circle-linear" />
            Bulk assign
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MappingMetric label="Total employees" value="1,248" detail="In current HR scope" />
        <MappingMetric label="Approved mappings" value={displayMappings.filter((row) => row.status === "mapped").length} detail="Validated by owners" />
        <MappingMetric label="Unmapped" value={displayMappings.filter((row) => row.status === "unmapped").length} detail="Require role selection" alert />
        <MappingMetric label="Pending approval" value={displayMappings.filter((row) => row.status === "pending").length} detail="Manager or Compliance" />
        <MappingMetric label="Conflicts / expired" value={displayMappings.filter((row) => ["conflict", "expired"].includes(row.status)).length} detail="Action required" alert />
      </div>

      <Card className="shadow-none">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employee, ID or role"
              className="xl:col-span-1"
            />
            <FilterSelect label="All countries" value={country} options={uniqueCountries} onChange={setCountry} />
            <FilterSelect label="All departments" value={department} options={uniqueDepartments} onChange={setDepartment} />
            <FilterSelect label="All mapping statuses" value={mappingStatus} options={["mapped", "pending", "unmapped", "conflict", "expired"]} onChange={setMappingStatus} />
            <FilterSelect label="All job roles" value={jobRole} options={uniqueRoles} onChange={setJobRole} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            <Badge variant="secondary">{filteredMappings.length} employees</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setCountry("all");
                setDepartment("all");
                setMappingStatus("all");
                setJobRole("all");
              }}
            >
              Reset filters
            </Button>
            <p className="ml-auto text-[10px] text-muted-foreground">
              Showing first {visibleMappings.length} matching records
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedEmployeeIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl bg-[var(--vidda-primary)] p-4 text-white sm:flex-row sm:items-center">
          <p className="flex-1 text-sm font-extrabold">
            {selectedEmployeeIds.length} employee(s) selected
          </p>
          <Button
            variant="outline"
            className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white"
            onClick={() => toast.info("Bulk role selection opened")}
          >
            Assign role
          </Button>
          <Button
            variant="outline"
            className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white"
            onClick={() => toast.success("Selected mappings sent for validation")}
          >
            Request validation
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setSelectedEmployeeIds([])}>
            Clear
          </Button>
        </div>
      )}

      <Card className="overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(checked) => handleToggleVisible(Boolean(checked))}
                    aria-label="Select visible employees"
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Country / unit</TableHead>
                <TableHead>Primary role</TableHead>
                <TableHead>Additional responsibility</TableHead>
                <TableHead>Allocation</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMappings.map((mapping) => (
                <TableRow
                  key={mapping.employee.id}
                  className={cn(
                    mapping.employee.id === "emp-0003" && "bg-[var(--vidda-accent)]/10",
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedEmployeeIds.includes(mapping.employee.id)}
                      onCheckedChange={(checked) =>
                        handleToggleEmployee(mapping.employee.id, Boolean(checked))
                      }
                      aria-label={`Select ${mapping.employee.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-[10px] font-extrabold">
                        {mapping.employee.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </span>
                      <div>
                        <p className="text-xs font-extrabold">{mapping.employee.name}</p>
                        <p className="mt-1 font-mono text-[9px] text-muted-foreground">{mapping.employee.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{mapping.employee.country}</p>
                    <p className="mt-1 text-[9px] text-muted-foreground">{mapping.employee.department}</p>
                  </TableCell>
                  <TableCell className="max-w-56 text-xs font-bold">{mapping.primaryRole}</TableCell>
                  <TableCell>
                    {mapping.additionalRole ? (
                      <div><p className="text-xs">{mapping.additionalRole}</p><Badge variant="outline" className="mt-1 capitalize">{mapping.assignmentType}</Badge></div>
                    ) : <span className="text-xs text-muted-foreground">None</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{mapping.allocation}%</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <ValidationDot label="Manager" valid={mapping.managerValidated} />
                      <ValidationDot label="HR" valid={mapping.hrValidated} />
                      <ValidationDot label="Compliance" valid={mapping.complianceValidated} />
                    </div>
                  </TableCell>
                  <TableCell><MappingStatusBadge status={mapping.status} /></TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedEmployeeId(mapping.employee.id);
                        setSelectedMapping(mapping);
                      }}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Sheet
        open={Boolean(selectedMapping)}
        onOpenChange={(open) => !open && setSelectedMapping(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedMapping && (
            <EmployeeMappingDetail
              mapping={selectedMapping}
              profile={detailProfile}
              assignments={detailAssignments}
              jobRoles={jobRoles}
              onApproveAssignment={approveRoleAssignment}
              onReassess={reassessRoleIntelligence}
              onDecision={(decision) => {
                setMappingDecisions((current) => ({
                  ...current,
                  [selectedMapping.employee.id]: decision,
                }));
                setSelectedMapping((current) =>
                  current
                    ? {
                        ...current,
                        status: decision,
                        managerValidated: decision === "mapped",
                        complianceValidated: decision === "mapped",
                        issue:
                          decision === "mapped"
                            ? undefined
                            : "Returned to the assignment owner for correction",
                      }
                    : current,
                );
              }}
              onOpenLearningPlan={() => {
                setSelectedEmployeeId(selectedMapping.employee.id);
                router.push("/portal/role-learning-plans");
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      <p className="rounded-xl border bg-white p-4 text-[10px] leading-5 text-muted-foreground">
        Training and role evidence must not be used as the sole basis for disciplinary
        or employment decisions. High-risk mappings require authorized human validation.
      </p>
    </div>
  );
};

const EmployeeMappingDetail = ({
  mapping,
  profile,
  assignments,
  jobRoles,
  onApproveAssignment,
  onReassess,
  onDecision,
  onOpenLearningPlan,
}: {
  mapping: EmployeeMappingRow;
  profile: ReturnType<typeof deriveCapabilityProfile>;
  assignments: ReturnType<typeof useDemoStore.getState>["employeeRoleAssignments"];
  jobRoles: ReturnType<typeof useDemoStore.getState>["jobRoles"];
  onApproveAssignment: (assignmentId: string) => void;
  onReassess: () => void;
  onDecision: (decision: MappingStatus) => void;
  onOpenLearningPlan: () => void;
}) => {
  return (
    <>
      <SheetHeader className="border-b p-6 text-left">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--vidda-primary)] font-extrabold text-[var(--vidda-accent)]">
            {mapping.employee.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
          </span>
          <div>
            <SheetTitle>{mapping.employee.name}</SheetTitle>
            <SheetDescription>
              {mapping.employee.id} · {mapping.employee.department} · {mapping.employee.country}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-3 gap-3">
          <Info label="Allocation" value={`${mapping.allocation}%`} />
          <Info label="Assignments" value={String(profile.activeAssignments.length)} />
          <Info label="Mapping status" value={mapping.status} />
        </div>

        {mapping.issue && (
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Icon icon="solar:shield-warning-linear" className="mt-0.5 shrink-0 text-amber-800" />
            <div><p className="text-xs font-extrabold">Mapping requires attention</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{mapping.issue}</p></div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold">Role assignments</p>
            <Button size="sm" variant="outline" onClick={() => toast.info(`Role assignment wizard opened for ${mapping.employee.name}`)}>
              Add role
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {assignments.map((assignment) => {
              const role = jobRoles.find((item) => item.id === assignment.roleId);
              return (
                <div key={assignment.id} className={cn("rounded-xl border p-4", assignment.status === "pending" && "border-amber-300 bg-amber-50/50")}>
                  <div className="flex items-start justify-between gap-3">
                    <div><Badge variant="secondary" className="capitalize">{assignment.assignmentType}</Badge><p className="mt-2 text-sm font-extrabold">{role?.standardizedTitle}</p><p className="mt-1 text-[9px] text-muted-foreground">v{assignment.roleVersion} · {assignment.effectiveFrom} → {assignment.effectiveTo ?? "Open-ended"}</p></div>
                    <p className="font-mono text-lg font-extrabold">{assignment.allocationPercent}%</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Validation label="Manager" valid={assignment.managerValidated} />
                    <Validation label="HR" valid={assignment.hrValidated} />
                    <Validation label="Compliance" valid={assignment.complianceValidated} />
                  </div>
                  {assignment.status === "pending" && (
                    <Button
                      className="mt-4 w-full"
                      onClick={() => {
                        onApproveAssignment(assignment.id);
                        toast.success("Temporary assignment approved by Compliance");
                      }}
                    >
                      Approve temporary assignment
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-extrabold">Combined capabilities</p><p className="mt-1 text-[10px] text-muted-foreground">Highest justified requirement across active roles.</p></div>
            <Button size="sm" variant="ghost" onClick={() => { onReassess(); toast.success("Profile reassessed"); }}>Recalculate</Button>
          </div>
          <div className="mt-4 space-y-3">
            {profile.capabilities.slice(0, 6).map((capability) => (
              <div key={capability.capabilityId} className="rounded-xl border p-3">
                <div className="flex justify-between gap-3"><p className="text-xs font-bold">{capability.capabilityName}</p><p className="font-mono text-[10px]">L{capability.demonstratedLevel} → L{capability.requiredLevel}</p></div>
                <Progress value={(capability.demonstratedLevel / capability.requiredLevel) * 100} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {mapping.status !== "mapped" && (
          <div className="rounded-xl border bg-secondary/40 p-4">
            <p className="text-xs font-extrabold">Mapping decision</p>
            <p className="mt-1 text-[10px] leading-5 text-muted-foreground">Confirm that role, allocation, dates and validation ownership match the employee’s current responsibilities.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button size="sm" variant="destructive" onClick={() => { onDecision("unmapped"); toast.warning("Mapping rejected and returned to HR"); }}>Reject</Button>
              <Button size="sm" variant="outline" onClick={() => { onDecision("pending"); toast.info("Changes requested from assignment owner"); }}>Request changes</Button>
              <Button size="sm" onClick={() => { onDecision("mapped"); toast.success("Employee mapping approved"); }}>Approve</Button>
            </div>
          </div>
        )}

        <Button className="w-full gap-2" onClick={onOpenLearningPlan}>
          Open individual learning plan
          <Icon icon="solar:arrow-right-linear" />
        </Button>
      </div>
    </>
  );
};

const MappingMetric = ({
  label,
  value,
  detail,
  alert = false,
}: {
  label: string;
  value: string | number;
  detail: string;
  alert?: boolean;
}) => (
  <Card className={cn("shadow-none", alert && "border-amber-200 bg-amber-50/50")}>
    <CardContent className="p-5">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="metric-number mt-2 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-[9px] text-muted-foreground">{detail}</p>
    </CardContent>
  </Card>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{label}</SelectItem>
      {options.map((option) => (
        <SelectItem key={option} value={option}>
          <span className="capitalize">{option}</span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const MappingStatusBadge = ({ status }: { status: MappingStatus }) => {
  if (status === "mapped") return <Badge variant="outline">Mapped</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  return <Badge variant="destructive" className="capitalize">{status}</Badge>;
};

const ValidationDot = ({ label, valid }: { label: string; valid: boolean }) => (
  <span
    title={`${label}: ${valid ? "validated" : "pending"}`}
    aria-label={`${label}: ${valid ? "validated" : "pending"}`}
    className={cn(
      "size-2 rounded-full",
      valid ? "bg-emerald-600" : "bg-amber-500",
    )}
  />
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-secondary p-3"><p className="font-mono text-[8px] uppercase text-muted-foreground">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>
);

const Validation = ({ label, valid }: { label: string; valid: boolean }) => (
  <Badge variant={valid ? "outline" : "destructive"} className="gap-1"><Icon icon={valid ? "solar:check-read-linear" : "solar:clock-circle-linear"} />{label}</Badge>
);
