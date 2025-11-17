"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import TenantForm from "@/components/forms/TenantForm";
import { StatusBadge } from "@/components/StatusBadge";

export const tenantColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  {
    accessorKey: "full_name",
    header: "Tenant",
    cell: ({ row }) => {
      const t = row.original;
      const avatar = t.avatar_url || t.profile?.avatar || null;
      return (
        <div className="flex items-center gap-3">
          {avatar ? (
            <Image src={avatar} alt={t.full_name || "tenant"} width={48} height={48} className="rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">—</div>
          )}
          <div>
            <p className="text-14-medium">{t.full_name || "—"}</p>
            <p className="text-12-regular text-gray-500">{t.email || t.phone || ""}</p>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "email", header: "Email", cell: ({ row }) => <p>{row.original.email || "—"}</p> },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => <p>{row.original.phone || "—"}</p> },
  { accessorKey: "property_title", header: "Property", cell: ({ row }) => <p>{row.original.property_title || row.original.property_name || "—"}</p> },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => <p>{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}</p>,
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="min-w-[115px]"><StatusBadge status={row.original.status} /></div> },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const t = row.original;
      const handleDelete = async () => {
        if (!confirm("Delete this tenant?")) return;
        const { error } = await supabase.from("tenants").delete().eq("id", t.id);
        if (error) {
          toast.error("Failed to delete tenant");
          return;
        }
        toast.success("Tenant deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>} title="Add Tenant">
            <TenantForm realtorId={t.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Tenant">
            <TenantForm realtorId={t.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      );
    },
  },
];