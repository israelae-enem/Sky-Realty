'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MaintenanceRequest {
  id: string
  property_id: string
  tenant_name: string
  priority: string
  status: string
  description?: string
}

interface RentTracking {
  id: string
  tenant_name: string
  property_id: string
  amount_due: number
  due_date: string
  payment_status: string
}

type Props = {
  realtorId: string
}

const CollapsibleDashboardSections = ({ realtorId }: Props) => {
  const [showMaintenance, setShowMaintenance] = useState(false)
  const [showRentTracking, setShowRentTracking] = useState(false)
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [rentTrackingList, setRentTrackingList] = useState<RentTracking[]>([])
  const [loadingMaintenance, setLoadingMaintenance] = useState(false)
  const [loadingRentTracking, setLoadingRentTracking] = useState(false)

  // 🔹 Fetch Maintenance Requests
  const fetchMaintenance = async () => {
    setLoadingMaintenance(true)
    const { data, error } = await supabase
      .from('maintenance_request')
      .select('*')
      .eq('realtor_id', realtorId)

    if (!error && data) {
      setMaintenanceRequests(data as MaintenanceRequest[])
    }
    setLoadingMaintenance(false)
  }

  // 🔹 Fetch Rent Tracking
  const fetchRentTracking = async () => {
    setLoadingRentTracking(true)
    const { data, error } = await supabase
      .from('rent_tracking')
      .select('*')
      .eq('realtor_id', realtorId)

    if (!error && data) {
      setRentTrackingList(data as RentTracking[])
    }
    setLoadingRentTracking(false)
  }

  // 🔹 Realtime subscription for Maintenance
  useEffect(() => {
    if (!realtorId || !showMaintenance) return
    fetchMaintenance()

    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_request' },
        () => {
          fetchMaintenance()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId, showMaintenance])

  // 🔹 Realtime subscription for Rent Tracking
  useEffect(() => {
    if (!realtorId || !showRentTracking) return
    fetchRentTracking()

    const channel = supabase
      .channel('rent-tracking-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rent_tracking' },
        () => {
          fetchRentTracking()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId, showRentTracking])

  return (
    <div className="space-y-6 mt-8">
      {/* Maintenance Requests */}
      <section className="border rounded bg-black border-gray-300">
        <button
          onClick={() => setShowMaintenance(v => !v)}
          className="w-full px-4 py-3 flex justify-between items-center text-lg font-semibold text-[#302cfc]"
        >
          Maintenance Requests {showMaintenance ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showMaintenance && (
          <div className="overflow-x-auto p-4 text-white">
            {loadingMaintenance ? (
              <p>Loading...</p>
            ) : maintenanceRequests.length === 0 ? (
              <p>No maintenance requests found.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Tenant</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.map(req => (
                    <tr key={req.id} className="border-t border-gray-300">
                      <td className="px-3 py-2">{req.id}</td>
                      <td className="px-3 py-2">{req.property_id}</td>
                      <td className="px-3 py-2">{req.tenant_name}</td>
                      <td className="px-3 py-2">{req.priority}</td>
                      <td className="px-3 py-2">{req.status}</td>
                      <td className="px-3 py-2">
                        <button className="text-sm text-green-400 hover:underline">
                          Mark Done
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* Rent Tracking */}
      <section className="border rounded bg-black border-gray-300">
        <button
          onClick={() => setShowRentTracking(v => !v)}
          className="w-full px-4 py-3 flex justify-between items-center text-lg font-semibold text-[#302cfc]"
        >
          Rent Tracking {showRentTracking ? <ChevronUp /> : <ChevronDown />}
        </button>
        {showRentTracking && (
          <div className="overflow-x-auto p-4 text-white">
            {loadingRentTracking ? (
              <p>Loading...</p>
            ) : rentTrackingList.length === 0 ? (
              <p>No rent tracking records found.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Tenant</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Amount Due</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentTrackingList.map(r => (
                    <tr key={r.id} className="border-t border-gray-300">
                      <td className="px-3 py-2">{r.tenant_name}</td>
                      <td className="px-3 py-2">{r.property_id}</td>
                      <td className="px-3 py-2">${r.amount_due.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        {new Date(r.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{r.payment_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default CollapsibleDashboardSections