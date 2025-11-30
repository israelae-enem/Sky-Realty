"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden m-0 p-0">
      {/* ===== Background Image (Crisp + Full Width) ===== */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/burj1.jpg"
          alt="Sky Realty Luxury Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* ===== Content ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 space-y-6">
        {/* Premium Headline */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl drop-shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          List. Showcase. Sell Faster with Sky Realty.
        </motion.h1>

        {/* Tagline */}
        <motion.h2
          className="text-xl md:text-2xl text-[#59fcf7] font-semibold drop-shadow-lg max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
        >
          Dubai’s Smartest Real Estate Marketplace  Buy, Sell & Rent Property With Confidence
        </motion.h2>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <a
            href="/signin"
            className="px-6 py-3 rounded-full bg-[#302cfc] text-white font-semibold shadow hover:scale-105 transition-all"
          >
            List Your Property
          </a>

          <a
            href="/signin"
            className="px-6 py-3 rounded-full border border-white text-white font-semibold hover:bg-white hover:text-[#302cfc] transition-all"
          >
            Explore Properties
          </a>
        </motion.div>

        {/* Floating CTA Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-md text-[#1836b2] rounded-2xl shadow-2xl px-8 py-8 mt-6 max-w-lg w-full flex flex-col items-center space-y-6 border border-white/30"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <h2 className="text-xl font-semibold">Continue as</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            {/* Tenant Button */}
            <a
              href="/home2"
              className="w-full sm:w-auto px-8 py-3 rounded-full border border-gray-200 bg-white text-black shadow hover:scale-105 transition-all text-center"
            >
              I’m a Tenant
            </a>

            {/* Realtor Button */}
            <a
              href="/home1"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1836b2] text-white shadow-[0_0_12px_#59fcf7] hover:shadow-[0_0_20px_#59fcf7] hover:scale-105 transition-all text-center"
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