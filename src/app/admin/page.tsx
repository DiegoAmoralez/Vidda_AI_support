"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ViddaMark } from "@/components/brand/vidda-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAiSettingsStore } from "@/store/ai-settings-store";

export default function AdminPage() {
  const neuralEnabled = useAiSettingsStore((state) => state.neuralEnabled);
  const setNeuralEnabled = useAiSettingsStore((state) => state.setNeuralEnabled);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [model, setModel] = useState("mistral-small-latest");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/knowledge");
        const payload = (await response.json()) as {
          configured?: boolean;
          model?: string;
        };
        setConfigured(Boolean(payload.configured));
        if (payload.model) setModel(payload.model);
      } catch {
        setConfigured(false);
      }
    };
    void loadStatus();
  }, []);

  const handleToggle = (enabled: boolean) => {
    setNeuralEnabled(enabled);
    toast.success(enabled ? "Neural answers enabled" : "Demo script answers only");
  };

  return (
    <main className="min-h-screen bg-[var(--vidda-background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <ViddaMark />
          <Button asChild variant="outline" size="sm">
            <Link href="/portal/knowledge-assistant">Back to assistant</Link>
          </Button>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
            Test controls
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.04em] text-[var(--vidda-primary-dark)]">
            Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Turn Mistral neural answers on or off for Knowledge Assistant tests.
          </p>
        </div>

        <Card className="shadow-none">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="neural-toggle" className="text-sm font-extrabold">
                  Neural network (Mistral)
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  When off, Knowledge Assistant uses local demo scripts only.
                  When on, it calls Mistral if the Vercel env key is set.
                </p>
              </div>
              <Switch
                id="neural-toggle"
                checked={neuralEnabled}
                onCheckedChange={handleToggle}
                aria-label="Toggle neural network"
              />
            </div>

            <div className="rounded-2xl border bg-secondary/40 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">Status</span>
                <Badge variant={neuralEnabled ? "default" : "secondary"}>
                  {neuralEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {configured === null ? (
                  <Badge variant="outline">Checking key…</Badge>
                ) : configured ? (
                  <Badge variant="outline" className="gap-1">
                    <Icon icon="solar:check-circle-linear" className="size-3.5" />
                    MISTRAL_API_KEY set
                  </Badge>
                ) : (
                  <Badge variant="destructive">MISTRAL_API_KEY missing</Badge>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Model: <span className="font-mono">{model}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                In Vercel → Project → Settings → Environment Variables add{" "}
                <span className="font-mono">MISTRAL_API_KEY</span>
                . Optional: <span className="font-mono">MISTRAL_MODEL</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
