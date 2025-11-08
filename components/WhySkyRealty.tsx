// components/WhySkyRealty.jsx
"use client"
import { motion } from 'framer-motion';

export default function WhySkyRealty() {
  const points = [
    {
      title: 'Save Time Effortlessly',
      description:
        'Automate routine tasks and manage your properties efficiently, so you can focus on what really matters.',
    },
    {
      title: 'Stay Organized',
      description:
        'Keep track of tenants, payments, and documents all in one place with easy-to-use dashboards.',
    },
    {
      title: 'Grow Your Business',
      description:
        'Access smart insights and tools to make better decisions and expand your rental portfolio confidently.',
    },
  ];

  return (
    <section className="py-20 px-10 md:px-20 bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-accent font-bold text-blue-700">Why Sky Realty Makes Your Life Better</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        {points.map((point, index) => (
          <motion.div
            key={index}
            className="flex-1 bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-blue-700 text-2xl font-semibold mb-4">{point.title}</h3>
            <p className="text-gray-400 text-lg">{point.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}