import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { toMonthKey } from "@/lib/helpers";
import Expense from "@/models/Expense";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const month = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const query = {};
    if (category && category !== "All") query.category = category;
    if (month) query.month = month;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    if (search) query.title = { $regex: search, $options: "i" };

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 }).lean();
    return NextResponse.json({ expenses });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Failed to load expenses" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const amount = Number(body.amount);
    const date = body.date ? new Date(body.date) : new Date();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Amount must be greater than zero." }, { status: 400 });
    }

    const expense = await Expense.create({
      title: body.title || "",
      amount,
      category: body.category || "Other",
      date,
      month: toMonthKey(date)
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Failed to create expense" }, { status: 500 });
  }
}
