"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { FiMenu } from "react-icons/fi";
import MenuOverlay from "./MenuOverlay";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-transparent backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <Image
            src="/assets/icons/sky-logo.jpg"
            alt="logo"
            width={140}
            height={30}
            className="object-contain"
          />
        </Link>

        {/* Hamburger (shown on all screens) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="text-white text-3xl hover:scale-110 transition-transform"
        >
          <FiMenu />
        </button>
      </nav>

      {/* Menu Overlay */}
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
    </>
  );
};

export default Navbar;