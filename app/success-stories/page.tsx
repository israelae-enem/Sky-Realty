'use client'

import { motion } from 'framer-motion'

// Tenant Testimonials
const tenantTestimonials = [
  {
    name: "Amanda Welch",
    role: "Tenant, NZ",
    image: "/assets/images/tenant1.jpg",
    story: `Before Sky Realty, paying rent meant standing in line or sending endless messages to confirm receipts. 
    Now I pay, get instant confirmation, and can even track my maintenance requests in real-time. 
    My landlord responds faster, and everything feels transparent.`,
  },
  {
    name: "James Carter",
    role: "Tenant, London",
    image: "/assets/images/realtor4.jpg",
    story: `I used to dread rent day lost receipts, missed reminders, and constant confusion. 
    Sky Realty fixed that. I get notifications before rent is due, and my payment history is saved in one dashboard. 
    It’s stress-free renting for the first time.`,
  },
  {
    name: "Shalom Peace",
    role: "Tenant, USA",
    image: "/assets/images/tenant3.jpg",
    story: `Maintenance used to take forever I’d call, text, and wait days. 
    With Sky Realty, I just open the app, submit a request, and track it till completion. 
    The convenience is unmatched. My home finally feels managed professionally.`,
  },
  {
    name: "Daniella Kim",
    role: "Tenant, NZ",
    image: "/assets/images/tenant.jpg",
    story: `Sky Realty makes renting effortless. I can see my lease, request repairs, and chat directly with my property manager. 
    No more long email threads or confusion. I feel like I have control for the first time.`,
  },
  {
    name: "Maria Gonzales",
    role: "Tenant, Madrid",
    image: "/assets/images/tenant2.jpg",
    story: `As a foreign tenant, I struggled with language barriers and missed communications. 
    Sky Realty keeps everything in clear records  rent, requests, documents all accessible anytime. 
    It gave me peace of mind in a new country.`,
  },
  {
    name: "Derrick Ndum",
    role: "Tenant, Cameroon",
    image: "/assets/images/tenant4.jpg",
    story: `The tenant portal makes everything simple. I can log in, pay rent, and track issues without calling anyone. 
    Sky Realty has completely changed how I interact with my landlord  it’s smooth and professional.`,
  },
]

// Realtor Testimonials
const realtorTestimonials = [
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

export default function SuccessStories() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 py-20 mt-20 px-6">
      {/* Hero Header */}
      <div className="text-center mb-20">
        <motion.h1
          className="text-5xl font-tech text-[#302cfc] mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Success Stories
        </motion.h1>
        <motion.p
          className="text-gray-700 text-lg max-w-2xl mx-auto font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          From tenants to realtors  everyone’s experiencing simpler, smarter property management with Sky Realty.
        </motion.p>
      </div>

      {/* Tenant Testimonials */}
      <section className="max-w-7xl mx-auto mb-20">
        <h2 className="text-3xl font-tech text-center text-gray-800 mb-12">What Tenants Are Saying</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {tenantTestimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center"
            >
              <img
                src={t.image}
                alt={t.name}
                className="w-40 h-40 rounded-full object-cover mb-6 border-4 border-[#302cfc]/60"
              />
              <p className="text-gray-700 italic mb-4 text-sm">“{t.story}”</p>
              <h3 className="font-bold text-lg text-[#302cfc]">{t.name}</h3>
              <p className="text-gray-600 text-sm">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Realtor Testimonials */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-tech text-center text-gray-800 mb-12">What Realtors Say About Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {realtorTestimonials.map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center"
            >
              <img
                src={r.avatarUrl}
                alt={r.name}
                className="w-40 h-40 rounded-full object-cover mb-6 border-4 border-[#302cfc]/60"
              />
              <p className="text-gray-700 italic mb-4 text-sm">“{r.comment}”</p>
              <h3 className="font-bold text-lg text-[#302cfc]">{r.name}</h3>
              <p className="text-gray-600 text-sm">{r.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.div
        className="text-center mt-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-tech font-semibold text-gray-800 mb-8">
          Join thousands experiencing a smarter way to rent and manage with Sky Realty
        </h2>
        <a
          href="/sign-in"
          className="inline-block bg-[#302cfc] text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#241fd9]/80 transition"
        >
          Get Started Today
        </a>
      </motion.div>
    </main>
  )
}