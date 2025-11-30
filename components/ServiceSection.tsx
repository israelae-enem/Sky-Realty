"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";

const services = [
  {
    title: "Listing Management & Verified Listings",
    description:
      "Manage your properties effortlessly and ensure only verified listings are showcased, giving buyers and investors confidence in every listing.",
  },
  {
    title: "Marketing & Exposure",
    description:
      "Promote your properties across multiple channels to attract high-quality leads and increase visibility in the luxury real estate market.",
  },
  {
    title: "Real-Time Lead Tracking",
    description:
      "Stay on top of inquiries with instant notifications and track every lead efficiently to maximize your conversion opportunities.",
  },
  {
    title: "Off-Plan Sales Support",
    description:
      "Manage off-plan property sales seamlessly, providing clients with accurate information, progress updates, and expert guidance.",
  },
  {
    title: "Tenant Management",
    description:
      "Streamline tenant onboarding, communication, and occupancy tracking to deliver a seamless experience for property owners and tenants alike.",
  },
  {
    title: "Agency Dashboard",
    description:
      "Get full control of your real estate operations with a centralized dashboard, from property listings to performance analytics.",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative w-full py-28 px-6 text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/burj2.jpg"
          alt="Dubai luxury real estate background"
          fill
          priority
          className="object-cover brightness-[0.45]"
        />
      </div>

      {/* Gold overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(200,169,106,0.25)] to-[rgba(0,0,0,0.2)] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            Our Premium{" "}
            <span className="text-[#1836b2] font-semibold">Services</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Sky Realty offers a complete suite of services designed to streamline property management, enhance visibility, and ensure a seamless experience for landlords, agencies, and tenants.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="relative backdrop-blur-xl bg-white/10 border border-white/20
                         rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                         hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all"
            >
              {/* Icon */}
              <div className="mb-6 text-[#302cfc] text-4xl flex justify-center">
                <FaCheckCircle />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-semibold text-[#1836b2] mb-4 text-center">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-100 leading-relaxed mb-4 text-sm md:text-base text-center">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}