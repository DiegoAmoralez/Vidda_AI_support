export type KnowledgeAnswer = {
  answer: string;
  source: string;
  confidence: number;
  mode: "neural" | "demo";
};

const DEMO_ANSWERS: Array<{ match: RegExp; answer: KnowledgeAnswer }> = [
  {
    match: /edd|enhanced due diligence|affect my role/i,
    answer: {
      answer:
        "For your Retail Relationship Manager role, EDD applies when a customer or transaction shows heightened risk — for example cross-border activity, unusual cash volumes, or a profile mismatch. You must gather the required source-of-funds evidence, keep the transaction pending where policy requires it, and escalate through the approved Compliance channel. You do not approve or close high-risk exceptions alone.",
      source: "Internal AML & CTF Policy · v4.7 · Sections 6.2 & 8.3",
      confidence: 94,
      mode: "demo",
    },
  },
  {
    match: /compare|old|new|threshold/i,
    answer: {
      answer:
        "Policy v4.6 used a locally applied cash threshold. Policy v4.7 aligns the high-value cash trigger to EUR 100,000 equivalent and tightens escalation timing when activity is inconsistent with the customer profile. In practice: pause sooner, collect stronger source-of-funds evidence, and escalate through Compliance rather than completing the transaction on local judgment alone.",
      source: "Internal AML & CTF Policy · v4.7 · Section 8.3 · Change log",
      confidence: 96,
      mode: "demo",
    },
  },
  {
    match: /changed|v4\.7|aml policy/i,
    answer: {
      answer:
        "AML Policy v4.7 updates enhanced due diligence for high-value cash transactions: the threshold is EUR 100,000 equivalent, source-of-funds evidence is mandatory when activity differs from the customer profile, and escalation must follow the approved Compliance channel before the case can proceed.",
      source: "Internal AML & CTF Policy · v4.7 · Section 8.3",
      confidence: 98,
      mode: "demo",
    },
  },
];

const DEFAULT_DEMO_ANSWER: KnowledgeAnswer = {
  answer:
    "Under AML Policy v4.7, a high-value cash transaction that is inconsistent with the customer profile must remain pending while source-of-funds evidence is reviewed and the case is escalated through the approved Compliance channel.",
  source: "Internal AML & CTF Policy · v4.7 · Section 8.3",
  confidence: 91,
  mode: "demo",
};

export const getDemoKnowledgeAnswer = (question: string): KnowledgeAnswer => {
  const normalized = question.trim();
  const matched = DEMO_ANSWERS.find((entry) => entry.match.test(normalized));
  return matched ? { ...matched.answer } : { ...DEFAULT_DEMO_ANSWER };
};

export const KNOWLEDGE_PROMPTS = [
  "What changed in AML Policy v4.7?",
  "How does EDD affect my role?",
  "Compare old and new thresholds",
] as const;
