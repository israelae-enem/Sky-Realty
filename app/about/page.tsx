"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

const AboutPage = () => {
  return (
    <main className="bg-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] overflow-hidden bg-blue-600 flex items-center justify-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white text-center px-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About Sky-Realty
        </motion.h1>
      </section>

      {/* Intro */}
      <section className="max-w-5xl mx-auto py-16 px-6 space-y-12">
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/images/ptoperty.jpg"
              alt="Property management"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <p>
              Sky-Realty is built for <strong>everyone who manages rental properties</strong>, whether you have one apartment or an entire portfolio. Our goal is to remove the headaches of property management, so you can focus on growing your business, keeping tenants happy, and maintaining steady income.
            </p>
            <p>
              You don't need to know complicated software. Every feature is intuitive, clearly labeled, and supported with guides. From the moment you log in, you can start managing tenants, collecting rent, tracking maintenance, and sending messages all without a single phone call.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row-reverse items-center gap-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/images/communication.jpg"
              alt="Messaging tool"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <p>
              Our <strong>in-app messaging tool</strong> ensures landlords and agents are always connected with tenants. No more chasing texts or missed calls. Tenants can share photos or videos of issues, schedule appointments, and communicate securely within the app.
            </p>
            <p>
              Sky-Realty also helps you manage leases efficiently. Upload digital copies, set reminders for renewals, and track the status of contracts. Our dashboard gives you a complete overview of occupancy, payments, maintenance requests, and communications in one place.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row items-center gap-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/images/dash.jpg"
              alt="Security and analytics"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <p>
              We prioritize <strong>security, transparency, and simplicity</strong>. All documents, payments, and messages are stored safely, accessible only to you and your tenants. This reduces misunderstandings, ensures compliance, and builds trust between landlords and tenants.
            </p>
            <p>
              Additionally, our <strong>analytics and reporting tools</strong> allow you to track income, monitor late payments, and make informed decisions to grow your property business. Even if you are not tech-savvy, Sky-Realty explains everything clearly and provides support every step of the way.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row-reverse items-center gap-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="md:w-1/2">
            <Image
              src="/assets/icons/sky-logo.jpg"
              alt="Global platform"
              width={1000}
              height={1000}
              className="rounded-lg shadow-lg object-cover w-full h-full"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <p>
              Our platform is not region-specific. It works globally, adapting to different rental markets and property types. Whether you manage residential apartments, commercial units, or mixed-use buildings, we give you the tools to simplify operations and maximize efficiency.
            </p>
            <p>
              We listen to our users and continuously improve. Every new feature, update, or enhancement is based on real feedback from landlords, agents, and tenants. With Sky-Realty, less hassle and more control isn’t just a promise—it’s a reality.
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

export default AboutPage