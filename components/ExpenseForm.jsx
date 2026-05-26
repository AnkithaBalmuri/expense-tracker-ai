"use client";

import { CATEGORIES } from "@/lib/constants";

export default function ExpenseForm({ form, setForm, onSubmit, saving, editingId, onCancel }) {
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="panel-title">{editingId ? "Edit expense" : "Add expense"}</h2>
        {editingId ? (
          <button className="btn btn-outline px-4 py-2 text-sm" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1.5 label">
          Title
          <input
            className="field"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Merchant or note"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 label">
            Amount
            <input
              className="field"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="grid gap-1.5 label">
            Date
            <input
              className="field"
              required
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-1.5 label">
          Category
          <select className="field" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary mt-1" disabled={saving} type="submit">
          {saving ? "Saving..." : editingId ? "Update Expense" : "Save Expense"}
        </button>
      </form>
    </section>
  );
}
