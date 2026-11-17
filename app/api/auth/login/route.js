import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createSession, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    await connectToDatabase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !verifyPassword(String(password || ""), user.passwordHash)) {
      return NextResponse.json({ message: "Email or password is incorrect." }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user._id);
    const response = NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt, request));
    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message || "Could not sign in." }, { status: 500 });
  }
}
