"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import ListingForm from "@/components/forms/ListingForm";
import { StatusBadge } from "@/components/StatusBadge";

export const listingColumns: ColumnDef<any>[] = [
  { header: "#", cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p> },
  {
    accessorKey: "title",
    header: "Listing",
    cell: ({ row }) => {
      const l = row.original;
      const img = Array.isArray(l.image_urls) && l.image_urls[0];
      return (
        <div className="flex items-center gap-3">
          {img ? (
            <Image src={img} alt={l.title || "listing"} width={72} height={48} className="rounded-md object-cover" />
          ) : (
            <div className="w-16 h-10 bg-gray-200 rounded-md flex items-center justify-center text-sm">No image</div>
          )}
          <div>
            <p className="text-14-medium">{l.title || "—"}</p>
            <p className="text-12-regular text-gray-500">{l.property_title || l.property_name || "—"}</p>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "price", header: "Price (AED)", cell: ({ row }) => <p>AED {row.original.price ?? "—"}</p> },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="min-w-[115px]"><StatusBadge status={row.original.status} /></div>,
  },
  { accessorKey: "views", header: "Views", cell: ({ row }) => <p>{row.original.views ?? 0}</p> },
  {
    accessorKey: "created_at",
    header: "Listed On",
    cell: ({ row }) => <p>{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}</p>,
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const l = row.original;
      const handleDelete = async () => {
        if (!confirm("Delete this listing?")) return;
        const { error } = await supabase.from("listings").delete().eq("id", l.id);
        if (error) {
          toast.error("Failed to delete listing");
          return;
        }
        toast.success("Listing deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2">
          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>} title="Add Listing">
            <ListingForm realtorId={l.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <FormDialog trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>} title="Edit Listing">
            <ListingForm realtorId={l.realtor_id} onSuccess={() => window.location.reload()} />
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      );
    },
  },
];