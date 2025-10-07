import { NextRequest, NextResponse } from 'next/server'

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!

export async function POST(req: NextRequest) {
  try {
    const { name, ownerId } = await req.json()

    if (!name || !ownerId) {
      return NextResponse.json({ error: 'Missing name or ownerId' }, { status: 400 })
    }

    // 🏗 Create organization using Clerk API
    const res = await fetch('https://api.clerk.dev/v1/organizations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name, // e.g. realtor’s company name or "John’s Realty"
        created_by: ownerId, // Clerk user ID of the realtor
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Clerk organization creation failed:', errorText)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, organization: data })
  } catch (err: any) {
    console.error('❌ Clerk create-org error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create organization' }, { status: 500 })
  }
}