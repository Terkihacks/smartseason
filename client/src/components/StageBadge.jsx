const styles = {
  PLANTED:   'bg-blue-100 text-blue-800 ring-blue-200',
  GROWING:   'bg-emerald-100 text-emerald-800 ring-emerald-200',
  READY:     'bg-yellow-100 text-yellow-800 ring-yellow-200',
  HARVESTED: 'bg-slate-200 text-slate-800 ring-slate-300',
};

const labels = {
  PLANTED: 'Planted',
  GROWING: 'Growing',
  READY: 'Ready',
  HARVESTED: 'Harvested',
};

export default function StageBadge({ stage }) {
  const cls = styles[stage] || styles.PLANTED;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {labels[stage] || stage}
    </span>
  );
}
