import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function NewField() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    cropType: '',
    plantingDate: new Date().toISOString().slice(0, 10),
    assignedAgentId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/users?role=AGENT')
      .then(({ data }) => setAgents(data.users))
      .catch(() => setAgents([]));
  }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/fields', {
        name: form.name,
        cropType: form.cropType,
        plantingDate: form.plantingDate,
        assignedAgentId: form.assignedAgentId || null,
      });
      navigate(`/fields/${data.field.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Field</h1>
        <p className="text-sm text-slate-500">Create and optionally assign to an agent.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input name="name" value={form.name} onChange={onChange} required className="mt-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Crop type</label>
          <input name="cropType" value={form.cropType} onChange={onChange} required className="mt-1 w-full" placeholder="Maize, beans, tomato…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Planting date</label>
          <input name="plantingDate" type="date" value={form.plantingDate} onChange={onChange} required className="mt-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Assigned agent (optional)</label>
          <select name="assignedAgentId" value={form.assignedAgentId} onChange={onChange} className="mt-1 w-full">
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.email}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create field'}
          </button>
        </div>
      </form>
    </div>
  );
}
