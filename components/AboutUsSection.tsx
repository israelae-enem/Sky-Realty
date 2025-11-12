"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsSection() {
  return (
    <section className="w-full bg-gray-100 py-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        {/* ===== Left Image ===== */}
        <motion.div
          className="w-full md:w-1/2 relative h-80 md:h-[400px]"
          initial={{ y: -20 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <Image
            src="/assets/images/team.jpg" // replace with your actual image
            alt="Sky Realty Team"
            fill
            className="object-cover object-center rounded-xl shadow-lg"
            priority
          />
        </motion.div>

        {/* ===== Right Text ===== */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center space-y-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1836b2]">
            Who We Are
          </h2>

          <p className="text-lg md:text-xl text-black leading-relaxed">
            At <span className="font-semibold text-[#302cfc]">Sky Realty</span>, we’re redefining 
            property management through innovation, transparency, and simplicity. Our mission is 
            to make property ownership and renting effortless by combining powerful technology 
            with personalized service.
          </p>

          <p className="text-lg md:text-xl text-black leading-relaxed">
            From tracking rent and managing maintenance to building stronger tenant relationships, 
            we empower realtors and tenants to thrive all in one seamless platform built for modern real estate.
          </p>

          {/* ===== Button ===== */}
          <Link
            href="/about"
            className="self-start px-6 py-3 bg-[#1836b2] text-white border border-[#59fcf7] rounded-lg font-semibold shadow-md hover:shadow-[#59fcf7]/50 hover:scale-105 transition-all duration-300"
          >
            Read Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  );
}