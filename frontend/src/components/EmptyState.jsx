import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/* ── Status badge styles ──────────────────────────────────── */
export const statusStyle = (s) => {
  const map = {
    'Completed':   { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
    'In Progress': { background: '#F3F4F6', color: '#000000', border: '1px solid #E5E7EB' },
    'Delayed':     { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
    'Not Started': { background: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB' },
    'Pending':     { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
    'Review':      { background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' },
    'Active':      { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
    'Inactive':    { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
  };
  return map[s] || { background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' };
};

export const priorityStyle = (p) => {
  const map = {
    'Urgent': { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
    'High':   { background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' },
    'Medium': { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
    'Low':    { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
  };
  return map[p] || { background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' };
};

/* ── StatusBadge ─────────────────────────────────────────── */
export const StatusBadge = ({ status }) => (
  <span style={{ ...statusStyle(status), display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
    {status}
  </span>
);

/* ── PriorityBadge ───────────────────────────────────────── */
export const PriorityBadge = ({ priority }) => (
  <span style={{ ...priorityStyle(priority), display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
    {priority}
  </span>
);

/* ── Avatar ──────────────────────────────────────────────── */
const PALETTE = ['#111827','#16A34A','#D97706','#7C3AED','#0891B2','#DB2777','#EA580C'];
export const Avatar = ({ name = '', size = 32 }) => {
  const idx = name.charCodeAt(0) % PALETTE.length;
  const bg = PALETTE[idx];
  const ini = name.trim().charAt(0).toUpperCase();
  const fs  = size < 32 ? 10 : size < 44 ? 12 : 15;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg + '20', color: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 700, flexShrink: 0, border: `1px solid ${bg}30` }}>
      {ini}
    </div>
  );
};

/* ── PageHeader ──────────────────────────────────────────── */
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.2 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

/* ── SectionCard ─────────────────────────────────────────── */
export const SectionCard = ({ children, style = {} }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

/* ── EmptyState ──────────────────────────────────────────── */
const EmptyState = ({ title, description, actionText, onAction }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
    <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>{title}</h3>
    {description && <p style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 360, lineHeight: 1.6, marginBottom: actionText ? 24 : 0 }}>{description}</p>}
    {actionText && onAction && (
      <button onClick={onAction} style={{ height: 40, padding: '0 20px', background: '#111827', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {actionText}
      </button>
    )}
  </div>
);

export default EmptyState;
