"use client";

import { useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/Dashboard";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import Filters from "@/components/Filters";
import BillScanner from "@/components/BillScanner";
import { formatCurrency, formatDate, toMonthKey } from "@/lib/helpers";

const emptyExpense = {
  title: "",
  amount: "",
  category: "Other",
  date: formatDate(new Date())
};

export default function ExpenseApp() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyExpense);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    month: "",
    startDate: "",
    endDate: ""
  });
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedBudget = Number(localStorage.getItem("monthlyBudget") || 0);
    setBudget(savedBudget);
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filters]);

  async function loadExpenses() {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    try {
      const response = await fetch(`/api/expenses?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setExpenses(data.expenses || []);
    } catch (error) {
      setNotice(error.message || "Could not load expenses.");
    } finally {
      setLoading(false);
    }
  }

  async function saveExpense(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    try {
      const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setForm(emptyExpense);
      setEditingId(null);
      setNotice(editingId ? "Expense updated." : "Expense saved.");
      await loadExpenses();
    } catch (error) {
      setNotice(error.message || "Could not save expense.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(id) {
    const confirmed = window.confirm("Delete this expense?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setNotice("Expense deleted.");
      await loadExpenses();
    } catch (error) {
      setNotice(error.message || "Could not delete expense.");
    }
  }

  function startEdit(expense) {
    setEditingId(expense._id);
    setForm({
      title: expense.title || "",
      amount: expense.amount,
      category: expense.category,
      date: formatDate(expense.date)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyScannedExpense(scanned) {
    setForm({
      title: scanned.title || "",
      amount: scanned.amount || "",
      category: scanned.category || "Other",
      date: scanned.date || formatDate(new Date())
    });
    setNotice("OCR data is ready to review before saving.");
  }

  function updateBudget(value) {
    const next = Number(value || 0);
    setBudget(next);
    localStorage.setItem("monthlyBudget", String(next));
  }

  const thisMonth = toMonthKey(new Date());
  const thisMonthTotal = useMemo(
    () => expenses.filter((expense) => expense.month === thisMonth).reduce((sum, expense) => sum + expense.amount, 0),
    [expenses, thisMonth]
  );
  const budgetExceeded = budget > 0 && thisMonthTotal > budget;

  return (
    <main className="min-h-screen px-3 py-4 sm:px-5 lg:px-6">
      <section className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="card flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-[#17210f] sm:text-3xl">Olive Ledger</h1>
              <span className="chip">OCR + MongoDB</span>
            </div>
            <p className="mt-1 text-sm font-bold text-[#647052]">Track, scan, filter, and review expenses from one workspace.</p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-[360px]">
            <label className="label" htmlFor="budget">
              Monthly budget
            </label>
            <div className="flex items-center gap-2">
              <input
                id="budget"
                className="field"
                type="number"
                min="0"
                value={budget || ""}
                onChange={(event) => updateBudget(event.target.value)}
                placeholder="0"
              />
              <span className="min-w-fit rounded-lg border border-[#c7d2b6] bg-white px-3 py-2 text-sm font-black text-[#556b2f]">{formatCurrency(budget)}</span>
            </div>
          </div>
        </header>

        {notice ? <div className="card border-[#556b2f] bg-[#edf3e3] px-4 py-3 text-sm font-bold text-[#34451e]">{notice}</div> : null}
        {budgetExceeded ? (
          <div className="card border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            Budget alert: this month is at {formatCurrency(thisMonthTotal)}, above your {formatCurrency(budget)} budget.
          </div>
        ) : null}

        <section className="grid items-start gap-4 xl:grid-cols-[420px_1fr]">
          <div className="flex flex-col gap-4 xl:sticky xl:top-4">
            <ExpenseForm
              form={form}
              setForm={setForm}
              onSubmit={saveExpense}
              saving={saving}
              editingId={editingId}
              onCancel={() => {
                setEditingId(null);
                setForm(emptyExpense);
              }}
            />
            <BillScanner onApply={applyScannedExpense} />
          </div>
          <div className="flex flex-col gap-4">
            <Dashboard expenses={expenses} budget={budget} />
            <Filters filters={filters} setFilters={setFilters} />
            <ExpenseList expenses={expenses} loading={loading} onEdit={startEdit} onDelete={deleteExpense} />
          </div>
        </section>
      </section>
    </main>
  );
}
