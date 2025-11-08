// components/FAQ.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is Sky-Realty?",
    answer:
      "Sky-Realty is a property management platform built for realtors to manage properties, tenants, rent, and maintenance requests all in one place.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We offer flexible subscription plans: Basic (10 properties), Pro (20 properties), and Premium (unlimited properties). You can view full details on our Pricing page.",
  },
  {
    question: "Do tenants need an account?",
    answer:
      "Yes. Tenants can sign up for free to view leases, submit maintenance requests, and get rent reminders directly from the platform.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply sign up with your email, choose a plan, and add your first property. From there, you can invite tenants and upload lease documents.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption and security.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-100 text-gray-900 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-tech font-bold text-gray-900">Frequently Asked Questions</h2>
        <p className="mt-3 text-gray-700">
          Everything you need to know about Sky-Realty.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border border-gray-400 rounded-lg p-4 bg-gray-300"
          >
            <button
              className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-900"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="ml-2 text-[#302cfc]">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.p
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-3 text-gray-800"
                >
                  {faq.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}