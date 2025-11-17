'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface MaintenanceRequest {
  id: string
  tenant_id: string
  property_id: string
  company_id?: string
  title: string
  description: string
  status: string
  priority?: string
  media_url?: string
  created_at: string
}

interface MaintenanceTableProps {
  realtorId?: string
  companyId?: string
}

export default function MaintenanceTable({ realtorId, companyId }: MaintenanceTableProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchRequests = async () => {
    if (!realtorId && !companyId) return
    setLoading(true)
    try {
      let query = supabase.from('maintenance_request').select('*').order('created_at', { ascending: false })

      if (realtorId) {
        // Filter by properties for this realtor
        const { data: properties, error: propertyError } = await supabase
          .from('properties')
          .select('id')
          .eq('realtor_id', realtorId)
        if (propertyError) throw propertyError
        const propertyIds = properties?.map((p) => p.id) || []
        query = query.in('property_id', propertyIds)
      } else if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query
      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!realtorId && !companyId) return

    fetchRequests()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('maintenance-requests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_request' },
        (payload) => {
          const newRequest = payload.new as MaintenanceRequest
          // Filter updates by realtor or company
          if (
            (realtorId && newRequest.property_id) ||
            (companyId && newRequest.company_id === companyId)
          ) {
            setRequests((prev) => [newRequest, ...prev])
            toast.success(`New maintenance request: ${newRequest.title}`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId, companyId])

  return (
    <div className="bg-gray-200 rounded-lg p-4 text-gray-800">
      <h2 className="text-2xl font-tech font-semibold mb-4 text-[#302cfc]">Maintenance Requests</h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-800">
              <th className="px-4 py-2 border border-gray-300">Title</th>
              <th className="px-4 py-2 border border-gray-300">Description</th>
              <th className="px-4 py-2 border border-gray-300">Status</th>
              <th className="px-4 py-2 border border-gray-300">Priority</th>
              <th className="px-4 py-2 border border-gray-300">Attachment</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-gray-300">
                <td className="border px-4 py-2">{r.title}</td>
                <td className="border px-4 py-2">{r.description}</td>
                <td className="border px-4 py-2">{r.status.replace('_', ' ')}</td>
                <td className="border px-4 py-2">{r.priority || 'Medium'}</td>
                <td className="border px-4 py-2">
                  {r.media_url && (
                    <a
                      href={r.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View File
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col space-y-4 mt-4">
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
              className="bg-gray-200 rounded-lg border border-gray-300 overflow-hidden transition-all duration-300"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => setExpandedId(isOpen ? null : r.id)}
                className="w-full flex justify-between items-center p-4 text-white"
              >
                <h3 className="font-semibold text-[#302cfc] text-left">{r.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(r.status)}`}
                >
                  {r.status.replace('_', ' ')}
                </span>
              </button>

              {/* Expanded Section */}
              {isOpen && (
                <div className="flex flex-col space-y-3 p-4 pt-0 border-t border-gray-300">
                  <p className="text-gray-800 text-sm">{r.description}</p>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Priority:</span>
                    <span className="text-gray-800 text-sm">{r.priority || 'Medium'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Attachment:</span>
                    {r.media_url ? (
                      <a
                        href={r.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm underline"
                      >
                        View Attachment
                      </a>
                    ) : (
                      <span className="text-gray-800 text-sm">No file</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-800 text-sm">Status:</span>
                    <span
                      className={`text-gray-800 text-sm px-2 py-1 rounded mt-1 ${getStatusColor(
                        r.status
                      )}`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {!requests.length && !loading && (
          <p className="text-gray-700 text-center">No maintenance requests yet.</p>
        )}
      </div>

      {loading && <p className="mt-2 text-gray-800">Loading...</p>}
    </div>
  )
}