'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const roleOptions = [
  { label: 'Realtor',    href: '/realtor' },
  { label: 'Tenant',   href: '/tenant'  },

];

const NavItems = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
      {/* Home link */}
      <Link
        href="/"
        className={cn(pathname === '/' && 'text-primary font-bold')}
      >
        Home
      </Link>

      {/* Roles select */}
      <select
        value={roleOptions.find(opt => opt.href === pathname)?.href || ''}
        onChange={(e) => {
          const href = e.target.value;
          if (href) window.location.href = href;
        }}
        className="border border-gray-300 rounded px-2 py-1 focus:outline-none"
      >
        <option value="" disabled>
          Sign Up
        </option>
        {roleOptions.map(({ label, href }) => (
          <option key={href} value={href}>
            {label}
          </option>
        ))}
      </select>

      {/* Dashboard link */}
      <Link
        href="/login"
        className={cn(pathname === '/login' && 'text-primary font-bold')}
      >
        Login
      </Link>
    </nav>
  );
};

export default NavItems;