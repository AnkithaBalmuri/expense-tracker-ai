import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: ["Food & Dining", "Petrol / Fuel", "Medicine", "Cab / Transport", "Shopping", "Bills", "Other"],
      default: "Other"
    },
    title: {
      type: String,
      trim: true,
      default: ""
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    month: {
      type: String,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
