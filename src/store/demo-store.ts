"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultCampaign } from "@/data/seed";
import type {
  AssessmentResult,
  AuditEvent,
  Campaign,
  CaseSessionStage,
  DemoRole,
} from "@/domain/types";
import { dailyCashCase } from "@/data/cases";
import { evaluateCase } from "@/lib/scoring/evaluate-case";

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
  resetDemo: () => void;
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
      resetDemo: () => set(initialState),
    }),
    {
      name: "vidda-compliance-demo-v1",
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
      }),
    },
  ),
);
