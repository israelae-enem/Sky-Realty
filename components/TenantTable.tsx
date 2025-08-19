'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import debounce from 'lodash.debounce'

interface Tenant {
  id: string
  fullName: string
  email: string
  phone?: string
  property?: string
}

interface TenantTableProps {
  realtorId: string | null
}

const TenantTable = ({ realtorId }: TenantTableProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])

  // New Tenant form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [property, setProperty] = useState('')

  useEffect(() => {
    if (!realtorId) return

    setIsFetching(true)

    const q = query(
      collection(db, 'tenants'),
      where('realtorId', '==', realtorId),
      orderBy('fullName')
    )

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tenantsList: Tenant[] = []
        querySnapshot.forEach((doc) => {
          tenantsList.push({ id: doc.id, ...doc.data() } as Tenant)
        })
        setTenants(tenantsList)
        setFilteredTenants(tenantsList)
        setIsFetching(false)
      },
      (err) => {
        setError('Failed to fetch tenants: ' + err.message)
        setIsFetching(false)
      }
    )

    return () => unsubscribe()
  }, [realtorId])

  // Debounced search handler
  const handleSearch = debounce((term: string) => {
    const filtered = tenants.filter((tenant) =>
      tenant.fullName.toLowerCase().includes(term.toLowerCase()) ||
      tenant.email.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredTenants(filtered)
  }, 300)

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    handleSearch(e.target.value)
  }

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email) {
      setError('Name and Email are required')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await addDoc(collection(db, 'tenants'), {
        realtorId,
        fullName,
        email,
        phone,
        property,
      })

      setFullName('')
      setEmail('')
      setPhone('')
      setProperty('')
    } catch (err: any) {
      setError('Failed to add tenant: ' + err.message)
    }

    setIsAdding(false)
  }

  return (
    <section className="mt-10 bg-black p-6 rounded-md border-gray-300 shadow-md text-white">
      <h2 className="text-2xl mb-4 text-[#302cfc] font-semibold">Your Tenants</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search tenants by name or email..."
        value={search}
        onChange={onSearchChange}
        className="w-full mb-4 px-3 py-2 rounded bg-black border border-gray-300 text-white"
      />

      {/* Add Tenant Form */}
      <form onSubmit={handleAddTenant} className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="px-3 py-2 rounded bg-black border border-gray-300 text-white flex-grow"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 rounded bg-black border border-gray-300 text-white flex-grow"
          required
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-3 py-2 rounded bg-black border border-gray-300 text-white flex-grow"
        />
        <input
          type="text"
          placeholder="Property (optional)"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          className="px-3 py-2 rounded bg-black border border-gray-300 text-white flex-grow"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="bg-[#302cfc] hover:bg-[#241fd9] px-4 py-2 rounded disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : 'Add Tenant'}
        </button>
      </form>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Tenants Table */}
      {isFetching && !filteredTenants.length ? (
        <p>Loading tenants...</p>
      ) : (
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Property</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map(({ id, fullName, email, phone, property }) => (
              <tr key={id} className="hover:bg-gray-800 transition">
                <td className="border border-gray-300 px-4 py-2">{fullName}</td>
                <td className="border border-gray-300 px-4 py-2">{email}</td>
                <td className="border border-gray-300 px-4 py-2">{phone || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{property || '-'}</td>
              </tr>
            ))}
            {!filteredTenants.length && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No tenants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default TenantTable