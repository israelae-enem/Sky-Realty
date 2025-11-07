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
  const [expandedId, setExpandedId] = useState<string | null>(null)


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
    <div className="bg-gray-100 rounded-lg p-4 text-gray-800 ">
      <h2 className="text-2xl font-semibold mb-4 text-[#302cfc]">Maintenance Requests</h2>

      <div className='hidden md:block overflow-x-auto'></div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className='bg-gray-100 text-gray-800'>
            <th className="px-4 py-2 border border-gray-300">Title</th>
            <th className="px-4 py-2 border-gray-300 border">Description</th>
            <th className="px-4 py-2 border border-gray-300">Status</th>
            <th className="px-4 py-2 border border-gray-300">Priority</th>
            <th className="px-4 py-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="hover:bg-gray-600">
              <td className="border px-4 py-2">{r.title}</td>
              <td className="border px-4 py-2">{r.description}</td>
              <td className="border px-4 py-2">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="w-full bg-gray-100 text-gray-800 px-2 py-1 rounded"
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

      {/* 📱 Mobile Cards */}

      <div className="md:hidden flex flex-col space-y-4">
  {requests.map((r) => {
    const isOpen = expandedId === r.id
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-700'
        case 'in_progress':
          return 'bg-yellow-700'
        default:
          return 'bg-red-700'
      }
    }

    return (
      <div
        key={r.id}
        className="bg-gray-100 rounded-lg border border-gray-300 overflow-hidden transition-all duration-300"
      >
        {/* Collapsible Header */}
        <button
          onClick={() => setExpandedId(isOpen ? null : r.id)}
          className="w-full flex justify-between items-center p-4 text-white"
        >
          <h3 className="font-semibold text-[#302cfc] text-left">{r.title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded capitalize ${
              r.status === 'completed'
                ? 'bg-green-600'
                : r.status === 'in_progress'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
          >
            {r.status.replace('_', ' ')}
          </span>
        </button>

        {/* Expanded Section */}
        {isOpen && (
          <div className="flex flex-col space-y-3 p-4 pt-0 border-t border-gray-300">
            <p className="text-white text-sm">{r.description}</p>

            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Priority:</span>
              <span className="text-white text-sm">{r.priority || 'Medium'}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Attachment:</span>
              {r.media_url ? (
                <a
                  href={r.media_url}
                  target="_blank"
                  className="text-blue-600 text-sm underline"
                >
                  View Attachment
                </a>
              ) : (
                <span className="text-gray-800 text-sm">No file</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-gray-800 text-sm">Status:</span>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value)}
                className={`text-white text-sm px-2 py-1 rounded mt-1 transition-colors ${getStatusColor(
                  r.status
                )}`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>
    )
  })}

  {!requests.length && !loading && (
    <p className="text-gray-400 text-center">No maintenance requests yet.</p>
  )}
</div>

         {loading && <p className="mt-2 text-gray-400">Loading...</p>}
    </div>
  )
}