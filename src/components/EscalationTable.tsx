import type { Escalation } from "@/lib/types";

type Props = {
  rows: Escalation[];
  loading: boolean;
  today: string;
  onEdit: (row: Escalation) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (row: Escalation) => void;
};

function fmt(d: string | null) {
  if (!d) return "—";
  return d;
}

function sourceBadge(source: string) {
  const map: Record<string, string> = {
    WhatsApp: "bg-green-50 text-green-700 ring-green-200",
    Email: "bg-blue-50 text-blue-700 ring-blue-200",
    Call: "bg-purple-50 text-purple-700 ring-purple-200",
  };
  return map[source] ?? "bg-slate-50 text-slate-700 ring-slate-200";
}

export default function EscalationTable({
  rows,
  loading,
  today,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Escalations {!loading && <span className="text-slate-400">({rows.length})</span>}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">AWB</th>
              <th className="px-4 py-3 font-medium">Transporter</th>
              <th className="px-4 py-3 font-medium">KAM</th>
              <th className="px-4 py-3 font-medium">Esc. Date</th>
              <th className="px-4 py-3 font-medium">Exp. Delivery</th>
              <th className="px-4 py-3 font-medium">Vendor Exp.</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Remark</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-slate-400">
                  No escalations found. Try adjusting filters or add a new one.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => {
                const overdue =
                  r.status !== "Resolved" &&
                  !!r.expectedDeliveryDate &&
                  r.expectedDeliveryDate < today;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.awbNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{r.transporterName}</td>
                    <td className="px-4 py-3 text-slate-600">{r.kamName}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(r.escalationDate)}</td>
                    <td className="px-4 py-3">
                      <span className={overdue ? "font-semibold text-rose-600" : "text-slate-600"}>
                        {fmt(r.expectedDeliveryDate)}
                        {overdue && <span className="ml-1 text-xs">⚠</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmt(r.vendorExpectedDeliveryDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${sourceBadge(r.escalationSource)}`}>
                        {r.escalationSource}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-slate-600">
                      <span className="line-clamp-2" title={r.escalationIssue}>
                        {r.escalationIssue}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3 text-slate-500">
                      <span className="line-clamp-2" title={r.remark ?? ""}>
                        {r.remark || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleStatus(r)}
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition ${
                          r.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {r.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(r)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
