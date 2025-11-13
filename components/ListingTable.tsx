"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTrash, FaEdit, FaSave, FaPlus } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import { redirect, useRouter } from "next/navigation";

type Property = {
  id: string;
  title: string;
  address: string;
  price: number | null;
  image_urls?: string[] | null; // may store URLs or paths
  realtor_id?: string;
  created_at?: string;
};

interface ListingTableProps {
  currentPlan: string; // "basic" | "pro" | "premium"
  userId: string; // Clerk user id
}

const PLAN_LIMITS: Record<string, number | null> = {
  basic: 10,
  pro: 20,
  premium: null,
};

export default function ListingTable({ currentPlan, userId }: ListingTableProps) {
  const router = useRouter
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    title: "",
    address: "",
    price: null,
    image_urls: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mobileAddOpen, setMobileAddOpen] = useState<boolean>(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const maxProperties = PLAN_LIMITS[currentPlan] ?? null;

  // Fetch properties for current realtor
  const fetchProperties = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("realtor_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties((data as Property[]) || []);
    } catch (err) {
      console.error("fetchProperties error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // helper to resolve image URL (handles stored public url or storage path)
  const resolveImageUrl = (img?: string) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const { data } = supabase.storage.from("property-images").getPublicUrl(img);
    return data?.publicUrl ?? null;
  };

  // upload one file to supabase and return public url string (and store path)
  const uploadImage = async (file: File, optPathPrefix?: string) => {
    const fileExt = file.name.split(".").pop();
    const filename = `${Date.now()}.${fileExt}`;
    const path = optPathPrefix ? `${optPathPrefix}/${filename}` : `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage.from("property-images").upload(path, file, { upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("Could not get publicUrl");
    return { publicUrl: data.publicUrl, path };
  };

  // Add new property
  const handleAdd = async () => {
    if (!userId) return alert("Please sign in.");
    const limit = maxProperties;
    if (limit !== null && properties.length >= limit) {
      return alert(`You have reached your plan limit of ${limit} properties.`);
    }
    if (!newProperty.title || !newProperty.address) return alert("Title and address are required.");

    try {
      setLoading(true);
      // ensure price numeric or null
      const payload = {
        title: newProperty.title,
        address: newProperty.address,
        price: newProperty.price ? Number(newProperty.price) : null,
        image_urls: newProperty.image_urls && (newProperty.image_urls as string[]).length ? newProperty.image_urls : null,
        realtor_id: userId,
      };

      const { data, error } = await supabase.from("properties").insert([payload]).select().single();

      if (error) throw error;
      setProperties((p) => [data as Property, ...p]);
      setNewProperty({ title: "", address: "", price: null, image_urls: [] });
      setMobileAddOpen(false);
    } catch (err) {
      console.error("handleAdd error:", err);
      alert("Failed to add property.");
    } finally {
      setLoading(false);
    }
  };

  // Update existing property
  const handleUpdate = async (id: string) => {
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("properties")
        .update({
          title: prop.title,
          address: prop.address,
          price: prop.price ?? null,
          image_urls: prop.image_urls ?? null,
        })
        .eq("id", id);

      if (error) throw error;
      setEditingId(null);
      await fetchProperties();
    } catch (err) {
      console.error("handleUpdate error:", err);
      alert("Failed to update property.");
    } finally {
      setLoading(false);
    }
  };

  // Delete property
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      setLoading(true);
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("handleDelete error:", err);
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  // handle image input for either newProperty or existing property
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, targetId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // indicate uploading
      if (targetId) setUploadingId(targetId);
      else setUploadingId("new");

      // upload to bucket under realtor folder for organization
      const prefix = userId ?? "anon";
      const { publicUrl, path } = await uploadImage(file, `properties/${prefix}`);

      if (targetId) {
        // update property record with new image (prepend to image_urls array)
        const prop = properties.find((p) => p.id === targetId);
        const newUrls = prop?.image_urls ? [...(prop.image_urls as string[]), path] : [path];

        const { error } = await supabase.from("properties").update({ image_urls: newUrls }).eq("id", targetId);
        if (error) throw error;
        // refresh one entry locally to avoid full fetch
        setProperties((prev) => prev.map((p) => (p.id === targetId ? { ...p, image_urls: newUrls } : p)));
      } else {
        // for new property, store the storage path (not publicUrl) so we can derive public url later
        setNewProperty((s) => ({ ...(s ?? {}), image_urls: [...(s?.image_urls || []), path] }));
      }
    } catch (err) {
      console.error("handleImageChange error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingId(null);
    }
  };

  // derived helper to display image for property: prefer stored public URL if full url, else getPublicUrl for path
  const getDisplayImage = (prop?: Property) => {
    const img = prop?.image_urls && prop.image_urls.length ? (prop.image_urls[0] as string) : null;
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const { data } = supabase.storage.from("property-images").getPublicUrl(img);
    return data?.publicUrl ?? null;
  };

  const canAdd = !maxProperties || properties.length < (maxProperties ?? Infinity);

  const listingStats = {
    total: properties.length,
    active: properties.filter((p) => p.price !== null).length,
    inactive: properties.filter((p) => p.price === null).length,
    totalValue: properties.reduce((sum, p) => sum + (p.price ?? 0), 0),
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">

   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div className="bg-gray-300 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow">
    <h4 className="font-semibold text-[#1836b2] text-center">Total Listings</h4>
    <p className="text-xl font-bold text-[#302cfc]">{listingStats.total}</p>
  </div>
  <div className="bg-gray-300 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow">
    <h4 className="font-semibold text-[#5e5bff] text-center">Active Listings</h4>
    <p className="text-xl font-bold text-[#241fd9]">{listingStats.active}</p>
  </div>
  <div className="bg-gray-300 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow">
    <h4 className="font-semibold text-[#ff6363] text-center">Inactive Listings</h4>
    <p className="text-xl font-bold text-[#ff4c4c]">{listingStats.inactive}</p>
  </div>
  <div className="bg-gray-300 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow">
    <h4 className="font-semibold text-[#00b894] text-center">Total Value</h4>
    <p className="text-xl font-bold text-[#00d084]">${listingStats.totalValue.toLocaleString()}</p>
  </div>
</div>

      

     {/* View All Listings Button */}
<div className="flex justify-end mb-6">
  <button
    onClick={() => redirect (`/properties/${userId}`)}
    className="bg-[#1836b2] hover:bg-[#241fd9] text-white px-4 py-2 rounded-full font-semibold"
  >
    View All Listings
  </button>
</div>

      {/* Top info */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Your Listings</h3>
          <p className="text-sm text-gray-600">
            {properties.length} / {maxProperties ?? "Unlimited"}
          </p>
        </div>

        {/* Mobile add toggle */}
        {canAdd && (
          <div className="md:hidden">
            <button
              className="flex items-center gap-2 bg-[#1836b2] text-white px-4 py-2 rounded-full"
              onClick={() => setMobileAddOpen((s) => !s)}
            >
              <FaPlus /> {mobileAddOpen ? "Close" : "Add Listing"}
            </button>
          </div>
        )}
      </div>

      {/* Add form (desktop always visible, mobile toggled) */}
      <div className={`${mobileAddOpen ? "block" : "hidden"} md:block mb-6`}>
        <div className="bg-white p-4 rounded-md shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">

            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                className="w-full border rounded-md p-4"
                value={newProperty.title ?? ""}
                onChange={(e) => setNewProperty((s) => ({ ...(s ?? {}), title: e.target.value }))}
                placeholder="e.g. Modern 2BR Apartment"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                className="w-full border rounded-md p-4"
                value={newProperty.address ?? ""}
                onChange={(e) => setNewProperty((s) => ({ ...(s ?? {}), address: e.target.value }))}
                placeholder="e.g. 123 Palm Street"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Price (USD)</label>
              <input
                className="w-full border rounded-md p-4"
                value={newProperty.price ?? ""}
                onChange={(e) =>
                  setNewProperty((s) => ({ ...(s ?? {}), price: e.target.value ? Number(e.target.value) : null }))
                }
                placeholder="e.g. 1500"
                type="number"
                min={0}
              />
            </div>
          </div>

              <div className="flex flex-col gap-2">

              <label className="text-sm font-medium">Image</label>
              <div className="flex items-center gap-2">
                {newProperty.image_urls && newProperty.image_urls.length ? (
                  <img
                    src={resolveImageUrl((newProperty.image_urls as string[])[0]) ?? undefined}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-800">
                    No image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e)}
                  className="text-sm mr-5"
                />
              </div>
            </div>

          <div className="mt-3 flex gap-8">
            <button
              onClick={handleAdd}
              disabled={!canAdd || loading}
              className={`px-4 py-2 rounded-full text-white ${canAdd ? "bg-[#1836b2]" : "bg-gray-400 cursor-not-allowed"}`}
            >
              {loading ? "Saving..." : "Save Listing"}
            </button>
            <button
              onClick={() => {
                setNewProperty({ title: "", address: "", price: null, image_urls: [] });
                setMobileAddOpen(false);
              }}
              className="px-4 py-2 rounded-full border"
            >
              Cancel
            </button>

              <button
              onClick={() => redirect ('/realtor/add-property')}
              className="bg-[#1836b2] hover:bg-[#241fd9] text-white px-4 py-2 rounded-full font-semibold"
               >
                Add Listings
               </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-md">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Price</th>
               <th className="p-3 text-left">Image</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const displayImg = getDisplayImage(p);
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      {displayImg ? (
                        // Use normal img tag; you can switch to next/image if you prefer but need to handle dynamic urls
                        // next/image requires known sizes or remote config
                        // we render a simple <img> to avoid layout issues
                        <img src={displayImg} alt={p.title} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                      {/* image update control */}
                      <div className="mt-2">
                        <label className="text-xs text-gray-600 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, p.id)}
                            disabled={uploadingId === p.id}
                          />
                          <span className="text-xs text-blue-600 hover:underline">{uploadingId === p.id ? "Uploading..." : "Change"}</span>
                        </label>
                      </div>
                    </td>

                    <td className="p-3">
                      {editingId === p.id ? (
                        <input
                          className="w-full border rounded-md p-2"
                          value={p.title ?? ""}
                          onChange={(e) =>
                            setProperties((prev) => prev.map((it) => (it.id === p.id ? { ...it, title: e.target.value } : it)))
                          }
                        />
                      ) : (
                        <div className="font-medium">{p.title}</div>
                      )}
                    </td>

                    <td className="p-3">
                      {editingId === p.id ? (
                        <input
                          className="w-full border rounded-md p-2"
                          value={p.address ?? ""}
                          onChange={(e) =>
                            setProperties((prev) => prev.map((it) => (it.id === p.id ? { ...it, address: e.target.value } : it)))
                          }
                        />
                      ) : (
                        <div>{p.address}</div>
                      )}
                    </td>

                    <td className="p-3">
                      {editingId === p.id ? (
                        <input
                          type="number"
                          className="w-full border rounded-md p-2"
                          value={p.price ?? ""}
                          onChange={(e) =>
                            setProperties((prev) =>
                              prev.map((it) => (it.id === p.id ? { ...it, price: e.target.value ? Number(e.target.value) : null } : it))
                            )
                          }
                        />
                      ) : (
                        <div>{p.price ? `$${Number(p.price).toLocaleString()}` : "—"}</div>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {editingId === p.id ? (
                        <button
                          onClick={() => handleUpdate(p.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500 text-white text-sm"
                        >
                          <FaSave /> Save
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingId(p.id)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-white text-sm"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white text-sm"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* if no properties */}
          {properties.length === 0 && !loading && (
            <div className="p-6 text-center text-gray-600">You have no listings yet.</div>
          )}
        </div>
      )}

      {/* limit note */}
      {maxProperties !== null && properties.length >= maxProperties && (
        <p className="mt-3 text-sm text-red-600">
          You have reached your plan limit ({maxProperties} listings). Upgrade to add more.
        </p>
      )}
    </div>
  );
}