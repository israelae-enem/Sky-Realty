"use client";

import { motion } from "framer-motion";
import RealtorSignUpForm from "@/components/RealtorSignUpForm";
import Image from "next/image";
import React from "react";
import FAQ from "@/sections/FAQ";

const page = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/images/burj.jpg"
        alt="agent background"
        fill
        className="object-cover w-full h-full"
        priority
      />

      {/* Optional subtle overlay for readability (can remove if you want pure image) */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Motion Form Modal */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 w-[90%] max-w-lg"
      >
        <h1 className="text-3xl font-bold text-[#302cfc] mb-4 text-center">
          Tenant Sign Up
        </h1>
        <FAQ />
      </motion.div>
    </div>
  );
};

export default page;