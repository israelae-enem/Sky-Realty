"use client";

import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import LegalDocumentForm from "@/components/forms/LegalDocumentForm";

export const documentColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  { accessorKey: "type", header: "Type", cell: ({ row }) => <p className="capitalize">{row.original.type || "—"}</p> },
  { accessorKey: "tenants", header: "Tenant", cell: ({ row }) => <p>{row.original.tenants?.full_name || "—"}</p> },
  { accessorKey: "properties", header: "Property", cell: ({ row }) => <p>{row.original.properties?.address || "—"}</p> },
  {
    accessorKey: "file_url",
    header: "File",
    cell: ({ row }) => {
      const url = row.original.file_url;
      return url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View / Download</a>
      ) : (
        <span className="text-gray-600">No file</span>
      );
    },
  },
  { accessorKey: "created_at", header: "Uploaded On", cell: ({ row }) => <p>{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}</p> },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const d = row.original;
      const handleDelete = async () => {
        if (!confirm("Delete this document?")) return;
        const { error } = await supabase.from("legal_documents").delete().eq("id", d.id);
        if (error) {
          toast.error("Failed to delete document");
          return;
        }
        toast.success("Document deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>} title="New Document">
            <LegalDocumentForm/>
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Document">
            <LegalDocumentForm/>
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      );
    },
  },
];