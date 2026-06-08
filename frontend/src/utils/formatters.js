export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Returns inline style object for tinted status badges
export const getStatusBadgeStyle = (status) => {
  const map = {
    'Not Started': { background: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB' },
    'Pending':     { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
    'In Progress': { background: '#F3F4F6', color: '#000000', border: '1px solid #E5E7EB' },
    'Testing':     { background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' },
    'Review':      { background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' },
    'Completed':   { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
    'Delayed':     { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
    'Active':      { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
    'Inactive':    { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
    'Urgent':      { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
    'High':        { background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' },
    'Medium':      { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
    'Low':         { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
  };
  return { fontWeight: 600, ...(map[status] || { background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }) };
};

// Legacy className helper — kept for backward compat
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Not Started':
    case 'Pending':    return 'bg-secondary text-dark border';
    case 'In Progress': return 'bg-dark text-white';
    case 'Testing':
    case 'Review':     return 'bg-light text-dark border border-dark';
    case 'Completed':  return 'bg-success text-white';
    case 'Delayed':
    case 'Urgent':     return 'bg-danger text-white';
    case 'High':       return 'bg-warning text-dark';
    case 'Medium':     return 'bg-info text-dark';
    case 'Low':        return 'bg-light text-dark border';
    default:           return 'bg-secondary text-white';
  }
};
