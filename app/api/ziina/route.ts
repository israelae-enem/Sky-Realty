import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const ZIINA_API_KEY = process.env.ZIINA_API_KEY!;

// ✅ Plan prices (in fils)
const PLAN_PRICES: Record<string, number> = {
  free: 100,
  basic: 9900,
  pro: 19900,
  premium: 29900,
};

// ✅ Property limits
const PLAN_LIMITS: Record<string, number | null> = {
  free: 1,
  basic: 10,
  pro: 20,
  premium: null,
};

// ----------------------------
// 📌 Create Payment Intent (7-Day Trial + Card Upfront)
// ----------------------------
export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json();
    if (!userId || !plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check if user already on trial or subscribed
    const { data: realtor } = await supabase
      .from("realtors")
      .select("trial_ends_at, subscription_status, subscription_ends_at")
      .eq("id", userId)
      .single();

    // If currently active and not expired → prevent re-subscribing
    if (
      realtor?.subscription_status === "active" &&
      realtor?.subscription_ends_at &&
      new Date(realtor.subscription_ends_at) > new Date()
    ) {
      return NextResponse.json({
        message: "You already have an active subscription.",
      });
    }

    // Set trial period (7 days from now)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);

    // Create Ziina payment intent
    const res = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: PLAN_PRICES[plan],
        currency_code: "USD",
        message: `Sky Realty - ${plan} Plan (7-Day Trial, auto-charge after trial)`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina?status=success&plan=${plan}&user=${userId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina?status=cancel&plan=${plan}&user=${userId}`,
        failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina?status=failure&plan=${plan}&user=${userId}`,
        test: true,
        save_card: true,
      }),
    });

    if (!res.ok) throw new Error("Ziina API failed");
    const data = await res.json();

    // Save trial info
    await supabase
      .from("realtors")
      .update({
        subscription_plan: plan,
        subscription_status: "trialing",
        trial_ends_at: trialEnds.toISOString(),
        subscription_ends_at: null,
      })
      .eq("id", userId);

    return NextResponse.json({
      message: "✅ Card collected and 7-day trial started.",
      redirectUrl: data.redirect_url,
    });
  } catch (err) {
    console.error("❌ Ziina POST error:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

// ----------------------------
// 📌 Handle Callback OR Fetch Subscription
// ----------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const plan = searchParams.get("plan");
  const userId = searchParams.get("user");

  try {
    // 1️⃣ Handle Ziina Callback (Success, Cancel, Failure)
    if (status) {
      if (status === "success" && userId && plan) {
        // Add 30 days to current date (start of active period)
        const subscriptionEnds = new Date();
        subscriptionEnds.setDate(subscriptionEnds.getDate() + 30);

        await supabase
          .from("realtors")
          .update({
            subscription_plan: plan,
            subscription_status: "active",
            trial_ends_at: null,
            subscription_ends_at: subscriptionEnds.toISOString(),
          })
          .eq("id", userId);

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?plan=${plan}&user=${userId}`
        );
      }

      if (status === "cancel") {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=cancelled?plan=${plan}&user=${userId}`
        );
      }

      if (status === "failure") {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=failed?plan=${plan}&user=${userId}`
        );
      }
    }

    // 2️⃣ Fetch Subscription Info for Dashboard
    if (userId) {
      const { data } = await supabase
        .from("realtors")
        .select(
          "subscription_plan, subscription_status, trial_ends_at, subscription_ends_at"
        )
        .eq("id", userId)
        .single();

      if (!data) {
        return NextResponse.json({
          plan: "free",
          propertyLimit: PLAN_LIMITS["free"],
          status: "none",
        });
      }

      // Handle expiration
      const now = new Date();
      let status = data.subscription_status;
      if (
        data.subscription_ends_at &&
        new Date(data.subscription_ends_at) < now
      ) {
        status = "expired";
        await supabase
          .from("realtors")
          .update({ subscription_status: "expired" })
          .eq("id", userId);
      }

      const userPlan = data.subscription_plan ?? "free";
      return NextResponse.json({
        plan: userPlan,
        propertyLimit: PLAN_LIMITS[userPlan] ?? PLAN_LIMITS["free"],
        status,
        trial_ends_at: data.trial_ends_at,
        subscription_ends_at: data.subscription_ends_at,
      });
    }

    return NextResponse.json({
      plan: "free",
      propertyLimit: PLAN_LIMITS["free"],
      status: "none",
    });
  } catch (err) {
    console.error("❌ Ziina GET error:", err);
    return NextResponse.json(
      { plan: "free", propertyLimit: 1, status: "none" },
      { status: 500 }
    );
  }
}