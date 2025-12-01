'use client'

import { useEffect, useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import clsx from 'clsx'
import { supabase } from '@/lib/supabaseClient'
import CompanySidebar from '@/components/CompanySidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, CheckCircle, FileText, Bell } from 'lucide-react'

// Forms
import PropertyForm from '@/components/forms/PropertyForm'
import TenantForm from '@/components/forms/TenantForm'
import ListingForm from '@/components/forms/ListingForm'
import AppointmentForm from '@/components/forms/AppointmentForm'
import RentPaymentForm from '@/components/forms/RentPaymentForm'
import LegalDocumentForm from '@/components/forms/LegalDocumentForm'
import LeadForm from '@/components/forms/LeadForm'
import ManageAccountForm from '@/components/forms/ManageAccountForm'

// Tables / Components
import LeadsTable from '@/components/LeadsTable'
import { DataTable } from '@/components/DataTable'
import { propertyColumns } from '@/lib/columns/property-columns'
import { tenantColumns } from '@/lib/columns/tenant-columns'
import { listingColumns } from '@/lib/columns/listing-columns'
import { appointmentColumns } from '@/lib/columns/maintenance-appointment-columns'
import { rentColumns } from '@/lib/columns/rent-columns'
import { documentColumns } from '@/lib/columns/document-columns'
import { maintenanceRequestColumns } from '@/lib/columns/maintenance-request-columns'
import { leadColumns } from '@/lib/columns/lead-columns'

import RealtorChat from '@/components/RealtorChat'
import TeamAccordion from '@/components/TeamAccordion'
import MaintenanceTable from '@/components/MaintenanceTable'
import StatCard from '@/components/StatCard'
import RentAnalyticsCards from '@/components/RentAnalyticsCards'
import RentAnalyticsChart from '@/components/RentAnalyticsChart'
import RentReminders from '@/components/RentReminder'
import { redirect, useRouter } from 'next/navigation'

export default function CompanyDashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [rentPayments, setRentPayments] = useState<any[]>([])
  const [legalDocuments, setLegalDocuments] = useState<any[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  // Stats
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    listings: 0,
    occupiedProperties: 0,
    activeLeases: 0
  })

  // Subscription & Plan
  const [plan, setPlan] = useState<string | null>(null)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [expired, setExpired] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null)
  const intervalRef = useRef<number | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length

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

  // ---------- Fetch Subscription ----------
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
        const planId: string | null = data?.plan ?? null
        const trial = data?.trial_ends_at ? new Date(data.trial_ends_at) : null
        const subExpires = data?.subscription_expires_at ? new Date(data.subscription_expires_at) : null

        let isExpired = false
        const now = new Date()
        if (!planId && !trial) isExpired = true
        if (trial && trial <= now) isExpired = true
        if (subExpires && subExpires <= now) isExpired = true
        if (['expired', 'none', 'canceled'].includes(status) && !(trial && trial > now)) isExpired = true

        if (!mounted) return
        setPlan(planId)
        setSubscriptionActive(!isExpired)
        setExpired(isExpired)
        setTrialEndsAt(trial)
        setSubscriptionExpiresAt(subExpires)

        if (trial && trial > now) startCountdown(trial)
        else if (subExpires && subExpires > now) startCountdown(subExpires)
        else setCountdown(null)
      } catch (err) {
        console.error(err)
        toast('⚠ Unable to verify subscription. Some actions may be disabled.')
        setPlan(null)
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

  // ---------- Fetch All Data ----------
  const fetchAllData = async () => {
    if (!user?.id) return
    try {
      const [
        propRes,
        tenantRes,
        listingRes,
        appointRes,
        paymentRes,
        legalRes,
        maintenanceRes,
        leadsRes,
        notifRes
      ] = await Promise.all([
        supabase.from('properties').select('*').eq('company_id', user.id),
        supabase.from('tenants').select('*').eq('company_id', user.id),
        supabase.from('listings').select('*').eq('company_id', user.id),
        supabase.from('appointments').select('*').eq('company_id', user.id),
        supabase.from('rent_payment').select('*').eq('company_id', user.id),
        supabase.from('legal_documents').select('*'),
        supabase.from('maintenance_request').select('*').eq('company_id', user.id),
        supabase.from('leads').select('*').eq('company_id', user.id),
        supabase.from('notification').select('*').eq('company_id', user.id).order('created_at', { ascending: false })
      ])

      setProperties(propRes.data ?? [])
      setTenants(tenantRes.data ?? [])
      setListings(listingRes.data ?? [])
      setAppointments(appointRes.data ?? [])
      setRentPayments(paymentRes.data ?? [])
      setLegalDocuments(legalRes.data ?? [])
      setMaintenanceRequests(maintenanceRes.data ?? [])
      setLeads(leadsRes.data ?? [])
      setNotifications(notifRes.data ?? [])

      setStats({
        properties: propRes.data?.length ?? 0,
        tenants: tenantRes.data?.length ?? 0,
        listings: listingRes.data?.length ?? 0,
        occupiedProperties: propRes.data?.filter(p => p.status === 'Occupied').length ?? 0,
        activeLeases: propRes.data?.filter(p => p.lease_end && new Date(p.lease_end) > new Date()).length ?? 0
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard data')
    }
  }

  useEffect(() => { fetchAllData() }, [user?.id])

  const markNotificationsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    await supabase.from('notification').update({ read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // ---------- Render Content ----------
  const renderContent = () => {
    if (!subscriptionActive) {
      return (
        <motion.div
          key="locked"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center h-full text-center p-8"
        >
          <div className="bg-white rounded-2xl p-8 shadow max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#302cfc] mb-4">Premium Required</h2>
            <p className="text-gray-700 mb-6">You must be on a premium plan to access this dashboard.</p>
          </div>
        </motion.div>
      )
    }   

  

    switch (activeTab) {
      case 'home':
        return (
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
              <StatCard icon={<Building />} title="Properties" value={stats.properties} />
              <StatCard icon={<CheckCircle />} title="Listings" value={stats.listings} />
              <StatCard icon={<FileText />} title="Active Leases" value={stats.activeLeases} />
              <StatCard icon={<Bell />} title="Tenants" value={stats.tenants} />
              <StatCard icon={<Bell />} title="Unread Notifications" value={unreadCount} />
              <StatCard icon={<Bell />} title="Occupied Properties" value={stats.occupiedProperties} />
            </div>
          
            {unreadCount > 0 && (
              <div className="bg-yellow-100 text-yellow-900 p-2 rounded-md">
                You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                <button onClick={markNotificationsRead} className="ml-2 underline">Mark all read</button>
              </div>
            )}
          </motion.div>
        )


        
        
          case 'rentAnalytics':
          return (
            <motion.div
              key="rentAnalytics"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Rent Analytics Cards */}
              <h2 className="text-lg font-semibold">Rent Analytics Overview</h2>
              <RentAnalyticsCards />
        
              {/* Rent Analytics Chart */}
              <h2 className="text-lg font-semibold mt-6">Analytics Chart</h2>
              <RentAnalyticsChart />
            </motion.div>
          )
        
        case 'rentReminder':
          return (
            <motion.div
              key="rentReminder"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Rent Reminders */}
              <h2 className="text-lg font-semibold">Rent Reminders</h2>
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
                    companyId={user?.id ?? ''}
                    
          
                    onSuccess={async () => {
                      const { data } = await supabase
                        .from('properties')
                        .select('*')
                        .eq('company_id', user?.id)
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
                    companyId={user?.id ?? ''}
                    onSuccess={async () => {
                      const { data } = await supabase
                        .from('properties')
                        .select('*')
                        .eq('company_id', user?.id)
                      setProperties(data ?? [])
                    }}
                  />
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
                    companyId={user?.id ?? ''}
                    onSuccess={async () => {
                      const { data } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('company_id', user?.id)
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
                    companyId={user?.id ?? ''}
                    onSuccess={async () => {
                      const { data } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('company_id', user?.id)
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
                  companyId={user?.id ?? ''}
                  onSuccess={async () => {
                    const { data } = await supabase
                      .from('appointments')
                      .select('*')
                      .eq('company_id', user?.id)
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
                    companyId={user?.id ?? ''}
                    onSuccess={async () => {
                      const { data } = await supabase
                        .from('rent_payment')
                        .select('*')
                        .eq('company_id', user?.id)
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
                    companyId={user?.id ?? ''}
                    onSuccess={async () => {
                      const { data } = await supabase
                        .from('rent_payment')
                        .select('*')
                        .eq('company_id', user?.id)
                      setRentPayments(data ?? [])
                    }}
                  />
                </motion.div>
              )






        

      // ---------- LEGAL DOCUMENTS ----------
      case 'legalDocuments':
      case 'addDocument':
        return (
          <motion.div key="legalDocuments" className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <LegalDocumentForm companyId={user?.id} onSuccess={fetchAllData} />
            <DataTable columns={documentColumns} data={legalDocuments} />
          </motion.div>
        )

      // ---------- MAINTENANCE ----------
      case 'maintenance':
        return (
          <motion.div key="maintenance" className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <MaintenanceTable companyId={user?.id} />
          </motion.div>
        )

      // ---------- LEADS ----------
      case 'newLeads':
      case 'contactedLeads':
        return (
          <motion.div key="leads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <LeadsTable companyId={user?.id} />
          </motion.div>
        )

      // ---------- CHAT ----------
           // ---------- CHAT ----------
      case 'chat':
        return (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <RealtorChat companyId={user?.id} />
          </motion.div>
        )

      // ---------- TEAM ----------
      case 'team':
        return (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <TeamAccordion companyId={user?.id} />
          </motion.div>
        )

      // ---------- NOTIFICATIONS ----------
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <button onClick={markNotificationsRead} className="text-blue-600 underline">
                Mark all read
              </button>
            </div>
            {notifications.length > 0 ? notifications.map(n => (
              <div
                key={n.id}
                className={clsx(
                  'p-2 rounded-md mb-2',
                  n.read ? 'bg-gray-100 text-gray-700' : 'bg-[#302cfc] text-white'
                )}
              >
                {n.message}
              </div>
            )) : <p className="text-gray-500">No notifications</p>}
          </motion.div>
        )

      // ---------- MANAGE ACCOUNT ----------
      case 'manageAccount':
        return (
          <motion.div
            key="manageAccount"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <ManageAccountForm />
          </motion.div>
        )

      default:
        return <div>Select a section from the sidebar</div>
    }
  }

  if (loading) return <p className="p-8 text-center text-gray-800">Loading dashboard...</p>

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR — Desktop */}
      <div className="hidden md:block">
        <CompanySidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* MOBILE HAMBURGER BUTTON */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE SLIDE-IN SIDEBAR */}
      <div
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <CompanySidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* MAIN CONTENT */}
      <main
        className={clsx(
          "flex-1 p-4 md:p-6 transition-all duration-300",
          !subscriptionActive && "blur-sm pointer-events-none select-none"
        )}
      >
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {countdown && !expired && (
              <div className="bg-yellow-400 text-black px-3 py-1 rounded font-mono text-sm">
                {countdown}
              </div>
            )}
            <div className="text-sm text-gray-700">
              Plan: <span className="font-medium">{plan ?? "free"}</span>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT AREA */}
        <div className="flex-1 overflow-x-auto">
          <AnimatePresence mode='wait' initial={false}>
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>



       ⚠ Subscription Modal *

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