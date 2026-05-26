"use client";

import { CATEGORIES } from "@/lib/constants";

export default function Filters({ filters, setFilters }) {
  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="panel-title">Search and filter</h2>
        <button
          className="btn btn-outline px-4 py-2 text-sm"
          type="button"
          onClick={() => setFilters({ search: "", category: "All", month: "", startDate: "", endDate: "" })}
        >
          Reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.75fr_1.35fr]">
        <input
          className="field"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search title or merchant"
        />
        <select className="field" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
          <option>All</option>
          {CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <input className="field" type="month" value={filters.month} onChange={(event) => updateFilter("month", event.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="field" type="date" value={filters.startDate} onChange={(event) => updateFilter("startDate", event.target.value)} />
          <input className="field" type="date" value={filters.endDate} onChange={(event) => updateFilter("endDate", event.target.value)} />
        </div>
      </div>
    </section>
  );
}
