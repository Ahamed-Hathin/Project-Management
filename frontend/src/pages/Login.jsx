import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demos = [
  { label: 'Admin',     email: 'admin@company.com',    password: 'admin123',    color: '#111827' },
  { label: 'TL 1',      email: 'tl1@company.com',  password: 'leader123',   color: '#16A34A' },
  { label: 'Employee',  email: 'emp1@company.com', password: 'employee123', color: '#D97706' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [touched, setTouched]   = useState({});

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwOk    = password.length >= 6;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!emailOk || !pwOk) return;
    setLoading(true); setError('');
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left Panel ─────────────────────────────────────── */}
      <div style={{
        width: '44%', background: '#0F172A', display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', position: 'relative', overflow: 'hidden',
      }} className="d-lg-flex flex-column">

        {/* Background grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(17,24,39,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: -100, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(17,24,39,0.12)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 38, height: 38, background: '#111827', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em' }}>SaaSFlow</div>
            <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.1em', fontWeight: 500 }}>PROJECT CRM</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 20 }}>
            Your projects,<br /><span style={{ color: '#60A5FA' }}>perfectly managed.</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
            A full-featured project management CRM built for modern teams. Track clients, projects, tasks, and performance — all in one place.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Client & project lifecycle management',
              'Role-based access — Admin, TL, Employee',
              'Real-time task tracking & work notes',
              'Revenue analytics & deadline monitoring',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(17,24,39,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 13.5, color: '#94A3B8' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, position: 'relative' }}>
          <p style={{ fontSize: 12.5, color: '#475569', fontStyle: 'italic' }}>"Clarity, accountability, and speed — for every project."</p>
        </div>
      </div>

      {/* ── Right Panel — Form ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} className="d-flex d-lg-none">
            <div style={{ width: 36, height: 36, background: '#111827', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>SaaSFlow CRM</span>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', marginBottom: 6 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Welcome back — access your workspace below.</p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span style={{ fontSize: 13.5, color: '#991B1B', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={submit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none', display: 'flex' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="you@company.com"
                  style={{
                    width: '100%', height: 44, border: `1px solid ${touched.email && !emailOk ? '#DC2626' : touched.email && emailOk ? '#16A34A' : '#E5E7EB'}`,
                    borderRadius: 10, paddingLeft: 40, paddingRight: 14, fontSize: 14, fontFamily: 'inherit',
                    color: '#111827', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#111827'; e.target.style.boxShadow = '0 0 0 3px rgba(17,24,39,0.12)'; }}
                />
              </div>
              {touched.email && !emailOk && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 5, fontWeight: 500 }}>Please enter a valid email address.</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none', display: 'flex' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 44, border: `1px solid ${touched.password && !pwOk ? '#DC2626' : touched.password && pwOk ? '#16A34A' : '#E5E7EB'}`,
                    borderRadius: 10, paddingLeft: 40, paddingRight: 44, fontSize: 14, fontFamily: 'inherit',
                    color: '#111827', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#111827'; e.target.style.boxShadow = '0 0 0 3px rgba(17,24,39,0.12)'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 2 }}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {touched.password && !pwOk && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 5, fontWeight: 500 }}>Password must be at least 6 characters.</div>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 44, background: loading ? '#93C5FD' : '#111827', border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s, transform 0.1s', boxShadow: '0 2px 6px rgba(17,24,39,0.3)',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#000000'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#111827'; }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/></svg>
                  Signing in…
                </>
              ) : 'Sign in to workspace'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.07em' }}>DEMO ACCOUNTS</span>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {demos.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.password); setTouched({}); setError(''); }}
                  style={{
                    flex: 1, height: 38, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
                    fontSize: 12.5, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.color = d.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: '#9CA3AF' }}>
            © 2025 SaaSFlow · Enterprise Project Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
