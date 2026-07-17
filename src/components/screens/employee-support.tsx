"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { learningCases } from "@/data/cases";
import { useDemoStore } from "@/store/demo-store";

const employeeTrend = [
  { month: "Feb", score: 64 },
  { month: "Mar", score: 68 },
  { month: "Apr", score: 69 },
  { month: "May", score: 73 },
  { month: "Jun", score: 76 },
  { month: "Jul", score: 78 },
];

const radarData = [
  { capability: "KYC", score: 82 },
  { capability: "SoF", score: 75 },
  { capability: "EDD", score: 69 },
  { capability: "Escalation", score: 54 },
  { capability: "Sanctions", score: 81 },
  { capability: "Conduct", score: 86 },
];

export const MyCasesScreen = () => {
  const completedCases = useDemoStore((state) => state.completedCases);
  return (
    <Section title="My cases" eyebrow={`${completedCases} completed · 2 scheduled`} description="Your practical assessment history and upcoming adaptive cases.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {learningCases.slice(0, 9).map((learningCase, index) => (
          <Card key={learningCase.id} className="group shadow-none transition-transform hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{learningCase.category}</Badge>
                <span className="font-mono text-[10px] text-muted-foreground">{learningCase.estimatedTime}</span>
              </div>
              <h2 className="mt-5 min-h-12 text-base font-extrabold leading-6">{learningCase.title}</h2>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{learningCase.scenario}</p>
              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <span className="text-xs font-bold">{index < 6 ? `${68 + index * 4}%` : "Scheduled"}</span>
                <Button size="sm" variant="ghost" onClick={() => toast.info(`${learningCase.title} opened`)}>View case</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export const MyProgressScreen = () => {
  const score = useDemoStore((state) => state.capabilityScore);
  return (
    <Section title="My capability profile" eyebrow="Updated today" description="Scores show your ability to apply controls in practical situations, not course completion.">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="shadow-none"><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-extrabold">Readiness trend</p><p className="text-xs text-muted-foreground">Six-month capability signal</p></div><p className="metric-number text-3xl font-extrabold">{score}%</p></div><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={employeeTrend}><CartesianGrid vertical={false} stroke="#e5e9e4" /><XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} /><YAxis domain={[50, 100]} axisLine={false} tickLine={false} fontSize={11} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#173f3a" strokeWidth={3} dot={{ fill: "#cfef5b", stroke: "#173f3a", strokeWidth: 2 }} /></LineChart></ResponsiveContainer></div></CardContent></Card>
        <Card className="shadow-none"><CardContent className="p-6"><p className="text-sm font-extrabold">Capability balance</p><p className="text-xs text-muted-foreground">Current practical scores</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="capability" fontSize={10} /><Radar dataKey="score" stroke="#173f3a" fill="#cfef5b" fillOpacity={0.45} /></RadarChart></ResponsiveContainer></div></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ProgressCard title="KYC Procedure" score={82} change="+12%" />
        <ProgressCard title="Source of Funds" score={75} change="+7%" />
        <ProgressCard title="AML Escalation" score={54} change="-2%" attention />
      </div>
    </Section>
  );
};

export const KnowledgeAssistantScreen = () => {
  const [query, setQuery] = useState("");
  const [answered, setAnswered] = useState(false);
  const handleAsk = () => {
    if (!query.trim()) return;
    setAnswered(true);
  };
  return (
    <Section title="Knowledge Assistant" eyebrow="Grounded Q&A" description="Ask about approved internal policies. Answers always show their source and confidence.">
      <Card className="mx-auto max-w-4xl shadow-none">
        <CardContent className="p-6 sm:p-8">
          <div className="flex gap-3">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask: When must I pause a high-value cash transaction?" onKeyDown={(event) => event.key === "Enter" && handleAsk()} />
            <Button onClick={handleAsk} aria-label="Ask Knowledge Assistant"><Icon icon="solar:arrow-right-linear" /></Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["What changed in AML Policy v4.7?", "How does EDD affect my role?", "Compare old and new thresholds"].map((prompt) => <button key={prompt} onClick={() => setQuery(prompt)} className="rounded-full border px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:border-[var(--vidda-primary)] hover:text-foreground">{prompt}</button>)}
          </div>
          {answered ? (
            <div className="mt-8 rounded-2xl border bg-secondary/50 p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold"><Icon icon="solar:magic-stick-3-linear" className="text-[var(--vidda-primary)]" />Vidda grounded response</div>
              <p className="mt-4 text-sm leading-7">Under AML Policy v4.7, a high-value cash transaction that is inconsistent with the customer profile must remain pending while source-of-funds evidence is reviewed and the case is escalated through the approved Compliance channel.</p>
              <div className="mt-4 rounded-xl border-l-4 border-[var(--vidda-accent)] bg-white p-4"><p className="text-xs font-extrabold">Internal AML & CTF Policy · v4.7 · Section 8.3</p><p className="mt-1 text-[10px] text-muted-foreground">98% confidence · Effective 12 Jul 2026</p></div>
            </div>
          ) : (
            <div className="mt-12 py-12 text-center text-muted-foreground"><Icon icon="solar:notebook-bookmark-linear" className="mx-auto size-10 opacity-40" /><p className="mt-3 text-sm">Ask a policy question to see a cited answer.</p></div>
          )}
          <p className="mt-5 text-[10px] text-muted-foreground">The assistant does not replace authorized Compliance, Legal or Risk functions.</p>
        </CardContent>
      </Card>
    </Section>
  );
};

export const AchievementsScreen = () => (
  <Section title="Capability milestones" eyebrow="Private progress" description="Recognition supports learning consistency. It is not a public employee ranking.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["solar:flame-linear", "12-day practice rhythm", "Daily cases completed consistently"],
        ["solar:shield-check-linear", "KYC controls · Level 3", "Role benchmark reached"],
        ["solar:graph-up-linear", "Most improved capability", "KYC score increased by 12%"],
        ["solar:document-add-linear", "Policy update ready", "AML v4.7 reassessment started"],
      ].map(([icon, title, detail], index) => <Card key={title} className="shadow-none"><CardContent className="p-6"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--vidda-primary)] text-[var(--vidda-accent)]"><Icon icon={icon} className="size-6" /></span><Badge className="mt-6" variant={index === 3 ? "secondary" : "default"}>{index === 3 ? "In progress" : "Achieved"}</Badge><h2 className="mt-3 text-lg font-extrabold">{title}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p></CardContent></Card>)}
    </div>
  </Section>
);

const Section = ({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) => (
  <div className="space-y-7">
    <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>
    {children}
  </div>
);

const ProgressCard = ({ title, score, change, attention = false }: { title: string; score: number; change: string; attention?: boolean }) => <Card className="shadow-none"><CardContent className="p-5"><div className="flex justify-between"><p className="text-sm font-extrabold">{title}</p><Badge variant={attention ? "destructive" : "secondary"}>{change}</Badge></div><div className="mt-5 flex items-end justify-between"><p className="metric-number text-3xl font-extrabold">{score}%</p><span className="text-[10px] text-muted-foreground">Target 80%</span></div><Progress value={score} className="mt-3 h-1.5" /></CardContent></Card>;
