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
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();

  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check user role and set dashboard URL
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;

      const { data: realtor } = await supabase
        .from("realtors")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (realtor) {
        setOnboardingComplete(true);
        setDashboardUrl(`/realtor/${user.id}/dashboard`);
        return;
      }

      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (tenant) {
        setOnboardingComplete(true);
        setDashboardUrl(`/tenant/${user.id}/dashboard`);
        return;
      }

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (company) {
        setOnboardingComplete(true);
        setDashboardUrl(`/company/${user.id}/dashboard`);
        return;
      }

      setOnboardingComplete(false);
      setDashboardUrl(null);
    };

    checkRole();
  }, [user]);

  // Reusable nav link component
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`nav-item ${
        pathname === href
          ? "text-[#59fcf7] font-semibold"
          : "text-[#1836b2] hover:text-[#59fcf7] transition-colors"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="w-full bg-white text-[#1836b2] font-bold px-4 py-3 relative z-50 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <Image
            src="/assets/icons/logo4.jpg"
            alt="Sky Realty Logo"
            width={80}
            height={15}
            className="object-contain"
          />
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/properties">Properties</NavLink>
          <NavLink href="/service">Services</NavLink>
          <NavLink href="/subscription">Pricing</NavLink>

          {/* Join Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="nav-item flex items-center gap-1 text-[#1836b2] hover:text-[#59fcf7]">
              Join ▼
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-gray-200 text-[#1836b2] rounded-lg shadow-xl z-50 flex flex-col">
                <Link href="/home1" className="px-4 py-2 hover:bg-[#59fcf7] rounded">
                  Realtor
                </Link>
                <Link href="/home1" className="px-4 py-2 hover:bg-[#59fcf7] rounded">
                  Agency
                </Link>
                <Link href="/home2" className="px-4 py-2 hover:bg-[#59fcf7] rounded">
                  Tenant
                </Link>
              </div>
            )}
          </div>

          {/* Onboarding */}
          {isSignedIn && !onboardingComplete && (
            <NavLink href="/onboarding">Complete Onboarding</NavLink>
          )}

          {/* Dashboard */}
          {isSignedIn && onboardingComplete && dashboardUrl && (
            <NavLink href={dashboardUrl}>Dashboard</NavLink>
          )}

          <NavLink href="/about">Our Story</NavLink>

          {/* Auth Buttons */}
          {!isSignedIn && (
            <SignUpButton>
              <button className="bg-[#59fcf7] text-[#1836b2] px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                Get Started
              </button>
            </SignUpButton>
          )}

          <SignedOut>
            <SignInButton>
              <button className="nav-item hover:text-[#59fcf7]">Login</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 bg-[#0f0f2a] p-4 rounded-lg">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/properties">Properties</NavLink>
          <NavLink href="/service">Services</NavLink>
          <NavLink href="/subscription">Pricing</NavLink>

          {/* Join Dropdown (Mobile) */}
          <div className="flex flex-col">
            <span className="nav-item text-gray-200">Join ▼</span>
            <div className="ml-4 flex flex-col gap-1 mt-1">
              <Link href="/home1" className="px-4 py-2 hover:bg-gray-800 rounded">
                Realtor
              </Link>
              <Link href="/home1" className="px-4 py-2 hover:bg-gray-800 rounded">
                Agency
              </Link>
              <Link href="/home2" className="px-4 py-2 hover:bg-gray-800 rounded">
                Tenant
              </Link>
            </div>
          </div>

          {isSignedIn && !onboardingComplete && (
            <NavLink href="/onboarding">Complete Onboarding</NavLink>
          )}

          {isSignedIn && onboardingComplete && dashboardUrl && (
            <NavLink href={dashboardUrl}>Dashboard</NavLink>
          )}

          <NavLink href="/about">Our Story</NavLink>

          {!isSignedIn && (
            <SignUpButton>
              <button className="bg-yellow-400 text-[#0f0f2a] px-5 py-2 rounded-md font-semibold hover:bg-yellow-300 transition w-full mt-2">
                Get Started
              </button>
            </SignUpButton>
          )}

          <SignedOut>
            <SignInButton>
              <button className="nav-item hover:text-yellow-400 w-full mt-1">Login</button>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </nav>
  );
};

export default Navbar;