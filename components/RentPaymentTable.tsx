'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface RentPayment {
  id: string
  tenant_id: string
  property_id: string
  lease_id: string | null
  amount: number
  payment_date: string
  status: string
  method: string | null
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

interface Tenant {
  id: string
  full_name: string
  property_id: string
}

interface Property {
  id: string
  address: string
}

interface Lease {
  id: string
  tenant_id: string
  property_id: string
}

interface RentPaymentTableProps {
  realtorId: string | null
}

export default function RentPaymentTable({ realtorId }: RentPaymentTableProps) {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [stats, setStats] = useState({ paid: 0, pending: 0, overdue: 0 })
  const [search, setSearch] = useState('')
  const [filteredPayments, setFilteredPayments] = useState<RentPayment[]>([])
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const [newPayment, setNewPayment] = useState<Partial<RentPayment>>({
    tenant_id: '',
    property_id: '',
    lease_id: null,
    amount: 0,
    payment_date: '',
    status: 'Pending',
    method: null,
    reminder_sent: false,
  })

  // -------------------------------
  // Fetch all data
  // -------------------------------
  useEffect(() => {
    if (!realtorId) return

    const fetchData = async () => {
      setLoading(true)
      const [{ data: tenantsData }, { data: propertiesData }, { data: leasesData }, { data: paymentsData }] =
        await Promise.all([
          supabase.from('tenants').select('id, full_name, property_id').eq('realtor_id', realtorId),
          supabase.from('properties').select('id, address').eq('realtor_id', realtorId),
          supabase.from('lease').select('id, tenant_id, property_id').eq('realtor_id', realtorId),
          supabase.from('rent_payment').select('*').order('payment_date', { ascending: false }),
        ])

      setTenants(tenantsData || [])
      setProperties(propertiesData || [])
      setLeases(leasesData || [])
      setPayments(paymentsData || [])
      setFilteredPayments(paymentsData || [])
      updateStats(paymentsData || [])
      setLoading(false)
    }

    fetchData()

    // Realtime updates
    const channel = supabase
      .channel(`rent-payment-${realtorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rent_payment' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  // -------------------------------
  // Stats summary
  // -------------------------------
  const updateStats = (data: RentPayment[]) => {
    const paid = data.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0)
    const pending = data.filter((p) => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0)
    const overdue = data.filter((p) => p.status === 'Overdue').reduce((acc, p) => acc + p.amount, 0)
    setStats({ paid, pending, overdue })
  }

  // -------------------------------
  // Search
  // -------------------------------
  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      const filtered = payments.filter((p) => {
        const tenantName =
          tenants.find((t) => t.id === p.tenant_id)?.full_name?.toLowerCase() || ''
        return (
          tenantName.includes(value.toLowerCase()) ||
          p.status.toLowerCase().includes(value.toLowerCase())
        )
      })
      setFilteredPayments(filtered)
    }, 300)
  }

  // -------------------------------
  // Add payment
  // -------------------------------
  const addPayment = async () => {
    if (!newPayment.tenant_id || !newPayment.amount || !newPayment.payment_date) {
      toast.error('Please fill in all required fields')
      return
    }

    const tenant = tenants.find((t) => t.id === newPayment.tenant_id)
    const propertyId = tenant?.property_id || ''

    try {
      setAdding(true)
      const { error } = await supabase.from('rent_payment').insert([
        {
          tenant_id: newPayment.tenant_id,
          property_id: propertyId,
          lease_id: newPayment.lease_id || null,
          amount: newPayment.amount,
          payment_date: newPayment.payment_date,
          status: newPayment.status,
          method: newPayment.method || null,
          reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      toast.success('Rent payment added successfully!')
      setNewPayment({
        tenant_id: '',
        property_id: '',
        lease_id: null,
        amount: 0,
        payment_date: '',
        status: 'Pending',
        method: null,
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to add rent payment')
    } finally {
      setAdding(false)
    }
  }

  // -------------------------------
  // Delete
  // -------------------------------
  const deletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return
    const { error } = await supabase.from('rent_payment').delete().eq('id', id)
    if (error) toast.error('Failed to delete payment')
    else toast.success('Payment deleted')
  }

  return (
    <section className="mt-8 bg-gray-700 p-4 rounded-md border border-gray-300 text-white hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-[#302cfc]">Rent Payments</h2>

      {/* ✅ Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-md text-center border border-gray-300">
          <p className="text-gray-400 text-sm">Total Paid</p>
          <p className="text-green-400 text-xl font-semibold">${stats.paid.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md text-center border border-gray-300">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-yellow-400 text-xl font-semibold">${stats.pending.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md text-center border border-gray-300">
          <p className="text-gray-400 text-sm">Overdue</p>
          <p className="text-red-400 text-xl font-semibold">${stats.overdue.toFixed(2)}</p>
        </div>
      </div>

      <Input
        placeholder="Search by tenant or status..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 bg-gray-800 text-white"
      />

      <div className="overflow-x-auto border border-gray-300 rounded-md flex flex-col">
        <Table className="min-w-full hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700
         ">
          <TableHeader>
            <TableRow className='hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700'>
             
              <TableHead className="text-white">Tenant</TableHead>
              <TableHead className="text-white">Property</TableHead>
              <TableHead className="text-white">Lease</TableHead>
              <TableHead className="text-white">Amount ($)</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Method</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Add Row */}
            <TableRow className=' hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700'>
              <TableCell>
                <select
                  value={newPayment.tenant_id}
                  onChange={(e) => {
                    const tenantId = e.target.value
                    const propertyId =
                      tenants.find((t) => t.id === tenantId)?.property_id || ''
                    setNewPayment({ ...newPayment, tenant_id: tenantId, property_id: propertyId })
                  }}
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-700             hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700"

                >
                  <option value="">Select tenant</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </TableCell>

              <TableCell>
                <Input
                  value={properties.find((p) => p.id === newPayment.property_id)?.address || ''}
                  disabled
                  className="bg-gray-700 text-gray-300 cursor-not-allowed hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700"

                />
              </TableCell>

              <TableCell>
                <select
                  value={newPayment.lease_id || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, lease_id: e.target.value || null })}
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                >
                  <option value="">Select lease</option>
                  {leases
                    .filter((l) => l.tenant_id === newPayment.tenant_id)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id}
                      </option>
                    ))}
                </select>
              </TableCell>

              <TableCell>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newPayment.amount || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  className="bg-gray-700 text-white hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700"

                />
              </TableCell>

              <TableCell>
                <Input
                  type="date"
                  value={newPayment.payment_date || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                  className="bg-gray-700 text-white hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700"

                />
              </TableCell>

              <TableCell>
                <select
                  value={newPayment.method || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-700"
                >
                  <option value="">Select method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </TableCell>

              <TableCell>
                <select
                  value={newPayment.status}
                  onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-700             hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700"

                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </TableCell>

              <TableCell className="flex justify-center gap-2">
                <Button size="sm" onClick={addPayment} disabled={adding}>
                  <Plus size={16} />
                </Button>
              </TableCell>
            </TableRow>

            {/* Existing payments */}
            {filteredPayments.length === 0 && !loading && (
              <TableRow className=' hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700'>
                <TableCell colSpan={8} className="text-center py-4 text-gray-700 hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-700">
                  No rent payments found
                </TableCell>
              </TableRow>
            )}

            {filteredPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{tenants.find((t) => t.id === p.tenant_id)?.full_name || 'Unknown'}</TableCell>
                <TableCell>{properties.find((prop) => prop.id === p.property_id)?.address || '—'}</TableCell>
                <TableCell>{p.lease_id || '—'}</TableCell>
                <TableCell>${p.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                <TableCell>{p.method || '—'}</TableCell>
                <TableCell
                  className={`${
                    p.status === 'Paid'
                      ? 'text-green-400'
                      : p.status === 'Overdue'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {p.status}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => deletePayment(p.id)}>
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 📱 Mobile Rent Payment View */}
<div className="md:hidden space-y-4">

  {/* Add / View Toggle */}
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-semibold text-[#302cfc]">Rent Payments</h3>
    <button
      onClick={() => setAdding(!adding)}
      className="text-sm px-3 py-1 rounded bg-[#302cfc] hover:bg-blue-700 text-white"
    >
      {adding ? 'View Payments' : 'Add Payment'}
    </button>
  </div>

  {/* Add Payment Form (Collapsible) */}
  {adding && (
    <div className="bg-gray-700 p-4 rounded-md border border-gray-300 space-y-3 animate-slideDown">
      <h3 className="text-lg font-semibold text-[#302cfc]">Add Rent Payment</h3>

      <div>
        <label className="block text-sm text-gray-100 mb-1">Tenant</label>
        <select
          value={newPayment.tenant_id}
          onChange={(e) => {
            const tenantId = e.target.value
            const propertyId =
              tenants.find((t) => t.id === tenantId)?.property_id || ''
            setNewPayment({ ...newPayment, tenant_id: tenantId, property_id: propertyId })
          }}
          className="w-full bg-gray-700 text-white p-2 rounded border border-gray-700"
        >
          <option value="">Select tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Property</label>
        <input
          type="text"
          value={properties.find((p) => p.id === newPayment.property_id)?.address || ''}
          disabled
          className="w-full bg-gray-700 text-gray-100 p-2 rounded border border-gray-700 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-100 mb-1">Amount ($)</label>
        <input
          type="number"
          placeholder="Amount"
          value={newPayment.amount || ''}
          onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
          className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Payment Date</label>
        <input
          type="date"
          value={newPayment.payment_date || ''}
          onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
          className="w-full bg-gray-700 text-white p-2 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-100 mb-1">Payment Method</label>
        <select
          value={newPayment.method || ''}
          onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
          className="w-full bg-gray-700 text-white p-2 rounded border border-gray-300"
        >
          <option value="">Select method</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cash">Cash</option>
          <option value="Check">Check</option>
          <option value="Online Payment">Online Payment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-100 mb-1">Status</label>
        <select
          value={newPayment.status}
          onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
          className="w-full bg-gray-700 text-white p-2 rounded border border-gray-300"
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      <button
        onClick={addPayment}
        disabled={loading}
        className="w-full bg-[#302cfc] hover:bg-blue-700 text-white py-2 rounded-md mt-2"
      >
        {loading ? 'Adding...' : 'Add Payment'}
      </button>
    </div>
  )}

  {/* Payment Cards */}
  {!adding && (
    <div className="space-y-3">
      {filteredPayments.length === 0 && !loading && (
        <p className="text-gray-100 text-center py-4">No rent payments found</p>
      )}

      {filteredPayments.map((p) => {
        const tenant = tenants.find((t) => t.id === p.tenant_id)
        const property = properties.find((prop) => prop.id === p.property_id)
        return (
          <div
            key={p.id}
            className="bg-gray-700 border border-gray-300 rounded-md p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-white">{tenant?.full_name || 'Unknown'}</p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === 'Paid'
                    ? 'bg-green-500/20 text-green-400'
                    : p.status === 'Overdue'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {p.status}
              </span>
            </div>
            <p className="text-gray-100 text-sm">{property?.address || '—'}</p>
            <p className="text-gray-100 text-sm">Amount: ${p.amount.toFixed(2)}</p>
            <p className="text-gray-100 text-sm">
              Date: {new Date(p.payment_date).toLocaleDateString()}
            </p>
            <p className="text-gray-100 text-sm">
              Method: {p.method || '—'}
            </p>
            <button
              onClick={() => deletePayment(p.id)}
              className="w-full text-red-400 text-sm mt-2 border border-red-400 rounded-md py-1 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        )
      })}
    </div>
  )}
</div>



      {loading && <p className="text-gray-400 mt-2">Loading rent payments...</p>}
    </section>
  )
}