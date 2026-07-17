import type { LearningCase, PolicyReference } from "@/domain/types";

export const amlPolicyReferences: PolicyReference[] = [
  {
    id: "pol-aml-47",
    title: "Internal AML & CTF Policy",
    section: "Section 8.3 · High-value cash transactions",
    version: "4.7",
    status: "Current",
    effectiveDate: "12 Jul 2026",
    excerpt:
      "High-value cash transactions inconsistent with the customer profile must remain pending while enhanced due diligence and Compliance escalation are completed.",
    confidence: 98,
  },
  {
    id: "pol-cdd-31",
    title: "Customer Due Diligence Standard",
    section: "Section 8.3 · Source of funds",
    version: "3.1",
    status: "Current",
    effectiveDate: "01 Apr 2026",
    excerpt:
      "The relationship owner must obtain credible evidence of source of funds where the activity differs materially from expected behavior.",
    confidence: 96,
  },
  {
    id: "pol-cash-52",
    title: "Cash Transaction Procedure",
    section: "Section 5.2 · Escalation sequence",
    version: "5.2",
    status: "Current",
    effectiveDate: "12 Jul 2026",
    excerpt:
      "Processing is paused before escalation. Employees must not disclose whether suspicious activity reporting is being considered.",
    confidence: 95,
  },
  {
    id: "eba-risk",
    title: "EBA Guidelines on ML/TF Risk Factors",
    section: "Business relationship monitoring",
    version: "2024/01",
    status: "Current",
    effectiveDate: "30 Dec 2024",
    excerpt:
      "Institutions should identify transactions that are unusually large or inconsistent with knowledge of the customer.",
    confidence: 91,
  },
  {
    id: "local-aml-34",
    title: "Local AML Act",
    section: "Article 34 · Enhanced measures",
    version: "2026",
    status: "Current",
    effectiveDate: "01 Jan 2026",
    excerpt:
      "Enhanced measures apply where the obliged institution identifies increased money-laundering risk.",
    confidence: 89,
  },
];

const cashActions = [
  { id: "accept", label: "Accept the deposit immediately", capability: "Escalation", points: 0, prohibited: true, penalty: 30 },
  { id: "documents", label: "Request supporting documentation", capability: "Source of Funds Verification", points: 10 },
  { id: "source", label: "Verify source of funds", capability: "Source of Funds Verification", points: 20 },
  { id: "history", label: "Review customer transaction history", capability: "KYC Procedure", points: 10 },
  { id: "screening", label: "Perform sanctions and PEP screening", capability: "Risk Identification", points: 5 },
  { id: "notify", label: "Notify the customer that the transaction is suspicious", capability: "Customer Communication", points: 0, prohibited: true, penalty: 25 },
  { id: "escalate", label: "Escalate the case to Compliance", capability: "Escalation", points: 25 },
  { id: "str", label: "File a suspicious transaction report immediately", capability: "Regulatory Reasoning", points: 0, prohibited: true, penalty: 10 },
  { id: "edd", label: "Apply Enhanced Due Diligence", capability: "KYC Procedure", points: 15 },
  { id: "reject", label: "Reject the transaction automatically", capability: "Regulatory Reasoning", points: 0, prohibited: true, penalty: 10 },
];

export const dailyCashCase: LearningCase = {
  id: "case-aml-cash-01",
  title: "Large cash deposit inconsistent with profile",
  category: "AML / KYC",
  roleRelevance: ["Relationship Manager", "Branch Manager", "KYC Officer"],
  difficulty: "Intermediate",
  estimatedTime: "4 min",
  scenario:
    "A long-standing corporate customer arrives at the branch and requests to deposit USD 200,000 in cash. The customer states that the funds came from the sale of equipment but cannot immediately provide the sale agreement. The company normally operates through bank transfers and has not made significant cash deposits during the last 24 months. What actions would you take?",
  context: [
    "No previous AML alerts were registered.",
    "The transaction is inconsistent with the customer’s historical activity.",
    "The customer risk rating is currently Standard.",
  ],
  actions: cashActions,
  expectedSequence: ["history", "documents", "source", "edd", "escalate"],
  keywords: {
    history: ["history", "profile", "previous transactions", "historical activity"],
    documents: ["document", "sale agreement", "supporting evidence"],
    source: ["source of funds", "verify funds", "origin of funds"],
    edd: ["enhanced due diligence", "edd"],
    escalate: ["escalate", "compliance", "pause", "pending"],
    notify: ["tell the customer", "suspicious report", "inform the customer"],
  },
  policyReferences: amlPolicyReferences,
  capabilityTags: ["Risk Identification", "KYC Procedure", "Source of Funds Verification", "Escalation", "Customer Communication", "Regulatory Reasoning"],
  followUpRecommendation: "Escalation Before Execution",
  status: "published",
  aiGenerated: false,
  version: "2.3",
};

type CaseSeed = Pick<
  LearningCase,
  "id" | "title" | "category" | "difficulty" | "scenario" | "capabilityTags"
>;

const caseSeeds: CaseSeed[] = [
  { id: "case-aml-02", title: "Customer refuses to disclose beneficial owner", category: "AML / KYC", difficulty: "Intermediate", scenario: "A corporate customer declines to identify its ultimate beneficial owner and asks you to proceed using only registry documents. How do you respond?", capabilityTags: ["Beneficial Ownership", "Escalation"] },
  { id: "case-aml-03", title: "Offshore ownership structure", category: "AML / KYC", difficulty: "Advanced", scenario: "A new company has three holding entities across offshore jurisdictions and no clear commercial rationale. Assess the onboarding controls.", capabilityTags: ["Beneficial Ownership", "Enhanced Due Diligence"] },
  { id: "case-aml-04", title: "Customer becomes a PEP", category: "AML / KYC", difficulty: "Advanced", scenario: "A screening refresh shows that an existing customer was appointed deputy minister. Decide the next steps.", capabilityTags: ["PEP Screening", "Enhanced Due Diligence"] },
  { id: "case-aml-05", title: "High-risk jurisdiction payment", category: "AML / KYC", difficulty: "Advanced", scenario: "A customer requests a payment to a newly added beneficiary in a high-risk jurisdiction. The invoice description is broad.", capabilityTags: ["Jurisdiction Risk", "Escalation"] },
  { id: "case-aml-06", title: "Rapid movement through accounts", category: "AML / KYC", difficulty: "Advanced", scenario: "Funds arrive from multiple parties and leave the same day through three related accounts. Select the appropriate controls.", capabilityTags: ["Transaction Monitoring", "Suspicious Activity Reporting"] },
  { id: "case-san-01", title: "Partial sanctions match", category: "Sanctions", difficulty: "Intermediate", scenario: "A payment screening alert matches the customer surname and year of birth but not nationality. What do you do before release?", capabilityTags: ["Sanctions Screening", "Escalation"] },
  { id: "case-san-02", title: "Sanctioned intermediary bank", category: "Sanctions", difficulty: "Advanced", scenario: "The beneficiary is not listed, but the payment route includes a recently sanctioned intermediary bank.", capabilityTags: ["Sanctions Screening", "Payment Controls"] },
  { id: "case-san-03", title: "Name transliteration match", category: "Sanctions", difficulty: "Advanced", scenario: "A Cyrillic-to-Latin transliteration creates a close match with a sanctioned individual. Resolve the alert.", capabilityTags: ["Sanctions Screening", "Identity Resolution"] },
  { id: "case-fraud-01", title: "Urgent elderly customer transfer", category: "Fraud", difficulty: "Intermediate", scenario: "An elderly customer asks for an urgent transfer to a new beneficiary and becomes anxious when questioned.", capabilityTags: ["Fraud Detection", "Customer Safeguarding"] },
  { id: "case-fraud-02", title: "Business email compromise", category: "Fraud", difficulty: "Intermediate", scenario: "A finance director emails new beneficiary details and pressures the bank to bypass callback verification.", capabilityTags: ["Fraud Detection", "Payment Controls"] },
  { id: "case-fraud-03", title: "Login failures before payment", category: "Fraud", difficulty: "Advanced", scenario: "Multiple failed logins are followed by a successful session and a high-value payment request.", capabilityTags: ["Fraud Detection", "Cyber Response"] },
  { id: "case-data-01", title: "Data sent to personal email", category: "Data Protection", difficulty: "Foundation", scenario: "A colleague sends a customer file to a personal email address to finish work from home.", capabilityTags: ["Data Protection", "Incident Reporting"] },
  { id: "case-data-02", title: "Accidental account disclosure", category: "Data Protection", difficulty: "Intermediate", scenario: "An account statement was attached to an email sent to the wrong customer with a similar name.", capabilityTags: ["Data Protection", "Incident Reporting"] },
  { id: "case-data-03", title: "External information request", category: "Data Protection", difficulty: "Intermediate", scenario: "An external consultant requests customer data and references a project manager you cannot reach.", capabilityTags: ["Data Protection", "Authorization"] },
  { id: "case-conduct-01", title: "Gift from corporate customer", category: "Conduct Risk", difficulty: "Foundation", scenario: "A corporate customer offers event tickets after a successful financing decision.", capabilityTags: ["Gifts & Hospitality", "Conflict Recognition"] },
  { id: "case-conduct-02", title: "Loan approval conflict", category: "Conduct Risk", difficulty: "Intermediate", scenario: "You discover that a loan applicant is owned by a close relative of an approval committee member.", capabilityTags: ["Conflict of Interest", "Escalation"] },
  { id: "case-conduct-03", title: "Investment risk communication", category: "Conduct Risk", difficulty: "Intermediate", scenario: "A colleague describes a volatile investment as capital-protected when the documents state otherwise.", capabilityTags: ["Customer Communication", "Conduct Risk"] },
  { id: "case-cyber-01", title: "Suspicious corporate email link", category: "Cybersecurity", difficulty: "Foundation", scenario: "An email styled as an IT security notice asks you to sign in through an unfamiliar link.", capabilityTags: ["Phishing Recognition", "Cyber Response"] },
  { id: "case-cyber-02", title: "Unauthorized USB device", category: "Cybersecurity", difficulty: "Foundation", scenario: "A contractor connects an unregistered USB device to a branch workstation to transfer a presentation.", capabilityTags: ["Endpoint Security", "Incident Reporting"] },
];

const genericActions = [
  { id: "pause", label: "Pause the activity and preserve relevant information", capability: "Risk Identification", points: 20 },
  { id: "verify", label: "Verify identity, authority and supporting evidence", capability: "Procedure", points: 25 },
  { id: "review", label: "Review profile, history and contextual risk", capability: "Risk Identification", points: 20 },
  { id: "escalate", label: "Use the approved escalation channel", capability: "Escalation", points: 25 },
  { id: "document", label: "Document the decision and evidence", capability: "Regulatory Reasoning", points: 10 },
  { id: "bypass", label: "Proceed because the customer or colleague is trusted", capability: "Procedure", points: 0, prohibited: true, penalty: 35 },
];

export const learningCases: LearningCase[] = [
  dailyCashCase,
  ...caseSeeds.map<LearningCase>((seed, index) => ({
    ...seed,
    roleRelevance: ["Relevant frontline employees", "Team managers"],
    estimatedTime: index % 3 === 0 ? "3 min" : "4 min",
    context: ["Current customer and transaction records are available.", "Use approved internal escalation routes."],
    actions: genericActions,
    expectedSequence: ["pause", "review", "verify", "escalate", "document"],
    keywords: {
      pause: ["pause", "hold", "stop"],
      review: ["review", "history", "context"],
      verify: ["verify", "evidence", "identity"],
      escalate: ["escalate", "compliance", "security", "manager"],
      document: ["document", "record"],
    },
    policyReferences: amlPolicyReferences.slice(0, 3),
    followUpRecommendation: `${seed.capabilityTags[0]} decision practice`,
    status: index === 3 ? "expert-review" : "published",
    aiGenerated: index === 3,
    version: "1.0",
  })),
];
