import { describe, expect, it } from "vitest";
import { parsedStatements } from "@/data/role-intelligence";
import {
  canCreateMandatoryRequirement,
  parseJobDescription,
} from "@/lib/role-intelligence/parse-job-description";

describe("parseJobDescription", () => {
  it("blocks an unapproved inferred responsibility from mandatory use", () => {
    const inferred = parsedStatements.find(
      (statement) => statement.classification === "inferred-high",
    );

    expect(inferred).toBeDefined();
    expect(canCreateMandatoryRequirement(inferred!)).toBe(false);
    expect(
      canCreateMandatoryRequirement({
        ...inferred!,
        reviewStatus: "approved",
      }),
    ).toBe(true);
  });

  it("preserves source spans and review reasons", () => {
    const result = parseJobDescription(
      "Onboards customers, identifies beneficial owners and escalates suspicious behaviour.",
    );

    expect(result.statements.every((statement) => statement.sourceSpan)).toBe(true);
    expect(result.statements.every((statement) => statement.requiredReviewer)).toBe(true);
    expect(result.mandatoryGenerationBlocked).toBe(true);
  });
});
