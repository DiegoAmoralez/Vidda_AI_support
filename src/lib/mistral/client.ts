type MistralChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: { message?: string };
};

export const extractMistralText = (content: MistralChatResponse["choices"]) => {
  const raw = content?.[0]?.message?.content;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw.map((part) => part.text ?? "").join("").trim();
  }
  return "";
};

export const parseJsonObject = <T extends Record<string, unknown>>(text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
};

export const callMistralJson = async ({
  system,
  user,
}: {
  system: string;
  user: string;
}) => {
  const apiKey = process.env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false as const, reason: "missing_key" as const };
  }

  const model = process.env.MISTRAL_MODEL ?? "mistral-small-latest";
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const payload = (await response.json()) as MistralChatResponse;
  if (!response.ok) {
    return {
      ok: false as const,
      reason: "request_failed" as const,
      message: payload.error?.message ?? `Mistral request failed (${response.status})`,
    };
  }

  const text = extractMistralText(payload.choices);
  const parsed = parseJsonObject<Record<string, unknown>>(text);
  if (!parsed) {
    return { ok: false as const, reason: "bad_payload" as const };
  }

  return { ok: true as const, data: parsed };
};
