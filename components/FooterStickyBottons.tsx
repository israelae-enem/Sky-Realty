"use client";
import { FaArrowUp, FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";

export default function FooterStickyButtons() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-[999]">
      {/* WhatsApp */}
      <a
        href="https://wa.me/971523729778"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={20} />
      </a>

      {/* Call */}
      <a
        href="tel:+971558265374"
        className="w-14 h-14 bg-[#302cfc] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Call Us"
      >
        <FaPhone size={20} />
      </a>

      

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-14 h-14 bg-yellow-400 text-[#1836b2] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Scroll to Top"
      >
        <FaArrowUp size={20} />
      </button>
    </div>
  );
}