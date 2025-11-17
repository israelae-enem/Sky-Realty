'use client'

import { useEffect, useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

// UI / layout components
import RealtorSidebar from '@/components/RealtorSidebar'
import Profile from '@/components/Profile'
import StatCard from '@/components/StatCard'
import RentAnalyticsCards from '@/components/RentAnalyticsCards'
import RentAnalyticsChart from '@/components/RentAnalyticsChart'
import RentReminders from '@/components/RentReminder'

// Forms (Shadcn/Dialog — they open themselves)
import PropertyForm from '@/components/forms/PropertyForm'
import TenantForm from '@/components/forms/TenantForm'
import ListingForm from '@/components/forms/ListingForm'
import AppointmentForm from '@/components/forms/AppointmentForm'
import RentPaymentForm from '@/components/forms/RentPaymentForm'
import LegalDocumentForm from '@/components/forms/LegalDocumentForm'
import MaintenanceForm from '@/components/forms/MaintenanceForm'
import ManageAccountForm from '@/components/forms/ManageAccountForm'

// DataTable + columns (you already have these)
import { DataTable } from '@/components/DataTable'
import { propertyColumns } from '@/lib/columns/property-columns'
import { tenantColumns } from '@/lib/columns/tenant-columns'
import { listingColumns } from '@/lib/columns/listing-columns'
import { appointmentColumns } from '@/lib/columns/maintenance-appointment-columns'
import { rentColumns } from '@/lib/columns/rent-columns'
import { documentColumns } from '@/lib/columns/document-columns'
import { maintenanceRequestColumns } from '@/lib/columns/maintenance-request-columns'
import { leadColumns } from '@/lib/columns/lead-columns'


// other components
import ListingTable from '@/components/ListingTable'
import TenantTable from '@/components/TenantTable'
import PropertyTable from '@/components/PropertyTable'
import RentPaymentTable from '@/components/RentPaymentTable'
import MaintenanceTable from '@/components/MaintenanceTable'
import AppointmentTable from '@/components/AppointmentTable'
import LegalDocumentsTable from '@/components/LegalDocumentTable'
import TeamAccordion from '@/components/TeamAccordion'
import RealtorChat from '@/components/RealtorChat'
import { PLAN_LIMITS } from '@/constants'

// icons
import { Building, CheckCircle, FileText, Bell, Home, Users, Calendar } from 'lucide-react'

type PlanType = 'free' | 'basic' | 'pro' | 'premium' | null

interface Stats {
  properties: number
  occupied: number
  leases: number
}

interface Notification {
  id: string
  message: string
  read: boolean
  created_at: string
}

export default function RealtorDashboard() {
  const { user } = useUser()
  const router = useRouter()

  // UI state
  const [activeTab, setActiveTab] = useState<string>('Home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // subscription + plan + counts
  const [loading, setLoading] = useState<boolean>(true)
  const [plan, setPlan] = useState<PlanType>(null)
  const [propertyLimit, setPropertyLimit] = useState<number | null>(1)
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // data
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [rentPayments, setRentPayments] = useState<any[]>([])
  const [legalDocuments, setLegalDocuments] = useState<any[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // stats derived from properties
  const [stats, setStats] = useState<Stats>({ properties: 0, occupied: 0, leases: 0 })

  const unreadCount = notifications.filter(n => !n.read).length

  // Helper: format countdown
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

  // Subscription logic (fetch / countdown)
  useEffect(() => {
    if (!user?.id) return
    let mounted = true

    const startCountdown = (targetDate: Date | null) => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = window.setInterval(() => {
        const now = Date.now()
        const target = targetDate?.getTime() ?? null
        if (!target) {
          setCountdown(null)
          return
        }
        const diff = target - now
        if (diff <= 0) {
          setCountdown('00:00:00:00')
          setExpired(true)
          setSubscriptionActive(false)
          toast('⚠ Your trial or subscription has expired. Please renew.')
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return
        }
        setCountdown(formatDuration(diff))
      }, 1000)
    }

    const fetchSub = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`)
        const data = await res.json()

        const status: string = data?.status ?? 'none'
        const planId: PlanType = data?.plan ?? null
        const trial = data?.trial_ends_at ? new Date(data.trial_ends_at) : null
        const subExpires = data?.subscription_expires_at ? new Date(data.subscription_expires_at) : null

        const PLAN_LIMITS: Record<string, number | null> = {
          free: 1,
          basic: 10,
          pro: 20,
          premium: Infinity,
        }

        let isExpired = false
        const now = new Date()
        if (!planId && !trial) isExpired = true
        if (trial && trial <= now) isExpired = true
        if (subExpires && subExpires <= now) isExpired = true
        if (['expired', 'none', 'canceled'].includes(status) && !(trial && trial > now)) isExpired = true

        if (!mounted) return
        setPlan(planId)
        setPropertyLimit(planId ? PLAN_LIMITS[planId] ?? 1 : (trial ? 0 : 0))
        setTrialEndsAt(trial)
        setSubscriptionExpiresAt(subExpires)
        setSubscriptionActive(true)
        setExpired(isExpired)

        if (trial && trial > now) startCountdown(trial)
        else if (subExpires && subExpires > now) startCountdown(subExpires)
        else setCountdown(null)
      } catch (err) {
        console.error(err)
        toast('⚠ Unable to verify subscription. Some actions may be disabled.')
        setPlan(null)
        setPropertyLimit(1)
        setSubscriptionActive(false)
        setExpired(true)
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
  }, [user?.id])

  // Fetch initial dashboard data
  useEffect(() => {
    const initData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const [
          propRes,
          tenantRes,
          listingRes,
          appointRes,
          paymentRes,
          legalRes,
          maintenanceRes,
          notifRes
        ] = await Promise.all([
          supabase.from('properties').select('*').eq('realtor_id', user.id),
          supabase.from('tenants').select('*').eq('realtor_id', user.id),
          supabase.from('listings').select('*').eq('realtor_id', user.id),
          supabase.from('appointments').select('*').eq('realtor_id', user.id),
          supabase.from('rent_payment').select('*').eq('realtor_id', user.id),
          supabase.from('legal_documents').select('*'),
          supabase.from('maintenance_request').select('*').eq('realtor_id', user.id),
          supabase.from('notification').select('*').eq('realtor_id', user.id).order('created_at', { ascending: false })
        ])

        setProperties(propRes.data ?? [])
        setTenants(tenantRes.data ?? [])
        setListings(listingRes.data ?? [])
        setAppointments(appointRes.data ?? [])
        setRentPayments(paymentRes.data ?? [])
        setLegalDocuments(legalRes.data ?? [])
        setMaintenanceRequests(maintenanceRes.data ?? [])
        setNotifications(notifRes.data ?? [])

        // update stats
        updateStats(propRes.data ?? [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [user?.id])

  useEffect(() => {
  if (activeTab === 'listings' && typeof window !== 'undefined') {
    router.push('/properties')
  }
}, [activeTab, router])

  // Realtime listeners (optional: insert-only shown)
  useEffect(() => {
    if (!user?.id) return

    // Listen for new notifications and maintenance requests
    const notifChannel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification' }, (payload) => {
        const n = payload.new as Notification
        setNotifications(prev => [n, ...prev])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_request' }, (payload) => {
        const m = payload.new as any
        setMaintenanceRequests(prev => [m, ...prev])
        toast.success(`New maintenance: ${m.title}`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(notifChannel)
    }
  }, [user?.id])

  const updateStats = (properties: any[]) => {
    const total = properties.length
    const occupied = properties.filter(p => p.status === 'Occupied').length
    const activeLeases = properties.filter(p => p.lease_end && new Date(p.lease_end) > new Date()).length
    setStats({ properties: total, occupied, leases: activeLeases })
  }

  // mark notifications read
  const markNotificationsRead = async () => {
    if (!user?.id) return
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (!unreadIds.length) return
      const { error } = await supabase.from('notification').update({ read: true }).in('id', unreadIds)
      if (!error) setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark notifications', err)
    }
  }

  // UI helpers
  if (loading) return <p className="p-8 text-center text-gray-800">Loading dashboard...</p>

  

  // Render content function that returns a motion-wrapped section
  const renderSection = (key: string) => {
    switch (key) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <h1 className="text-2xl font-bold text-[#302cfc]">Welcome, {user?.firstName ?? 'Realtor'}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Building />} title={`Total Properties ${plan ? `(Plan: ${plan})` : ''}`} value={stats.properties} />
              <StatCard icon={<CheckCircle />} title="Occupied Units" value={stats.occupied} />
              <StatCard icon={<FileText />} title="Active Leases" value={stats.leases} />
              <StatCard icon={<Bell />} title="Unread Notifications" value={unreadCount} />
            </div>

            <RentAnalyticsCards />
            <RentAnalyticsChart />
            <RentReminders />
          </motion.div>
        )

      case 'properties':
    return (
      <motion.div
        key="properties"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-lg font-semibold">Add Property</h2>
        <PropertyForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('properties')
              .select('*')
              .eq('realtor_id', user?.id)
            setProperties(data ?? [])
          }}
        />

        <h2 className="text-lg font-semibold mt-6">All Properties</h2>
        <DataTable columns={propertyColumns} data={properties} />
      </motion.div>
    )

  case 'addProperty':
    return (
      <motion.div
        key="addProperty"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="space-y-6"
      >
        <h2 className="text-lg font-semibold">Add Property</h2>
        <PropertyForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('properties')
              .select('*')
              .eq('realtor_id', user?.id)
            setProperties(data ?? [])
          }}
        />
      </motion.div>
    )

  case 'listings':
    return (
      <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <p>Redirecting to listings page...</p>
      </motion.div>
    )

  case 'addListing':
    return (
      <motion.div
        key="addListing"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="space-y-6"
      >
        <h2 className="text-lg font-semibold">Add Listing</h2>
        <ListingForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('listings')
              .select('*')
              .eq('realtor_id', user?.id)
            setListings(data ?? [])
          }}
        />

        <h2 className="text-lg font-semibold mt-6">All Listings</h2>
        <DataTable columns={listingColumns} data={listings} />
      </motion.div>
    )

  case 'viewListing':
    return (
      <motion.div key="viewListing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p>Select a listing from the All Listings page. To view a specific listing, open <code>/properties/[id]</code></p>
      </motion.div>
    )

  case 'tenants':
    return (
      <motion.div
        key="tenants"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="space-y-6"
      >
        <h2 className="text-lg font-semibold">Add Tenant</h2>
        <TenantForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('tenants')
              .select('*')
              .eq('realtor_id', user?.id)
            setTenants(data ?? [])
          }}
        />

        <h2 className="text-lg font-semibold mt-6">All Tenants</h2>
        <DataTable columns={tenantColumns} data={tenants} />
      </motion.div>
    )

  case 'addTenant':
    return (
      <motion.div
        key="addTenant"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="space-y-6"
      >
        <h2 className="text-lg font-semibold">Add Tenant</h2>
        <TenantForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('tenants')
              .select('*')
              .eq('realtor_id', user?.id)
            setTenants(data ?? [])
          }}
        />
      </motion.div>
    )

  case 'appointments':
  case 'appointmentsViewing':
  case 'appointmentsMeeting':
  case 'appointmentsMaintenance':
    return (
      <motion.div 
      key={activeTab}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="text-lg font-semibold mb-4">Add Appointment</h2>
      <AppointmentForm
        realtorId={user?.id ?? ''}
        onSuccess={async () => {
          const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('realtor_id', user?.id)
          setAppointments(data ?? [])
        }}
      />
      <DataTable columns={appointmentColumns} data={appointments} />
      </motion.div>
    )

  case 'rentPayments':
    return (
      <motion.div key="rentPayments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-6">
        <h2 className="text-lg font-semibold">Add Rent Payment</h2>
        <RentPaymentForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('rent_payment')
              .select('*')
              .eq('realtor_id', user?.id)
            setRentPayments(data ?? [])
          }}
        />

        <h2 className="text-lg font-semibold mt-6">All Rent Payments</h2>
        <DataTable columns={rentColumns} data={rentPayments} />
      </motion.div>
    )

  case 'addPayment':
    return (
      <motion.div key="addPayment" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-6">
        <h2 className="text-lg font-semibold">Add Rent Payment</h2>
        <RentPaymentForm
          realtorId={user?.id ?? ''}
          onSuccess={async () => {
            const { data } = await supabase
              .from('rent_payment')
              .select('*')
              .eq('realtor_id', user?.id)
            setRentPayments(data ?? [])
          }}
        />
      </motion.div>
    )

      case 'maintenance':
        return (
          <motion.div key="maintenance" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MaintenanceTable realtorId={user?.id ?? ''} />
          </motion.div>
        )

      case 'legalDocuments':
        return (
          <motion.div 

          key="legalDocuments"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="text-lg font-semibold mb-4">Add Legal Document</h2>
      <LegalDocumentForm
        realtorId={user?.id ?? ''}
        onSuccess={async () => {
          const { data } = await supabase
            .from('legal_documents')
            .select('*')
            .eq('realtor_id', user?.id)
          setLegalDocuments(data ?? [])
        }}
      />
      <DataTable columns={documentColumns} data={legalDocuments} />
          </motion.div>
        )

      case 'team':
        return (
          <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TeamAccordion />
          </motion.div>
        )

          case 'newLeads':
        case 'contactedLeads':
         return (
          <motion.div
      key="leads"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="p-4"
    >
           <DataTable
           columns={leadColumns}
           data={leads.filter(l =>
             activeTab === 'newLeads'
            ? l.status === 'New'
            : l.status !== 'New'
           )}
           />
    </motion.div>
  )

      case 'chat':
        return (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <RealtorChat  realtorId={ user?.id} />
          </motion.div>
        )

      case 'notifications':
        return (
          <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-4 mb-3">
              <button onClick={markNotificationsRead} className="text-blue-600 underline">Mark all read</button>
            </div>
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className={clsx('p-2 rounded-md mb-2', n.read ? 'bg-gray-100 text-gray-700' : 'bg-[#302cfc] text-white')}>
                {n.message}
              </div>
            )) : <p className="text-gray-500">No notifications</p>}
          </motion.div>
        )

      case 'manageAccount':
        return (
          <motion.div key="manageAccount" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ManageAccountForm />
          </motion.div>
        )

      default:
        return <div>Select a section</div>
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RealtorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={clsx('flex-1 p-6 transition-all duration-300', !subscriptionActive && 'blur-sm pointer-events-none select-none')}>
        {/* Top bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded shadow mb-6">
          <div className="flex items-center gap-4">
            
            <h2 className="text-lg font-semibold">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            {countdown && !expired && (
              <div className="bg-yellow-400 text-black px-3 py-1 rounded font-mono">{countdown}</div>
            )}
            <div className="text-sm text-gray-700">Plan: <span className="font-medium">{plan ?? 'free'}</span></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            {renderSection(activeTab)}
          </AnimatePresence>
        </div>
      </main>



      

      {/* ⚠ Subscription Modal *
      {!subscriptionActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md w-[90%]"
          >
            <h2 className="text-2xl font-bold text-[#302cfc] mb-4">
              Please Subscribe to Continue
            </h2>
            <p className="text-gray-700 mb-6">
              Your trial or subscription has expired. To regain access to your dashboard features,
              please choose a plan and subscribe now! see you soon.
            </p>
            <button
              onClick={() => router.push('/subscription')}
              className="bg-[#302cfc] hover:bg-[#241fd9] text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Go to Pricing Page
            </button>
          </motion.div>
        </motion.div>
      )}
        */}
    </div>
  )
}