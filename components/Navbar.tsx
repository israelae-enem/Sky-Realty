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
      <nav className=" w-full z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-white backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <Image
            src="/assets/icons/logo4.jpg"
            alt="logo"
            width={140}
            height={30}
            className="object-contain"
          />
        </Link>

        {/* Hamburger (shown on all screens) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="text-blue-700 text-3xl hover:scale-110 transition-transform"
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