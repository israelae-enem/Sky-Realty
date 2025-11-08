'use client'

import FAQ from '@/sections/FAQ'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { FaLinkedin, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa'
import { motion, useScroll,useTransform } from 'framer-motion'
import PricingSubscription from '@/components/Pricing'
import WhySkyRealty from '@/components/WhySkyRealty'
import Link from 'next/link'
import ServicesSection from '@/components/ServiceSection'
import PainPointsPage from '@/components/PainPoints'
import SolutionsPage from '@/components/Solutions'
import ComparisonPage from '@/components/Comparisons'
import FoundersSection from '@/components/OurTeam'
import TestimonialsPage from '@/components/Testimony'
import ClientLogosCarousel from '@/components/Logos'
import TestimonialCards from '@/components/TestimonialCards'
import Footer from '@/components/Footer'
import WalkthroughSection from '@/components/WalkThrough'

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
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 200], [0, 80]);
  const scale = useTransform(scrollY, [0, 200], [1, 1.05]);

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const handleEnded = () => setIsVideoOpen(false)
    vid.addEventListener('ended', handleEnded)
    return () => vid.removeEventListener('ended', handleEnded)
  }, [isVideoOpen])

  return (
    <main className="flex flex-col w-full text-gray-900 bg-gray-100 mt-20">

    <section
      ref={ref}
      className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* ===== Background Video (No Blur) ===== */}
      <motion.video
        ref={ref}
        src="/assets/videos/hero2.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ y, scale }}
      />

      {/* ===== Gradient Overlay (keeps video visible but readable text) ===== */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* ===== Foreground Content ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 space-y-8">
        <motion.h1
          className="text-5xl md:text-7xl font-tech font-extrabold text-white tracking-tight drop-shadow-lg leading-tight"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Revolutionize How You Manage Real Estate 🚀
        </motion.h1>

        <motion.p
          className="max-w-2xl text-lg md:text-xl text-gray-100 font-medium leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Sky Realty gives you everything you need to streamline property
          management from smart rent tracking to effortless tenant engagement.
          Work smarter, grow faster, and stay in control.
        </motion.p>

        <motion.div
          className="flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <a
            href="/sign-in"
            className="px-8 py-4 bg-gradient-to-r from-[#302cfc] to-[#4d57ff] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-[#302cfc]/40 hover:scale-105 transition-all duration-300"
          >
            Get Started
          </a>

          <a
            href="/subscription"
            className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-[#302cfc] transition-all duration-300"
          >
            Subscribe Now
          </a>
        </motion.div>
      </div>

      {/* ===== Optional Scroll Indicator ===== */}
      <motion.div
        className="absolute bottom-10 text-white text-sm flex flex-col items-center cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <span className="animate-bounce">↓</span>
        <p className="text-xs mt-1 opacity-80">Scroll to explore</p>
      </motion.div>
    </section>

  <section>
    <ServicesSection />
   </section>

  <section
>
    <PainPointsPage />
  </section>

  <section>
    <SolutionsPage />
  </section>

  <section>
    <ClientLogosCarousel />
  </section>


       {/* Communication Section */}
            <section className="py-20 px-10 md:px-20 bg-gray-50">
              <div className="text-center mb-16">
                <motion.h2
                  className="text-4xl md:text-5xl font-accent font-bold text-blue-700 mb-6"
                  initial={{ opacity: 0, y: -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Keep All Your Conversations in One Place
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-700 font-body max-w-2xl mx-auto"
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
                    <h3 className="text-blue-700 text-2xl font-accent font-semibold mb-3">Manage Maintenance Requests Easily</h3>
                    <p className="text-gray-400 mb-4">
                      Submit and track requests without confusion. <Link href="/sign-in" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-blue-700 text-2xl font-accent font-semibold mb-3">Send and Receive Updates</h3>
                    <p className="text-gray-400 mb-4">
                      Get notified about your requests and updates automatically. <Link href="/sign-in" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-blue-700 font-accent text-2xl font-semibold mb-3">Store Every Record Securely</h3>
                    <p className="text-gray-400 mb-4">
                      All communication and records are safely stored. <Link href="/sign-in" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                    </p>
                  </div>
                </div>
              </div>
            </section>


  {/*  <section>
  <FoundersSection />
  </section>  */}

  <section>
    <WhySkyRealty />
  </section>

  <section>
    <TestimonialCards />
  </section>

  
  
  
  
              {/* Rent Section */}
              <section className="py-20 px-10 md:px-20 bg-white">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-bold font-accent text-blue-700 mb-6">Stay on Top of Rent</h2>
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
                    <h3 className="text-2xl font-accent font-semibold text-blue-700 mb-4">Rent Tracking</h3>
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
          className="bg-gray-200 py-20 px-5 md:px-20 flex flex-col md:flex-row items-center gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="md:w-1/2 space-y-4" variants={fadeUp}>
            <h2 className="text-3xl font-accent font-bold text-[#302cfc]">Maintenance Made Simple</h2>
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

  <section>
    <TestimonialsPage />
  </section>

  <WalkthroughSection />
       
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
      <section className="bg-gray-300 py-20 px-5 md:px-20">
        <FAQ />
      </section>

      {/* ================= Footer ================= */}
     <Footer />
    </main>
  )
}

export default Page