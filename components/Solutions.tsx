// components/WhyTenantsLove.jsx
"use client";
import { motion } from "framer-motion";

export default function WhyTenantsLove() {
  const points = [
    {
      title: "Seamless Communication",
      description:
        "Message your realtor or landlord directly through one organized dashboard. No lost chats or confusing threads ever again.",
      color: "#1836b2",
    },
    {
      title: "Track Maintenance Requests",
      description:
        "Submit repair requests, upload photos, and track progress in real time until completion — all from your tenant portal.",
      color: "#59fcf7",
    },
    {
      title: "Access Important Documents",
      description:
        "View your lease, agreements, and updates instantly. No more searching through endless emails to find what matters.",
      color: "#1836b2",
    },
  ];

  return (
    <section className="relative py-24 px-6 md:px-20 bg-gray-100 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-20">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-[#1836b2]"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Why Tenants Love Sky Realty
        </motion.h2>
        <p className="text-gray-900 text-lg mt-4 max-w-2xl mx-auto">
          Empowering tenants with clarity, control, and convenience in every part of their renting experience.
        </p>
      </div>

      {/* Curved Connector Line */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,250 C300,100 900,500 1200,200"
          stroke="#1836b2"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className="opacity-40"
        />
      </svg>

      {/* Circle Cards */}
      <div className="relative flex flex-col md:flex-row justify-center items-center gap-16 md:gap-24 z-10">
        {points.map((point, i) => (
          <motion.div
            key={i}
            className="w-64 h-64 flex flex-col justify-center items-center text-center rounded-full shadow-xl hover:scale-105 transition-transform duration-300"
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