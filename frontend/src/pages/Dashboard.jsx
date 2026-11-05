import { useEffect, useState } from "react";

import api from "../api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable, { money } from "../components/ExpenseTable";
import Navbar from "../components/Navbar";
import SpendingChart from "../components/SpendingChart";
import { useAuth } from "../context/AuthContext";

function monthRange(year, month) {
  const pad = (n) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start_date: `${year}-${pad(month)}-01`,
    end_date: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    category_totals: [],
  });

  async function loadDashboard() {
    const [categoriesResponse, transactionsResponse, summaryResponse] =
      await Promise.all([
        api.get("/categories"),
        api.get("/transactions", { params: monthRange(year, month) }),
        api.get("/analytics/monthly", { params: { year, month } }),
      ]);

    setCategories(categoriesResponse.data);
    setTransactions(transactionsResponse.data);
    setSummary(summaryResponse.data);
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  async function saveTransaction(data) {
    if (editing) {
      await api.put(`/transactions/${editing.id}`, data);
    } else {
      await api.post("/transactions", data);
    }

    setEditing(null);
    await loadDashboard();
  }

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    await api.delete(`/transactions/${id}`);
    await loadDashboard();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar email={user.email} onLogout={logout} />

      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Income", summary.income, "text-emerald-600"],
            ["Expenses", summary.expenses, "text-red-600"],
            ["Balance", summary.balance, "text-indigo-600"],
          ].map(([label, value, color]) => (
            <article key={label} className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>
                {money.format(Number(value))}
              </p>
            </article>
          ))}
        </section>

        <ExpenseForm
          categories={categories}
          editing={editing}
          onSave={saveTransaction}
          onCancel={() => setEditing(null)}
        />

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 font-bold">Spending by category</h2>
            <SpendingChart categoryTotals={summary.category_totals} />
          </article>

          <ExpenseTable
            transactions={transactions}
            onEdit={setEditing}
            onDelete={deleteTransaction}
          />
        </section>
      </div>
    </main>
  );
}
