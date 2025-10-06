'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

const TenantForm = () => {
  const router = useRouter()
  const { user } = useUser()

  const [loading, setLoading] = useState(true)
  const [full_name, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [realtors, setRealtors] = useState<any[]>([])
  const [searchProperty, setSearchProperty] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [searchRealtor, setSearchRealtor] = useState('')
  const [selectedRealtor, setSelectedRealtor] = useState<any>(null)
  const [error, setError] = useState('')

  // ---------------- Check if tenant already exists ----------------
  useEffect(() => {
    const checkTenant = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const { data: existing } = await supabase
        .from('tenants')
        .select('*')
        .or(`id.eq.${user.id},email.eq.${user.primaryEmailAddress?.emailAddress}`)
        .single()

      if (existing) {
        // If Clerk id not linked yet, update row
        if (!existing.id || existing.id !== user.id) {
          await supabase
            .from('tenants')
            .update({ id: user.id })
            .eq('email', existing.email)
        }

        toast.success('Welcome back! Redirecting...')
        router.push(`/tenant/${user.id}/dashboard`)
      } else {
        setLoading(false)
      }
    }

    checkTenant()
  }, [user, router])

  // ---------------- Fetch properties & realtors ----------------
  useEffect(() => {
    const fetchData = async () => {
      const { data: propertyData } = await supabase
        .from('properties')
        .select('id, address, title, realtor_id')

      const { data: realtorData } = await supabase
        .from('realtors')
        .select('id, full_name')

      setProperties(propertyData || [])
      setRealtors(realtorData || [])
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      toast.error('You must sign in to create a tenant account.')
      return
    }

    if (!full_name || !phone || !selectedProperty || !selectedRealtor) {
      setError('Please fill in all fields.')
      return
    }

    try {
      // Check if tenant already exists by email
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('email', user.primaryEmailAddress?.emailAddress)
        .single()

      if (existingTenant) {
        // Update existing tenant with selected property and realtor
        await supabase
          .from('tenants')
          .update({
            id: user.id, // link Clerk ID
            full_name,
            phone,
            property_id: selectedProperty.id,
            realtorId: selectedRealtor.id,
          })
          .eq('email', user.primaryEmailAddress?.emailAddress)
      } else {
        // Insert new tenant
        await supabase.from('tenants').insert([
          {
            id: user.id,
            full_name,
            phone,
            email: user.primaryEmailAddress?.emailAddress || '',
            property_id: selectedProperty.id,
            realtorId: selectedRealtor.id,
            status: 'active',
            created_at: new Date().toISOString(),
          },
        ])
      }

      toast.success('✅ Tenant account created successfully!')
      router.push(`/tenant/${user.id}/dashboard`)
    } catch (err: any) {
      console.error('Tenant creation error:', err)
      toast.error(err.message || 'Failed to create tenant account.')
      setError(err.message || 'Something went wrong.')
    }
  }

  if (loading) return <p className="p-8 text-center text-white">Loading...</p>
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-black rounded shadow text-white">
      <h1 className="text-2xl font-bold mb-4">Tenant Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-300 text-white"
          required
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-300 text-white"
          required
        />

        {/* Email (readonly) */}
        <input
          type="email"
          value={user?.primaryEmailAddress?.emailAddress || ''}
          disabled
          className="w-full p-2 rounded bg-gray-700 border border-gray-500 text-gray-300 cursor-not-allowed"
        />

        {/* Searchable Property */}
        {!selectedProperty && (
          <div>
            <input
              type="text"
              placeholder="Search Property by Property Address"
              value={searchProperty}
              onChange={(e) => {
                setSearchProperty(e.target.value)
                setSelectedProperty(null)
              }}
              className="w-full p-2 rounded bg-black border border-gray-300 text-white"
            />
            {searchProperty && (
              <div className="bg-gray-800 border border-gray-600 mt-1 rounded max-h-40 overflow-y-auto">
                {properties
                  .filter(
                    (p) =>
                      p.address.toLowerCase().includes(searchProperty.toLowerCase()) ||
                      p.title?.toLowerCase().includes(searchProperty.toLowerCase())
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedProperty(p)}
                    >
                      {p.address || p.title}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Searchable Realtor */}
        {!selectedRealtor && (
          <div>
            <input
              type="text"
              placeholder="Search Realtor by Name"
              value={searchRealtor}
              onChange={(e) => {
                setSearchRealtor(e.target.value)
                setSelectedRealtor(null)
              }}
              className="w-full p-2 rounded bg-black border border-gray-300 text-white"
            />
            {searchRealtor && (
              <div className="bg-gray-800 border border-gray-600 mt-1 rounded max-h-40 overflow-y-auto">
                {realtors
                  .filter((r) =>
                    r.full_name.toLowerCase().includes(searchRealtor.toLowerCase())
                  )
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedRealtor(r)}
                    >
                      {r.full_name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded text-white font-semibold"
        >
          Complete Onboarding
        </button>
      </form>
    </div>
  )
}

export default TenantForm