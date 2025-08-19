// constants.ts

export const USER_ROLES = {
  LANDLORD: 'landlord',
  AGENT: 'agent',
  TENANT: 'tenant',
} as const;

export const LEASE_STATUSES = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  PENDING: 'pending',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const MAINTENANCE_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const MAINTENANCE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const MESSAGE_DEFAULTS = {
  IS_READ: false,
};

export const NOTIFICATION_DEFAULTS = {
  IS_READ: false,
};