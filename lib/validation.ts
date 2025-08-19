// lib/validation.ts
import { z } from "zod";
import { PAYMENT_STATUSES, MAINTENANCE_PRIORITIES,MAINTENANCE_STATUSES,LEASE_STATUSES } from "@/constants";

// 📌 User validationimport { z } from 'zod';

export const realtorFormSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  company_name: z.string(),
  address: z.string(),
  country: z.string(),
  password: z.string(),
  

});

export type LandlordFormData = z.infer<typeof realtorFormSchema>;


export const SubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  stripe_customer_id: z.string(),
  stripe_subscription_id: z.string(),
  stripe_price_id: z.string(),
  current_period_end: z.string(), // or Date if you're converting it
  status: z.enum(['active', 'trialing', 'past_due', 'canceled', 'incomplete']),
  created_at: z.string()
})







export const tenantFormSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  agent_name: z.string(),
  realtor_id: z.string(),
  country: z.string(),
  phone_number: z.string() .min(2),
  password: z.string() .min(8),
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;



// 📌 Property validation
export const propertySchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().uuid(),
  email: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().optional(),
  country: z.string().optional(),
  type: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  rent_price: z.number().min(0).optional(),
  is_available: z.boolean().default(true),
  created_at: z.string().optional(),
});

// 📌 Lease validation
export const leaseSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  monthly_rent: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  status: z.enum([
    LEASE_STATUSES.ACTIVE,
    LEASE_STATUSES.TERMINATED,
    LEASE_STATUSES.PENDING,
  ]),
  created_at: z.string().optional(),
});

// 📌 Payment validation
export const paymentSchema = z.object({
  id: z.string().uuid(),
  lease_id: z.string().uuid(),
  amount: z.number().min(0).optional(),
  payment_date: z.string().optional(),
  payment_method: z.string().optional(),
  status: z.enum([
    PAYMENT_STATUSES.PENDING,
    PAYMENT_STATUSES.COMPLETED,
    PAYMENT_STATUSES.FAILED,
  ]),
  receipt_url: z.string().url().optional(),
});

// 📌 Maintenance request validation
export const maintenanceSchema = z.object({
  id: z.string().uuid(),
  lease_id: z.string().uuid(),
  submitted_by: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum([
    MAINTENANCE_STATUSES.OPEN,
    MAINTENANCE_STATUSES.IN_PROGRESS,
    MAINTENANCE_STATUSES.RESOLVED,
    MAINTENANCE_STATUSES.CLOSED,
  ]),
  priority: z.enum([
    MAINTENANCE_PRIORITIES.LOW,
    MAINTENANCE_PRIORITIES.MEDIUM,
    MAINTENANCE_PRIORITIES.HIGH,
  ]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// 📌 Message validation
export const messageSchema = z.object({
  id: z.string().uuid(),
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  content: z.string().optional(),
  timestamp: z.string().optional(),
  is_read: z.boolean().default(false),
});

// 📌 Document validation
export const documentSchema = z.object({
  id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  lease_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
  type: z.string().optional(),
  file_url: z.string().url().optional(),
  uploaded_at: z.string().optional(),
});

// 📌 Notification validation
export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  message: z.string().optional(),
  type: z.string().optional(),
  is_read: z.boolean().default(false),
  created_at: z.string().optional(),
});