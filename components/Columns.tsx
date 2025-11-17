// ==============================
//  SKY REALTY — TABLE COLUMNS
// ==============================

import { ColumnDef } from "@tanstack/react-table";

// ------------------------------
// Property Columns
// ------------------------------
export const propertyColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "name", header: "Property Name" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "bedrooms", header: "Beds" },
  { accessorKey: "bathrooms", header: "Baths" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "rent_amount",
    header: "Rent (AED)",
    cell: ({ row }) => AED ${row.original.rent_amount},
  },
];

// ------------------------------
// Listing Columns
// ------------------------------
export const listingColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "property_name", header: "Property" },
  {
    accessorKey: "price",
    header: "Listing Price",
    cell: ({ row }) => AED ${row.original.price},
  },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "views", header: "Views" },
  {
    accessorKey: "created_at",
    header: "Listed On",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
];

// ------------------------------
// Tenant Columns
// ------------------------------
export const tenantColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "full_name", header: "Tenant Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "property_name", header: "Property" },
  {
    accessorKey: "lease_start",
    header: "Lease Start",
    cell: ({ row }) => new Date(row.original.lease_start).toLocaleDateString(),
  },
  {
    accessorKey: "lease_end",
    header: "Lease End",
    cell: ({ row }) => new Date(row.original.lease_end).toLocaleDateString(),
  },
  { accessorKey: "status", header: "Status" },
];

// ------------------------------
// Maintenance Request Columns
// ------------------------------
export const maintenanceColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "property_name", header: "Property" },
  { accessorKey: "tenant_name", header: "Tenant" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "created_at",
    header: "Requested On",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
];

// ------------------------------
// Maintenance Appointments
// ------------------------------
export const appointmentColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "property_name", header: "Property" },
  { accessorKey: "contractor", header: "Contractor" },
  {
    accessorKey: "appointment_date",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.appointment_date).toLocaleString(),
  },
  { accessorKey: "status", header: "Status" },
];

// ------------------------------
// Documents
// ------------------------------
export const documentColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "title", header: "Document Name" },
  { accessorKey: "property_name", header: "Property" },
  { accessorKey: "tenant_name", header: "Tenant" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "created_at",
    header: "Uploaded On",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
];

// ------------------------------
// Rent Payments
// ------------------------------
export const rentColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "tenant_name", header: "Tenant" },
  { accessorKey: "property_name", header: "Property" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => AED ${row.original.amount},
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString(),
  },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "paid_on",
    header: "Paid On",
    cell: ({ row }) =>
      row.original.paid_on
        ? new Date(row.original.paid_on).toLocaleDateString()
        : "—",
  },
];