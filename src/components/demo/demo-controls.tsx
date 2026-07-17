"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDemoStore } from "@/store/demo-store";

export const DemoControls = () => {
  const router = useRouter();
  const {
    resetDemo,
    simulateAnswer,
    triggerRegulatoryUpdate,
    generateCase,
    launchCampaign,
    completeCampaign,
    showRiskAlert,
  } = useDemoStore();

  const handleAction = (message: string, action: () => void, path?: string) => {
    action();
    toast.success(message);
    if (path) router.push(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Icon icon="solar:tuning-2-linear" className="size-4" />
          Demo controls
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Demo controls</SheetTitle>
          <SheetDescription>
            Run a controlled client presentation. Every action updates the same
            local demo state as the product flow.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 px-4 pb-8">
          <ControlGroup title="Scenario 1 · Employee daily case">
            <ControlButton
              label="Trigger daily case"
              icon="solar:play-circle-linear"
              onClick={() =>
                handleAction("Daily case is ready", () => simulateAnswer("partial"), "/portal/ai-coach")
              }
            />
            <ControlButton label="Simulate correct answer" onClick={() => handleAction("Correct answer loaded", () => simulateAnswer("correct"), "/portal/ai-coach")} />
            <ControlButton label="Simulate partial answer" onClick={() => handleAction("Partial answer loaded", () => simulateAnswer("partial"), "/portal/ai-coach")} />
            <ControlButton label="Simulate critical error" onClick={() => handleAction("Critical-error answer loaded", () => simulateAnswer("critical"), "/portal/ai-coach")} />
          </ControlGroup>
          <ControlGroup title="Scenario 2 · Risk detection">
            <ControlButton label="Show risk alert" onClick={() => handleAction("Risk alert displayed", showRiskAlert, "/portal/overview")} />
          </ControlGroup>
          <ControlGroup title="Scenario 3 · Regulatory update">
            <ControlButton label="Trigger regulatory update" onClick={() => handleAction("Policy v4.7 impact created", triggerRegulatoryUpdate, "/portal/regulatory-updates")} />
          </ControlGroup>
          <ControlGroup title="Scenario 4 · AI case generation">
            <ControlButton label="Generate AI case" onClick={() => handleAction("Draft case sent to expert review", generateCase, "/portal/ai-improvement")} />
          </ControlGroup>
          <ControlGroup title="Scenario 5 · Improvement measurement">
            <ControlButton label="Launch campaign" onClick={() => handleAction("Campaign launched", launchCampaign, "/portal/campaigns")} />
            <ControlButton label="Complete campaign" onClick={() => handleAction("Campaign completed: readiness +14%", completeCampaign, "/portal/campaigns")} />
          </ControlGroup>
          <Button
            variant="outline"
            className="mt-2 justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => {
              resetDemo();
              toast.success("Demo restored to initial state");
              router.push("/");
            }}
          >
            <Icon icon="solar:restart-linear" className="size-4" />
            Reset demo
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ControlGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="grid gap-2">
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {title}
    </p>
    {children}
  </section>
);

const ControlButton = ({
  label,
  icon = "solar:arrow-right-up-linear",
  onClick,
}: {
  label: string;
  icon?: string;
  onClick: () => void;
}) => (
  <Button
    variant="secondary"
    className="justify-between font-medium"
    onClick={onClick}
  >
    {label}
    <Icon icon={icon} className="size-4" />
  </Button>
);
