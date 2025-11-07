"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/images/pic1.jpg"
        alt="onboarding background"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center text-white px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Complete Your Onboarding
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
        >
          Tell us who you are so we can personalize your Sky Realty experience.
        </motion.p>

        {isSignedIn ? (
          // Show role buttons if signed in
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/realtor"
              className="px-10 py-5 bg-[#302cfc] hover:bg-[#241fd9]/90 text-white rounded-lg text-xl font-semibold shadow-lg transition transform hover:scale-105"
            >
              I’m a Realtor
            </Link>

            <Link
              href="/tenant"
              className="px-10 py-5 bg-white hover:bg-gray-200 text-[#302cfc] rounded-lg text-xl font-semibold shadow-lg transition transform hover:scale-105"
            >
              I’m a Tenant
            </Link>
          </motion.div>
        ) : (
          // Show sign in / sign up if not signed in
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <SignInButton>
              <button className="px-10 py-5 bg-white text-[#302cfc] rounded-lg text-xl font-semibold shadow-lg hover:bg-gray-200 transition transform hover:scale-105">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="px-10 py-5 bg-[#302cfc] text-white rounded-lg text-xl font-semibold shadow-lg hover:bg-[#241fd9]/90 transition transform hover:scale-105">
                Create Account
              </button>
            </SignUpButton>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}