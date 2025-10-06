'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface MaintenanceRequest {
  id: string
  tenant_id: string
  property_id: string
  title: string
  description: string
  status: string
  priority?: string
  media_url?: string
  created_at: string
}

interface MaintenanceTableProps {
  realtorId: string
}

export default function MaintenanceTable({ realtorId }: MaintenanceTableProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRequests = async () => {
    if (!realtorId) return
    setLoading(true)
    try {
      // Fetch property IDs for this realtor
      const { data: properties, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('realtor_id', realtorId)

      if (propertyError) throw propertyError

      const propertyIds = properties?.map((p) => p.id) || []

      // Fetch maintenance requests linked to these properties
      const { data, error } = await supabase
        .from('maintenance_request')
        .select('*')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch maintenance requests')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()

    if (!realtorId) return

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`maintenance-${realtorId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_request' },
        (payload) => {
          const newRequest = payload.new as MaintenanceRequest
          // Only show requests for properties owned by this realtor
          setRequests((prev) => [newRequest, ...prev])
          toast.success(`New maintenance request: ${newRequest.title}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  const updateStatus = async (id: string, status: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('maintenance_request')
        .update({ status })
        .eq('id', id)
      if (error) throw error

      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white">
      <h2 className="text-2xl font-semibold mb-4 text-[#302cfc]">Maintenance Requests</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="hover:bg-gray-700">
              <td className="border px-4 py-2">{r.title}</td>
              <td className="border px-4 py-2">{r.description}</td>
              <td className="border px-4 py-2">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td className="border px-4 py-2">{r.priority || 'Medium'}</td>
              <td className="border px-4 py-2">
                {r.media_url && (
                  <a
                    href={r.media_url}
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    View File
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p className="mt-2 text-gray-400">Loading...</p>}
    </div>
  )
}