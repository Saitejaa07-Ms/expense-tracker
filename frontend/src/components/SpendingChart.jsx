import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const colors = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

export default function SpendingChart({ categoryTotals }) {
  if (!categoryTotals.length) {
    return (
      <div className="grid h-72 place-items-center text-slate-500">
        No expense data for this month.
      </div>
    );
  }

  const data = {
    labels: categoryTotals.map((item) => item.category),
    datasets: [
      {
        data: categoryTotals.map((item) => Number(item.total)),
        backgroundColor: categoryTotals.map(
          (_, index) => colors[index % colors.length],
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-sm">
      <Doughnut
        data={data}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
}
