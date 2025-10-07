'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table'

interface TeamMember {
  id: string
  member_id: string
  role: string
  created_at: string
  email?: string
}

export default function TeamAccordion() {
  const { user } = useUser()
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>('free')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [creatingOrg, setCreatingOrg] = useState(false)
  const [teamLimit, setTeamLimit] = useState<number>(0)
  const [clerkOrgId, setClerkOrgId] = useState<string>('')

  useEffect(() => {
    if (!user?.id) return
    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: realtor, error } = await supabase
          .from('realtors')
          .select('subscription_plan, clerk_organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (!realtor) return

        setPlan(realtor.subscription_plan || 'free')
        setClerkOrgId(realtor.clerk_organization_id || '')

        // Set team limit
        const limit =
          realtor.subscription_plan === 'pro'
            ? 4
            : realtor.subscription_plan === 'premium'
            ? 10
            : 0
        setTeamLimit(limit)

        // Fetch team members if org exists
        if (realtor.clerk_organization_id) {
          const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', realtor.clerk_organization_id)
            .order('created_at', { ascending: true })
          setTeamMembers(members || [])
        }
      } catch (err) {
        console.error('❌ Fetch failed:', err)
        toast.error('Failed to load team data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // ✅ Create organization for realtor
  const handleCreateOrganization = async () => {
    if (!user?.id || creatingOrg) return
    setCreatingOrg(true)
    try {
      const res = await fetch('/api/clerk/create-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${user.fullName || 'Realtor'} Realty`,
          ownerId: user.id,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to create organization')

      const orgId = data.organization.id
      setClerkOrgId(orgId)

      // 🧩 Save org ID to realtor record
      const { error } = await supabase
        .from('realtors')
        .update({ clerk_organization_id: orgId })
        .eq('id', user.id)
      if (error) throw error

      toast.success('Organization created successfully!')
    } catch (err) {
      console.error('❌ Create org failed:', err)
      toast.error('Failed to create organization')
    } finally {
      setCreatingOrg(false)
    }
  }

  // ✅ Invite team member
  const handleInvite = async () => {
    if (!email || !clerkOrgId) {
      toast.error('Enter a valid email')
      return
    }
    if (teamMembers.length >= teamLimit) {
      toast.error(`Team limit reached (${teamLimit})`)
      return
    }

    setInviting(true)
    try {
      const res = await fetch('/api/clerk/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: clerkOrgId, email, role }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to send invite')

      toast.success(`Invite sent to ${email}`)
      setEmail('')

      // Refresh members
      const { data: members } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', clerkOrgId)
      setTeamMembers(members || [])
    } catch (err) {
      console.error('❌ Invite failed:', err)
      toast.error('Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  if (loading) return <p className="text-gray-400">Loading...</p>

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="teams">
        <AccordionTrigger className="text-lg font-semibold text-blue-400">
          👥 Teams
        </AccordionTrigger>
        <AccordionContent>
          {plan === 'pro' || plan === 'premium' ? (
            clerkOrgId ? (
              <div className="space-y-4">
                <p>Team limit: {teamLimit}</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Team member email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting ? 'Inviting...' : 'Invite'}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Email / Member ID</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Joined At</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.email || member.member_id}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 bg-gray-800 rounded text-gray-200 space-y-3">
                <p>You don't have a team organization yet.</p>
                <Button onClick={handleCreateOrganization} disabled={creatingOrg}>
                  {creatingOrg ? 'Creating...' : 'Create Team Organization'}
                </Button>
              </div>
            )
          ) : (
            <div className="p-4 bg-gray-800 rounded">
              <p>Upgrade to Pro or Premium to add team members!</p>
              <Button asChild>
                <a href="/subscription">Upgrade Plan</a>
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}