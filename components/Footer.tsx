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
import FooterStickyButtons from "./FooterStickyBottons";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative w-full bg-[#1836b2]">
     

      {/* ===== Footer Content ===== */}
      <motion.footer
        className="relative z-10 py-16 px-5 md:px-20 text-gray-100"
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
              Sky Realty offers premium property management solutions for UAE’s elite real estate market. 
              Manage tenants, rentals, leases, and maintenance effortlessly with our intelligent dashboard.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:w-1/5">
            <h3 className="font-bold font-tech text-xl text-yellow-400 uppercase">
              QUICK LINKS
            </h3>
            <ul className="space-y-1 text-gray-300">
              <li><a href="/" className="hover:text-yellow-400 transition ">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-400 transition ">About Us</a></li>
              <li><a href="/home1" className="hover:text-yellow-400 transition ">Realtors</a></li>
              <li><a href="/home2" className="hover:text-yellow-400 transition ">Tenants</a></li>
              <li><a href="/subscription" className="hover:text-yellow-400 transition">Pricing</a></li>
              <li><a href="/faq" className="hover:text-yellow-400 transition ">FAQ</a></li>
              <li><a href="/help" className="hover:text-yellow-400 transition  ">Help</a></li>
              <li><a href="/privacy" className="hover:text-yellow-400 transition ">Privacy</a></li>
              <li><a href="/terms" className="hover:text-yellow-400 transition ">Terms</a></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="space-y-3 md:w-1/4">
            <h3 className="font-bold font-tech text-xl text-yellow-400 uppercase">
              GET IN TOUCH
            </h3>

            {/* Social Icons */}
            <div className="flex gap-4 mt-1 text-2xl">
              <a href="https://www.linkedin.com/company/skyrealtyae/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaLinkedin /></a>
              <a href="https://www.instagram.com/sky_realtyae" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaInstagram /></a>
              <a href="https://www.facebook.com/share/16LL8Fmpu1/" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaFacebook /></a>
              <a href="https://www.tiktok.com/@skyrealty.ae" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaTiktok /></a>
              <a href="https://wa.me/00971558265374" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaWhatsapp /></a>
            </div>

            {/* Contact Info */}
            <div className="mt-4 space-y-1 text-sm text-gray-200">
              <p className="flex items-center gap-2 transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaEnvelope /> <a href="mailto:support@skyrealtyae.com">support@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2 transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaEnvelope /> <a href="mailto:info@skyrealtyae.com">info@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2 transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaEnvelope /> <a href="mailto:contact@skyrealtyae.com">contact@skyrealtyae.com</a></p>
              <p className="flex items-center gap-2 transition transform hover:scale-125 hover:text-yellow-400 duration-300"><FaPhone /> +(971) 558 265 374</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-gray-200 mt-10 relative z-10">
          &copy; 2025. All rights reserved by Sky Realty.
        </p>
      </motion.footer>

      
  {/* Buttons here */}
         <FooterStickyButtons />

         

      

    
    </div>
  );
};

export default Footer;