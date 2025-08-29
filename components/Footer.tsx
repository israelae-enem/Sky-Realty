// components/Footer.tsx
import Link from "next/link";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className=" text-black font-bold py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-xl font-bold text-blue-500">Sky-Realty</h2>
          <p className="mt-3 text-sm">
            Simplifying property management for realtors.
          </p>
          <SocialLinks />
            
        </div>

        {/* Product Links */}
        <div>
          <h3 className="text-blue-500 font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-[#302cfc]">Dashboard</Link></li>
            <li><Link href="/pricing" className="hover:text-[#302cfc]">Pricing</Link></li>
            <li><Link href="/features" className="hover:text-[#302cfc]">Features</Link></li>
            <li><Link href="/demo" className="hover:text-[#302cfc]">Demo</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-blue-500 font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-[#302cfc]">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[#302cfc]">Contact</Link></li>
            <li><Link href="/blog" className="hover:text-[#302cfc]">Blog</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-blue-500 font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-[#302cfc]">Help Center</Link></li>
            <li><Link href="/faq" className="hover:text-[#302cfc]">FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-[#302cfc]">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#302cfc]">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-black">
        <p>© {new Date().getFullYear()} Sky-Realty. All rights reserved.</p>
        <p className="mt-2">Made with ❤ for realtors.</p>
      </div>
    </footer>
  );
}