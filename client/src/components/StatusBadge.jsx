const styles = {
  ACTIVE:    'bg-green-100 text-green-800 ring-green-200',
  AT_RISK:   'bg-amber-100 text-amber-800 ring-amber-200',
  COMPLETED: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const labels = {
  ACTIVE: 'Active',
  AT_RISK: 'At Risk',
  COMPLETED: 'Completed',
};

export default function StatusBadge({ status }) {
  const cls = styles[status] || styles.ACTIVE;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {labels[status] || status}
    </span>
  );
}
