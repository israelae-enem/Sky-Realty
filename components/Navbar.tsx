"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (user && user.publicMetadata) {
      const hasCompleted = user.publicMetadata.hasCompletedOnboarding as boolean | undefined;
      setOnboardingComplete(hasCompleted ?? false);
    }
  }, [user]);

  return (
    <nav className="w-full flex items-center justify-between px-8 py-2 bg-[#1836b2] backdrop-blur-sm z-50 relative">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
        <Image
          src="/assets/icons/logo4.jpg"
          alt="logo"
          width={80}
          height={15}
          className="object-contain"
        />
      </Link>

      {/* Nav Items */}
      <div className="flex items-center space-x-10">
        <Link
          href="/"
          className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
        >
          Home
        </Link>

        <Link
          href="/service"
          className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
        >
          Services
        </Link>

         <Link
          href="/subscription"
          className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
        >
          Pricing
        </Link>

        {/* === Join Dropdown === */}
        <div
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300 flex items-center gap-1">
            Join <span className="text-sm">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50">
              <Link
                href="/home1"
                className="block px-4 py-2 text-[#1836b2] hover:bg-[#59fcf7]/20 transition-colors duration-200"
              >
                Realtor
              </Link>
              <Link
                href="/home2"
                className="block px-4 py-2 text-[#1836b2] hover:bg-[#59fcf7]/20 transition-colors duration-200"
              >
                Tenant
              </Link>
            </div>
          )}
        </div>

        {/* Onboarding / Dashboard */}
        {isSignedIn && !onboardingComplete && (
          <Link
            href="/onboarding"
            className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
          >
            Complete Onboarding
          </Link>
        )}

        {isSignedIn && onboardingComplete && (
          <Link
            href="/dashboard"
            className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
          >
            Dashboard
          </Link>
        )}

        <Link
          href="/about"
          className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
        >
          Our Story
        </Link>

        {/* Get Started Button */}
        {!isSignedIn && (
          <SignUpButton>
            <button className="px-6 py-2 rounded-full bg-white text-[#183662] font-semibold shadow-md hover:shadow-[0_0_15px_#59fcf7] transition-all duration-300">
              Get Started
            </button>
          </SignUpButton>
        )}

        {/* User Auth */}
        <div className="ml-4">
          <SignedOut>
            <SignInButton>
              <button className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300">
                Login
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;