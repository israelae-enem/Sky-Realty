"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Blog() {
  return (
    <main className="max-w-6xl mx-auto py-16 px-6 space-y-20">

      {/* HERO ------------------------------------------------------- */}
      <section className="text-center space-y-6">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-4xl md:text-6xl font-bold"
          style={{ color: "#1836b2" }}
        >
          Dubai Real Estate Market 2025  
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-gray-600 max-w-2xl mx-auto text-lg"
        >
          Explore Dubai’s hottest communities, luxury trends, and why global
          investors are choosing the UAE’s most dynamic city.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-xl overflow-hidden shadow-xl"
        >
          <Image
            src="/assets/images/burj6.jpg"
            alt="Dubai Skyline"
            width={1500}
            height={800}
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </section>

      {/* MARKET DRIVERS ------------------------------------------------ */}
      <section className="space-y-10">
        <h2
          className="text-3xl font-semibold"
          style={{ color: "#1836b2" }}
        >
          Key Market Drivers in 2025
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Population Growth",
              desc: "Dubai’s fast-growing population fuels rental demand and premium yields.",
            },
            {
              title: "Investor-Friendly Policies",
              desc: "Zero property tax, long-term visas, and full foreign ownership.",
            },
            {
              title: "High ROI & Appreciation",
              desc: "Prime communities continue to deliver unmatched annual returns.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-6 rounded-2xl shadow-lg bg-white border border-gray-100 space-y-2"
            >
              <h3
                className="text-xl font-semibold"
                style={{ color: "#1836b2" }}
              >
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMMUNITIES ------------------------------------------------ */}
      <section className="space-y-10">
        <h2
          className="text-3xl font-semibold"
          style={{ color: "#1836b2" }}
        >
          Trending Communities in 2025
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              name: "Business Bay",
              img: "/assets/images/burj4.jpg",
              desc: "Premium towers, high occupancy, perfect for consistent rental income.",
            },
            {
              name: "Dubai Marina",
              img: "/assets/images/marina.jpg",
              desc: "Waterfront lifestyle with huge global demand and strong yields.",
            },
            {
              name: "Downtown Dubai",
              img: "/assets/images/burj6.jpg",
              desc: "Luxury high-rise living surrounding the Burj Khalifa.",
            },
            {
              name: "JVC",
              img: "/assets/images/jvc.jpg",
              desc: "Affordable and high ROI with strong family demand.",
            },
            {
              name: "Dubai South",
              img: "/assets/images/south.jpg",
              desc: "Fast development, off-plan projects, and future appreciation.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "#1836b2" }}
                >
                  {item.name}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL SECTION ----------------------------------------------- */}
     {/* FINAL SECTION ----------------------------------------------- */}
<section className="space-y-10">
  <h2
    className="text-3xl font-semibold"
    style={{ color: "#1836b2" }}
  >
    Why Invest in Dubai Right Now?
  </h2>

  {/* Luxury Cards */}
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      {
        title: "Strong Rental Yields",
        desc: "Premium communities delivering stable annual returns.",
      },
      {
        title: "Zero Property Tax",
        desc: "Investor-friendly policies that maximize long-term profit.",
      },
      {
        title: "High Global Demand",
        desc: "A steady inflow of residents, tourists, and investors.",
      },
      {
        title: "Luxury Lifestyle",
        desc: "A world-class environment attracting high-net-worth buyers.",
      },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 space-y-2"
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: "#1836b2" }}
        >
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm">{item.desc}</p>
      </motion.div>
    ))}
  </div>

  {/* Bold Final Text */}
  <p className="text-lg font-semibold text-gray-700 leading-relaxed">
    Dubai continues to set global standards for luxury living, stability,
    and long-term investment potential. Whether you're purchasing your first
    property or expanding an existing portfolio, Dubai in 2025 offers one of
    the most secure, fast-growing, and opportunity-rich real estate markets
    anywhere in the world.
  </p>
</section>

    </main>
  );
}