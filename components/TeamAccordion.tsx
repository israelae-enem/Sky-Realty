'use client'

import { useEffect, useState } from 'react'
import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PlusCircle, UserMinus, Users, ChevronDown, ChevronUp } from 'lucide-react'

interface TeamProps {
  companyId?: string
}

export default function Team({ companyId }: TeamProps) {
  const { user } = useUser()
  const { organization, invitations, memberships, isLoaded } = useOrganization({
    invitations: { pageSize: 10 },
    memberships: { pageSize: 10 },
  })
  const { isLoaded: orgListLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>('free')
  const [membersCollapsed, setMembersCollapsed] = useState(false)
  const [invitationsCollapsed, setInvitationsCollapsed] = useState(false)
  const [inviteCollapsed, setInviteCollapsed] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  const TEAM_LIMITS = { free: 0, basic: 2, pro: 5, premium: 10 }

  const ownerColumn = companyId ? 'company_id' : 'realtor_id'
  const ownerId = companyId || user?.id

  // 🟦 Fetch subscription plan
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`)
        const data = await res.json()
        setPlan(data.plan || 'free')
      } catch (err) {
        console.error(err)
        setPlan('free')
      }
    }
    fetchPlan()
  }, [user?.id])

  // 🟧 Fetch team members from Supabase
  useEffect(() => {
    if (!ownerId) return
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq(ownerColumn, ownerId)
        if (error) throw error
        setTeamMembers(data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch team members')
      }
    }
    fetchTeam()
  }, [ownerId, ownerColumn])

  // 🟩 Invite member
  const handleInvite = async () => {
    if (!email.trim()) return toast.error('Enter a valid email')
    if (!ownerId) return toast.error('No active organization found')
    if (plan === 'free') return toast.error('Upgrade your plan to add members')
    if ((teamMembers?.length || 0) >= TEAM_LIMITS[plan])
      return toast.error(`Team limit reached for ${plan} plan`)

    try {
      setLoading(true)

      // Optional: send invite via Clerk if realtor (organization exists)
      if (!companyId && organization) {
        await organization.inviteMember({ emailAddress: email, role: 'org:member' })
      }

      // Store team member in Supabase
      const payload: any = {
        id: crypto.randomUUID(),
        member_id: email,
        role: 'pending',
        created_at: new Date().toISOString(),
      }
      payload[ownerColumn] = ownerId

      const { error } = await supabase.from('team_members').insert([payload])
      if (error) throw error

      toast.success('Invitation sent!')
      setTeamMembers(prev => [...prev, payload])
      setEmail('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  // 🟥 Remove member
  const handleRemove = async (memberId: string) => {
    try {
      // Remove from Clerk org if realtor
      if (!companyId && memberships?.data) {
        const membership = memberships.data.find(
          (m) => m.publicUserData?.identifier === memberId
        )
        if (membership) await membership.destroy()
      }

      // Remove from Supabase
      await supabase.from('team_members').delete().eq(ownerColumn, ownerId).eq('member_id', memberId)
      setTeamMembers(prev => prev.filter(m => m.member_id !== memberId))
      toast.success('Member removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove member')
    }
  }

  if (!isLoaded || !orgListLoaded)
    return <p className="text-gray-500 text-center mt-10">Loading team...</p>

  const canInvite = plan !== 'free'
  const memberCount = teamMembers?.length || 0
  const limit = TEAM_LIMITS[plan]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 text-gray-900 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
          <Users size={22} /> Team Management
        </h2>
        <div className="text-sm text-gray-700 sm:text-right">
          <p>
            Plan:{' '}
            <span className="text-blue-600 font-medium capitalize">{plan}</span>
          </p>
          {plan !== 'free' && (
            <p>
              Members:{' '}
              <span className="text-blue-600 font-medium">{memberCount}</span> /{' '}
              <span className="text-blue-600 font-medium">{limit}</span>
            </p>
          )}
        </div>
      </div>

      {/* Collapsible Invite Section */}
      {canInvite && (
        <div className="space-y-2">
          <button
            className="flex justify-between items-center w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-md border border-gray-200 transition"
            onClick={() => setInviteCollapsed((prev) => !prev)}
          >
            <span className="font-medium text-gray-900">Invite Member</span>
            {inviteCollapsed ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-blue-600" />}
          </button>
          {!inviteCollapsed && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 text-gray-900 flex-1 border border-gray-300"
              />
              <Button
                onClick={handleInvite}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <PlusCircle size={16} className="mr-2" />
                {loading ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          )}
        </div>
      )}

      {!canInvite && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-700">
          Upgrade to <span className="text-blue-600 font-medium">Basic</span>,{' '}
          <span className="text-blue-600 font-medium">Pro</span> or{' '}
          <span className="text-blue-600 font-medium">Premium</span> to add team members.
        </div>
      )}

      {/* Members Section */}
      <div className="space-y-2">
        <button
          className="flex justify-between items-center w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-md border border-gray-200 transition"
          onClick={() => setMembersCollapsed((prev) => !prev)}
        >
          <span className="font-medium text-gray-900">Your Team</span>
          {membersCollapsed ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-blue-600" />}
        </button>

        {!membersCollapsed && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {teamMembers?.length ? (
              teamMembers.map((member) => (
                <li key={member.id} className="bg-white border border-gray-200 rounded-md shadow-sm p-4 flex flex-col justify-between space-y-2 hover:shadow-md transition">
                  <div>
                    <p className="font-medium text-gray-900 truncate">{member.member_id}</p>
                    <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRemove(member.member_id)}
                    className="bg-red-600 hover:bg-red-700 text-white mt-2 w-full"
                  >
                    <UserMinus size={14} className="mr-1" /> Remove
                  </Button>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center py-3 col-span-full">No team members yet.</p>
            )}
          </ul>
        )}
      </div>

      {/* Pending Invitations Section */}
      {invitations?.data?.length ? (
        <div className="space-y-2">
          <button
            className="flex justify-between items-center w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-md border border-gray-200 transition"
            onClick={() => setInvitationsCollapsed((prev) => !prev)}
          >
            <span className="font-medium text-gray-900">Pending Invitations</span>
            {invitationsCollapsed ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-blue-600" />}
          </button>
          {!invitationsCollapsed && (
            <ul className="space-y-2 mt-2">
              {invitations.data.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition"
                >
                  <p className="text-gray-700 mb-2 sm:mb-0">{inv.emailAddress}</p>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await inv.revoke()
                      toast.success('Invitation revoked')
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}