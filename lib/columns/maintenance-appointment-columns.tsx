"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { StatusBadge } from "@/components/StatusBadge";

export const appointmentColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  { accessorKey: "tenant_name", header: "Tenant", cell: ({ row }) => <p className="text-14-medium">{row.original.tenant_name || row.original.tenant?.full_name || "—"}</p> },
  {
    accessorKey: "appointment_date",
    header: "Appointment",
    cell: ({ row }) => {
      const dt = row.original.appointment_date || row.original.appointment_datetime;
      return <p className="text-14-regular min-w-[140px]">{dt ? format(new Date(dt), "yyyy-MM-dd HH:mm") : "—"}</p>;
    },
  },
  { accessorKey: "contractor", header: "Contractor", cell: ({ row }) => <p>{row.original.contractor ?? "—"}</p> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="min-w-[115px]"><StatusBadge status={row.original.status} /></div> },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const a = row.original;
      const handleDelete = async () => {
        if (!confirm("Delete this appointment?")) return;
        const { error } = await supabase.from("appointments").delete().eq("id", a.id);
        if (error) {
          toast.error("Failed to delete appointment");
          return;
        }
        toast.success("Appointment deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>} title="New Appointment">
            <AppointmentForm realtorId={a.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Appointment">
            <AppointmentForm realtorId={a.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      );
    },
  },
];