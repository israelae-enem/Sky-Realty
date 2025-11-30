"use client";
import { motion } from "framer-motion";

export default function WhyChooseUsSection() {
  const features = [
    {
      title: "Smart Marketplace",
      description: "Connect with buyers, tenants, and sellers directly through our curated platform. No middlemen, just transparency and efficiency.",
      icon: "🏢",
    },
    {
      title: "Maximum Visibility",
      description: "Your property reaches the right audience with optimized listings, premium placement, and smart search features.",
      icon: "🔍",
    },
    {
      title: "Trusted & Secure",
      description: "We prioritize your security and credibility. Listings are verified, and your transactions are safe and seamless.",
      icon: "🛡",
    },
    {
      title: "User-Friendly Experience",
      description: "From listing to browsing, our intuitive platform makes property management and discovery effortless.",
      icon: "⚡",
    },
    {
      title: "Data-Driven Insights",
      description: "Get smart analytics and insights to understand market trends, pricing, and buyer interest.",
      icon: "📊",
    },
  ];

  return (
    <section className="w-full bg-[#F8F6F2] py-24">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-semibold text-[#1836b2] mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Why Choose <span className="text-[#302cfc]">Sky Realty</span>
        </motion.h2>

        <motion.p
          className="text-gray-700 text-lg md:text-xl mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
        >
          Experience the UAE’s smartest real estate marketplace. We combine technology,
          transparency, and premium service to help you list, showcase, and find properties with confidence.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-2xl font-semibold text-[#1836b2] mb-2">{f.title}</h3>
              <p className="text-gray-700 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}