// pages/tenants.js
"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

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
    <main className="overflow-x-hidden bg-gray-300">

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row min-h-screen">
        <div className="flex-1 flex flex-col justify-center items-start p-10 md:p-20 bg-gray-50">
          <h1 className="text-5xl font-bold text-blue-700 mb-6">
            Manage Your Rentals Effortlessly
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Stay organized, pay rent on time, and communicate easily with your landlord.
          </p>
          <Link href="/sign-in"
           className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-800 transition">
            Get Started
          
        </Link>
        
        </div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Image
            src="/assets/images/happy-tenants.jpg"
            height={1000}
            width={1000}
            alt="Tenant dashboard"
            className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
            priority
          />
        </motion.div>
      </section>

      {/* Manage Section */}
      <section className="flex flex-col md:flex-row items-center my-20 px-10 md:px-20">
        <div className="flex-1 mb-10 md:mb-0 md:pr-10">
          <h2 className="text-4xl font-bold text-blue-700 mb-6">
            Stay in Control of Your Rentals
          </h2>
          <p className="text-lg text-gray-700">
            From your first apartment to your current lease, Sky Realty keeps everything simple and organized for tenants.
          </p>
        </div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Image
            src="/assets/images/dash.jpg"
            height={1000}
            width={1000}
            alt="Tenant managing rentals"
            className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
            priority
          />
        </motion.div>
      </section>

      {/* 3 Points Section */}
      <section className="py-20 px-10 md:px-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-700">
            Why Tenants Love Sky Realty
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-10">
          <motion.div
            className="flex-1 bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-blue-700 text-2xl font-semibold mb-4">Easy Rent Payments</h3>
            <p className="text-gray-400 text-lg">
              Pay your rent securely online anytime without worrying about missing a due date.
            </p>
          </motion.div>
          <motion.div
            className="flex-1 bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-blue-700 text-2xl font-semibold mb-4">Track Maintenance Requests</h3>
            <p className="text-gray-400 text-lg">
              Submit and track requests easily. Get updates when your issues are addressed.
            </p>
          </motion.div>
          <motion.div
            className="flex-1 bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-blue-700 text-2xl font-semibold mb-4">Centralized Communication</h3>
            <p className="text-gray-400 text-lg">
              All communication with your landlord is in one place—organized, simple, and accessible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rent Section */}
      <section className="py-20 px-10 md:px-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-blue-700 mb-6">Stay on Top of Rent</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Sky Realty keeps your rent records organized and up to date.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/assets/images/agent-tenant.jpg"
              height={1000}
              width={1000}
              alt="Rent management"
              className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
              priority
            />
          </motion.div>
          <div className="flex-1 flex flex-col gap-6">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">Rent Tracking</h3>
            <p className="text-gray-400 text-lg">
              See all your payments, due dates, and history in one simple dashboard.
            </p>
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">Rent Reminders</h3>
            <p className="text-gray-400 text-lg">
              Automatic reminders help you never miss a payment and stay stress-free.
            </p>
          </div>
        </div>
      </section>

      {/* Communication Section */}
      <section className="py-20 px-10 md:px-20 bg-gray-50">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-blue-700 mb-6"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Keep All Your Conversations in One Place
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Simplify communication with your landlord and track maintenance requests easily.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/assets/images/communication.jpg"
              height={1000}
              width={1000}
              alt="Tenant communication"
              className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
              priority
            />
          </motion.div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-blue-700 text-2xl font-semibold mb-3">Manage Maintenance Requests Easily</h3>
              <p className="text-gray-400 mb-4">
                Submit and track requests without confusion. <Link href="/maintenance" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-blue-700 text-2xl font-semibold mb-3">Send and Receive Updates</h3>
              <p className="text-gray-400 mb-4">
                Get notified about your requests and updates automatically. <Link href="/reminders" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-blue-700 text-2xl font-semibold mb-3">Store Every Record Securely</h3>
              <p className="text-gray-400 mb-4">
                All communication and records are safely stored. <Link href="/records" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-10 md:px-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-700">
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

      {/* CTA Section */}
      <section className="py-20 px-10 md:px-20 bg-gray-200 text-gray-800 text-center rounded-lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Still have questions?
          </h2>
          <p className="text-lg md:text-xl mb-8">
            Connect with our live chat support 24/7
          </p>
          <button className="bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition">
            Get in touch
          </button>
        </motion.div>
      </section>
      <section>
        <Footer />
      </section>


    </main>
  );
}