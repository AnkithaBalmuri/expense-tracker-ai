"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency, toMonthKey } from "@/lib/helpers";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const palette = ["#556b2f", "#7b8f4d", "#b4a14a", "#2f6b5f", "#8b6f47", "#4f6f8f", "#9aa17d"];

export default function Dashboard({ expenses, budget }) {
  const nowMonth = toMonthKey(new Date());
  const thisMonthExpenses = expenses.filter((expense) => expense.month === nowMonth);
  const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals = CATEGORIES.map((category) =>
    expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)
  );
  const highestIndex = categoryTotals.indexOf(Math.max(...categoryTotals, 0));
  const highestCategory = categoryTotals[highestIndex] > 0 ? CATEGORIES[highestIndex] : "None yet";

  const monthlyMap = expenses.reduce((map, expense) => {
    map.set(expense.month, (map.get(expense.month) || 0) + expense.amount);
    return map;
  }, new Map());
  const monthlyRows = [...monthlyMap.entries()].sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);

  const dailyMap = thisMonthExpenses.reduce((map, expense) => {
    const day = new Date(expense.date).toISOString().slice(0, 10);
    map.set(day, (map.get(day) || 0) + expense.amount);
    return map;
  }, new Map());
  const dailyRows = [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  const pieData = {
    labels: CATEGORIES,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: palette,
        borderColor: "#ffffff",
        borderWidth: 2
      }
    ]
  };

  const monthlyData = {
    labels: monthlyRows.map(([month]) => month),
    datasets: [
      {
        label: "Monthly spending",
        data: monthlyRows.map(([, total]) => total),
        backgroundColor: "#556b2f",
        borderRadius: 8
      }
    ]
  };

  const dailyData = {
    labels: dailyRows.map(([day]) => day.slice(5)),
    datasets: [
      {
        label: "Daily spending",
        data: dailyRows.map(([, total]) => total),
        borderColor: "#556b2f",
        backgroundColor: "rgba(85, 107, 47, 0.16)",
        tension: 0.35,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxWidth: 12,
          color: "#34451e",
          font: { weight: "bold" }
        }
      }
    },
    scales: {
      x: { ticks: { color: "#34451e" }, grid: { display: false } },
      y: { ticks: { color: "#34451e" }, grid: { color: "#e4ead9" } }
    }
  };

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric title="Spent this month" value={formatCurrency(totalThisMonth)} />
        <Metric title="Highest category" value={highestCategory} />
        <Metric title="Budget remaining" value={budget > 0 ? formatCurrency(Math.max(budget - totalThisMonth, 0)) : "Not set"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.05fr_1.05fr]">
        <ChartCard title="Category spending">
          {expenses.length ? <Pie data={pieData} options={{ ...options, scales: undefined }} /> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Monthly summary">
          {monthlyRows.length ? <Bar data={monthlyData} options={options} /> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Daily trend">
          {dailyRows.length ? <Line data={dailyData} options={options} /> : <EmptyChart />}
        </ChartCard>
      </div>
    </section>
  );
}

function Metric({ title, value }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#556b2f]">{title}</p>
      <p className="mt-1 break-words text-xl font-black text-[#17210f]">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card p-4">
      <h2 className="panel-title">{title}</h2>
      <div className="mt-3 h-56">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#c7d2b6] font-bold text-[#687653]">No data yet</div>;
}
