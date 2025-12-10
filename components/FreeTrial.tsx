'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function FreeTrialSection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#f7f4ef] to-[#ece7df] py-24 px-6 relative overflow-hidden">
      
      {/* Soft luxury background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-1/3 top-10 w-[45%] h-[260px] bg-[#C8A96A]/30 blur-[120px] rounded-full opacity-40" />
        <div className="absolute left-1/4 bottom-16 w-[40%] h-[240px] bg-[#302cfc]/20 blur-[110px] rounded-full opacity-40" />
        <div className="absolute left-1/2 top-1/3 w-[50%] h-[280px] bg-[#1836b2]/15 blur-[130px] rounded-full opacity-30" />
      </div>

      <div className="relative z-10 container mx-auto flex flex-col items-center space-y-10 text-center">

        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-[#302cfc]"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Start Your Free Trial
        </motion.h2>

        {/* Description */}
        <motion.p
          className="max-w-3xl text-lg md:text-xl text-gray-700 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          viewport={{ once: true }}
        >
          Experience the UAE’s most advanced{" "}
          <span className="font-semibold text-[#1836b2]">
            Dubai real estate management platform
          </span>
          , designed for luxury property agencies, landlords, and high-value investors. 
          Sky Realty unifies{" "}
          <span className="font-semibold text-[#302cfc]">
            property listings, tenant communication, rent automation, maintenance tracking, and analytics
          </span>{" "}
          into one intelligent platform engineered for modern real estate management.
        </motion.p>

        {/* Dashboard Image */}
        <motion.div
          className="relative w-full max-w-5xl h-72 md:h-[420px] rounded-2xl overflow-hidden shadow-xl border border-white/30 bg-white/50 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Image
            src="/assets/images/rdash.jpg"
            alt="Sky Realty Dashboard - UAE Real Estate"
            fill
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          viewport={{ once: true }}
        >
          <Link
            href="/login"
            className="px-10 py-4 rounded-full bg-gradient-to-br from-[#1836b2] to-[#302cfc] text-white font-semibold tracking-wide shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            Begin Your Free Trial
          </Link>
        </motion.div>
      </div>
    </section>
  );
}