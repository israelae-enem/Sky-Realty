// app/help/page.tsx (Next.js App Router)
// or pages/help.tsx (Next.js Pages Router)

import Link from "next/link";

export default function HelpCenter() {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Help Center</h1>
        <p className="mb-10 text-gray-400">
          Welcome to the Sky-Realty Help Center. Find answers, guides, and resources to make the most out of our platform.
        </p>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Getting Started */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#302cfc] transition">
            <h2 className="text-2xl font-semibold text-white mb-3">Getting Started</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-[#302cfc]">FAQ</Link>
              </li>
              <li>
                <Link href="/propertyCTA" className="hover:text-[#302cfc]">How to Add Your First Property</Link>
              </li>
              <li>
                <Link href="/subscription" className="hover:text-[#302cfc]">Understanding Subscription Plans</Link>
              </li>
            </ul>
          </div>

          {/* Account & Security */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#302cfc] transition">
            <h2 className="text-2xl font-semibold text-white mb-3">Account & Security</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-[#302cfc]">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#302cfc]">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/help/security" className="hover:text-[#302cfc]">How We Keep Your Data Safe</Link>
              </li>
            </ul>
          </div>

          {/* Tenants & Leases */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#302cfc] transition">
            <h2 className="text-2xl font-semibold text-white mb-3">Tenants & Leases</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help/tenants" className="hover:text-[#302cfc]">Inviting Tenants</Link>
              </li>
              
              <li>
                <Link href="/help/maintenance-requests" className="hover:text-[#302cfc]">Handling Maintenance Requests</Link>
              </li>
            </ul>
          </div>

          {/* Billing & Payments */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#302cfc] transition">
            <h2 className="text-2xl font-semibold text-white mb-3">Billing & Payments</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help/subscription" className="hover:text-[#302cfc]">How Billing Works</Link>
              </li>
              <li>
                <Link href="/help/invoices" className="hover:text-[#302cfc]">Viewing Invoices & Receipts</Link>
              </li>
              <li>
                <Link href="/help/upgrade" className="hover:text-[#302cfc]">Upgrading or Cancelling Your Plan</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Still Need Help?</h2>
          <p className="text-gray-400 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:support@skyrealtyae.com"
            className="inline-block px-6 py-3 bg-[#302cfc] text-white font-medium rounded-lg hover:opacity-90 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}