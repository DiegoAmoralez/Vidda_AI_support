export type DemoRole =
  | "employee"
  | "compliance"
  | "capability"
  | "administrator";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type CaseDifficulty = "Foundation" | "Intermediate" | "Advanced";
export type CaseStatus =
  | "draft"
  | "expert-review"
  | "approved"
  | "published"
  | "archived";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  jobTitle: string;
  department: string;
  branch: string;
  country: string;
  initials: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  branch: string;
  country: string;
  capabilityScore: number;
  riskLevel: RiskLevel;
  casesCompleted: number;
  repeatedErrors: number;
  lastActivity: string;
  trend: number;
  recommendedAction: string;
};

export type PolicyReference = {
  id: string;
  title: string;
  section: string;
  version: string;
  status: "Current" | "Under review";
  effectiveDate: string;
  excerpt: string;
  confidence: number;
};

export type CaseAction = {
  id: string;
  label: string;
  capability: string;
  points: number;
  prohibited?: boolean;
  penalty?: number;
};

export type LearningCase = {
  id: string;
  title: string;
  category: string;
  roleRelevance: string[];
  difficulty: CaseDifficulty;
  estimatedTime: string;
  scenario: string;
  context: string[];
  actions: CaseAction[];
  expectedSequence: string[];
  keywords: Record<string, string[]>;
  policyReferences: PolicyReference[];
  capabilityTags: string[];
  followUpRecommendation: string;
  status: CaseStatus;
  aiGenerated: boolean;
  version: string;
};

export type CapabilityScore = {
  name: string;
  score: number;
};

export type AssessmentResult = {
  overallScore: number;
  title: string;
  capabilityScores: CapabilityScore[];
  correctActions: string[];
  missedActions: string[];
  incorrectActions: string[];
  feedback: string;
  riskLevel: RiskLevel;
  aiConfidence: number;
  completedAt: string;
};

export type PolicyDocument = {
  id: string;
  title: string;
  category: string;
  source: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  aiStatus: string;
  linkedCases: number;
  affectedRoles: number;
  owner: string;
  status: string;
  jurisdiction: string;
  requirements: number;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "Human" | "AI" | "System";
  action: string;
  entity: string;
  previousValue: string;
  newValue: string;
  reason: string;
  source: string;
  status: string;
};

export type Campaign = {
  id: string;
  title: string;
  audience: string;
  employees: number;
  duration: string;
  assigned: number;
  started: number;
  completed: number;
  passed: number;
  scoreImprovement: number;
  status: "Draft" | "Active" | "Completed";
};

export type CaseSessionStage =
  | "intro"
  | "answer"
  | "analyzing"
  | "result"
  | "recommendation"
  | "complete";
