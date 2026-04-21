import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard.js';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardStat from '../components/DashboardStat.jsx';
import StageBadge from '../components/StageBadge.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  const { summary, fieldsPerAgent, recentLogs } = data;
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {isAdmin ? 'Admin Dashboard' : 'My Fields'}
        </h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? 'Overview of all fields across the farm.' : 'Fields assigned to you.'}
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <DashboardStat label={isAdmin ? 'Total Fields' : 'My Fields'} value={summary.total} />
        <DashboardStat label="Active" value={summary.active} accent="green" />
        <DashboardStat label="At Risk" value={summary.atRisk} accent="amber" />
        <DashboardStat label="Completed" value={summary.completed} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">By stage</h2>
        <div className="mt-2 flex flex-wrap gap-3">
          {Object.entries(summary.byStage).map(([stage, count]) => (
            <div key={stage} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <StageBadge stage={stage} />
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {isAdmin && fieldsPerAgent.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Fields per agent</h2>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white">
            {fieldsPerAgent.map((a) => {
              const max = Math.max(...fieldsPerAgent.map((x) => x.count), 1);
              const pct = (a.count / max) * 100;
              return (
                <div key={a.agentId} className="flex items-center gap-4 border-b border-slate-100 p-3 last:border-0">
                  <div className="w-48 shrink-0">
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-sm font-semibold">{a.count}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {recentLogs.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Recent activity</h2>
            <Link to="/fields" className="text-xs text-brand-700 hover:underline">View all fields →</Link>
          </div>
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {recentLogs.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                <div>
                  <Link to={`/fields/${log.field.id}`} className="font-medium text-slate-900 hover:underline">
                    {log.field.name}
                  </Link>
                  {log.stageBefore && log.stageAfter ? (
                    <span className="ml-2 text-slate-600">
                      {log.stageBefore} → <span className="font-medium">{log.stageAfter}</span>
                    </span>
                  ) : (
                    <span className="ml-2 text-slate-600">note added</span>
                  )}
                  {log.note && <p className="mt-0.5 text-xs text-slate-500">"{log.note}"</p>}
                </div>
                <div className="shrink-0 text-right text-xs text-slate-500">
                  <p>{log.agent.name}</p>
                  <p>{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
