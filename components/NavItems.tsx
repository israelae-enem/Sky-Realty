'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

const roleOptions = [
  { label: 'Realtor', href: '/realtor' },
  { label: 'Tenant', href: '/tenant' },
];

const NavItems = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Fetch user role from Supabase
  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoadingRole(false);
      return;
    }

    const fetchRole = async () => {
      setLoadingRole(true);
      try {
        const { data: realtorData } = await supabase
          .from('realtors')
          .select('id')
          .eq('id', user.id)
          .single();

        if (realtorData) {
          setRole('realtor');
          setLoadingRole(false);
          return;
        }

        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id')
          .eq('id', user.id)
          .single();

        if (tenantData) setRole('tenant');
        else setRole(null);
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setRole(null);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, [user]);

  const dashboardHref =
    user && role
      ? role === 'realtor'
        ? `/realtor/${user.id}/dashboard`
        : `/tenant/${user.id}/dashboard`
      : '#';

  return (
    <nav className="flex items-center gap-4 relative">
      {/* Home link */}
      <Link
        href="/"
        className={cn(pathname === '/' && 'text-primary font-bold')}
      >
        Home
      </Link>

      {/* Conditionally show JOIN button only if user is not signed in or has no role */}
      {(!isSignedIn || !role) && (
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="bg-[#302cfc] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            JOIN
          </button>

          {open && (
            <div className="absolute mt-2 w-40 bg-black border border-gray-700 rounded-md shadow-lg z-50">
              {roleOptions.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-2 text-white hover:bg-gray-800"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dashboard link after JOIN if signed in and has a role */}
      {isSignedIn && !loadingRole && role && user && (
        <Link
          href={dashboardHref}
          className={cn(pathname.startsWith(dashboardHref) && 'text-primary font-bold')}
        >
          Dashboard
        </Link>
      )}

      {/* Loading spinner */}
      {isSignedIn && loadingRole && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
    </nav>
  );
};

export default NavItems;