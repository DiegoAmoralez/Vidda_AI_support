import { describe, expect, it } from "vitest";
import {
  capabilityCatalog,
  employeeCapabilityLevels,
  employeeRoleAssignments,
  jobRoles,
  learningCatalog,
} from "@/data/role-intelligence";
import { deriveCapabilityProfile } from "@/lib/role-intelligence/derive-capability-profile";
import { recommendLearning } from "@/lib/role-intelligence/recommend-learning";

const profile = deriveCapabilityProfile({
  employeeId: "emp-0003",
  assignments: employeeRoleAssignments,
  roles: jobRoles,
  capabilities: capabilityCatalog,
  demonstratedLevels: employeeCapabilityLevels,
  asOf: "2026-08-10",
});

describe("recommendLearning", () => {
  it("deduplicates one intervention across multiple capability gaps", () => {
    const recommendations = recommendLearning({
      profile,
      catalog: learningCatalog,
      jurisdiction: "Poland",
      legalEntity: "NordBank Polska S.A.",
      roleFamilies: ["Retail Customer Management", "Branch Leadership"],
    });
    const escalation = recommendations.find(
      (item) => item.learningItemId === "learn-escalation",
    );

    expect(new Set(recommendations.map((item) => item.learningItemId)).size).toBe(
      recommendations.length,
    );
    expect(escalation?.capabilityIds).toEqual(
      expect.arrayContaining(["cap-escalation", "cap-risk-id"]),
    );
  });

  it("keeps learning conditional while its inferred responsibility is unapproved", () => {
    const recommendations = recommendLearning({
      profile,
      catalog: learningCatalog,
      jurisdiction: "Poland",
      legalEntity: "NordBank Polska S.A.",
      roleFamilies: ["Retail Customer Management", "Branch Leadership"],
      blockedCapabilityIds: ["cap-edd"],
    });

    expect(
      recommendations.find((item) => item.learningItemId === "learn-edd-case")
        ?.approvalStatus,
    ).toBe("preview");
  });
});
