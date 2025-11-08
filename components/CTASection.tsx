// components/CTASection.jsx
"use client"
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-20 px-10 md:px-20 bg-blue-700 text-white text-center rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-accent md:text-5xl font-bold mb-6">
          Still have questions?
        </h2>
        <p className="text-lg md:text-xl mb-8 ">
          Connect with our live chat support 24/7
        </p>

         <a
          href="/terms"
          className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition">
          
          Get in touch
        </a>
        
      </motion.div>
    </section>
  );
}