"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ViddaMark } from "@/components/brand/vidda-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAiSettingsStore } from "@/store/ai-settings-store";

export default function AdminPage() {
  const neuralEnabled = useAiSettingsStore((state) => state.neuralEnabled);
  const setNeuralEnabled = useAiSettingsStore((state) => state.setNeuralEnabled);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/knowledge");
        const payload = (await response.json()) as { configured?: boolean };
        setConfigured(Boolean(payload.configured));
      } catch {
        setConfigured(false);
      }
    };
    void loadStatus();
  }, []);

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
          <h1 className="font-heading text-3xl font-extrabold tracking-[-0.04em] text-[var(--vidda-primary-dark)]">
            Admin
          </h1>
        </div>

        <Card className="shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="neural-toggle" className="text-sm font-extrabold">
                Neural network
              </Label>
              <Switch
                id="neural-toggle"
                checked={neuralEnabled}
                onCheckedChange={setNeuralEnabled}
                aria-label="Neural network"
                disabled={configured === false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
