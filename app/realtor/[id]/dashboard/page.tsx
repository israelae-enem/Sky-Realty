'use client'

import { useEffect, useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PropertyTable from '@/components/PropertyTable'
import TenantTable from '@/components/TenantTable'
import RentPaymentTable from '@/components/RentPaymentTable'
import MaintenanceTable from '@/components/MaintenanceTable'
import AppointmentTable from '@/components/AppointmentTable'
import LegalDocumentsTable from '@/components/LegalDocumentTable'
import Profile from '@/components/Profile'
import RealtorChat from '@/components/RealtorChat'
import StatCard from '@/components/StatCard'
import RentAnalyticsCards from '@/components/RentAnalyticsCards'
import RentAnalyticsChart from '@/components/RentAnalyticsChart'
import RentReminders from '@/components/RentReminder'
import TeamAccordion from '@/components/TeamAccordion'
import { Building, CheckCircle, FileText, Home, Users, Calendar, Bell } from 'lucide-react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import ListingTable from '@/components/ListingTable'
import { PLAN_LIMITS } from '@/constants'

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
  const router = useRouter()
  const userId = user?.id || "";
  const currentPlan = "free";

  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<PlanType>(null)
  const [propertyLimit, setPropertyLimit] = useState<number | null>(1)
  const [stats, setStats] = useState<Stats>({ properties: 0, occupied: 0, leases: 0 })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const maxProperties = PLAN_LIMITS[currentPlan] ?? null;
  


  const [activeSection, setActiveSection] = useState('Home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Format countdown
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

  // Fetch subscription info & start countdown
  useEffect(() => {
    if (!user?.id) return
    let mounted = true

    const startCountdown = (targetDate: Date | null) => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)

      intervalRef.current = window.setInterval(() => {
        const now = new Date().getTime()
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
          window.clearInterval(intervalRef.current!)
          intervalRef.current = null
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
        setSubscriptionActive(!isExpired)
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
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [user?.id])

  // Fetch dashboard data
  useEffect(() => {
    const initData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', user.id)

        updateStats(properties ?? [])

        const { data: tenantsData } = await supabase
          .from('tenants')
          .select('*')
          .eq('realtor_id', user.id)
          .order('full_name', { ascending: true })
        if (tenantsData) setTenants(tenantsData)

          
        const { data: listingData } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', user.id)
          .order('full_name', { ascending: true })
        if (listingData) setTenants(listingData)

        const { data: notificationsData } = await supabase
          .from('notification')
          .select('*')
          .eq('realtor_id', user.id)
          .order('created_at', { ascending: false })
        if (notificationsData) setNotifications(notificationsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [user?.id])

  const updateStats = (properties: any[]) => {
    const total = properties.length
    const occupied = properties.filter((p) => p.status === 'Occupied').length
    const activeLeases = properties.filter((p) => p.lease_end && new Date(p.lease_end) > new Date()).length
    setStats({ properties: total, occupied, leases: activeLeases })
  }

  

  const markNotificationsRead = async () => {
    if (!user?.id) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    const { error } = await supabase.from('notification').update({ read: true }).in('id', unreadIds)
    if (!error) setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (loading) return <p className="p-8 text-center text-gray-800">Loading dashboard...</p>

   const navItems = [
  { name: 'Home', icon: <Home size={18} /> },
  { name: 'Listings', icon: <Building size={18} /> },
  { name: 'Properties', icon: <Building size={18} /> },
  { name: 'Tenants', icon: <Users size={18} /> },
  { name: 'Rent Payments', icon: <FileText size={18} /> },
  { name: 'Maintenance', icon: <FileText size={18} /> },
  { name: 'Appointments', icon: <Calendar size={18} /> },
  { name: 'Notifications', icon: <Bell size={18} /> },
  { name: 'Legal Documents', icon: <Calendar size={18} /> },
  { name: 'Team', icon: <Users size={18} /> },
  { name: 'Chat', icon: <Users size={18} /> },
]

return (
  <div className="flex min-h-screen bg-gray-300 text-gray-800">
    {/* Sidebar */}

    <aside className={clsx(
      'fixed top-0 left-0 h-full w-64 backdrop-blur-md bg-[#e8ecf1]/80 p-6 flex flex-col justify-between transition-transform duration-300 z-50',
      sidebarOpen ? 'translate-x-0' : '-translate-x-64',
      'md:translate-x-0'
    )}>
      
      {/* Top section: Profile and heading */}
      <div className="flex flex-col space-y-4 sticky top-0 z-10">
        {/* Profile */}
        <Profile />

        {/* Dashboard heading */}
        <h1 className="text-2xl font-bold text-[#302cfc]">Dashboard</h1>
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col space-y-2 mt-6 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveSection(item.name)}
            className={clsx(
              'flex items-center p-2 rounded-lg transition-colors duration-200',
              activeSection === item.name ? 'bg-[#dbe2ff] text-[#302cfc]' : 'hover:bg-[#dbe2ff]'
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
   

      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>
      </div>

      {/* Main Content */}
      <main className={clsx(
          'flex-1 flex flex-col ml-0 md:ml-64 transition-all duration-300 relative',
          !subscriptionActive && 'blur-sm pointer-events-none select-none'
        )}
      > 
      
        <div className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold">{activeSection}</h2>
          
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {/* Countdown banner */}
          {!expired && countdown && (
            <div className="bg-yellow-500 text-black text-center py-2 rounded-md font-semibold mb-4">
              ⏳ Trial / Subscription countdown — <span className="font-mono">{countdown}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeSection === 'Home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-tech font-bold text-[#302cfc]">Welcome, {user?.firstName || 'Realtor'}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                  <StatCard icon={<Building />} title={`Total Properties ${plan ? `(Plan: ${plan})` : ''}`} value={stats.properties} />
                  <StatCard icon={<CheckCircle />} title="Occupied Units" value={stats.occupied} />
                  <StatCard icon={<FileText />} title="Active Leases" value={stats.leases} />
                  <StatCard icon={<Bell />} title="Unread Notifications" value={unreadCount} />
                </div>
                <RentAnalyticsCards />
                <RentAnalyticsChart />
                <RentReminders />
              </motion.div>
            )}


              {activeSection === 'Listings' && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                
              >
                <ListingTable currentPlan={plan ?? 'free'} userId={user?.id!} />
              </motion.div>
            )}



            {activeSection === 'Properties' && (
              <motion.div
                key="properties"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PropertyTable plan={plan ?? null} propertyLimit={propertyLimit ?? 0} realtorId={user?.id!} />
              </motion.div>
            )}

            {activeSection === 'Tenants' && (
              <motion.div
                key="tenants"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TenantTable realtorId={user?.id ?? ''} />
              </motion.div>
            )}

            {activeSection === 'Rent Payments' && (
              <motion.div key="rentpayments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <RentPaymentTable realtorId={user?.id ?? ''} />
              </motion.div>
            )}

            {activeSection === 'Maintenance' && (
              <motion.div key="maintenance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <MaintenanceTable realtorId={user?.id ?? ''} />
              </motion.div>
            )}

            {activeSection === 'Appointments' && (
              <motion.div key="appointments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <AppointmentTable realtorId={user?.id ?? ''} />
              </motion.div>
            )}

            {activeSection === 'Notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button onClick={markNotificationsRead} className="mb-2 text-blue-600 underline">Mark all read</button>
                {notifications.length > 0 ? notifications.map((n) => (
                  <p key={n.id} className={clsx('p-2 rounded-md', n.read ? 'bg-gray-200 text-gray-600' : 'bg-[#302cfc] text-white')}>
                    {n.message}
                  </p>
                )) : <p className="text-gray-400">No notifications</p>}
              </motion.div>
            )}

            {activeSection === 'Legal Documents' && (
              <motion.div key="legal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <LegalDocumentsTable />
              </motion.div>
            )}

            {activeSection === 'Team' && (
              <motion.div key="team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <TeamAccordion />
              </motion.div>
            )}

            {activeSection === 'Chat' && (
              <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {user ? <RealtorChat tenants={tenants} user={{ id: user.id }} /> : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>


      {/* ⚠ Subscription Modal */}
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

      
    </div>
  )
}