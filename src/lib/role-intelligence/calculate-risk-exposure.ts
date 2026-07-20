import type { RiskExposureAssessment, RiskFactor, RiskLevel } from "@/domain/types";

export type RiskThresholds = {
  lowMax: number;
  moderateMax: number;
  highMax: number;
};

const defaultThresholds: RiskThresholds = {
  lowMax: 24.99,
  moderateMax: 49.99,
  highMax: 74.99,
};

const classify = (
  score: number,
  thresholds: RiskThresholds,
): RiskLevel => {
  if (score <= thresholds.lowMax) return "low";
  if (score <= thresholds.moderateMax) return "moderate";
  if (score <= thresholds.highMax) return "high";
  return "critical";
};

export const calculateRiskExposure = ({
  employeeId,
  roleIds,
  factors,
  thresholds = defaultThresholds,
}: {
  employeeId: string;
  roleIds: string[];
  factors: RiskFactor[];
  thresholds?: RiskThresholds;
}): RiskExposureAssessment => {
  if (!factors.length || factors.some((factor) => factor.value <= 0)) {
    throw new Error("Every risk factor requires a positive configured value.");
  }
  const rawScore = factors.reduce(
    (product, factor) => product * factor.value * factor.weight,
    1,
  );
  const normalizedScore = Math.min(100, Math.round((rawScore / 12.67) * 100));
  const level = classify(normalizedScore, thresholds);
  const confidence = Math.round(
    factors.reduce((sum, factor) => sum + factor.confidence, 0) /
      factors.length,
  );

  return {
    id: `risk-${employeeId}-retail-rm`,
    employeeId,
    roleIds,
    formulaVersion: "risk-multiplicative-v2",
    factors: factors.map((factor) => ({
      ...factor,
      weightedValue: Number((factor.value * factor.weight).toFixed(2)),
    })),
    rawScore: Number(rawScore.toFixed(2)),
    normalizedScore,
    level,
    confidence,
    approvalRequired: level === "high" || level === "critical",
    approvalStatus:
      level === "high" || level === "critical" ? "pending" : "not-required",
    calculatedAt: "2026-07-20T08:45:00Z",
  };
};
