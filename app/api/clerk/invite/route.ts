// File: /app/api/clerk/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'

const CLERK_API_KEY = process.env.CLERK_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { ownerId, email, role } = await req.json()

    if (!ownerId || !email) {
      return NextResponse.json({ error: 'Missing ownerId or email' }, { status: 400 })
    }

    // Clerk Organizations API: create a member invite
    const res = await fetch(
      `https://api.clerk.dev/v1/organizations/${ownerId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLERK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          role: role || 'member',
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('❌ Clerk invite failed:', errText)
      return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('❌ Clerk invite error:', err)
    return NextResponse.json({ error: err.message || 'Invite failed' }, { status: 500 })
  }
}