import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CustomSelect from './CustomSelect';

const ProjectModal = ({ show, project, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Not Started');
  const [assignedTeamLeader, setAssignedTeamLeader] = useState('');

  const [clients, setClients] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [error, setError] = useState('');

  // Field touched states
  const [nameTouched, setNameTouched] = useState(false);
  const [clientTouched, setClientTouched] = useState(false);
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [deadlineTouched, setDeadlineTouched] = useState(false);

  // Field validations
  const isNameValid = name.trim().length > 0;
  const isClientValid = client.trim().length > 0;
  const isStartDateValid = startDate !== '';
  const isDeadlineValid = deadline !== '';
  
  // Custom date validation: deadline must be on or after start date
  const isDateRangeValid = 
    startDate && deadline ? new Date(deadline) >= new Date(startDate) : true;

  // Fetch Clients and Team Leaders for selections
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!show) return;
      try {
        setDropdownsLoading(true);
        const clientsRes = await api.get('/clients?limit=100');
        setClients(clientsRes.data.clients || []);

        const tlRes = await api.get('/users?role=Team Leader');
        setTeamLeaders(tlRes.data || []);
      } catch (err) {
        console.error('Failed to load dropdown lists:', err);
      } finally {
        setDropdownsLoading(false);
      }
    };

    fetchDropdownData();
  }, [show]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (project) {
      setName(project.name || '');
      setClient(project.client?._id || project.client || '');
      setDescription(project.description || '');
      setBudget(project.budget || 0);
      setRevenue(project.revenue || 0);
      
      const start = project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : todayStr;
      const end = project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : todayStr;
      
      setStartDate(start);
      setDeadline(end);
      setStatus(project.status || 'Not Started');
      setAssignedTeamLeader(project.assignedTeamLeader?._id || project.assignedTeamLeader || '');
    } else {
      setName('');
      setClient('');
      setDescription('');
      setBudget(0);
      setRevenue(0);
      // Default to current date for every calendar
      setStartDate(todayStr);
      setDeadline(todayStr);
      setStatus('Not Started');
      setAssignedTeamLeader('');
    }

    // Reset touched states
    setNameTouched(false);
    setClientTouched(false);
    setStartDateTouched(false);
    setDeadlineTouched(false);
    setError('');
  }, [project, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameTouched(true);
    setClientTouched(true);
    setStartDateTouched(true);
    setDeadlineTouched(true);

    if (!isNameValid || !isClientValid || !isStartDateValid || !isDeadlineValid) {
      return setError('Please fill in all required fields.');
    }

    if (!isDateRangeValid) {
      return setError('Validation Error: The project deadline date cannot be before the start date.');
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      client,
      description,
      budget: parseFloat(budget) || 0,
      revenue: parseFloat(revenue) || 0,
      startDate,
      deadline,
      status,
      assignedTeamLeader: assignedTeamLeader || null,
    };

    try {
      if (project) {
        const res = await api.put(`/projects/${project._id}`, payload);
        onSave(res.data);
      } else {
        const res = await api.post('/projects', payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing project request');
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
            {project ? 'Modify Project Attributes' : 'Initiate New Project'}
          </span>
          <button
            type="button"
            className="btn-close"
            style={{ fontSize: '12px' }}
            onClick={onClose}
            disabled={loading}
          ></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-3 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3" role="alert" style={{ fontSize: '11px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label" htmlFor="project-name">Project Name *</label>
              <input
                type="text"
                id="project-name"
                className={`form-control form-control-sm ${
                  nameTouched ? (isNameValid ? 'is-valid' : 'is-invalid') : ''
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                required
                disabled={loading}
              />
              {nameTouched && !isNameValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Project Name is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="project-client">Client Association *</label>
              {dropdownsLoading ? (
                <div className="text-muted small py-1">Loading clients...</div>
              ) : (
                <CustomSelect
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  options={[
                    { value: '', label: '-- Choose a Client --' },
                    ...clients.map(c => ({ value: c._id, label: `${c.companyName} (${c.name})` }))
                  ]}
                  disabled={loading}
                />
              )}
              {clientTouched && !isClientValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Please select an associated client.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="project-leader">Assigned Team Leader</label>
              {dropdownsLoading ? (
                <div className="text-muted small py-1">Loading leaders...</div>
              ) : (
                <CustomSelect
                  value={assignedTeamLeader}
                  onChange={(e) => setAssignedTeamLeader(e.target.value)}
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...teamLeaders.map(tl => ({ value: tl._id, label: tl.name }))
                  ]}
                  disabled={loading}
                />
              )}
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label" htmlFor="project-start">Start Date *</label>
                <input
                  type="date"
                  id="project-start"
                  className={`form-control form-control-sm ${
                    startDateTouched ? (isStartDateValid ? 'is-valid' : 'is-invalid') : ''
                  }`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={() => setStartDateTouched(true)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="project-deadline">Deadline Date *</label>
                <input
                  type="date"
                  id="project-deadline"
                  className={`form-control form-control-sm ${
                    deadlineTouched ? (isDeadlineValid && isDateRangeValid ? 'is-valid' : 'is-invalid') : ''
                  }`}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onBlur={() => setDeadlineTouched(true)}
                  required
                  disabled={loading}
                />
                {deadlineTouched && !isDateRangeValid && (
                  <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                    Deadline must be on or after Start Date.
                  </div>
                )}
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label" htmlFor="project-budget">Project Budget ($)</label>
                <input
                  type="number"
                  id="project-budget"
                  className="form-control form-control-sm"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={loading}
                />
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="project-revenue">Project Revenue ($)</label>
                <input
                  type="number"
                  id="project-revenue"
                  className="form-control form-control-sm"
                  min="0"
                  value={revenue}
                  onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="project-status">Milestone Status</label>
              <CustomSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'Not Started', label: 'Not Started' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Testing', label: 'Testing' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Delayed', label: 'Delayed' }
                ]}
                disabled={loading}
              />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="project-description">Detailed Description</label>
              <textarea
                id="project-description"
                className="form-control form-control-sm"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              ></textarea>
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
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
