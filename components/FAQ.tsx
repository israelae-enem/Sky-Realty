// components/FAQ.tsx
"use client";
import { useState } from "react";

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
      "Absolutely. We use Supabase for authentication and Zinna for payment, ensuring industry-standard encryption and security.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-900 text-gray-100 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        <p className="mt-3 text-gray-400">
          Everything you need to know about Sky-Realty.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-lg p-4 bg-gray-800"
          >
            <button
              className="flex justify-between items-center w-full text-left text-lg font-medium text-white"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="ml-2 text-[#302cfc]">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-400">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}