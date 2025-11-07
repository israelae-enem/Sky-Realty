"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const clientLogos = [
  { name: "Company 1", src: "/assets/icons/rentify-logo.jpg" },
  { name: "Company 2", src: "/assets/icons/company1.jpg" },
  { name: "Company 3", src: "/assets/icons/company2.jpg" },
  { name: "Company 4", src: "/assets/icons/company3.jpg" },
  { name: "Company 5", src: "/assets/icons/company4.jpg" },
  { name: "Company 6", src: "/assets/icons/company5.jpg" },
  { name: "Company 7", src: "/assets/icons/company6.jpg" },
  { name: "Company 8", src: "/assets/icons/company7.jpg" },
  { name: "Company 9", src: "/assets/icons/company8.jpg" },
  { name: "Company 10", src: "/assets/icons/company9.jpg" },
  { name: "Company 11", src: "/assets/icons/sky-logo.jpg" },
];

// Infinite horizontal scroll animation
const scrollVariant = {
  animate: {
    x: ["0%", "-50%"],
    transition: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 40, // adjust speed here
      ease: "linear",
    },
  },
};

export default function ClientLogosCarousel() {
  return (
    <section className="bg-gray-100 py-16 overflow-hidden">
      <div className="max-w-screen-xl mx-auto text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#302cfc] mb-4">
          Trusted By Leading Real Estate Companies
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          We’re proud to collaborate with some of the most respected names in the property industry.
        </p>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex gap-12 items-center"
          variants={scrollVariant}
          animate="animate"
        >
          {[...clientLogos, ...clientLogos].map((logo, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-36 h-36 md:w-40 md:h-40 flex items-center justify-center"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={160}
                height={160}
                className="object-cover rounded-full border-2 border-gray-200 shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}