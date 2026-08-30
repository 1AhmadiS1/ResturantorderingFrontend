import { titleCase } from "../utils/formatters";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-emerald-100 text-emerald-800",
  available: "bg-emerald-100 text-emerald-800",
  served: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
  inactive: "bg-red-100 text-red-700",
  occupied: "bg-rose-100 text-rose-700",
  reserved: "bg-blue-100 text-blue-700",
};

export function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status} inline-flex min-h-6 w-fit items-center justify-center rounded-full px-2.5 py-1 text-[0.68rem] leading-none font-bold capitalize ${statusStyles[status] || "bg-slate-100 text-slate-600"}`}>{titleCase(status)}</span>;
}
