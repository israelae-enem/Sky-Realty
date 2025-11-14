"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaArrowUp,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* ================= Footer ================= */}
      <motion.footer
        className="bg-[#1836b2] text-gray-100 py-12 px-5 md:px-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Logo + Description */}
          <div className="space-y-4 md:w-1/3">
            <div className="flex items-center justify-center md:justify-start">
              <Image
                src="/assets/icons/logo4.jpg"
                alt="Sky Realty Logo"
                width={90}
                height={90}
                className="rounded-lg object-contain hover:scale-105 transition-transform duration-300 shadow-lg"
              />
            </div>
            <p className="text-gray-200 leading-relaxed text-base mt-4">
              Sky Realty offers smarter property management at your fingertips. Manage tenants,
              rentals, and maintenance all in one dashboard.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:w-1/5">
            <h3 className="font-bold font-tech text-xl text-gray-100 uppercase">
              QUICK LINKS
            </h3>
            <ul className="space-y-1 text-gray-300">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/about" className="hover:text-white transition">About Us</a></li>
              <li><a href="/home1" className="hover:text-white transition">Realtors</a></li>
              <li><a href="/home2" className="hover:text-white transition">Tenants</a></li>
              <li><a href="/subscription" className="hover:text-white transition">Pricing</a></li>
              <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
              <li><a href="/help" className="hover:text-white transition">Help</a></li>
              <li><a href="/privacy" className="hover:text-white transition">Privacy</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms</a></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="space-y-3 md:w-1/4">
            <h3 className="font-bold font-tech text-xl text-gray-100 uppercase">
              GET IN TOUCH
            </h3>
            <div className="flex gap-4 mt-1 text-2xl">
              <a
                href="https://www.linkedin.com/company/sky-realty"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://www.instagram.com/sky_realtyae?igsh=dWFoZDAybDgwNTNl&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.facebook.com/share/16LL8Fmpu1/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <FaFacebook />
              </a>

              <a
                href="https://www.tiktok.com/@skyrealty.ae?_r=1&_t=ZS-91N7d1vPtsl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <FaTiktok />
              </a>

              {/* ⭐ Added WhatsApp */}
              <a
                href="https://wa.me/00971558265374"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <FaWhatsapp />
              </a>
            </div>

            <div className="mt-4 space-y-1 text-sm text-gray-200">
              <p className="flex items-center gap-2">
                <FaEnvelope />{" "}
                <a href="mailto:support@skyrealtyae.com">support@skyrealtyae.com</a>
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope />{" "}
                <a href="mailto:info@skyrealtyae.com">info@skyrealtyae.com</a>
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope />{" "}
                <a href="mailto:contact@skyrealtyae.com">contact@skyrealtyae.com</a>
              </p>
              <p className="flex items-center gap-2">
                <FaPhone /> +(971) 558 265 374
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-gray-200 mt-10">
          &copy; 2025. All rights reserved by Sky Realty.
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