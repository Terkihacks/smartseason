import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkBase = 'rounded-md px-3 py-1.5 text-sm font-medium';
const linkInactive = 'text-slate-600 hover:bg-slate-100';
const linkActive = 'bg-brand-100 text-brand-700';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const link = ({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/dashboard" className="text-lg font-semibold text-brand-700">
          SmartSeason
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/fields" className={link}>Fields</NavLink>
          {user.role === 'ADMIN' && (
            <>
              <NavLink to="/admin/fields/new" className={link}>New Field</NavLink>
              <NavLink to="/admin/users" className={link}>Agents</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {user.name} <span className="rounded bg-slate-100 px-1.5 py-0.5">{user.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
