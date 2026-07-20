import type {
  LearningCatalogItem,
  LearningRecommendation,
} from "@/domain/types";
import type { CombinedCapabilityProfile } from "@/lib/role-intelligence/derive-capability-profile";

export const recommendLearning = ({
  profile,
  catalog,
  jurisdiction,
  legalEntity,
  roleFamilies,
  blockedCapabilityIds = [],
}: {
  profile: CombinedCapabilityProfile;
  catalog: LearningCatalogItem[];
  jurisdiction: string;
  legalEntity: string;
  roleFamilies: string[];
  blockedCapabilityIds?: string[];
}): LearningRecommendation[] => {
  const gaps = profile.capabilities.filter((capability) => capability.gap > 0);
  const eligible = catalog.filter(
    (item) =>
      item.status === "published" &&
      item.jurisdictions.includes(jurisdiction) &&
      item.legalEntities.includes(legalEntity) &&
      item.roleFamilies.some((family) => roleFamilies.includes(family)),
  );
  const selected = new Map<string, LearningRecommendation>();

  gaps.forEach((gap) => {
    const candidates = eligible
      .filter((item) =>
        item.capabilityOutcomes.some(
          (outcome) =>
            outcome.capabilityId === gap.capabilityId &&
            outcome.targetLevel >= gap.requiredLevel,
        ),
      )
      .sort((left, right) => {
        const leftCoverage = left.capabilityOutcomes.filter((outcome) =>
          gaps.some((item) => item.capabilityId === outcome.capabilityId),
        ).length;
        const rightCoverage = right.capabilityOutcomes.filter((outcome) =>
          gaps.some((item) => item.capabilityId === outcome.capabilityId),
        ).length;
        return rightCoverage - leftCoverage || left.durationMinutes - right.durationMinutes;
      });
    const chosen = candidates[0];
    if (!chosen) return;
    const requirementIds = gap.sourceRoles.map((source) => source.requirementId);
    const existing = selected.get(chosen.id);
    const isBlocked = blockedCapabilityIds.includes(gap.capabilityId);
    const mandatory =
      gap.criticality === "critical" || gap.criticality === "high";
    selected.set(chosen.id, {
      id: existing?.id ?? `recommend-${chosen.id}`,
      employeeId: profile.employeeId,
      learningItemId: chosen.id,
      classification: isBlocked
        ? "conditionally-mandatory"
        : mandatory
          ? "mandatory"
          : "recommended",
      capabilityIds: [
        ...new Set([...(existing?.capabilityIds ?? []), gap.capabilityId]),
      ],
      coveredRequirementIds: [
        ...new Set([
          ...(existing?.coveredRequirementIds ?? []),
          ...requirementIds,
        ]),
      ],
      riskDomainIds: [
        ...new Set([
          ...(existing?.riskDomainIds ?? []),
          ...chosen.riskDomainIds,
        ]),
      ],
      whySelected: [
        ...(existing?.whySelected ?? []),
        `${gap.capabilityName} is required at L${gap.requiredLevel} and currently evidenced at L${gap.demonstratedLevel}.`,
        `${gap.criticality} criticality requires ${chosen.evidenceGenerated.join(" and ")}.`,
      ],
      alternativesRejected: candidates.slice(1).map((alternative) => ({
        learningItemId: alternative.id,
        reason:
          alternative.capabilityOutcomes.some(
            (outcome) => outcome.targetLevel < gap.requiredLevel,
          )
            ? "Approved outcome does not reach the required proficiency."
            : "Selected item covers the same approved outcome with less duplicate learning.",
      })),
      dueDate: mandatory ? "2026-08-08" : "2026-08-15",
      evidenceExpected: [
        ...new Set([
          ...(existing?.evidenceExpected ?? []),
          ...chosen.evidenceGenerated,
        ]),
      ],
      approvalStatus: isBlocked ? "preview" : "pending",
      traceId: `trace-${gap.capabilityId}`,
    });
  });

  return [...selected.values()];
};
