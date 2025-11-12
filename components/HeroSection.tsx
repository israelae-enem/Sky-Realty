// components/HeroSection.jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const [hover, setHover] = useState(false);

  // Parallax background movement (moves slightly as user scrolls)
  const y = useTransform(scrollY, [0, 300], [0, 80]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);

  return (
    <section
      ref={ref}
      className="relative flex flex-col md:flex-row min-h-screen overflow-hidden"
    >
      {/* ===== Motion Background Image with Parallax & Hover Depth ===== */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: hover ? 1.05 : 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          src="/assets/images/burj2.jpg"
          alt="Realtor managing properties"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* ===== Foreground Content ===== */}
      <motion.div
        className="relative z-10 flex flex-col justify-center items-start px-10 md:px-20 py-20 text-white max-w-3xl"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-tech font-extrabold leading-tight mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Manage your rental properties like a professional, from day one.
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl font-medium text-gray-100 mb-8 max-w-xl drop-shadow-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Simple, smart tools that help you operate successfully.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link
            href="/sign-up"
            className="bg-[#302cfc] hover:bg-[#241fd9]/80 text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}