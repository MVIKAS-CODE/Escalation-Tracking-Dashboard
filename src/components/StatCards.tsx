type Props = {
  stats: { total: number; resolved: number; pending: number; overdue: number };
};

const cards = [
  { key: "total", label: "Total Escalations", accent: "text-slate-900", ring: "ring-slate-200", chip: "bg-slate-100 text-slate-600" },
  { key: "resolved", label: "Resolved", accent: "text-emerald-600", ring: "ring-emerald-200", chip: "bg-emerald-50 text-emerald-600" },
  { key: "pending", label: "Pending / Not Resolved", accent: "text-amber-600", ring: "ring-amber-200", chip: "bg-amber-50 text-amber-600" },
  { key: "overdue", label: "Overdue / Delayed", accent: "text-rose-600", ring: "ring-rose-200", chip: "bg-rose-50 text-rose-600" },
] as const;

export default function StatCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`rounded-xl bg-white p-5 shadow-sm ring-1 ${c.ring}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className={`mt-2 text-3xl font-bold ${c.accent}`}>{stats[c.key]}</p>
        </div>
      ))}
    </div>
  );
}
