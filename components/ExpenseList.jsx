"use client";

import { formatCurrency } from "@/lib/helpers";

export default function ExpenseList({ expenses, loading, onEdit, onDelete }) {
  const grouped = expenses.reduce((map, expense) => {
    if (!map[expense.month]) map[expense.month] = [];
    map[expense.month].push(expense);
    return map;
  }, {});

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[#d7dfca] bg-white px-4 py-3">
        <h2 className="panel-title">Expenses</h2>
        <span className="chip">{expenses.length} items</span>
      </div>

      {loading ? <p className="p-4 font-bold text-[#34451e]">Loading expenses...</p> : null}
      {!loading && expenses.length === 0 ? (
        <div className="m-4 rounded-lg border border-dashed border-[#c7d2b6] bg-white p-8 text-center font-bold text-[#687653]">No expenses match your filters.</div>
      ) : null}

      <div>
        {Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, items]) => (
            <div key={month}>
              <div className="flex items-center justify-between border-b border-[#d7dfca] bg-[#f7f9f2] px-4 py-2">
                <h3 className="text-sm font-black text-[#34451e]">{month}</h3>
                <span className="text-sm font-black text-[#556b2f]">{formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}</span>
              </div>
              <div className="divide-y divide-[#e3e9d8]">
                {items.map((expense) => (
                  <article key={expense._id} className="bg-white px-4 py-3 transition hover:bg-[#fbfcf8]">
                    <div className="grid gap-3 md:grid-cols-[1fr_150px_130px] md:items-center">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#17210f]">{expense.title || expense.category}</p>
                        <p className="mt-1 text-sm font-bold text-[#647052]">{new Date(expense.date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <span className="chip bg-white">{expense.category}</span>
                        <span className="font-black text-[#556b2f] md:hidden">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 md:justify-end">
                        <span className="hidden text-lg font-black text-[#556b2f] md:block">{formatCurrency(expense.amount)}</span>
                        <button className="btn btn-outline px-3 py-1.5 text-xs" type="button" onClick={() => onEdit(expense)}>
                          Edit
                        </button>
                        <button className="btn border-red-300 bg-white px-3 py-1.5 text-xs font-black text-red-700" type="button" onClick={() => onDelete(expense._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
