'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function CTASection() {
  const [openModal, setOpenModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
  })
  const [status, setStatus] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  interface ConsultationForm {
    name: string
    email: string
    phone: string
    date: string
    time: string
    message: string
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('Sending...')

    try {
      const res = await fetch('/api/send-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData as ConsultationForm),
      })

      if (res.ok) {
        setStatus('✅ Message sent successfully!')
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          message: '',
        } as ConsultationForm)

        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          setOpenModal(false)
        }, 2500)
      } else {
        setStatus('❌ Something went wrong. Try again.')
      }
    } catch (err) {
      console.error(err)
      setStatus('❌ Error sending message.')
    }
  }

  return (
    <section className="py-24 px-6 md:px-20 bg-gradient-to-b from-[#f7f4ef] to-[#ece7df] relative overflow-hidden">
      {/* Soft luxury glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[45%] h-[300px] bg-[#c8a96a]/20 blur-[120px] rounded-full opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* LEFT: Floating Image */}
        <motion.div
          className="w-full md:w-1/2 h-80 md:h-[500px] relative rounded-3xl overflow-hidden shadow-2xl"
          initial={{ y: 10 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          <img
            src="/assets/images/dash.jpg"
            alt="Consultation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7f4ef]/50 to-transparent" />
        </motion.div>

        {/* RIGHT: Form & CTA */}
        <div className="w-full md:w-1/2 bg-[#1836b2] text-white p-10 rounded-3xl flex flex-col gap-6 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-[#c8a96a]">
            Ready to Simplify Your Property Management?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-[#f3f1ed]">
            Book a consultation with <span className="font-semibold">Sky Realty</span>, the premier{' '}
            <span className="font-semibold">Dubai property management platform</span> trusted
            by premium landlords, real estate agencies, and developers across the UAE.
          </p>

          {/* Contact Info */}
          <div className="mb-6 space-y-2">
            <p className="text-lg">
              📧{' '}
              <a
                href="mailto:contact@skyrealtyae.com"
                className="underline hover:text-[#c8a96a] transition"
              >
                contact@skyrealtyae.com
              </a>
            </p>
            <p className="text-lg">
              📞{' '}
              <a
                href="tel:+971558265374"
                className="underline hover:text-[#c8a96a] transition"
              >
                +971 55 826 5374
              </a>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mb-4">
            <a
              href="/sign-in"
              className="bg-gradient-to-br from-[#c8a96a] to-[#302cfc] text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              Get Started
            </a>

            <button
              onClick={() => setOpenModal(true)}
              className="border-2 border-[#c8a96a] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[#c8a96a]/20 transition-all duration-300"
            >
              Book a Consultation
            </button>
          </div>
        </div>
      </div>

      {/* ====== Modal ====== */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white text-gray-800 p-8 rounded-3xl w-[90%] max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setOpenModal(false)}
                className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-[#c8a96a] transition"
              >
                ✕
              </button>

              <h3 className="text-2xl font-semibold text-[#1836b2] mb-6 text-center">
                Book a Consultation
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a96a]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a96a]"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a96a]"
                />

                <div className="flex gap-3">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-1/2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-1/2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  />
                </div>

                <textarea
                  name="message"
                  placeholder="Tell us about your needs..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a96a]"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-[#c8a96a] to-[#302cfc] text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  Submit
                </button>

                {status && (
                  <p className="text-center text-sm text-gray-700 mt-3">{status}</p>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Success Toast ====== */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#c8a96a] to-[#302cfc] text-white px-6 py-3 rounded-2xl shadow-2xl z-[1000]"
          >
            ✅ Consultation request sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}