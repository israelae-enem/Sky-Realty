'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
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

      try {
        const inviteRef = doc(db, 'invites', inviteId)
        const inviteSnap = await getDoc(inviteRef)

        if (!inviteSnap.exists()) {
          setError('Invalid or expired invite.')
          return
        }
        const data = inviteSnap.data()
        if (data.status !== 'pending') {
          setError('This invite has already been used or is no longer valid.')
          return
        }
        setInviteData({ id: inviteSnap.id, ...data })
      } catch (err) {
        setError('Failed to fetch invite.')
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [inviteId])

  // Fetch Realtors list
  useEffect(() => {
    const fetchRealtors = async () => {
      const snap = await getDocs(collection(db, 'realtors'))
      setRealtors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchRealtors()
  }, [])

  // Fetch properties for selected realtor
  useEffect(() => {
    if (!selectedRealtor) return
    const fetchProperties = async () => {
      const q = query(collection(db, 'properties'), where('realtor_id', '==', selectedRealtor))
      const snap = await getDocs(q)
      setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
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
        // Accept invite flow
        await addDoc(collection(db, 'tenants'), {
          full_name: fullName,
          phone,
          email: inviteData.email,
          property_id: inviteData.property_id,
          realtor_id: inviteData.realtor_id,
          inviteId: inviteData.id,
          status: 'active',
          created_at: new Date(),
        })

        await updateDoc(doc(db, 'invites', inviteData.id), {
          status: 'accepted',
          accepted_at: new Date(),
        })

        toast.success('Welcome aboard! You are now linked to your property.')
      } else {
        // Manual request flow
        await addDoc(collection(db, 'tenants'), {
          full_name: fullName,
          phone,
          email,
          property_id: selectedProperty,
          realtor_id: selectedRealtor,
          status: 'pending', // realtor must approve
          created_at: new Date(),
        })

        toast.success('Request sent! Waiting for realtor approval.')
      }

      router.push('/tenantdashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding.')
    }
  }

  if (loading) return <p className="p-8 text-center">Loading...</p>
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-gray-900 rounded shadow text-white">
      <h1 className="text-2xl font-bold mb-4">Tenant Onboarding</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-300"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-300"
        />

        {!inviteData && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-black border border-gray-300"
            />

            <select
              value={selectedRealtor}
              onChange={(e) => setSelectedRealtor(e.target.value)}
              className="w-full p-2 rounded bg-black border border-gray-300"
            >
              <option value="">Select Realtor</option>
              {realtors.map(r => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.email}
                </option>
              ))}
            </select>

            {selectedRealtor && (
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full p-2 rounded bg-black border border-gray-300"
              >
                <option value="">Select Property</option>
                {properties.map(p => (
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
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
        >
          {inviteData ? 'Complete Onboarding' : 'Request Access'}
        </button>
      </form>
    </div>
  )
}

export default TenantForm