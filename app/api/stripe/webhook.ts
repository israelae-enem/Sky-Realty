import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const runtime = 'node'  // Ensure Node runtime for Stripe
export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' })

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!

  // Read raw body as ArrayBuffer
  const rawBody = await req.arrayBuffer()
  const buf = Buffer.from(rawBody)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        const realtorId = session.metadata?.realtorId
        const subscriptionId = session.subscription as string

        if (!realtorId || !subscriptionId) {
          console.error('Missing realtorId or subscriptionId in metadata')
          break
        }

        // Retrieve subscription from Stripe
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)

        // Insert or update in Supabase
        const { error } = await supabase.from('subscriptions').upsert({
          id: subscriptionId,
          plan: stripeSub.items.data[0].price.nickname || 'unknown',
          realtor_id: realtorId,
        })

        if (error) console.error('Supabase insert error:', error.message)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}