import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState, { StatusBadge } from '../components/EmptyState';
import ClientModal from '../components/ClientModal';
import ConfirmModal from '../components/ConfirmModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [clientDetails, setClientDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  const fetchClients = async () => {
    try { setLoading(true); const res = await api.get(`/clients?search=${search}&page=${page}&limit=10`); setClients(res.data.clients); setPages(res.data.pages); setTotal(res.data.total); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [page]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchClients(); };
  const handleOpenAdd = () => { setSelectedClient(null); setShowClientModal(true); };
  const handleOpenEdit = (c, e) => { e.stopPropagation(); setSelectedClient(c); setShowClientModal(true); };
  const handleOpenDelete = (c, e) => { e.stopPropagation(); setClientToDelete(c); setShowConfirmModal(true); };
  
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/clients/${clientToDelete._id}`);
      setClients((prev) => prev.filter((c) => c._id !== clientToDelete._id));
      setShowConfirmModal(false);
      if (clientDetails?.client?._id === clientToDelete._id) setShowDetailsPanel(false);
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete client'); }
  };

  const handleSaveSuccess = () => { fetchClients(); };

  const handleViewDetails = async (client) => {
    try {
      setDetailsLoading(true); setShowDetailsPanel(true);
      const res = await api.get(`/clients/${client._id}`);
      setClientDetails(res.data);
    } catch (e) { console.error(e); setShowDetailsPanel(false); } finally { setDetailsLoading(false); }
  };

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
              <SvgIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" color="#111827" size={16} />
              <h1 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Clients</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#F3F4F6', color: '#6B7280' }}>{total} total</span>
            </div>
            <button onClick={handleOpenAdd} style={{ height: 36, padding: '0 14px', background: '#111827', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(17,24,39,0.25)' }}>
              <SvgIcon d="M12 5v14M5 12h14" color="#fff" size={14} />
              Add Client
            </button>
          </div>

          {/* Filters */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 0 }}>
              <div style={{ position: 'relative', width: 280 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                  <SvgIcon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={14} />
                </span>
                <input type="text" placeholder="Search client or company…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', height: 34, border: '1px solid #E5E7EB', borderRadius: '8px 0 0 8px', paddingLeft: 32, paddingRight: 12, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827' }}
                  onFocus={(e) => e.target.style.borderColor = '#111827'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <button type="submit" style={{ height: 34, padding: '0 16px', background: '#111827', border: 'none', borderRadius: '0 8px 8px 0', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Search</button>
            </form>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? <LoadingSpinner /> : clients.length === 0 ? (
              <EmptyState title="No Clients Found" description="Start by registering a client. All budgets and revenues are tracked per client." actionText="Add New Client" onAction={handleOpenAdd} />
            ) : (
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Projects</th>
                    <th>Revenue</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => {
                    const isSelected = clientDetails?.client?._id === c._id && showDetailsPanel;
                    return (
                      <tr key={c._id} onClick={() => handleViewDetails(c)} style={{ cursor: 'pointer', background: isSelected ? '#F3F4F6' : undefined }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{c.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{c.companyName}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 13, color: '#4B5563' }}>{c.email}</span>
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.phone || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '2px 8px', background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0369A1', fontSize: 12, fontWeight: 600, borderRadius: 6 }}>
                            {c.projectCount}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{formatCurrency(c.totalRevenue)}</td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                            <button onClick={(e) => handleOpenEdit(c, e)} title="Edit" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.color = '#111827'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                            >
                              <SvgIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={13} />
                            </button>
                            <button onClick={(e) => handleOpenDelete(c, e)} title="Delete" style={{ width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}
                            >
                              <SvgIcon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ padding: '12px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Page <strong style={{ color: '#111827' }}>{page}</strong> of {pages}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} style={{ padding: '4px 12px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
                <button disabled={page === pages} onClick={() => setPage((p) => Math.min(p + 1, pages))} style={{ padding: '4px 12px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#374151', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1 }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      {showDetailsPanel && (
        <div className="col-12 col-xl-5">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-person-lines-fill" style={{ color: '#111827' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Client Summary</span>
              </div>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>✕</button>
            </div>

            {detailsLoading ? <LoadingSpinner /> : clientDetails ? (
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F3F4F6', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px' }}>
                    {clientDetails.client.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.3 }}>{clientDetails.client.name}</h2>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{clientDetails.client.companyName}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 24 }}>
                  <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 9, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className="bi bi-envelope text-muted" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{clientDetails.client.email}</div>
                    </div>
                  </div>
                  <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 9, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className="bi bi-telephone text-muted" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{clientDetails.client.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 9, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className="bi bi-geo-alt text-muted" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Address</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{clientDetails.client.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="label-xs" style={{ marginBottom: 10 }}>Revenue Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Total Budget</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{formatCurrency(clientDetails.revenueSummary.totalBudget)}</div>
                    </div>
                    <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Collected</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>{formatCurrency(clientDetails.revenueSummary.totalRevenue)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="label-xs" style={{ marginBottom: 10 }}>Projects ({clientDetails.projects.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {!clientDetails.projects.length ? (
                      <div style={{ textAlign: 'center', padding: '16px 0', color: '#9CA3AF', fontSize: 13 }}>No projects assigned</div>
                    ) : clientDetails.projects.map(p => (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Due: {formatDate(p.deadline)}</div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <ClientModal show={showClientModal} client={selectedClient} onClose={() => setShowClientModal(false)} onSave={handleSaveSuccess} />
      <ConfirmModal show={showConfirmModal} title="Delete Client" message={`Delete ${clientToDelete?.name}? This action cannot be undone and requires no active projects.`} confirmText="Delete Client" isDanger={true} onConfirm={handleDeleteConfirm} onCancel={() => setShowConfirmModal(false)} />
    </div>
  );
};

export default Clients;
