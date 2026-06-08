import React from 'react';

const LoadingSpinner = ({ text = 'Loading data…' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 16 }}>
    <div style={{ position: 'relative', width: 40, height: 40 }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: '3px solid #F3F4F6',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: '#111827',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
    <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{text}</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;
