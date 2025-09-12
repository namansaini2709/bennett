// Centralized report status configuration to ensure consistency across all components
export const REPORT_STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    description: 'Report has been submitted and is waiting for acknowledgment'
  },
  acknowledged: {
    label: 'Acknowledged',
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    description: 'Report has been acknowledged by the administration'
  },
  assigned: {
    label: 'Assigned',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    description: 'Report has been assigned to a staff member'
  },
  in_progress: {
    label: 'In Progress',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    description: 'Work is in progress on this report'
  },
  resolved: {
    label: 'Resolved',
    color: '#4CAF50',
    bgColor: '#E8F5E8',
    description: 'Report has been resolved successfully'
  },
  rejected: {
    label: 'Rejected',
    color: '#F44336',
    bgColor: '#FFEBEE',
    description: 'Report has been rejected'
  },
  closed: {
    label: 'Closed',
    color: '#757575',
    bgColor: '#F5F5F5',
    description: 'Report has been closed'
  }
};

// Helper functions for consistent status handling
export const getStatusLabel = (status) => {
  return REPORT_STATUS_CONFIG[status]?.label || status;
};

export const getStatusColor = (status) => {
  return REPORT_STATUS_CONFIG[status]?.color || '#666';
};

export const getStatusBgColor = (status) => {
  return REPORT_STATUS_CONFIG[status]?.bgColor || '#F5F5F5';
};

export const getStatusDescription = (status) => {
  return REPORT_STATUS_CONFIG[status]?.description || 'Unknown status';
};

// Get all available status options for forms/selects
export const getStatusOptions = () => {
  return Object.keys(REPORT_STATUS_CONFIG).map(key => ({
    value: key,
    label: REPORT_STATUS_CONFIG[key].label,
    color: REPORT_STATUS_CONFIG[key].color
  }));
};

// Check if status indicates pending work
export const isPendingStatus = (status) => {
  return ['submitted', 'acknowledged', 'assigned', 'in_progress'].includes(status);
};

// Check if status indicates completion
export const isCompletedStatus = (status) => {
  return ['resolved', 'rejected', 'closed'].includes(status);
};