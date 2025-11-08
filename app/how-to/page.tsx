"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HowToPage() {
  return (
    <main className="bg-gray-50 text-gray-900">
      {/* Hero */}
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-[#302cfc] overflow-hidden">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white text-center px-6 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          How to Get Started with Sky-Realty
        </motion.h1>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto py-20 px-6 space-y-20">
        {/* Intro */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-[#302cfc]">
            Two Easy Ways to Begin
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            You can start using Sky-Realty right away in just a few clicks or
            explore the detailed step-by-step guide to understand every part of
            the journey.
          </p>
        </motion.div>

        {/* Option 1 – Quick Start */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-10 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-[#302cfc]">
            Option 1: Quick Start 🚀
          </h3>
          <p className="text-gray-800 text-lg leading-relaxed">
            The fastest way to join Sky-Realty:
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 text-lg">
            <li>Open the menu bar and click <strong>Get Started</strong>.</li>
            <li>
              You’ll be redirected to the <strong>Create Account</strong> page 
              sign up in seconds.
            </li>
            <li>
              After signing up, click the <strong>Complete Onboarding</strong>{" "}
              option in the menu.
            </li>
            <li>
              Fill out your onboarding details and you’re done! 🎉
            </li>
          </ol>
          <div className="flex justify-center mt-8">
            <Image
              src="/assets/images/onboarding.jpg"
              alt="Onboarding page preview"
              width={900}
              height={600}
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </motion.div>

        {/* Option 2 – Full Walkthrough */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-10 space-y-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-[#302cfc]">
            Option 2: Step-by-Step Walkthrough 🧭
          </h3>

          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/assets/images/realtorp.jpg"
                alt="Realtor page example"
                width={1000}
                height={800}
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
            <div className="md:w-1/2 space-y-3">
              <h4 className="text-xl font-bold text-[#302cfc]">
                Step 1 — Select Your Role
              </h4>
              <p className="text-gray-700 text-lg">
                Open the menu and pick either <strong>Realtor</strong> or{" "}
                <strong>Tenant</strong>. Each option leads to a unique page
                designed for your needs.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/assets/images/signup.jpg"
                alt="Signup page"
                width={1000}
                height={800}
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
            <div className="md:w-1/2 space-y-3">
              <h4 className="text-xl font-bold text-[#302cfc]">
                Step 2 — Create Your Account
              </h4>
              <p className="text-gray-700 text-lg">
                Click the <strong>Get Started</strong> button to register your
                account securely and instantly.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/assets/images/onboarding.jpg"
                alt="Complete onboarding"
                width={1000}
                height={800}
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
            <div className="md:w-1/2 space-y-3">
              <h4 className="text-xl font-bold text-[#302cfc]">
                Step 3 — Complete Onboarding
              </h4>
              <p className="text-gray-700 text-lg">
                Go back to the menu and select{" "}
                <strong>Complete Onboarding</strong>. Fill out your details to
                unlock your personalized dashboard.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/assets/images/rdash.jpg"
                alt="Dashboard preview"
                width={1000}
                height={800}
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
            <div className="md:w-1/2 space-y-3">
              <h4 className="text-xl font-bold text-[#302cfc]">
                Step 4 — Start Managing Effortlessly
              </h4>
              <p className="text-gray-700 text-lg">
                tenants can track rent
                and maintenance. Everything lives in one beautiful dashboard.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold mb-6">
            Join Sky-Realty and experience seamless property management today.
          </h3>
          <a
            href="/sign-in"
            className="inline-block bg-[#302cfc] text-white hover:bg-[#241fd9] px-8 py-4 rounded-lg font-medium transition-all duration-300"
          >
            Get Started Now
          </a>
        </motion.div>
      </section>
    </main>
  );
}