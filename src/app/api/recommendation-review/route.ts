import { NextResponse } from "next/server";
import type { RecommendationReview } from "@/lib/knowledge/recommendation-review";
import { callMistralJson } from "@/lib/mistral/client";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a banking compliance learning designer for NordBank International.
Review an AI improvement recommendation and propose concrete microlearning content.
Stay practical, policy-safe, and specific to AML / tipping-off / escalation topics when relevant.
Do not invent regulation numbers that are not implied by the input.
Respond in JSON only with keys:
analysis (string),
learningObjective (string),
caseIdea (string),
keyTeachingPoints (string[]),
recommendedActions (string[]),
expertChecklist (string[]).`;

const getDemoReview = (title: string, summary: string): RecommendationReview => ({
  analysis:
    `The signal “${title}” is supported by assessment behavior described in the brief: ${summary} This points to a practical misunderstanding of tipping-off restrictions rather than a knowledge-base gap alone.`,
  learningObjective:
    "Employees can recognize tipping-off risk and choose a customer-safe response that protects the investigation while following approved escalation channels.",
  caseIdea:
    "A corporate customer asks why a cash transaction is delayed and whether the bank will file a suspicious transaction report. The employee must respond without tipping off, keep the case pending where required, and escalate correctly.",
  keyTeachingPoints: [
    "Never confirm, deny, or hint that a suspicious transaction report may be filed.",
    "Keep the transaction pending when activity is inconsistent with the customer profile.",
    "Use approved customer wording that explains process delay without revealing investigation details.",
    "Escalate through the Compliance channel instead of improvising local exceptions.",
  ],
  recommendedActions: [
    "Draft a 6–8 minute branching microlearning case for Relationship Managers.",
    "Add one distractor option that mirrors the common “notify the customer” mistake.",
    "Require expert approval of scoring logic before publication.",
    "Target Corporate Banking cohorts with the highest error rate first.",
  ],
  expertChecklist: [
    "Confirm wording does not create tipping-off exposure.",
    "Validate escalation path against AML Policy v4.7.",
    "Check that the correct answer is unambiguous for frontline staff.",
  ],
  mode: "demo",
});

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    summary?: string;
    neuralEnabled?: boolean;
  } | null;

  const title = body?.title?.trim() ?? "";
  const summary = body?.summary?.trim() ?? "";
  if (!title || !summary) {
    return NextResponse.json(
      { error: "title and summary are required." },
      { status: 400 },
    );
  }

  if (body?.neuralEnabled === false) {
    return NextResponse.json(getDemoReview(title, summary));
  }

  const result = await callMistralJson({
    system: SYSTEM_PROMPT,
    user: `Recommendation title: ${title}\n\nRecommendation brief:\n${summary}\n\nPropose a review package for a compliance expert.`,
  });

  if (!result.ok) {
    return NextResponse.json({
      ...getDemoReview(title, summary),
      warning:
        result.reason === "missing_key"
          ? "MISTRAL_API_KEY is not configured. Showing a demo review package."
          : result.reason === "request_failed"
            ? `${result.message}. Showing a demo review package.`
            : "Model returned an unreadable payload. Showing a demo review package.",
    });
  }

  const data = result.data;
  const asString = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim() ? value.trim() : fallback;
  const asStringArray = (value: unknown, fallback: string[]) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : fallback;

  const demo = getDemoReview(title, summary);

  return NextResponse.json({
    analysis: asString(data.analysis, demo.analysis),
    learningObjective: asString(data.learningObjective, demo.learningObjective),
    caseIdea: asString(data.caseIdea, demo.caseIdea),
    keyTeachingPoints: asStringArray(data.keyTeachingPoints, demo.keyTeachingPoints),
    recommendedActions: asStringArray(data.recommendedActions, demo.recommendedActions),
    expertChecklist: asStringArray(data.expertChecklist, demo.expertChecklist),
    mode: "neural" as const,
  } satisfies RecommendationReview);
}
