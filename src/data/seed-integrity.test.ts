import { describe, expect, it } from "vitest";
import { learningCases } from "@/data/cases";
import { employees, heatmapData, policyDocuments } from "@/data/seed";
import {
  capabilityCatalog,
  controlCatalog,
  jobRoles,
  learningCatalog,
  parsedStatements,
  riskTaxonomy,
  roleSourceCatalog,
  traceabilityEdges,
  traceabilityNodes,
} from "@/data/role-intelligence";
import { getAdaptiveDecision } from "@/lib/adaptive/rules";
import { evaluateCase } from "@/lib/scoring/evaluate-case";

describe("demo seed integrity", () => {
  it("contains the full NordBank demonstration scope", () => {
    expect(employees).toHaveLength(1248);
    expect(learningCases).toHaveLength(20);
    expect(policyDocuments.length).toBeGreaterThanOrEqual(7);
    expect(heatmapData).toHaveLength(9);
  });

  it("keeps each case executable and grounded", () => {
    learningCases.forEach((learningCase) => {
      expect(learningCase.actions.length).toBeGreaterThanOrEqual(6);
      expect(learningCase.expectedSequence.length).toBeGreaterThanOrEqual(5);
      expect(learningCase.policyReferences.length).toBeGreaterThanOrEqual(3);
      expect(learningCase.capabilityTags.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("assigns follow-up practice after a repeated escalation gap", () => {
    const result = evaluateCase({
      learningCase: learningCases[0],
      answerText: "Review history and request documents.",
      selectedActions: ["history", "documents"],
    });
    const decision = getAdaptiveDecision(result, 2);

    expect(decision.assignMicrolearning).toBe(true);
    expect(decision.scheduleWithinDays).toBe(1);
  });

  it("resolves every role capability, risk, control and parsing reference", () => {
    const capabilityIds = new Set(capabilityCatalog.map((item) => item.id));
    const riskIds = new Set<string>(riskTaxonomy.map((item) => item.id));
    const controlIds = new Set<string>(controlCatalog.map((item) => item.id));
    const statementIds = new Set(parsedStatements.map((item) => item.id));

    jobRoles.forEach((role) => {
      role.capabilityRequirements.forEach((requirement) =>
        expect(capabilityIds.has(requirement.capabilityId)).toBe(true),
      );
      role.riskDomainIds.forEach((riskId) =>
        expect(riskIds.has(riskId)).toBe(true),
      );
      role.controlIds.forEach((controlId) =>
        expect(controlIds.has(controlId)).toBe(true),
      );
      role.responsibilities.forEach((responsibility) =>
        expect(statementIds.has(responsibility.sourceStatementId)).toBe(true),
      );
    });
  });

  it("keeps learning and traceability graph references complete", () => {
    const capabilityIds = new Set(capabilityCatalog.map((item) => item.id));
    const riskIds = new Set<string>(riskTaxonomy.map((item) => item.id));
    const sourceIds = new Set<string>(roleSourceCatalog.map((item) => item.id));
    const nodeIds = new Set(traceabilityNodes.map((item) => item.id));

    learningCatalog.forEach((item) => {
      item.capabilityOutcomes.forEach((outcome) =>
        expect(capabilityIds.has(outcome.capabilityId)).toBe(true),
      );
      item.riskDomainIds.forEach((riskId) =>
        expect(riskIds.has(riskId)).toBe(true),
      );
      item.sourceIds.forEach((sourceId) =>
        expect(sourceIds.has(sourceId)).toBe(true),
      );
    });
    traceabilityEdges.forEach((edge) => {
      expect(nodeIds.has(edge.from)).toBe(true);
      expect(nodeIds.has(edge.to)).toBe(true);
    });
  });
});
