import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import StageBadge from './StageBadge.jsx';

export default function FieldCard({ field }) {
  const planted = new Date(field.plantingDate).toLocaleDateString();
  return (
    <Link
      to={`/fields/${field.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-500 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{field.name}</h3>
          <p className="text-sm text-slate-600">{field.cropType}</p>
        </div>
        <StatusBadge status={field.status} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <StageBadge stage={field.stage} />
        <span className="text-xs text-slate-500">Planted {planted}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {field.assignedAgent ? `Agent: ${field.assignedAgent.name}` : 'Unassigned'}
        {' · '}
        {field.daysSincePlanting} days since planting
      </p>
    </Link>
  );
}
