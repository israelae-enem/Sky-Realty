"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

const HowToPage = () => {
  return (
    <main className="bg-gray-100 text-gray-900">

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] overflow-hidden bg-blue-500 flex items-center justify-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white text-center px-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          How to Use Sky-Realty
        </motion.h1>
      </section>

      {/* Steps Section */}
      <section className="max-w-5xl mx-auto py-16 px-6 space-y-16">

        {/* Step 1 */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/images/howto-step1.jpg"
              alt="Sign in or create account"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">Step 1: Sign In or Create an Account</h2>
            <p>
              Click the <strong>Sign In</strong> button at the top of the page. If you already have an account, log in. If you're new, choose <strong>Create an Account</strong> and get started instantly—no long forms, no hassle.
            </p>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          className="flex flex-col md:flex-row-reverse items-center gap-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/images/howto-step2.jpg"
              alt="Join Sky-Realty"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">Step 2: Join Sky-Realty</h2>
            <p>
              After signing in, click <strong>Join</strong> and select your role:
              <br />• <strong>Realtor:</strong> Manage properties, tenants, leases, and maintenance requests with ease.
              <br />• <strong>Tenant:</strong> Access your lease info, submit maintenance requests, and stay updated on your rental.
            </p>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/images/howto-step3.jpg"
              alt="Complete onboarding"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">Step 3: Complete Your Onboarding</h2>
            <p>
              Realtors will quickly set up their dashboard and first property. Tenants will connect with their realtor and access rental details. In just <strong>three clicks</strong>, your account is ready to explore all Sky-Realty features from automated rent tracking to team collaboration tools.
            </p>
          </div>
        </motion.div>

        {/* Final Call */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xl md:text-2xl font-semibold mb-6">
            Experience real estate management that's fast, simple, and designed just for you.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/sign-in"
              className="bg-blue-700 text-white hover:bg-blue-800 font-semibold px-6 py-3 rounded-lg transition"
            >
              Get Started Now
            </a>
            <a
              href="/subscription"
              className="border border-blue-700 hover:bg-blue-700 hover:text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              View Plans
            </a>
          </div>
        </motion.div>

      </section>
    </main>
  )
}

export default HowToPage