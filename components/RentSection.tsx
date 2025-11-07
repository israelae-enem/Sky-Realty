// components/RentSection.jsx
"use client"
import { motion } from 'framer-motion';
import Image from 'next/image';


export default function RentSection() {
  return (
    <section className="py-20 px-10 md:px-20 bg-white">
      {/* Text content */}
      <div className="text-center mb-16">
        <motion.h2
          className="text-5xl font-bold text-blue-700 mb-6"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          How to Stay on Top of Rent
        </motion.h2>
        <motion.p
          className="text-lg text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Sky Realty makes realtors’ books organized and updated.
        </motion.p>
      </div>

      {/* Features */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold text-blue-700 mb-4">Rent Tracking</h3>
          <p className="text-gray-400 text-lg">
            Keep track of all your tenants’ rent payments in one organized dashboard. Know what’s paid, pending, and overdue at a glance.
          </p>
        </motion.div>

        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold text-blue-700 mb-4">Rent Reminder</h3>
          <p className="text-gray-400 text-lg">
            Automated reminders for tenants help ensure timely payments. You'll stay informed without lifting a finger.
          </p>
        </motion.div>

        {/* Optional Image on larger screens */}
        <motion.div
          className="flex-1 hidden md:block"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Image
            src="/assets/images/key-handover.jpg"
            height={1000}
            width={1000}
            alt="Rent management"
            className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}