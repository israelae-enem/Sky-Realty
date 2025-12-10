"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="w-full bg-[#1836b2] py-24">
      <div className="container mx-auto px-6 text-center flex flex-col items-center space-y-8">

        {/* Heading - slides from bottom */}
        <motion.h2
          className="text-4xl md:text-5xl font-light text-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Manage Your Luxury Properties With{" "}
          <span className="font-semibold text-[#59fcf7]">Sky Realty</span>
        </motion.h2>

        {/* Paragraph - slides from bottom with delay */}
        <motion.p
          className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Sky Realty is the UAE’s trusted platform for landlords, agents, 
          property owners, tenants, and real estate investors.  
          Seamlessly manage, rent, and list luxury properties across Dubai, Abu Dhabi 
          and the wider UAE using our premium real estate management system.
        </motion.p>

        {/* Buttons - slide up with stagger */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Link
            href="/login"
            className="px-10 py-4 bg-[#59fcf7] text-white text-lg font-semibold
                       rounded-full shadow-[0_0_20px_rgba(48,44,252,0.35)]
                       hover:shadow-[0_0_35px_rgba(48,44,252,0.55)]
                       hover:scale-105 transition-all duration-300"
          >
            List Your Property
          </Link>

          <Link
            href="/login"
            className="px-10 py-4 bg-white text-[#1836b2] text-lg font-semibold
                       rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)]
                       hover:shadow-[0_0_35px_rgba(0,0,0,0.3)]
                       hover:scale-105 transition-all duration-300"
          >
            Explore Properties
          </Link>
        </motion.div>
      </div>
    </section>
  );
}