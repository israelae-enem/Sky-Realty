'use client'

import { useEffect, useState } from 'react'
import {
  useUser,
  useOrganization,
  useOrganizationList,
  CreateOrganization,
} from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PlusCircle, UserMinus, Users, Building2, X } from 'lucide-react'

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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>('free')

  const TEAM_LIMITS = { free: 0, basic: 0, pro: 4, premium: 10 }

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

  // 🟩 Invite new member via Clerk + sync to Supabase
  const handleInvite = async () => {
    if (!email.trim()) return toast.error('Enter a valid email')
    if (!organization) return toast.error('No active organization found')
    if (plan !== 'pro' && plan !== 'premium')
      return toast.error('Upgrade to Pro or Premium to add members')
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
    } catch (err: any) {
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

  const canInvite = plan === 'pro' || plan === 'premium'
  const memberCount = memberships?.data?.length || 0
  const limit = TEAM_LIMITS[plan]

  // 🧩 No organization yet
  if (!organization && userMemberships.count === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center space-y-4 text-white relative">
        <h2 className="text-xl font-semibold text-blue-400 flex justify-center items-center gap-2">
          <Building2 size={20} /> No Organization Found
        </h2>
        <p className="text-gray-400">
          Create an organization to start adding team members.
        </p>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <PlusCircle size={16} className="mr-2" /> Create Organization
        </Button>

        {/* 🪄 Modal for CreateOrganization */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg relative w-full max-w-md">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg text-blue-400 mb-4 font-semibold text-center">
                Create Your Organization
              </h3>
              <CreateOrganization
                afterCreateOrganizationUrl=""
                skipInvitationScreen
                hideSlug
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // 🧾 If organization exists
  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
          <Users size={20} /> Team Management
        </h2>
        <div className="text-sm text-gray-400 text-right">
          <p>
            Plan: <span className="text-blue-400">{plan}</span>
          </p>
          {(plan === 'pro' || plan === 'premium') && (
            <p>
              Members: <span className="text-blue-400">{memberCount}</span> /{' '}
              <span className="text-blue-400">{limit}</span>
            </p>
          )}
        </div>
      </div>

      {canInvite ? (
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 text-white"
          />
          <Button
            onClick={handleInvite}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <PlusCircle size={16} className="mr-2" />
            {loading ? 'Inviting...' : 'Invite'}
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-gray-800 rounded text-center text-gray-400">
          Upgrade to <span className="text-blue-400">Pro</span> or{' '}
          <span className="text-blue-400">Premium</span> to add team members.
        </div>
      )}

      {/* 🧾 Members */}
      <div>
        <h3 className="text-lg text-gray-300 mb-2">Your Team</h3>
        {memberships?.data?.length ? (
          <ul className="space-y-2">
            {memberships.data.map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-md"
              >
                <div>
                  <p className="font-medium text-white">
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
                    className="bg-red-600 hover:bg-red-500"
                  >
                    <UserMinus size={14} className="mr-1" /> Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No team members yet.</p>
        )}
      </div>

      {/* 📨 Pending Invitations */}
      {invitations?.data?.length ? (
        <div>
          <h3 className="text-lg text-gray-300 mb-2">Pending Invitations</h3>
          <ul className="space-y-2">
            {invitations.data.map((inv) => (
              <li
                key={inv.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-md"
              >
                <p>{inv.emailAddress}</p>
                <Button
                  size="sm"
                  onClick={async () => {
                    await inv.revoke()
                    toast.success('Invitation revoked')
                  }}
                  className="bg-red-600 hover:bg-red-500"
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}