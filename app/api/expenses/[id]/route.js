import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { toMonthKey } from "@/lib/helpers";
import { requireUser } from "@/lib/auth";
import Expense from "@/models/Expense";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount);
    const date = body.date ? new Date(body.date) : new Date();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Amount must be greater than zero." }, { status: 400 });
    }

    const expense = await Expense.findByIdAndUpdate(
      { _id: id, userId: user.id },
      {
        title: body.title || "",
        amount,
        category: body.category || "Other",
        date,
        month: toMonthKey(date)
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    if (error.message === "AUTH_REQUIRED") return NextResponse.json({ message: "Please sign in to update expenses." }, { status: 401 });
    return NextResponse.json({ message: error.message || "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectToDatabase();
    const user = await requireUser();
    const { id } = await params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: user.id });

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === "AUTH_REQUIRED") return NextResponse.json({ message: "Please sign in to delete expenses." }, { status: 401 });
    return NextResponse.json({ message: error.message || "Failed to delete expense" }, { status: 500 });
  }
}
