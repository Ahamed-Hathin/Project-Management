import React, { useEffect } from 'react';

const ConfirmModal = ({ show, title, message, confirmText = 'Confirm', isDanger = false, onConfirm, onCancel }) => {
  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', width: '100%', maxWidth: 420, margin: '0 16px', overflow: 'hidden', animation: 'slideUp 0.2s ease' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: isDanger ? '#FEF2F2' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isDanger ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6 }}>{message}</p>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={{ height: 38, padding: '0 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#F9FAFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#fff'; }}
          >
            Cancel
          </button>
          <button onClick={onConfirm} style={{ height: 38, padding: '0 18px', background: isDanger ? '#DC2626' : '#111827', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: isDanger ? '0 2px 6px rgba(220,38,38,0.25)' : '0 2px 6px rgba(17,24,39,0.25)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDanger ? '#B91C1C' : '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.background = isDanger ? '#DC2626' : '#111827'}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
};

export default ConfirmModal;
