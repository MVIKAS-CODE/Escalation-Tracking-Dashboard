export type FilterState = {
  from: string;
  to: string;
  customer: string;
  transporter: string;
  kam: string;
  source: string;
  status: string;
};

type Props = {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  sources: string[];
  statuses: string[];
  customers: string[];
  transporters: string[];
  kams: string[];
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

function Options({ values, selected }: { values: string[]; selected: string }) {
  return (
    <>
      <option value="">All</option>
      {values.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
      {/* Keep a saved value visible even if it was later deactivated */}
      {selected && !values.includes(selected) && (
        <option value={selected}>{selected} (inactive)</option>
      )}
    </>
  );
}

export default function Filters({
  filters,
  onChange,
  onReset,
  sources,
  statuses,
  customers,
  transporters,
  kams,
}: Props) {
  function set<K extends keyof FilterState>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Reset all
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>From (Escalation Date)</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => set("from", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>To (Escalation Date)</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => set("to", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Customer</label>
          <select
            value={filters.customer}
            onChange={(e) => set("customer", e.target.value)}
            className={inputClass}
          >
            <Options values={customers} selected={filters.customer} />
          </select>
        </div>
        <div>
          <label className={labelClass}>Transporter</label>
          <select
            value={filters.transporter}
            onChange={(e) => set("transporter", e.target.value)}
            className={inputClass}
          >
            <Options values={transporters} selected={filters.transporter} />
          </select>
        </div>
        <div>
          <label className={labelClass}>KAM</label>
          <select value={filters.kam} onChange={(e) => set("kam", e.target.value)} className={inputClass}>
            <Options values={kams} selected={filters.kam} />
          </select>
        </div>
        <div>
          <label className={labelClass}>Escalation Source</label>
          <select
            value={filters.source}
            onChange={(e) => set("source", e.target.value)}
            className={inputClass}
          >
            <Options values={sources} selected={filters.source} />
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputClass}
          >
            <Options values={statuses} selected={filters.status} />
          </select>
        </div>
      </div>
    </div>
  );
}
