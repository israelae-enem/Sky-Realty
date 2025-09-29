"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

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
      "7-day free trial",
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
      "7-day free trial",
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
      "7-day free trial",
      "Full access to online dashboard",
      "Add, edit, and remove properties",
      "View tenant info, lease dates & rent due",
      "Automated rent reminders",
      "Schedule and track maintenance requests",
      "Receive notifications & reminders",
      "Premium email, chat & phone support",
      "Download and upload lease documents",
      "Advanced analytics & reporting",
      "Custom branding for your dashboard",
    ],
    badge: "Best Value",
  },
];

export default function PricingSubscription() {
  const { user } = useUser();
  const userId = user?.id;

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [propertyLimit, setPropertyLimit] = useState<number | null>(null);

  // GET current subscription on mount
  useEffect(() => {
    if (!userId) return;

    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/ziina");
        const data = await res.json();
        if (res.ok && data.plan) {
          setCurrentPlan(data.plan);
          setPropertyLimit(data.propertyLimit);
        }
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
      }
    };

    fetchSubscription();
  }, [userId]);

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      alert("Please login first to subscribe!");
      return;
    }

    try {
      setLoadingPlan(planId);

      const res = await fetch("/api/ziina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: planId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create subscription");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // Ziina checkout
      } else {
        window.location.href = `/realtor/${userId}/dashboard`;
      }
    } catch (err: any) {
      console.error("❌ Subscribe error:", err.message);
      alert("Something went wrong: " + err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-6">Sky Realty Plans</h1>

      {/* Current Plan Banner */}
      {currentPlan && (
        <div className="max-w-3xl mx-auto mb-8 p-4 rounded-md bg-green-700 text-white text-center font-semibold shadow-md">
          You are currently on <span className="underline">{currentPlan.toUpperCase()}</span> plan.{" "}
          {propertyLimit ? `You can manage up to ${propertyLimit} properties.` : "Unlimited properties."}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12 space-x-4">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            billingCycle === "monthly" ? "bg-yellow-500 text-gray-900" : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${
            billingCycle === "yearly" ? "bg-yellow-500 text-gray-900" : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly (2 months free)
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isFeatured = plan.badge === "Most Popular" || plan.badge === "Best Value";
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl p-6 flex flex-col justify-between shadow-lg transform transition-transform duration-300 hover:scale-105 bg-gray-800 ${
                isFeatured ? "ring-4 ring-yellow-500" : ""
              }`}
            >
              {/* Badge */}
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
                <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
                <p className="text-3xl font-bold mb-4">
                  {billingCycle === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice.toFixed(0)}{" "}
                  AED <span className="text-sm font-normal">/ {billingCycle}</span>
                </p>

                {/* Features list (no icons) */}
                <ul className="mb-6 space-y-2 text-gray-300">
                  {plan.features.map((feat, i) => (
                    <li key={i}>
                      {feat}
                      {feat.toLowerCase().includes("property") && plan.properties && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({plan.properties} properties allowed)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!userId || loadingPlan === plan.id || isCurrent}
                className={`mt-auto w-full px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                  isFeatured
                    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                } disabled:opacity-50`}
              >
                {isCurrent
                  ? "Current Plan"
                  : loadingPlan === plan.id
                  ? "Processing..."
                  : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center mt-12 text-gray-400">
        All plans include a 7-day free trial. Cancel anytime before trial ends.
      </p>
    </div>
  );
}