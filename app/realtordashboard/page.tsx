'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase' // your firebase config
import StatCard from '@/components/StatCard'
import { Building, CheckCircle, FileText } from 'lucide-react'
import Topbar from '@/components/Topbar'
import PropertyTable from '@/components/PropertyTable'
import FileUploader from '@/components/FileUploader'
import AppointmentTable from '@/components/AppointmentTable'
import { format } from 'date-fns'
import TenantTable from '@/components/TenantTable'
import CollapsibleDashboardSections from '@/components/CollapsibleDashboardSession'

export default function RealtorDashboard() {
  const [stats, setStats] = useState({ properties: 0, occupied: 0, leases: 0 })
  const [realtorId, setRealtorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setRealtorId(null)
        setStats({ properties: 0, occupied: 0, leases: 0 })
        setLoading(false)
        return
      }

      // Here, realtorId = user.uid
      setRealtorId(user.uid)

      // Listen to properties in real-time
      const q = query(
        collection(db, 'properties'),
        where('realtor_id', '==', user.uid)
      )

      const unsubProps = onSnapshot(q, (snapshot) => {
        const props = snapshot.docs.map(doc => doc.data())

        const total = props.length
        const occupied = props.filter((p) => p.status === 'Occupied').length
        const activeLeases = props.filter(
          (p) => p.lease_end && new Date(p.lease_end) > new Date()
        ).length

        setStats({ properties: total, occupied, leases: activeLeases })

        checkLeaseExpirations(user.uid, props)
        setLoading(false)
      })

      return () => unsubProps()
    })

    return () => unsubAuth()
  }, [])

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

      // Add notification if not already present
      const notifQuery = query(
        collection(db, 'notifications'),
        where('realtor_id', '==', realtorId),
        where('message', '==', message)
      )

      const unsubCheck = onSnapshot(notifQuery, async (snapshot) => {
        if (snapshot.empty) {
          await addDoc(collection(db, 'notifications'), {
            realtor_id: realtorId,
            message,
            read: false,
            created_at: serverTimestamp()
          })
        }
        unsubCheck() // stop listening after first check
      })
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
        <PropertyTable realtorId={realtorId}/>
        <TenantTable realtorId={realtorId}/>
        <CollapsibleDashboardSections realtorId='realtorId'/>
        <AppointmentTable realtorId={realtorId} />
        
        
      </div>
    </div>
  )
}