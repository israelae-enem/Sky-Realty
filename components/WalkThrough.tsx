"use client";
import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const steps = [
    {
      title: "Create Your Account",
      description: "Sign up quickly and securely to access Sky Realty’s premium marketplace.",
      gradient: "bg-gradient-to-br from-[#1836b2] to-[#302cfc]"
    },
    {
      title: "List & Manage Properties",
      description: "Upload your properties, manage listings effortlessly, and stay organized.",
      gradient: "bg-gradient-to-br from-[#302cfc] to-[#59fcf7]"
    },
    {
      title: "Connect & Sell/Rent",
      description: "Reach buyers, tenants, and investors with confidence and transparency.",
      gradient: "bg-gradient-to-br from-[#1836b2] to-[#59fcf7]"
    }
  ];

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="w-full bg-[#F3F3F3] py-24">
      <div className="container mx-auto px-6 text-center flex flex-col items-center space-y-12">

        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-light text-[#1836b2]"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          How <span className="font-semibold text-[#302cfc]">Sky Realty</span> Works
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          A technology-driven platform designed to simplify property management, listings, 
          and connect landlords, tenants, and investors across the UAE.
        </motion.p>

        {/* Steps */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-12 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className={`flex flex-col items-center p-6 md:p-8 rounded-3xl shadow-2xl w-64 md:w-72 ${step.gradient}`}
              variants={floatVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: idx * 0.3 }}
            >
              <motion.h3
                className="text-white font-bold text-lg md:text-xl mb-2 text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.3 }}
                viewport={{ once: true }}
              >
                {step.title}
              </motion.h3>
              <motion.p
                className="text-white text-sm md:text-base text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.4 }}
                viewport={{ once: true }}
              >
                {step.description}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.a
          href="/sign-up"
          className="mt-16 px-12 py-4 bg-[#302cfc] text-white font-semibold rounded-full
                     shadow-[0_0_25px_rgba(48,44,252,0.45)]
                     hover:shadow-[0_0_40px_rgba(48,44,252,0.6)]
                     hover:scale-105 transition-all duration-300"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
        >
          Get Started Today
        </motion.a>

      </div>
    </section>
  );
}