"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const [hover, setHover] = useState(false);

  // Deep parallax effect
  const y = useTransform(scrollY, [0, 400], [0, 120]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.08]);

  return (
    <section
      ref={ref}
      className="relative flex flex-col md:flex-row min-h-screen overflow-hidden bg-[#0A0A0C]"
    >
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: hover ? 1 : 0.95, scale: hover ? 1.06 : 1.03 }}
        transition={{ duration: 1.4, ease: [0.16, 0.1, 0.3, 1] }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          src="/assets/images/burj2.jpg"
          alt="Luxury Dubai skyline"
          fill
          className="object-cover"
          priority
        />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70 pointer-events-none" />
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        className="relative z-10 flex flex-col justify-center items-start px-10 md:px-20 py-28 max-w-3xl
                   text-white backdrop-blur-sm bg-black/20 rounded-xl"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6 tracking-wide"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.45)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          Elevate your real estate experience.
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-200 mb-10 max-w-xl leading-relaxed"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          A premium platform crafted for agents, companies, and developers who expect excellence.
        </motion.p>

        {/* CTA with animated gold shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <motion.div
            className="relative group inline-block"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Link
              href="/sign-up"
              className="relative z-10 bg-[#CFAE70] text-black px-10 py-4 rounded-lg text-lg font-semibold tracking-wide shadow-xl"
            >
              Get Started
            </Link>

            {/* Gold shimmer overlay */}
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