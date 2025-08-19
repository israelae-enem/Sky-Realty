'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { toast } from 'sonner'

const TenantRequest = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(
      collection(db, 'notifications'),
      where('realtor_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setNotifications(notifs)
    })

    return () => unsub()
  }, [])

  const handleDecision = async (notif: any, decision: 'accepted' | 'denied') => {
    try {
      // Update tenant status
      await updateDoc(doc(db, 'tenants', notif.tenant_id), {
        status: decision === 'accepted' ? 'active' : 'denied',
      })

      // Update notification status
      await updateDoc(doc(db, 'notifications', notif.id), {
        status: decision,
      })

      toast.success(`Tenant ${decision}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border btn-primary border-gray-300 hover:text-black text-gray-200"
      >
        <Bell size={18} />
        <span>Requests</span>
      </button>

      {open && (
        <div className="absolute top-12 right-0 bg-gray-800 rounded p-4 shadow w-80 z-40 max-h-96 overflow-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="mb-3 border-b border-gray-700 pb-2">
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
            <p className="text-sm">No Requests</p>
          )}
        </div>
      )}
    </div>
  )
}

export default TenantRequest