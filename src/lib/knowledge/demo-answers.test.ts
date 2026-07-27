import { describe, expect, it } from "vitest";
import { getDemoKnowledgeAnswer } from "@/lib/knowledge/demo-answers";

describe("getDemoKnowledgeAnswer", () => {
  it("returns an EDD-specific answer", () => {
    const answer = getDemoKnowledgeAnswer("How does EDD affect my role?");
    expect(answer.answer.toLowerCase()).toContain("edd");
    expect(answer.mode).toBe("demo");
  });

  it("returns a threshold comparison answer", () => {
    const answer = getDemoKnowledgeAnswer("Compare old and new thresholds");
    expect(answer.answer.toLowerCase()).toContain("100,000");
  });
});
