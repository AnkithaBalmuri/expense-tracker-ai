import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connection = await connectToDatabase();
    return NextResponse.json({ status: "ok", database: connection.connection.name });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Database connection failed." }, { status: 503 });
  }
}
