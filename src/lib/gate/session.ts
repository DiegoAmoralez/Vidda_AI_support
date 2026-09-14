const GATE_COOKIE = "vidda_site_gate";
const GATE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const getGateConfig = () => {
  const username = process.env.GATE_USERNAME?.trim() || "vidda.team";
  const password = process.env.GATE_PASSWORD?.trim() || "vidda.team.password";
  const secret =
    process.env.GATE_SECRET?.trim() ||
    process.env.GATE_PASSWORD?.trim() ||
    "vidda.team.password";

  return { username, password, secret };
};

const signPayload = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(signature);
};

export const createGateToken = async () => {
  const { secret } = getGateConfig();
  const expiresAt = Math.floor(Date.now() / 1000) + GATE_MAX_AGE_SECONDS;
  const payload = `vidda-gate:${expiresAt}`;
  const signature = await signPayload(payload, secret);
  return {
    token: `${expiresAt}.${signature}`,
    maxAge: GATE_MAX_AGE_SECONDS,
  };
};

export const isValidGateToken = async (token: string | undefined) => {
  if (!token) return false;
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) {
    return false;
  }

  const { secret } = getGateConfig();
  const expected = await signPayload(`vidda-gate:${expiresAt}`, secret);
  if (expected.length !== signature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
};

export const verifyGateCredentials = (username: string, password: string) => {
  const config = getGateConfig();
  return username === config.username && password === config.password;
};

export { GATE_COOKIE, GATE_MAX_AGE_SECONDS };
