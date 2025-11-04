'use client'

import { useEffect, useState, useRef } from 'react'
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
// Sidebar removed from layout to make dashboard responsive by default

interface Stats {
  properties: number
  occupied: number
  leases: number
}

type PlanType = 'free' | 'basic' | 'pro' | 'premium' | null

interface Tenant {
  id: string
  full_name: string | null
  email: string
  phone: string
  property_id: string
  realtor_id: string
}

interface Notification {
  id: string
  message: string
  read: boolean
  created_at: string
}

export default function RealtorDashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({ properties: 0, occupied: 0, leases: 0 })
  const [plan, setPlan] = useState<PlanType>(null)
  const [propertyLimit, setPropertyLimit] = useState<number | null>(1)
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [subscriptionActive, setSubscriptionActive] = useState(false)

  const router = useRouter()
  const intervalRef = useRef<number | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Helper to format milliseconds into D:H:M:S
  const formatDuration = (ms: number) => {
    if (ms <= 0) return '00:00:00:00'
    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / (24 * 3600))
    const hours = Math.floor((totalSec % (24 * 3600)) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  // Fetch subscription info and start live countdown
  useEffect(() => {
    if (!user?.id) return
    let mounted = true

    const startCountdown = (targetDate: Date | null, fallbackDate: Date | null) => {
      // clear previous
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      intervalRef.current = window.setInterval(() => {
        const now = new Date().getTime()

        // Prefer trial expiry while present, otherwise subscription expiry
        const target = targetDate?.getTime() ?? fallbackDate?.getTime() ?? null
        if (!target) {
          setCountdown(null)
          return
        }

        const diff = target - now
        if (diff <= 0) {
          // expired — mark and redirect
          setCountdown('00:00:00:00')
          setExpired(true)
          setSubscriptionActive(false)
          toast('⚠ Your trial or subscription has expired. Redirecting to subscription page...')
          window.clearInterval(intervalRef.current!)
          intervalRef.current = null
          // small timeout to allow toast to show
          setTimeout(() => {
            router.push('/subscription')
          }, 500)
          return
        }

        setCountdown(formatDuration(diff))
      }, 1000)
    }

    const fetchSub = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`)
        const data = await res.json()

        // Expect data.plan, data.status, data.trial_ends_at, data.subscription_expires_at
        const status: string = data?.status ?? 'none'
        const planId: PlanType = data?.plan ?? null

        const trial = data?.trial_ends_at ? new Date(data.trial_ends_at) : null
        const subExpires = data?.subscription_expires_at ? new Date(data.subscription_expires_at) : null

        // plan limits (if you want to add 'free' later, add here)
        const PLAN_LIMITS: Record<string, number | null> = {
          free: 0,
          basic: 10,
          pro: 20,
          premium: Infinity,
        }

        // Determine active state
        let isExpired = false
        const now = new Date()
        // If no plan and no trial, expired (you disallowed free)
        if (!planId && !trial) isExpired = true

        // Trial check
        if (trial && trial <= now) {
          // trial ended -> consider expired until subscription active
          isExpired = true
        }

        // Subscription expiry check
        if (subExpires && subExpires <= now) isExpired = true

        // status checks (server may provide explicit statuses)
        if (['expired', 'none', 'canceled'].includes(status)) {
          // treat as expired unless trial present and in future
          if (!(trial && trial > now)) isExpired = true
        }

        if (!mounted) return

        setPlan(planId)
        setPropertyLimit(planId ? PLAN_LIMITS[planId] ?? 1 : (trial ? 0 : 0))
        setTrialEndsAt(trial)
        setSubscriptionExpiresAt(subExpires)
        setSubscriptionActive(!isExpired)
        setExpired(isExpired)

        // Start countdown:
        // - if trial exists and is in future => countdown to trial end
        // - else if subscription expires date exists => countdown to subscription expiry
        // - else if no dates and no plan => no countdown (but will redirect above)
        if (trial && trial > now) {
          startCountdown(trial, subExpires)
        } else if (subExpires && subExpires > now) {
          startCountdown(subExpires, null)
        } else {
          // nothing to count — if expired, redirect
          if (isExpired) {
            toast('⚠ You need a subscription to access the dashboard. Redirecting to subscription page...')
            setTimeout(() => router.push('/subscription'), 500)
          } else {
            setCountdown(null)
          }
        }
      } catch (err) {
        console.error('❌ Subscription check failed:', err)
        toast('⚠ Unable to verify subscription. Redirecting to subscription page...')
        setPlan(null)
        setPropertyLimit(0)
        setSubscriptionActive(false)
        setExpired(true)
        setTimeout(() => router.push('/subscription'), 500)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSub()

    return () => {
      mounted = false
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user?.id, router])

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
    <div className="flex min-h-screen bg-black text-white">
      
      {/* Main content */}
      <main className="flex-1 p-6 space-y-8 overflow-y-auto bg-black">
           <div className='ml-auto'>
            <Profile />
          </div>

        
        {/* 🟢 Trial or subscription banner (real-time) */}
        {!expired && countdown && (
          <div className="bg-yellow-500 text-black text-center py-2 rounded-md font-semibold">
            ⏳ Trial / Subscription countdown — <span className="font-mono">{countdown}</span>
          </div>
        )}

        {/* expired case handled by redirect; but show warning briefly if expired false */}
        {expired && (
          <div className="bg-red-600 text-white text-center py-2 rounded-md font-semibold">
            ⚠ Your trial or subscription has expired — redirecting to subscription page...
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#302cfc]">Welcome, {user?.firstName || 'Realtor'}</h1>
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
              <PropertyTable plan={plan ?? null} propertyLimit={propertyLimit ?? 0} realtorId={user?.id!} />
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