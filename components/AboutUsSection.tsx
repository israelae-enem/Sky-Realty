"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsSection() {
  return (
    <section className="w-full bg-white py-24">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        
        {/* ===== Left Image ===== */}
        <motion.div
          className="w-full md:w-1/2 relative h-80 md:h-[450px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="w-full h-full"
          >
            <Image
              src="/assets/images/team.jpg"
              alt="Sky Realty Luxury Team"
              fill
              className="object-cover object-center rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              priority
            />
          </motion.div>
        </motion.div>

        {/* ===== Right Text ===== */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center space-y-7"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-wide text-[#1836b2]">
            About <span className="font-semibold text-[#302cfc]">Sky Realty</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            At <span className="font-semibold text-[#302cfc]">Sky Realty</span>, we are redefining
            the real estate experience in the UAE. Our goal is to connect buyers,
            tenants, and sellers through a modern, trusted, and premium marketplace.
          </p>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            We leverage advanced technology and a curated approach to make property
            transactions seamless, transparent, and efficient. Every client
            receives unmatched attention and support from start to finish.
          </p>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Our mission is simple: <span className="font-semibold text-[#1836b2]">empower clients</span> 
            to list, showcase, and find properties with confidence and ease, creating
            a smarter, more premium real estate marketplace.
          </p>

          {/* ===== Button ===== */}
          <Link
            href="/about"
            className="self-start px-8 py-3 bg-[#302cfc] text-white font-semibold rounded-lg
                       shadow-[0_0_20px_rgba(48,44,252,0.35)]
                       hover:shadow-[0_0_30px_rgba(48,44,252,0.55)]
                       hover:scale-105 transition-all duration-300"
          >
            Discover Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  );
}