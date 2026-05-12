import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eventpass_admin";
const USER_COOKIE_NAME = "eventpass_user";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET env var is required and must be at least 16 characters");
  }
  return secret;
}

function base64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAdminToken(username: string): string {
  const body = base64url(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  );
  return `${body}.${sign(body)}`;
}

export function verifyAdminToken(token: string | undefined | null): { username: string } | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      u?: unknown;
      exp?: unknown;
    };
    if (typeof decoded.u !== "string" || typeof decoded.exp !== "number") return null;
    if (decoded.exp < Date.now()) return null;
    return { username: decoded.u };
  } catch {
    return null;
  }
}

export async function setAdminSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createAdminToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<{ username: string } | null> {
  const store = await cookies();
  return verifyAdminToken(store.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME, USER_COOKIE_NAME };

export function createUserToken(referenceCode: string): string {
  const body = base64url(
    JSON.stringify({ r: referenceCode, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  );
  return `${body}.${sign(body)}`;
}

export function verifyUserToken(token: string | undefined | null): { referenceCode: string } | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      r?: unknown;
      exp?: unknown;
    };
    if (typeof decoded.r !== "string" || typeof decoded.exp !== "number") return null;
    if (decoded.exp < Date.now()) return null;
    return { referenceCode: decoded.r };
  } catch {
    return null;
  }
}

export async function setUserSession(referenceCode: string): Promise<void> {
  const store = await cookies();
  store.set(USER_COOKIE_NAME, createUserToken(referenceCode), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearUserSession(): Promise<void> {
  const store = await cookies();
  store.delete(USER_COOKIE_NAME);
}

export async function getUserSession(): Promise<{ referenceCode: string } | null> {
  const store = await cookies();
  return verifyUserToken(store.get(USER_COOKIE_NAME)?.value);
}
