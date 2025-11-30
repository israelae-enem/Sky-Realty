'use client'

import { motion } from 'framer-motion'

export const testimonials = [
  {
    id: '0',
    name: 'Rita Anderson',
    role: 'Real Estate Broker',
    avatarUrl: '/assets/images/realtor3.jpg',
    comment:
      'Sky Realty transformed how I showcase properties. Verified listings save me hours each week, and my clients trust the platform fully.',
  },
  {
    id: '1',
    name: 'Sarah Martinez',
    role: 'Property Manager',
    avatarUrl: '/assets/images/realtor.jpg',
    comment:
      'Centralized management and automated notifications make property tracking effortless. This platform truly understands real estate workflows.',
  },
  {
    id: '2',
    name: 'Muzain Ras',
    role: 'Leasing Agent',
    avatarUrl: '/assets/images/realtor2.jpg',
    comment:
      'Tenant onboarding has never been smoother. The automation tools let me focus on clients instead of paperwork.',
  },
  {
    id: '3',
    name: 'Liam Thompson',
    role: 'Real Estate Investor',
    avatarUrl: '/assets/images/realtor4.jpg',
    comment:
      'Managing multiple properties is now seamless. Analytics and alerts help me make faster decisions and maximize ROI.',
  },
  {
    id: '4',
    name: 'Krystn E',
    role: 'Property Consultant',
    avatarUrl: '/assets/images/realtor5.jpg',
    comment:
      'Communication with tenants and landlords is effortless. The sleek UI and smart dashboard make my workday much easier.',
  },
]

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: { repeat: Infinity, repeatType: 'mirror', duration: 3, ease: 'easeInOut' },
  },
}

export default function TestimonialCards() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-[#f7f4ef] to-[#f2ede4] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1836b2] mb-12">
          Trusted by Elite Dubai Real Estate Professionals
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05 }}
              animate="animate"
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center border-2 border-[#C8A96A]/40"
            >
              <motion.div
                className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-[#C8A96A] mb-4 shadow-lg"
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, repeatType: 'mirror', duration: 3, ease: 'easeInOut' }}
              >
                <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
              </motion.div>

              <p className="text-gray-800 text-lg md:text-xl font-medium mb-2">"{t.comment}"</p>
              <h3 className="text-[#302cfc] text-xl md:text-2xl font-semibold">{t.name}</h3>
              <p className="text-[#1836b2] text-sm md:text-base">{t.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}