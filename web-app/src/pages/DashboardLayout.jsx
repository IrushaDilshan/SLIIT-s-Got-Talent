import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

export default function DashboardLayout() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const linkClass = ({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`;

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Sidebar navigation">
        <div className="sidebar-header">SLIIT's Got Talent</div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard/rankings" className={linkClass}>
            Rankings
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/dashboard/manage" className={linkClass}>
                Manage
              </NavLink>
              <NavLink to="/dashboard/categories" className={linkClass}>
                Categories
              </NavLink>
              <NavLink to="/dashboard/countdown" className={linkClass}>
                Countdown
              </NavLink>
            </>
          ) : null}
          <NavLink to="/dashboard/settings" className={linkClass}>
            Settings
          </NavLink>
        </nav>

        <div className="user-profile">
          <div className="user-avatar">{(user?.email?.[0] || 'U').toUpperCase()}</div>
          <div className="user-info">
            <div>{user?.email || 'Guest User'}</div>
            <div>{user?.role || 'student'}</div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
