"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ServicesPage() {
  const services = [
    {
      id: "property-management",
      title: "Property Management",
      description:
        "Simplify how you manage properties with automation, organization, and full control — all from one dashboard.",
      features: [
        "Centralized property dashboard",
        "Automated lease renewal and rent reminders",
        "Integrated maintenance request system",
        "Cloud-based document storage",
        "Analytics on occupancy and revenue",
      ],
      image: "/images/property.jpg",
    },
    {
      id: "tenant-management",
      title: "Tenant Management",
      description:
        "Streamline communication, handle tenant applications, and resolve issues quickly with an organized tenant management system.",
      features: [
        "Centralized tenant profiles",
        "Automated communication tools",
        "Track lease details and support tickets",
        "Easy renewal and move-out management",
        "Notification and message history",
      ],
      image: "/images/ten.jpg",
    },
    {
      id: "lease-document-control",
      title: "Lease & Document Control",
      description:
        "Digitize, store, and manage all your lease agreements securely in one place with automated reminders for renewals.",
      features: [
        "Secure digital document storage",
        "Automatic lease renewal tracking",
        "E-signature support",
        "Version control and document history",
        "Access permissions by user role",
      ],
      image: "/images/rdash.jpg",
    },
    {
      id: "rent-reminder",
      title: "Rent Reminder",
      description:
        "Automate rent reminders and simplify online payment collection to maintain a transparent financial flow.",
      features: [
        "Customizable rent reminders",
        "Secure online payment options",
        "Automatic receipts and records",
        "Overdue rent alerts",
        "Tenant payment history tracking",
      ],
      image: "/images/rent.jpg",
    },
    {
      id: "financial-analytics",
      title: "Financial Analytics",
      description:
        "Gain valuable insights into your property performance with smart dashboards that visualize revenue, expenses, and ROI.",
      features: [
        "Real-time financial dashboards",
        "Expense and income tracking",
        "Automated reporting",
        "Profitability and occupancy insights",
        "Downloadable data exports",
      ],
      image: "/images/ana.jpg",
    },
    {
      id: "maintenance-repairs",
      title: "Maintenance & Repairs",
      description:
        "Receive, assign, and track maintenance requests efficiently — ensuring your tenants stay happy and your properties stay top-notch.",
      features: [
        "Maintenance request tracking",
        "Vendor assignment and updates",
        "Photo and document attachments",
        "Automatic progress updates",
        "Performance analytics for repairs",
      ],
      image: "/images/maintenance-request.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-20 px-6">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-5xl font-bold text-[#302cfc] mb-4">
          Our Core Services
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Discover how Sky Realty helps you simplify property management, automate workflows,
          and make data-driven decisions — all in one place.
        </p>
      </motion.div>

      {/* Services Sections */}
      <div className="space-y-24 max-w-6xl mx-auto">
        {services.map((service, idx) => (
          <motion.section
            key={service.id}
            id={service.id}
            className="flex flex-col md:flex-row items-center gap-10 scroll-mt-24"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            {/* Image */}
            <div className="md:w-1/2">
              <Image
                src={service.image}
                alt={service.title}
                width={600}
                height={400}
                className="rounded-lg shadow-lg object-cover"
              />
            </div>

            {/* Content */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-[#302cfc] mb-4">
                {service.title}
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {service.description}
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                {service.features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>

              <motion.a
                href="#top"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-6 py-3 rounded-md bg-[#302cfc] text-white font-semibold hover:bg-blue-600 transition"
              >
                Back to Top
              </motion.a>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}