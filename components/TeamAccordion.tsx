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
  realtor_id?: string
  team_id?: string
}

interface TeamAccordionProps {
  realtorId: string
  plan: 'free' | 'basic' | 'pro' | 'premium'
}

export default function TeamAccordion({ realtorId }: TeamAccordionProps) {
  const { user } = useUser()
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>('free')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [teamLimit, setTeamLimit] = useState<number>(0)
  const [clerkOrgId, setClerkOrgId] = useState<string>('')

  useEffect(() => {
    if (!realtorId) return

    const fetchPlanAndTeam = async () => {
      try {
        setLoading(true)

        // ✅ 1. Get realtor’s plan and Clerk org id
        const { data: realtor, error } = await supabase
          .from('realtors')
          .select('subscription_plan, clerk_organization_id')
          .eq('id', realtorId)
          .single()
        if (error || !realtor) throw error || new Error('No realtor found')

        const subPlan = realtor.subscription_plan || 'free'
        setPlan(subPlan)
        setClerkOrgId(realtor.clerk_organization_id)

        // ✅ 2. Set team limit based on plan
        const limits: Record<string, number> = {
          free: 0,
          basic: 0,
          pro: 4,
          premium: 10,
        }
        setTeamLimit(limits[subPlan] ?? 0)

        // ✅ 3. Fetch current team members
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('realtor_id', realtorId)
          .order('created_at', { ascending: true })
        setTeamMembers(members || [])
      } catch (err) {
        console.error('❌ Failed to load team:', err)
        toast.error('Failed to load team')
      } finally {
        setLoading(false)
      }
    }

    fetchPlanAndTeam()
  }, [realtorId])

  // ✅ Handle sending team invite
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
        body: JSON.stringify({
          ownerId: clerkOrgId,
          email,
          role,
          realtor_id: realtorId,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Invite sent to ${email}`)
        setEmail('')

        // Refresh list
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('realtor_id', realtorId)
        setTeamMembers(members || [])
      } else {
        console.error('Invite failed:', data)
        toast.error(data.error || 'Failed to send invite')
      }
    } catch (err) {
      console.error('Invite error:', err)
      toast.error('Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  if (loading)
    return (
      <div className="p-4 text-gray-400 text-center">Loading team data...</div>
    )

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="teams">
        <AccordionTrigger className="text-lg font-semibold text-blue-400">
          👥 Teams
        </AccordionTrigger>
        <AccordionContent>
          {plan === 'pro' || plan === 'premium' ? (
            <div className="space-y-4">
              <p className="text-gray-400">
                Team limit: {teamMembers.length}/{teamLimit}
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Team member email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 text-white"
                />
                <Button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="bg-blue-600"
                >
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
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-400">
                        No team members yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {member.email || member.member_id}
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 bg-gray-800 rounded text-center">
              <p className="mb-3 text-gray-300">
                Upgrade to <b>Pro</b> or <b>Premium</b> to add team members!
              </p>
              <Button asChild className="bg-blue-600">
                <a href="/subscription">Upgrade Plan</a>
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}