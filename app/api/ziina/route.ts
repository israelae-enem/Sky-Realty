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
    const { plan, realtorId, companyId } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!realtorId && !companyId) {
      return NextResponse.json(
        { error: "Realtor ID or Company ID is required" },
        { status: 400 }
      );
    }

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);

    // -----------------------------------
    // 📌 Create Payment Intent via Ziina
    // -----------------------------------
    const ziinaRes = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: PLAN_PRICES[plan],
        currency_code: "USD",
        message: `Sky Realty - ${plan} Plan (7-Day Trial)`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina?status=success&plan=${plan}${realtorId ? `&realtorId=${realtorId}` : `&companyId=${companyId}`}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina?status=cancel&plan=${plan}`,
        failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina?status=failure&plan=${plan}`,
        test: true,
        save_card: true,
      }),
    });

    if (!ziinaRes.ok) {
      console.error("Ziina API Error:", await ziinaRes.text());
      throw new Error("Ziina request failed");
    }

    const ziinaData = await ziinaRes.json();

    // -----------------------------------
    // 📌 Save trial for Realtor OR Company
    // -----------------------------------
    if (realtorId) {
      await supabase
        .from("realtors")
        .update({
          subscription_plan: plan,
          subscription_status: "trialing",
          trial_ends_at: trialEnds.toISOString(),
          subscription_ends_at: null,
        })
        .eq("id", realtorId);
    } else if (companyId) {
      await supabase
        .from("companies")
        .update({
          subscription_plan: plan,
          subscription_status: "trialing",
          trial_ends_at: trialEnds.toISOString(),
          subscription_ends_at: null,
        })
        .eq("id", companyId);
    }

    return NextResponse.json({
      message: "Trial started. Redirecting to billing...",
      redirectUrl: ziinaData.redirect_url,
    });
  } catch (err) {
    console.error("❌ Ziina POST Error:", err);
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}

// ----------------------------
// 📌 Callback + Get Subscription (GET)
// ----------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const plan = searchParams.get("plan");

  const realtorId = searchParams.get("realtorId");
  const companyId = searchParams.get("companyId");

  try {
    // -----------------------------------
    // 📌 Callback After Payment
    // -----------------------------------
    if (status && plan) {
      const subscriptionEnds = new Date();
      subscriptionEnds.setDate(subscriptionEnds.getDate() + 30);

      if (status === "success") {
        if (realtorId) {
          await supabase
            .from("realtors")
            .update({
              subscription_plan: plan,
              subscription_status: "active",
              trial_ends_at: null,
              subscription_ends_at: subscriptionEnds.toISOString(),
            })
            .eq("id", realtorId);

          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/realtor/${realtorId}/dashboard`
          );
        }

        if (companyId) {
          await supabase
            .from("companies")
            .update({
              subscription_plan: plan,
              subscription_status: "active",
              trial_ends_at: null,
              subscription_ends_at: subscriptionEnds.toISOString(),
            })
            .eq("id", companyId);

          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/company/${companyId}/dashboard`
          );
        }
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
    }

    // -----------------------------------
    // 📌 Fetch Subscription for Realtor
    // -----------------------------------
    if (realtorId) {
      const { data } = await supabase
        .from("realtors")
        .select("subscription_plan, subscription_status, trial_ends_at, subscription_ends_at")
        .eq("id", realtorId)
        .single();

      return NextResponse.json(
        data
          ? {
              plan: data.subscription_plan,
              propertyLimit: PLAN_LIMITS[data.subscription_plan],
              status: data.subscription_status,
              trial_ends_at: data.trial_ends_at,
              subscription_ends_at: data.subscription_ends_at,
            }
          : { plan: "free", status: "none", propertyLimit: 1 }
      );
    }

    // -----------------------------------
    // 📌 Fetch Subscription for Company
    // -----------------------------------
    if (companyId) {
      const { data } = await supabase
        .from("companies")
        .select("subscription_plan, subscription_status, trial_ends_at, subscription_ends_at")
        .eq("id", companyId)
        .single();

      return NextResponse.json(
        data
          ? {
              plan: data.subscription_plan,
              propertyLimit: PLAN_LIMITS[data.subscription_plan],
              status: data.subscription_status,
              trial_ends_at: data.trial_ends_at,
              subscription_ends_at: data.subscription_ends_at,
            }
          : { plan: "free", status: "none", propertyLimit: 1 }
      );
    }

    return NextResponse.json({
      plan: "free",
      status: "none",
      propertyLimit: 1,
    });
  } catch (err) {
    console.error("❌ Ziina GET Error:", err);
    return NextResponse.json({ plan: "free", status: "none" }, { status: 500 });
  }
}