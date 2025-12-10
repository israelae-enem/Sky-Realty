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
import TestimonialsPage from '@/components/Testimony'
import ClientLogosCarousel from '@/components/Logos'
import TestimonialCards from '@/components/TestimonialCards'
import Footer from '@/components/Footer'
import WalkthroughSection from '@/components/WalkThrough'
import HeroSection from '@/components/Hero'
import CTASection from '@/components/CTASection'
import AboutUsSection from '@/components/AboutUsSection'
import FreeTrial from '@/components/FreeTrial'
import Marker from '@/components/Marker'

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
    <main className="min-h-screen overflow-x-hidden w-full text-gray-900 p-0 m-0">
    <HeroSection />
    <AboutUsSection />
    <WhySkyRealty />
    <CTASection />
    <WalkthroughSection/>
    <ServicesSection />
    <ClientLogosCarousel />
    <FreeTrial />
    <TestimonialCards />
    <FAQ />
    <Marker />
    <Footer />

       
    </main>
  )
}

export default Page