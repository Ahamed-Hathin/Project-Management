import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CustomSelect from './CustomSelect';

const UserModal = ({ show, staff, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Field touched states
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Field validations
  const isNameValid = name.trim().length > 0;
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const isEmailValid = emailRegex.test(email);
  
  // Password is only mandatory for new staff creation
  const isPasswordValid = staff ? (password === '' || password.length >= 6) : (password.length >= 6);

  useEffect(() => {
    if (staff) {
      setName(staff.name || '');
      setEmail(staff.email || '');
      setPassword('');
      setRole(staff.role || 'Employee');
      setPhone(staff.phone || '');
      setStatus(staff.status || 'Active');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Employee');
      setPhone('');
      setStatus('Active');
    }
    
    // Reset touched states
    setNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setError('');
  }, [staff, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return setError('Please correct the highlighted validation errors before saving.');
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      email,
      role,
      phone,
      status,
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (staff) {
        const res = await api.put(`/users/${staff._id}`, payload);
        onSave(res.data);
      } else {
        const res = await api.post('/users', payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing staff record');
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
        style={{ width: '480px', maxWidth: '90%' }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <span className="fw-semibold text-dark small">
            {staff ? 'Update Staff Member' : 'Provision Staff Account'}
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
          <div className="p-3">
            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3" role="alert" style={{ fontSize: '11px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label" htmlFor="staff-name">Full Name *</label>
              <input
                type="text"
                id="staff-name"
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
                  Full Name is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="staff-email">Email Address *</label>
              <input
                type="email"
                id="staff-email"
                className={`form-control form-control-sm ${
                  emailTouched ? (isEmailValid ? 'is-valid' : 'is-invalid') : ''
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                required
                disabled={loading}
              />
              {emailTouched && !isEmailValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Please enter a valid email address (e.g. employee@company.com).
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="staff-password">
                Password {staff ? '(Leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                id="staff-password"
                className={`form-control form-control-sm ${
                  passwordTouched ? (isPasswordValid ? 'is-valid' : 'is-invalid') : ''
                }`}
                value={password}
                placeholder={staff ? '••••••••' : 'Enter access password'}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                required={!staff}
                disabled={loading}
              />
              {passwordTouched && !isPasswordValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Password must be at least 6 characters long.
                </div>
              )}
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label" htmlFor="staff-role">Organizational Role</label>
                <CustomSelect
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={[
                    { value: 'Employee', label: 'Employee' },
                    { value: 'Team Leader', label: 'Team Leader' },
                    { value: 'Admin', label: 'Admin' }
                  ]}
                  disabled={loading}
                />
              </div>

              <div className="col-6">
                <label className="form-label" htmlFor="staff-status">Account Status</label>
                <CustomSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="staff-phone">Phone Contact</label>
              <input
                type="text"
                id="staff-phone"
                className="form-control form-control-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
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
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
