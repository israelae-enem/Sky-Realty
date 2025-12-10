// pages/tenants.js
"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SolutionsPage from '@/components/Solutions';
import RentSection from '@/components/RentSection';
import CommunicationSection from '@/components/CommunicationSection';
import CTASection from '@/components/CTASection';
import TenantTestimonials from '@/components/Testimony';

export default function TenantsPage() {
  // FAQ state
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const faqs = [
    {
      question: 'How does Sky Realty help me pay on time?',
      answer:
        ' You’ll receive reminders so you never miss a payment.',
    },
    {
      question: 'How do I submit a maintenance request?',
      answer:
        'All maintenance requests can be submitted directly from your dashboard. You’ll get updates when your request is received and resolved.',
    },
    {
      question: 'Is my information secure?',
      answer:
        'Yes! Sky Realty keeps all tenant information, payments, and communication encrypted and secure.',
    },
  ];

  interface FAQ {
    question: string;
    answer: string;
  }

  const toggleFAQ = (index: number): void => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="overflow-x-hidden min-h-screen bg-gray-300">
      {/* Hero Section */}
       {/* Hero Section */}
<section className="relative flex flex-col justify-center min-h-screen bg-gray-50 overflow-hidden">
  {/* Background Image */}
  <motion.div
    className="absolute inset-0 w-full h-full"
    initial={{ scale: 1 }}
    animate={{ scale: 1.03 }}
    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
  >
    <Image
      src="/assets/images/burj.jpg"
      alt="Tenant dashboard"
      fill
      className="object-cover w-full h-full"
      priority
    />
  </motion.div>

  {/* Overlay Content */}
  <div className="relative z-10 flex flex-col justify-center items-start p-10 md:p-20 max-w-3xl">
    <motion.h1
      className="text-5xl md:text-6xl font-tech font-bold text-[#1836b2] mb-6"
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      Manage Your Rentals Effortlessly
    </motion.h1>
    <motion.p
      className="text-xl md:text-2xl text-gray-100 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
    >
      Stay organized, track everything, and communicate seamlessly with your landlord or tenants.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      viewport={{ once: true }}
    >
      <Link
        href="/tenant"
        className="bg-[#1836b2] text-white px-8 py-4 rounded-lg text-lg hover:bg-[#241fd9] transition"
      >
        Get Started
      </Link>
    </motion.div>
  </div>
</section>

    <section className="py-20 px-6 bg-[#1836b2] text-white text-center">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Simplify Your Renting Experience?
        </h2>
        <p className="text-lg md:text-xl mb-10 text-gray-100 leading-relaxed">
          Join thousands of tenants using Sky Realty to stay organized, pay on time, 
          and communicate seamlessly with landlords.
        </p>

        <Link href="/login">
          <button className="bg-blue-500 text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg">
            Get Started
          </button>
        </Link>
      </motion.div>
    </section>
  

{/* Manage Section */}
<section className="flex flex-col md:flex-row items-center my-20 px-10 md:px-20 bg-gray-100 py-20 rounded-lg">
  {/* Text Card */}
  <motion.div
    className="flex-1 mb-10 md:mb-0 md:pr-10 bg-white p-10 rounded-2xl shadow-lg"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <h2 className="text-4xl font-tech font-bold text-[#1836b2] mb-6">
      Stay in Control of Your Rentals
    </h2>
    <p className="text-gray-900 text-lg leading-relaxed">
      From your first apartment to your current lease, Sky Realty keeps everything simple, organized, and accessible for tenants. Track your leases, communicate with landlords, and manage your rental journey effortlessly.
    </p>
  </motion.div>

  {/* Image */}
  <motion.div
    className="flex-1"
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    viewport={{ once: true }}
  >
    <Image
      src="/assets/images/dash.jpg"
      height={1000}
      width={1000}
      alt="Tenant managing rentals"
      className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-2xl shadow-lg"
      priority
    />
  </motion.div>
</section>

   

     <SolutionsPage/>

     <RentSection />

     <CommunicationSection />

      {/* FAQ Section */}
      <section className="py-20 px-10 md:px-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-tech font-bold text-blue-700">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-700 text-lg mt-4">
            Answers to the most common questions tenants have.
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center text-lg text-blue-700 font-semibold"
              >
                {faq.question}
                <span className="ml-4">{openFAQ === index ? '-' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 text-gray-400"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <TenantTestimonials />

      <section>
        <Footer />
      </section>


    </main>
  );
}