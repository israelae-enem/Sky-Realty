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
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user?.publicMetadata) {
      setOnboardingComplete(
        (user.publicMetadata.hasCompletedOnboarding as boolean) ?? false
      );
    }
  }, [user]);

  return (
    <nav className="w-full bg-[#1836b2] px-4 py-3 relative z-50 shadow-md">
     <div className="flex items-center justify-between">
      
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
          href="/home3"
          className="text-white text-lg font-medium hover:text-[#59fcf7] transition-colors duration-300"
        >
          Properties
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
                href="/home1"
                className="block px-4 py-2 text-[#1836b2] hover:bg-[#59fcf7]/20 transition-colors duration-200"
              >
                Agency
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
   </div>

      

      {mobileOpen && (
  <div className="md:hidden mt-4 bg-[#1836b2] rounded-xl p-6 text-white">
    <div className="flex flex-col space-y-4 text-lg">

      <Link href="/" className="mobile-link">Home</Link>
      <Link href="/home3" className="mobile-link">Properties</Link>
      <Link href="/service" className="mobile-link">Services</Link>
      <Link href="/subscription" className="mobile-link">Pricing</Link>

      {/* Join Section */}
          <div className="flex flex-col space-y-2">
           <p className="font-semibold">Join</p>
          <div className="ml-4 flex flex-col space-y-2">
          <Link href="/home1" className="mobile-link">Realtor</Link>
          <Link href="/home2" className="mobile-link">Tenant</Link>
         <Link href="/home1" className="mobile-link">Agency</Link>

             </div>
         </div>

      {/* Onboarding */}
           {isSignedIn && !onboardingComplete && (
            <Link href="/onboarding" className="mobile-link">
              Complete Onboarding
             </Link>
            )}

      {/* Dashboard */}
      {isSignedIn && onboardingComplete && (
        <Link href="/dashboard" className="mobile-link">Dashboard</Link>
      )}

      {/* About */}
      <Link href="/about" className="mobile-link">Our Story</Link>

      {/* Get Started */}
           {!isSignedIn && (
          <SignUpButton>
             <button className="btn-white w-full mt-2">Get Started</button>
           </SignUpButton>
           )}

      {/* Login */}
              <SignedOut>
             <SignInButton>
              <button className="mobile-link">Login</button>
            </SignInButton>
           </SignedOut>

           {/* Profile */}
           <SignedIn>
            <UserButton />
          </SignedIn>

           </div>
       </div>
        )}

    </nav>
  );
};

export default Navbar;