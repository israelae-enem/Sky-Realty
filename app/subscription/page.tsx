"use client"

import { useRouter } from "next/navigation"

export default function PricingPage() {
  const router = useRouter()

  const handleCheckout = async (priceId: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      
      const data = await res.json()

      if (!data.url) {
        console.error("No checkout URL returned", data)
        return
      }
      router.push(data.url)
    } catch (err) {
      console.error("Checkout error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-cta text-white flex flex-col items-center py-12 px-6">
      <h1 className="text-4xl font-bold mb-10">Choose Your Plan</h1>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        
        {/* Basic Plan */}
        <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center shadow-lg border border-gray-700">
          <span className="px-3 py-1 bg-blue-600 rounded-full text-sm mb-4">Starter</span>
          <h2 className="text-2xl font-semibold">Basic Plan</h2>
          <p className="text-3xl font-bold mt-2">$1 <span className="text-base font-normal">/mo</span></p>
          <ul className="mt-6 space-y-2 text-gray-300 text-sm">
            <li>✅ Manage up to 5 properties</li>
            <li>✅ Tenant dashboard access</li>
            <li>✅ Basic reminders</li>
          </ul>
          <button
            onClick={() => handleCheckout("price_1S1z6mDBqN04mfAqZFiaQ0OK")} // 👈 replace ice ID
            className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
          >
            Get Started
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center shadow-lg border border-blue-600 relative">
          <span className="px-3 py-1 bg-green-600 rounded-full text-sm mb-4">Most Popular</span>
          <h2 className="text-2xl font-semibold">Pro Plan</h2>
          <p className="text-3xl font-bold mt-2">$2 <span className="text-base font-normal">/mo</span></p>
          <ul className="mt-6 space-y-2 text-gray-300 text-sm">
            <li>✅ Manage up to 10 properties</li>
            <li>✅ Advanced notifications</li>
            <li>✅ Priority support</li>
          </ul>
          <button
            onClick={() => handleCheckout("price_1S1z7UDBqN04mfAqA5Mq3RSw")} // 👈 replace with realice ID
            className="mt-8 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center shadow-lg border border-gray-700">
          <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm mb-4">Best Value</span>
          <h2 className="text-2xl font-semibold">Premium Plan</h2>
          <p className="text-3xl font-bold mt-2">$299 <span className="text-base font-normal">/mo</span></p>
          <ul className="mt-6 space-y-2 text-gray-300 text-sm">
            <li>✅ Unlimited properties</li>
            <li>✅ All advanced features</li>
            <li>✅ Dedicated support</li>
          </ul>
          <button
            onClick={() => handleCheckout("price_1RmEziDBqN04mfAqU8GkNnV6")} // 👈 replace with real Price ID
            className="mt-8 bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg font-semibold"
          >
            Go Premium
          </button>
        </div>
      </div>
    </div>
  )
}