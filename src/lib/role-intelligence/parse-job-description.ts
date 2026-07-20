import { parsedStatements } from "@/data/role-intelligence";
import type { ParsedStatement } from "@/domain/types";

export type ParseResult = {
  documentTitle: string;
  documentVersion: string;
  extractedAt: string;
  modelVersion: string;
  promptVersion: string;
  statements: ParsedStatement[];
  completeness: number;
  mandatoryGenerationBlocked: boolean;
  blockingReasons: string[];
};

const relevantStatement = (statement: ParsedStatement, normalizedText: string) => {
  const words = statement.extractedStatement
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 5);
  return words.some((word) => normalizedText.includes(word));
};

export const canCreateMandatoryRequirement = (statement: ParsedStatement) =>
  statement.classification === "explicit"
    ? statement.reviewStatus !== "rejected"
    : statement.reviewStatus === "approved";

export const parseJobDescription = (
  sourceText: string,
  documentTitle = "Retail RM — Warsaw Branch Job Description",
): ParseResult => {
  const normalizedText = sourceText.toLowerCase();
  const matched = parsedStatements.map((statement) => ({
    ...statement,
    confidence: relevantStatement(statement, normalizedText)
      ? statement.confidence
      : Math.max(45, statement.confidence - 18),
  }));
  const unresolved = matched.filter(
    (statement) =>
      statement.reviewStatus === "pending" ||
      statement.confidence < 65 ||
      statement.classification === "contradictory",
  );

  return {
    documentTitle,
    documentVersion: "3.0",
    extractedAt: "2026-07-20T08:30:00Z",
    modelVersion: "Vidda Role Reasoning 0.9 Demo",
    promptVersion: "role-parser-v12",
    statements: matched,
    completeness: Math.round(
      (matched.filter((statement) => statement.confidence >= 65).length /
        matched.length) *
        100,
    ),
    mandatoryGenerationBlocked: unresolved.some(
      (statement) => !canCreateMandatoryRequirement(statement),
    ),
    blockingReasons: unresolved.map(
      (statement) =>
        `${statement.normalizedValue}: ${statement.classification} requires ${statement.requiredReviewer}`,
    ),
  };
};
