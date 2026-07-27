import { NextResponse } from "next/server";
import { getDemoKnowledgeAnswer } from "@/lib/knowledge/demo-answers";

export const runtime = "nodejs";

type MistralChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: { message?: string };
};

const SYSTEM_PROMPT = `You are Vidda Knowledge Assistant for NordBank International's compliance demo.
Answer only from the approved internal AML & CTF Policy v4.7 context below.
Be concise, practical, and role-aware for a Retail Relationship Manager.
If the question is outside this policy, say what is missing and stay conservative.

Policy context:
- Effective 12 Jul 2026.
- High-value cash threshold: EUR 100,000 equivalent (was local-rule based in v4.6).
- If cash activity is inconsistent with the customer profile, keep the transaction pending.
- Collect source-of-funds evidence and escalate via the approved Compliance channel.
- EDD triggers include cross-border exposure, unusual volumes, and profile mismatch.
- Employees must not tip off the customer or close high-risk exceptions alone.

Respond in JSON only with keys:
answer (string), source (string), confidence (number 0-100).`;

const extractText = (content: MistralChatResponse["choices"]) => {
  const raw = content?.[0]?.message?.content;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw.map((part) => part.text ?? "").join("").trim();
  }
  return "";
};

const parseModelJson = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as {
      answer?: string;
      source?: string;
      confidence?: number;
    };
  } catch {
    return null;
  }
};

export async function GET() {
  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  return NextResponse.json({
    configured: Boolean(apiKey),
    model: process.env.MISTRAL_MODEL ?? "mistral-small-latest",
    runtime: process.env.VERCEL ? "vercel" : "local",
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    question?: string;
    neuralEnabled?: boolean;
  } | null;

  const question = body?.question?.trim() ?? "";
  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (body?.neuralEnabled === false) {
    return NextResponse.json(getDemoKnowledgeAnswer(question));
  }

  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      ...getDemoKnowledgeAnswer(question),
      warning: "MISTRAL_API_KEY is not configured. Using demo answer.",
    });
  }

  const model = process.env.MISTRAL_MODEL ?? "mistral-small-latest";

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
      }),
    });

    const payload = (await response.json()) as MistralChatResponse;
    if (!response.ok) {
      return NextResponse.json({
        ...getDemoKnowledgeAnswer(question),
        warning:
          payload.error?.message ??
          `Mistral request failed (${response.status}). Using demo answer.`,
      });
    }

    const text = extractText(payload.choices);
    const parsed = parseModelJson(text);
    if (!parsed?.answer) {
      return NextResponse.json({
        ...getDemoKnowledgeAnswer(question),
        warning: "Model returned an unreadable payload. Using demo answer.",
      });
    }

    return NextResponse.json({
      answer: parsed.answer,
      source:
        parsed.source ?? "Internal AML & CTF Policy · v4.7 · Section 8.3",
      confidence: Math.max(
        0,
        Math.min(100, Number(parsed.confidence ?? 90)),
      ),
      mode: "neural" as const,
    });
  } catch {
    return NextResponse.json({
      ...getDemoKnowledgeAnswer(question),
      warning: "Mistral request failed. Using demo answer.",
    });
  }
}
