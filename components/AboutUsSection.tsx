"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutUsSection() {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-gray-100">
      {/* Background Image */}
      <Image
        src="/assets/images/team.jpg" // replace with your actual group image path
        alt="Sky Realty Team"
        fill
        className="object-cover object-center opacity-80"
        priority
      />

      {/* Light Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/80 to-white/60" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 text-center text-gray-800 px-6 max-w-3xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-tech text-[#1E2A78]">
          Who We Are
        </h2>

        <p className="text-lg md:text-xl leading-relaxed text-gray-700">
          At <span className="text-[#302cfc] font-semibold">Sky Realty</span>, we’re 
          redefining property management through innovation, transparency, and simplicity. 
          Our mission is to make property ownership and renting effortless by combining 
          powerful technology with personalized service.
          <br />
          <br />
          From tracking rent and managing maintenance to building stronger tenant 
          relationships, we empower realtors and tenants to thrive all in one 
          seamless platform built for modern real estate.
        </p>
      </motion.div>
    </section>
  );
}