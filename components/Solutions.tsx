'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const solutions = [
  {
    title: '1. Smart Property Dashboard',
    description:
      'Sky Realty replaces messy spreadsheets with a clean, centralized dashboard. Manage all your properties, leases, and tenant information from one intuitive view — instantly searchable and synced across devices.',
    image: '/assets/images/dash1.jpg',
  },
  {
    title: '2. Automated Rent Collection',
    description:
      'Our platform automates rent reminders, invoices, and receipts. Tenants receive instant notifications, while realtors can track payments in real time — no more chasing payments manually.',
    image: '/assets/images/rent.jpg',
  },
  {
    title: '3. Unified Communication Hub',
    description:
      'Ditch scattered emails and chats. Sky Realty brings all tenant and contractor communication into one platform, with message history and media sharing for full transparency.',
    image: '/assets/images/communication.jpg',
  },
  {
    title: '4. Streamlined Maintenance Requests',
    description:
      'Tenants can submit repair requests with photos or videos. Realtors can assign contractors, track progress, and close requests keeping operations smooth and professional.',
    image: '/assets/images/maintenance-request.jpg',
  },
  {
    title: '5. Digital Lease Management',
    description:
      'Upload, store, and sign leases digitally. Get alerts before contracts expire and renew directly from your dashboard, saving time and avoiding costly oversights.',
    image: '/assets/images/lease.jpg',
  },
  {
    title: '6. Real-Time Financial Insights',
    description:
      'See how your properties are performing at a glance. Sky Realty tracks income, expenses, ROI, and generates clear visual reports for better decision-making.',
    image: '/assets/images/ana.jpg',
  },
  {
    title: '7. Vacancy & Tenant Tracking',
    description:
      'Know exactly which units are occupied, when leases end, and which tenants are moving in next. Our automated system keeps your occupancy rate high and downtime low.',
    image: '/assets/images/ten.jpg',
  },
  {
    title: '8. Branded Realtor Experience',
    description:
      'Give your clients confidence with a professional digital presence. Customize invoices, receipts, and your dashboard with your brand colors and logo.',
    image: '/assets/images/receipt.jpg',
  },
  {
    title: '9. Scalable Infrastructure',
    description:
      'Whether you manage 5 or 500 properties, Sky Realty scales effortlessly with your portfolio. Add new properties and users without slowing down performance.',
    image: '/assets/images/property.jpg',
  },
  {
    title: '10. Secure Cloud Storage',
    description:
      'Every document, transaction, and message is encrypted and backed up. With role-based access, your team can work safely without compromising privacy.',
    image: '/assets/images/cus.jpg',
  },
]

const fadeSlide = {
  hidden: (direction: 'left' | 'right') => ({
    opacity: 0,
    x: direction === 'left' ? -100 : 100,
  }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-20 px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h1
          className="text-5xl font-bold font-tech text-[#302cfc] mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          How Sky Realty Solves Your Pain Points
        </motion.h1>
        <motion.p
          className="text-gray-700 text-lg font-body max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Every feature is designed to eliminate frustration and simplify your
          workflow helping realtors, landlords, and tenants thrive.
        </motion.p>
      </div>

      {/* Solutions List */}
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        {solutions.map((solution, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center bg-gray-200 rounded-2xl shadow-lg p-6 md:p-10 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i % 2 === 0 ? 'left' : 'right'}
            variants={fadeSlide}
          >
            <motion.div
              className="w-60 h-60 md:w-86 md:h-86 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
            >
              <Image
                src={solution.image}
                alt={solution.title}
                width={500}
                height={500}
                className="rounded-full object-cover w-full h-full shadow-md"
              />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#302cfc] mb-3 text-center">
              {solution.title}
            </h2>
            <p className="text-gray-700 text-lg md:text-xl text-center leading-relaxed">
              {solution.description}
            </p>
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
          Experience the Sky Realty Difference
        </h2>
        <a
          href="/sign-in"
          className="inline-block bg-[#302cfc] text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#241fd9]/80 transition"
        >
          Start Managing Smarter
        </a>
      </motion.div>
    </main>
  )
}