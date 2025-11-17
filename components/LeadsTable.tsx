// components/LeadsTable.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import LeadViewModal from '@/components/LeadViewModal'

// If you have a DataTable component, it'll be used. Otherwise fallback to native table.
// import { DataTable } from '@/components/DataTable' // uncomment if you want DataTable
// import { leadColumns } from '@/lib/columns/lead-columns' // optional - you have your own columns

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
}

interface Props {
  realtorId?: string | null
  companyId?: string | null
  onLoaded?: (leads: Lead[]) => void
}

export default function LeadsTable({ realtorId = null, companyId = null, onLoaded }: Props) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      let q = supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (realtorId) q = q.eq('realtor_id', realtorId)
      else if (companyId) q = q.eq('company_id', companyId)

      const { data, error } = await q
      if (error) throw error
      setLeads(data ?? [])
      if (onLoaded) onLoaded(data ?? [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    // Realtime subscription to new leads for this owner
    let channel: any = null
    const ownerCol = realtorId ? 'realtor_id' : 'company_id'
    const ownerId = realtorId ?? companyId
    if (ownerId) {
      channel = supabase
        .channel(`leads-${ownerId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
          const newLead = payload.new as Lead
          // ensure it belongs to this owner
          if ((newLead as any)[ownerCol] === ownerId) setLeads((p) => [newLead, ...p])
        })
        .subscribe()
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtorId, companyId])

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Leads</h3>
        <div className="text-sm text-gray-500">{loading ? 'Loading...' : `${leads.length} lead(s)`}</div>
      </div>

      {/* If you have a DataTable component + leadColumns, use it:
          <DataTable columns={leadColumns} data={leads} />
        Otherwise, native table: */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-sm">Name</th>
              <th className="px-3 py-2 text-sm">Email</th>
              <th className="px-3 py-2 text-sm">Phone</th>
              <th className="px-3 py-2 text-sm">Status</th>
              <th className="px-3 py-2 text-sm">Submitted</th>
              <th className="px-3 py-2 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{l.name}</td>
                <td className="px-3 py-2">{l.email}</td>
                <td className="px-3 py-2">{l.phone}</td>
                <td className="px-3 py-2">{l.status}</td>
                <td className="px-3 py-2">{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => { setSelected(l); setModalOpen(true) }}
                    className="text-blue-600 underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {!leads.length && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeadViewModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        lead={selected ?? undefined}
        onStatusUpdated={() => {
          // refresh or update locally
          fetchLeads()
        }}
      />
    </div>
  )
}