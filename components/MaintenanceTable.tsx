'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { OpenAI } from 'openai'

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

export default function MaintenanceTable({ realtorId}: MaintenanceTableProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(false)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('maintenance_request')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error

      // Auto AI-priority assignment
      const updatedRequests = await Promise.all(
        data!.map(async (r) => {
          if (!r.priority) {
            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are an AI assistant that classifies maintenance requests priority as High, Medium, or Low based on title and description.'
                  },
                  {
                    role: 'user',
                    content: `Title: ${r.title}\nDescription: ${r.description}\nOutput only the priority: High, Medium, or Low.`
                  }
                ],
                max_tokens: 10
              })

              const priority = completion.choices?.[0].message?.content?.trim() || 'Medium'

              await supabase
                .from('maintenance_request')
                .update({ priority })
                .eq('id', r.id)

              return { ...r, priority }
            } catch (err) {
              console.error('AI priority error', err)
              return { ...r, priority: 'Medium' }
            }
          }
          return r
        })
      )

      setRequests(updatedRequests)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch maintenance requests')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('maintenance_request').update({ status }).eq('id', id)
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