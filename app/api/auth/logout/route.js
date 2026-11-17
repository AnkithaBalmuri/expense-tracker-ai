import { NextResponse } from "next/server";
import { deleteCurrentSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  try {
    await deleteCurrentSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message || "Could not sign out." }, { status: 500 });
  }
}
