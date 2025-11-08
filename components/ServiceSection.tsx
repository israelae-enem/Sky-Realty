"use client";

import { motion } from "framer-motion";
import { FaBuilding, FaUsers, FaFileContract, FaMoneyBillWave, FaChartLine, FaTools } from "react-icons/fa";

const services = [
  {
    icon: <FaBuilding className="text-[#302cfc] text-5xl mb-4" />,
    title: "Property Management",
    description:
      "Easily manage multiple properties in one centralized dashboard — from lease tracking to maintenance scheduling.",
  },
  {
    icon: <FaUsers className="text-[#302cfc] text-5xl mb-4" />,
    title: "Tenant Management",
    description:
      "Handle tenant applications, communication, and support requests seamlessly, keeping every interaction organized.",
  },
  {
    icon: <FaFileContract className="text-[#302cfc] text-5xl mb-4" />,
    title: "Lease & Document Control",
    description:
      "Store and manage digital leases, automate renewals, and keep every important document safe in the cloud.",
  },
  {
    icon: <FaMoneyBillWave className="text-[#302cfc] text-5xl mb-4" />,
    title: "Rent Reminder",
    description:
      "Automate rent reminders, collect payments online, and maintain transparent financial records effortlessly.",
  },
  {
    icon: <FaChartLine className="text-[#302cfc] text-5xl mb-4" />,
    title: "Financial Analytics",
    description:
      "Gain insights into revenue, expenses, and occupancy rates through powerful visual analytics and smart reports.",
  },
  {
    icon: <FaTools className="text-[#302cfc] text-5xl mb-4" />,
    title: "Maintenance & Repairs",
    description:
      "Receive and track maintenance requests, assign vendors, and ensure timely resolutions — all in one place.",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-gray-200 text-gray-900 py-20 px-6">
      {/* Heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-4xl font-tech md:text-5xl font-bold text-[#302cfc] mb-4">
          Our Core Services
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Everything you need to run your real estate operations smoothly automated, organized, and efficient.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {services.map((service, idx) => (
          <motion.div
            key={idx}
            className="bg-gray-100 rounded-xl shadow-md hover:shadow-lg p-8 text-center transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            {service.icon}
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {service.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}