import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CustomSelect from './CustomSelect';

const TeamModal = ({ show, team, onClose, onSave }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [teamLeader, setTeamLeader] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!show) return;
      try {
        setDropdownsLoading(true);

        // Fetch Employees
        const empRes = await api.get('/users?role=Employee');
        setEmployees(empRes.data || []);

        // Fetch Projects (Admin sees all, TL sees assigned)
        const projRes = await api.get('/projects');
        setProjects(projRes.data || []);

        if (user.role === 'Admin') {
          // Fetch Team Leaders
          const tlRes = await api.get('/users?role=Team Leader');
          setTeamLeaders(tlRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load team assets:', err);
      } finally {
        setDropdownsLoading(false);
      }
    };

    fetchDropdownData();
  }, [show, user]);

  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setTeamLeader(team.teamLeader?._id || team.teamLeader || '');
      setSelectedMembers((team.members || []).map((m) => m._id || m));
      setSelectedProjects((team.assignedProjects || []).map((p) => p._id || p));
    } else {
      setName('');
      setTeamLeader(user?.role === 'Team Leader' ? user._id : '');
      setSelectedMembers([]);
      setSelectedProjects([]);
    }
    setError('');
  }, [team, show, user]);

  if (!show) return null;

  const handleMemberCheck = (empId) => {
    setSelectedMembers((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleProjectCheck = (projId) => {
    setSelectedProjects((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return setError('Please enter a team name');
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      teamLeader: user.role === 'Admin' ? teamLeader : user._id,
      members: selectedMembers,
      assignedProjects: selectedProjects,
    };

    try {
      if (team) {
        const res = await api.put(`/teams/${team._id}`, payload);
        onSave(res.data);
      } else {
        const res = await api.post('/teams', payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing team request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 1080,
      }}
    >
      <div
        className="bg-white border rounded-3 shadow-lg overflow-hidden"
        style={{ width: '550px', maxWidth: '90%' }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <span className="fw-semibold text-dark small">
            {team ? 'Modify Team Structure' : 'Create New Team'}
          </span>
          <button
            type="button"
            className="btn-close"
            style={{ fontSize: '12px' }}
            onClick={onClose}
            disabled={loading}
          ></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-3 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label" htmlFor="team-name">Team Name *</label>
              <input
                type="text"
                id="team-name"
                className="form-control form-control-sm"
                placeholder="e.g. Alpha Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {user.role === 'Admin' && (
              <div className="mb-3">
                <label className="form-label" htmlFor="team-leader-select">Team Leader *</label>
                {dropdownsLoading ? (
                  <div className="text-muted small">Loading team leaders...</div>
                ) : (
                  <CustomSelect
                    value={teamLeader}
                    onChange={(e) => setTeamLeader(e.target.value)}
                    options={[
                      { value: '', label: '-- Choose Team Leader --' },
                      ...teamLeaders.map(tl => ({ value: tl._id, label: tl.name }))
                    ]}
                    disabled={loading}
                  />
                )}
              </div>
            )}

            {/* Team Members scrollable box */}
            <div className="mb-3">
              <label className="form-label">Team Members (Employees)</label>
              {dropdownsLoading ? (
                <div className="text-muted small">Loading directory...</div>
              ) : (
                <div className="border rounded p-2 bg-light overflow-y-auto" style={{ maxHeight: '120px' }}>
                  {employees.length === 0 ? (
                    <span className="text-muted small d-block p-2">No active employees found.</span>
                  ) : (
                    employees.map((emp) => {
                      const checked = selectedMembers.includes(emp._id);
                      return (
                        <div key={emp._id} className="form-check form-check-inline d-flex align-items-center gap-2 mb-1 p-1 px-2 rounded bg-white border">
                          <input
                            type="checkbox"
                            className="form-check-input ms-0 mt-0"
                            id={`emp-${emp._id}`}
                            checked={checked}
                            onChange={() => handleMemberCheck(emp._id)}
                            disabled={loading}
                          />
                          <label className="form-check-label small text-dark cursor-pointer" htmlFor={`emp-${emp._id}`} style={{ fontSize: '12px' }}>
                            {emp.name}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Team Projects scrollable box */}
            <div className="mb-2">
              <label className="form-label">Assigned Projects</label>
              {dropdownsLoading ? (
                <div className="text-muted small">Loading projects...</div>
              ) : (
                <div className="border rounded p-2 bg-light overflow-y-auto" style={{ maxHeight: '120px' }}>
                  {projects.length === 0 ? (
                    <span className="text-muted small d-block p-2">No projects available.</span>
                  ) : (
                    projects.map((proj) => {
                      const checked = selectedProjects.includes(proj._id);
                      return (
                        <div key={proj._id} className="form-check form-check-inline d-flex align-items-center gap-2 mb-1 p-1 px-2 rounded bg-white border">
                          <input
                            type="checkbox"
                            className="form-check-input ms-0 mt-0"
                            id={`proj-${proj._id}`}
                            checked={checked}
                            onChange={() => handleProjectCheck(proj._id)}
                            disabled={loading}
                          />
                          <label className="form-check-label small text-dark cursor-pointer text-truncate" htmlFor={`proj-${proj._id}`} style={{ fontSize: '12px', maxWidth: '280px' }}>
                            {proj.name}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-top d-flex justify-content-end gap-2 bg-light">
            <button
              type="button"
              className="btn btn-sm btn-light border small"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-dark small d-flex align-items-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              Save Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
