export default function DashboardStat({ label, value, accent = 'slate' }) {
  const accents = {
    slate:  'text-slate-900',
    green:  'text-green-700',
    amber:  'text-amber-700',
    blue:   'text-blue-700',
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accents[accent] || accents.slate}`}>{value}</p>
    </div>
  );
}
