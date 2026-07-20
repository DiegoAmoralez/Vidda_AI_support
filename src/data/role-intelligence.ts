import type {
  CapabilityDefinition,
  EmployeeRoleAssignment,
  JobRole,
  LearningCatalogItem,
  ParsedStatement,
  RiskFactor,
  TraceabilityEdge,
  TraceabilityNode,
} from "@/domain/types";

export const proficiencyLevels = [
  { level: 1, name: "Awareness", description: "Recognizes the topic and knows when to seek help." },
  { level: 2, name: "Working knowledge", description: "Performs standard tasks under defined procedures." },
  { level: 3, name: "Practitioner", description: "Independently handles normal and moderately complex cases." },
  { level: 4, name: "Advanced", description: "Manages complex cases, advises others and improves controls." },
  { level: 5, name: "Expert / accountable owner", description: "Defines standards, exercises oversight and accepts accountability." },
] as const;

export const riskTaxonomy = [
  { id: "risk-aml", name: "Money laundering and terrorist financing" },
  { id: "risk-sanctions", name: "Sanctions and proliferation financing" },
  { id: "risk-fraud", name: "Fraud" },
  { id: "risk-conduct", name: "Conduct" },
  { id: "risk-consumer", name: "Consumer protection" },
  { id: "risk-data", name: "Data protection" },
  { id: "risk-cyber", name: "Cybersecurity" },
  { id: "risk-operational", name: "Operational risk" },
] as const;

export const controlCatalog = [
  { id: "ctrl-cdd-01", name: "CDD evidence review" },
  { id: "ctrl-id-02", name: "Identity verification" },
  { id: "ctrl-ubo-03", name: "Beneficial ownership verification" },
  { id: "ctrl-esc-04", name: "Financial-crime escalation" },
  { id: "ctrl-data-02", name: "Customer data access and handling" },
  { id: "ctrl-conduct-06", name: "Fair product communication" },
] as const;

export const roleSourceCatalog = [
  { id: "policy-aml-47", name: "NordBank AML & CTF Policy v4.7" },
  { id: "policy-delegation-22", name: "Branch Delegation Policy v2.2" },
  ...controlCatalog,
] as const;

export const capabilityCatalog: CapabilityDefinition[] = [
  { id: "cap-customer-id", name: "Customer Identification", category: "Customer due diligence", description: "Validates identity using approved evidence and resolves discrepancies.", owner: "KYC Governance", evidenceExamples: ["Observed onboarding", "Practical simulation"] },
  { id: "cap-beneficial-owner", name: "Beneficial Ownership", category: "Customer due diligence", description: "Identifies and verifies beneficial owners and ownership complexity.", owner: "KYC Governance", evidenceExamples: ["File review", "Scenario assessment"] },
  { id: "cap-edd", name: "Enhanced Due Diligence Triggers", category: "Risk assessment", description: "Recognizes heightened-risk triggers and initiates approved EDD steps.", owner: "Financial Crime Compliance", evidenceExamples: ["Branching case", "Control walkthrough"] },
  { id: "cap-escalation", name: "AML, Fraud and Sanctions Escalation", category: "Investigation and escalation", description: "Pauses activity and escalates through the authorized route without tipping-off.", owner: "MLRO Office", evidenceExamples: ["Complex simulation", "Manager observation"] },
  { id: "cap-data-handling", name: "Customer Data Handling", category: "Data protection and information handling", description: "Uses, shares and retains personal and financial data within approved controls.", owner: "Data Protection Office", evidenceExamples: ["Observed task", "Incident scenario"] },
  { id: "cap-product", name: "Product and Customer Communication", category: "Conduct and customer protection", description: "Explains products fairly, identifies customer needs and avoids misleading statements.", owner: "Conduct Risk", evidenceExamples: ["Role play", "Manager observation"] },
  { id: "cap-systems", name: "Onboarding and CRM Systems", category: "Technology and system proficiency", description: "Uses onboarding and CRM systems accurately, securely and with complete records.", owner: "Retail Operations", evidenceExamples: ["System task", "Quality sample"] },
  { id: "cap-risk-id", name: "Financial Crime Risk Identification", category: "Risk identification", description: "Recognizes customer, transaction and geographic risk signals.", owner: "Financial Crime Compliance", evidenceExamples: ["Scenario assessment", "Case review"] },
  { id: "cap-control", name: "Onboarding Control Execution", category: "Control execution", description: "Operates preventative onboarding controls and records the decision rationale.", owner: "Retail Controls", evidenceExamples: ["Control sample", "Walkthrough"] },
  { id: "cap-speak-up", name: "Ethical Behaviour and Speak-up", category: "Ethical behaviour and speak-up capability", description: "Challenges unsafe activity and reports concerns through protected channels.", owner: "Conduct Risk", evidenceExamples: ["Scenario", "Attestation"] },
  { id: "cap-leadership", name: "Branch Risk Leadership", category: "Leadership and governance", description: "Oversees branch decisions, coaching and escalation quality.", owner: "Retail Banking", evidenceExamples: ["Manager validation", "Governance review"] },
  { id: "cap-approval", name: "Customer Approval Authority", category: "Decision-making and judgement", description: "Exercises delegated customer approval within limits and records decisions.", owner: "Retail Risk", evidenceExamples: ["Approval sample", "Complex simulation"] },
];

const retailRmResponsibilities = [
  {
    id: "resp-onboarding",
    statement: "Onboard retail and small-business customers using approved customer identification controls.",
    type: "operational" as const,
    sourceStatementId: "stmt-01",
    processId: "proc-retail-onboarding",
    controlIds: ["ctrl-cdd-01", "ctrl-id-02"],
    riskDomainIds: ["risk-aml", "risk-conduct"],
    decisionAuthority: "May complete standard-risk onboarding; may not approve high-risk customers.",
  },
  {
    id: "resp-ubo",
    statement: "Collect and review ownership evidence and identify beneficial owners.",
    type: "regulatory" as const,
    sourceStatementId: "stmt-02",
    processId: "proc-retail-onboarding",
    controlIds: ["ctrl-ubo-03"],
    riskDomainIds: ["risk-aml"],
    decisionAuthority: "May resolve standard ownership structures and must escalate complex structures.",
  },
  {
    id: "resp-escalate",
    statement: "Identify and escalate potential AML, fraud or sanctions concerns before execution.",
    type: "control" as const,
    sourceStatementId: "stmt-05",
    processId: "proc-fincrime-escalation",
    controlIds: ["ctrl-esc-04"],
    riskDomainIds: ["risk-aml", "risk-sanctions", "risk-fraud"],
    decisionAuthority: "May pause activity; Compliance retains reporting and high-risk approval authority.",
  },
  {
    id: "resp-data",
    statement: "Handle personal and financial data in onboarding and CRM systems.",
    type: "operational" as const,
    sourceStatementId: "stmt-06",
    processId: "proc-customer-data",
    controlIds: ["ctrl-data-02"],
    riskDomainIds: ["risk-data", "risk-cyber"],
    decisionAuthority: "Access limited to assigned customers and approved business purpose.",
  },
  {
    id: "resp-products",
    statement: "Explain banking products fairly and identify when specialist advice is required.",
    type: "conduct" as const,
    sourceStatementId: "stmt-07",
    processId: "proc-product-advice",
    controlIds: ["ctrl-conduct-06"],
    riskDomainIds: ["risk-conduct", "risk-consumer"],
    decisionAuthority: "May explain approved products; regulated advice follows local authorization.",
  },
];

const retailRequirements = [
  ["req-customer-id", "cap-customer-id", 3, "critical", "Executes customer identification independently.", ["resp-onboarding"], ["Practical onboarding sample", "Knowledge assessment"], 12],
  ["req-ubo", "cap-beneficial-owner", 3, "high", "Identifies beneficial owners during onboarding.", ["resp-ubo"], ["Observed file review", "Scenario assessment"], 12],
  ["req-edd", "cap-edd", 2, "high", "Must recognize when standard CDD is insufficient.", ["resp-onboarding", "resp-ubo"], ["Targeted branching case"], 12],
  ["req-escalation", "cap-escalation", 3, "critical", "Must pause and escalate suspicious activity correctly.", ["resp-escalate"], ["Complex simulation", "Manager validation"], 6],
  ["req-data", "cap-data-handling", 3, "high", "Handles personal and financial data every day.", ["resp-data"], ["Observed task", "Privacy assessment"], 12],
  ["req-product", "cap-product", 3, "high", "Explains products directly to customers.", ["resp-products"], ["Observed conversation", "Conduct scenario"], 12],
  ["req-systems", "cap-systems", 3, "moderate", "Records complete onboarding decisions in core systems.", ["resp-onboarding", "resp-data"], ["System task", "Quality sample"], 12],
  ["req-risk-id", "cap-risk-id", 3, "critical", "Identifies financial-crime signals across customer activity.", ["resp-escalate"], ["Scenario assessment"], 6],
  ["req-control", "cap-control", 3, "high", "Operates key preventative controls.", ["resp-onboarding", "resp-ubo"], ["Control walkthrough"], 12],
  ["req-speak-up", "cap-speak-up", 2, "moderate", "Must challenge pressure to bypass controls.", ["resp-escalate"], ["Speak-up scenario"], 24],
] as const;

const approvalHistory = [
  {
    id: "approval-role-01",
    stage: "Role owner review",
    actor: "Katarzyna Zielińska",
    actorRole: "Head of Retail Banking Poland",
    decision: "approved" as const,
    rationale: "Responsibilities and decision limits match the operating model.",
    timestamp: "2026-07-18T09:14:00Z",
  },
  {
    id: "approval-role-02",
    stage: "Compliance approval",
    actor: "Michael Berger",
    actorRole: "Head of Compliance Learning",
    decision: "approved" as const,
    rationale: "High AML exposure and capability requirements are appropriately evidenced.",
    timestamp: "2026-07-18T10:32:00Z",
  },
];

const retailRmRole: JobRole = {
  id: "role-retail-rm-pl",
  code: "NB-RET-RM-PL",
  title: "Retail Banking Relationship Manager — Poland",
  standardizedTitle: "Retail Banking Relationship Manager",
  family: "Retail Customer Management",
  level: "Professional 3",
  seniority: "Practitioner",
  businessUnit: "Retail Banking",
  department: "Branch Network",
  legalEntity: "NordBank Polska S.A.",
  branch: "All Polish branches",
  country: "Poland",
  jurisdiction: "Poland / European Union",
  reportingLine: "Branch Manager",
  functionalReportingLine: "Head of Retail Customer Management",
  roleOwner: "Katarzyna Zielińska",
  complianceOwner: "Michael Berger",
  riskOwner: "Piotr Lewandowski",
  hrOwner: "Agnieszka Wójcik",
  managerRole: "Branch Manager",
  defenceLine: "first",
  engagementType: "Employee",
  rolePurpose: "Build and maintain safe retail and small-business customer relationships by applying onboarding, product, data and escalation controls in day-to-day decisions.",
  responsibilities: retailRmResponsibilities,
  decisionRights: ["Complete standard-risk onboarding", "Pause activity where a control concern exists", "Request supporting customer evidence"],
  approvalAuthorities: ["Standard-risk retail customer onboarding within documented limits"],
  delegatedAuthorities: ["No independent high-risk customer approval", "No suspicious activity reporting decision"],
  systemsAccessed: ["Customer Onboarding Platform", "CRM", "Document Repository", "Screening Portal"],
  dataAccessed: ["Identity data", "Contact data", "Financial information", "Ownership evidence", "Screening results"],
  productsSupported: ["Current accounts", "Savings", "Cards", "Consumer lending", "Small-business accounts"],
  customerSegments: ["Retail customers", "Vulnerable customers", "Small businesses"],
  marketsCovered: ["Poland", "Cross-border EEA activity"],
  processesPerformed: ["Customer onboarding", "Periodic review", "Product servicing", "Concern escalation"],
  controlIds: ["ctrl-cdd-01", "ctrl-id-02", "ctrl-ubo-03", "ctrl-esc-04", "ctrl-data-02", "ctrl-conduct-06"],
  riskDomainIds: ["risk-aml", "risk-sanctions", "risk-fraud", "risk-conduct", "risk-data", "risk-cyber"],
  capabilityRequirements: retailRequirements.map(([id, capabilityId, requiredLevel, criticality, whyRequired, sourceResponsibilityIds, evidenceRequired, reassessmentMonths]) => ({
    id,
    roleVersionId: "role-retail-rm-pl-v1.1",
    capabilityId,
    requiredLevel,
    criticality,
    whyRequired,
    sourceResponsibilityIds: [...sourceResponsibilityIds],
    evidenceRequired: [...evidenceRequired],
    reassessmentMonths,
    approved: true,
  })),
  certifications: ["Annual AML practical reassessment", "Customer Data Handling attestation"],
  recertificationMonths: 12,
  criticality: "material",
  defenceClassification: ["Customer-facing role", "Material customer harm potential", "CDD control operator"],
  status: "published",
  effectiveFrom: "2026-08-01",
  version: "1.1",
  parentRoleId: "role-retail-rm-global",
  approvalHistory,
};

const createWorkforceRole = ({
  id,
  code,
  title,
  family,
  businessUnit,
  capabilityIds,
  rolePurpose,
}: {
  id: string;
  code: string;
  title: string;
  family: string;
  businessUnit: string;
  capabilityIds: string[];
  rolePurpose: string;
}): JobRole => ({
  ...retailRmRole,
  id,
  code,
  title,
  standardizedTitle: title,
  family,
  businessUnit,
  department: businessUnit,
  rolePurpose,
  capabilityRequirements: retailRmRole.capabilityRequirements
    .filter((requirement) => capabilityIds.includes(requirement.capabilityId))
    .map((requirement) => ({
      ...requirement,
      id: `${id}-${requirement.capabilityId}`,
      roleVersionId: `${id}-v1.0`,
    })),
  version: "1.0",
  effectiveFrom: "2026-01-01",
  parentRoleId: `${id}-global`,
});

export const jobRoles: JobRole[] = [
  retailRmRole,
  {
    ...retailRmRole,
    id: "role-branch-deputy-pl",
    code: "NB-RET-BD-PL",
    title: "Branch Deputy — Temporary Cover",
    standardizedTitle: "Branch Deputy",
    family: "Branch Leadership",
    level: "Manager 1",
    seniority: "Advanced",
    rolePurpose: "Provide time-limited operational supervision and second-person approval within delegated branch limits.",
    approvalAuthorities: ["Second-person approval for standard onboarding", "Operational exception escalation"],
    delegatedAuthorities: ["Time-limited branch approval authority"],
    capabilityRequirements: [
      {
        id: "req-branch-leadership",
        roleVersionId: "role-branch-deputy-pl-v1.0",
        capabilityId: "cap-leadership",
        requiredLevel: 4,
        criticality: "high",
        whyRequired: "Supervises branch decisions and control quality.",
        sourceResponsibilityIds: ["resp-onboarding"],
        evidenceRequired: ["Manager validation", "Complex approval simulation"],
        reassessmentMonths: 6,
        approved: true,
      },
      {
        id: "req-branch-approval",
        roleVersionId: "role-branch-deputy-pl-v1.0",
        capabilityId: "cap-approval",
        requiredLevel: 4,
        criticality: "critical",
        whyRequired: "Exercises delegated approval authority.",
        sourceResponsibilityIds: ["resp-onboarding"],
        evidenceRequired: ["Approval sample", "SoD validation"],
        reassessmentMonths: 6,
        approved: true,
      },
    ],
    criticality: "critical",
    status: "approved",
    version: "1.0",
    effectiveFrom: "2026-08-01",
    parentRoleId: "role-branch-deputy-global",
  },
  {
    ...retailRmRole,
    id: "role-corporate-rm",
    code: "NB-CORP-RM",
    title: "Corporate Banking Relationship Manager",
    standardizedTitle: "Corporate Banking Relationship Manager",
    family: "Corporate Customer Management",
    businessUnit: "Corporate Banking",
    department: "Corporate Coverage",
    legalEntity: "NordBank International AG",
    branch: "Warsaw Corporate Office",
    rolePurpose: "Manage corporate relationships and coordinate complex onboarding, transaction and credit decisions.",
    criticality: "material",
    status: "published",
    version: "2.3",
    effectiveFrom: "2026-01-01",
    parentRoleId: "role-corporate-rm-global",
  },
  createWorkforceRole({
    id: "role-kyc-analyst",
    code: "NB-KYC-ANL",
    title: "KYC Analyst",
    family: "KYC Operations",
    businessUnit: "Onboarding",
    capabilityIds: ["cap-customer-id", "cap-beneficial-owner", "cap-edd", "cap-risk-id", "cap-escalation", "cap-data-handling"],
    rolePurpose: "Review customer evidence, resolve ownership questions and escalate heightened financial-crime risk.",
  }),
  createWorkforceRole({
    id: "role-payments-specialist",
    code: "NB-PAY-OPS",
    title: "Payments Operations Specialist",
    family: "Payments Operations",
    businessUnit: "Payments",
    capabilityIds: ["cap-risk-id", "cap-escalation", "cap-control", "cap-data-handling", "cap-systems"],
    rolePurpose: "Process payments safely, recognize control exceptions and escalate financial-crime or operational concerns.",
  }),
  createWorkforceRole({
    id: "role-branch-advisor",
    code: "NB-RET-ADV",
    title: "Retail Branch Advisor",
    family: "Retail Advisory",
    businessUnit: "Retail Banking",
    capabilityIds: ["cap-customer-id", "cap-product", "cap-data-handling", "cap-systems", "cap-speak-up"],
    rolePurpose: "Support retail customers with fair product communication, accurate records and safe data handling.",
  }),
  createWorkforceRole({
    id: "role-operations-analyst",
    code: "NB-OPS-ANL",
    title: "Banking Operations Analyst",
    family: "Banking Operations",
    businessUnit: "Operations",
    capabilityIds: ["cap-control", "cap-data-handling", "cap-systems", "cap-risk-id", "cap-speak-up"],
    rolePurpose: "Execute operational controls, maintain reliable records and resolve processing exceptions.",
  }),
  createWorkforceRole({
    id: "role-risk-officer",
    code: "NB-RISK-OFF",
    title: "Risk Control Officer",
    family: "Risk and Control",
    businessUnit: "Risk",
    capabilityIds: ["cap-risk-id", "cap-escalation", "cap-control", "cap-speak-up", "cap-leadership"],
    rolePurpose: "Assess material exposure, challenge control weaknesses and oversee timely remediation.",
  }),
];

export const parsedStatements: ParsedStatement[] = [
  { id: "stmt-01", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 1, sourceParagraph: "Role purpose, paragraph 2", sourceSpan: "Onboards retail and small-business customers and collects required customer documentation.", extractedStatement: "Onboards customers and collects documentation.", normalizedValue: "Execute customer onboarding", normalizedTaxonomyId: "resp-onboarding", classification: "explicit", confidence: 99, reason: "Direct action statement with named customer segments.", riskDomainIds: ["risk-aml", "risk-conduct"], capabilityIds: ["cap-customer-id", "cap-control"], potentialRegulatoryRelevance: "Customer due diligence", requiredReviewer: "Role owner", reviewStatus: "approved" },
  { id: "stmt-02", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 1, sourceParagraph: "Responsibilities, bullet 3", sourceSpan: "Identifies beneficial owners and reviews ownership documentation.", extractedStatement: "Identifies beneficial owners.", normalizedValue: "Identify and verify beneficial ownership", normalizedTaxonomyId: "resp-ubo", classification: "explicit", confidence: 98, reason: "Direct responsibility and artifact are stated.", riskDomainIds: ["risk-aml"], capabilityIds: ["cap-beneficial-owner"], potentialRegulatoryRelevance: "AML/CFT beneficial ownership obligations", requiredReviewer: "AML/CFT Compliance Officer", reviewStatus: "approved" },
  { id: "stmt-03", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 2, sourceParagraph: "Customer coverage, paragraph 1", sourceSpan: "May serve customers with cross-border activity.", extractedStatement: "Cross-border exposure may require recognition of enhanced due diligence triggers.", normalizedValue: "Identify EDD trigger", normalizedTaxonomyId: "cap-edd", classification: "inferred-high", confidence: 82, reason: "Cross-border exposure is explicit; EDD trigger responsibility is corroborated by AML Policy v4.7.", riskDomainIds: ["risk-aml"], capabilityIds: ["cap-edd"], potentialRegulatoryRelevance: "Risk-based enhanced due diligence", requiredReviewer: "AML/CFT Compliance Officer", reviewStatus: "pending" },
  { id: "stmt-04", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 2, sourceParagraph: "Authority, paragraph 2", sourceSpan: "Cannot approve high-risk customers independently.", extractedStatement: "High-risk approval must be escalated.", normalizedValue: "Escalate and await authorized decision", normalizedTaxonomyId: "cap-escalation", classification: "explicit", confidence: 99, reason: "Decision limit is directly stated.", riskDomainIds: ["risk-aml", "risk-sanctions"], capabilityIds: ["cap-escalation"], potentialRegulatoryRelevance: "Governance and escalation", requiredReviewer: "Compliance Officer", reviewStatus: "approved" },
  { id: "stmt-05", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 2, sourceParagraph: "Responsibilities, bullet 8", sourceSpan: "Identifies suspicious behaviour and escalates potential AML, fraud or sanctions concerns.", extractedStatement: "Recognizes and escalates financial-crime concerns.", normalizedValue: "Financial crime risk escalation", normalizedTaxonomyId: "resp-escalate", classification: "explicit", confidence: 99, reason: "Risk domains and required action are named.", riskDomainIds: ["risk-aml", "risk-fraud", "risk-sanctions"], capabilityIds: ["cap-risk-id", "cap-escalation"], potentialRegulatoryRelevance: "AML, fraud and sanctions controls", requiredReviewer: "Compliance Officer", reviewStatus: "approved" },
  { id: "stmt-06", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 1, sourceParagraph: "Systems and data", sourceSpan: "Uses customer onboarding and CRM systems and handles personal and financial data.", extractedStatement: "Uses onboarding systems and handles customer data.", normalizedValue: "Secure system and data handling", normalizedTaxonomyId: "resp-data", classification: "explicit", confidence: 97, reason: "Systems and data classes are directly stated.", riskDomainIds: ["risk-data", "risk-cyber"], capabilityIds: ["cap-data-handling", "cap-systems"], potentialRegulatoryRelevance: "Data protection and banking secrecy", requiredReviewer: "Data Protection Officer", reviewStatus: "approved" },
  { id: "stmt-07", sourceDocument: "Retail RM — Warsaw Branch Job Description", sourceVersion: "3.0", sourcePage: 1, sourceParagraph: "Responsibilities, bullet 5", sourceSpan: "Explains banking products to customers.", extractedStatement: "Explains banking products.", normalizedValue: "Fair product communication", normalizedTaxonomyId: "resp-products", classification: "ambiguous", confidence: 64, reason: "The statement does not specify whether regulated advice is included.", riskDomainIds: ["risk-conduct", "risk-consumer"], capabilityIds: ["cap-product"], potentialRegulatoryRelevance: "Conduct and consumer protection", requiredReviewer: "Conduct Risk Officer", reviewStatus: "pending" },
];

export const employeeRoleAssignments: EmployeeRoleAssignment[] = [
  { id: "assign-sofia-primary", employeeId: "emp-0003", roleId: "role-retail-rm-pl", roleVersion: "1.1", assignmentType: "primary", allocationPercent: 80, effectiveFrom: "2026-08-01", status: "active", managerValidated: true, hrValidated: true, complianceValidated: true, reason: "Approved transfer to Warsaw retail branch." },
  { id: "assign-sofia-deputy", employeeId: "emp-0003", roleId: "role-branch-deputy-pl", roleVersion: "1.0", assignmentType: "temporary", allocationPercent: 20, effectiveFrom: "2026-08-01", effectiveTo: "2026-08-30", status: "pending", managerValidated: true, hrValidated: true, complianceValidated: false, reason: "Temporary cover during branch manager leave." },
];

export const employeeCapabilityLevels: Record<string, number> = {
  "cap-customer-id": 3,
  "cap-beneficial-owner": 2,
  "cap-edd": 1,
  "cap-escalation": 2,
  "cap-data-handling": 3,
  "cap-product": 3,
  "cap-systems": 3,
  "cap-risk-id": 2,
  "cap-control": 3,
  "cap-speak-up": 2,
  "cap-leadership": 2,
  "cap-approval": 1,
};

export const defaultRiskFactors: RiskFactor[] = [
  { id: "factor-inherent", name: "Inherent role risk", value: 4, weight: 1, weightedValue: 4, source: "Approved Retail RM role profile v1.1", confidence: 97 },
  { id: "factor-responsibility", name: "Responsibility weight", value: 1.25, weight: 1, weightedValue: 1.25, source: "CDD control operator classification", confidence: 96 },
  { id: "factor-authority", name: "Decision-authority weight", value: 1.1, weight: 1, weightedValue: 1.1, source: "Standard onboarding authority; no high-risk approval", confidence: 99 },
  { id: "factor-exposure", name: "Customer, product and geography weight", value: 1.3, weight: 1, weightedValue: 1.3, source: "Retail/SME and cross-border EEA exposure", confidence: 91 },
  { id: "factor-control", name: "Control-criticality weight", value: 1.25, weight: 1, weightedValue: 1.25, source: "Key preventative onboarding controls", confidence: 98 },
  { id: "factor-employee", name: "Employee-specific modifier", value: 0.95, weight: 1, weightedValue: 0.95, source: "Experience and current approved evidence", confidence: 87 },
];

const allWorkforceFamilies = [
  "Retail Customer Management",
  "Corporate Customer Management",
  "Branch Leadership",
  "KYC Operations",
  "Payments Operations",
  "Retail Advisory",
  "Banking Operations",
  "Risk and Control",
];

const customerRiskFamilies = [
  "Retail Customer Management",
  "Corporate Customer Management",
  "KYC Operations",
  "Branch Leadership",
];

export const learningCatalog: LearningCatalogItem[] = [
  { id: "learn-ubo-sim", title: "UBO Verification Simulation", type: "simulation", capabilityOutcomes: [{ capabilityId: "cap-beneficial-owner", targetLevel: 3 }], riskDomainIds: ["risk-aml"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: customerRiskFamilies, difficulty: "Practitioner", durationMinutes: 18, language: "English", evidenceGenerated: ["Practical decision evidence"], passingThreshold: 80, validityMonths: 12, status: "published", version: "2.2", effectiveFrom: "2026-04-01", sourceIds: ["policy-aml-47", "ctrl-ubo-03"] },
  { id: "learn-edd-case", title: "Cross-border EDD Trigger Case", type: "case", capabilityOutcomes: [{ capabilityId: "cap-edd", targetLevel: 2 }], riskDomainIds: ["risk-aml"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: customerRiskFamilies, difficulty: "Working knowledge", durationMinutes: 8, language: "English", evidenceGenerated: ["Scenario assessment"], passingThreshold: 75, validityMonths: 12, status: "published", version: "1.4", effectiveFrom: "2026-07-12", sourceIds: ["policy-aml-47"] },
  { id: "learn-escalation", title: "Escalation Before Execution", type: "simulation", capabilityOutcomes: [{ capabilityId: "cap-escalation", targetLevel: 3 }, { capabilityId: "cap-risk-id", targetLevel: 3 }], riskDomainIds: ["risk-aml", "risk-fraud", "risk-sanctions"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: allWorkforceFamilies, difficulty: "Practitioner", durationMinutes: 12, language: "English", evidenceGenerated: ["Branching simulation", "Manager validation"], passingThreshold: 80, validityMonths: 6, status: "published", version: "3.0", effectiveFrom: "2026-07-12", sourceIds: ["policy-aml-47", "ctrl-esc-04"] },
  { id: "learn-aml-generic", title: "Annual AML Awareness", type: "course", capabilityOutcomes: [{ capabilityId: "cap-risk-id", targetLevel: 1 }], riskDomainIds: ["risk-aml"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: allWorkforceFamilies, difficulty: "Awareness", durationMinutes: 45, language: "English", evidenceGenerated: ["Knowledge completion"], passingThreshold: 70, validityMonths: 12, status: "published", version: "6.1", effectiveFrom: "2026-01-01", sourceIds: ["policy-aml-47"] },
  { id: "learn-branch-approval", title: "Delegated Branch Approval Lab", type: "simulation", capabilityOutcomes: [{ capabilityId: "cap-approval", targetLevel: 4 }, { capabilityId: "cap-leadership", targetLevel: 4 }], riskDomainIds: ["risk-operational", "risk-conduct"], jurisdictions: ["Poland"], legalEntities: ["NordBank Polska S.A."], roleFamilies: ["Branch Leadership"], difficulty: "Advanced", durationMinutes: 25, language: "English", evidenceGenerated: ["Complex approval simulation", "Manager validation"], passingThreshold: 85, validityMonths: 6, status: "published", version: "1.0", effectiveFrom: "2026-06-01", sourceIds: ["policy-delegation-22"] },
  { id: "learn-control-lab", title: "Control Execution Quality Lab", type: "simulation", capabilityOutcomes: [{ capabilityId: "cap-control", targetLevel: 3 }], riskDomainIds: ["risk-operational"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: allWorkforceFamilies, difficulty: "Practitioner", durationMinutes: 16, language: "English", evidenceGenerated: ["Control sample", "Manager observation"], passingThreshold: 80, validityMonths: 12, status: "published", version: "1.2", effectiveFrom: "2026-03-01", sourceIds: ["ctrl-cdd-01"] },
  { id: "learn-data-handling", title: "Customer Data Decision Case", type: "case", capabilityOutcomes: [{ capabilityId: "cap-data-handling", targetLevel: 3 }], riskDomainIds: ["risk-data", "risk-cyber"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: allWorkforceFamilies, difficulty: "Practitioner", durationMinutes: 10, language: "English", evidenceGenerated: ["Privacy scenario", "Decision rationale"], passingThreshold: 80, validityMonths: 12, status: "published", version: "2.0", effectiveFrom: "2026-05-25", sourceIds: ["ctrl-data-02"] },
  { id: "learn-system-task", title: "Safe System Processing Task", type: "assessment", capabilityOutcomes: [{ capabilityId: "cap-systems", targetLevel: 3 }], riskDomainIds: ["risk-operational", "risk-cyber"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: allWorkforceFamilies, difficulty: "Working knowledge", durationMinutes: 12, language: "English", evidenceGenerated: ["Observed system task"], passingThreshold: 75, validityMonths: 12, status: "published", version: "1.3", effectiveFrom: "2026-04-15", sourceIds: ["ctrl-data-02"] },
  { id: "learn-product-conduct", title: "Fair Customer Conversation", type: "manager-observation", capabilityOutcomes: [{ capabilityId: "cap-product", targetLevel: 3 }], riskDomainIds: ["risk-conduct", "risk-consumer"], jurisdictions: ["Poland", "European Union"], legalEntities: ["NordBank Polska S.A."], roleFamilies: ["Retail Customer Management", "Corporate Customer Management", "Retail Advisory"], difficulty: "Practitioner", durationMinutes: 15, language: "English", evidenceGenerated: ["Manager observation", "Customer scenario"], passingThreshold: 80, validityMonths: 12, status: "published", version: "1.1", effectiveFrom: "2026-02-01", sourceIds: ["ctrl-conduct-06"] },
];

export const traceabilityNodes: TraceabilityNode[] = [
  { id: "obl-aml-cdd", type: "obligation", label: "Risk-based customer due diligence", version: "2026", effectiveFrom: "2026-01-01", status: "active", metadata: { jurisdiction: "Poland / EU" } },
  { id: "policy-aml-47", type: "policy", label: "NordBank AML & CTF Policy §8.3", version: "4.7", effectiveFrom: "2026-07-12", status: "active", metadata: { owner: "MLRO Office" } },
  { id: "proc-retail-onboarding", type: "process", label: "Retail Customer Onboarding", version: "5.0", effectiveFrom: "2026-07-12", status: "active", metadata: { owner: "Retail Operations" } },
  { id: "ctrl-cdd-01", type: "control", label: "CDD evidence review", version: "3.2", effectiveFrom: "2026-07-12", status: "active", metadata: { criticality: "high" } },
  { id: "resp-onboarding", type: "responsibility", label: "Execute standard customer onboarding", version: "1.1", effectiveFrom: "2026-08-01", status: "approved", metadata: { role: "Retail RM" } },
  { id: "risk-retail-rm", type: "risk", label: "Retail RM AML exposure", version: "risk-v2", effectiveFrom: "2026-08-01", status: "pending approval", metadata: { score: 67 } },
  { id: "cap-escalation", type: "capability", label: "AML, Fraud and Sanctions Escalation — L3", version: "2.0", effectiveFrom: "2026-07-12", status: "active", metadata: { requiredLevel: 3 } },
  { id: "learn-escalation", type: "learning", label: "Escalation Before Execution v3.0", version: "3.0", effectiveFrom: "2026-07-12", status: "published", metadata: { duration: 12 } },
  { id: "assignment-escalation", type: "assignment", label: "Sofia Novak · Escalation simulation", version: "1", effectiveFrom: "2026-08-01", status: "pending approval", metadata: { dueDate: "2026-08-08" } },
  { id: "evidence-escalation", type: "evidence", label: "Branching simulation result", version: "pending", effectiveFrom: "2026-08-01", status: "not started", metadata: { expectedLevel: 3 } },
];

export const traceabilityEdges: TraceabilityEdge[] = traceabilityNodes.slice(0, -1).map((node, index) => ({
  id: `edge-${index + 1}`,
  from: node.id,
  to: traceabilityNodes[index + 1].id,
  relationship: ["implemented by", "governs", "controlled by", "performed by", "creates", "requires", "developed by", "assigned as", "produces"][index],
  rationale: "Approved Vidda traceability relationship for the Retail RM demonstration.",
}));
