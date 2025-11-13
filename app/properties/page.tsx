"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";

interface Property {
  id: string;
  title: string;
  address: string;
  description: string;
  image_urls: string[];
  realtor_id: string;
}

const PAGE_SIZE = 6;

export default function PropertiesPage() {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, count, error } = await supabase
        .from("properties")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) throw error;

      setProperties(data || []);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page]);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#302cfc] mb-6">All Properties</h1>

      {loading ? (
        <p>Loading properties...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                href={`/properties/${property.id}`}
                key={property.id}
                className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                {property.image_urls?.[0] && (
                  <img
                    src={supabase.storage.from("property-images").getPublicUrl(property.image_urls[0]).data.publicUrl}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="font-bold text-xl text-gray-800">{property.title}</h2>
                  <p className="text-gray-600">{property.address}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#1836b2] text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2 bg-gray-200 rounded">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#1836b2] text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}