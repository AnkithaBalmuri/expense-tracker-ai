import crypto from "crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";

export const SESSION_COOKIE = "expense_tracker_session";
const SESSION_DAYS = 14;

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, savedHash) {
  const [salt, storedHash] = String(savedHash || "").split(":");
  if (!salt || !storedHash) return false;
  const currentHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(currentHash, "hex"));
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId) {
  await connectToDatabase();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await Session.create({ userId, tokenHash: hashToken(token), expiresAt });
  return { token, expiresAt };
}

export async function getCurrentUser() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;

  const user = await User.findById(session.userId).lean();
  if (!user) return null;
  return { id: user._id.toString(), name: user.name, email: user.email };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export async function deleteCurrentSession() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await Session.deleteOne({ tokenHash: hashToken(token) });
}

export function sessionCookieOptions(expiresAt, request) {
  const forwardedProtocol = request?.headers?.get("x-forwarded-proto");
  const isHttps = forwardedProtocol === "https" || request?.url?.startsWith("https://");
  const host = request?.headers?.get("host") || "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  return {
    httpOnly: true,
    sameSite: "lax",
    // Vercel uses HTTPS while localhost development uses HTTP.
    secure: isHttps && !isLocalhost,
    path: "/",
    expires: expiresAt
  };
}
