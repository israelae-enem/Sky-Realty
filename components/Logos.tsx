"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const clientLogos = [
  { name: "Rentify", src: "/assets/icons/rentify-logo.jpg" },
  { name: "Prime Properties", src: "/assets/icons/company1.jpg" },
  { name: "UrbanStay", src: "/assets/icons/company2.jpg" },
  { name: "Royal Living", src: "/assets/icons/company3.jpg" },
  { name: "EstateHub", src: "/assets/icons/company4.jpg" },
  { name: "Landmark ", src: "/assets/icons/company5.jpg" },
  { name: "SmartHomes", src: "/assets/icons/company6.jpg" },
  { name: "BlueSky Realty", src: "/assets/icons/company7.jpg" },
  { name: "Vista Properties", src: "/assets/icons/company8.jpg" },
  { name: "Al Noor Real Estate", src: "/assets/icons/company9.jpg" },
  { name: "Sky Realty", src: "/assets/icons/sky-logo.jpg" },
];

// Infinite scroll effect
const scrollVariant = {
  animate: {
    x: ["0%", "-50%"],
    transition: {
      repeat: Infinity,
      duration: 28,
      ease: "linear",
    },
  },
};

export default function ClientLogosCarousel() {
  return (
    <section className="relative bg-gradient-to-b from-white to-[#f3f4ff] py-20 overflow-hidden">
      {/* Soft blur background shape */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[60%] h-[300px] bg-[#302cfc]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto text-center mb-12 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[#302cfc]">
          Trusted by Leading Real Estate Companies
        </h2>

        <p className="text-gray-700 max-w-2xl mx-auto mt-4 text-lg">
          Sky Realty partners with top real estate agencies, property management 
          groups, and proptech innovators.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-16 items-center"
          variants={scrollVariant}
          animate="animate"
        >
          {[...clientLogos, ...clientLogos].map((logo, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="flex-shrink-0 w-40 h-40 md:w-44 md:h-44 
                         flex items-center justify-center"
            >
              <div className="rounded-full p-[3px] bg-gradient-to-br from-[#c8a96a] to-[#302cfc]">
                <div className="rounded-full bg-white p-2 shadow-lg">
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={180}
                    height={180}
                    className="object-cover rounded-full shadow-xl
                               transition-transform duration-300"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}