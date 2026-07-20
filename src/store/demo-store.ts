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
  generatedCaseStatus: "idle" | "expert-review" | "approved";
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
  generateCase: () => void;
  approveGeneratedCase: () => void;
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
  generatedCaseStatus: "idle" as const,
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
      generateCase: () =>
        set((state) => ({
          generatedCaseStatus: "expert-review",
          auditOverlay: [
            createAuditEvent("Case generated", "EDD-CASH-02", "None", "Expert review"),
            ...state.auditOverlay,
          ],
        })),
      approveGeneratedCase: () =>
        set((state) => ({
          generatedCaseStatus: "approved",
          auditOverlay: [
            createAuditEvent("Case approved", "EDD-CASH-02", "Expert review", "Approved"),
            ...state.auditOverlay,
          ],
        })),
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
      version: 3,
      migrate: (persistedState) => ({
        ...initialState,
        ...(persistedState as Partial<DemoState>),
        jobRoles: mergePersistedJobRoles(
          (persistedState as Partial<DemoState>)?.jobRoles,
        ),
        selectedEmployeeId:
          (persistedState as Partial<DemoState>)?.selectedEmployeeId ??
          initialState.selectedEmployeeId,
        parsedStatements:
          (persistedState as Partial<DemoState>)?.parsedStatements ??
          initialState.parsedStatements,
        employeeRoleAssignments:
          (persistedState as Partial<DemoState>)?.employeeRoleAssignments ??
          initialState.employeeRoleAssignments,
        riskExposure:
          (persistedState as Partial<DemoState>)?.riskExposure ??
          initialState.riskExposure,
        learningRecommendations:
          (persistedState as Partial<DemoState>)?.learningRecommendations ??
          initialState.learningRecommendations,
      }),
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
        generatedCaseStatus: state.generatedCaseStatus,
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
