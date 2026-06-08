import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { StatusBadge } from '../components/EmptyState';
import CustomSelect from '../components/CustomSelect';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true); setError('');
      const res = await api.get(`/reports/${reportType}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(`Failed to load ${reportType} report data`);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [reportType]);

  const renderRevenueChart = () => {
    if (!data?.monthlyRevenue || data.monthlyRevenue.length === 0) return null;

    const maxVal = Math.max(...data.monthlyRevenue.map((d) => d.revenue), 1000);
    const chartHeight = 180;
    const barWidth = 42;
    const gap = 24;
    const paddingLeft = 50;
    const paddingTop = 20;

    return (
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="label-xs" style={{ marginBottom: 20 }}>Monthly Revenue Accumulation</div>
        <div style={{ overflowX: 'auto' }}>
          <svg width={data.monthlyRevenue.length * (barWidth + gap) + paddingLeft + 20} height={chartHeight + 40} style={{ minWidth: '100%', display: 'block' }}>
            <line x1={paddingLeft} y1={paddingTop} x2="100%" y2={paddingTop} stroke="#E5E7EB" strokeDasharray="4" />
            <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2="100%" y2={paddingTop + chartHeight / 2} stroke="#E5E7EB" strokeDasharray="4" />
            <line x1={paddingLeft} y1={paddingTop + chartHeight} x2="100%" y2={paddingTop + chartHeight} stroke="#D1D5DB" />

            <text x={paddingLeft - 10} y={paddingTop + 4} fill="#6B7280" fontSize="11" fontWeight="500" textAnchor="end">{formatCurrency(maxVal)}</text>
            <text x={paddingLeft - 10} y={paddingTop + chartHeight / 2 + 4} fill="#6B7280" fontSize="11" fontWeight="500" textAnchor="end">{formatCurrency(maxVal / 2)}</text>
            <text x={paddingLeft - 10} y={paddingTop + chartHeight + 4} fill="#6B7280" fontSize="11" fontWeight="500" textAnchor="end">$0</text>

            {data.monthlyRevenue.map((d, index) => {
              const barHeight = d.revenue > 0 ? (d.revenue / maxVal) * chartHeight : 4;
              const xPos = paddingLeft + index * (barWidth + gap) + gap/2;
              const yPos = paddingTop + chartHeight - barHeight;

              return (
                <g key={index}>
                  <rect x={xPos} y={yPos} width={barWidth} height={barHeight} fill="#111827" rx="4" />
                  {d.revenue > 0 && (
                    <text x={xPos + barWidth / 2} y={yPos - 8} fill="#111827" fontSize="11" fontWeight="700" textAnchor="middle">
                      {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}
                    </text>
                  )}
                  <text x={xPos + barWidth / 2} y={paddingTop + chartHeight + 20} fill="#6B7280" fontSize="12" fontWeight="500" textAnchor="middle">{d.month}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const CardWrapper = ({ children, title }) => (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
      {title && <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h3>
      </div>}
      <div style={{ overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Review financial statements, workload, and deadlines.</p>
        </div>
        <div style={{ width: 220 }}>
          <CustomSelect
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'revenue', label: 'Revenue Analytics' },
              { value: 'clients', label: 'Client Report' },
              { value: 'projects', label: 'Project Status Report' },
              { value: 'employees', label: 'Employee Workload Report' },
              { value: 'deadlines', label: 'Deadline Warnings' }
            ]}
          />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : error ? <div className="alert alert-danger">{error}</div> : (
        <>
          {reportType === 'revenue' && data && (
            <div>
              <div className="row g-3" style={{ marginBottom: 24 }}>
                {[
                  { l: 'Total Budgets (Scope)', v: formatCurrency(data.totalBudget), icon: 'bi-briefcase' },
                  { l: 'Total Logged Revenue', v: formatCurrency(data.totalRevenue), icon: 'bi-cash-coin' },
                  { l: 'Delivered (Completed)', v: formatCurrency(data.completedProjectRevenue), icon: 'bi-check-circle', color: '#16A34A' }
                ].map((s, i) => (
                  <div key={i} className="col-12 col-md-4">
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <i className={`bi ${s.icon}`} style={{ color: '#9CA3AF' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</span>
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: s.color || '#111827', letterSpacing: '-0.03em' }}>{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>

              {renderRevenueChart()}

              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <CardWrapper title="Revenue Generation by Client">
                    <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: 24 }}>Client Partner</th>
                          <th style={{ textAlign: 'right', paddingRight: 24 }}>Logged Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.revenueByClient.map((client, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 13, fontWeight: 600, color: '#111827', paddingLeft: 24 }}>{client.name}</td>
                            <td style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', textAlign: 'right', paddingRight: 24 }}>{formatCurrency(client.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardWrapper>
                </div>

                <div className="col-12 col-lg-6">
                  <CardWrapper title="Highest Revenue Contracts">
                    <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: 24 }}>Project</th>
                          <th>Scope</th>
                          <th style={{ textAlign: 'right', paddingRight: 24 }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.revenueByProject.map((proj, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 13, fontWeight: 600, color: '#111827', paddingLeft: 24 }}>{proj.name}</td>
                            <td style={{ fontSize: 13, color: '#6B7280' }}>{formatCurrency(proj.budget)}</td>
                            <td style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', textAlign: 'right', paddingRight: 24 }}>{formatCurrency(proj.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardWrapper>
                </div>
              </div>
            </div>
          )}

          {reportType === 'clients' && data && (
            <CardWrapper>
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Client Partner</th>
                    <th>Company</th>
                    <th>Projects (Active/Done)</th>
                    <th>Budget Scope</th>
                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c, i) => (
                    <tr key={i}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{c.clientName}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{c.email}</div>
                      </td>
                      <td style={{ fontSize: 13, color: '#374151' }}>{c.companyName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F3F4F6', color: '#000000', fontSize: 12, fontWeight: 600 }}>{c.activeProjects} active</span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 600 }}>{c.completedProjects} done</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#6B7280' }}>{formatCurrency(c.totalBudget)}</td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', textAlign: 'right', paddingRight: 24 }}>{formatCurrency(c.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardWrapper>
          )}

          {reportType === 'projects' && data && (
            <CardWrapper>
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Project & Deadline</th>
                    <th>Client / Lead</th>
                    <th>Status</th>
                    <th style={{ minWidth: 140 }}>Progress</th>
                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p, i) => (
                    <tr key={i}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{p.projectName}</div>
                        <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>Due: {formatDate(p.deadline)}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>{p.companyName}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>Lead: {p.teamLeader}</div>
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 30 }}>{p.progress}%</span>
                          <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 99 }}>
                            <div style={{ width: `${p.progress}%`, height: '100%', background: '#111827', borderRadius: 99 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', textAlign: 'right', paddingRight: 24 }}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardWrapper>
          )}

          {reportType === 'employees' && data && (
            <CardWrapper>
              <table className="table table-hover align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Staff Member</th>
                    <th>Linked Projects</th>
                    <th>Task Spread (Done/Active/Backlog)</th>
                    <th style={{ minWidth: 140, paddingRight: 24, textAlign: 'right' }}>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((emp, i) => (
                    <tr key={i}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{emp.email}</div>
                      </td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F3F4F6', color: '#374151', fontSize: 12, fontWeight: 600 }}>{emp.projectsCount} projects</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 600 }}>{emp.completedTasks} Done</span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F3F4F6', color: '#000000', fontSize: 12, fontWeight: 600 }}>{emp.inProgressTasks || 0} Active</span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>{emp.pendingTasks} Backlog</span>
                        </div>
                      </td>
                      <td style={{ paddingRight: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 35, textAlign: 'right' }}>{emp.completionRate}%</span>
                          <div style={{ width: 80, height: 5, background: '#E5E7EB', borderRadius: 99 }}>
                            <div style={{ width: `${emp.completionRate}%`, height: '100%', background: '#111827', borderRadius: 99 }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardWrapper>
          )}

          {reportType === 'deadlines' && data && (
            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <CardWrapper title="Overdue Projects">
                  {data.overdueProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#16A34A', fontSize: 13, fontWeight: 500 }}><i className="bi bi-check-circle d-block mb-2" style={{ fontSize: 24 }}/>No overdue projects!</div>
                  ) : (
                    <table className="table align-middle" style={{ marginBottom: 0 }}>
                      <tbody>
                        {data.overdueProjects.map((p, i) => (
                          <tr key={i}>
                            <td style={{ paddingLeft: 24 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{p.name}</div>
                              <div style={{ fontSize: 12, color: '#6B7280' }}>Client: {p.clientName}</div>
                            </td>
                            <td style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{formatDate(p.deadline)}</td>
                            <td style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, textAlign: 'right', paddingRight: 24 }}>{p.daysOverdue} days</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardWrapper>
              </div>

              <div className="col-12 col-lg-6">
                <CardWrapper title="Overdue Tasks">
                  {data.overdueTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#16A34A', fontSize: 13, fontWeight: 500 }}><i className="bi bi-check-circle d-block mb-2" style={{ fontSize: 24 }}/>No overdue tasks!</div>
                  ) : (
                    <table className="table align-middle" style={{ marginBottom: 0 }}>
                      <tbody>
                        {data.overdueTasks.map((t, i) => (
                          <tr key={i}>
                            <td style={{ paddingLeft: 24 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{t.title}</div>
                              <div style={{ fontSize: 12, color: '#6B7280' }}>Proj: {t.projectName}</div>
                            </td>
                            <td style={{ fontSize: 13, color: '#374151' }}>{t.assignedEmployee}</td>
                            <td style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, textAlign: 'right', paddingRight: 24 }}>{t.daysOverdue} days</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardWrapper>
              </div>

              <div className="col-12">
                <CardWrapper title="Upcoming Deadlines (Next 14 Days)">
                  <div className="row g-0">
                    <div className="col-12 col-md-6" style={{ borderRight: '1px solid #E5E7EB', padding: 24 }}>
                      <div className="label-xs" style={{ marginBottom: 16 }}>Projects Due Soon</div>
                      {!data.upcomingProjects.length ? (
                        <div style={{ fontSize: 13, color: '#9CA3AF' }}>None in next 14 days</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {data.upcomingProjects.map(p => (
                            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.name}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>{formatDate(p.deadline)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6" style={{ padding: 24 }}>
                      <div className="label-xs" style={{ marginBottom: 16 }}>Tasks Due Soon</div>
                      {!data.upcomingTasks.length ? (
                        <div style={{ fontSize: 13, color: '#9CA3AF' }}>None in next 14 days</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {data.upcomingTasks.map(t => (
                            <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{t.title}</div>
                                <div style={{ fontSize: 11, color: '#6B7280' }}>{t.assignedEmployee?.name || 'Unassigned'}</div>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>{formatDate(t.deadline)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardWrapper>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
