import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, getStatusBadgeStyle } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState, { StatusBadge, PriorityBadge, Avatar } from '../components/EmptyState';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Details panel state
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Work note input
  const [noteText, setNoteText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFiltersData = async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data || []);
      if (user?.role !== 'Employee') {
        const empRes = await api.get('/users?role=Employee');
        setEmployees(empRes.data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?project=${projectFilter}&status=${statusFilter}&priority=${priorityFilter}&employee=${employeeFilter}`);
      setTasks(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFiltersData(); }, [user]);
  useEffect(() => { fetchTasks(); }, [projectFilter, statusFilter, priorityFilter, employeeFilter]);

  const handleOpenAdd = () => { setSelectedTask(null); setShowTaskModal(true); };
  const handleOpenEdit = (task, e) => { e.stopPropagation(); setSelectedTask(task); setShowTaskModal(true); };
  const handleOpenDelete = (task, e) => { e.stopPropagation(); setTaskToDelete(task); setShowConfirmModal(true); };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setShowConfirmModal(false);
      if (taskDetails?._id === taskToDelete._id) setShowDetailsPanel(false);
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete task'); }
  };

  const handleSaveSuccess = () => { fetchTasks(); if (taskDetails) handleViewDetails(taskDetails); };

  const handleViewDetails = async (task) => {
    try {
      setDetailsLoading(true); setShowDetailsPanel(true);
      const res = await api.get(`/tasks/${task._id}`);
      setTaskDetails(res.data); setStatusUpdate(res.data.status); setNoteText('');
    } catch (e) { console.error(e); setShowDetailsPanel(false); } finally { setDetailsLoading(false); }
  };

  const handleStatusOrNoteUpdate = async (e) => {
    e.preventDefault();
    if (!taskDetails) return;
    setActionLoading(true);
    try {
      const payload = {};
      if (statusUpdate !== taskDetails.status) payload.status = statusUpdate;
      if (noteText.trim() !== '') payload.note = noteText.trim();
      if (Object.keys(payload).length === 0) { setActionLoading(false); return; }

      const res = await api.put(`/tasks/${taskDetails._id}`, payload);
      setTaskDetails(res.data); setNoteText('');
      setTasks((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
    } catch (e) { alert(e.response?.data?.message || 'Failed to update task'); } finally { setActionLoading(false); }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'Team Leader';

  const SvgIcon = ({ d, size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  );

  return (
    <div className="row g-4">
      <div className={showDetailsPanel ? 'col-12 col-xl-7' : 'col-12'}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SvgIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" color="#111827" size={16} />
              <h1 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Tasks</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#F3F4F6', color: '#6B7280' }}>{tasks.length}</span>
            </div>
            {canManage && (
              <button onClick={handleOpenAdd} style={{ height: 36, padding: '0 14px', background: '#111827', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(17,24,39,0.25)' }}>
                <SvgIcon d="M12 5v14M5 12h14" color="#fff" size={14} />
                New Task
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: 160 }}>
              <CustomSelect value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} options={[{value: '', label: 'All Projects'}, ...projects.map(p => ({value: p._id, label: p.name}))]} />
            </div>
            <div style={{ width: 140 }}>
              <CustomSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{value: '', label: 'All Statuses'}, {value: 'Pending', label: 'Pending'}, {value: 'In Progress', label: 'In Progress'}, {value: 'Review', label: 'Review'}, {value: 'Completed', label: 'Completed'}]} />
            </div>
            <div style={{ width: 130 }}>
              <CustomSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} options={[{value: '', label: 'All Priorities'}, {value: 'Low', label: 'Low'}, {value: 'Medium', label: 'Medium'}, {value: 'High', label: 'High'}, {value: 'Urgent', label: 'Urgent'}]} />
            </div>
            {user?.role !== 'Employee' && (
              <div style={{ width: 150 }}>
                <CustomSelect value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} options={[{value: '', label: 'All Assignees'}, ...employees.map(emp => ({value: emp._id, label: emp.name}))]} />
              </div>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? <LoadingSpinner /> : tasks.length === 0 ? (
              <EmptyState title="No Tasks Found" description="Adjust your filters or create a new task." actionText={canManage ? "Assign New Task" : null} onAction={canManage ? handleOpenAdd : null} />
            ) : (
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr style={{ verticalAlign: 'middle' }}>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task</th>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</th>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</th>
                    {user?.role !== 'Employee' && <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignee</th>}
                    {canManage && <th style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const isSelected = taskDetails?._id === t._id && showDetailsPanel;
                    return (
                      <tr key={t._id} onClick={() => handleViewDetails(t)} style={{ cursor: 'pointer', background: isSelected ? '#F3F4F6' : undefined, verticalAlign: 'middle' }}>
                        <td style={{ verticalAlign: 'middle' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{t.title}</div>
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td style={{ fontSize: 13, color: '#6B7280', verticalAlign: 'middle' }}>{t.project?.name || 'N/A'}</td>
                        <td style={{ verticalAlign: 'middle' }}><StatusBadge status={t.status} /></td>
                        <td style={{ fontSize: 13, fontWeight: 500, color: '#374151', verticalAlign: 'middle' }}>{formatDate(t.deadline)}</td>
                        {user?.role !== 'Employee' && (
                          <td style={{ verticalAlign: 'middle' }}>
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{t.assignedEmployee?.name || 'Unassigned'}</span>
                          </td>
                        )}
                        {canManage && (
                          <td style={{ textAlign: 'right', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                              <button onClick={(e) => handleOpenEdit(t, e)} title="Edit" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.color = '#111827'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                              >
                                <SvgIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={13} />
                              </button>
                              <button onClick={(e) => handleOpenDelete(t, e)} title="Delete" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                              >
                                <SvgIcon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      {showDetailsPanel && (
        <div className="col-12 col-xl-5">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-layout-text-sidebar-reverse" style={{ color: '#111827' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Task Details</span>
              </div>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>✕</button>
            </div>

            {detailsLoading ? <LoadingSpinner /> : taskDetails ? (
              <div style={{ padding: 24, maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{taskDetails.title}</h2>
                    {canManage && (
                      <button onClick={(e) => handleOpenEdit(taskDetails, e)} style={{ height: 30, padding: '0 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Edit</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <StatusBadge status={taskDetails.status} />
                    <PriorityBadge priority={taskDetails.priority} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="bi bi-folder2-open" style={{ color: '#9CA3AF' }} /> {taskDetails.project?.name}
                  </div>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginTop: 16 }}>{taskDetails.description || 'No description.'}</p>
                </div>

                {/* Metadata grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { l: 'Deadline', v: formatDate(taskDetails.deadline), danger: true },
                    { l: 'Assignee', v: taskDetails.assignedEmployee?.name || 'Unassigned' },
                    { l: 'Assigned By', v: taskDetails.assignedBy?.name || 'System' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 9, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.danger ? '#DC2626' : '#111827' }}>{item.v}</div>
                    </div>
                  ))}
                </div>

                {/* Update form */}
                <div style={{ padding: 16, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 24 }}>
                  <div className="label-xs" style={{ marginBottom: 12 }}>Update Task</div>
                  <form onSubmit={handleStatusOrNoteUpdate}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ width: 160 }}>
                        <CustomSelect value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} options={[{value: 'Pending', label: 'Pending'}, {value: 'In Progress', label: 'In Progress'}, {value: 'Review', label: 'Review'}, {value: 'Completed', label: 'Completed'}]} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <textarea placeholder="Log deliverables, notes..." value={noteText} onChange={(e) => setNoteText(e.target.value)} disabled={actionLoading} className="form-control form-control-sm" rows={2} style={{ background: '#fff' }} />
                    </div>
                    <button type="submit" disabled={actionLoading || (statusUpdate === taskDetails.status && !noteText.trim())} style={{ width: '100%', height: 36, background: '#111827', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: (actionLoading || (statusUpdate === taskDetails.status && !noteText.trim())) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s', opacity: (actionLoading || (statusUpdate === taskDetails.status && !noteText.trim())) ? 0.6 : 1 }}
                      onMouseEnter={(e) => { if (!actionLoading && !(statusUpdate === taskDetails.status && !noteText.trim())) e.currentTarget.style.background = '#000'; }}
                      onMouseLeave={(e) => { if (!actionLoading && !(statusUpdate === taskDetails.status && !noteText.trim())) e.currentTarget.style.background = '#111827'; }}
                    >
                      {actionLoading ? 'Saving...' : 'Update status & log'}
                    </button>
                  </form>
                </div>

                {/* Notes & Activity tabs */}
                <div>
                  <div className="label-xs" style={{ marginBottom: 12 }}>Work Notes ({taskDetails.workNotes?.length || 0})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {!taskDetails.workNotes?.length ? (
                      <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>No work notes logged.</div>
                    ) : taskDetails.workNotes.map(n => (
                      <div key={n._id} style={{ padding: 12, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{n.addedBy?.name}</span>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(n.addedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>{n.note}</div>
                      </div>
                    ))}
                  </div>

                  <div className="label-xs" style={{ marginBottom: 12 }}>Timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {!taskDetails.activityHistory?.length ? (
                      <div style={{ fontSize: 13, color: '#9CA3AF' }}>No activity</div>
                    ) : taskDetails.activityHistory.map((act, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', border: '2px solid #DBEAFE', flexShrink: 0, marginTop: 6 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#4B5563' }}>{act.action}</span>
                            <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{new Date(act.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>By {act.performedBy?.name || 'System'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

      <TaskModal show={showTaskModal} task={selectedTask} onClose={() => setShowTaskModal(false)} onSave={handleSaveSuccess} />
      <ConfirmModal show={showConfirmModal} title="Remove Task" message={`Delete "${taskToDelete?.title}" permanently?`} confirmText="Delete Task" isDanger={true} onConfirm={handleDeleteConfirm} onCancel={() => setShowConfirmModal(false)} />
    </div>
  );
};

export default Tasks;
