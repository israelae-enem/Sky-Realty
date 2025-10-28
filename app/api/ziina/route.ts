import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const ZIINA_API_KEY = process.env.ZIINA_API_KEY!;

// ✅ Plan prices (in fils)
const PLAN_PRICES: Record<string, number> = {
  free: 100,
  basic: 9900,   // 10 AED
  pro: 19900,    // 20 AED
  premium: 29900 // 50 AED
};

// ✅ Property limits
const PLAN_LIMITS: Record<string, number | null> = {
  free: 1,
  basic: 10,
  pro: 20,
  premium: null // unlimited
};

// ----------------------------
// 📌 Create Payment Intent (Card Upfront + 7-Day Trial)
// ----------------------------
export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json();

    if (!userId || !plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 🔍 Check if realtor exists
    const { data: realtor, error: fetchError } = await supabase
      .from("realtors")
      .select("trial_ends_at, subscription_status")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    // 🧾 Always collect card upfront, even for trial
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);

    const res = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: PLAN_PRICES[plan],
        currency_code: "USD",
        message: `Sky Realty - ${plan} Plan (7-Day Trial, Auto-charge after trial)`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ziina?status=success&plan=${plan}&user=${userId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ziina?status=cancel&plan=${plan}&user=${userId}`,
        failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ziina?status=failure&plan=${plan}&user=${userId}`,
        test: true,
        save_card: true, // ✅ ensures card details are saved for auto-charge
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("ZIINA API response:", errText);
      throw new Error(`Ziina API error: ${res.status} ${errText}`);
    }

    const data = await res.json();

    // ✅ Save trial info in Supabase
    await supabase
      .from("realtors")
      .update({
        subscription_plan: plan,
        subscription_status: "trialing",
        trial_ends_at: trialEnds.toISOString(),
      })
      .eq("id", userId);

    return NextResponse.json({
      message: "✅ Card collected and 7-day trial started",
      redirectUrl: data.redirect_url,
    });
  } catch (err) {
    console.error("❌ Ziina POST error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
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
    // -----------------------
    // 1️⃣ Handle Ziina Callback
    // -----------------------
    if (status) {
      if (status === "success" && userId && plan) {
        // ✅ Activate plan (after trial ends, Ziina charges automatically)
        await supabase
          .from("realtors")
          .update({
            subscription_plan: plan,
            subscription_status: "active",
            trial_ends_at: null, // clear trial period after payment success
          })
          .eq("id", userId);

        // ✅ Enforce property limits
        const propertyLimit = PLAN_LIMITS[plan] ?? null;
        if (propertyLimit !== null) {
          const { count } = await supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("realtor_id", userId);

          if (count && count > propertyLimit) {
            const { error } = await supabase
              .from("properties")
              .update({ status: "inactive" })
              .eq("realtor_id", userId)
              .order("created_at", { ascending: false })
              .range(propertyLimit, count);

            if (error) console.error("⚠ Property limit enforcement failed:", error);
          }
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/realtor/${userId}/dashboard`
        );
      }

      if (status === "cancel") {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=cancelled`);
      }

      if (status === "failure") {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed`);
      }

      return NextResponse.json({ message: "Invalid redirect" }, { status: 400 });
    }

    // -----------------------
    // 2️⃣ Fetch Subscription for Dashboard
    // -----------------------
    if (userId) {
      const { data, error } = await supabase
        .from("realtors")
        .select("subscription_plan, subscription_status, trial_ends_at")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return NextResponse.json({
          plan: "free",
          propertyLimit: PLAN_LIMITS["free"],
          status: "none",
        });
      }

      const userPlan = data.subscription_plan ?? "free";
      return NextResponse.json({
        plan: userPlan,
        propertyLimit: PLAN_LIMITS[userPlan] ?? PLAN_LIMITS["free"],
        status: data.subscription_status ?? "inactive",
        trial_ends_at: data.trial_ends_at,
      });
    }

    // Default fallback
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