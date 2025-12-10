"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // Track Supabase auth state
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Determine user dashboard
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const uid = user.id;

      const { data: realtor } = await supabase
        .from("realtors")
        .select("id")
        .eq("id", uid)
        .maybeSingle();
      if (realtor) return setDashboardUrl(`/realtor/${uid}/dashboard`);

      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("id", uid)
        .maybeSingle();
      if (tenant) return setDashboardUrl(`/tenant/${uid}/dashboard`);

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("id", uid)
        .maybeSingle();
      if (company) return setDashboardUrl(`/company/${uid}/dashboard`);

      setDashboardUrl(null);
    };

    checkRole();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const isSignedIn = !!user;

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
        <button className="text-[#59fcf7] md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/properties">Properties</NavLink>
          <NavLink href="/service">Services</NavLink>
          <NavLink href="/subscription">Pricing</NavLink>
          <NavLink href="/about">Our Story</NavLink>

          {/* Get Started Dropdown (Desktop) */}
          {!isSignedIn && (
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="bg-[#59fcf7] text-[#1836b2] px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                Get Started ▼
              </button>
              {dropdownOpen && (
                <div className="absolute mt-2 w-40 bg-white text-[#1836b2] rounded shadow-lg flex flex-col z-50">
                  <button
                    onClick={() => router.push("/realtor")}
                    className="px-4 py-2 hover:bg-gray-200 text-left"
                  >
                    Realtor
                  </button>
                  <button
                    onClick={() => router.push("/company")}
                    className="px-4 py-2 hover:bg-gray-200 text-left"
                  >
                    Company
                  </button>
                  <button
                    onClick={() => router.push("/tenant")}
                    className="px-4 py-2 hover:bg-gray-200 text-left"
                  >
                    Tenant
                  </button>
                </div>
              )}
            </div>
          )}

          {!isSignedIn && (
            <Link href="/login">
              <button className="nav-item hover:text-[#59fcf7]">Login</button>
            </Link>
          )}

          {isSignedIn && dashboardUrl && <NavLink href={dashboardUrl}>Dashboard</NavLink>}
          {isSignedIn && (
            <button onClick={handleLogout} className="nav-item hover:text-red-500">
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 bg-white p-4 rounded-lg">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/properties">Properties</NavLink>
          <NavLink href="/service">Services</NavLink>
          <NavLink href="/subscription">Pricing</NavLink>
          <NavLink href="/about">Our Story</NavLink>

          {/* Get Started Dropdown (Mobile) */}
          {!isSignedIn && (
            <>
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="text-gray-800 font-semibold w-full text-left mb-1"
              >
                Get Started ▼
              </button>
              {mobileDropdownOpen && (
                <div className="ml-2 flex flex-col gap-1 mb-2">
                  <button
                    onClick={() => router.push("/realtor")}
                    className="px-4 py-2 hover:bg-gray-700 rounded text-left"
                  >
                    Realtor
                  </button>
                  <button
                    onClick={() => router.push("/company")}
                    className="px-4 py-2 hover:bg-gray-700 rounded text-left"
                  >
                    Company
                  </button>
                  <button
                    onClick={() => router.push("/tenant")}
                    className="px-4 py-2 hover:bg-gray-700 rounded text-left"
                  >
                    Tenant
                  </button>
                </div>
              )}

              <Link href="/login">
                <button className="nav-item hover:text-yellow-400 w-full mt-2">Login</button>
              </Link>
            </>
          )}

          {isSignedIn && dashboardUrl && <NavLink href={dashboardUrl}>Dashboard</NavLink>}
          {isSignedIn && (
            <button onClick={handleLogout} className="text-red-400 mt-2">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;