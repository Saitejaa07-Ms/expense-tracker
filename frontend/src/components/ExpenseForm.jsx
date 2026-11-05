import { useEffect, useState } from "react";

const emptyForm = {
  description: "",
  amount: "",
  transaction_type: "expense",
  transaction_date: new Date().toISOString().slice(0, 10),
  category_id: "",
};

export default function ExpenseForm({
  categories,
  editing,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        description: editing.description,
        amount: editing.amount,
        transaction_type: editing.transaction_type,
        transaction_date: editing.transaction_date,
        category_id: String(editing.category_id),
      });
    } else {
      setForm({
        ...emptyForm,
        category_id: categories[0] ? String(categories[0].id) : "",
      });
    }
  }, [editing, categories]);

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await onSave({
        ...form,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
      });
    } catch (requestError) {
      setError(
        typeof requestError.response?.data?.detail === "string"
          ? requestError.response.data.detail
          : "Could not save transaction",
      );
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-2xl bg-white p-5 shadow md:grid-cols-2"
    >
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 md:col-span-2">
          {error}
        </p>
      )}

      <input
        required
        placeholder="Description"
        className="rounded-lg border p-3"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
      />

      <input
        required
        min="0.01"
        step="0.01"
        type="number"
        placeholder="Amount"
        className="rounded-lg border p-3"
        value={form.amount}
        onChange={(event) => setForm({ ...form, amount: event.target.value })}
      />

      <select
        className="rounded-lg border p-3"
        value={form.transaction_type}
        onChange={(event) =>
          setForm({ ...form, transaction_type: event.target.value })
        }
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <select
        required
        className="rounded-lg border p-3"
        value={form.category_id}
        onChange={(event) => setForm({ ...form, category_id: event.target.value })}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        required
        type="date"
        className="rounded-lg border p-3"
        value={form.transaction_date}
        onChange={(event) =>
          setForm({ ...form, transaction_date: event.target.value })
        }
      />

      <div className="flex gap-2">
        <button className="rounded-lg bg-indigo-600 px-5 py-3 text-white">
          {editing ? "Update" : "Add transaction"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-slate-200 px-5 py-3"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
