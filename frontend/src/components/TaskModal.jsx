import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CustomSelect from './CustomSelect';

const TaskModal = ({ show, task, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Pending');

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [error, setError] = useState('');

  // Field touched states
  const [titleTouched, setTitleTouched] = useState(false);
  const [projectTouched, setProjectTouched] = useState(false);
  const [deadlineTouched, setDeadlineTouched] = useState(false);

  // Field validation checks
  const isTitleValid = title.trim().length > 0;
  const isProjectValid = project.trim().length > 0;
  const isDeadlineValid = deadline !== '';

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!show) return;
      try {
        setDropdownsLoading(true);
        const projRes = await api.get('/projects');
        setProjects(projRes.data || []);

        const empRes = await api.get('/users?role=Employee');
        setEmployees(empRes.data || []);
      } catch (err) {
        console.error('Failed to load task metadata:', err);
      } finally {
        setDropdownsLoading(false);
      }
    };

    fetchDropdownData();
  }, [show]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setProject(task.project?._id || task.project || '');
      setAssignedEmployee(task.assignedEmployee?._id || task.assignedEmployee || '');
      setPriority(task.priority || 'Medium');
      
      const due = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : todayStr;
      setDeadline(due);
      setStatus(task.status || 'Pending');
    } else {
      setTitle('');
      setDescription('');
      setProject('');
      setAssignedEmployee('');
      setPriority('Medium');
      // Default to current date for every calendar
      setDeadline(todayStr);
      setStatus('Pending');
    }

    // Reset touched states
    setTitleTouched(false);
    setProjectTouched(false);
    setDeadlineTouched(false);
    setError('');
  }, [task, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTitleTouched(true);
    setProjectTouched(true);
    setDeadlineTouched(true);

    if (!isTitleValid || !isProjectValid || !isDeadlineValid) {
      return setError('Please fill in all required fields.');
    }

    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      project,
      assignedEmployee: assignedEmployee || null,
      priority,
      deadline,
      status,
    };

    try {
      if (task) {
        const res = await api.put(`/tasks/${task._id}`, payload);
        onSave(res.data);
      } else {
        const res = await api.post('/tasks', payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing task request');
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
            {task ? 'Edit Task Specifications' : 'Assign New Task'}
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
              <label className="form-label" htmlFor="task-title">Task Title *</label>
              <input
                type="text"
                id="task-title"
                className={`form-control form-control-sm ${
                  titleTouched ? (isTitleValid ? 'is-valid' : 'is-invalid') : ''
                }`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleTouched(true)}
                required
                disabled={loading}
              />
              {titleTouched && !isTitleValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Task Title is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="task-project">Project Link *</label>
              {dropdownsLoading ? (
                <div className="text-muted small">Loading projects...</div>
              ) : (
                <CustomSelect
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  options={[
                    { value: '', label: '-- Choose a Project --' },
                    ...projects.map(p => ({ value: p._id, label: p.name }))
                  ]}
                  disabled={loading || !!task}
                />
              )}
              {projectTouched && !isProjectValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Please link this task to a project workspace.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="task-assignee">Assigned Employee</label>
              {dropdownsLoading ? (
                <div className="text-muted small">Loading employees...</div>
              ) : (
                <CustomSelect
                  value={assignedEmployee}
                  onChange={(e) => setAssignedEmployee(e.target.value)}
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...employees.map(emp => ({ value: emp._id, label: emp.name }))
                  ]}
                  disabled={loading}
                />
              )}
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label" htmlFor="task-priority">Priority Level</label>
                <CustomSelect
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Urgent', label: 'Urgent' }
                  ]}
                  disabled={loading}
                />
              </div>

              <div className="col-6">
                <label className="form-label" htmlFor="task-deadline">Deadline Date *</label>
                <input
                  type="date"
                  id="task-deadline"
                  className={`form-control form-control-sm ${
                    deadlineTouched ? (isDeadlineValid ? 'is-valid' : 'is-invalid') : ''
                  }`}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onBlur={() => setDeadlineTouched(true)}
                  required
                  disabled={loading}
                />
                {deadlineTouched && !isDeadlineValid && (
                  <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                    Deadline Date is required.
                  </div>
                )}
              </div>
            </div>

            {task && (
              <div className="mb-3">
                <label className="form-label" htmlFor="task-status">Task Status</label>
                <CustomSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Review', label: 'Review' },
                    { value: 'Completed', label: 'Completed' }
                  ]}
                  disabled={loading}
                />
              </div>
            )}

            <div className="mb-2">
              <label className="form-label" htmlFor="task-description">Instruction / Description</label>
              <textarea
                id="task-description"
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
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
