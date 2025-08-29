'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StatCard from '@/components/StatCard'
import { Building, CheckCircle, FileText } from 'lucide-react'
import Topbar from '@/components/Topbar'
import PropertyTable from '@/components/PropertyTable'
import FileUploader from '@/components/FileUploader'
import AppointmentTable from '@/components/AppointmentTable'
import { format } from 'date-fns'
import TenantTable from '@/components/TenantTable'
import CollapsibleDashboardSections from '@/components/CollapsibleDashboardSession'

const supabase = createClientComponentClient()

export default function RealtorDashboard() {
  const [stats, setStats] = useState({ properties: 0, occupied: 0, leases: 0 })
  const [realtorId, setRealtorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ Get logged in user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setRealtorId(null)
          setStats({ properties: 0, occupied: 0, leases: 0 })
          setLoading(false)
          return
        }

        setRealtorId(user.id)

        // ✅ Fetch properties for this realtor
        const { data: properties, error } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', user.id)

        if (error) {
          console.error('Error fetching properties:', error)
          setLoading(false)
          return
        }

        updateStats(user.id, properties ?? [])

        // ✅ Subscribe to realtime property changes
        const channel = supabase
          .channel('properties-channel')
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

              updateStats(user.id, updated ?? [])
            }
          )
          .subscribe()

        setLoading(false)
        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        console.error('Auth error:', err)
        setLoading(false)
      }
    }

    init()
  }, [])

  const updateStats = (realtorId: string, properties: any[]) => {
    const total = properties.length
    const occupied = properties.filter((p) => p.status === 'Occupied').length
    const activeLeases = properties.filter(
      (p) => p.lease_end && new Date(p.lease_end) > new Date()
    ).length

    setStats({ properties: total, occupied, leases: activeLeases })
    checkLeaseExpirations(realtorId, properties)
  }

  const checkLeaseExpirations = async (realtorId: string, properties: any[]) => {
    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const expiringProps = properties.filter((prop) => {
      if (!prop.lease_end) return false
      const leaseEndDate = new Date(prop.lease_end)
      return leaseEndDate >= now && leaseEndDate <= in30Days
    })

    for (const prop of expiringProps) {
      const message = `Lease for property "${prop.title}" is expiring on ${format(
        new Date(prop.lease_end),
        'yyyy-MM-dd'
      )}`

      // ✅ Insert notification if not already exists
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

        {/* Tables + Uploads */}
        <PropertyTable realtorId={realtorId} />
        <TenantTable realtorId={realtorId} />
        <CollapsibleDashboardSections realtorId={realtorId ?? ''} />
        <AppointmentTable realtorId={realtorId} />
      </div>
    </div>
  )
}