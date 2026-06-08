import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ── Helpers ─────────────────────────────────────────────── */
const initials = (name = '') =>
  name.trim().charAt(0).toUpperCase();

const avatarColor = (role) => {
  if (role === 'Admin') return { background: 'rgba(17,24,39,0.18)', color: '#111827' };
  if (role === 'Team Leader') return { background: 'rgba(22,163,74,0.18)', color: '#16A34A' };
  return { background: 'rgba(217,119,6,0.18)', color: '#D97706' };
};

const navItems = [
  { path: '/',          label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Admin','Team Leader','Employee'] },
  { path: '/projects',  label: 'Projects',  icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', roles: ['Admin','Team Leader','Employee'] },
  { path: '/tasks',     label: 'Tasks',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['Admin','Team Leader','Employee'] },
  { path: '/clients',   label: 'Clients',   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['Admin'] },
  { path: '/teams',     label: 'Teams',     icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: ['Admin','Team Leader'] },
  { path: '/employees', label: 'Employees', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['Admin','Team Leader'] },
  { path: '/reports',   label: 'Reports',   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['Admin'] },
];

const NavIcon = ({ path, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

/* ── Layout ──────────────────────────────────────────────── */
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const allowed = navItems.filter((n) => user && n.roles.includes(user.role));
  const currentLabel = allowed.find((n) => n.path === location.pathname)?.label || 'Workspace';

  useEffect(() => {
    const fetchNotif = async () => {
      if (!user) return;
      try { const r = await api.get('/notifications'); setNotifications(r.data); } catch {}
    };
    fetchNotif();
    const t = setInterval(fetchNotif, 25000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;
  const markAll = async () => { try { await api.put('/notifications/read-all'); setNotifications((p) => p.map((n) => ({ ...n, isRead: true }))); } catch {} };
  const markOne = async (id) => { try { await api.put(`/notifications/${id}/read`); setNotifications((p) => p.map((n) => (n._id === id ? { ...n, isRead: true } : n))); } catch {} };

  const ini = initials(user?.name);
  const avClr = avatarColor(user?.role);

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>

      {/* ══ SIDEBAR ════════════════════════════════════════════ */}
      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)',
          minWidth: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)',
          background: 'var(--sidebar-bg)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1), min-width 0.2s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 200,
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Brand */}
        <div style={{ padding: collapsed ? '0' : '0 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--sidebar-border)', overflow: 'hidden', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SaaSFlow</div>
              <div style={{ fontSize: 10, color: 'var(--sidebar-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>PROJECT CRM</div>
            </div>
          )}
        </div>

        {/* Nav group */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '12px 8px' : '12px', paddingTop: 16 }}>
          {!collapsed && (
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--sidebar-muted)', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 8 }}>
              Menu
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {allowed.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '9px' : '9px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? 'var(--sidebar-active)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--sidebar-text)',
                    transition: 'all 0.15s ease',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13.5,
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {isActive && (
                    <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--primary)' }} />
                  )}
                  <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65, color: isActive ? '#FFFFFF' : 'inherit' }}>
                    <NavIcon path={item.icon} size={17} />
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid var(--sidebar-border)' }}>
          {collapsed ? (
            <div style={{ ...avClr, width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, margin: '0 auto', cursor: 'pointer' }} onClick={() => setShowLogoutModal(true)}>
              {ini}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'var(--bg-surface)' }}>
              <div style={{ ...avClr, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {ini}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>{user?.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--sidebar-muted)', marginTop: 1 }}>{user?.role}</div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Sign out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sidebar-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F87171'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--sidebar-muted)'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══ MAIN CONTENT ════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)', transition: 'margin-left 0.2s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Topbar */}
        <header style={{
          height: 64,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-xs)',
        }}>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 7, display: 'flex', alignItems: 'center', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          {/* Page title */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {location.pathname === '/' ? 'Dashboard' : currentLabel}
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Notification */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: unread ? 'var(--primary)' : 'var(--text-muted)', padding: '0 10px', borderRadius: 8, height: 34, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, position: 'relative' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unread > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 340, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-xl)', zIndex: 500, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</span>
                    {unread > 0 && <button onClick={markAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Mark all read</button>}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
                    ) : notifications.map((n) => (
                      <div key={n._id} onClick={() => !n.isRead && markOne(n._id)} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: n.isRead ? 'transparent' : 'var(--primary-soft)', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--primary-soft)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '2px 7px', borderRadius: 4 }}>{n.type}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ ...avClr, width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>
                {ini}
              </div>
              <div style={{ display: 'none' }} className="d-md-block">
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 28px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
      {/* ══ LOGOUT CONFIRMATION MODAL ══════════════════════════ */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: 380,
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease'
          }}>
            {/* Top accent bar */}
            <div style={{ height: 4, background: 'linear-gradient(90deg, #111827, #374151)' }} />

            <div style={{ padding: '28px 28px 24px' }}>
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: '#FEF2F2', border: '1px solid #FECACA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>

              {/* Text */}
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Sign out?</div>
              <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' }}>
                You're about to sign out of your account. Any unsaved changes will be lost.
              </p>

              {/* User info strip */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: '#F9FAFB',
                border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 24
              }}>
                <div style={{ ...avClr, width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {ini}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{user?.name}</div>
                  <div style={{ fontSize: 11.5, color: '#6B7280' }}>{user?.email}</div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1, height: 40, border: '1px solid #E5E7EB',
                    borderRadius: 10, background: '#fff',
                    fontSize: 13.5, fontWeight: 600, color: '#374151',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  Stay
                </button>
                <button
                  onClick={() => { setShowLogoutModal(false); logout(); navigate('/login'); }}
                  style={{
                    flex: 1, height: 40, border: 'none',
                    borderRadius: 10, background: '#111827',
                    fontSize: 13.5, fontWeight: 600, color: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#000'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
