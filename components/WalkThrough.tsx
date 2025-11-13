"use client";
import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const cards = [
    { title: "REGISTER YOUR ACCOUNT", bg: "#1836b2" },
    { title: "MANAGE YOUR PROPERTIES", bg: "#2563eb" },
    { title: "SEAMLESS AND HASSLE-FREE", bg: "#1836b2" },
  ];

  // Float animation for cards and button
  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0], // float up and down
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="w-full bg-gray-100 py-20">
      <div className="container mx-auto px-6 text-center flex flex-col items-center space-y-6">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-[#1836b2]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          How Sky Realty Works
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          A simple way to connect tenants and realtors
        </motion.p>

        {/* Cards + Lines */}
        <div className="relative mt-16 flex justify-between items-center w-full max-w-5xl">
          {/* Top line */}
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0 50 Q250 150 500 50 Q750 -50 1000 50"
              fill="transparent"
              stroke="#59fcf7"
              strokeWidth="4"
            />
          </svg>

          {/* Bottom line */}
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 Q250 0 500 100 Q750 200 1000 100"
              fill="transparent"
              stroke={cards[0].bg}
              strokeWidth="4"
            />
          </svg>

          {/* Cards */}
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              className="relative flex flex-col items-center justify-center w-62 h-62 rounded-full shadow-lg"
              style={{ backgroundColor: card.bg }}
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              transition={{ delay: idx * 0.2 }}
            >
              <p className="text-center text-white font-bold text-sm md:text-lg uppercase px-4">
                {card.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Get Started Button */}
        <motion.a
          href="/sign-in"
          className="mt-16 px-8 py-4 rounded-full bg-[#302cfc] text-white flex items-center justify-center text-lg font-semibold shadow-lg hover:bg-blue-600 transition"
          variants={floatAnimation}
          initial="initial"
          animate="animate"
        >
          Get Started
        </motion.a>
      </div>
    </section>
  );
}