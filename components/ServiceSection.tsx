"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const services = [
  {
    title: "Property Management",
    description:
      "Easily manage multiple properties in one centralized dashboard from lease tracking to maintenance scheduling.",
    href: "/service",
  },
  {
    title: "Tenant Management",
    description:
      "Handle tenant applications, communication, and support requests seamlessly, keeping every interaction organized.",
    href: "/service",
  },
  {
    title: "Lease & Document Control",
    description:
      "Store and manage digital leases, automate renewals, and keep every important document safe in the cloud.",
    href: "/service",
  },
  {
    title: "Rent Reminder",
    description:
      "Automate rent reminders, collect payments online, and maintain transparent financial records effortlessly.",
    href: "/service",
  },
  {
    title: "Financial Analytics",
    description:
      "Gain insights into revenue, expenses, and occupancy rates through powerful visual analytics and smart reports.",
    href: "/service",
  },
  {
    title: "Maintenance & Repairs",
    description:
      "Receive and track maintenance requests, assign vendors, and ensure timely resolutions all in one place.",
    href: "/service",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#1836b2] text-white py-20 px-6">
      {/* Heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-white">
          Everything you need to run your real estate operations smoothly,
          automated, organized, and efficient.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {services.map((service, idx) => (
          <motion.div
            key={idx}
            className="bg-blue-400 rounded-xl shadow-md p-8 text-left relative transition-all duration-300 hover:shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Replace icon with Sky Realty logo */}
            <div className="absolute top-6 left-6">
              <Image
                src="/assets/icons/logo4.jpg" // ← Sky Realty logo path
                alt="Sky Realty Logo"
                width={50}
                height={50}
                className="rounded-full object-contain"
              />
            </div>

            {/* Card Content */}
            <h3 className="text-2xl font-semibold text-white mb-3 mt-12">
              {service.title}
            </h3>
            <p className="text-gray-900 leading-relaxed mb-4">
              {service.description}
            </p>

            <Link
              href={service.href}
              className="text-white underline font-semibold hover:text-[#59fcf7] transition-colors"
            >
              Learn More
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}