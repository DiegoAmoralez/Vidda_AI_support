export type DemoRole =
  | "employee"
  | "compliance"
  | "capability"
  | "administrator";

export type PortalPersona = DemoRole;

export type RiskLevel = "low" | "moderate" | "medium" | "high" | "critical";
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

export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;
export type RoleStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "retired"
  | "archived";
export type RoleCriticality = "standard" | "material" | "critical";
export type DefenceLine = "first" | "second" | "third";
export type AssignmentType =
  | "primary"
  | "secondary"
  | "temporary"
  | "acting"
  | "delegated"
  | "committee"
  | "control-owner"
  | "privileged";
export type StatementClassification =
  | "explicit"
  | "inferred-high"
  | "inferred-medium"
  | "inferred-low"
  | "missing"
  | "ambiguous"
  | "contradictory";
export type ReviewStatus = "pending" | "approved" | "edited" | "rejected";

export type CapabilityDefinition = {
  id: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  evidenceExamples: string[];
};

export type RoleResponsibility = {
  id: string;
  statement: string;
  type: "operational" | "regulatory" | "management" | "control" | "conduct";
  sourceStatementId: string;
  processId: string;
  controlIds: string[];
  riskDomainIds: string[];
  decisionAuthority: string;
};

export type RoleCapabilityRequirement = {
  id: string;
  roleVersionId: string;
  capabilityId: string;
  requiredLevel: ProficiencyLevel;
  criticality: "low" | "moderate" | "high" | "critical";
  whyRequired: string;
  sourceResponsibilityIds: string[];
  evidenceRequired: string[];
  reassessmentMonths: number;
  approved: boolean;
};

export type JobRole = {
  id: string;
  code: string;
  title: string;
  standardizedTitle: string;
  family: string;
  level: string;
  seniority: string;
  businessUnit: string;
  department: string;
  legalEntity: string;
  branch: string;
  country: string;
  jurisdiction: string;
  reportingLine: string;
  functionalReportingLine: string;
  roleOwner: string;
  complianceOwner: string;
  riskOwner: string;
  hrOwner: string;
  managerRole: string;
  defenceLine: DefenceLine;
  engagementType: string;
  rolePurpose: string;
  responsibilities: RoleResponsibility[];
  decisionRights: string[];
  approvalAuthorities: string[];
  delegatedAuthorities: string[];
  systemsAccessed: string[];
  dataAccessed: string[];
  productsSupported: string[];
  customerSegments: string[];
  marketsCovered: string[];
  processesPerformed: string[];
  controlIds: string[];
  riskDomainIds: string[];
  capabilityRequirements: RoleCapabilityRequirement[];
  certifications: string[];
  recertificationMonths: number;
  criticality: RoleCriticality;
  defenceClassification: string[];
  status: RoleStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  version: string;
  parentRoleId?: string;
  approvalHistory: ApprovalRecord[];
};

export type ParsedStatement = {
  id: string;
  sourceDocument: string;
  sourceVersion: string;
  sourcePage: number;
  sourceParagraph: string;
  sourceSpan: string;
  extractedStatement: string;
  normalizedValue: string;
  normalizedTaxonomyId: string;
  classification: StatementClassification;
  confidence: number;
  reason: string;
  riskDomainIds: string[];
  capabilityIds: string[];
  potentialRegulatoryRelevance: string;
  requiredReviewer: string;
  reviewStatus: ReviewStatus;
};

export type EmployeeRoleAssignment = {
  id: string;
  employeeId: string;
  roleId: string;
  roleVersion: string;
  assignmentType: AssignmentType;
  allocationPercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: "pending" | "active" | "expired" | "rejected";
  managerValidated: boolean;
  hrValidated: boolean;
  complianceValidated: boolean;
  reason: string;
};

export type RiskFactor = {
  id: string;
  name: string;
  value: number;
  weight: number;
  weightedValue: number;
  source: string;
  confidence: number;
};

export type RiskExposureAssessment = {
  id: string;
  employeeId: string;
  roleIds: string[];
  formulaVersion: string;
  factors: RiskFactor[];
  rawScore: number;
  normalizedScore: number;
  level: RiskLevel;
  confidence: number;
  approvalRequired: boolean;
  approvalStatus: "not-required" | "pending" | "approved" | "overridden";
  overrideReason?: string;
  calculatedAt: string;
};

export type LearningCatalogItem = {
  id: string;
  title: string;
  type:
    | "course"
    | "microlearning"
    | "policy-attestation"
    | "case"
    | "simulation"
    | "assessment"
    | "manager-observation"
    | "certification";
  capabilityOutcomes: Array<{
    capabilityId: string;
    targetLevel: ProficiencyLevel;
  }>;
  riskDomainIds: string[];
  jurisdictions: string[];
  legalEntities: string[];
  roleFamilies: string[];
  difficulty: string;
  durationMinutes: number;
  language: string;
  evidenceGenerated: string[];
  passingThreshold?: number;
  validityMonths: number;
  status: "draft" | "approved" | "published" | "retired";
  version: string;
  effectiveFrom: string;
  sourceIds: string[];
};

export type LearningRecommendation = {
  id: string;
  employeeId: string;
  learningItemId: string;
  classification: "mandatory" | "conditionally-mandatory" | "recommended";
  capabilityIds: string[];
  coveredRequirementIds: string[];
  riskDomainIds: string[];
  whySelected: string[];
  alternativesRejected: Array<{ learningItemId: string; reason: string }>;
  dueDate: string;
  evidenceExpected: string[];
  approvalStatus: "preview" | "pending" | "approved" | "rejected";
  traceId: string;
};

export type TraceabilityNode = {
  id: string;
  type:
    | "obligation"
    | "policy"
    | "process"
    | "control"
    | "responsibility"
    | "risk"
    | "capability"
    | "learning"
    | "assignment"
    | "evidence";
  label: string;
  version: string;
  effectiveFrom: string;
  status: string;
  metadata: Record<string, string | number>;
};

export type TraceabilityEdge = {
  id: string;
  from: string;
  to: string;
  relationship: string;
  rationale: string;
};

export type ApprovalRecord = {
  id: string;
  stage: string;
  actor: string;
  actorRole: string;
  decision: "approved" | "rejected" | "changes-requested";
  rationale: string;
  timestamp: string;
};
