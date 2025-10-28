'use client'

import { useEffect, useState } from 'react'
import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PlusCircle, UserMinus, Users, ChevronDown, ChevronUp } from 'lucide-react'

export default function Team() {
  const { user } = useUser()
  const { organization, invitations, memberships, isLoaded } = useOrganization({
    invitations: { pageSize: 10 },
    memberships: { pageSize: 10 },
  })
  const { userMemberships, isLoaded: orgListLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>('free')

  const [membersCollapsed, setMembersCollapsed] = useState(false)
  const [invitationsCollapsed, setInvitationsCollapsed] = useState(false)
  const [inviteCollapsed, setInviteCollapsed] = useState(false)

  const TEAM_LIMITS = { free: 0, basic: 2, pro: 5, premium: 10 }

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

  // 🟩 Invite member
  const handleInvite = async () => {
    if (!email.trim()) return toast.error('Enter a valid email')
    if (!organization) return toast.error('No active organization found')
    if (plan === 'free') return toast.error('Upgrade your plan to add members')
    if ((memberships?.data?.length || 0) >= TEAM_LIMITS[plan])
      return toast.error(`Team limit reached for ${plan} plan`)

    try {
      setLoading(true)
      await organization.inviteMember({ emailAddress: email, role: 'org:member' })
      toast.success('Invitation sent!')

      await supabase.from('team_members').insert({
        id: crypto.randomUUID(),
        team_id: user?.id,
        member_id: email,
        role: 'pending',
        created_at: new Date().toISOString(),
      })

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
      const membership = memberships?.data?.find(
        (m) => m.publicUserData?.identifier === memberId
      )
      if (membership) await membership.destroy()
      await supabase.from('team_members').delete().eq('member_id', memberId)
      toast.success('Member removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove member')
    }
  }

  if (!isLoaded || !orgListLoaded)
    return <p className="text-gray-400">Loading team...</p>

  const canInvite = plan === 'basic' || plan === 'pro' || plan === 'premium'
  const memberCount = memberships?.data?.length || 0
  const limit = TEAM_LIMITS[plan]

  return (
    <div className="bg-gray-700 rounded-lg p-4 sm:p-6 space-y-6 text-white w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 flex items-center gap-2">
          <Users size={20} /> Team Management
        </h2>
        <div className="text-sm text-gray-100 sm:text-right">
          <p>
            Plan: <span className="text-blue-400 capitalize">{plan}</span>
          </p>
          {plan !== 'free' && (
            <p>
              Members: <span className="text-blue-400">{memberCount}</span> /{' '}
              <span className="text-blue-400">{limit}</span>
            </p>
          )}
        </div>
      </div>

      {/* Collapsible Invite Section */}
      {canInvite && (
        <div className="space-y-2">
          <button
            className="flex justify-between items-center w-full bg-gray-700 p-3 rounded-md"
            onClick={() => setInviteCollapsed((prev) => !prev)}
          >
            <span className="font-medium text-white">Invite Member</span>
            {inviteCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {!inviteCollapsed && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 text-white flex-1"
              />
              <Button
                onClick={handleInvite}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto"
              >
                <PlusCircle size={16} className="mr-2" />
                {loading ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          )}
        </div>
      )}

      {!canInvite && (
        <div className="p-4 bg-gray-700 rounded text-center text-gray-100">
          Upgrade to <span className="text-blue-400">Basic</span>,{' '}
          <span className="text-blue-400">Pro</span> or{' '}
          <span className="text-blue-400">Premium</span> to add team members.
        </div>
      )}

      {/* Members Section */}
      <div className="space-y-2">
        <button
          className="flex justify-between items-center w-full bg-gray-100 p-3 rounded-md"
          onClick={() => setMembersCollapsed((prev) => !prev)}
        >
          <span className="font-medium text-white">Your Team</span>
          {membersCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {!membersCollapsed && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {memberships?.data?.length ? (
              memberships.data.map((member) => (
                <li
                  key={member.id}
                  className="bg-gray-100 p-4 rounded-md flex flex-col justify-between space-y-2"
                >
                  <div>
                    <p className="font-medium text-white truncate">
                      {member.publicUserData?.identifier || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                  {member.role !== 'org:admin' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleRemove(member.publicUserData?.identifier || '')
                      }
                      className="bg-red-600 hover:bg-red-500 mt-2 w-full"
                    >
                      <UserMinus size={14} className="mr-1" /> Remove
                    </Button>
                  )}
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center py-3 col-span-full">
                No team members yet.
              </p>
            )}
          </ul>
        )}
      </div>

      {/* Pending Invitations Section */}
      {invitations?.data?.length ? (
        <div className="space-y-2">
          <button
            className="flex justify-between items-center w-full bg-gray-700 p-3 rounded-md"
            onClick={() => setInvitationsCollapsed((prev) => !prev)}
          >
            <span className="font-medium text-white">Pending Invitations</span>
            {invitationsCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {!invitationsCollapsed && (
            <ul className="space-y-2 mt-2">
              {invitations.data.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-700 p-4 rounded-md"
                >
                  <p className="text-gray-300 mb-2 sm:mb-0">{inv.emailAddress}</p>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await inv.revoke()
                      toast.success('Invitation revoked')
                    }}
                    className="bg-red-600 hover:bg-red-500 w-full sm:w-auto"
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