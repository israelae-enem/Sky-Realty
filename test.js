import fetch from "node-fetch";

const  ZIINA_API_KEY= "IBQtkk/o8kEpP/2h+IKUPx7OySp29uDsjnoPwWBMmGMJESzglSRzJ3xIcRwFHCLF"
// your Next.js dev server
const USER_ID = "user_33DasKqxx6Xy20PSCNRBarZ09oK"; // test Clerk user







// Define property limits for each plan
const PLAN_LIMITS = {
  "Free": 1,
  "Basic Plan": 5,
  "Pro Plan": 10,
  "Premium Plan": null, // unlimited
};

async function testZiinaPlan() {
  try {
    // Create a payment intent for this user
    const res = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: USER_ID,
        amount: 1000, // amount in smallest currency unit, e.g., cents
        currency: "AED",
        description: "Test subscription plan",
        metadata: {
          user_id: USER_ID
        }
      }),
    });

    if (!res.ok) throw new Error(`Ziina API error: ${res.status}`);

    const data = await res.json();
    console.log("🔹 Ziina payment intent response:", JSON.stringify(data, null, 2));

    // Here you would fetch the user's plan from your DB or metadata (Ziina does not store subscription plans by default)
    // For testing, let's assume the plan is returned in metadata or choose Free by default
    const planName = data.metadata?.plan || "Free";
    const propertyLimit = PLAN_LIMITS[planName] ?? 1;

    console.log(`🎯 User Plan: ${planName}`);
    console.log(`🏠 Property Limit: ${propertyLimit}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testZiinaPlan();