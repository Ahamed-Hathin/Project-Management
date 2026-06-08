import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState, { StatusBadge, Avatar } from '../components/EmptyState';
import ProjectModal from '../components/ProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  const fetchProjects = async () => {
    try { setLoading(true); const res = await api.get(`/projects?search=${search}&status=${statusFilter}`); setProjects(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [statusFilter]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchProjects(); };
  const handleOpenAdd = () => { setSelectedProject(null); setShowProjectModal(true); };
  const handleOpenEdit = (p, e) => { e.stopPropagation(); setSelectedProject(p); setShowProjectModal(true); };
  const handleOpenDelete = (p, e) => { e.stopPropagation(); setProjectToDelete(p); setShowConfirmModal(true); };
  const handleDeleteConfirm = async () => { try { await api.delete(`/projects/${projectToDelete._id}`); setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id)); setShowConfirmModal(false); if (projectDetails?.project?._id === projectToDelete._id) setShowDetailsPanel(false); } catch (e) { alert(e.response?.data?.message || 'Failed to delete project'); } };
  const handleSaveSuccess = () => { fetchProjects(); };
  const handleViewDetails = async (project) => { try { setDetailsLoading(true); setShowDetailsPanel(true); const res = await api.get(`/projects/${project._id}`); setProjectDetails(res.data); } catch (e) { console.error(e); setShowDetailsPanel(false); } finally { setDetailsLoading(false); } };

  const isAdmin = user?.role === 'Admin';
  const isLeader = user?.role === 'Team Leader';

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
              <SvgIcon d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" color="#111827" size={16} />
              <h1 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Projects</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#F3F4F6', color: '#6B7280' }}>{projects.length}</span>
            </div>
            {isAdmin && (
              <button onClick={handleOpenAdd} style={{ height: 36, padding: '0 14px', background: '#111827', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(17,24,39,0.25)' }}>
                <SvgIcon d="M12 5v14M5 12h14" color="#fff" size={14} />
                New Project
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 0 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                  <SvgIcon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={14} />
                </span>
                <input type="text" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ height: 34, border: '1px solid #E5E7EB', borderRadius: '8px 0 0 8px', paddingLeft: 32, paddingRight: 12, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 200, color: '#111827' }}
                  onFocus={(e) => e.target.style.borderColor = '#111827'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <button type="submit" style={{ height: 34, padding: '0 12px', background: '#111827', border: 'none', borderRadius: '0 8px 8px 0', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Go</button>
            </form>

            <div style={{ width: 160 }}>
              <CustomSelect 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'Not Started', label: 'Not Started' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Testing', label: 'Testing' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Delayed', label: 'Delayed' }
                ]}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? <LoadingSpinner /> : projects.length === 0 ? (
              <EmptyState title="No Projects Found" description="Create a project, define milestones, and assign a team leader." actionText={isAdmin ? "Create Project" : null} onAction={isAdmin ? handleOpenAdd : null} />
            ) : (
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr style={{ verticalAlign: 'middle' }}>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</th>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead</th>
                    <th style={{ minWidth: 160, fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</th>
                    <th style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</th>
                    {isAdmin && <th style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const isSelected = projectDetails?.project?._id === p._id && showDetailsPanel;
                    return (
                      <tr key={p._id} onClick={() => handleViewDetails(p)} style={{ cursor: 'pointer', background: isSelected ? '#F3F4F6' : undefined, verticalAlign: 'middle' }}>
                        <td style={{ verticalAlign: 'middle' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                          <StatusBadge status={p.status} />
                        </td>
                        <td style={{ fontSize: 13, color: '#6B7280', verticalAlign: 'middle' }}>{p.client?.companyName || 'N/A'}</td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{p.assignedTeamLeader?.name || 'Unassigned'}</span>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 30 }}>{p.progress}%</span>
                            <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${p.progress}%`, height: '100%', background: '#111827', borderRadius: 99, transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{p.completedTasks}/{p.totalTasks} tasks</span>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 500, color: '#374151', verticalAlign: 'middle' }}>{formatDate(p.deadline)}</td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                              <button onClick={(e) => handleOpenEdit(p, e)} title="Edit" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.color = '#111827'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                              >
                                {/* Pencil / edit icon */}
                                <SvgIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={13} />
                              </button>
                              <button onClick={(e) => handleOpenDelete(p, e)} title="Delete" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
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
                <i className="bi bi-diagram-3-fill" style={{ color: '#111827' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Project Details</span>
              </div>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>✕</button>
            </div>

            {detailsLoading ? <LoadingSpinner /> : projectDetails ? (
              <div style={{ padding: 24 }}>
                {/* Title & Status */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{projectDetails.project.name}</h2>
                    {(isAdmin || (isLeader && projectDetails.project.assignedTeamLeader?._id === user._id)) && (
                      <button onClick={(e) => handleOpenEdit(projectDetails.project, e)} style={{ height: 30, padding: '0 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Edit</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <StatusBadge status={projectDetails.project.status} />
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginTop: 12 }}>{projectDetails.project.description || 'No description provided.'}</p>
                </div>

                {/* Metadata grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { l: 'Client', v: projectDetails.project.client?.companyName || 'N/A' },
                    { l: 'Team Lead', v: projectDetails.project.assignedTeamLeader?.name || 'Unassigned' },
                    { l: 'Budget', v: formatCurrency(projectDetails.project.budget) },
                    isAdmin && { l: 'Revenue', v: formatCurrency(projectDetails.project.revenue) },
                    { l: 'Start Date', v: formatDate(projectDetails.project.startDate) },
                    { l: 'Deadline', v: formatDate(projectDetails.project.deadline), danger: true },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 9, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.danger ? '#DC2626' : '#111827' }}>{item.v}</div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 24 }}>
                  <div className="label-xs" style={{ marginBottom: 10 }}>Task Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{projectDetails.stats.progress}%</span>
                    <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${projectDetails.stats.progress}%`, height: '100%', background: '#111827', borderRadius: 99 }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[
                      { l: 'Total', v: projectDetails.stats.totalTasks, c: '#374151' },
                      { l: 'Done', v: projectDetails.stats.completedTasks, c: '#16A34A' },
                      { l: 'Active', v: projectDetails.stats.inProgressTasks, c: '#111827' },
                      { l: 'Backlog', v: projectDetails.stats.pendingTasks, c: '#D97706' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: 8, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <div className="label-xs" style={{ marginBottom: 10 }}>Tasks ({projectDetails.tasks.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                    {projectDetails.tasks.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13 }}>No tasks logged</div>
                    ) : projectDetails.tasks.map((task) => (
                      <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#fff', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                          <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2, display: 'flex', gap: 8 }}>
                            <span>{task.assignedEmployee?.name || 'Unassigned'}</span>
                            <span>· Due: {formatDate(task.deadline)}</span>
                          </div>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <ProjectModal show={showProjectModal} project={selectedProject} onClose={() => setShowProjectModal(false)} onSave={handleSaveSuccess} />
      <ConfirmModal show={showConfirmModal} title="Remove Project & Tasks" message={`Are you sure you want to permanently delete project "${projectToDelete?.name}"? This will remove all associated tasks.`} confirmText="Remove Project" isDanger={true} onConfirm={handleDeleteConfirm} onCancel={() => setShowConfirmModal(false)} />
    </div>
  );
};

export default Projects;
