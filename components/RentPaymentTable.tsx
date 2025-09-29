'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash, Edit, Check, X, Plus } from 'lucide-react'

interface Tenant {
  id: string
  fullName: string
}

interface Lease {
  id: string
  property_address: string
}

interface Payment {
  id: string
  tenant_id: string
  lease_id: string
  amount: number
  due_date: string
  paid_date?: string
  status: 'pending' | 'paid' | 'late'
}

interface RentPaymentTableProps {
  realtorId: string | null
}

export default function RentPaymentTable({ realtorId }: RentPaymentTableProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTenant, setSearchTenant] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Payment>>({})
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    tenant_id: '',
    lease_id: '',
    amount: 0,
    due_date: '',
    status: 'pending',
  })

  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // -------------------------------
  // Fetch tenants, leases, and payments
  // -------------------------------
      useEffect(() => {
  if (!realtorId) return

  let channel: any = null

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('*')
        .eq('realtorId', realtorId)
        .order('fullName', { ascending: true })

      const { data: leasesData } = await supabase
        .from('lease')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('property_address', { ascending: true })

      const { data: paymentsData } = await supabase
        .from('rent_payment')
        .select('*')
        .order('due_date', { ascending: true })

      if (tenantsData) setTenants(tenantsData)
      if (leasesData) setLeases(leasesData)
      if (paymentsData) setPayments(paymentsData)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  fetchAll()

  // Setup Realtime channel
  channel = supabase
    .channel(`rent-payment-${realtorId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rent_payment' }, () => fetchAll())
    .subscribe()

  // Cleanup function (no async here)
  return () => {
    if (channel) supabase.removeChannel(channel)
  }
}, [realtorId])
  // -------------------------------
  // Inline Search
  // -------------------------------
  const handleSearchTenant = (value: string) => {
    setSearchTenant(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      const filtered = tenants.filter((t) => t.fullName.toLowerCase().includes(value.toLowerCase()))
      setTenants(filtered)
    }, 300)
  }

  // -------------------------------
  // Add Payment
  // -------------------------------
  const addPayment = async () => {
    if (!realtorId || !newPayment.tenant_id || !newPayment.lease_id || !newPayment.due_date) {
      return alert('Tenant, Lease, and Due Date are required')
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rent_payment')
        .insert([{
          ...newPayment,
          id: crypto.randomUUID(),
          status: 'pending',
        }])
        .select()
        .single()
      if (error) throw error
      setPayments((prev) => [...prev, data])
      setNewPayment({ tenant_id: '', lease_id: '', amount: 0, due_date: '', status: 'pending' })
    } catch (err) {
      console.error(err)
      alert('Failed to add payment')
    }
    setLoading(false)
  }

  // -------------------------------
  // Edit / Save / Cancel
  // -------------------------------
  const startEdit = (payment: Payment) => {
    setEditingId(payment.id)
    setEditData({ ...payment })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async () => {
    if (!editingId) return
    setLoading(true)
    try {
      const { error } = await supabase.from('rent_payment').update(editData).eq('id', editingId)
      if (error) throw error
      setPayments((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...editData } : p)))
      cancelEdit()
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    }
    setLoading(false)
  }

  // -------------------------------
  // Delete
  // -------------------------------
  const deletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('rent_payment').delete().eq('id', id)
      if (error) throw error
      setPayments((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete payment')
    }
    setLoading(false)
  }

  return (
    <section className="mt-10 bg-black p-4 rounded-md border border-gray-300 shadow-md text-white">
      <h2 className="text-2xl mb-4 text-[#302cfc] font-semibold">Rent Payments</h2>

      {/* Search tenants */}
      <Input
        placeholder="Search tenants..."
        value={searchTenant}
        onChange={(e) => handleSearchTenant(e.target.value)}
        className="mb-4 bg-black text-white"
      />

      <div className="overflow-x-auto rounded-md border border-gray-300 bg-black text-white">
        <Table className="min-w-[600px] md:min-w-full rounded-md border border-gray-300">
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Lease</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Inline Add Row */}
            <TableRow>
              <TableCell>
                <select
                  value={newPayment.tenant_id}
                  onChange={(e) => setNewPayment({ ...newPayment, tenant_id: e.target.value })}
                  className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                >
                  <option value="">Select Tenant</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <select
                  value={newPayment.lease_id}
                  onChange={(e) => setNewPayment({ ...newPayment, lease_id: e.target.value })}
                  className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                >
                  <option value="">Select Lease</option>
                  {leases.map((l) => (
                    <option key={l.id} value={l.id}>{l.property_address}</option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newPayment.amount || 0}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                  className="bg-gray-700 text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={newPayment.due_date || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                  className="bg-gray-700 text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={newPayment.paid_date || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, paid_date: e.target.value })}
                  className="bg-gray-700 text-white"
                />
              </TableCell>
              <TableCell>
                <select
                  value={newPayment.status || 'pending'}
                  onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value as Payment['status'] })}
                  className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="late">Late</option>
                </select>
              </TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button size="sm" onClick={addPayment} disabled={loading}>
                  <Plus size={16} />
                </Button>
              </TableCell>
            </TableRow>

            {/* Existing Payments */}
            {payments.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-white py-4">
                  No payments found
                </TableCell>
              </TableRow>
            )}

            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {editingId === p.id ? (
                    <select
                      value={editData.tenant_id || ''}
                      onChange={(e) => setEditData({ ...editData, tenant_id: e.target.value })}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.fullName}</option>
                      ))}
                    </select>
                  ) : (
                    tenants.find((t) => t.id === p.tenant_id)?.fullName || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === p.id ? (
                    <select
                      value={editData.lease_id || ''}
                      onChange={(e) => setEditData({ ...editData, lease_id: e.target.value })}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      {leases.map((l) => (
                        <option key={l.id} value={l.id}>{l.property_address}</option>
                      ))}
                    </select>
                  ) : (
                    leases.find((l) => l.id === p.lease_id)?.property_address || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === p.id ? (
                    <Input
                      type="number"
                      value={editData.amount || 0}
                      onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                      className="bg-gray-700 text-white"
                    />
                  ) : (
                    p.amount
                  )}
                </TableCell>
                <TableCell>
                  {editingId === p.id ? (
                    <Input
                      type="date"
                      value={editData.due_date || ''}
                      onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                      className="bg-gray-700 text-white"
                    />
                  ) : (
                    p.due_date
                  )}
                </TableCell>
                <TableCell>
                  {editingId === p.id ? (
                    <Input
                      type="date"
                      value={editData.paid_date || ''}
                      onChange={(e) => setEditData({ ...editData, paid_date: e.target.value })}
                      className="bg-gray-700 text-white"
                    />
                  ) : (
                    p.paid_date || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === p.id ? (
                    <select
                      value={editData.status || 'pending'}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value as Payment['status'] })}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="late">Late</option>
                    </select>
                  ) : (
                    p.status
                  )}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  {editingId === p.id ? (
                    <>
                      <Button size="sm" onClick={saveEdit}><Check size={16} /></Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}><X size={16} /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => startEdit(p)}><Edit size={16} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePayment(p.id)}><Trash size={16} /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}