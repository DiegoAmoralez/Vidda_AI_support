import { describe, expect, it } from "vitest";
import { dailyCashCase } from "@/data/cases";
import { evaluateCase } from "@/lib/scoring/evaluate-case";

describe("evaluateCase", () => {
  it("returns the expected partial demo result when escalation is missed", () => {
    const result = evaluateCase({
      learningCase: dailyCashCase,
      answerText:
        "Review history, request documents, verify source of funds and apply EDD.",
      selectedActions: ["history", "documents", "source", "edd"],
    });

    expect(result.overallScore).toBe(72);
    expect(
      result.capabilityScores.find((score) => score.name === "Escalation")?.score,
    ).toBe(45);
    expect(result.missedActions).toContain("Escalate the case to Compliance");
  });

  it("rewards the complete ordered control sequence", () => {
    const result = evaluateCase({
      learningCase: dailyCashCase,
      answerText: "Pause and escalate before execution. Avoid tipping-off.",
      selectedActions: [
        "history",
        "documents",
        "source",
        "screening",
        "edd",
        "escalate",
      ],
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(85);
    expect(result.riskLevel).toBe("low");
  });

  it("applies material penalties to prohibited actions", () => {
    const result = evaluateCase({
      learningCase: dailyCashCase,
      answerText: "Accept immediately and tell the customer about the report.",
      selectedActions: ["accept", "notify"],
    });

    expect(result.overallScore).toBe(0);
    expect(result.incorrectActions).toHaveLength(2);
    expect(result.riskLevel).toBe("critical");
  });
});
