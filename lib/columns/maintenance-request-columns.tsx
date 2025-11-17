"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import MaintenanceForm from "@/components/forms/MaintenanceForm";
import { StatusBadge } from "@/components/StatusBadge";

export const maintenanceRequestColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  {
    accessorKey: "title",
    header: "Issue",
    cell: ({ row }) => {
      const m = row.original;
      const media = m.media_url;
      return (
        <div className="flex items-center gap-3">
          {media ? (
            <Image src={media} alt={m.title || "media"} width={72} height={48} className="rounded-md object-cover" />
          ) : (
            <div className="w-18 h-12 bg-gray-200 rounded-md flex items-center justify-center text-sm">No media</div>
          )}
          <div>
            <p className="text-14-medium">{m.title}</p>
            <p className="text-12-regular text-gray-500 truncate max-w-[200px]">{m.description || "—"}</p>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "tenant_name", header: "Tenant", cell: ({ row }) => <p>{row.original.tenant_name ?? row.original.tenant?.full_name ?? "—"}</p> },
  { accessorKey: "priority", header: "Priority", cell: ({ row }) => <p className="capitalize">{row.original.priority ?? "—"}</p> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="min-w-[115px]"><StatusBadge status={row.original.status} /></div> },
  { accessorKey: "created_at", header: "Requested On", cell: ({ row }) => <p>{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}</p> },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const m = row.original;
      const handleDelete = async () => {
        if (!confirm("Delete this maintenance request?")) return;
        const { error } = await supabase.from("maintenance_request").delete().eq("id", m.id);
        if (error) {
          toast.error("Failed to delete request");
          return;
        }
        toast.success("Request deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>} title="New Maintenance">
            <MaintenanceForm />
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Maintenance">
            <MaintenanceForm />
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      );
    },
  },
];