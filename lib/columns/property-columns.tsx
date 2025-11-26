"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import FormDialog from "@/components/dialogs/FormDialog";
import PropertyForm from "@/components/forms/PropertyForm";

export const propertyColumns: ColumnDef<any>[] = [
  {
    header: "#",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "title",
    header: "Property",
    cell: ({ row }) => {
      const p = row.original;

      // --- FIX: parse string if necessary ---
      const imgArray = Array.isArray(p.image_urls)
        ? p.image_urls
        : typeof p.image_urls === "string"
          ? JSON.parse(p.image_urls)
          : [];

      const img = imgArray.length > 0 ? imgArray[0] : null;

      return (
        <div className="flex items-center gap-3">
          {img ? (
            <Image
              src={img}
              alt={p.title || "property"}
              width={64}
              height={48}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="w-14 h-10 bg-gray-200 rounded-md flex items-center justify-center text-sm">
              No image
            </div>
          )}
          <div>
            <p className="text-14-medium whitespace-nowrap">{p.title || "—"}</p>
            <p className="text-12-regular text-gray-500">{p.address || "—"}</p>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "price", header: "Price (AED)", cell: ({ row }) => <p>AED {row.original.price ?? "—"}</p> },
  { accessorKey: "bedrooms", header: "Beds", cell: ({ row }) => <p>{row.original.bedrooms ?? "—"}</p> },
  { accessorKey: "bathrooms", header: "Baths", cell: ({ row }) => <p>{row.original.bathrooms ?? "—"}</p> },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      const handleDelete = async () => {
        if (!confirm("Delete this property? This cannot be undone.")) return;
        const { error } = await supabase.from("properties").delete().eq("id", item.id);
        if (error) {
          console.error(error);
          toast.error("Failed to delete property");
          return;
        }
        toast.success("Property deleted");
        window.location.reload();
      };

      return (
        <div className="flex gap-2 items-center">
          {/* CREATE */}
          <FormDialog
            trigger={<button className="text-sm px-2 py-1 rounded bg-green-600 text-white">Create</button>}
            title="Add Property"
            description="Create a new property"
          >
            <PropertyForm
              realtorId={item.realtor_id}
              // Uncomment below for production limit logic
              // plan={item.plan}
              // propertyLimit={item.propertyLimit}
              onSuccess={() => window.location.reload()}
            />
          </FormDialog>

          {/* EDIT */}
          <FormDialog
            trigger={<button className="text-sm px-2 py-1 rounded border">Edit</button>}
            title="Edit Property"
            description="Update property details"
          >
            <PropertyForm
              realtorId={item.realtor_id}
              defaultValues={item}
              // Uncomment below for production limit logic
              // plan={item.plan}
              // propertyLimit={item.propertyLimit}
              onSuccess={() => window.location.reload()}
            />
          </FormDialog>

          <button onClick={handleDelete} className="text-sm px-2 py-1 rounded bg-red-600 text-white">
            Delete
          </button>
        </div>
      );
    },
  },
];