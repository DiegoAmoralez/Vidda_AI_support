import type { DemoRole, DemoUser } from "@/domain/types";

export type NavigationItem = {
  label: string;
  slug: string;
  icon: string;
};

export const demoUsers: Record<DemoRole, DemoUser> = {
  employee: {
    id: "emp-anna",
    name: "Anna Kowalska",
    email: "anna.kowalska@nordbank.demo",
    role: "employee",
    jobTitle: "Relationship Manager",
    department: "Corporate Banking",
    branch: "Warsaw Branch",
    country: "Poland",
    initials: "AK",
  },
  compliance: {
    id: "usr-michael",
    name: "Michael Berger",
    email: "michael.berger@nordbank.demo",
    role: "compliance",
    jobTitle: "Head of Compliance Learning",
    department: "Risk & Compliance",
    branch: "Vienna HQ",
    country: "Austria",
    initials: "MB",
  },
  capability: {
    id: "usr-elena",
    name: "Elena Rossi",
    email: "elena.rossi@nordbank.demo",
    role: "capability",
    jobTitle: "Capability Development Lead",
    department: "People & Capability",
    branch: "Frankfurt Office",
    country: "Germany",
    initials: "ER",
  },
  administrator: {
    id: "usr-lars",
    name: "Lars Nyström",
    email: "lars.nystrom@nordbank.demo",
    role: "administrator",
    jobTitle: "Platform Administrator",
    department: "Technology",
    branch: "Stockholm Office",
    country: "Sweden",
    initials: "LN",
  },
};

export const employeeNavigation: NavigationItem[] = [
  { label: "Home", slug: "home", icon: "solar:home-angle-linear" },
  { label: "AI Coach", slug: "ai-coach", icon: "solar:chat-round-dots-linear" },
  { label: "My Cases", slug: "my-cases", icon: "solar:case-round-linear" },
  { label: "My Progress", slug: "my-progress", icon: "solar:chart-2-linear" },
  {
    label: "Knowledge Assistant",
    slug: "knowledge-assistant",
    icon: "solar:notebook-bookmark-linear",
  },
  {
    label: "Achievements",
    slug: "achievements",
    icon: "solar:medal-ribbons-star-linear",
  },
];

export const officerNavigation: NavigationItem[] = [
  { label: "Overview", slug: "overview", icon: "solar:widget-5-linear" },
  { label: "AI Coach", slug: "ai-coach", icon: "solar:chat-round-dots-linear" },
  { label: "Daily Cases", slug: "daily-cases", icon: "solar:case-round-linear" },
  {
    label: "Knowledge Base",
    slug: "knowledge-base",
    icon: "solar:library-linear",
  },
  {
    label: "Regulatory Updates",
    slug: "regulatory-updates",
    icon: "solar:refresh-circle-linear",
  },
  { label: "Employees", slug: "employees", icon: "solar:users-group-rounded-linear" },
  { label: "Teams", slug: "teams", icon: "solar:buildings-2-linear" },
  { label: "Capabilities", slug: "capabilities", icon: "solar:graph-up-linear" },
  { label: "Risk Analytics", slug: "risk-analytics", icon: "solar:shield-warning-linear" },
  { label: "Learning Campaigns", slug: "campaigns", icon: "solar:flag-2-linear" },
  { label: "AI Improvement", slug: "ai-improvement", icon: "solar:magic-stick-3-linear" },
  { label: "Reports", slug: "reports", icon: "solar:document-text-linear" },
  { label: "Audit Trail", slug: "audit-trail", icon: "solar:history-linear" },
  { label: "AI Governance", slug: "ai-governance", icon: "solar:shield-check-linear" },
  { label: "Settings", slug: "settings", icon: "solar:settings-linear" },
];

export const getNavigation = (role: DemoRole) =>
  role === "employee" ? employeeNavigation : officerNavigation;
