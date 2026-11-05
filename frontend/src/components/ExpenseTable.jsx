export const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export default function ExpenseTable({ transactions, onEdit, onDelete }) {
  return (
    <article className="overflow-x-auto rounded-2xl bg-white p-5 shadow lg:col-span-2">
      <h2 className="mb-4 font-bold">Transactions</h2>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-3">Date</th>
            <th className="p-3">Description</th>
            <th className="p-3">Category</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan="5" className="p-6 text-center text-slate-500">
                No transactions yet this month.
              </td>
            </tr>
          )}

          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b">
              <td className="p-3">{transaction.transaction_date}</td>
              <td className="p-3">{transaction.description}</td>
              <td className="p-3">{transaction.category.name}</td>
              <td
                className={`p-3 font-semibold ${
                  transaction.transaction_type === "income"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {transaction.transaction_type === "income" ? "+" : "-"}
                {money.format(Number(transaction.amount))}
              </td>
              <td className="space-x-2 p-3">
                <button
                  className="text-indigo-600"
                  onClick={() => onEdit(transaction)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => onDelete(transaction.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
