'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const walkthroughSteps = [
  {
    title: 'Get Started Create Your Account',
    description: 'Click the Get Started button and set up your Sky-Realty account in seconds. Begin your journey effortlessly.',
    image: '/assets/images/signup.jpg',
  },
  {
    title: 'Complete Your Onboarding',
    description: 'Add your details, connect your profile, and personalize your dashboard for seamless property management.',
    image: '/assets/images/onboarding.jpg',
  },
  {
    title: 'Already Have an Account? Log In',
    description: 'Jump right back into your dashboard with one click everything you need is waiting for you.',
    image: '/assets/images/signin.jpg',
  },
]

export default function WalkthroughSection() {
  return (
    <section className="bg-gray-100 py-20 px-6 md:px-12 text-gray-900">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-[#302cfc] font-tech"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Getting Started with Sky-Realty
        </motion.h2>
        <motion.p
          className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Your luxury real estate experience simplified follow these simple steps to start managing or renting effortlessly.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {walkthroughSteps.map((step, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.05,
              rotateX: -5,
              rotateY: 5,
              transition: { duration: 0.4, ease: 'easeOut' },
            }}
          >
            <div className="relative w-full h-64 overflow-hidden">
              <Image
                src={step.image}
                alt={step.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-semibold text-[#302cfc] mb-2 font-tech">{step.title}</h3>
              <p className="text-gray-700 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <a
          href="/sign-in"
          className="bg-[#302cfc] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#1f1bcc] transition-all shadow-lg"
        >
          Get Started Now
        </a>
      </motion.div>
    </section>
  )
}