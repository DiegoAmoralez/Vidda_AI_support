import type { Metadata } from "next";
import { PortalScreen } from "@/components/screens/portal-screen";

type PortalSectionPageProps = {
  params: Promise<{ section: string }>;
};

export const metadata: Metadata = {
  title: "Capability Intelligence",
};

export default async function PortalSectionPage({
  params,
}: PortalSectionPageProps) {
  const { section } = await params;
  return <PortalScreen slug={section} />;
}
