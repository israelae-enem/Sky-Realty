"use client";

import { motion } from "framer-motion";

const DashboardPreview = () => {
  return (
    <section className="relative w-full bg-[#F9FAFB] py-24 flex flex-col items-center justify-center overflow-hidden">
      {/* ===== Dashboard Image ===== */}
      <motion.img
        src="/assets/images/rdash.jpg" // <-- replace with your preferred dashboard image
        alt="Sky Realty Dashboard Preview"
        className="w-[90%] md:w-[70%] lg:w-[60%] rounded-xl shadow-2xl object-cover"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      />

      {/* ===== Text Content ===== */}
      <div className="mt-12 text-center px-6 max-w-3xl">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          A Modern Control Center for Every Realtor 🏡
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
        >
          From managing your properties to engaging seamlessly with tenants,{" "}
          <span className="font-semibold text-[#302cfc]">Sky Realty’s</span> intuitive
          dashboard gives you complete control. Track rent payments, receive
          smart reminders, schedule maintenance appointments, and stay on top of
          every detail all in one simple, powerful space.
        </motion.p>
      </div>
    </section>
  );
};

export default DashboardPreview;