'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface SidebarProps {
  links: { label: string; href: string }[]
}

export default function Sidebar({ links }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Toggle button (visible on mobile) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[#302cfc] text-white md:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-700 p-4 transform transition-transform duration-300 z-40
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:block`}
      >
        <h2 className="text-xl font-bold text-[#302cfc] mb-6">Sky Realty</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#302cfc]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Dark overlay for mobile when open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}
    </>
  )
}