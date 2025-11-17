"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import RentPaymentForm from "@/components/forms/RentPaymentForm";
import RentReminderForm from "@/components/forms/RentReminderForm";
import { StatusBadge } from "@/components/StatusBadge";

export const rentColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  {
    accessorKey: "tenant_name",
    header: "Tenant",
    cell: ({ row }) => {
      const r = row.original;
      const avatar = r.tenant_avatar || r.avatar_url || null;
      return (
        <div className="flex items-center gap-3">
          {avatar ? (
            <Image src={avatar} alt={r.tenant_name || "tenant"} width={40} height={40} className="rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">—</div>
          )}
          <p className="text-14-medium">{r.tenant_name || r.tenant?.full_name || "—"}</p>
        </div>
      );
    },
  },
  { accessorKey: "property_name", header: "Property", cell: ({ row }) => <p>{row.original.property_name || row.original.property_title || "—"}</p> },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => <p>AED {row.original.amount ?? "—"}</p> },
  { accessorKey: "due_date", header: "Due Date", cell: ({ row }) => <p>{row.original.due_date ? format(new Date(row.original.due_date), "yyyy-MM-dd") : "—"}</p> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="min-w-[115px]"><StatusBadge status={row.original.status || row.original.payment_status} /></div> },
  { accessorKey: "paid_on", header: "Paid On", cell: ({ row }) => row.original.paid_on ? <p>{new Date(row.original.paid_on).toLocaleDateString()}</p> : <span>—</span> },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const r = row.original;
      const handleDelete = async () => {
        if (!confirm("Delete this payment record?")) return;
        const { error } = await supabase.from("rent_payment").delete().eq("id", r.id);
        if (error) {
          toast.error("Failed to delete payment");
          return;
        }
        toast.success("Payment deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create Payment</button>} title="Add Payment">
            <RentPaymentForm realtorId={r.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Payment">
            <RentPaymentForm realtorId={r.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-blue-600 text-white">Send Reminder</button>} title="Send Rent Reminder">
            <RentReminderForm realtorId={r.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      );
    },
  },
];