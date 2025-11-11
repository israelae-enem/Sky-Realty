"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const HeroSection = () => {
  const images = [
    "/assets/images/pic.jpg",
    "/assets/images/pic1.jpg",
    "/assets/images/pro2.jpg",
    "/assets/images/pro3.jpg",
    "/assets/images/pro4.jpg",
    "/assets/images/pro5.jpg",
    "/assets/images/pro6.jpg",
    "/assets/images/pic8.jpg",
    "/assets/images/pic9.jpg",
    "/assets/images/pic10.jpg",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through images
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // change image every 5 seconds
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length]);

  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      {/* ===== Background Slideshow ===== */}
      {images.map((src, index) => (
        <motion.img
          key={index}
          src={src}
          alt={`Pic ${index + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentImage ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      ))}

      {/* ===== Gradient Overlay ===== */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* ===== Foreground Content ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 space-y-8">
        <motion.h1
          className="text-5xl md:text-7xl font-tech font-extrabold text-white tracking-tight drop-shadow-lg leading-tight"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Revolutionize How You Manage Real Estate 🚀
        </motion.h1>

        <motion.p
          className="max-w-2xl text-lg md:text-xl text-gray-100 font-medium leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Sky Realty gives you everything you need to streamline property
          management from smart rent tracking to effortless tenant engagement.
          Work smarter, grow faster, and stay in control.
        </motion.p>

        <motion.div
          className="flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <a
            href="/home1"
            className="px-8 py-4 bg-gradient-to-r from-[#302cfc] to-[#4d57ff] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-[#302cfc]/40 hover:scale-105 transition-all duration-300"
          >
            I’m a Property Owner
          </a>

          <a
            href="/home2"
            className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-[#302cfc] transition-all duration-300"
          >
            I’m a Tenant
          </a>
        </motion.div>
      </div>

      {/* ===== Scroll Indicator ===== */}
      <motion.div
        className="absolute bottom-10 text-white text-sm flex flex-col items-center cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <span className="animate-bounce">↓</span>
        <p className="text-xs mt-1 opacity-80">Scroll to explore</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;