import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: { bodyParser: false },
};

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Plan limits
const PLAN_LIMITS: Record<string, number | "unlimited"> = {
  basic: 5,
  pro: 10,
  premium: "unlimited",
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];
    if (!sig) throw new Error("Missing Stripe signature");

    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        const planName = priceId.includes("basic")
          ? "basic"
          : priceId.includes("pro")
          ? "pro"
          : "premium";

        const propertyLimit = PLAN_LIMITS[planName];
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

        // Upsert subscription in Supabase
        await supabase
          .from("subscriptions")
          .upsert(
            {
              id: customerId,
              plan: planName,
              property_limit: propertyLimit,
              status: subscription.status,
              trial_end: trialEnd,
            },
            { onConflict: "id" } // assumes "id" is primary key
          );

        console.log(`✅ Subscription saved for ${customerId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        const planName = priceId.includes("basic")
          ? "basic"
          : priceId.includes("pro")
          ? "pro"
          : "premium";

        const propertyLimit = PLAN_LIMITS[planName];
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

        await supabase
          .from("subscriptions")
          .upsert(
            {
              id: customerId,
              plan: planName,
              property_limit: propertyLimit,
              status: subscription.status,
              trial_end: trialEnd,
            },
            { onConflict: "id" }
          );

        console.log(`🔄 Subscription updated for ${customerId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("id", customerId);

        console.warn(`⚠ Payment failed for ${customerId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled", property_limit: 0, trial_end: null })
          .eq("id", customerId);

        console.log(`❌ Subscription canceled for ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler failed:", err);
    return res.status(500).send("Internal Server Error");
  }
}