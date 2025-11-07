"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const founders = [
  {
    name: "Isabella Enem",
    role: "Chief Executive Officer (CEO)",
    image: "/assets/images/founders/isabella.jpg",
    bio: "Visionary leader driving Sky Realty’s mission to redefine modern property management.",
  },
  {
    name: "Michael Rahman",
    role: "Chief Technology Officer (CTO)",
    image: "/assets/images/founders/michael.jpg",
    bio: "Tech innovator leading platform development and automation strategy.",
  },
  {
    name: "Fatima Noor",
    role: "Chief Operations Officer (COO)",
    image: "/assets/images/founders/fatima.jpg",
    bio: "Ensures seamless execution of operations across all Sky Realty departments.",
  },
  {
    name: "James Cole",
    role: "Chief Marketing Officer (CMO)",
    image: "/assets/images/founders/james.jpg",
    bio: "Strategic storyteller building the brand and connecting with customers worldwide.",
  },
  {
    name: "Sarah Kim",
    role: "Chief Financial Officer (CFO)",
    image: "/assets/images/founders/sarah.jpg",
    bio: "Expert in financial growth and sustainability with a data-driven mindset.",
  },
  {
    name: "Omar Hassan",
    role: "Chief Product Officer (CPO)",
    image: "/assets/images/founders/omar.jpg",
    bio: "Heads product design and innovation ensuring intuitive user experience.",
  },
];

// Motion variant for continuous scroll
const scrollVariant = {
  animate: {
    x: ["0%", "-100%"],
    transition: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 40, // adjust speed
      ease: "linear", // linear easing
    },
  },
};

export default function FoundersSection() {
  return (
    <section className="bg-gray-300 py-20 overflow-hidden">
      <div className="text-center mb-12 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[#302cfc] mb-4">
          Meet the Visionaries Behind Sky Realty
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Our leadership team brings innovation, dedication, and years of real estate and technology experience to revolutionize property management.
        </p>
      </div>

      {/* Infinite Scroll Wrapper */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-16"
          variants={scrollVariant}
          animate="animate"
        >
          {[...founders, ...founders].map((founder, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center w-[250px] flex-shrink-0"
            >
              <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="rounded-full object-cover shadow-lg border-4 border-white"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {founder.name}
              </h3>
              <p className="text-[#302cfc] text-sm font-medium mb-2">
                {founder.role}
              </p>
              <p className="text-gray-600 text-sm px-3">{founder.bio}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}