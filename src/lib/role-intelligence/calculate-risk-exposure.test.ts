import { describe, expect, it } from "vitest";
import { defaultRiskFactors } from "@/data/role-intelligence";
import { calculateRiskExposure } from "@/lib/role-intelligence/calculate-risk-exposure";

describe("calculateRiskExposure", () => {
  it("shows every factor and requires approval for High exposure", () => {
    const result = calculateRiskExposure({
      employeeId: "emp-0003",
      roleIds: ["role-retail-rm-pl"],
      factors: defaultRiskFactors,
    });

    expect(result.rawScore).toBe(8.49);
    expect(result.normalizedScore).toBe(67);
    expect(result.level).toBe("high");
    expect(result.approvalRequired).toBe(true);
    expect(result.factors).toHaveLength(defaultRiskFactors.length);
  });

  it("rejects an incomplete zero-valued formula", () => {
    expect(() =>
      calculateRiskExposure({
        employeeId: "emp-0003",
        roleIds: ["role-retail-rm-pl"],
        factors: [{ ...defaultRiskFactors[0], value: 0 }],
      }),
    ).toThrow("positive configured value");
  });
});
