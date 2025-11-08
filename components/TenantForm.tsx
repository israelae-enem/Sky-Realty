'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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

  // Check if tenant exists
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
        if (!existing.id || existing.id !== user.id) {
          await supabase.from('tenants').update({ id: user.id }).eq('email', existing.email)
        }
        toast.success('Welcome back! Redirecting...')
        router.push(`/tenant/${user.id}/dashboard`)
      } else {
        setLoading(false)
      }
    }

    checkTenant()
  }, [user, router])

  // Fetch properties & realtors
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
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('email', user.primaryEmailAddress?.emailAddress)
        .single()

      if (existingTenant) {
        await supabase.from('tenants').update({
          id: user.id,
          full_name,
          phone,
          property_id: selectedProperty.id,
          realtorId: selectedRealtor.id,
        }).eq('email', user.primaryEmailAddress?.emailAddress)
      } else {
        await supabase.from('tenants').insert([{
          id: user.id,
          full_name,
          phone,
          email: user.primaryEmailAddress?.emailAddress || '',
          property_id: selectedProperty.id,
          realtorId: selectedRealtor.id,
          status: 'active',
          created_at: new Date().toISOString(),
        }])
      }

      toast.success('✅ Tenant account created successfully!')
      router.push(`/tenant/${user.id}/dashboard`)
    } catch (err: any) {
      console.error('Tenant creation error:', err)
      toast.error(err.message || 'Failed to create tenant account.')
      setError(err.message || 'Something went wrong.')
    }
  }

  if (loading) return <p className="p-8 text-center text-gray-700">Loading...</p>
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  }

  return (
    <motion.div
      className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg"
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-2xl font-bold mb-4 text-gray-800"
        custom={0}
        variants={fadeUpVariant}
      >
        Tenant Registration
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'Full Name', value: full_name, set: setFullName, type: 'text' },
          { label: 'Phone Number', value: phone, set: setPhone, type: 'tel' },
        ].map((field, idx) => (
          <motion.input
            key={field.label}
            type={field.type}
            placeholder={field.label}
            value={field.value}
            onChange={(e) => field.set(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            custom={idx + 1}
            variants={fadeUpVariant}
          />
        ))}

        {/* Email readonly */}
        <motion.input
          type="email"
          value={user?.primaryEmailAddress?.emailAddress || ''}
          disabled
          className="w-full p-2 rounded border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
          custom={3}
          variants={fadeUpVariant}
        />

        {/* Search Property */}
        {!selectedProperty && (
          <motion.div custom={4} variants={fadeUpVariant}>
            <input
              type="text"
              placeholder="Search Property by Address"
              value={searchProperty}
              onChange={(e) => {
                setSearchProperty(e.target.value)
                setSelectedProperty(null)
              }}
              className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchProperty && (
              <div className="bg-gray-100 border border-gray-300 mt-1 rounded max-h-40 overflow-y-auto">
                {properties
                  .filter((p) =>
                    p.address.toLowerCase().includes(searchProperty.toLowerCase()) ||
                    p.title?.toLowerCase().includes(searchProperty.toLowerCase())
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => setSelectedProperty(p)}
                    >
                      {p.address || p.title}
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Search Realtor */}
        {!selectedRealtor && (
          <motion.div custom={5} variants={fadeUpVariant}>
            <input
              type="text"
              placeholder="Search Realtor by Name"
              value={searchRealtor}
              onChange={(e) => {
                setSearchRealtor(e.target.value)
                setSelectedRealtor(null)
              }}
              className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchRealtor && (
              <div className="bg-gray-100 border border-gray-300 mt-1 rounded max-h-40 overflow-y-auto">
                {realtors
                  .filter((r) => r.full_name.toLowerCase().includes(searchRealtor.toLowerCase()))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => setSelectedRealtor(r)}
                    >
                      {r.full_name}
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          className="w-full py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded text-white font-semibold"
          custom={6}
          variants={fadeUpVariant}
        >
          Complete Onboarding
        </motion.button>
      </form>
    </motion.div>
  )
}

export default TenantForm