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
    <nav className="w-full bg-[#1836b2] text-white px-4 py-3 relative z-50 shadow-md">
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
          <button
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="nav-item">Home</Link>
          <Link href="/home3" className="nav-item">Properties</Link>
          <Link href="/service" className="nav-item">Services</Link>
          <Link href="/subscription" className="nav-item">Pricing</Link>

          {/* Join Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="nav-item flex items-center gap-1">
              Join <span className="text-sm">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 text-black bg-white rounded-lg shadow-xl z-50">
                <Link
                  href="/home1"
                  className="dropdown-item"
                >
                  Realtor
                </Link>
                <Link
                  href="/home1"
                  className="dropdown-item"
                >
                  Agency
                </Link>
                <Link
                  href="/home2"
                  className="dropdown-item"
                >
                  Tenant
                </Link>
              </div>
            )}
          </div>

          {isSignedIn && !onboardingComplete && (
            <Link href="/onboarding" className="nav-item">
              Complete Onboarding
            </Link>
          )}

          {isSignedIn && onboardingComplete && (
            <Link href="/dashboard" className="nav-item">
              Dashboard
            </Link>
          )}

          <Link href="/about" className="nav-item">Our Story</Link>

          {!isSignedIn && (
            <SignUpButton>
              <button className="btn-white">Get Started</button>
            </SignUpButton>
          )}

          <SignedOut>
            <SignInButton>
              <button className="nav-item">Login</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
      
          </SignedIn>
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