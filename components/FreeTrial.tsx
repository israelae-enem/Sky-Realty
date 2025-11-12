"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function FreeTrialSection() {
  return (
    <section className="w-full bg-[#1836b2] text-white py-20 px-6">
      <div className="container mx-auto flex flex-col items-center space-y-8 text-center">
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Start a Free Trial
        </motion.h2>

        {/* Paragraph */}
        <motion.p
          className="max-w-3xl text-lg md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Explore powerful tools that connect tenants and realtors all in one smart dashboard
        </motion.p>

        {/* Image */}
        <motion.div
          className="w-full max-w-4xl relative h-64 md:h-96"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Image
            src="/assets/images/rdash.jpg" // replace with your actual image
            alt="Dashboard"
            fill
            className="object-cover object-center rounded-xl shadow-lg"
            priority
          />
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link
            href="/signup"
            className="px-8 py-4 bg-white text-[#1836b2] font-semibold rounded-full shadow-md hover:shadow-[#59fcf7]/50 hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </section>
  );
}