import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createSession, hashPassword, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanName || !/^\S+@\S+\.\S+$/.test(cleanEmail) || String(password || "").length < 6) {
      return NextResponse.json({ message: "Enter your name, a valid email, and a password with at least 6 characters." }, { status: 400 });
    }

    await connectToDatabase();
    const exists = await User.exists({ email: cleanEmail });
    if (exists) return NextResponse.json({ message: "An account already exists for this email." }, { status: 409 });

    const user = await User.create({ name: cleanName, email: cleanEmail, passwordHash: hashPassword(password) });
    const { token, expiresAt } = await createSession(user._id);
    const response = NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email } }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt, request));
    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message || "Could not create account." }, { status: 500 });
  }
}
