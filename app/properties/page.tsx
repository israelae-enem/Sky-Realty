"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
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

interface Realtor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Company {
  id: string;
  company_name: string;
  email: string;
  phone: string;
}

const PAGE_SIZE = 6;

// 💡 FIX — Parses image_urls whether it's a string or array
const parseImages = (urls: any): string[] => {
  try {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;

    // If Supabase saved it as a text string
    const parsed = JSON.parse(urls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function PropertiesPage() {
  const { user } = useUser();
  const userId = user?.id;

  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [contactData, setContactData] = useState<any>(null);
  const [openContactModal, setOpenContactModal] = useState(false);

  // FETCH PROPERTIES
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [userId, page]);

  // OPEN CONTACT MODAL
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
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen">

      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] flex items-center justify-center bg-[#183662] overflow-hidden">
        <motion.img
          src="/assets/images/burj4.jpg"
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

      {/* LIST */}
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
                const cover = images[0]; // FIRST IMAGE

                return (
                  <div
                    key={property.id}
                    className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                  >
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

      {/* CONTACT MODAL */}
      <Dialog open={openContactModal} onOpenChange={setOpenContactModal}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-bold text-xl mb-4">Contact Information</DialogTitle>

          {contactData ? (
            <div className="space-y-2">
              <p className="font-semibold text-lg">
                {contactData.full_name || contactData.company_name}
              </p>
              <p>Email: {contactData.email}</p>
              <p>Phone: {contactData.phone}</p>

              <a
                href={`tel:${contactData.phone}`}
                className="block w-full bg-[#1836b2] text-white text-center py-2 rounded-md mt-4"
              >
                📞 Call Now
              </a>
            </div>
          ) : (
            <p>Loading contact info...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}