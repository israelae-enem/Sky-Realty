"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const cards = [
  {
    title: "Property Management",
    pain: "Manual tracking causes confusion and delays.",
    solution:
      "Sky Realty centralizes your properties, tenants, and leases in one smart dashboard fully automated and synced in real-time.",
  },
  {
    title: "Rent Automation",
    pain: "Late or missed payments frustrate landlords.",
    solution:
      "Automated reminders, invoices, and receipts keep payments consistent no follow-ups needed.",
  },
  {
    title: "Seamless Communication",
    pain: "Messages and requests get lost across chats.",
    solution:
      "A unified dashboard organizes every tenant and contractor conversation neatly.",
  },
  {
    title: "Maintenance Management",
    pain: "Tracking repair requests is messy and slow.",
    solution:
      "Tenants submit requests with photos; realtors assign vendors and track progress easily.",
  },
  {
    title: "Digital Lease Control",
    pain: "Paper leases and missed renewals cost time.",
    solution:
      "Store, sign, and renew leases digitally with alerts before expiration.",
  },
  {
    title: "Financial Insights",
    pain: "Scattered finances hide real performance.",
    solution:
      "Instant rent, expense, and ROI analytics all visualized in one dashboard.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

export default function CircularSolutionsSection() {
  return (
    <section className="bg-white py-20 px-6 text-gray-800 overflow-hidden">
      {/* Heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl text-[#1836b2] font-bold mb-4">
          Turning Real Estate Challenges Into Smart Solutions
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-700">
          Each circle represents a core area where Sky Realty simplifies real
          estate management from automation to insights.
        </p>
      </motion.div>

      {/* Circular Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14 place-items-center">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="relative bg-[#1836b2] w-72 h-72 rounded-full shadow-lg flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
          >
            {/* Logo */}
            <div className="absolute top-6 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
              <Image
                src="/assets/icons/logo4.jpg"
                alt="Sky Realty Logo"
                width={40}
                height={40}
                className="object-contain rounded-full"
              />
            </div>

            {/* Card Content */}
            <h3 className="text-xl font-semibold text-white mb-3 mt-10">
              {card.title}
            </h3>
            <div className="text-gray-100 text-sm mb-2 font-medium">
              <span className="block">Pain:</span> {card.pain}
            </div>
            <div className="bg-white/90 text-gray-900 text-sm rounded-lg px-4 py-2 leading-relaxed">
              <span className="font-semibold">Solution:</span> {card.solution}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-semibold text-[#1836b2] mb-4">
          Ready to experience smarter property management?
        </h2>
        <a
          href="/sign-in"
          className="inline-block bg-[#1836b2] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-[0_0_15px_#59fcf7] transition-all duration-300"
        >
          Get Started
        </a>
      </motion.div>
    </section>
  );
}