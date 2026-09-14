"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ViddaMark } from "@/components/brand/vidda-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "Unable to sign in.");
        setPending(false);
        return;
      }

      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Unable to sign in.");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Account</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-11 rounded-xl bg-white px-3"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-xl bg-white px-3"
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Checking…" : "Enter demo"}
      </Button>
    </form>
  );
}

export default function GatePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--vidda-background)] px-5 py-16 text-[var(--vidda-text-primary)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 vidda-grid" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-[var(--vidda-accent)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 size-[22rem] rounded-full bg-[var(--vidda-primary)]/8 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-[var(--vidda-border)] bg-white/90 p-8 shadow-sm backdrop-blur-md">
        <ViddaMark />
        <h1 className="font-heading mt-8 text-3xl font-bold tracking-[-0.03em] text-[var(--vidda-primary-dark)]">
          Private demo access
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This environment is invitation-only. Sign in with the Vidda team
          credentials to continue.
        </p>
        <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <GateForm />
        </Suspense>
      </div>
    </main>
  );
}
