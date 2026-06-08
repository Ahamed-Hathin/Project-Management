import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState, { Avatar } from '../components/EmptyState';
import UserModal from '../components/UserModal';
import ConfirmModal from '../components/ConfirmModal';

const Employees = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); 
  const [directory, setDirectory] = useState([]);
  const [dirLoading, setDirLoading] = useState(true);
  const [performance, setPerformance] = useState([]);
  const [perfLoading, setPerfLoading] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const fetchDirectory = async () => {
    try { setDirLoading(true); const res = await api.get('/users'); setDirectory(res.data); } catch (e) { console.error(e); } finally { setDirLoading(false); }
  };

  const fetchPerformance = async () => {
    try { setPerfLoading(true); const res = await api.get('/reports/employees'); setPerformance(res.data); } catch (e) { console.error(e); } finally { setPerfLoading(false); }
  };

  useEffect(() => { fetchDirectory(); }, []);
  useEffect(() => { if (activeTab === 'performance') fetchPerformance(); }, [activeTab]);

  const handleOpenAdd = () => { setSelectedStaff(null); setShowUserModal(true); };
  const handleOpenEdit = (staff) => { setSelectedStaff(staff); setShowUserModal(true); };
  const handleOpenDelete = (staff) => { setStaffToDelete(staff); setShowConfirmModal(true); };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/users/${staffToDelete._id}`);
      setDirectory((prev) => prev.filter((s) => s._id !== staffToDelete._id));
      setShowConfirmModal(false);
    } catch (e) { alert(e.response?.data?.message || 'Failed to remove user'); }
  };

  const handleSaveSuccess = () => { fetchDirectory(); if (activeTab === 'performance') fetchPerformance(); };
  const isAdmin = user?.role === 'Admin';

  const SvgIcon = ({ d, size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>Staff & Performance</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Browse directory, assign roles, and monitor team performance.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} style={{ height: 36, padding: '0 14px', background: '#111827', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(17,24,39,0.25)' }}>
            <SvgIcon d="M12 5v14M5 12h14" color="#fff" size={14} />
            Add Staff
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
        {[
          { id: 'directory', label: 'Staff Directory', icon: 'bi-person-badge' },
          { id: 'performance', label: 'Performance Metrics', icon: 'bi-graph-up' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '0 0 12px 0', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #111827' : '2px solid transparent', color: activeTab === tab.id ? '#111827' : '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
            <i className={tab.icon} style={{ color: activeTab === tab.id ? '#111827' : '#9CA3AF' }} />
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {activeTab === 'directory' ? (
          <div style={{ overflowX: 'auto' }}>
            {dirLoading ? <LoadingSpinner /> : !directory.length ? (
              <EmptyState title="Directory Empty" description="Provision staff accounts to register employees and team leaders." />
            ) : (
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Staff Member</th>
                    <th>Contact</th>
                    <th style={{ textAlign: 'center' }}>Role</th>
                    {isAdmin && <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {directory.map(s => (
                    <tr key={s._id}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={s.name} size={32} />
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{s.name}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 13, color: '#4B5563' }}>{s.email}</span>
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{s.phone || '—'}</span>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: '3px 12px', borderRadius: 20, minWidth: 100,
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                          background: s.role === 'Admin' ? '#111827' : s.role === 'Team Leader' ? '#EFF6FF' : '#F5F3FF',
                          color: s.role === 'Admin' ? '#fff' : s.role === 'Team Leader' ? '#1D4ED8' : '#6D28D9',
                          border: s.role === 'Admin' ? 'none' : s.role === 'Team Leader' ? '1px solid #BFDBFE' : '1px solid #DDD6FE',
                        }}>
                          {s.role}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right', paddingRight: 24 }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                            <button onClick={() => handleOpenEdit(s)} title="Edit" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.color = '#111827'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                            >
                              <SvgIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={13} />
                            </button>
                            {s._id !== user._id && (
                              <button onClick={() => handleOpenDelete(s)} title="Delete" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                              >
                                <SvgIcon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {perfLoading ? <LoadingSpinner /> : !performance.length ? (
              <EmptyState title="No Performance Metrics" description="Metrics are compiled based on tasks assigned to employee profiles." />
            ) : (
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Employee</th>
                    <th>Projects</th>
                    <th>Tasks (Done / Active / Backlog)</th>
                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map(perf => (
                    <tr key={perf.employeeId}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={perf.name} size={32} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{perf.name}</div>
                            <div style={{ fontSize: 11.5, color: '#6B7280' }}>{perf.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F3F4F6', color: '#374151', fontSize: 12, fontWeight: 600 }}>{perf.projectsCount} active</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 600 }}>{perf.completedTasks} Done</span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F3F4F6', color: '#000000', fontSize: 12, fontWeight: 600 }}>{perf.inProgressTasks || 0} Active</span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>{perf.pendingTasks} Backlog</span>
                        </div>
                      </td>
                      <td style={{ paddingRight: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 35, textAlign: 'right' }}>{perf.completionRate}%</span>
                          <div style={{ width: 80, height: 5, background: '#E5E7EB', borderRadius: 99 }}>
                            <div style={{ width: `${perf.completionRate}%`, height: '100%', background: '#111827', borderRadius: 99 }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <UserModal show={showUserModal} staff={selectedStaff} onClose={() => setShowUserModal(false)} onSave={handleSaveSuccess} />
      <ConfirmModal show={showConfirmModal} title="Remove Staff Account" message={`Permanently delete ${staffToDelete?.name}? History remains associated.`} confirmText="Remove Account" isDanger={true} onConfirm={handleDeleteConfirm} onCancel={() => setShowConfirmModal(false)} />
    </div>
  );
};

export default Employees;
