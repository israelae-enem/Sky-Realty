"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Property {
  id: string;
  title: string;
  address: string;
  description: string;
  image_urls: string[];
  realtor_id: string;
}

interface Realtor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_pic?: string;
}

const PAGE_SIZE = 6;

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openRealtorModal, setOpenRealtorModal] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | null>(null);

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from("properties")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

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

  // Fetch realtor details when Contact Agent is clicked
  const openAgentModal = async (realtorId: string) => {
    const { data, error } = await supabase
      .from("realtors")
      .select("*")
      .eq("id", realtorId)
      .single();

    if (!error) {
      setSelectedRealtor(data);
      setOpenRealtorModal(true);
    }
  };

  // Clean WhatsApp number
  const cleanNumber = (num: string) => num.replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen">

      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-[#183662]">
        <motion.img
          src="/assets/images/burj4.jpg"
          alt="Hero Background"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-8 max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Find Your Perfect Property
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-200 max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            Browse verified listings and contact our team instantly.
          </motion.p>
        </div>
      </section>

      {/* PROPERTY LISTS */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-[#302cfc] mb-6">All Properties</h2>

        {loading ? (
          <p>Loading properties...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition relative"
                >
                  {/* Property Image */}
                  {property.image_urls?.[0] && (
                    <img
                      src={
                        supabase.storage
                          .from("property-images")
                          .getPublicUrl(property.image_urls[0]).data.publicUrl
                      }
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  {/* Floating WhatsApp Button */}
                  <button
                    onClick={() => openAgentModal(property.realtor_id)}
                    className="absolute bottom-3 right-3 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition flex items-center space-x-2"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>

                  {/* Card Body */}
                  <div className="p-4">
                    <Link href={`/properties/${property.id}`}>
                      <h2 className="font-bold text-xl text-gray-800 hover:underline">
                        {property.title}
                      </h2>
                    </Link>

                    <p className="text-gray-600">{property.address}</p>

                    {/* Contact Agent Button */}
                    <button
                      onClick={() => openAgentModal(property.realtor_id)}
                      className="mt-3 w-full bg-[#1836b2] text-white py-2 rounded-md hover:bg-blue-600 transition"
                    >
                      Contact Agent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
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

      {/* AGENT MODAL */}
      <Dialog open={openRealtorModal} onOpenChange={setOpenRealtorModal}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-bold text-lg">Agent Information</DialogTitle>

          {selectedRealtor ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                {selectedRealtor.profile_pic ? (
                  <img
                    src={selectedRealtor.profile_pic}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    N/A
                  </div>
                )}

                <div>
                  <p className="font-semibold text-lg">{selectedRealtor.full_name}</p>
                  <p className="text-gray-700"><strong>Email:</strong> {selectedRealtor.email}</p>
                  <p className="text-gray-700"><strong>Phone:</strong> {selectedRealtor.phone}</p>
                </div>
              </div>

              {/* CALL + WHATSAPP BUTTONS */}
              <div className="flex flex-col space-y-3 pt-2">

                <a
                  href={`tel:${selectedRealtor.phone}`}
                  className="w-full bg-blue-600 text-white text-center py-2 rounded-md font-medium hover:bg-blue-700 transition"
                >
                  📞 Call Now
                </a>

                <a
                  href={`https://wa.me/${cleanNumber(selectedRealtor.phone)}`}
                  target="_blank"
                  className="w-full bg-green-600 text-white text-center py-2 rounded-md font-medium hover:bg-green-700 transition"
                >
                  💬 WhatsApp Chat
                </a>

              </div>
            </div>
          ) : (
            <p>Loading agent details...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}