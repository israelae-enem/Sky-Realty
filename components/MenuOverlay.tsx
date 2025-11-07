"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

type MenuOverlayProps = {
  onClose: () => void;
};

const MenuOverlay = ({ onClose }: MenuOverlayProps) => {
  const { user, isLoaded } = useUser();
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);

  const menuItems = [
    { title: "Home", url: "/" },
    { title: "Realtors", url: "/home1" },
    { title: "Tenants", url: "/home2" },
    { title: "Success Stories", url: "/success-stories" },
    { title: "Pricing", url: "/subscription" },
    { title: "How To", url: "/how-to" },
    { title: "About Us", url: "/about" },
    { title: "Complete Onboarding", url: "/onboarding" },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // 🔍 Check if user exists in Supabase (realtor or tenant)
  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkUserInSupabase = async () => {
      try {
        const { data: realtor } = await supabase
          .from("realtors")
          .select("id")
          .eq("id", user.id)
          .single();

        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("id", user.id)
          .single();

        if (realtor) {
          setDashboardUrl(`/realtor/${user.id}/dashboard`);
        } else if (tenant) {
          setDashboardUrl(`/tenant/${user.id}/dashboard`);
        } else {
          setDashboardUrl(null);
        }
      } catch (err) {
        console.error("Error checking user in Supabase:", err);
      }
    };

    checkUserInSupabase();
  }, [isLoaded, user]);

  return (
    <AnimatePresence>
      <motion.div
        key="menu"
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center text-white overflow-hidden"
        variants={container}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1E2A78] opacity-95" />

        {/* Glow Accent */}
        <div className="absolute w-[600px] h-[600px] bg-[#2EF2FF]/20 blur-[180px] rounded-full -top-40 left-1/3 pointer-events-none" />

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-10 right-10 text-4xl hover:rotate-90 transition-transform z-10"
          whileHover={{ scale: 1.1 }}
        >
          <FiX />
        </motion.button>

        {/* Menu Items */}
        <motion.ul className="space-y-10 text-center z-10">
          {menuItems.map((itemData, index) => (
            <motion.li key={index} variants={item}>
              <a
                href={itemData.url}
                className="text-xl font-semibold tracking-wide text-[#E5E5E5] hover:text-[#64B5F6] transition-colors duration-300"
              >
                {itemData.title}
              </a>
            </motion.li>
          ))}

          {/* ✅ Conditional Dashboard Link */}
          {dashboardUrl && (
            <motion.li variants={item}>
              <a
                href={dashboardUrl}
                className="text-xl font-semibold tracking-wide text-[#64B5F6] hover:text-[#2EF2FF] transition-colors duration-300"
              >
                Dashboard
              </a>
            </motion.li>
          )}
        </motion.ul>

        {/* Auth Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 z-10">
          <SignedOut>
            <SignInButton>
              <button className="px-8 py-3 rounded-full bg-white text-blue-700 font-semibold hover:bg-gray-100 transition-all duration-300">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton  />
          </SignedIn>

          <SignUpButton>
            <button className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MenuOverlay;