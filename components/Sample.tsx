'use client'

import FAQ from '@/sections/FAQ'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { FaLinkedin, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa'
import { motion } from 'framer-motion'
import PricingSubscription from '@/components/Pricing'
import Testimonials from '@/sections/Testimonials'
import WhySkyRealty from '@/components/WhySkyRealty'
import Link from 'next/link'

const testimonials = [
  {
    name: "Alice Johnson",
    image: "/assets/images/testimonial1.jpg",
    text: "Sky Realty has completely simplified managing my rental properties. I save hours every week!",
  },
  {
    name: "Mohammed Al Fahad",
    image: "/assets/images/testimonial2.jpg",
    text: "The dashboard is intuitive, and communication with tenants has never been easier.",
  },
  {
    name: "Fatima Noor",
    image: "/assets/images/testimonial3.jpg",
    text: "Automated rent collection and maintenance tracking have transformed my workflow.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const slideLeft = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
}

const slideRight = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
}

const Page = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const handleEnded = () => setIsVideoOpen(false)
    vid.addEventListener('ended', handleEnded)
    return () => vid.removeEventListener('ended', handleEnded)
  }, [isVideoOpen])

  return (
    <main className="flex flex-col w-full text-gray-900 bg-gray-300">

      {/* ================= Hero Section ================= */}
<section className="relative w-full h-[80vh] overflow-hidden">
  <video
    ref={videoRef}
    src="/assets/videos/hero2.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover"
  />
  {/* Darker overlay for readability */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
  
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 space-y-6">
    <motion.h1
      className="text-4xl md:text-6xl font-extrabold text-gray-100 drop-shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      Elevate Your Real Estate Management 🚀
    </motion.h1>

    <motion.p
      className="max-w-2xl text-lg text-gray-200 font-semibold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Simplify your property management with Sky Realty built for realtors and tenants who want control, clarity, and collaboration.
    </motion.p>

    <motion.div
      className="flex gap-4 flex-wrap justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <a
        href="/sign-in"
        className="border bg-[#302cfc] hover:bg-[#241fd9]/80 text-white px-6 py-3 rounded-lg font-medium transition"
      >
        Get Started
      </a>
      <a
        href="/subscription"
        className="border bg-[#302cfc] hover:bg-[#241fd9]/80 text-white px-6 py-3 rounded-lg font-medium transition"
      >
        Subscribe Now
      </a>
    </motion.div>
  </div>
</section>



       <section className="bg-gray-200 py-20 px-5 md:px-20">
        <WhySkyRealty />
      </section>

       <section className="bg-gray-200 py-20 px-5 md:px-20">
        <Testimonials/>
      </section>


       {/* Communication Section */}
            <section className="py-20 px-10 md:px-20 bg-gray-50">
              <div className="text-center mb-16">
                <motion.h2
                  className="text-4xl md:text-5xl font-bold text-blue-700 mb-6"
                  initial={{ opacity: 0, y: -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Keep All Your Conversations in One Place
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-700 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Simplify communication with your landlord and track maintenance requests easily.
                </motion.p>
              </div>
      
              <div className="flex flex-col md:flex-row items-center gap-10">
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Image
                    src="/assets/images/communication.jpg"
                    height={1000}
                    width={1000}
                    alt="Tenant communication"
                    className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
                    priority
                  />
                </motion.div>
      
                <div className="flex-1 flex flex-col gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-blue-700 text-2xl font-semibold mb-3">Manage Maintenance Requests Easily</h3>
                    <p className="text-gray-400 mb-4">
                      Submit and track requests without confusion. <Link href="/maintenance" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-blue-700 text-2xl font-semibold mb-3">Send and Receive Updates</h3>
                    <p className="text-gray-400 mb-4">
                      Get notified about your requests and updates automatically. <Link href="/reminders" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-blue-700 text-2xl font-semibold mb-3">Store Every Record Securely</h3>
                    <p className="text-gray-400 mb-4">
                      All communication and records are safely stored. <Link href="/records" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                    </p>
                  </div>
                </div>
              </div>
            </section>

      



            {/* Rent Section */}
            <section className="py-20 px-10 md:px-20 bg-white">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-blue-700 mb-6">Stay on Top of Rent</h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Sky Realty keeps your rent records organized and up to date.
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-10">
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Image
                    src="/assets/images/agent-tenant.jpg"
                    height={1000}
                    width={1000}
                    alt="Rent management"
                    className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
                    priority
                  />
                </motion.div>
                <div className="flex-1 flex flex-col gap-6">
                  <h3 className="text-2xl font-semibold text-blue-700 mb-4">Rent Tracking</h3>
                  <p className="text-gray-400 text-lg">
                    See all your payments, due dates, and history in one simple dashboard.
                  </p>
                  <h3 className="text-2xl font-semibold text-blue-700 mb-4">Rent Reminders</h3>
                  <p className="text-gray-400 text-lg">
                    Automatic reminders help you never miss a payment and stay stress-free.
                  </p>
                </div>
              </div>
            </section>


      {/* ================= Maintenance Section ================= */}
      <motion.section
        id="maintenance"
        className="bg-gray-300 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="md:w-1/2 space-y-4" variants={fadeUp}>
          <h2 className="text-3xl font-bold text-[#302cfc]">Maintenance Made Simple</h2>
          <p className="text-gray-700">
            Manage repairs and requests in real-time with automated notifications and easy task tracking.
          </p>
          <ul className="list-disc ml-5 space-y-1 text-gray-700">
            <li>Instant notifications</li>
            <li>Assign contractors</li>
            <li>Track progress</li>
          </ul>
        </motion.div>
        <motion.div className="md:w-1/2 flex justify-center" variants={slideRight}>
          <Image
            src="/assets/images/maintenance-request.jpg"
            alt="maintenance"
            width={1000}
            height={1000}
            className="rounded-lg shadow-lg w-full h-full object-cover"
          />
        </motion.div>
      </motion.section>

      {/* ================= Testimonials ================= */}
      <section className="bg-gray-200 py-20 px-6 md:px-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-[#302cfc]">What Our Realtors Say 💙</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <Image src={t.image} alt={t.name} width={120} height={120} className="rounded-full mx-auto mb-4 object-cover" />
              <p className="text-gray-700 mb-2">"{t.text}"</p>
              <h3 className="text-[#302cfc] font-semibold">{t.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Pricing ================= */}
      <motion.section
        id="plans"
        className="bg-gray-100 py-20 px-5 md:px-20 flex flex-col items-center text-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <PricingSubscription />
      </motion.section>

      {/* ================= FAQ ================= */}
      <section className="bg-gray-200 py-20 px-5 md:px-20">
        <FAQ />
      </section>

      {/* ================= Footer ================= */}
      <motion.footer
        className="bg-gray-300 text-gray-800 py-10 px-5 md:px-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-2">
            <h3 className="font-bold text-xl">Sky-Realty</h3>
            <p>Smarter rental management at your fingertips.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">Navigation</h3>
            <ul className="space-y-1">
              <li><a href="#home" className="hover:text-blue-300">Home</a></li>
              <li><a href="#messaging" className="hover:text-blue-300">Messaging</a></li>
              <li><a href="#maintenance" className="hover:text-blue-300">Maintenance</a></li>
              <li><a href="#plans" className="hover:text-blue-300">Plans</a></li>
              <li><a href='/help' className='hover:text-blue-300'>Help Center</a></li>
              <li><a href='/terms' className='hover:text-blue-300'>Terms & Conditions</a></li>
              <li><a href='/privacy' className='hover:text-blue-300'>Privacy</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">Connect</h3>
            <div className="flex gap-4 text-2xl">
              <a href="https://www.linkedin.com/in/izzy-enem" target="_blank" aria-label="LinkedIn" className="hover:text-blue-300">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com/sky-realtyae" target="_blank" aria-label="Instagram" className="hover:text-blue-300">
                <FaInstagram />
              </a>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <p className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:support@skyrealtyae.com">support@skyrealtyae.com</a></p>
              <p className='flex items-center gap-2'><FaEnvelope /> <a href='mailto:info@skyrealtyae.com'>info@skyrealtyae.com</a></p>
              <p className='flex items-center gap-2'><FaEnvelope /> <a href='mailto:contact@skyrealtyae.com'>contact@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2"><FaPhone />+(971)558265374</p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm mt-10">&copy; {new Date().getFullYear()} Sky-Realty. All rights reserved.</p>
      </motion.footer>
    </main>
  )
}

export default Page