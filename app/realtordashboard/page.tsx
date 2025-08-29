'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import StatCard from '@/components/StatCard'
import { Building, CheckCircle, FileText } from 'lucide-react'
import Topbar from '@/components/Topbar'
import PropertyTable from '@/components/PropertyTable'
import AppointmentTable from '@/components/AppointmentTable'
import TenantTable from '@/components/TenantTable'
import CollapsibleDashboardSections from '@/components/CollapsibleDashboardSession'
import { format } from 'date-fns'

interface Stats {
  properties: number
  occupied: number
  leases: number
}

export default function RealtorDashboard() {
  const [stats, setStats] = useState<Stats>({ properties: 0, occupied: 0, leases: 0 })
  const [realtorId, setRealtorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: any

    const init = async () => {
      try {
        // Get logged-in user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setRealtorId(null)
          setLoading(false)
          return
        }

        setRealtorId(user.id)

        // Fetch initial properties
        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', user.id)

        updateStats(properties ?? [])

        // Subscribe to realtime property changes
        channel = supabase
          .channel(`properties-realtor-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'properties',
              filter: `realtor_id=eq.${user.id}`,
            },
            async () => {
              const { data: updated } = await supabase
                .from('properties')
                .select('*')
                .eq('realtor_id', user.id)
              updateStats(updated ?? [])
            }
          )
          .subscribe()

        setLoading(false)
      } catch (err) {
        console.error('Error initializing dashboard:', err)
        setLoading(false)
      }
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const updateStats = (properties: any[]) => {
    const total = properties.length
    const occupied = properties.filter((p) => p.status === 'Occupied').length
    const activeLeases = properties.filter(
      (p) => p.lease_end && new Date(p.lease_end) > new Date()
    ).length

    setStats({ properties: total, occupied, leases: activeLeases })
    checkLeaseExpirations(properties)
  }

  const checkLeaseExpirations = async (properties: any[]) => {
    if (!realtorId) return

    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const expiringProps = properties.filter((prop) => {
      if (!prop.lease_end) return false
      const leaseEnd = new Date(prop.lease_end)
      return leaseEnd >= now && leaseEnd <= in30Days
    })

    for (const prop of expiringProps) {
      const message = `Lease for property "${prop.title}" is expiring on ${format(
        new Date(prop.lease_end),
        'yyyy-MM-dd'
      )}`

      const { data: existing } = await supabase
        .from('notification')
        .select('*')
        .eq('realtor_id', realtorId)
        .eq('message', message)

      if (!existing || existing.length === 0) {
        await supabase.from('notification').insert({
          realtor_id: realtorId,
          message,
          read: false,
          created_at: new Date().toISOString(),
        })
      }
    }
  }

  if (loading) return <p className="text-white p-4">Loading dashboard...</p>

  return (
    <div className="flex bg-black text-white min-h-screen">
      <div className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold text-[#302cfc] mb-6">🏠 Realtor Dashboard</h1>
        <Topbar />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard icon={<Building />} title="Properties" value={stats.properties} />
          <StatCard icon={<CheckCircle />} title="Occupied Units" value={stats.occupied} />
          <StatCard icon={<FileText />} title="Active Leases" value={stats.leases} />
        </div>

        {/* Tables */}
        {realtorId && (
          <>
            <PropertyTable realtorId={realtorId} />
            <TenantTable realtorId={realtorId} />
            <CollapsibleDashboardSections realtorId={realtorId} />
            <AppointmentTable realtorId={realtorId} />
          </>
        )}
      </div>
    </div>
  )
}