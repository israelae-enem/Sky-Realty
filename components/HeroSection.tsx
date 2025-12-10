"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const [hover, setHover] = useState(false);

  // Smooth, subtle parallax (no blur)
  const y = useTransform(scrollY, [0, 400], [0, 60]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.04]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background Image (Full sharp) */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hover ? 1 : 0.98 }}
        transition={{ duration: 1.2 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          src="/assets/images/burj2.jpg"
          alt="Dubai luxury real estate skyline"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Smooth EVEN gradient across full image (no left blur!) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70 pointer-events-none" />
      </motion.div>

      {/* Centered Content */}
      <motion.div
        className="relative z-10 text-center px-6 md:px-12 max-w-4xl"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6 tracking-wide text-[#CFAE70]"
          style={{ textShadow: "0 6px 20px rgba(0,0,0,0.55)" }}
        >
          Luxury Real Estate Management.
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed mx-auto max-w-3xl"
          style={{ textShadow: "0 3px 12px rgba(0,0,0,0.45)" }}
        >
          A next-generation platform for UAE real estate agencies, property
          managers, and developers offering premium automation, advanced listing
          visibility, and seamless tenant management in one luxury-grade system.
        </motion.p>

        {/* CTA */}
        <motion.div>
          <motion.div
            className="relative group inline-block"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Link
              href="/login"
              className="relative z-10 bg-[#CFAE70] text-black px-10 py-4 rounded-lg text-lg font-semibold tracking-wide shadow-xl"
            >
              Get Started
            </Link>

            {/* Gold shimmer */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-60 transition-all duration-700 animate-shimmer pointer-events-none" />
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(150%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </section>
  );
}