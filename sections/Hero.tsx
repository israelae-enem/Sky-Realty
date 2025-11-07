"use client";

import { Element } from "react-scroll";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <main className="flex flex-col w-full text-gray-900 bg-gray-300">
      {/* ================= Hero Section ================= */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <Element name="hero">
          {/* --- Background Video --- */}
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="/assets/videos/hero2.mp4"
            autoPlay
            loop
            muted
            playsInline
          />

          {/* --- Light Overlay for Contrast --- */}
          <div className="absolute inset-0 bg-gray-300/70 backdrop-blur-sm"></div>

          {/* --- Content --- */}
          <div className="relative z-10 container flex flex-col items-start justify-center text-left max-w-3xl px-6 md:px-12">
            <motion.span
              className="uppercase tracking-widest text-[#302cfc] text-sm font-semibold mb-5"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Property Management, Simplified
            </motion.span>

            <motion.h1
              className="text-6xl font-bold leading-tight mb-6 max-md:text-4xl max-md:leading-snug text-[#302cfc]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Empowering Real Estate Professionals with Smart Management Tools
            </motion.h1>

            <motion.p
              className="text-lg text-gray-700 max-w-xl mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Sky Realty is your all-in-one platform to manage properties, tenants,
              and finances with ease. Streamline operations, gain insights, and
              scale confidently — all from one intuitive dashboard.
            </motion.p>

            {/* --- Buttons --- */}
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <a
                href="/sign-in"
                className="border bg-[#302cfc] hover:bg-[#241fd9]/80 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Get Started
              </a>
              <a
                href="/subscription"
                className="border bg-[#302cfc] hover:bg-[#241fd9]/80 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Subscribe Now
              </a>
            </motion.div>
          </div>

          {/* --- Subtle Decorative Glow --- */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-[#302cfc]/40 blur-[120px] opacity-40"></div>
        </Element>
      </section>
    </main>
  );
}