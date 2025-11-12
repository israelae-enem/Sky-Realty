"use client";
import { motion } from "framer-motion";

export default function WhySkyRealty() {
  const points = [
    {
      title: "Save Time Effortlessly",
      description:
        "Automate routine tasks and manage your properties efficiently, so you can focus on what really matters.",
      color: "#1836b2",
    },
    {
      title: "Stay Organized",
      description:
        "Keep track of tenants, payments, and documents all in one place with easy-to-use dashboards.",
      color: "#2563eb", // middle one - blue-600
    },
    {
      title: "Grow Your Business",
      description:
        "Access smart insights and tools to make better decisions and expand your rental portfolio confidently.",
      color: "#1836b2",
    },
  ];

  return (
    <section className="relative py-24 px-6 md:px-20 bg-gray-100 overflow-hidden">
      {/* Section Heading */}
      <div className="text-center mb-20">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-[#1836b2]"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Why Sky Realty Makes Your Life Better
        </motion.h2>
        <motion.p
          className="text-gray-900 text-lg mt-4 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Designed to simplify your real estate operations and make managing properties stress-free.
        </motion.p>
      </div>

      {/* Curved "S" Connector Line */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,300 C300,100 900,500 1200,200"
          stroke="#1836b2"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="opacity-40"
        />
      </svg>

      {/* Cards */}
      <div className="relative flex flex-col md:flex-row justify-center items-center gap-16 md:gap-24 z-10">
        {points.map((point, i) => (
          <motion.div
            key={i}
            className="w-64 h-64 rounded-full flex flex-col justify-center items-center text-center shadow-xl hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: point.color }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
          >
            <h3 className="text-white text-2xl font-semibold mb-3">{point.title}</h3>
            <p className="text-gray-900 text-sm px-6">{point.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}