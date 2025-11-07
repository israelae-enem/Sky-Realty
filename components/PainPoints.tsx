"use client";

import { motion } from "framer-motion";

const painPoints = [
  {
    title: "1. Manual Property Tracking",
    description: `Many realtors and landlords still use spreadsheets or paper files to track tenants, leases, and payments. 
    This leads to confusion, missed renewals, and time wasted on manual updates. 
    Sky Realty automates record-keeping and syncs everything in real time across devices.`,
  },
  {
    title: "2. Missed Rent Payments & Reminders",
    description: `Late or forgotten rent payments cause stress for both landlords and tenants. 
    With Sky Realty, rent reminders, invoices, and receipts are automatically generated and sent — keeping everyone accountable and on time.`,
  },
  {
    title: "3. Disorganized Communication",
    description: `Phone calls, WhatsApp messages, and random emails make managing tenant issues chaotic. 
    Sky Realty centralizes all communication into one clean dashboard, so messages and maintenance requests never get lost again.`,
  },
  {
    title: "4. Maintenance Requests Gone Wrong",
    description: `Tracking repair issues is one of the biggest headaches in property management. 
    Sky Realty’s maintenance system lets tenants submit requests with photos, while realtors assign and monitor contractors — all inside the app.`,
  },
  {
    title: "5. Complex Lease Management",
    description: `Leases often get buried in folders or forgotten until it’s time to renew. 
    Sky Realty stores all lease documents securely in the cloud, notifies you before they expire, and makes renewals seamless.`,
  },
  {
    title: "6. Limited Financial Visibility",
    description: `It’s hard to know if your properties are actually profitable when income and expenses are scattered. 
    Sky Realty’s finance dashboard gives you an instant breakdown of rent collected, expenses paid, and ROI performance.`,
  },
  {
    title: "7. Tenant Turnover Confusion",
    description: `Realtors lose track of available units and tenant move-out dates, leading to vacancies and lost revenue. 
    Sky Realty automates vacancy tracking and notifies you when units become available helping you stay one step ahead.`,
  },
  {
    title: "8. Lack of Professional Image",
    description: `Managing tenants over chat apps and Excel sheets can make realtors look unprofessional. 
    Sky Realty gives your business a branded digital presence, complete with digital invoices, receipts, and a modern client experience.`,
  },
  {
    title: "9. Difficulty Scaling Operations",
    description: `Most tools break down once a realtor manages more than a few properties. 
    Sky Realty is built to scale whether you handle 5 or 500 units with features that grow as your business does.`,
  },
  {
    title: "10. Data Insecurity & Loss",
    description: `Losing tenant or financial data can be devastating. 
    Sky Realty securely stores all your information with encrypted backups and role-based access control, 
    ensuring your data stays safe and recoverable at all times.`,
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

export default function PainPointsPage() {
  return (
   <motion.main
      className="min-h-screen relative text-gray-900 py-20 px-6 overflow-hidden"
      style={{
        backgroundImage: "url('/assets/images/pic1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      initial={{ y: 0 }}
      whileInView={{ y: [0, -20, 0] }} // subtle vertical motion
      transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
    >
      {/* Content overlay to stay above background */}
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h1
            className="text-5xl font-bold text-[#302cfc] mb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Pain Points Sky Realty Solves
          </motion.h1>
          <motion.p
            className="text-gray-700 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Every realtor, landlord, and tenant faces challenges Sky Realty was built 
            to eliminate them through automation, organization, and simplicity.
          </motion.p>
        </div>

        {/* Pain Points Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              className="bg-gray-300 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <h3 className="text-xl font-semibold text-[#302cfc] mb-3">
                {point.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{point.description}</p>
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
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Ready to solve these challenges for good?
          </h2>
          <a
            href="/sign-in"
            className="inline-block bg-[#302cfc] text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#241fd9]/80 transition"
          >
            Start Free Trial
          </a>
        </motion.div>
      </div>
    </motion.main>
  );
}