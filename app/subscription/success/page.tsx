// app/subscription/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [countdown, setCountdown] = useState(3); // seconds before redirect
  const plan = searchParams.get("plan") ?? "your plan";
  const userId = searchParams.get("user") ?? "";

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      router.push(`/realtor/${userId}/dashboard`);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router, userId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0e]text-white p-4">
      {/* GIF or short video */}
      <div className="mb-6 w-64 h-64">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg shadow-lg"
        >
          <source src="/assets/videos/success-gif.mp4" type="video/mp4" />
          {/* Optional fallback image */}
          
        </video>
      </div>

      <h1 className="text-3xl font-bold mb-4">🎉 Success!</h1>
      <p className="mb-2">
        Your <span className="font-semibold">{plan}</span> subscription has started.
      </p>
      <p className="mb-6">You are now on a 7-day free trial.</p>
      <p>
        Redirecting to your dashboard in <span className="font-bold">{countdown}</span>{" "}
        second{countdown !== 1 ? "s" : ""}...
      </p>
      <button
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
        onClick={() => router.push(`/realtor/${userId}/dashboard`)}
      >
        Go to Dashboard Now
      </button>
    </div>
  );
}