import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const sig = req.headers.get('svix-signature')

    // 🧩 Optional: if using Clerk’s svix signature verification
    if (!sig || !payload?.type) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const eventType = payload.type
    const data = payload.data

    // 🟢 When a team member is invited or joins
    if (eventType === 'organizationMembership.created') {
      const memberId = data.public_user_data.user_id       // Clerk user ID
      const teamId = data.organization.id                  // Clerk organization ID
      const role = data.role || 'member'

      console.log('🆕 New team member joined team:', teamId, 'User ID:', memberId)


      const { data: realtor } = await supabase
       .from('realtors')
       .select('id')
       .eq('clerk_organization_id', teamId)
       .single()

      const { error } = await supabase.from('team_members').insert([
        {
          id: crypto.randomUUID(),                        // new record ID
          team_id: teamId,
          member_id: memberId,
          role,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error('❌ Supabase insert error:', error)
        return NextResponse.json({ error: 'Failed to insert member' }, { status: 500 })
      }

      return NextResponse.json({ message: '✅ Team member added successfully' })
    }

    // 🔴 When a team member is removed
    if (eventType === 'organizationMembership.deleted') {
      const memberId = data.public_user_data.user_id
      const { error } = await supabase.from('team_members').delete().eq('member_id', memberId)

      if (error) {
        console.error('❌ Delete error:', error)
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
      }

      return NextResponse.json({ message: '🗑 Team member removed successfully' })
    }

    // ⚪ Handle untracked event types
    return NextResponse.json({ message: `Unhandled event: ${eventType}` })
  } catch (err) {
    console.error('❌ Clerk webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}