// components/LeadViewModal.tsx
'use client'

import React from 'react'
import LeadStatusForm from '@/components/forms/LeadStatusForm'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at?: string
}

interface Props {
  open: boolean
  onClose: () => void
  lead?: Lead | null
  onStatusUpdated?: () => void
}

export default function LeadViewModal({ open, onClose, lead, onStatusUpdated }: Props) {
  if (!open || !lead) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white max-w-xl w-full rounded-md p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Lead details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Submitted</div>
            <div className="text-xs text-gray-700">{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</div>
          </div>

          <LeadStatusForm lead={lead} onSuccess={() => { if (onStatusUpdated) onStatusUpdated(); onClose(); }} />
        </div>
      </div>
    </div>
  )
}