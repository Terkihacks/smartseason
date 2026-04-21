import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useField } from '../hooks/useFields.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import StageBadge from '../components/StageBadge.jsx';

const STAGES = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

export default function FieldDetail() {
  const { id } = useParams();
  const { field, loading, error, reload } = useField(id);
  const { user } = useAuth();

  const [nextStage, setNextStage] = useState('');
  const [stageNote, setStageNote] = useState('');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!field) return null;

  const isAssigned = user.id === field.assignedAgentId;
  const canAct = user.role === 'ADMIN' || isAssigned;
  const currentIndex = STAGES.indexOf(field.stage);
  const forwardStages = STAGES.slice(currentIndex + 1);

  const onUpdateStage = async (e) => {
    e.preventDefault();
    setFeedback('');
    try {
      await api.patch(`/api/fields/${id}/stage`, { stage: nextStage, note: stageNote || undefined });
      setNextStage('');
      setStageNote('');
      await reload();
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Failed to update stage');
    }
  };

  const onAddNote = async (e) => {
    e.preventDefault();
    setFeedback('');
    try {
      await api.post(`/api/fields/${id}/notes`, { note });
      setNote('');
      await reload();
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Failed to add note');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/fields" className="text-xs text-brand-700 hover:underline">← All fields</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{field.name}</h1>
            <p className="text-sm text-slate-600">
              {field.cropType} · Planted {new Date(field.plantingDate).toLocaleDateString()} · {field.daysSincePlanting} days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge stage={field.stage} />
            <StatusBadge status={field.status} />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {field.assignedAgent ? `Assigned to ${field.assignedAgent.name} (${field.assignedAgent.email})` : 'Unassigned'}
        </p>
      </div>

      {feedback && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {feedback}
        </div>
      )}

      {canAct && forwardStages.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Advance stage</h2>
          <form onSubmit={onUpdateStage} className="mt-3 flex flex-wrap gap-2">
            <select value={nextStage} onChange={(e) => setNextStage(e.target.value)} required>
              <option value="">Select next stage…</option>
              {forwardStages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="text"
              placeholder="Optional note"
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <button
              type="submit"
              disabled={!nextStage}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Advance
            </button>
          </form>
        </section>
      )}

      {canAct && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Add note</h2>
          <form onSubmit={onAddNote} className="mt-3 space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Observation, issue, or general note…"
              rows={3}
              className="w-full"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add note
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Activity log</h2>
        {field.logs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {field.logs.map((log) => (
              <li key={log.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    {log.stageBefore && log.stageAfter ? (
                      <span>
                        <StageBadge stage={log.stageBefore} /> → <StageBadge stage={log.stageAfter} />
                      </span>
                    ) : (
                      <span className="text-slate-600">Note</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {log.agent.name} · {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                {log.note && <p className="mt-1 text-sm text-slate-700">{log.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
