import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: Request) {
  try {
    const { priceId, realtorId } = await req.json() // frontend sends priceId

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // price_xxx from Stripe dashboard
          quantity: 1,
        },
      ],
      success_url: "https://Sky-realty-rf9m.vercel.app/realtordashboard?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://Sky-realty-rf9m.vercel.app/subscription",
      metadata: {realtorId}
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Checkout Api Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}