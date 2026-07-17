import type {
  AuditEvent,
  Campaign,
  Employee,
  PolicyDocument,
  RiskLevel,
} from "@/domain/types";

export const organization = {
  name: "NordBank International",
  countries: ["Austria", "Germany", "Poland", "Sweden", "Norway"],
  businessUnits: [
    "Retail Banking",
    "Corporate Banking",
    "Private Banking",
    "Payments",
    "Operations",
    "Risk & Compliance",
  ],
};

export const bankMetrics = {
  readiness: 78,
  target: 85,
  employeesAssessed: 1248,
  activeEmployees: 1047,
  activeThisWeek: 84,
  casesCompleted: 8420,
  criticalGaps: 7,
  highRiskEmployees: 46,
  policyCoverage: 68,
  averageScore: 76,
  improvement: 9,
  averageDailyCompletion: 76,
  averageCaseDuration: "4m 18s",
};

const firstNames = [
  "Anna", "Ivan", "Sofia", "Daniel", "Erik", "Maria", "Lena", "Marek",
  "Nora", "Jakob", "Clara", "Tomas", "Ingrid", "Leon", "Amelia", "Matteo",
];
const lastNames = [
  "Kowalska", "Grabovski", "Novak", "Weber", "Johansson", "Rossi", "Schmidt",
  "Nowak", "Berg", "Lindholm", "Huber", "Petrov", "Müller", "Andersen",
];
const departments = [
  "Retail Banking", "Corporate Banking", "Private Banking", "Operations",
  "Customer Support", "Payments", "Onboarding", "Risk", "Compliance",
];
const roles = [
  "Relationship Manager", "KYC Analyst", "Payments Specialist",
  "Branch Advisor", "Operations Analyst", "Risk Officer",
];
const countries = ["Poland", "Germany", "Austria", "Sweden", "Norway"];

const riskForScore = (score: number): RiskLevel => {
  if (score < 52) return "critical";
  if (score < 65) return "high";
  if (score < 78) return "medium";
  return "low";
};

export const employees: Employee[] = Array.from({ length: 1248 }, (_, index) => {
  const isCorporate = index % 5 === 0;
  const score = isCorporate ? 51 + ((index * 7) % 25) : 68 + ((index * 11) % 27);
  const name =
    index === 0
      ? "Anna Kowalska"
      : `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
  return {
    id: `emp-${String(index + 1).padStart(4, "0")}`,
    name,
    role: index === 0 ? "Relationship Manager" : roles[index % roles.length],
    department: isCorporate ? "Corporate Banking" : departments[index % departments.length],
    branch: index % 6 === 0 ? "Warsaw Branch 04" : `${countries[index % countries.length]} Office ${String((index % 12) + 1).padStart(2, "0")}`,
    country: countries[index % countries.length],
    capabilityScore: index === 0 ? 78 : score,
    riskLevel: index === 0 ? "medium" : riskForScore(score),
    casesCompleted: index === 0 ? 34 : 4 + ((index * 5) % 46),
    repeatedErrors: index === 0 ? 2 : index % 7,
    lastActivity: index % 4 === 0 ? "Today" : `${(index % 9) + 1} days ago`,
    trend: index === 0 ? 8 : -4 + (index % 14),
    recommendedAction: score < 65 ? "Assign targeted practice" : "Continue adaptive cases",
  };
});

Object.assign(employees[1], { name: "Ivan Grabovski", capabilityScore: 61, riskLevel: "high" });
Object.assign(employees[2], { name: "Sofia Novak", capabilityScore: 88, riskLevel: "low" });
Object.assign(employees[3], { name: "Daniel Weber", capabilityScore: 49, riskLevel: "critical", repeatedErrors: 6 });
Object.assign(employees[4], { name: "Erik Johansson", capabilityScore: 73, riskLevel: "medium" });
Object.assign(employees[5], { name: "Maria Rossi", capabilityScore: 91, riskLevel: "low" });

export const policyDocuments: PolicyDocument[] = [
  { id: "doc-01", title: "AML & CTF Policy", category: "AML", source: "Internal", version: "4.7", effectiveDate: "12 Jul 2026", lastUpdated: "5 days ago", aiStatus: "Processed", linkedCases: 18, affectedRoles: 7, owner: "Financial Crime Compliance", status: "Active", jurisdiction: "Group-wide", requirements: 84 },
  { id: "doc-02", title: "Customer Due Diligence Standard", category: "KYC", source: "Internal", version: "3.1", effectiveDate: "01 Apr 2026", lastUpdated: "02 Apr 2026", aiStatus: "Processed", linkedCases: 14, affectedRoles: 9, owner: "KYC Governance", status: "Active", jurisdiction: "Group-wide", requirements: 62 },
  { id: "doc-03", title: "Sanctions Screening Procedure", category: "Sanctions", source: "Internal", version: "5.4", effectiveDate: "18 Jun 2026", lastUpdated: "18 Jun 2026", aiStatus: "Processed", linkedCases: 9, affectedRoles: 5, owner: "Sanctions Office", status: "Active", jurisdiction: "EU / EEA", requirements: 47 },
  { id: "doc-04", title: "Suspicious Activity Escalation Process", category: "AML", source: "Internal", version: "2.8", effectiveDate: "12 Jul 2026", lastUpdated: "5 days ago", aiStatus: "Review required", linkedCases: 11, affectedRoles: 7, owner: "MLRO Office", status: "Under review", jurisdiction: "Group-wide", requirements: 31 },
  { id: "doc-05", title: "Data Protection Policy", category: "Privacy", source: "Internal", version: "6.2", effectiveDate: "25 May 2026", lastUpdated: "25 May 2026", aiStatus: "Processed", linkedCases: 7, affectedRoles: 12, owner: "Data Protection Office", status: "Active", jurisdiction: "EU / EEA", requirements: 56 },
  { id: "doc-06", title: "Gifts and Hospitality Standard", category: "Conduct", source: "Internal", version: "2.4", effectiveDate: "01 Feb 2026", lastUpdated: "01 Feb 2026", aiStatus: "Processed", linkedCases: 4, affectedRoles: 8, owner: "Conduct Risk", status: "Active", jurisdiction: "Group-wide", requirements: 22 },
  { id: "doc-07", title: "Fraud Prevention Guidelines", category: "Fraud", source: "Internal", version: "4.0", effectiveDate: "14 Mar 2026", lastUpdated: "14 Mar 2026", aiStatus: "Processed", linkedCases: 8, affectedRoles: 6, owner: "Fraud Risk", status: "Active", jurisdiction: "Group-wide", requirements: 44 },
];

export const capabilityColumns = [
  "Customer Identification", "Beneficial Ownership", "Source of Funds",
  "Enhanced Due Diligence", "Sanctions Screening", "Escalation",
  "Suspicious Activity Reporting", "Tipping-Off Prevention", "Data Protection",
  "Fraud Detection",
];

export const heatmapData = departments.map((department, row) => ({
  department,
  scores: capabilityColumns.map((capability, column) => {
    if (department === "Corporate Banking" && capability === "Escalation") return 54;
    return 55 + ((row * 13 + column * 7) % 39);
  }),
}));

export const readinessTrend = [
  { month: "Feb", readiness: 69, target: 85 },
  { month: "Mar", readiness: 70, target: 85 },
  { month: "Apr", readiness: 72, target: 85 },
  { month: "May", readiness: 74, target: 85 },
  { month: "Jun", readiness: 76, target: 85 },
  { month: "Jul", readiness: 78, target: 85 },
];

export const departmentRanking = [
  { name: "Private Banking", readiness: 89 },
  { name: "Compliance Operations", readiness: 87 },
  { name: "Retail Banking", readiness: 81 },
  { name: "Customer Support", readiness: 75 },
  { name: "Corporate Banking", readiness: 63 },
];

export const auditEvents: AuditEvent[] = [
  { id: "audit-01", timestamp: "17 Jul 2026 · 14:32:08", actor: "Vidda AI", actorType: "AI", action: "Requirement extracted", entity: "AML Policy v4.7 · §8.3", previousValue: "Threshold: local rule", newValue: "Threshold: EUR 100,000 equivalent", reason: "Document version comparison", source: "Reasoning Engine 0.9", status: "Verified" },
  { id: "audit-02", timestamp: "17 Jul 2026 · 13:51:12", actor: "Michael Berger", actorType: "Human", action: "Case approved", entity: "AML-CASH-01 v2.3", previousValue: "Expert review", newValue: "Published", reason: "Aligned with policy v4.7", source: "Compliance workspace", status: "Complete" },
  { id: "audit-03", timestamp: "17 Jul 2026 · 11:06:43", actor: "System", actorType: "System", action: "Employees assigned", entity: "Policy v4.7 reassessment", previousValue: "0 employees", newValue: "87 employees", reason: "Role-impact match", source: "Automation rule 14", status: "Complete" },
  { id: "audit-04", timestamp: "16 Jul 2026 · 16:23:10", actor: "Anna Kowalska", actorType: "Human", action: "Answer submitted", entity: "KYC-ESC-09", previousValue: "Assigned", newValue: "Score 74", reason: "Daily case response", source: "Employee portal", status: "Complete" },
  { id: "audit-05", timestamp: "16 Jul 2026 · 10:44:27", actor: "Michael Berger", actorType: "Human", action: "Result overridden", entity: "Assessment RES-2281", previousValue: "Score 58", newValue: "Score 66", reason: "Valid alternate escalation channel", source: "Expert review", status: "Complete" },
];

export const defaultCampaign: Campaign = {
  id: "campaign-aml-01",
  title: "AML Escalation Recovery Campaign",
  audience: "Corporate Banking",
  employees: 146,
  duration: "5 days",
  assigned: 146,
  started: 112,
  completed: 67,
  passed: 54,
  scoreImprovement: 0,
  status: "Draft",
};

export const notifications = [
  { id: "n1", title: "87 employees require reassessment", detail: "Internal AML Policy v4.7", time: "8 min ago", level: "warning" },
  { id: "n2", title: "AI-generated cases ready for review", detail: "2 draft cases · Enhanced Due Diligence", time: "41 min ago", level: "info" },
  { id: "n3", title: "Critical capability gap detected", detail: "Corporate Banking · AML Escalation", time: "2 hours ago", level: "critical" },
];
