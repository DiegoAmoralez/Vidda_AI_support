import {
  defaultRiskFactors,
  employeeCapabilityLevels,
} from "@/data/role-intelligence";
import { employees } from "@/data/seed";
import type {
  Employee,
  EmployeeRoleAssignment,
  JobRole,
  ProficiencyLevel,
  RiskFactor,
} from "@/domain/types";

const roleIdByEmployeeRole: Record<string, string> = {
  "Relationship Manager": "role-retail-rm-pl",
  "KYC Analyst": "role-kyc-analyst",
  "Payments Specialist": "role-payments-specialist",
  "Branch Advisor": "role-branch-advisor",
  "Operations Analyst": "role-operations-analyst",
  "Risk Officer": "role-risk-officer",
};

export const getEmployeeById = (employeeId: string): Employee =>
  employees.find((employee) => employee.id === employeeId) ?? employees[0];

export const getEmployeeRoleAssignments = ({
  employeeId,
  persistedAssignments,
  roles,
}: {
  employeeId: string;
  persistedAssignments: EmployeeRoleAssignment[];
  roles: JobRole[];
}): EmployeeRoleAssignment[] => {
  const persisted = persistedAssignments.filter(
    (assignment) => assignment.employeeId === employeeId,
  );
  if (persisted.length) return persisted;

  const employee = getEmployeeById(employeeId);
  const roleId =
    employee.department === "Corporate Banking" &&
    employee.role === "Relationship Manager"
      ? "role-corporate-rm"
      : roleIdByEmployeeRole[employee.role] ?? "role-operations-analyst";
  const role = roles.find((candidate) => candidate.id === roleId) ?? roles[0];

  return [
    {
      id: `generated-assignment-${employee.id}`,
      employeeId: employee.id,
      roleId: role.id,
      roleVersion: role.version,
      assignmentType: "primary",
      allocationPercent: 100,
      effectiveFrom: "2026-01-01",
      status: "active",
      managerValidated: employee.id.charCodeAt(employee.id.length - 1) % 5 !== 0,
      hrValidated: true,
      complianceValidated: employee.riskLevel !== "critical",
      reason: "Deterministic assignment derived from the current HR position.",
    },
  ];
};

export const getEmployeeCapabilityLevels = (
  employeeId: string,
): Record<string, number> => {
  if (employeeId === "emp-0003") return employeeCapabilityLevels;
  const employee = getEmployeeById(employeeId);
  const baseLevel =
    employee.capabilityScore >= 90
      ? 4
      : employee.capabilityScore >= 78
        ? 3
        : employee.capabilityScore >= 65
          ? 2
          : 1;

  return Object.fromEntries(
    Object.keys(employeeCapabilityLevels).map((capabilityId, index) => {
      const variation = (employee.id.charCodeAt(employee.id.length - 1) + index) % 3 - 1;
      const level = Math.max(1, Math.min(5, baseLevel + variation));
      return [capabilityId, level as ProficiencyLevel];
    }),
  );
};

export const getEmployeeRiskFactors = (
  employeeId: string,
  role?: JobRole,
): RiskFactor[] => {
  const employee = getEmployeeById(employeeId);
  const inherentRisk =
    employee.riskLevel === "critical"
      ? 5
      : employee.riskLevel === "high"
        ? 4.5
        : employee.riskLevel === "medium" ||
            employee.riskLevel === "moderate"
          ? 3.7
          : 3.1;
  const employeeModifier = Number(
    Math.max(0.82, Math.min(1.35, 1.45 - employee.capabilityScore / 180)).toFixed(2),
  );

  return defaultRiskFactors.map((factor) => {
    if (factor.id === "factor-inherent") {
      return {
        ...factor,
        value: inherentRisk,
        source: `${role?.standardizedTitle ?? employee.role} approved inherent-risk classification`,
      };
    }
    if (factor.id === "factor-employee") {
      return {
        ...factor,
        value: employeeModifier,
        source: `${employee.name} current capability and evidence profile`,
        confidence: 82 + (employee.capabilityScore % 14),
      };
    }
    if (factor.id === "factor-authority" && role?.criticality === "critical") {
      return { ...factor, value: 1.35, source: "Critical decision or approval authority" };
    }
    return factor;
  });
};
