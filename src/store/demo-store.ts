"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultCampaign } from "@/data/seed";
import {
  capabilityCatalog,
  employeeRoleAssignments as seededEmployeeRoleAssignments,
  jobRoles as seededJobRoles,
  learningCatalog,
  parsedStatements as seededParsedStatements,
} from "@/data/role-intelligence";
import type {
  AssessmentResult,
  AuditEvent,
  Campaign,
  CaseSessionStage,
  DemoRole,
  EmployeeRoleAssignment,
  JobRole,
  LearningRecommendation,
  ParsedStatement,
  RiskExposureAssessment,
} from "@/domain/types";
import { dailyCashCase } from "@/data/cases";
import { evaluateCase } from "@/lib/scoring/evaluate-case";
import { calculateRiskExposure } from "@/lib/role-intelligence/calculate-risk-exposure";
import { deriveCapabilityProfile } from "@/lib/role-intelligence/derive-capability-profile";
import {
  getEmployeeById,
  getEmployeeCapabilityLevels,
  getEmployeeRiskFactors,
  getEmployeeRoleAssignments,
} from "@/lib/role-intelligence/employee-scope";
import { recommendLearning } from "@/lib/role-intelligence/recommend-learning";

type SimulationPreset = "correct" | "partial" | "critical";

export type GeneratedDraftCase = {
  id: string;
  code: string;
  title: string;
  scenario: string;
  status: "expert-review" | "approved" | "rejected";
  source: string;
  createdAt: string;
};

type DemoState = {
  role: DemoRole;
  stage: CaseSessionStage;
  answerText: string;
  selectedActions: string[];
  contextQuestionCount: number;
  result: AssessmentResult | null;
  completedCases: number;
  capabilityScore: number;
  streak: number;
  regulatoryUpdateTriggered: boolean;
  riskAlertVisible: boolean;
  generatedDraftCases: GeneratedDraftCase[];
  campaign: Campaign;
  auditOverlay: AuditEvent[];
  jobRoles: JobRole[];
  parsedStatements: ParsedStatement[];
  employeeRoleAssignments: EmployeeRoleAssignment[];
  selectedEmployeeId: string;
  selectedJobRoleId: string;
  riskExposure: RiskExposureAssessment;
  learningRecommendations: LearningRecommendation[];
  setRole: (role: DemoRole) => void;
  setStage: (stage: CaseSessionStage) => void;
  setAnswerText: (value: string) => void;
  toggleAction: (actionId: string) => void;
  moveAction: (actionId: string, direction: -1 | 1) => void;
  askContextQuestion: () => void;
  simulateAnswer: (preset: SimulationPreset) => void;
  submitAnswer: () => AssessmentResult;
  finishSession: () => void;
  triggerRegulatoryUpdate: () => void;
  showRiskAlert: () => void;
  generateCase: () => GeneratedDraftCase;
  approveGeneratedCase: (caseId: string) => void;
  rejectGeneratedCase: (caseId: string) => void;
  launchCampaign: () => void;
  completeCampaign: () => void;
  setSelectedEmployeeId: (employeeId: string) => void;
  selectJobRole: (roleId: string) => void;
  createJobRoleDraft: (
    title: string,
    method: "manual" | "template" | "ai-assisted",
  ) => string;
  submitJobRoleForReview: (roleId: string) => void;
  approveJobRole: (roleId: string) => void;
  publishJobRole: (roleId: string) => void;
  reviewParsedStatement: (
    statementId: string,
    decision: "approved" | "edited" | "rejected",
  ) => void;
  approveRoleAssignment: (assignmentId: string) => void;
  approveRiskExposure: () => void;
  approveLearningRecommendation: (recommendationId: string) => void;
  reassessRoleIntelligence: () => void;
  resetDemo: () => void;
};

const buildRoleIntelligenceSnapshot = (
  employeeId: string,
  assignments: EmployeeRoleAssignment[],
  roles: JobRole[],
  statements: ParsedStatement[],
) => {
  const scopedAssignments = getEmployeeRoleAssignments({
    employeeId,
    persistedAssignments: assignments,
    roles,
  });
  const profile = deriveCapabilityProfile({
    employeeId,
    assignments: scopedAssignments,
    roles,
    capabilities: capabilityCatalog,
    demonstratedLevels: getEmployeeCapabilityLevels(employeeId),
    asOf: "2026-08-10",
  });
  const primaryRole = roles.find(
    (role) => role.id === profile.activeAssignments[0]?.roleId,
  );
  const riskExposure = calculateRiskExposure({
    employeeId,
    roleIds: profile.activeAssignments.map((assignment) => assignment.roleId),
    factors: getEmployeeRiskFactors(employeeId, primaryRole),
  });
  const learningRecommendations = recommendLearning({
    profile,
    catalog: learningCatalog,
    jurisdiction: "European Union",
    legalEntity: "NordBank Polska S.A.",
    roleFamilies: profile.activeAssignments
      .map(
        (assignment) =>
          roles.find((role) => role.id === assignment.roleId)?.family,
      )
      .filter((family): family is string => Boolean(family)),
    blockedCapabilityIds: statements
      .filter(
        (statement) =>
          statement.reviewStatus !== "approved" &&
          statement.classification !== "explicit",
      )
      .flatMap((statement) => statement.capabilityIds),
  });
  return { riskExposure, learningRecommendations };
};

const initialRoleSnapshot = buildRoleIntelligenceSnapshot(
  "emp-0003",
  seededEmployeeRoleAssignments,
  seededJobRoles,
  seededParsedStatements,
);

const mergePersistedJobRoles = (persistedRoles?: JobRole[]) => {
  if (!persistedRoles?.length) return seededJobRoles;
  const persistedById = new Map(
    persistedRoles.map((role) => [role.id, role]),
  );
  const seedIds = new Set(seededJobRoles.map((role) => role.id));
  return [
    ...seededJobRoles.map((seedRole) => ({
      ...seedRole,
      ...persistedById.get(seedRole.id),
    })),
    ...persistedRoles.filter((role) => !seedIds.has(role.id)),
  ];
};

const initialState = {
  role: "employee" as DemoRole,
  stage: "intro" as CaseSessionStage,
  answerText: "",
  selectedActions: [] as string[],
  contextQuestionCount: 0,
  result: null as AssessmentResult | null,
  completedCases: 34,
  capabilityScore: 78,
  streak: 12,
  regulatoryUpdateTriggered: false,
  riskAlertVisible: true,
  generatedDraftCases: [] as GeneratedDraftCase[],
  campaign: defaultCampaign,
  auditOverlay: [] as AuditEvent[],
  jobRoles: seededJobRoles,
  parsedStatements: seededParsedStatements,
  employeeRoleAssignments: seededEmployeeRoleAssignments,
  selectedEmployeeId: "emp-0003",
  selectedJobRoleId: "role-retail-rm-pl",
  riskExposure: initialRoleSnapshot.riskExposure,
  learningRecommendations: initialRoleSnapshot.learningRecommendations,
};

const createAuditEvent = (
  action: string,
  entity: string,
  previousValue: string,
  newValue: string,
): AuditEvent => ({
  id: `local-${Date.now()}`,
  timestamp: new Date().toLocaleString("en-GB"),
  actor: "Demo operator",
  actorType: "Human",
  action,
  entity,
  previousValue,
  newValue,
  reason: "Interactive demo action",
  source: "Demo Controls",
  status: "Complete",
});

const DRAFT_CASE_TEMPLATES = [
  {
    codePrefix: "TIP-OFF",
    title: "Tipping-off under customer pressure",
    scenario:
      "A corporate customer asks why a high-value transaction is pending and whether the bank intends to file a suspicious transaction report. Choose a response that protects the investigation while maintaining appropriate customer communication.",
    source: "AI Improvement · tipping-off signal",
  },
  {
    codePrefix: "EDD-CASH",
    title: "Cash delay without tipping-off",
    scenario:
      "During a branch conversation, a relationship manager is pressed for “what Compliance is checking.” The employee must explain the delay without revealing investigation activity and escalate through the approved channel.",
    source: "AI Improvement · escalation wording gap",
  },
  {
    codePrefix: "AML-COMMS",
    title: "Approved wording for pending review",
    scenario:
      "A client demands confirmation that “nothing suspicious was found.” Select the approved communication path that avoids tipping-off, keeps the case pending where required, and records the interaction for audit.",
    source: "AI Improvement · communication control",
  },
] as const;

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setRole: (role) => set({ role }),
      setSelectedEmployeeId: (selectedEmployeeId) =>
        set((state) => {
          const snapshot = buildRoleIntelligenceSnapshot(
            selectedEmployeeId,
            state.employeeRoleAssignments,
            state.jobRoles,
            state.parsedStatements,
          );
          return {
            selectedEmployeeId,
            riskExposure: snapshot.riskExposure,
            learningRecommendations: snapshot.learningRecommendations,
          };
        }),
      setStage: (stage) => set({ stage }),
      setAnswerText: (answerText) => set({ answerText }),
      toggleAction: (actionId) =>
        set((state) => ({
          selectedActions: state.selectedActions.includes(actionId)
            ? state.selectedActions.filter((id) => id !== actionId)
            : [...state.selectedActions, actionId],
        })),
      moveAction: (actionId, direction) =>
        set((state) => {
          const currentIndex = state.selectedActions.indexOf(actionId);
          const nextIndex = currentIndex + direction;
          if (
            currentIndex < 0 ||
            nextIndex < 0 ||
            nextIndex >= state.selectedActions.length
          ) {
            return state;
          }
          const selectedActions = [...state.selectedActions];
          [selectedActions[currentIndex], selectedActions[nextIndex]] = [
            selectedActions[nextIndex],
            selectedActions[currentIndex],
          ];
          return { selectedActions };
        }),
      askContextQuestion: () =>
        set((state) => ({
          contextQuestionCount: state.contextQuestionCount + 1,
        })),
      simulateAnswer: (preset) => {
        if (preset === "correct") {
          set({
            answerText:
              "I would pause processing, review the customer profile and history, request the sale agreement, verify the source of funds, apply enhanced due diligence and escalate to Compliance before execution. I would avoid tipping-off.",
            selectedActions: ["history", "documents", "source", "screening", "edd", "escalate"],
            stage: "answer",
          });
          return;
        }
        if (preset === "critical") {
          set({
            answerText:
              "The customer is known, so I would accept the cash and inform them if a suspicious report is needed.",
            selectedActions: ["accept", "notify"],
            stage: "answer",
          });
          return;
        }
        set({
          answerText:
            "I would review transaction history, request the sale agreement, verify the source of funds and apply enhanced due diligence before deciding.",
          selectedActions: ["history", "documents", "source", "edd"],
          stage: "answer",
        });
      },
      submitAnswer: () => {
        const state = get();
        const result = evaluateCase({
          learningCase: dailyCashCase,
          answerText: state.answerText,
          selectedActions: state.selectedActions,
        });
        set({ result, stage: "result" });
        return result;
      },
      finishSession: () =>
        set((state) => ({
          stage: "complete",
          completedCases: state.result ? state.completedCases + 1 : state.completedCases,
          capabilityScore: state.result
            ? Math.round((state.capabilityScore * 4 + state.result.overallScore) / 5)
            : state.capabilityScore,
          auditOverlay: state.result
            ? [
                createAuditEvent(
                  "Assessment completed",
                  dailyCashCase.title,
                  "Assigned",
                  `Score ${state.result.overallScore}`,
                ),
                ...state.auditOverlay,
              ]
            : state.auditOverlay,
        })),
      triggerRegulatoryUpdate: () =>
        set((state) => ({
          regulatoryUpdateTriggered: true,
          auditOverlay: [
            createAuditEvent("Policy update triggered", "AML Policy", "v4.6", "v4.7"),
            ...state.auditOverlay,
          ],
        })),
      showRiskAlert: () => set({ riskAlertVisible: true }),
      generateCase: () => {
        const state = get();
        const nextIndex = state.generatedDraftCases.length + 1;
        const template =
          DRAFT_CASE_TEMPLATES[(nextIndex - 1) % DRAFT_CASE_TEMPLATES.length];
        const draft: GeneratedDraftCase = {
          id: `draft-${Date.now()}-${nextIndex}`,
          code: `${template.codePrefix}-${String(nextIndex).padStart(2, "0")}`,
          title: template.title,
          scenario: template.scenario,
          status: "expert-review",
          source: template.source,
          createdAt: new Date().toLocaleString("en-GB"),
        };
        set({
          generatedDraftCases: [draft, ...state.generatedDraftCases],
          auditOverlay: [
            createAuditEvent(
              "Case generated",
              draft.code,
              "None",
              "Expert review",
            ),
            ...state.auditOverlay,
          ],
        });
        return draft;
      },
      approveGeneratedCase: (caseId) =>
        set((state) => {
          const target = state.generatedDraftCases.find((item) => item.id === caseId);
          if (!target) return state;
          return {
            generatedDraftCases: state.generatedDraftCases.map((item) =>
              item.id === caseId ? { ...item, status: "approved" as const } : item,
            ),
            auditOverlay: [
              createAuditEvent(
                "Case approved",
                target.code,
                "Expert review",
                "Approved",
              ),
              ...state.auditOverlay,
            ],
          };
        }),
      rejectGeneratedCase: (caseId) =>
        set((state) => {
          const target = state.generatedDraftCases.find((item) => item.id === caseId);
          if (!target) return state;
          return {
            generatedDraftCases: state.generatedDraftCases.map((item) =>
              item.id === caseId ? { ...item, status: "rejected" as const } : item,
            ),
            auditOverlay: [
              createAuditEvent(
                "Case rejected",
                target.code,
                "Expert review",
                "Rejected",
              ),
              ...state.auditOverlay,
            ],
          };
        }),
      launchCampaign: () =>
        set((state) => ({
          campaign: { ...state.campaign, status: "Active" },
          auditOverlay: [
            createAuditEvent(
              "Campaign launched",
              state.campaign.title,
              "Draft",
              "Active",
            ),
            ...state.auditOverlay,
          ],
        })),
      completeCampaign: () =>
        set((state) => ({
          campaign: {
            ...state.campaign,
            status: "Completed",
            started: 146,
            completed: 139,
            passed: 126,
            scoreImprovement: 14,
          },
          auditOverlay: [
            createAuditEvent(
              "Campaign completed",
              state.campaign.title,
              "Active",
              "Readiness +14%",
            ),
            ...state.auditOverlay,
          ],
        })),
      selectJobRole: (selectedJobRoleId) => set({ selectedJobRoleId }),
      createJobRoleDraft: (title, method) => {
        const id = `role-draft-${Date.now()}`;
        set((state) => {
          const template = state.jobRoles[0];
          return {
            selectedJobRoleId: id,
            jobRoles: [
              ...state.jobRoles,
              {
                ...template,
                id,
                code: `NB-DRAFT-${state.jobRoles.length + 1}`,
                title,
                standardizedTitle: title,
                status: "draft",
                version: "0.1",
                effectiveFrom: "2026-09-01",
                approvalHistory: [],
              },
            ],
            auditOverlay: [
              createAuditEvent(
                "Job role draft created",
                title,
                "None",
                `Draft via ${method}`,
              ),
              ...state.auditOverlay,
            ],
          };
        });
        return id;
      },
      submitJobRoleForReview: (roleId) =>
        set((state) => {
          const jobRoles = state.jobRoles.map((jobRole) =>
            jobRole.id === roleId
              ? { ...jobRole, status: "review" as const }
              : jobRole,
          );
          return {
            jobRoles,
            auditOverlay: [
              createAuditEvent(
                "Role submitted for review",
                roleId,
                "Draft",
                "Review",
              ),
              ...state.auditOverlay,
            ],
          };
        }),
      approveJobRole: (roleId) =>
        set((state) => ({
          jobRoles: state.jobRoles.map((jobRole) =>
            jobRole.id === roleId
              ? { ...jobRole, status: "approved" as const }
              : jobRole,
          ),
          auditOverlay: [
            createAuditEvent(
              "Job role approved",
              roleId,
              "Review",
              "Approved",
            ),
            ...state.auditOverlay,
          ],
        })),
      publishJobRole: (roleId) =>
        set((state) => ({
          jobRoles: state.jobRoles.map((jobRole) =>
            jobRole.id === roleId
              ? { ...jobRole, status: "published" as const }
              : jobRole,
          ),
          auditOverlay: [
            createAuditEvent(
              "Job role published",
              roleId,
              "Approved",
              "Published",
            ),
            ...state.auditOverlay,
          ],
        })),
      reviewParsedStatement: (statementId, decision) =>
        set((state) => {
          const parsedStatements = state.parsedStatements.map((statement) =>
            statement.id === statementId
              ? { ...statement, reviewStatus: decision }
              : statement,
          );
          const snapshot = buildRoleIntelligenceSnapshot(
            state.selectedEmployeeId,
            state.employeeRoleAssignments,
            state.jobRoles,
            parsedStatements,
          );
          return {
            parsedStatements,
            learningRecommendations: snapshot.learningRecommendations,
            auditOverlay: [
              createAuditEvent(
                "Parsed statement reviewed",
                statementId,
                "Pending",
                decision,
              ),
              ...state.auditOverlay,
            ],
          };
        }),
      approveRoleAssignment: (assignmentId) =>
        set((state) => {
          const employeeRoleAssignments = state.employeeRoleAssignments.map(
            (assignment) =>
              assignment.id === assignmentId
                ? {
                    ...assignment,
                    status: "active" as const,
                    complianceValidated: true,
                  }
                : assignment,
          );
          const snapshot = buildRoleIntelligenceSnapshot(
            state.selectedEmployeeId,
            employeeRoleAssignments,
            state.jobRoles,
            state.parsedStatements,
          );
          return {
            employeeRoleAssignments,
            riskExposure: snapshot.riskExposure,
            learningRecommendations: snapshot.learningRecommendations,
            auditOverlay: [
              createAuditEvent(
                "Temporary role assignment approved",
                assignmentId,
                "Pending Compliance",
                "Active",
              ),
              ...state.auditOverlay,
            ],
          };
        }),
      approveRiskExposure: () =>
        set((state) => ({
          riskExposure: {
            ...state.riskExposure,
            approvalStatus: "approved",
          },
          auditOverlay: [
            createAuditEvent(
              "Risk exposure approved",
              state.riskExposure.id,
              `${state.riskExposure.level} provisional`,
              `${state.riskExposure.level} approved`,
            ),
            ...state.auditOverlay,
          ],
        })),
      approveLearningRecommendation: (recommendationId) =>
        set((state) => ({
          learningRecommendations: state.learningRecommendations.map(
            (recommendation) =>
              recommendation.id === recommendationId
                ? { ...recommendation, approvalStatus: "approved" as const }
                : recommendation,
          ),
          auditOverlay: [
            createAuditEvent(
              "Learning recommendation approved",
              recommendationId,
              "Pending",
              "Approved",
            ),
            ...state.auditOverlay,
          ],
        })),
      reassessRoleIntelligence: () =>
        set((state) => {
          const snapshot = buildRoleIntelligenceSnapshot(
            state.selectedEmployeeId,
            state.employeeRoleAssignments,
            state.jobRoles,
            state.parsedStatements,
          );
          return {
            riskExposure: snapshot.riskExposure,
            learningRecommendations: snapshot.learningRecommendations,
            auditOverlay: [
              createAuditEvent(
                "Role intelligence reassessed",
                getEmployeeById(state.selectedEmployeeId).name,
                "Previous snapshot",
                "Current role and policy snapshot",
              ),
              ...state.auditOverlay,
            ],
          };
        }),
      resetDemo: () => set(initialState),
    }),
    {
      name: "vidda-compliance-demo-v1",
      version: 4,
      migrate: (persistedState) => {
        const previous = persistedState as Partial<DemoState> & {
          generatedCaseStatus?: "idle" | "expert-review" | "approved";
        };
        const migratedCases =
          previous.generatedDraftCases ??
          (previous.generatedCaseStatus &&
          previous.generatedCaseStatus !== "idle"
            ? [
                {
                  id: "draft-migrated-edd-cash-02",
                  code: "EDD-CASH-02",
                  title: "Tipping-off under customer pressure",
                  scenario:
                    "A customer asks why a high-value transaction is pending and whether the bank intends to file a suspicious transaction report. Choose a response that protects the investigation while maintaining appropriate customer communication.",
                  status: previous.generatedCaseStatus,
                  source: "Migrated demo draft",
                  createdAt: "Migrated",
                } satisfies GeneratedDraftCase,
              ]
            : []);

        return {
          ...initialState,
          ...previous,
          jobRoles: mergePersistedJobRoles(previous?.jobRoles),
          selectedEmployeeId:
            previous?.selectedEmployeeId ?? initialState.selectedEmployeeId,
          parsedStatements:
            previous?.parsedStatements ?? initialState.parsedStatements,
          employeeRoleAssignments:
            previous?.employeeRoleAssignments ??
            initialState.employeeRoleAssignments,
          riskExposure: previous?.riskExposure ?? initialState.riskExposure,
          learningRecommendations:
            previous?.learningRecommendations ??
            initialState.learningRecommendations,
          generatedDraftCases: migratedCases,
        };
      },
      partialize: (state) => ({
        role: state.role,
        stage: state.stage,
        answerText: state.answerText,
        selectedActions: state.selectedActions,
        result: state.result,
        completedCases: state.completedCases,
        capabilityScore: state.capabilityScore,
        streak: state.streak,
        regulatoryUpdateTriggered: state.regulatoryUpdateTriggered,
        generatedDraftCases: state.generatedDraftCases,
        campaign: state.campaign,
        auditOverlay: state.auditOverlay,
        jobRoles: state.jobRoles,
        parsedStatements: state.parsedStatements,
        employeeRoleAssignments: state.employeeRoleAssignments,
        selectedEmployeeId: state.selectedEmployeeId,
        selectedJobRoleId: state.selectedJobRoleId,
        riskExposure: state.riskExposure,
        learningRecommendations: state.learningRecommendations,
      }),
    },
  ),
);
