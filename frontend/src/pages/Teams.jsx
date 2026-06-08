import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import TeamModal from '../components/TeamModal';
import ConfirmModal from '../components/ConfirmModal';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const fetchTeams = async () => {
    try { setLoading(true); const res = await api.get('/teams'); setTeams(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleOpenAdd = () => { setSelectedTeam(null); setShowTeamModal(true); };
  const handleOpenEdit = (team) => { setSelectedTeam(team); setShowTeamModal(true); };
  const handleOpenDelete = (team) => { setTeamToDelete(team); setShowConfirmModal(true); };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/teams/${teamToDelete._id}`);
      setTeams((prev) => prev.filter((t) => t._id !== teamToDelete._id));
      setShowConfirmModal(false);
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete team'); }
  };

  const handleSaveSuccess = () => { fetchTeams(); };
  const canManage = user?.role === 'Admin' || user?.role === 'Team Leader';

  const SvgIcon = ({ d, size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>Team Subdivisions</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Manage groups, assign members, and coordinate projects.</p>
        </div>
        {canManage && (
          <button onClick={handleOpenAdd} style={{ height: 36, padding: '0 14px', background: '#111827', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(17,24,39,0.25)' }}>
            <SvgIcon d="M12 5v14M5 12h14" color="#fff" size={14} />
            Create Team
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : !teams.length ? (
        <EmptyState title="No Teams Configured" description="Grouping staff into teams makes it easier to assign and track tasks collectively." actionText={canManage ? "Create Team" : null} onAction={canManage ? handleOpenAdd : null} />
      ) : (
        <div className="row g-4">
          {teams.map(team => {
            const isUserLeader = team.teamLeader?._id === user?._id;
            const isUserAdmin = user?.role === 'Admin';
            const showControls = isUserAdmin || isUserLeader;

            return (
              <div key={team._id} className="col-12 col-md-6 col-lg-4">
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.2 }}>{team.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>Lead:</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{team.teamLeader?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                    {showControls && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleOpenEdit(team)} title="Edit" style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.color = '#111827'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                        >
                          <SvgIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={13} />
                        </button>
                        <button onClick={() => handleOpenDelete(team)} title="Delete" style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                        >
                          <SvgIcon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px 24px', flex: 1 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div className="label-xs" style={{ marginBottom: 10 }}>Members ({team.members?.length || 0})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {!team.members?.length ? (
                          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No members assigned</div>
                        ) : team.members.map(m => (
                          <span key={m._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 20, fontSize: 12, fontWeight: 500, color: '#374151' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }} />
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="label-xs" style={{ marginBottom: 10 }}>Projects ({team.assignedProjects?.length || 0})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {!team.assignedProjects?.length ? (
                          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No projects assigned</div>
                        ) : team.assignedProjects.map(p => (
                          <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: '#6B7280', padding: '2px 6px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 4 }}>{p.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      <TeamModal show={showTeamModal} team={selectedTeam} onClose={() => setShowTeamModal(false)} onSave={handleSaveSuccess} />
      <ConfirmModal show={showConfirmModal} title="Remove Team" message={`Dissolve team "${teamToDelete?.name}"? Members will be unlinked.`} confirmText="Remove Team" isDanger={true} onConfirm={handleDeleteConfirm} onCancel={() => setShowConfirmModal(false)} />
    </div>
  );
};

export default Teams;
