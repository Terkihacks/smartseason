import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useFields } from '../hooks/useFields.js';

export default function Users() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fields, reload: reloadFields } = useFields();
  const [assigning, setAssigning] = useState({});

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users?role=AGENT');
      setAgents(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const assignField = async (fieldId, agentId) => {
    setAssigning((prev) => ({ ...prev, [fieldId]: true }));
    try {
      await api.post(`/api/fields/${fieldId}/assign`, { agentId: agentId || null });
      await Promise.all([loadAgents(), reloadFields()]);
    } finally {
      setAssigning((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Agents</h1>
        <p className="text-sm text-slate-500">Agents and their assigned fields.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Agents</h2>
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {agents.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-slate-500">{a.email}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {a._count.fields} fields
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Field assignments</h2>
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Crop</th>
                <th className="px-3 py-2">Assigned agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((f) => (
                <tr key={f.id}>
                  <td className="px-3 py-2 font-medium">{f.name}</td>
                  <td className="px-3 py-2 text-slate-600">{f.cropType}</td>
                  <td className="px-3 py-2">
                    <select
                      value={f.assignedAgentId || ''}
                      onChange={(e) => assignField(f.id, e.target.value)}
                      disabled={assigning[f.id]}
                      className="min-w-[200px]"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
