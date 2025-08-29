'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type PropertyStatus = 'Vacant' | 'Occupied' | 'Pending'

export interface Property {
  id: string
  title: string
  address: string
  status: PropertyStatus
  lease_start: string | null
  lease_end: string | null
  lease_file: string | null
  realtor_id: string
  created_at: string
}

export interface Subscription {
  plan: 'basic' | 'pro' | 'premium'
  current_period_end?: string
}

const PLAN_LIMITS: Record<Subscription['plan'], number | 'unlimited'> = {
  basic: 5,
  pro: 10,
  premium: 'unlimited',
}

export default function PropertyTable({ realtorId }: { realtorId: string | null }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [newProperty, setNewProperty] = useState<Omit<Property, 'id' | 'created_at'>>({
    title: '',
    address: '',
    status: 'Vacant',
    lease_start: '',
    lease_end: '',
    lease_file: null,
    realtor_id: realtorId ?? '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Keep realtor_id in sync
  useEffect(() => {
    setNewProperty((prev) => ({ ...prev, realtor_id: realtorId ?? '' }))
  }, [realtorId])

  // Fetch subscription
  useEffect(() => {
    if (!realtorId) return
    const fetchSub = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', realtorId)
        .single()
      if (!error && data) setSubscription(data)
    }
    fetchSub()
  }, [realtorId])

  // Fetch properties + realtime subscription
  useEffect(() => {
    if (!realtorId) return

    let mounted = true
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false })
      if (!error && mounted) setProperties(data ?? [])
    }

    fetchProperties()

    const channel = supabase
      .channel(`properties-realtor-${realtorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties', filter: `realtor_id=eq.${realtorId}` },
        () => fetchProperties()
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  // Add new property
  const addProperty = async () => {
    if (!realtorId || !newProperty.title.trim()) return

    if (subscription) {
      const limit = PLAN_LIMITS[subscription.plan]
      if (limit !== 'unlimited' && properties.length >= limit) {
        alert(`You have reached your ${subscription.plan} plan limit of ${limit} properties.`)
        return
      }
    } else {
      alert('No subscription found. Please subscribe to add properties.')
      return
    }

    try {
      setIsAdding(true)
      const payload = { ...newProperty, realtor_id: realtorId, created_at: new Date().toISOString() }
      const { data, error } = await supabase.from('properties').insert([payload]).select().single()
      if (error) throw error

      setProperties((prev) => (data ? [data, ...prev] : prev))

      setNewProperty({
        title: '',
        address: '',
        status: 'Vacant',
        lease_start: '',
        lease_end: '',
        lease_file: null,
        realtor_id: realtorId,
      })
    } catch (err: any) {
      console.error('addProperty error', err)
      alert('Failed to add property: ' + err.message)
    } finally {
      setIsAdding(false)
    }
  }

  // Save edits
  const saveEdit = async (id: string, field: keyof Property, value: string) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    const { error } = await supabase.from('properties').update({ [field]: value }).eq('id', id)
    if (error) alert('Failed to save changes.')
  }

  // Delete property
  const deleteProperty = async (id: string) => {
    if (!confirm('Delete this property?')) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) return alert('Failed to delete property.')
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="bg-black p-4 border-gray-300 border rounded-lg mt-8">
      <h2 className="text-xl font-semibold mb-4">Properties</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Lease Start</th>
            <th className="p-2 text-left">Lease End</th>
            <th className="p-2 text-left">Lease File</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr key={prop.id} className="border-b hover:bg-gray-700/50">
              {(['title', 'address', 'status', 'lease_start', 'lease_end'] as (keyof Property)[]).map((field) => (
                <td key={field} className="p-2">
                  {editingId === prop.id ? (
                    field === 'status' ? (
                      <select
                        value={(prop[field] as PropertyStatus) || 'Vacant'}
                        onChange={(e) => saveEdit(prop.id, field, e.target.value)}
                        className="bg-black border-gray-300 p-1 rounded-md border w-full"
                      >
                        <option value="Vacant">Vacant</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Pending">Pending</option>
                      </select>
                    ) : (
                      <input
                        type={field.includes('lease') ? 'date' : 'text'}
                        value={(prop[field] as string) || ''}
                        onChange={(e) => saveEdit(prop.id, field, e.target.value)}
                        className="bg-black p-1 rounded-md border border-gray-300 w-full"
                      />
                    )
                  ) : (
                    (prop[field] as string) || '-'
                  )}
                </td>
              ))}
              <td className="p-2 text-center">
                {prop.lease_file ? (
                  <a href={prop.lease_file} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    View Lease
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="p-2 flex gap-2 justify-center">
                {editingId === prop.id ? (
                  <button onClick={() => setEditingId(null)} className="bg-green-500 px-2 py-1 rounded text-white">
                    Done
                  </button>
                ) : (
                  <button onClick={() => setEditingId(prop.id)} className="bg-blue-500 px-2 py-1 rounded text-white">
                    Edit
                  </button>
                )}
                <button onClick={() => deleteProperty(prop.id)} className="bg-red-500 px-2 py-1 rounded text-white">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Add new property row */}
          <tr>
            <td className="p-2">
              <input
                type="text"
                placeholder="Title"
                value={newProperty.title}
                onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                className="bg-black border border-gray-300 rounded-md p-1 w-full"
              />
            </td>
            <td className="p-2">
              <input
                type="text"
                placeholder="Address"
                value={newProperty.address}
                onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                className="bg-black border-gray-300 p-1 rounded-md border w-full"
              />
            </td>
            <td className="p-2">
              <select
                value={newProperty.status}
                onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value as PropertyStatus })}
                className="bg-black p-1 rounded-md border-gray-300 border w-full"
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Pending">Pending</option>
              </select>
            </td>
            <td className="p-2">
              <input
                type="date"
                value={newProperty.lease_start || ''}
                onChange={(e) => setNewProperty({ ...newProperty, lease_start: e.target.value })}
                className="bg-black p-1 rounded-md border-gray-300 border w-full"
              />
            </td>
            <td className="p-2">
              <input
                type="date"
                value={newProperty.lease_end || ''}
                onChange={(e) => setNewProperty({ ...newProperty, lease_end: e.target.value })}
                className="bg-black p-1 rounded-md border-gray-300 border w-full"
              />
            </td>
            <td className="p-2 text-center">-</td>
            <td className="p-2">
              <button
                onClick={addProperty}
                className="bg-[#302cfc] px-2 py-1 rounded text-white w-full"
                disabled={isAdding}
              >
                {isAdding ? 'Adding…' : 'Add'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-gray-400 text-sm italic">
        Tip: You can drag & drop lease files directly onto a property row to upload.
      </p>
    </div>
  )
}