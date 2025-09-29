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
  email: string
  phone?: string
  property?: string
  realtorId: string
}

interface TenantTableProps {
  realtorId: string | null
}

const TenantTable = ({ realtorId }: TenantTableProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Tenant>>({})
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    fullName: '',
    email: '',
    phone: '',
    property: '',
  })

  // -------------------------------
  // Fetch tenants with realtime subscription
  // -------------------------------
  useEffect(() => {
    if (!realtorId) return

    const fetchTenants = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('realtorId', realtorId)
        .order('fullName', { ascending: true })

      if (!error && data) {
        setTenants(data as Tenant[])
        setFilteredTenants(data as Tenant[])
      }
      setLoading(false)
    }

    fetchTenants()

    const channel = supabase
      .channel(`tenants-changes-${realtorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
          filter: `realtorId=eq.${realtorId}`,
        },
        () => fetchTenants()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  // -------------------------------
  // Debounced search
  // -------------------------------
  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      const filtered = tenants.filter(
        (t) =>
          t.fullName.toLowerCase().includes(value.toLowerCase()) ||
          t.email.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredTenants(filtered)
    }, 300)
  }

  // -------------------------------
  // Edit / Save / Cancel
  // -------------------------------
  const startEdit = (tenant: Tenant) => {
    setEditingId(tenant.id)
    setEditData({ ...tenant })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async () => {
    if (!editingId) return
    const { error } = await supabase.from('tenants').update(editData).eq('id', editingId)
    if (!error) {
      cancelEdit()
      // Refresh list
      const updated = tenants.map((t) => (t.id === editingId ? { ...t, ...editData } : t))
      setTenants(updated)
      setFilteredTenants(updated)
    } else alert('Failed to save: ' + error.message)
  }

  // -------------------------------
  // Delete
  // -------------------------------
  const deleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return
    const { error } = await supabase.from('tenants').delete().eq('id', id)
    if (!error) {
      const updated = tenants.filter((t) => t.id !== id)
      setTenants(updated)
      setFilteredTenants(updated)
    } else alert('Failed to delete: ' + error.message)
  }

  // -------------------------------
  // Add Tenant Inline
  // -------------------------------
  const addTenant = async () => {
    if (!realtorId || !newTenant.fullName || !newTenant.email) return alert('Name and Email required')
    setAdding(true)

    const tenantId = crypto.randomUUID()

    const { data, error } = await supabase
      .from('tenants')
      .insert([
        { 
          id: tenantId,
          fullName: newTenant.fullName,
          email: newTenant.email,
          phone: newTenant.phone,
          property: newTenant.property,
         realtorId, 
        },
      ])
      .select()

    if (!error && data) {
      const updated = [data[0] as Tenant, ...tenants]
      setTenants(updated)
      setFilteredTenants(updated)
      setNewTenant({ fullName: '', email: '', phone: '', property: '' })
    } else alert('Failed to add tenant: ' + error.message)
    setAdding(false)
  }

  return (
    <section className="mt-15 bg-black p-4 rounded-md border border-gray-300 shadow-md text-white">
      <h2 className="text-2xl mb-4 text-[#302cfc] font-semibold">Your Tenants</h2>

      {/* Search */}
      <Input
        placeholder="Search tenants by name or email..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 bg-black text-white"
      />

      <div className="overflow-x-auto rounded-md border-gray-300 border text-white bg-black">
        <Table className="min-w-[600px] md:min-w-full rounded-md border-gray-300 border text-white">
          <TableHeader className='text-white bg-black rounded-md border border-gray-300'>
            <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
            
              <TableHead className='text-white'>Name</TableHead>
              <TableHead className='text-white'>Email</TableHead>
              <TableHead className='text-white'>Phone</TableHead>
              <TableHead className='text-white'>Property</TableHead>
              <TableHead className="text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Inline Add Row */}
            <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
            
              <TableCell>
                <Input
                  placeholder="Full Name"
                  value={newTenant.fullName}
                  onChange={(e) => setNewTenant({ ...newTenant, fullName: e.target.value })}
                  className="bg-black text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Email"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  className="bg-black text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Phone"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                  className="bg-black text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Property"
                  value={newTenant.property}
                  onChange={(e) => setNewTenant({ ...newTenant, property: e.target.value })}
                  className="bg-black text-white"
                />
              </TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button size="sm" onClick={addTenant} disabled={adding}>
                  <Plus size={16} />
                </Button>
              </TableCell>
            </TableRow>

            {/* Existing tenants */}
            {filteredTenants.length === 0 && !loading && (
              <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
              
                <TableCell colSpan={5} className="text-center text-white py-4">
                  No tenants found
                </TableCell>
              </TableRow>
            )}

            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  {editingId === tenant.id ? (
                    <Input
                      value={editData.fullName || ''}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    />
                  ) : (
                    tenant.fullName
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tenant.id ? (
                    <Input
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  ) : (
                    tenant.email
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tenant.id ? (
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  ) : (
                    tenant.phone || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tenant.id ? (
                    <Input
                      value={editData.property || ''}
                      onChange={(e) => setEditData({ ...editData, property: e.target.value })}
                    />
                  ) : (
                    tenant.property || '-'
                  )}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  {editingId === tenant.id ? (
                    <>
                      <Button size="sm" onClick={saveEdit}>
                        <Check size={16} />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        <X size={16} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => startEdit(tenant)}>
                        <Edit size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteTenant(tenant.id)}>
                        <Trash size={16} />
                      </Button>
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

export default TenantTable