"use client";

import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ViddaMark } from "@/components/brand/vidda-mark";
import { Button } from "@/components/ui/button";
import type { DemoRole } from "@/domain/types";
import { useDemoStore } from "@/store/demo-store";

const capabilityNodes = [
  { icon: "solar:document-text-linear", label: "Regulation", meta: "Policy v4.7" },
  { icon: "solar:magic-stick-3-linear", label: "AI interpretation", meta: "14 controls mapped" },
  { icon: "solar:chat-round-dots-linear", label: "Practical case", meta: "Role-specific" },
  { icon: "solar:chart-2-linear", label: "Capability score", meta: "Continuous signal" },
];

export default function Home() {
  const router = useRouter();
  const setRole = useDemoStore((state) => state.setRole);

  const handleEnterDemo = (role: DemoRole, path: string) => {
    setRole(role);
    router.push(path);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--vidda-primary-dark)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-25 vidda-grid" />
      <div className="pointer-events-none absolute -right-40 -top-44 size-[38rem] rounded-full bg-[var(--vidda-accent)]/15 blur-3xl" />
      <header className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <ViddaMark inverse />
        <div className="hidden items-center gap-2 text-xs text-white/50 sm:flex">
          <span className="size-1.5 rounded-full bg-[var(--vidda-accent)]" />
          NordBank International · Simulated environment
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.17em] text-white/68">
            <Icon icon="solar:shield-check-linear" className="size-4 text-[var(--vidda-accent)]" />
            Continuous capability intelligence
          </p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.7rem]">
            Compliance capabilities that{" "}
            <span className="text-[var(--vidda-accent)]">evolve with regulation.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-white/62">
            Vidda Compliance AI Coach turns regulatory updates into daily practical
            learning, measurable capability insights and targeted risk reduction.
          </p>
          <p className="mt-4 text-sm font-bold text-white/90">
            From static compliance training to continuous capability development.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 bg-[var(--vidda-accent)] px-6 text-[var(--vidda-primary)] hover:-translate-y-0.5 hover:bg-[#daf777]"
              onClick={() => handleEnterDemo("employee", "/portal/home")}
            >
              Enter employee demo
              <Icon icon="solar:arrow-right-linear" className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/18 bg-white/[0.04] px-6 text-white hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
              onClick={() => handleEnterDemo("compliance", "/portal/overview")}
            >
              Enter compliance dashboard
            </Button>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-white/38">
            <Icon icon="solar:widget-add-linear" />
            Powered by Vidda Index and Vidda Automation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="relative lg:pb-16"
        >
          <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="rounded-[1.4rem] bg-[#f7f8f3] p-5 text-[var(--vidda-text-primary)] sm:p-7">
              <div className="flex items-center justify-between border-b pb-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-muted-foreground">Live capability loop</p>
                  <p className="mt-1 text-lg font-extrabold">Policy → behavior → evidence</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  Monitoring
                </span>
              </div>
              <div className="space-y-3 py-5">
                {capabilityNodes.map((node, index) => (
                  <motion.div
                    key={node.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + index * 0.07, duration: 0.25 }}
                    className="group flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-[var(--vidda-primary)] text-[var(--vidda-accent)]">
                      <Icon icon={node.icon} className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-extrabold">{node.label}</span>
                      <span className="block text-xs text-muted-foreground">{node.meta}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["78%", "Readiness"], ["1,248", "Assessed"], ["+9%", "90-day gain"]].map(([value, label]) => (
                  <div key={label} className="rounded-xl bg-[var(--vidda-primary)] p-3 text-white">
                    <p className="metric-number text-xl font-extrabold">{value}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-wide text-white/48">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 -left-5 hidden rounded-xl border border-white/12 bg-[#244943] px-4 py-3 shadow-xl lg:block">
            <p className="text-[10px] text-white/45">Latest signal</p>
            <p className="mt-1 flex items-center gap-2 text-xs font-bold">
              <Icon icon="solar:danger-triangle-linear" className="text-amber-300" />
              Escalation gap detected
            </p>
          </div>
        </motion.div>
      </section>
      <footer className="relative mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/10 px-5 py-5 text-[10px] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>This prototype uses simulated data and predefined AI responses.</p>
      </footer>
    </main>
  );
}
