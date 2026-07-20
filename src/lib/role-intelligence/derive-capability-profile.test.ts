import { describe, expect, it } from "vitest";
import {
  capabilityCatalog,
  employeeCapabilityLevels,
  employeeRoleAssignments,
  jobRoles,
} from "@/data/role-intelligence";
import {
  deriveCapabilityProfile,
  selectApplicableRole,
} from "@/lib/role-intelligence/derive-capability-profile";

describe("deriveCapabilityProfile", () => {
  it("uses the highest justified L1-L5 level across simultaneous roles", () => {
    const profile = deriveCapabilityProfile({
      employeeId: "emp-0003",
      assignments: employeeRoleAssignments,
      roles: jobRoles,
      capabilities: capabilityCatalog,
      demonstratedLevels: employeeCapabilityLevels,
      asOf: "2026-08-10",
    });

    expect(
      profile.capabilities.find(
        (capability) => capability.capabilityId === "cap-approval",
      )?.requiredLevel,
    ).toBe(4);
    expect(profile.conflicts.some((conflict) => conflict.id === "sod-initiate-approve")).toBe(true);
  });

  it("removes temporary requirements after the assignment expiry", () => {
    const profile = deriveCapabilityProfile({
      employeeId: "emp-0003",
      assignments: employeeRoleAssignments,
      roles: jobRoles,
      capabilities: capabilityCatalog,
      demonstratedLevels: employeeCapabilityLevels,
      asOf: "2026-09-01",
    });

    expect(profile.activeAssignments).toHaveLength(1);
    expect(
      profile.capabilities.some(
        (capability) => capability.capabilityId === "cap-approval",
      ),
    ).toBe(false);
  });

  it("selects the effective local variant after a jurisdiction change", () => {
    const germanVariant = {
      ...jobRoles[0],
      id: "role-retail-rm-de",
      legalEntity: "NordBank Deutschland AG",
      country: "Germany",
      jurisdiction: "Germany / European Union",
    };

    const applicable = selectApplicableRole({
      roles: [...jobRoles, germanVariant],
      standardizedTitle: "Retail Banking Relationship Manager",
      legalEntity: "NordBank Deutschland AG",
      jurisdiction: "Germany",
      asOf: "2026-08-10",
    });

    expect(applicable?.id).toBe("role-retail-rm-de");
  });
});
