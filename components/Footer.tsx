"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* ================= Footer ================= */}
      <motion.footer
        className="bg-gray-300 text-gray-800 py-12 px-5 md:px-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="space-y-3 md:w-1/3">
            <h3 className="font-bold font-accent text-2xl text-[#302cfc]">Sky Realty</h3>
            <p className="text-gray-700 leading-relaxed">
              Smarter property management at your fingertips. Manage tenants, rentals, maintenance, all in one dashboard.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 md:w-1/5">
            <h3 className="font-bold font-accent text-xl text-[#302cfc]">Navigation</h3>
            <ul className="space-y-1 text-gray-700">
              <li><a href="/" className="hover:text-blue-600 transition">Home</a></li>
              <li><a href="/about" className="hover:text-blue-600 transition">About Us</a></li>
              <li><a href="/home1" className="hover:text-blue-600 transition">Realtor</a></li>
              <li><a href="/home2" className="hover:text-blue-600 transition">Tenants</a></li>
              <li><a href="/subscription" className="hover:text-blue-600 transition">Pricing</a></li>
              <li><a href="/help" className="hover:text-blue-600 transition">Help</a></li>
              <li><a href="/privacy" className="hover:text-blue-600 transition">Privacy</a></li>
              <li><a href="/terms" className="hover:text-blue-600 transition">Terms</a></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-3 md:w-1/4">
            <h3 className="font-bold font-accent text-xl text-[#302cfc]">Connect</h3>
            <div className="flex gap-4 mt-1 text-2xl">
              <a href="https://www.linkedin.com/company/sky-realty" target="_blank" className="hover:text-blue-600"><FaLinkedin /></a>
              <a href="https://www.instagram.com/sky_realtyae?igsh=dWFoZDAybDgwNTNl&utm_source=qr" target="_blank" className="hover:text-blue-600"><FaInstagram /></a>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:support@skyrealtyae.com">support@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:info@skyrealtyae.com">info@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:contact@skyrealtyae.com">contact@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2"><FaPhone /> +(971)558265374</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-gray-600 mt-10">
          &copy; {new Date().getFullYear()} Sky Realty. All rights reserved.
        </p>
      </motion.footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-[#302cfc] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        aria-label="Back to top"
      >
        <FaArrowUp />
      </button>
    </div>
  );
};

export default Footer;