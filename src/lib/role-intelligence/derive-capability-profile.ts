import type {
  CapabilityDefinition,
  EmployeeRoleAssignment,
  JobRole,
  ProficiencyLevel,
  RoleCapabilityRequirement,
} from "@/domain/types";

export type CombinedCapability = {
  capabilityId: string;
  capabilityName: string;
  requiredLevel: ProficiencyLevel;
  demonstratedLevel: ProficiencyLevel;
  gap: number;
  criticality: RoleCapabilityRequirement["criticality"];
  sourceRoles: Array<{ roleId: string; title: string; requirementId: string }>;
  evidenceRequired: string[];
};

export type CombinedCapabilityProfile = {
  employeeId: string;
  asOf: string;
  activeAssignments: EmployeeRoleAssignment[];
  capabilities: CombinedCapability[];
  conflicts: Array<{ id: string; severity: "warning" | "critical"; message: string }>;
};

const criticalityRank = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export const selectApplicableRole = ({
  roles,
  standardizedTitle,
  legalEntity,
  jurisdiction,
  asOf,
}: {
  roles: JobRole[];
  standardizedTitle: string;
  legalEntity: string;
  jurisdiction: string;
  asOf: string;
}) =>
  roles.find(
    (role) =>
      role.standardizedTitle === standardizedTitle &&
      role.legalEntity === legalEntity &&
      role.jurisdiction.includes(jurisdiction) &&
      role.status === "published" &&
      role.effectiveFrom <= asOf &&
      (!role.effectiveTo || role.effectiveTo >= asOf),
  );

export const deriveCapabilityProfile = ({
  employeeId,
  assignments,
  roles,
  capabilities,
  demonstratedLevels,
  asOf,
}: {
  employeeId: string;
  assignments: EmployeeRoleAssignment[];
  roles: JobRole[];
  capabilities: CapabilityDefinition[];
  demonstratedLevels: Record<string, number>;
  asOf: string;
}): CombinedCapabilityProfile => {
  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.employeeId === employeeId &&
      assignment.status !== "rejected" &&
      assignment.effectiveFrom <= asOf &&
      (!assignment.effectiveTo || assignment.effectiveTo >= asOf),
  );
  const combined = new Map<string, CombinedCapability>();

  activeAssignments.forEach((assignment) => {
    const role = roles.find((candidate) => candidate.id === assignment.roleId);
    if (!role) return;
    role.capabilityRequirements
      .filter((requirement) => requirement.approved)
      .forEach((requirement) => {
        const capabilityName =
          capabilities.find((item) => item.id === requirement.capabilityId)?.name ??
          requirement.capabilityId;
        const current = combined.get(requirement.capabilityId);
        const demonstratedLevel = Math.max(
          1,
          Math.min(5, demonstratedLevels[requirement.capabilityId] ?? 1),
        ) as ProficiencyLevel;
        const requiredLevel = Math.max(
          current?.requiredLevel ?? 1,
          requirement.requiredLevel,
        ) as ProficiencyLevel;
        combined.set(requirement.capabilityId, {
          capabilityId: requirement.capabilityId,
          capabilityName,
          requiredLevel,
          demonstratedLevel,
          gap: Math.max(0, requiredLevel - demonstratedLevel),
          criticality:
            current &&
            criticalityRank[current.criticality] >
              criticalityRank[requirement.criticality]
              ? current.criticality
              : requirement.criticality,
          sourceRoles: [
            ...(current?.sourceRoles ?? []),
            {
              roleId: role.id,
              title: role.standardizedTitle,
              requirementId: requirement.id,
            },
          ],
          evidenceRequired: [
            ...new Set([
              ...(current?.evidenceRequired ?? []),
              ...requirement.evidenceRequired,
            ]),
          ],
        });
      });
  });

  const totalAllocation = activeAssignments.reduce(
    (sum, assignment) => sum + assignment.allocationPercent,
    0,
  );
  const hasPrimaryAndApproval = activeAssignments.some(
    (assignment) => assignment.assignmentType === "primary",
  ) &&
    activeAssignments.some((assignment) =>
      ["temporary", "acting", "delegated"].includes(assignment.assignmentType),
    );
  const conflicts: CombinedCapabilityProfile["conflicts"] = [];
  if (totalAllocation > 100) {
    conflicts.push({
      id: "allocation-over-100",
      severity: "critical",
      message: `Active role allocation totals ${totalAllocation}%.`,
    });
  }
  if (hasPrimaryAndApproval) {
    conflicts.push({
      id: "sod-initiate-approve",
      severity: "warning",
      message:
        "Customer initiation and delegated approval responsibilities require a separate second approver.",
    });
  }
  if (activeAssignments.some((assignment) => !assignment.complianceValidated)) {
    conflicts.push({
      id: "unapproved-critical-assignment",
      severity: "critical",
      message:
        "A critical temporary assignment is pending Compliance validation.",
    });
  }

  return {
    employeeId,
    asOf,
    activeAssignments,
    capabilities: [...combined.values()].sort(
      (left, right) =>
        criticalityRank[right.criticality] - criticalityRank[left.criticality],
    ),
    conflicts,
  };
};
