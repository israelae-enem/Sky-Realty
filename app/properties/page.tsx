"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import LeadForm from "@/components/forms/LeadForm";
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

const PAGE_SIZE = 6;

export default function PropertiesPage() {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openLeadForm, setOpenLeadForm] = useState(false);

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

          <motion.div
            className="bg-white text-[#1836b2] rounded-2xl shadow-xl px-8 py-10 mt-4 max-w-lg w-full flex flex-col items-center space-y-6"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            <h2 className="text-xl font-semibold normal-case">How can we help?</h2>

            <Button
              onClick={() => setOpenLeadForm(true)}
              className="w-full sm:w-auto px-8 py-3 bg-[#302cfc] text-white text-lg rounded-full shadow hover:scale-105 transition-all"
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </section>

      {/* LEAD FORM MODAL */}
      <Dialog open={openLeadForm} onOpenChange={setOpenLeadForm}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Contact Realtor</DialogTitle>

          <LeadForm
            realtorId=""
            companyId="public"
            onSuccess={() => setOpenLeadForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* PROPERTY LISTS */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-[#302cfc] mb-6">All Properties</h2>

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
                      src={
                        supabase.storage
                          .from("property-images")
                          .getPublicUrl(property.image_urls[0]).data.publicUrl
                      }
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
    </div>
  );
}