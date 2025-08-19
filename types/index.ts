import { LEASE_STATUSES, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES, PAYMENT_STATUSES, USER_ROLES } from "@/constants";




export type LeaseStatus = typeof LEASE_STATUSES[keyof typeof LEASE_STATUSES];
export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES];
export type MaintenanceStatus = typeof MAINTENANCE_STATUSES[keyof typeof MAINTENANCE_STATUSES];
export type MaintenancePriority = typeof MAINTENANCE_PRIORITIES[keyof typeof MAINTENANCE_PRIORITIES];


export type Realtor = {
  id: string;
  email: string;
  full_name?: string;
  password: string;
  company_name: string;
  phone_number?: string;
  address?: string;
  country?: string;
  identification_number?: string;
  identification_documents?: string[];
  created_at?: string;
};



export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  current_period_end: string // or Date if you're converting it
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | string
  created_at: string
}



export type Tenant = {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  identification_type?: string;
  identification_number?: string;
  address?: string;
  country?: string;
  created_at?: string;
};




export interface Property {
  id: string; // UUID
  full_name: string; // User.id
  email: string;
  title: string;
  description?: string | null;
  address: string;
  city?: string | null;
  country?: string | null;
  type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  rent_price?: number | null;
  is_available: boolean;
  created_at: string; // ISO timestamp
};

export interface GetAllProperties {
  limit?: number;
  type?: string;
  description?: string;
  address?: string;
  
}


export interface Lease {
  id: string; // UUID
  property_id: string; // Property.id
  tenant_id: string; // User.id
  start_date?: string | null; // ISO date string
  end_date?: string | null; // ISO date string
  monthly_rent?: number | null;
  deposit_amount?: number | null;
  status: LeaseStatus;
  created_at: string; // ISO timestamp
}

export interface RentPayment {
  id: string; // UUID
  lease_id: string; // Lease.id
  amount?: number | null;
  payment_date?: string | null; // ISO date string
  payment_method?: string | null;
  status: PaymentStatus;
  receipt_url?: string | null;
}
export interface RentTracking {
  id: string; // UUID
  lease_id: string; // Lease.id
  amount?: number | null;
  payment_date?: string | null; // ISO date string
  payment_method?: string | null;
  status: PaymentStatus;
  receipt_url?: string | null;
}


export interface RentReminder {
  id: string; // UUID
  tenant_full_name: string; // Lease.id
  property_address: string;
  amount?: number | null;
  due_date?: string | null; // ISO date string
  status:  'upcoming' | 'overdue';
  receipt_url?: string | null;
}



export interface MaintenanceRequest {
  id: string; // UUID
  lease_id: string; // Lease.id
  submitted_by: string; // User.id
  title: string;
  description?: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Message {
  id: string; // UUID
  sender_id: string; // User.id
  receiver_id: string; // User.id
  content?: string | null;
  timestamp: string; // ISO timestamp
  is_read: boolean;
}

export interface Document {
  id: string; // UUID
  uploaded_by: string; // User.id
  lease_id?: string | null; // Lease.id
  property_id?: string | null; // Property.id
  type?: string | null;
  file_url?: string | null;
  uploaded_at: string; // ISO timestamp
}

export interface Notification {
  id: string; // UUID
  user_id: string; // User.id
  message?: string | null;
  type?: string | null;
  is_read: boolean;
  created_at: string; // ISO timestamp
}

export interface PlanLimit {
  basic: number;
  pro: number;
  premium: number;
}