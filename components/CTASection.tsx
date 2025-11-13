"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="w-full bg-[#1836b2] py-20">
      <div className="container mx-auto px-6 text-center flex flex-col items-center space-y-6">
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Add and Manage your properties with Sky Realty
        </motion.h2>

        {/* Paragraph */}
        <motion.p
          className="text-lg md:text-xl text-white mb-5 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          From landlords, realtors, agents, tenants everyone belongs here.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:shadow-[#1836b2]/50 hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </section>
  );
}