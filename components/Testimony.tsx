"use client";

import { motion } from "framer-motion";

const testimonials = [
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
];

// Smooth continuous scroll animation
const scrollAnimation = {
  initial: { x: "0%" },
  animate: {
    x: ["0%", "-50%"],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 20,
      ease: "linear",
    },
  },
};


export default function TenantTestimonials() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 py-5 px-6 overflow-hidden">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h1
          className="text-5xl font-tech font-bold text-[#302cfc] mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          What Tenants Are Saying
        </motion.h1>
        <motion.p
          className="text-gray-700 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Real renters sharing real experiences see how Sky Realty made their rental life easier, faster, and stress-free.
        </motion.p>
      </div>

      {/* Scrolling Testimonials */}
      <div className="relative w-full overflow-hidden">
        <motion.div
         className="flex gap-10 items-stretch"
         variants={scrollAnimation}
         initial="initial"
          animate="animate"
          >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="min-w-[400px] bg-blue-300 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={t.image}
                alt={t.name}
                className="w-52 h-52 rounded-full object-cover mb-6 border-4 border-[#302cfc]/70 shadow-md"
              />
              <p className="text-gray-700 italic leading-relaxed mb-4">“{t.story}”</p>
              <h3 className="font-bold text-lg text-[#302cfc]">{t.name}</h3>
              <p className="text-gray-600 text-sm">{t.role}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        className="text-center mt-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-tech font-semibold text-gray-800 mb-8">
          Join thousands of tenants enjoying simpler renting with Sky Realty
        </h2>
        <a
          href="/sign-in"
          className="inline-block bg-[#302cfc] text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#241fd9]/80 transition"
        >
          Get Started Today
        </a>
      </motion.div>
    </main>
  );
}