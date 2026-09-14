type Entry = [string, number];

type Props = {
  bySource: Entry[];
  byTransporter: Entry[];
  byKam: Entry[];
};

function BreakdownCard({ title, data }: { title: string; data: Entry[] }) {
  const max = data.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-4 space-y-3">
        {data.length === 0 && <p className="text-sm text-slate-400">No data</p>}
        {data.slice(0, 6).map(([label, count]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="truncate pr-2 text-slate-600" title={label}>
                {label}
              </span>
              <span className="font-semibold text-slate-900">{count}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BreakdownGrid({ bySource, byTransporter, byKam }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <BreakdownCard title="Escalations by Source" data={bySource} />
      <BreakdownCard title="Escalations by Transporter" data={byTransporter} />
      <BreakdownCard title="Escalations by KAM" data={byKam} />
    </div>
  );
}
