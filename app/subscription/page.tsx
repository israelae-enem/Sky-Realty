"use client";

import { useState } from "react";
import Image from "next/image";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  properties: number | null;
  features: string[];
  badge: string;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 99,
    yearlyPrice: 250 * 12 * 0.83,
    properties: 10,
    features: [
      "Manage up to 10 properties",
      "7-day free trial (card required)",
      "Full access to online dashboard",
      "Add and edit property details",
      "View tenant info and lease dates",
      "Manual rent tracking",
      "Schedule maintenance requests",
      "Receive notifications & reminders",
      "Basic email support",
    ],
    badge: "Starter",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 199,
    yearlyPrice: 500 * 12 * 0.83,
    properties: 20,
    features: [
      "Manage up to 20 properties",
      "7-day free trial (card required)",
      "Full access to online dashboard",
      "Add, edit, and remove properties",
      "View tenant info, lease dates & rent due",
      "Automated rent reminders",
      "Schedule and track maintenance requests",
      "Receive notifications & reminders",
      "Priority email & chat support",
      "Download and upload lease documents",
    ],
    badge: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 299,
    yearlyPrice: 1000 * 12 * 0.83,
    properties: null,
    features: [
      "Unlimited properties",
      "7-day free trial (card required)",
      "Full access to online dashboard",
      "Add, edit, and remove properties",
      "View tenant info, lease dates & rent due",
      "Automated rent reminders",
      "Schedule and track maintenance requests",
      "Receive notifications & reminders",
      "Premium email, chat & phone support",
      "Advanced analytics & reporting",
      "Custom branding for your dashboard",
    ],
    badge: "Best Value",
  },
];

export default function PricingSubscription() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSubscribe = async (planId: string) => {
    try {
      setLoadingPlan(planId);
      alert("Redirecting you to Ziina to add your card and start your 7-day trial...");

      const res = await fetch("/api/ziina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }), // ✅ removed userId
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create subscription");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("❌ Subscribe error:", err.message);
      alert("Something went wrong: " + err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1836b2] text-gray-900 p-8">
      <h1 className="text-4xl font-bold font-tech text-center mb-6 text-white">
        Sky Realty Plans
      </h1>

      <div className="flex justify-center mb-12 space-x-4">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            billingCycle === "monthly"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            billingCycle === "yearly"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly (2 months free)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isFeatured =
            plan.badge === "Most Popular" || plan.badge === "Best Value";

          return (
            <div
              key={plan.id}
              className="relative rounded-xl p-6 flex flex-col justify-between shadow-lg transform transition-transform duration-300 hover:scale-105 bg-gray-100"
            >
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <Image
                  src="/assets/icons/logo3.jpg"
                  alt="Sky Realty Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>

              {plan.badge && (
                <div
                  className={`absolute -mt-4 ml-4 px-4 py-1 rounded-full text-sm font-bold text-white ${
                    isFeatured ? "bg-yellow-500" : "bg-gray-600"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                  {plan.name}
                </h2>
                <p className="text-3xl font-bold mb-4 text-gray-900">
                  {billingCycle === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice.toFixed(0)}{" "}
                  USD{" "}
                  <span className="text-sm font-normal">
                    / {billingCycle}
                  </span>
                </p>

                <ul className="mb-6 space-y-2 text-gray-800">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-500 font-bold">✔</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                    isFeatured
                      ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                      : "bg-[#302cfc] text-white hover:bg-blue-400"
                  } disabled:opacity-50`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : "Start 7-Day Trial (Card Required)"}
                </button>

                <p className="text-sm text-gray-700 text-center">
                  Card details collected securely by Ziina. You won't be charged
                  until the 7-day trial ends.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center mt-12 text-gray-200 font-bold">
        All plans include a 7-day free trial. Cancel anytime before your trial ends.
      </p>
    </div>
  );
}