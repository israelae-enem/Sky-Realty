'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import StatCard from '@/components/StatCard'
import { Building, CheckCircle, FileText, Home, Users, Calendar, Bell, RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RentAnalyticsCards from '@/components/RentAnalyticsCards'
import RentAnalyticsChart from '@/components/RentAnalyticsChart'
import RentReminders from '@/components/RentReminder'
import { toast } from 'sonner'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import PropertyTable from '@/components/PropertyTable'
import AppointmentTable from '@/components/AppointmentTable'
import TenantTable from '@/components/TenantTable'
import RentPaymentTable from '@/components/RentPaymentTable'
import MaintenanceTable from '@/components/MaintenanceTable'
import LegalDocumentsTable from '@/components/LegalDocumentTable'
import Profile from '@/components/Profile'
import RealtorChat from '@/components/RealtorChat'
import TeamAccordion from '@/components/TeamAccordion'
import Sidebar from '@/components/Bar'


interface Stats {
  properties: number
  occupied: number
  leases: number
}

type PlanType = 'free'| 'basic' | 'pro' | 'premium' | null

interface Tenant {
  id: string
  full_name: string | null
  email: string
  phone: string
  property_id: string
  realtor_id:string
}

interface Notification {
  id: string
  message: string
  read: boolean
  created_at: string
}


const links = [
  { label: 'Properties', href: '#properties' },
  { label: ' Tenants', href: '#tenants' },
  { label: 'Rent Tracking', href: '#rent-payments' },
  { label: 'Maintenance Requests', href: '#maintenance' },
  { label: 'Notifications', href: '#notifications' },
  { label: 'Chats', href: '#chat' },
  { label: 'Appointments', href: '#appointments' },
  { label: 'Rent Analytics', href: '#rent-analytics' },
  { label: 'Documents Templates', href: '/legal-doc' },
  { label: 'Your Documents', href: '#legal-docs' },
  { label: 'Team', href: '#team' },
]

export default function RealtorDashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({ properties: 0, occupied: 0, leases: 0 })
  const [plan, setPlan] = useState<PlanType>()
  const [propertyLimit, setPropertyLimit] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)

  const router = useRouter()
  const handleRefresh = async () => {
    setLoading(true)
    await router.refresh()
    setLoading(false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  
  useEffect(() => {
    if (!user?.id) return

    const checkSubscription = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`)
        const data = await res.json()

        const now = new Date()
        let expired = false
        let trialRemaining = null

        if (data.trial_ends_at) {
          const trialEnd = new Date(data.trial_ends_at)
          const diffDays = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          trialRemaining = diffDays > 0 ? diffDays : 0
          if (diffDays <= 0) expired = true
        }

        if (data.status === 'expired' || data.status === 'none') expired = true

        if (expired) {
          setExpired(true)
          toast('⚠ Your subscription or trial has expired. Please renew to continue using Sky Realty.')
          router.push('/subscription')
        } else {
          setTrialDaysLeft(trialRemaining)
        }
      } catch (err) {
        console.error('Failed to check subscription:', err)

      
      }
    }

    checkSubscription()
  }, [user?.id, router])



  // ---------------- Fetch plan ----------------
  useEffect(() => {
    if (!user?.id) return

    const PLAN_LIMITS: Record<string, number | null> = {
      free: 1,
      basic: 10,
      pro: 20,
      premium: Infinity,
    }

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`)
        if (!res.ok) throw new Error(`Failed to fetch subscription: ${res.status}`)
        const data = await res.json()

        const planId: string = data?.plan ?? 'free'
        const limit = PLAN_LIMITS[planId] ?? 1

        setPlan(planId as PlanType)
        setPropertyLimit(limit)
      } catch (err) {
        console.error('❌ Failed to load subscription:', err)
        setPlan('free')
        setPropertyLimit(1)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [user?.id])

  // ---------------- Fetch properties, tenants, notifications ----------------
  useEffect(() => {
    const initData = async () => {
      if (!user?.id) return
      setLoading(true)
      const realtorId = user.id

      try {
        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', realtorId)
        updateStats(properties ?? [])

        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, full_name, email, phone, property_id, realtor_id')
          .eq('realtor_id', realtorId)
          .order('full_name', { ascending: true })
        if (!tenantsError && tenantsData) setTenants(tenantsData)

        const { data: notificationsData, error: notifError } = await supabase
          .from('notification')
          .select('*')
          .eq('realtor_id', realtorId)
          .order('created_at', { ascending: false })
        if (!notifError && notificationsData) setNotifications(notificationsData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [user?.id])

  const updateStats = (properties: any[]) => {
    const total = properties.length
    const occupied = properties.filter((p) => p.status === 'Occupied').length
    const activeLeases = properties.filter(
      (p) => p.lease_end && new Date(p.lease_end) > new Date()
    ).length
    setStats({ properties: total, occupied, leases: activeLeases })
  }

  const markNotificationsRead = async () => {
    if (!user?.id) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notification')
      .update({ read: true })
      .in('id', unreadIds)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
    }
  }

  if (loading) return <p className="p-8 text-center text-white">Loading dashboard...</p>

  return (
    <div className="flex min-h-screen bg-[#222224] text-white">
      {/* Sidebar */}
       <Sidebar links={links} />

      {/* Main content */}
      <main className="flex-1 p-6 space-y-8 overflow-y-auto bg-[#222224]">

        {/* 🟢 Trial or subscription banner */}
        {trialDaysLeft !== null && !expired && (
          <div className="bg-yellow-500 text-black text-center py-2 rounded-md font-semibold">
            {trialDaysLeft > 0
              ? `⏳ Your trial ends in ${trialDaysLeft} day${trialDaysLeft > 1 ? 's' : ''}. Upgrade now to keep access!`
              : '⚠ Your trial has ended. Please subscribe to continue using Sky Realty.'}
          </div>
        )}


         <div className='flex items-center gap-4'>
            <button onClick={handleRefresh} className="bg-[#302cfc] hover:bg-[#241fd9] px-4 py-2 rounded flex items-center gap-4 justify-end">
              <RotateCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <Profile />
          </div>


        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#302cfc]">Welcome, {user?.firstName || 'Realtor'}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <StatCard icon={<Building />} title={`Total Properties ${plan ? `(Plan: ${plan})` : ''}`} value={stats.properties} />
          <StatCard icon={<CheckCircle />} title="Occupied Units" value={stats.occupied} />
          <StatCard icon={<FileText />} title="Active Leases" value={stats.leases} />
          <StatCard icon={<Bell />} title="Unread Notifications" value={unreadCount} />
        </div>

        {/* Rent Analytics */}
        <div id="rent-analytics">
          <RentAnalyticsCards />
        </div>

          <div id="rent-analytics">
          <RentAnalyticsChart />
          <RentReminders />
        </div>

        {/* Accordion for tables */}
        <Accordion type="single" collapsible className="w-full mt-8 space-y-6">
          <AccordionItem value="properties">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Home size={18} /> Properties
            </AccordionTrigger>
            <AccordionContent>
              <PropertyTable plan={plan ?? null} propertyLimit={propertyLimit} realtorId={user?.id!} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tenants">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Users size={18} /> Tenants
            </AccordionTrigger>
            <AccordionContent>
              <TenantTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rent-payments">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FileText size={18} /> Rent Payments
            </AccordionTrigger>
            <AccordionContent>
              <RentPaymentTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="maintenance">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FileText size={18} /> Maintenance Requests
            </AccordionTrigger>
            <AccordionContent>
              <MaintenanceTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

            <AccordionItem value="appointments">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Calendar size={18} /> Schedule Maintenance
            </AccordionTrigger>
            <AccordionContent>
              <AppointmentTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2" onClick={markNotificationsRead}>
              <Bell size={18} /> Notifications ({unreadCount})
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <p
                    key={n.id}
                    className={`p-2 rounded-md ${n.read ? 'bg-gray-800 text-gray-400' : 'bg-[#302cfc] text-white'}`}
                  >
                    {n.message}
                  </p>
                ))
              ) : (
                <p className="text-gray-400">No notifications</p>
              )}
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="legal-docs">
            <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Calendar size={18} /> Legal Documents
            </AccordionTrigger>
            <AccordionContent>
              <LegalDocumentsTable  />
            </AccordionContent>
          </AccordionItem>

          
            <AccordionItem value="team">
          <AccordionTrigger className="text-lg font-semibold text-blue-600 flex items-center gap-2">
           <Users size={18} /> Team
             </AccordionTrigger>
             <AccordionContent>
                {user?.id && plan ? (
               <TeamAccordion   />
               ) : (
              <p className="text-gray-400">Loading team info...</p>
                )}
            </AccordionContent>
              </AccordionItem>
              


              {/* Chat Component */}
             <Accordion type="single" collapsible className="w-full mt-8 space-y-6">
             {/* other accordion items */}
              {user?.id && <RealtorChat tenants={tenants} user={{ id: user.id }} />}
             </Accordion>

          

        

         
        </Accordion>
      </main>
    </div>
  )
}