import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const eventType = payload.type
    const data = payload.data

    console.log('📩 Clerk Webhook:', eventType)

    // ✅ When a team member joins an organization
    if (eventType === 'organizationMembership.created') {
      const memberId = data.public_user_data.user_id
      const teamId = data.organization.id
      const role = data.role || 'member'
      const email = data.public_user_data.identifier

      console.log('🆕 Adding member:', email, 'to team:', teamId)

      const { error } = await supabase.from('team_members').upsert({
        id: crypto.randomUUID(),
        team_id: teamId,
        member_id: memberId,
        role,
        email,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error('❌ Supabase insert error:', error)
        return NextResponse.json({ error: 'Failed to insert team member' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Team member added' })
    }

    // 🗑 When a team member is removed
    if (eventType === 'organizationMembership.deleted') {
      const memberId = data.public_user_data.user_id
      console.log('🗑 Removing member:', memberId)

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('member_id', memberId)

      if (error) {
        console.error('❌ Delete error:', error)
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Team member removed' })
    }

    // ⚪ Ignore unrelated events
    return NextResponse.json({ message: `Ignored event: ${eventType}` })
  } catch (err) {
    console.error('❌ Clerk webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}