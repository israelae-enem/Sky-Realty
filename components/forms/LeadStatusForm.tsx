// components/LeadStatusForm.tsx
'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at?: string
}

interface Props {
  lead: Lead
  onSuccess?: () => void
}

export default function LeadStatusForm({ lead, onSuccess }: Props) {
  const [status, setStatus] = useState<string>(lead.status || 'New')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', lead.id)
      if (error) throw error
      toast.success('Lead status updated')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-600">Name</label>
        <input className="w-full p-2 border rounded bg-gray-100" value={lead.name} readOnly />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Email</label>
        <input className="w-full p-2 border rounded bg-gray-100" value={lead.email} readOnly />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Phone</label>
        <input className="w-full p-2 border rounded bg-gray-100" value={lead.phone} readOnly />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border rounded">
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <Button type="submit" disabled={loading} className="bg-[#302cfc] text-white">
        {loading ? 'Saving...' : 'Update Status'}
      </Button>
    </form>
  )
}