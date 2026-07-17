"use client";

import { AiCoachScreen } from "@/components/screens/ai-coach";
import { ComplianceOverview } from "@/components/screens/compliance-overview";
import {
  AiGovernanceScreen,
  AuditTrailScreen,
  ExecutiveDemoScreen,
  ReportsScreen,
  SettingsScreen,
} from "@/components/screens/enterprise-screens";
import {
  AchievementsScreen,
  KnowledgeAssistantScreen,
  MyCasesScreen,
  MyProgressScreen,
} from "@/components/screens/employee-support";
import { EmployeeHome } from "@/components/screens/employee-home";
import {
  CapabilitiesScreen,
  EmployeesScreen,
  RiskAnalyticsScreen,
  TeamsScreen,
} from "@/components/screens/people-analytics";
import {
  AiImprovementScreen,
  CampaignsScreen,
  DailyCasesScreen,
  KnowledgeBaseScreen,
  RegulatoryUpdatesScreen,
} from "@/components/screens/regulatory-workflows";

export const PortalScreen = ({ slug }: { slug: string }) => {
  switch (slug) {
    case "home":
      return <EmployeeHome />;
    case "ai-coach":
      return <AiCoachScreen />;
    case "my-cases":
      return <MyCasesScreen />;
    case "my-progress":
      return <MyProgressScreen />;
    case "knowledge-assistant":
      return <KnowledgeAssistantScreen />;
    case "achievements":
      return <AchievementsScreen />;
    case "overview":
      return <ComplianceOverview />;
    case "daily-cases":
      return <DailyCasesScreen />;
    case "knowledge-base":
      return <KnowledgeBaseScreen />;
    case "regulatory-updates":
      return <RegulatoryUpdatesScreen />;
    case "employees":
      return <EmployeesScreen />;
    case "teams":
      return <TeamsScreen />;
    case "capabilities":
      return <CapabilitiesScreen />;
    case "risk-analytics":
      return <RiskAnalyticsScreen />;
    case "campaigns":
      return <CampaignsScreen />;
    case "ai-improvement":
      return <AiImprovementScreen />;
    case "reports":
      return <ReportsScreen />;
    case "audit-trail":
      return <AuditTrailScreen />;
    case "ai-governance":
      return <AiGovernanceScreen />;
    case "settings":
      return <SettingsScreen />;
    case "executive-demo":
      return <ExecutiveDemoScreen />;
    default:
      return <ComplianceOverview />;
  }
};
