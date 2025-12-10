"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface Property {
  id: string;
  title: string;
  address: string;
  description?: string;
  image_urls: string[] | string;
  realtor_id?: string | null;
  company_id?: string | null;
}

const PAGE_SIZE = 6;

// Parse string/array images safely
const parseImages = (urls: any): string[] => {
  try {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;

    const parsed = JSON.parse(urls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function PropertiesPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [contactData, setContactData] = useState<any>(null);
  const [openContactModal, setOpenContactModal] = useState(false);

  // --------------------------
  // ⭐ GET AUTH USER (SUPABASE)
  // --------------------------
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUserId(data.user.id);
      }
    }

    loadUser();

    // Also listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // -------------------------------
  // ⭐ FETCH USER'S PROPERTIES
  // -------------------------------
  const fetchProperties = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from("properties")
        .select("*", { count: "exact" })
        .or(`realtor_id.eq.${userId},company_id.eq.${userId}`)
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProperties(data || []);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("fetchProperties error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchProperties();
  }, [userId, page]);

  // -------------------------------
  // ⭐ OPEN CONTACT MODAL
  // -------------------------------
  const openContact = async (property: Property) => {
    try {
      if (property.realtor_id) {
        const { data } = await supabase
          .from("realtors")
          .select("*")
          .eq("id", property.realtor_id)
          .single();
        setContactData(data);
      }

      if (property.company_id) {
        const { data } = await supabase
          .from("companies")
          .select("*")
          .eq("id", property.company_id)
          .single();
        setContactData(data);
      }

      setOpenContactModal(true);
    } catch (err) {
      console.error("openContact error:", err);
    }
  };

  // -------------------------------
  // ⭐ IF NOT LOGGED IN
  // -------------------------------
  if (userId === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">You are not signed in</h2>
          <Link
            href="/login"
            className="px-6 py-3 bg-[#1836b2] text-white rounded-md"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------
  // ⭐ PAGE UI
  // -------------------------------
  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="relative w-full h-[90vh] flex items-center justify-center bg-[#183662] overflow-hidden">
        <motion.img
          src="/assets/images/burj3.jpg"
          alt="Hero"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-extrabold">My Listed Properties</h1>
          <p className="mt-3 text-xl opacity-90">Manage your uploaded listings.</p>
        </div>
      </section>

      {/* LISTINGS */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-[#302cfc] mb-6">All Your Properties</h2>

        {loading ? (
          <p>Loading properties...</p>
        ) : properties.length === 0 ? (
          <p>No properties found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const images = parseImages(property.image_urls);
                const cover = images[0];

                return (
                  <div key={property.id} className="border rounded-lg overflow-hidden shadow-md">
                    <img
                      src={cover}
                      alt={property.title}
                      className="w-full h-48 object-cover bg-gray-200"
                    />

                    <div className="p-4">
                      <Link href={`/properties/${property.id}`}>
                        <h3 className="font-bold text-xl hover:underline">{property.title}</h3>
                      </Link>

                      <p className="text-gray-600">{property.address}</p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openContact(property)}
                          className="w-full bg-[#1836b2] text-white py-2 rounded-md"
                        >
                          Contact
                        </button>

                        <Link
                          href={`/properties/${property.id}`}
                          className="px-4 py-2 border rounded-md"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center mt-6 gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-[#1836b2] text-white rounded disabled:opacity-40"
              >
                Prev
              </button>

              <span className="px-4 py-2 bg-gray-200 rounded">
                {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-[#1836b2] text-white rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}