import { useMemo, useState } from 'react';
import { useFields } from '../hooks/useFields.js';
import FieldCard from '../components/FieldCard.jsx';

const STATUSES = ['ALL', 'ACTIVE', 'AT_RISK', 'COMPLETED'];
const STAGES = ['ALL', 'PLANTED', 'GROWING', 'READY', 'HARVESTED'];

export default function Fields() {
  const { fields, loading, error } = useFields();
  const [status, setStatus] = useState('ALL');
  const [stage, setStage] = useState('ALL');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return fields.filter((f) => {
      if (status !== 'ALL' && f.status !== status) return false;
      if (stage !== 'ALL' && f.stage !== stage) return false;
      if (q && !(f.name.toLowerCase().includes(q.toLowerCase()) || f.cropType.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [fields, status, stage, q]);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Fields</h1>
          <p className="text-sm text-slate-500">{filtered.length} of {fields.length}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search name or crop…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-48"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s.replace('_', ' ')}</option>)}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            {STAGES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All stages' : s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No fields match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => <FieldCard key={f.id} field={f} />)}
        </div>
      )}
    </div>
  );
}
