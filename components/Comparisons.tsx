"use client";

import { motion } from "framer-motion";

const comparisons = [
  {
    category: "Property Management",
    traditional: "Manual tracking using spreadsheets and scattered files.",
    skyRealty:
      "Smart, unified dashboard with real-time property, lease, and tenant data.",
  },
  {
    category: "Rent Collection",
    traditional: "Late payments, reminders sent manually, unclear records.",
    skyRealty:
      "Automated rent reminders, instant notifications, and clear digital receipts.",
  },
  {
    category: "Maintenance Requests",
    traditional: "Phone calls and emails lead to confusion and missed updates.",
    skyRealty:
      "Tenants submit requests with photos, realtors assign contractors, and progress is tracked live.",
  },
  {
    category: "Communication",
    traditional: "Scattered between WhatsApp, email, and calls — no history.",
    skyRealty:
      "Centralized in-app messaging hub with searchable conversation history.",
  },
  {
    category: "Lease Management",
    traditional: "Paper contracts, lost documents, and forgotten renewals.",
    skyRealty:
      "Digital leases, secure storage, and automated renewal reminders.",
  },
  {
    category: "Financial Oversight",
    traditional: "Difficult to track income, expenses, and ROI in one place.",
    skyRealty:
      "Built-in financial analytics and visual reporting for better decisions.",
  },
  {
    category: "Scalability",
    traditional: "More properties = more complexity and confusion.",
    skyRealty:
      "Easily scale from 1 to 500+ units without changing your workflow.",
  },
  {
    category: "Security",
    traditional: "Data stored locally, risking loss or unauthorized access.",
    skyRealty:
      "Encrypted cloud storage with controlled user access and backups.",
  },
  {
    category: "Tenant Experience",
    traditional: "Limited visibility into payments, leases, and updates.",
    skyRealty:
      "Tenant dashboard with rent status, maintenance updates, and communication tools.",
  },
  {
    category: "Branding & Professionalism",
    traditional: "Generic communication with no brand identity.",
    skyRealty:
      "Custom-branded invoices, portals, and reports for a polished client experience.",
  },
];

export default function ComparisonPage() {
  return (
   <main className="relative min-h-screen text-gray-900 py-20 px-6 overflow-hidden">
  {/* Background Image with parallax */}
  <div
        className="absolute inset-0 bg-[url('/assets/images/pic1.jpg')] bg-cover bg-center -z-10"
      ></div>

  {/* Overlay content */}
  
    {/* Header */}
    <motion.div
      className="max-w-4xl mx-auto text-center mb-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-5xl font-tech font-bold text-[#302cfc] mb-4">
        Sky Realty vs Traditional Property Management
      </h1>
      <p className="text-gray-700 text-lg">
        See how Sky Realty transforms property management by automating tasks,
        improving communication, and delivering full control.
      </p>
    </motion.div>

    {/* Comparison Table */}
    <div className="max-w-6xl mx-auto overflow-x-auto">
      <motion.table
        className="w-full border-collapse shadow-lg rounded-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <thead>
          <tr className="bg-[#302cfc] text-white text-left">
            <th className="p-4 text-lg font-semibold">Category</th>
            <th className="p-4 text-lg font-semibold">Traditional Management</th>
            <th className="p-4 text-lg font-semibold">Sky Realty</th>
          </tr>
        </thead>

        <tbody>
  {comparisons.map((item, idx) => (
    <motion.tr
      key={idx}
      className={`${idx % 2 === 0 ? "bg-gray-100" : "bg-gray-200"} border-b border-gray-400`}
      initial={{ opacity: 0, y: 40, scale: 0.95 }} // start slightly down & smaller
      whileInView={{ opacity: 1, y: 0, scale: 1 }} // float up & scale to normal
      transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }} // stagger each row
      viewport={{ once: true }}
    >
      <td className="p-4 font-semibold text-gray-800">{item.category}</td>
      <td className="p-4 text-gray-700">{item.traditional}</td>
      <td className="p-4 text-[#302cfc] font-medium">{item.skyRealty}</td>
    </motion.tr>
  ))}
</tbody>
       
      </motion.table>
    </div>

    {/* CTA */}
    <motion.div
      className="text-center mt-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <h2 className="text-3xl font-tech font-semibold text-gray-800 mb-4">
        Ready to make the switch?
      </h2>
      <p className="text-gray-700 mb-6">
        Join hundreds of realtors who have upgraded to smarter, faster, and
        simpler property management.
      </p>
      <a
        href="/sign-in"
        className="inline-block bg-[#302cfc] hover:bg-[#241fd9]/80 text-white px-8 py-4 rounded-lg font-medium text-lg transition"
      >
        Get Started with Sky Realty
      </a>
    </motion.div>
  
</main>
  );
}