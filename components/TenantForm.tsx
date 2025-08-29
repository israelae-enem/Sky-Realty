'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const TenantForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const inviteId = searchParams.get('inviteId')

  const [loading, setLoading] = useState(true)
  const [inviteData, setInviteData] = useState<any>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [realtors, setRealtors] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [selectedRealtor, setSelectedRealtor] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [error, setError] = useState('')

  // Fetch invite if present
  useEffect(() => {
    const fetchInvite = async () => {
      if (!inviteId) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('id', inviteId)
        .single()

      if (error || !data) {
        setError('Invalid or expired invite.')
      } else if (data.status !== 'pending') {
        setError('This invite has already been used or is no longer valid.')
      } else {
        setInviteData(data)
      }

      setLoading(false)
    }

    fetchInvite()
  }, [inviteId])

  // Fetch Realtors
  useEffect(() => {
    const fetchRealtors = async () => {
      const { data, error } = await supabase.from('realtors').select('*')
      if (!error && data) setRealtors(data)
    }
    fetchRealtors()
  }, [])

  // Fetch properties for selected realtor
  useEffect(() => {
    if (!selectedRealtor) return
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('realtor_id', selectedRealtor)

      if (!error && data) setProperties(data)
    }
    fetchProperties()
  }, [selectedRealtor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName || !phone || (!inviteData && (!email || !selectedRealtor || !selectedProperty))) {
      setError('Please fill in all fields.')
      return
    }

    try {
      if (inviteData) {
        // Accept invite
        const { error: insertError } = await supabase.from('tenants').insert({
          full_name: fullName,
          phone,
          email: inviteData.email,
          property_id: inviteData.property_id,
          realtor_id: inviteData.realtor_id,
          invite_id: inviteData.id,
          status: 'active',
          created_at: new Date().toISOString(),
        })

        if (insertError) throw insertError

        await supabase
          .from('invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', inviteData.id)

        toast.success('✅ Welcome aboard! You are now linked to your property.')
      } else {
        // Manual request
        const { error: insertError } = await supabase.from('tenants').insert({
          full_name: fullName,
          phone,
          email,
          property_id: selectedProperty,
          realtor_id: selectedRealtor,
          status: 'pending',
          created_at: new Date().toISOString(),
        })

        if (insertError) throw insertError
        toast.success('✅ Request sent! Waiting for realtor approval.')
      }

      // Redirect after success
      router.push('/tenantdashboard')
    } catch (err: any) {
      console.error('Tenant onboarding error:', err)
      setError(err.message || 'Failed to complete onboarding.')
      toast.error(err.message || 'Failed to complete onboarding.')
    }
  }

  if (loading) return <p className="p-8 text-center text-white">Loading...</p>
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-black rounded shadow text-white">
      <h1 className="text-2xl font-bold mb-4">Tenant Onboarding</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-300 text-white"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-300 text-white"
        />

        {!inviteData && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-black border border-gray-300 text-white"
            />

            <select
              value={selectedRealtor}
              onChange={(e) => setSelectedRealtor(e.target.value)}
              className="w-full p-2 rounded bg-black border border-gray-300 text-white"
            >
              <option value="">Select Realtor</option>
              {realtors.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.email}
                </option>
              ))}
            </select>

            {selectedRealtor && (
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full p-2 rounded bg-black border border-gray-300 text-white"
              >
                <option value="">Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address || p.description}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded text-white font-semibold"
        >
          {inviteData ? 'Complete Onboarding' : 'Request Access'}
        </button>
      </form>
    </div>
  )
}

export default TenantForm