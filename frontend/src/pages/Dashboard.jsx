import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { StatusBadge } from '../components/EmptyState';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/* ── KPI Card ────────────────────────────────────────────── */
const KPICard = ({ label, value, sub, icon, iconBg, iconColor, danger }) => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 24px', transition: 'box-shadow 0.2s, transform 0.2s' }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ fontSize: 18, color: iconColor }} />
      </div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, color: danger ? '#DC2626' : '#111827', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</div>}
  </div>
);

const COLORS = ['#111827', '#6B7280', '#D1D5DB', '#F59E0B'];

/* ── Main Dashboard ──────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { metrics, role, upcomingDeadlines } = data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] || role;

  const adminCards = [
    { label: 'Total Revenue',  value: formatCurrency(metrics.totalRevenue),  sub: `Budget: ${formatCurrency(metrics.totalBudget)}`, icon: 'bi-cash-stack', iconBg: '#F0FDF4', iconColor: '#16A34A' },
    { label: 'Total Projects', value: metrics.totalProjects,                 sub: `${metrics.ongoingProjects} ongoing · ${metrics.completedProjects} completed`, icon: 'bi-kanban-fill', iconBg: '#F3F4F6', iconColor: '#111827' },
    { label: 'Total Clients',  value: metrics.totalClients,                  sub: 'Registered accounts',   icon: 'bi-building',  iconBg: '#F0F9FF', iconColor: '#0891B2' },
    { label: 'Overdue',        value: metrics.overdueProjects,               sub: 'Projects past deadline', icon: 'bi-exclamation-triangle-fill', iconBg: '#FEF2F2', iconColor: '#DC2626', danger: metrics.overdueProjects > 0 },
  ];
  const leaderCards = [
    { label: 'My Projects',     value: metrics.totalProjects,                sub: `${metrics.ongoingProjects} ongoing`,        icon: 'bi-kanban-fill',  iconBg: '#F3F4F6', iconColor: '#111827' },
    { label: 'Completion Rate', value: `${metrics.taskCompletionRate}%`,     sub: `${metrics.completedTasks}/${metrics.totalTasks} tasks`, icon: 'bi-check2-circle', iconBg: '#F0FDF4', iconColor: '#16A34A' },
    { label: 'In Review',       value: metrics.reviewTasks,                  sub: 'Awaiting approval',      icon: 'bi-hourglass-split', iconBg: '#FFFBEB', iconColor: '#D97706' },
    { label: 'Overdue',         value: metrics.overdueProjects,              sub: 'Past deadline',          icon: 'bi-clock-history',   iconBg: '#FEF2F2', iconColor: '#DC2626', danger: metrics.overdueProjects > 0 },
  ];
  const empCards = [
    { label: 'Assigned Tasks',  value: metrics.totalTasks,                   sub: 'Total tasks to you', icon: 'bi-list-task',       iconBg: '#F3F4F6', iconColor: '#111827' },
    { label: 'In Progress',     value: metrics.inProgressTasks,              sub: 'Currently active',   icon: 'bi-play-circle-fill', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
    { label: 'Completed',       value: metrics.completedTasks,               sub: 'Closed out',         icon: 'bi-check2-circle',   iconBg: '#F0FDF4', iconColor: '#16A34A' },
    { label: 'Overdue Tasks',   value: metrics.overdueTasks,                 sub: 'Past due date',      icon: 'bi-alarm-fill',      iconBg: '#FEF2F2', iconColor: '#DC2626', danger: metrics.overdueTasks > 0 },
  ];

  const cards = role === 'Admin' ? adminCards : role === 'Team Leader' ? leaderCards : empCards;

  // Render Admin Analytics
  const renderAdminAnalytics = () => {
    const pendingProjects = metrics.totalProjects - (metrics.completedProjects + metrics.ongoingProjects);
    const distributionData = [
      { name: 'Completed', value: metrics.completedProjects },
      { name: 'In Progress', value: metrics.ongoingProjects },
      { name: 'Pending', value: pendingProjects > 0 ? pendingProjects : 0 },
    ].filter(d => d.value > 0);

    return (
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: 440, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-clock-history" style={{ color: '#111827' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Upcoming Project Deadlines</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="table table-hover" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                  <tr>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Title</th>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Deadline</th>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDeadlines?.projects?.length > 0 ? (
                    upcomingDeadlines.projects.map((row) => (
                      <tr key={row._id} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#111827', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>{row.name}</td>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#DC2626', borderBottom: '1px solid #F3F4F6', fontWeight: 600 }}>{formatDate(row.deadline)}</td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}><StatusBadge status={row.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '40px 24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>No upcoming project deadlines.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: 440, display: 'flex', flexDirection: 'column' }}>
             <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-pie-chart-fill" style={{ color: '#111827' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Project Distribution</span>
             </div>
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {distributionData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                       {distributionData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div style={{ color: '#6B7280', fontSize: 13 }}>No projects found.</div>
               )}
             </div>
             <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {distributionData.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                      <span style={{ fontSize: 13, color: '#4B5563' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {((entry.value / metrics.totalProjects) * 100).toFixed(1)}% ({entry.value})
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Team Leader Analytics
  const renderTeamLeaderAnalytics = () => {
    const distributionData = [
      { name: 'Completed', value: metrics.completedTasks },
      { name: 'In Progress', value: metrics.inProgressTasks },
      { name: 'Review', value: metrics.reviewTasks },
      { name: 'Pending', value: metrics.pendingTasks },
    ].filter(d => d.value > 0);

    return (
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: 440, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-clock-history" style={{ color: '#111827' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Upcoming Project Deadlines</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="table table-hover" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                  <tr>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Title</th>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Deadline</th>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDeadlines?.projects?.length > 0 ? (
                    upcomingDeadlines.projects.map((row) => (
                      <tr key={row._id} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#111827', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>{row.name}</td>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#DC2626', borderBottom: '1px solid #F3F4F6', fontWeight: 600 }}>{formatDate(row.deadline)}</td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}><StatusBadge status={row.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '40px 24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>No upcoming project deadlines.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: 440, display: 'flex', flexDirection: 'column' }}>
             <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-pie-chart-fill" style={{ color: '#111827' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Task Status Overview</span>
             </div>
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {distributionData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                       {distributionData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div style={{ color: '#6B7280', fontSize: 13 }}>No tasks found.</div>
               )}
             </div>
             <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {distributionData.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                      <span style={{ fontSize: 13, color: '#4B5563' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {((entry.value / metrics.totalTasks) * 100).toFixed(1)}% ({entry.value})
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Employee Analytics
  const renderEmployeeAnalytics = () => {
    const distributionData = [
      { name: 'Completed', value: metrics.completedTasks },
      { name: 'In Progress', value: metrics.inProgressTasks },
      { name: 'Review', value: metrics.reviewTasks },
      { name: 'Pending', value: metrics.pendingTasks },
    ].filter(d => d.value > 0);

    return (
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: 440, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-clock-history" style={{ color: '#111827' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>My Upcoming Tasks</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="table table-hover" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                  <tr>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Task</th>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Deadline</th>
                    <th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12, padding: '16px 24px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', background: '#F9FAFB' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDeadlines?.tasks?.length > 0 ? (
                    upcomingDeadlines.tasks.map((row) => (
                      <tr key={row._id} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#111827', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                          <div style={{ marginBottom: 2 }}>{row.title}</div>
                          {row.project?.name && <div style={{ fontSize: 11, color: '#6B7280' }}>Project: {row.project.name}</div>}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#DC2626', borderBottom: '1px solid #F3F4F6', fontWeight: 600 }}>{formatDate(row.deadline)}</td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}><StatusBadge status={row.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '40px 24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>No upcoming tasks due soon.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', height: 440, display: 'flex', flexDirection: 'column' }}>
             <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-pie-chart-fill" style={{ color: '#111827' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>My Task Distribution</span>
             </div>
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {distributionData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                       {distributionData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div style={{ color: '#6B7280', fontSize: 13 }}>No tasks found.</div>
               )}
             </div>
             <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {distributionData.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                      <span style={{ fontSize: 13, color: '#4B5563' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {((entry.value / metrics.totalTasks) * 100).toFixed(1)}% ({entry.value})
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Good {greeting}, {firstName}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Here's what's happening across your workspace today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#6B7280', flexShrink: 0 }}>
          <i className="bi bi-calendar3" style={{ color: '#111827' }} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3" style={{ marginBottom: 28 }}>
        {cards.map((c, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <KPICard {...c} />
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      {role === 'Admin' && renderAdminAnalytics()}
      {role === 'Team Leader' && renderTeamLeaderAnalytics()}
      {role === 'Employee' && renderEmployeeAnalytics()}
    </div>
  );
};

export default Dashboard;
