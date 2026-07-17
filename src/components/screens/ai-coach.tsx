"use client";

import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ViddaMark } from "@/components/brand/vidda-mark";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { dailyCashCase } from "@/data/cases";
import { getAdaptiveDecision } from "@/lib/adaptive/rules";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const analysisSteps = [
  "Interpreting response",
  "Mapping actions to policy requirements",
  "Comparing answer with expected controls",
  "Evaluating decision sequence",
  "Calculating capability scores",
];

export const AiCoachScreen = () => {
  const {
    stage,
    setStage,
    answerText,
    setAnswerText,
    selectedActions,
    toggleAction,
    moveAction,
    contextQuestionCount,
    askContextQuestion,
    submitAnswer,
    result,
    finishSession,
  } = useDemoStore();
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    if (stage !== "analyzing") return;
    const interval = window.setInterval(() => {
      setAnalysisStep((current) => Math.min(current + 1, analysisSteps.length - 1));
    }, 430);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      submitAnswer();
    }, 2500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [stage, submitAnswer]);

  if (stage === "analyzing") {
    return <AnalysisState currentStep={analysisStep} />;
  }

  if (stage === "result" && result) {
    return <ResultState onContinue={() => setStage("recommendation")} />;
  }

  if (stage === "recommendation" && result) {
    return <RecommendationState onFinish={finishSession} />;
  }

  if (stage === "complete") {
    return <CompleteState onRestart={() => setStage("intro")} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">Daily case · AML / KYC</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Vidda AI Coach</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          Grounded in approved policy v4.7
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="min-h-[620px] overflow-hidden shadow-none">
          <div className="flex items-center gap-3 border-b bg-[var(--vidda-primary)] px-5 py-4 text-white">
            <ViddaMark compact inverse />
            <div>
              <p className="text-sm font-extrabold">Compliance Coach</p>
              <p className="text-[10px] text-white/50">Predefined reasoning simulation · Sources enabled</p>
            </div>
            <Badge className="ml-auto border-white/10 bg-white/10 text-white">Case 35</Badge>
          </div>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <CoachMessage>
              Good morning, Anna. Today’s scenario is based on the latest internal
              AML policy and recent changes to enhanced due diligence requirements.
            </CoachMessage>
            <div className="ml-0 rounded-2xl border bg-secondary/55 p-5 sm:ml-12">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Intermediate</Badge>
                <Badge variant="outline">4 minutes</Badge>
                <Badge variant="outline">Policy updated 5 days ago</Badge>
              </div>
              <h2 className="text-xl font-extrabold tracking-[-0.025em]">{dailyCashCase.title}</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{dailyCashCase.scenario}</p>
            </div>
            <div className="ml-12 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => toast.info("This case was selected by the adaptive learning engine")}
              >
                <span className="flex items-center gap-2 text-xs font-extrabold text-blue-900">
                  <Icon icon="solar:question-circle-linear" />
                  Why am I seeing this case?
                </span>
                <Icon icon="solar:alt-arrow-right-linear" />
              </button>
              <p className="mt-2 text-xs leading-5 text-blue-900/70">
                This case was selected because you previously hesitated during an AML
                escalation scenario and a related policy section was updated 5 days ago.
              </p>
            </div>
            {contextQuestionCount > 0 && (
              <>
                <div className="ml-auto w-fit max-w-[82%] rounded-2xl rounded-br-md bg-[var(--vidda-primary)] px-4 py-3 text-sm text-white">
                  Does the customer have any previous AML alerts?
                </div>
                <CoachMessage>
                  No previous AML alerts were registered. However, the transaction is
                  inconsistent with the customer’s historical activity.
                </CoachMessage>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-5 sm:p-6">
            <Tabs defaultValue="free">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="free">Free response</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="ask">Ask context</TabsTrigger>
              </TabsList>
              <TabsContent value="free" className="mt-5 space-y-4">
                <div>
                  <p className="text-sm font-extrabold">Describe your actions and reasoning</p>
                  <p className="mt-1 text-xs text-muted-foreground">The coach evaluates controls, sequence and regulatory reasoning.</p>
                </div>
                <Textarea
                  value={answerText}
                  onChange={(event) => setAnswerText(event.target.value)}
                  placeholder="Describe your actions and reasoning..."
                  className="min-h-64 resize-none leading-6"
                />
                <p className="text-right font-mono text-[10px] text-muted-foreground">{answerText.length} characters</p>
              </TabsContent>
              <TabsContent value="actions" className="mt-5">
                <p className="mb-4 text-xs leading-5 text-muted-foreground">
                  Select actions. The order becomes your decision sequence.
                </p>
                <div className="max-h-[390px] space-y-2 overflow-y-auto pr-1">
                  {dailyCashCase.actions.map((action) => {
                    const selectedIndex = selectedActions.indexOf(action.id);
                    return (
                      <div key={action.id} className={cn("flex items-center gap-3 rounded-xl border p-3", selectedIndex >= 0 && "border-[var(--vidda-primary)] bg-emerald-50/40")}>
                        <Checkbox
                          checked={selectedIndex >= 0}
                          onCheckedChange={() => toggleAction(action.id)}
                          aria-label={`Select ${action.label}`}
                        />
                        <span className="flex-1 text-xs font-medium leading-5">{action.label}</span>
                        {selectedIndex >= 0 && (
                          <div className="flex items-center gap-1">
                            <span className="grid size-6 place-items-center rounded-full bg-[var(--vidda-primary)] font-mono text-[10px] text-white">{selectedIndex + 1}</span>
                            <button aria-label="Move action up" className="rounded p-1 hover:bg-muted" onClick={() => moveAction(action.id, -1)}><Icon icon="solar:alt-arrow-up-linear" /></button>
                            <button aria-label="Move action down" className="rounded p-1 hover:bg-muted" onClick={() => moveAction(action.id, 1)}><Icon icon="solar:alt-arrow-down-linear" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="ask" className="mt-5 space-y-4">
                <div className="rounded-xl border bg-secondary/50 p-4">
                  <p className="text-xs font-extrabold">Available contextual question</p>
                  <p className="mt-2 text-sm">Does the customer have any previous AML alerts?</p>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={askContextQuestion} disabled={contextQuestionCount > 0}>
                  <Icon icon="solar:chat-round-dots-linear" />
                  {contextQuestionCount > 0 ? "Question answered in chat" : "Ask AI for context"}
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  The coach provides case facts but will not reveal the expected decision.
                </p>
              </TabsContent>
            </Tabs>
            <div className="mt-6 border-t pt-5">
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!answerText.trim() && selectedActions.length === 0}
                onClick={() => {
                  setAnalysisStep(0);
                  setStage("analyzing");
                }}
              >
                Submit for AI analysis
                <Icon icon="solar:magic-stick-3-linear" />
              </Button>
              <p className="mt-3 text-center text-[10px] leading-4 text-muted-foreground">
                AI-generated guidance is for training and does not replace an authorized Compliance decision.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CoachMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3">
    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--vidda-primary)] text-[var(--vidda-accent)]">
      <Icon icon="solar:magic-stick-3-linear" />
    </span>
    <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-secondary px-4 py-3 text-sm leading-6">{children}</div>
  </div>
);

const AnalysisState = ({ currentStep }: { currentStep: number }) => (
  <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
    <Card className="w-full overflow-hidden border-none bg-[var(--vidda-primary)] text-white shadow-xl">
      <CardContent className="p-8 sm:p-12">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-white/12 bg-white/[0.06]">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="grid size-12 place-items-center rounded-2xl bg-[var(--vidda-accent)] text-[var(--vidda-primary)]"
          >
            <Icon icon="solar:magic-stick-3-linear" className="size-6" />
          </motion.span>
        </div>
        <h1 className="mt-7 text-center text-3xl font-extrabold tracking-[-0.04em]">Analyzing your decision</h1>
        <p className="mt-2 text-center text-sm text-white/55">Grounding assessment in five approved sources</p>
        <div className="mt-9 space-y-3">
          {analysisSteps.map((step, index) => (
            <motion.div key={step} animate={{ opacity: index <= currentStep ? 1 : 0.35 }} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3">
              <span className={cn("grid size-6 place-items-center rounded-full border border-white/15 text-[10px]", index < currentStep && "border-[var(--vidda-accent)] bg-[var(--vidda-accent)] text-[var(--vidda-primary)]")}>
                {index < currentStep ? <Icon icon="solar:check-read-linear" /> : index + 1}
              </span>
              <span className="text-xs font-medium">{step}</span>
              {index === currentStep && <span className="ml-auto flex gap-1">{[0, 1, 2].map((dot) => <motion.span key={dot} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ repeat: Infinity, duration: 0.8, delay: dot * 0.15 }} className="size-1 rounded-full bg-[var(--vidda-accent)]" />)}</span>}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const ResultState = ({ onContinue }: { onContinue: () => void }) => {
  const result = useDemoStore((state) => state.result);
  if (!result) return null;
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-2xl bg-[var(--vidda-primary)] p-6 text-white sm:p-8">
        <div className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[var(--vidda-accent)]">Assessment complete · 94% confidence</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">{result.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">{result.feedback}</p>
          </div>
          <div className="flex size-32 flex-col items-center justify-center rounded-full border-[10px] border-[var(--vidda-accent)] bg-white/[0.04]">
            <span className="metric-number text-4xl font-extrabold">{result.overallScore}</span>
            <span className="text-[10px] text-white/50">out of 100</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <Card className="shadow-none">
          <CardContent className="p-6">
            <h2 className="text-lg font-extrabold">Capability scores</h2>
            <div className="mt-5 space-y-4">
              {result.capabilityScores.map((capability) => (
                <div key={capability.name}>
                  <div className="mb-1.5 flex justify-between text-xs"><span>{capability.name}</span><span className="font-mono font-bold">{capability.score}%</span></div>
                  <Progress value={capability.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <FeedbackList title="What you did well" icon="solar:check-circle-linear" tone="success" items={result.correctActions.length ? result.correctActions : ["You identified that the transaction is unusual.", "You requested supporting documentation.", "You reviewed the transaction history.", "You selected Enhanced Due Diligence."]} />
          <FeedbackList title="What requires attention" icon="solar:danger-triangle-linear" tone="warning" items={[
            ...result.missedActions.slice(0, 2),
            "The customer should not be informed that suspicious reporting may be considered.",
            "The final decision must follow the bank’s internal escalation procedure.",
          ]} />
        </div>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-6">
          <h2 className="text-lg font-extrabold">Recommended decision sequence</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {["Pause transaction processing", "Review profile and transaction history", "Request source-of-funds evidence", "Apply Enhanced Due Diligence", "Escalate to Compliance", "Follow the authorized decision"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--vidda-primary)] font-mono text-[10px] text-white">{index + 1}</span><span className="text-xs font-medium">{step}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-extrabold">Based on current policy</h2><p className="mt-1 text-xs text-muted-foreground">Every conclusion is linked to an approved source.</p></div>
            <Badge variant="secondary">5 sources</Badge>
          </div>
          <Accordion type="single" collapsible className="mt-4">
            {dailyCashCase.policyReferences.map((reference) => (
              <AccordionItem key={reference.id} value={reference.id}>
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex flex-1 items-center gap-3 text-left">
                    <Icon icon="solar:document-text-linear" className="size-4 text-[var(--vidda-primary)]" />
                    <span><span className="block text-sm font-bold">{reference.title}</span><span className="block text-[10px] font-normal text-muted-foreground">Version {reference.version} · Effective {reference.effectiveDate} · {reference.confidence}% confidence</span></span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-xl border-l-4 border-[var(--vidda-accent)] bg-secondary/60 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{reference.section}</p>
                    <mark className="mt-2 block bg-[var(--vidda-accent)]/25 text-sm leading-6 text-foreground">{reference.excerpt}</mark>
                    <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={() => toast.info(`${reference.title} opened in document preview`)}>
                      <Icon icon="solar:eye-linear" />View source
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-[10px] leading-5 text-amber-900">
            AI-generated guidance is provided for training purposes and does not replace an authorized Compliance decision.
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button size="lg" className="gap-2" onClick={onContinue}>View learning recommendation<Icon icon="solar:arrow-right-linear" /></Button></div>
    </div>
  );
};

const FeedbackList = ({ title, icon, tone, items }: { title: string; icon: string; tone: "success" | "warning"; items: string[] }) => (
  <Card className="shadow-none"><CardContent className="p-5"><h3 className={cn("flex items-center gap-2 text-sm font-extrabold", tone === "success" ? "text-emerald-800" : "text-amber-800")}><Icon icon={icon} />{title}</h3><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className="mt-2 size-1 shrink-0 rounded-full bg-current" />{item}</li>)}</ul></CardContent></Card>
);

const RecommendationState = ({ onFinish }: { onFinish: () => void }) => {
  const result = useDemoStore((state) => state.result);
  if (!result) return null;
  const decision = getAdaptiveDecision(result, 2);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">Adaptive learning plan</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">A focused follow-up, not another course.</h1></div>
      <Card className="overflow-hidden border-none bg-[var(--vidda-primary)] text-white shadow-none">
        <CardContent className="p-7 sm:p-9">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--vidda-accent)] text-[var(--vidda-primary)]"><Icon icon="solar:magic-stick-3-linear" className="size-5" /></span>
            <div><p className="text-sm font-extrabold">Coach recommendation</p><p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">You correctly identified the transaction as unusual, but your escalation sequence requires improvement. I have added a 3-minute follow-up exercise for tomorrow.</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none"><CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div><Badge>Recommended microlearning</Badge><h2 className="mt-4 text-2xl font-extrabold">Escalation Before Execution</h2><p className="mt-2 text-sm text-muted-foreground">{decision.reason}</p></div>
          <span className="rounded-full bg-secondary px-3 py-1.5 font-mono text-xs font-bold">3 min</span>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["Difficulty", decision.nextDifficulty], ["Scheduled", "Tomorrow, 09:00"], ["Capability", "AML Escalation"], ["Trigger", "Repeated uncertainty"]].map(([label, value]) => <div key={label} className="rounded-xl border p-4"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-xs font-extrabold">{value}</p></div>)}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={() => toast.success("Concept review opened")}>Review concept now</Button>
          <Button variant="outline" onClick={() => toast.success("Exercise scheduled for tomorrow at 09:00")}>Schedule for tomorrow</Button>
          <Button variant="ghost" onClick={() => toast.info("Ask the Knowledge Assistant from the sidebar")}>Ask AI a question</Button>
        </div>
      </CardContent></Card>
      <div className="flex justify-end"><Button size="lg" className="gap-2" onClick={onFinish}>Finish session<Icon icon="solar:check-read-linear" /></Button></div>
    </div>
  );
};

const CompleteState = ({ onRestart }: { onRestart: () => void }) => (
  <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
    <Card className="w-full shadow-none"><CardContent className="p-9 text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><Icon icon="solar:check-circle-linear" className="size-8" /></span><h1 className="mt-6 text-3xl font-extrabold">Session saved to your capability profile.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Your history, recommendation and team readiness signal are updated. The result remains available in My Cases.</p><div className="mt-7 flex justify-center gap-3"><Button variant="outline" onClick={onRestart}>Review case again</Button><Button onClick={() => window.location.assign("/portal/my-progress")}>View my progress</Button></div></CardContent></Card>
  </div>
);
