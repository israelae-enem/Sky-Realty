'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient' // Your Supabase client

interface Notification {
  id: string
  type: 'tenant_invite' | string
  message: string
  tenant_id?: string
  realtor_id: string
  status: 'pending' | 'accepted' | 'denied'
  created_at: string
}

const TenantRequest = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [realtorId, setRealtorId] = useState<string | null>(null)

  // ✅ Get current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setRealtorId(user.id)
    }
    fetchUser()
  }, [])

  // ✅ Fetch notifications and subscribe to realtime
  useEffect(() => {
    if (!realtorId) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error(error.message)
        return
      }
      setNotifications(data || [])
    }

    fetchNotifications()

    const subscription = supabase
      .channel(`public:notifications:realtor_id=eq.${realtorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `realtor_id=eq.${realtorId}`,
        },
        (payload: {new: Notification}) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [realtorId])

  const handleDecision = async (notif: Notification, decision: 'accepted' | 'denied') => {
    try {
      // ✅ Update tenant status
      if (notif.tenant_id) {
        const { error: tenantError } = await supabase
          .from('tenants')
          .update({ status: decision === 'accepted' ? 'active' : 'denied' })
          .eq('id', notif.tenant_id)
        if (tenantError) throw tenantError
      }

      // ✅ Update notification status
      const { error: notifError } = await supabase
        .from('notification')
        .update({ status: decision })
        .eq('id', notif.id)
      if (notifError) throw notifError

      toast.success(`Tenant ${decision}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:text-black text-white bg-[#302cfc]"
      >
        <Bell size={18} />
        <span>Requests</span>
      </button>

      {open && (
        <div className="absolute top-12 right-0 bg-black rounded p-4 shadow w-80 z-40 max-h-96 overflow-auto border border-gray-700">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="mb-3 border-b border-gray-700 pb-2 text-white">
                <p className="text-sm font-semibold">{n.message}</p>
                {n.type === 'tenant_invite' && n.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDecision(n, 'accepted')}
                      className="px-3 py-1 bg-green-600 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(n, 'denied')}
                      className="px-3 py-1 bg-red-600 rounded text-sm"
                    >
                      Deny
                    </button>
                  </div>
                )}
                {n.status !== 'pending' && (
                  <p className="text-xs text-gray-400">Status: {n.status}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-white">No Requests</p>
          )}
        </div>
      )}
    </div>
  )
}

export default TenantRequest