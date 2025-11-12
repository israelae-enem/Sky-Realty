'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'

export const testimonials = [
  {
    id: '0',
    name: 'Rita Anderson',
    role: 'Real Estate Broker',
    avatarUrl: '/assets/images/realtor3.jpg',
    comment:
      'Sky Realty completely transformed how we manage listings. It’s intuitive, modern, and made our team more efficient than ever.',
  },
  {
    id: '1',
    name: 'Sarah Martinez',
    role: 'Property Manager',
    avatarUrl: '/assets/images/realtor.jpg',
    comment:
      'Finally, a platform that understands property management. Everything is centralized and simple to use.',
  },
  {
    id: '2',
    name: 'Muzain Ras',
    role: 'Leasing Agent',
    avatarUrl: '/assets/images/realtor2.jpg',
    comment:
      'Our onboarding process for tenants is seamless now. The automation tools save me hours each week.',
  },
  {
    id: '3',
    name: 'Liam Thompson',
    role: 'Real Estate Investor',
    avatarUrl: '/assets/images/realtor4.jpg',
    comment:
      'Sky Realty helped me manage multiple properties effortlessly. The analytics and notifications are game changers.',
  },
  {
    id: '4',
    name: 'Krystn E',
    role: 'Property Consultant',
    avatarUrl: '/assets/images/realtor5.jpg',
    comment:
      'The platform is sleek, fast, and makes communication with tenants so much easier. Highly recommend!',
  },
]

const scrollVariant = {
  animate: {
    x: ['0%', '-50%'],
    transition: {
      repeat: Infinity,
      repeatType: 'loop' as const,
      duration: 30,
      ease: 'linear',
    },
  },
}

export default function TestimonialCards() {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: { repeat: Infinity, repeatType: 'mirror', duration: 3, ease: 'easeInOut' },
    })
  }, [controls])

  return (
    <section className="overflow-hidden py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-tech md:text-4xl font-bold text-center text-[#1836b2] mb-12">
          WHAT OUR CLIENTS SAY
        </h2>

        <motion.div
          className="flex w-max gap-8"
          variants={scrollVariant}
          animate="animate"
        >
          {[...testimonials, ...testimonials].map((t, idx) => (
            <motion.div
              key={idx}
              animate={controls}
              className="flex-shrink-0 w-72 md:w-80 bg-gray-200 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center"
            >
              <img
                src={t.avatarUrl}
                alt={t.name}
                className="w-44 h-44 md:w-52 md:h-52 rounded-full object-cover mb-4"
              />
              <p className="text-gray-800 text-lg md:text-xl font-medium mb-2">"{t.comment}"</p>
              <h3 className="text-[#302cfc] text-xl md:text-2xl font-semibold">{t.name}</h3>
              <p className="text-gray-500 text-sm md:text-base">{t.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}