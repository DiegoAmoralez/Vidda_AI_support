export type RecommendationReview = {
  analysis: string;
  learningObjective: string;
  caseIdea: string;
  keyTeachingPoints: string[];
  recommendedActions: string[];
  expertChecklist: string[];
  mode: "neural" | "demo";
  warning?: string;
};
