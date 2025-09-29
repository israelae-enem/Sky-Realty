'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import StatCard from '@/components/StatCard'
import { Building, CheckCircle, FileText, Home, Users, Calendar, MessageCircle, Bell, RefreshCw } from 'lucide-react'
import { RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RentAnalyticsCards from '@/components/RentAnalyticsCards'
import RentAnalyticsChart from '@/components/RentAnalyticsChart'
import RentReminders from '@/components/RentReminder'

import PropertyTable from '@/components/PropertyTable'
import AppointmentTable from '@/components/AppointmentTable'
import TenantTable from '@/components/TenantTable'
import RentPaymentTable from '@/components/RentPaymentTable'
import MaintenanceTable from '@/components/MaintenanceTable'

import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import LegalDocumentsTable from '@/components/LegalDocumentTable'
import Profile from '@/components/Profile'

interface Stats {
  properties: number
  occupied: number
  leases: number
}

type PlanType = 'free'| 'basic' | 'pro' | 'premium' | null

interface Tenant {
  id: string
  full_name: string | null
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  created_at: string
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
  const [plan, setPlan] = useState<PlanType>()
  const [propertyLimit, setPropertyLimit] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const handleRefresh = async () => {
    setLoading(true)
    await router.refresh()
    setLoading(false)
  }

  // ---------------- Notifications ----------------
  const [notifications, setNotifications] = useState<Notification[]>([])
  const unreadCount = notifications.filter((n) => !n.read).length

  // ---------------- Chat ----------------
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ---------------- Fetch subsc


   useEffect(() => {
  if (!user?.id) return;

  const PLAN_LIMITS: Record<string, number | null> = {
    free: 1,      // Fallback free plan
    basic: 10,
    pro: 20,
    premium: Infinity, // Unlimited
  };

  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/ziina?user=${user.id}`);
      if (!res.ok) throw new Error(`Failed to fetch subscription: ${res.status}`);
      const data = await res.json();

      // Ziina API returns plan IDs in lowercase: "basic", "pro", "premium"
      const planId: string = data?.plan ?? "free"; // Fallback to free
      const limit = PLAN_LIMITS[planId] ?? 1;

      setPlan(planId as PlanType); // PlanType should include 'free', 'basic', 'pro', 'premium'
      setPropertyLimit(limit);
    } catch (err) {
      console.error("❌ Failed to load subscription:", err);
      // Fallback to Free Plan
      setPlan("free");
      setPropertyLimit(1);
    } finally {
      setLoading(false);
    }
  };

  fetchPlan();
}, [user?.id]);


  // ---------------- Fetch properties, tenants, notifications ----------------
  useEffect(() => {
    const initData = async () => {
      if (!user?.id) return
      const realtorId = user.id
      setLoading(true)

      try {
        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', realtorId)
        updateStats(properties ?? [])

        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .eq('realtor_id', realtorId)
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

  // ---------------- Chat with selected tenant ----------------
  useEffect(() => {
    if (!selectedTenant || !user?.id) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedTenant.id}),and(sender_id.eq.${selectedTenant.id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (!error && data) setMessages(data)
    }

    fetchMessages()

    const subscription = supabase
      .channel(`message-${user.id}-${selectedTenant.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        (payload) => {
          const m = payload.new as Message
          if (
            (m.sender_id === user.id && m.receiver_id === selectedTenant.id) ||
            (m.sender_id === selectedTenant.id && m.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, m])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [selectedTenant, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const updateStats = (properties: any[]) => {
    const total = properties.length
    const occupied = properties.filter((p) => p.status === 'Occupied').length
    const activeLeases = properties.filter(
      (p) => p.lease_end && new Date(p.lease_end) > new Date()
    ).length
    setStats({ properties: total, occupied, leases: activeLeases })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTenant) return
    const { error } = await supabase.from('message').insert([
      {
        sender_id: user?.id,
        receiver_id: selectedTenant.id,
        message: newMessage.trim(),
      },
    ])
    if (!error) setNewMessage('')
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
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-700 p-4 flex flex-col">
        <h2 className="text-xl font-bold text-[#302cfc] mb-6">Sky Realty</h2>
        <nav className="flex flex-col gap-2">
          <Link href="#properties" className="hover:text-[#302cfc]">Properties</Link>
          <Link href="#tenants" className="hover:text-[#302cfc]">Your Tenants</Link>
          <Link href="#rent-payments" className="hover:text-[#302cfc]">Rent Tracking</Link>
          <Link href="#maintenance" className="hover:text-[#302cfc]">Maintenance Requests</Link>
          <Link href="#notifications" className="hover:text-[#302cfc]">Notifications</Link>
          <Link href="#chat" className="hover:text-[#302cfc]">Chats</Link>
          <Link href="#appointments" className="hover:text-[#302cfc]">Appointments</Link>
          <Link href="#rent-analytics" className="hover:text-[#302cfc]">Rent Analytics</Link>          
          <Link href="/legal-doc" className="hover:text-[#302cfc]">Documents Templates</Link>
          <Link href="#legal-docs" className="hover:text-[#302cfc]">Your Documents</Link>




        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-8 overflow-y-auto bg-black">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#302cfc]">Welcome, {user?.firstName || 'Realtor'}</h1>

         <div className='flex items-center gap-4'>
          <button onClick={handleRefresh} className="bg-[#302cfc] hover:bg-[#241fd9] px-4 py-2 rounded flex items-center gap-4 justify-end">
            <RotateCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Profile />
          </div>


        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <StatCard icon={<Building />} title={`Properties ${plan ? `(Plan: ${plan})` : ''}`} value={stats.properties} />
          <StatCard icon={<CheckCircle />} title="Occupied Units" value={stats.occupied} />
          <StatCard icon={<FileText />} title="Active Leases" value={stats.leases} />
          <StatCard icon={<Bell />} title="Unread Notifications" value={unreadCount} />
        </div>

        {/* Rent Analytics */}
        <div id="rent-analytics">
          <RentAnalyticsCards />
          <RentAnalyticsChart />
          <RentReminders />
        </div>

        {/* Accordion for tables */}
        <Accordion type="single" collapsible className="w-full mt-8 space-y-6">
          <AccordionItem value="properties">
            <AccordionTrigger id="properties" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Home size={18} /> Properties
            </AccordionTrigger>
            <AccordionContent>
              <PropertyTable plan={plan ?? null} propertyLimit={propertyLimit} realtorId={user?.id!} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tenants">
            <AccordionTrigger id="tenants" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Users size={18} /> Tenants
            </AccordionTrigger>
            <AccordionContent>
              <TenantTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rent-payments">
            <AccordionTrigger id="rent-payments" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FileText size={18} /> Rent Payments
            </AccordionTrigger>
            <AccordionContent>
              <RentPaymentTable />
            </AccordionContent>
          </AccordionItem>

                    <AccordionItem value="maintenance">
            <AccordionTrigger id="maintenance" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FileText size={18} /> Maintenance Requests
            </AccordionTrigger>
            <AccordionContent>
              <MaintenanceTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications">
            <AccordionTrigger id="notifications" className="text-lg font-semibold text-blue-600 flex items-center gap-2" onClick={markNotificationsRead}>
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

          <AccordionItem value="chat">
            <AccordionTrigger id="chat" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <MessageCircle size={18} /> Chat
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <select
                value={selectedTenant?.id || ''}
                onChange={(e) => {
                  const tenant = tenants.find((t) => t.id === e.target.value) ?? null
                  setSelectedTenant(tenant)
                  setMessages([])
                }}
                className="w-full sm:w-1/2 bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none"
              >
                <option value="">Select Tenant</option>
                {tenants.map((t) => {
                  const unread = messages.filter((m) => m.sender_id === t.id && !m.read).length
                  return (
                    <option key={t.id} value={t.id}>
                      {t.full_name || t.id} {unread > 0 ? `(${unread})` : ''}
                    </option>
                  )
                })}
              </select>

              <div className="flex flex-col h-64 sm:h-80 overflow-y-auto p-2 space-y-2 border border-gray-700 rounded-md">
                {selectedTenant ? (
                  messages.length > 0 ? (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-md text-sm max-w-[80%] ${
                          m.sender_id === user?.id ? 'bg-[#302cfc] text-white self-end' : 'bg-gray-700 text-gray-200 self-start'
                        }`}
                      >
                        {m.message}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No messages yet</p>
                  )
                ) : (
                  <p className="text-gray-400 text-sm">Select a tenant to start chatting</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTenant && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded-md text-white font-semibold"
                  >
                    Send
                  </button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="appointments">
            <AccordionTrigger id="appointments" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Calendar size={18} /> Appointments
            </AccordionTrigger>
            <AccordionContent>
              <AppointmentTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>

             <AccordionItem value="legal-docs">
            <AccordionTrigger id="legal-docs" className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Calendar size={18} /> Legal Documents
            </AccordionTrigger>
            <AccordionContent>
              <LegalDocumentsTable realtorId={user?.id ?? ''} />
            </AccordionContent>
          </AccordionItem>


        </Accordion>
      </main>
    </div>
  )
}