import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const ZIINA_API_KEY = process.env.ZIINA_API_KEY!;

const PLAN_PRICES: Record<string, number> = {
  free: 100,
  basic: 9900,
  pro: 19900,
  premium: 29900,
};

const PLAN_LIMITS: Record<string, number | null> = {
  free: 1,
  basic: 10,
  pro: 20,
  premium: null,
};

// ----------------------------
// 📌 Create Payment Intent (POST)
// ----------------------------
export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json();

    if (!userId || !plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 🧪 Local Dev Shortcut
    if (process.env.NODE_ENV === "development") {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 7);

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
        message: "✅ Local dev mode: Trial started without Ziina redirect",
        redirectUrl: `http://localhost:3000/realtor/${userId}/dashboard?devTrial=true`,
      });
    }

    // 1️⃣ Check current subscription/trial
    const { data: realtor } = await supabase
      .from("realtors")
      .select("trial_ends_at, subscription_status, subscription_ends_at")
      .eq("id", userId)
      .single();

    if (
      realtor?.subscription_status === "active" &&
      realtor.subscription_ends_at &&
      new Date(realtor.subscription_ends_at) > new Date()
    ) {
      return NextResponse.json({
        error: "You already have an active subscription.",
      });
    }

    // 2️⃣ Set trial period
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);

    // 3️⃣ Create payment intent via Ziina
    const ziinaRes = await fetch("https://api-v2.ziina.com/api/payment_intent", {
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

    if (!ziinaRes.ok) {
      const text = await ziinaRes.text();
      console.error("Ziina API error:", text);
      throw new Error("Ziina API request failed");
    }

    const ziinaData = await ziinaRes.json();

    if (!ziinaData.redirect_url) {
      console.error("Ziina did not return a redirect URL:", ziinaData);
      throw new Error("Ziina redirect URL not returned");
    }

    // 4️⃣ Save trial info to Supabase
    await supabase
      .from("realtors")
      .update({
        subscription_plan: plan,
        subscription_status: "trialing",
        trial_ends_at: trialEnds.toISOString(),
        subscription_ends_at: null,
      })
      .eq("id", userId);

    // 5️⃣ Respond with redirect URL
    return NextResponse.json({
      message: "✅ Card collected and 7-day trial started.",
      redirectUrl: ziinaData.redirect_url,
    });
  } catch (err) {
    console.error("❌ Ziina POST error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}

// ----------------------------
// 📌 Handle Callback or Fetch Subscription (GET)
// ----------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const plan = searchParams.get("plan");
  const userId = searchParams.get("user");

  try {
    if (status && userId && plan) {
      // ✅ Success — activate subscription
      if (status === "success") {
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
          `${process.env.NEXT_PUBLIC_APP_URL}/realtor/${userId}/dashboard`
        );
      }

      // ❌ Cancel or Failure — redirect home
      if (status === "cancel" || status === "failure") {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
      }
    }

    // Fetch subscription info for user
    if (userId) {
      const { data } = await supabase
        .from("realtors")
        .select("subscription_plan, subscription_status, trial_ends_at, subscription_ends_at")
        .eq("id", userId)
        .single();

      if (!data) {
        return NextResponse.json({
          plan: "free",
          propertyLimit: PLAN_LIMITS["free"],
          status: "none",
        });
      }

      // Check for expiry
      let status = data.subscription_status;
      const now = new Date();
      if (data.subscription_ends_at && new Date(data.subscription_ends_at) < now) {
        status = "expired";
        await supabase.from("realtors").update({ subscription_status: "expired" }).eq("id", userId);
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

    // Default
    return NextResponse.json({
      plan: "free",
      propertyLimit: PLAN_LIMITS["free"],
      status: "none",
    });
  } catch (err) {
    console.error("❌ Ziina GET error:", err);
    return NextResponse.json({ plan: "free", propertyLimit: 1, status: "none" }, { status: 500 });
  }
}