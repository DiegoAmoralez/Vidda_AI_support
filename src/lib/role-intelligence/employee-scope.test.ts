import { describe, expect, it } from "vitest";
import {
  employeeRoleAssignments,
  jobRoles,
} from "@/data/role-intelligence";
import {
  getEmployeeCapabilityLevels,
  getEmployeeRiskFactors,
  getEmployeeRoleAssignments,
} from "@/lib/role-intelligence/employee-scope";

describe("employee role-intelligence scope", () => {
  it("preserves Sofia's approved multi-role demonstration", () => {
    const assignments = getEmployeeRoleAssignments({
      employeeId: "emp-0003",
      persistedAssignments: employeeRoleAssignments,
      roles: jobRoles,
    });

    expect(assignments).toHaveLength(2);
    expect(assignments.some((item) => item.assignmentType === "temporary")).toBe(
      true,
    );
  });

  it("generates a role-specific assignment for another employee", () => {
    const assignments = getEmployeeRoleAssignments({
      employeeId: "emp-0004",
      persistedAssignments: employeeRoleAssignments,
      roles: jobRoles,
    });

    expect(assignments).toHaveLength(1);
    expect(assignments[0].roleId).toBe("role-branch-advisor");
    expect(assignments[0].employeeId).toBe("emp-0004");
  });

  it("varies capability and risk factors by employee evidence", () => {
    const danielLevels = getEmployeeCapabilityLevels("emp-0004");
    const mariaLevels = getEmployeeCapabilityLevels("emp-0006");
    const danielRisk = getEmployeeRiskFactors("emp-0004");
    const mariaRisk = getEmployeeRiskFactors("emp-0006");

    expect(
      Object.values(mariaLevels).reduce((sum, level) => sum + level, 0),
    ).toBeGreaterThan(
      Object.values(danielLevels).reduce((sum, level) => sum + level, 0),
    );
    expect(danielRisk[0].value).toBeGreaterThan(mariaRisk[0].value);
  });
});
