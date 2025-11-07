'use client'

import { SignUp } from "@clerk/nextjs";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const Page = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
      >
        <Image
          src="/assets/images/pic1.jpg" // <-- your background image
          alt="Sign Up Background"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* SignUp Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-white"
      >
        <SignUp
          redirectUrl={'/onboarding'}
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-[#302cfc] hover:bg-blue-700 text-white rounded-lg transition duration-300",
            },
          }}
        />
      </motion.div>
    </div>
  );
};

export default Page;