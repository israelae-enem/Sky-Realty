"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function CTASection() {
  const [openModal, setOpenModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  interface ConsultationForm {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    message: string;
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res: Response = await fetch("/api/send-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData as ConsultationForm),
      });

      if (res.ok) {
        setStatus("✅ Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          date: "",
          time: "",
          message: "",
        } as ConsultationForm);

        // show toast & close modal after short delay
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setOpenModal(false);
        }, 2500);
      } else {
        setStatus("❌ Something went wrong. Try again.");
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus("❌ Error sending message.");
    }
  };

  return (
    <section className="py-20 px-8 md:px-20 bg-blue-700 text-white text-center relative">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Simplify Your Property Management?
        </h2>
        <p className="text-lg md:text-xl mb-10 text-blue-100 leading-relaxed">
          Whether you’re managing properties or renting one, our team is here to
          help you get started. Let’s talk about your goals today.
        </p>

        {/* Contact Info */}
        <div className="mb-10 space-y-2">
          <p className="text-lg">
            📧{" "}
            <a
              href="mailto:contact@skyrealty.com"
              className="underline hover:text-blue-200 transition"
            >
              contact@skyrealtyae.com
            </a>
          </p>
          <p className="text-lg">
            📞{" "}
            <a
              href="tel:+1234567890"
              className="underline hover:text-blue-200 transition"
            >
              +971 55 826 5374
            </a>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/sign-in"
            className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Get Started
          </a>

          <button
            onClick={() => setOpenModal(true)}
            className="border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300"
          >
            Book a Consultation
          </button>
        </div>
      </motion.div>

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
              className="bg-white text-gray-800 p-8 rounded-lg w-[90%] max-w-lg shadow-xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setOpenModal(false)}
                className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-blue-700 transition"
              >
                ✕
              </button>

              <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <div className="flex gap-3">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <textarea
                  name="message"
                  placeholder="Tell us about your needs..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-all duration-300"
                >
                  Submit
                </button>

                {status && (
                  <p className="text-center text-sm text-gray-700 mt-3">
                    {status}
                  </p>
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[1000]"
          >
            ✅ Consultation request sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}