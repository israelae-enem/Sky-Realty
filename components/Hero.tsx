"use client";

import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-[#183662]">
      {/* ===== Background Image ===== */}
      <motion.img
        src="/assets/images/burj1.jpg"
        alt="Hero Background"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* ===== Overlay ===== */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ===== Foreground Content ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 space-y-8">
        {/* Main Heading */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Connecting Tenants and Realtors for Smarter Property Management
        </motion.h1>

        {/* Floating CTA Card */}
        <motion.div
          className="bg-white text-[#1836b2] rounded-2xl shadow-lg px-8 py-10 mt-6 max-w-lg w-full flex flex-col items-center space-y-6"
          initial={{ opacity: 0, y: 60 }}
          animate={{
            opacity: 1,
            y: [0, -8, 0], // gentle float up and down
          }}
          transition={{
            delay: 0.5,
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <h2 className="text-xl font-semibold mb-2">
            How would you like to continue?
          </h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a
              href="/home2"
              className="w-full sm:w-auto px-8 py-3 bg-white text-black text-lg font-medium rounded-full border border-gray-200 shadow hover:shadow-md hover:scale-105 transition-all duration-300 text-center"
            >
              I’m a Tenant
            </a>

            <a
              href="/home1"
              className="w-full sm:w-auto px-8 py-3 bg-[#1836b2] text-white text-lg font-medium rounded-full shadow-[0_0_12px_#59fcf7] hover:shadow-[0_0_20px_#59fcf7] hover:scale-105 transition-all duration-300 text-center"
            >
              I’m a Realtor
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;