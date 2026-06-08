import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ClientModal = ({ show, client, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Field touched states
  const [nameTouched, setNameTouched] = useState(false);
  const [companyNameTouched, setCompanyNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Field validation rules
  const isNameValid = name.trim().length > 0;
  const isCompanyNameValid = companyName.trim().length > 0;
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const isEmailValid = emailRegex.test(email);

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setCompanyName(client.companyName || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setAddress(client.address || '');
    } else {
      setName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setAddress('');
    }
    // Reset touched states
    setNameTouched(false);
    setCompanyNameTouched(false);
    setEmailTouched(false);
    setError('');
  }, [client, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameTouched(true);
    setCompanyNameTouched(true);
    setEmailTouched(true);

    if (!isNameValid || !isCompanyNameValid || !isEmailValid) {
      return setError('Please correct the highlighted validation errors before saving.');
    }

    setLoading(true);
    setError('');

    const payload = { name, companyName, email, phone, address };

    try {
      if (client) {
        const res = await api.put(`/clients/${client._id}`, payload);
        onSave(res.data);
      } else {
        const res = await api.post('/clients', payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing client request');
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
        style={{ width: '500px', maxWidth: '90%' }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <span className="fw-semibold text-dark small">
            {client ? 'Edit Client Record' : 'Add New Client'}
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
              <div className="alert alert-danger py-2 px-3 small mb-3 text-break" role="alert" style={{ fontSize: '11px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label" htmlFor="client-name">Client Name *</label>
              <input
                type="text"
                id="client-name"
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
                  Client Name is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="company-name">Company Name *</label>
              <input
                type="text"
                id="company-name"
                className={`form-control form-control-sm ${
                  companyNameTouched ? (isCompanyNameValid ? 'is-valid' : 'is-invalid') : ''
                }`}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onBlur={() => setCompanyNameTouched(true)}
                required
                disabled={loading}
              />
              {companyNameTouched && !isCompanyNameValid && (
                <div className="invalid-feedback text-danger mt-1" style={{ fontSize: '10px' }}>
                  Company Name is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="client-email">Email Address *</label>
              <input
                type="email"
                id="client-email"
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
                  Please enter a valid email address (e.g. client@company.com).
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="client-phone">Phone Number</label>
              <input
                type="text"
                id="client-phone"
                className="form-control form-control-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="client-address">Physical Address</label>
              <textarea
                id="client-address"
                className="form-control form-control-sm"
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
