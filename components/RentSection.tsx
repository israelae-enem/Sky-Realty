"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function RentSection() {
  return (
    <section className="py-20 px-6 md:px-20 bg-gray-100 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left Side - Floating Image */}
      <motion.div
        className="w-full md:w-1/2"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/assets/images/key-handover.jpg"
          alt="Rent management"
          width={700}
          height={700}
          className="rounded-2xl object-cover w-full h-[450px] shadow-lg"
          priority
        />
      </motion.div>

      {/* Right Side - Content Cards */}
      <div className="w-full md:w-1/2 flex flex-col gap-8">
        <motion.h2
          className="text-4xl font-bold text-[#1836b2] mb-6 text-center md:text-left"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Stay On Top of Rent Effortlessly
        </motion.h2>

        {/* Card 1 */}
        <motion.div
          className="bg-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-[#1836b2] mb-3">
            Rent Tracking
          </h3>
          <p className="text-gray-900 leading-relaxed">
            Keep track of all your tenants’ rent payments in one organized
            dashboard. Instantly see what’s paid, pending, and overdue at a
            glance.
          </p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          className="bg-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold text-[#1836b2] mb-3">
            Automated Rent Reminders
          </h3>
          <p className="text-gray-900 leading-relaxed">
            Never miss a payment again. Automated notifications remind tenants
            on time while keeping you updated  no manual work needed.
          </p>
        </motion.div>
      </div>
    </section>
  );
}