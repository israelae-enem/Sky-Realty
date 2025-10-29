'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash, Edit, Check, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Tenant {
  id: string
  full_name: string
  email: string
  phone?: string
  property_id?: string
  realtor_id: string
}

interface Property {
  id: string
  address: string
}

interface TenantTableProps {
  realtorId: string | null
}

export default function TenantTable({ realtorId }: TenantTableProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Tenant>>({})
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    full_name: '',
    email: '',
    phone: '',
    property_id: '',
  })

  // -------------------------------
  // Fetch tenants and properties
  // -------------------------------
  useEffect(() => {
    if (!realtorId) return
    const fetchData = async () => {
      setLoading(true)

      const [{ data: tenantsData }, { data: propertiesData }] = await Promise.all([
        supabase.from('tenants').select('*').eq('realtor_id', realtorId).order('full_name'),
        supabase.from('properties').select('id, address').eq('realtor_id', realtorId),
      ])

      setTenants(tenantsData || [])
      setFilteredTenants(tenantsData || [])
      setProperties(propertiesData || [])
      setLoading(false)
    }

    fetchData()

    // Realtime subscription
    const channel = supabase
      .channel(`tenants-${realtorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants', filter: `realtor_id=eq.${realtorId}` },
        (payload) => {
          console.log('Realtime tenant change:', payload)
          fetchData()
        }
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
          t.full_name?.toLowerCase().includes(value.toLowerCase()) ||
          t.email?.toLowerCase().includes(value.toLowerCase())
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
    if (error) {
      toast.error('Failed to save changes')
    } else {
      cancelEdit()
      toast.success('Tenant updated')
    }
  }

  // -------------------------------
  // Delete Tenant
  // -------------------------------
  const deleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return
    const { error } = await supabase.from('tenants').delete().eq('id', id)
    if (error) toast.error('Failed to delete tenant')
  }

  // -------------------------------
  // Add Tenant
  // -------------------------------
  const addTenant = async () => {
    if (!realtorId || !newTenant.full_name || !newTenant.email) {
      toast.error('Name and Email required')
      return
    }
    setAdding(true)

    try {
      // Check if tenant already exists (from Clerk registration)
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('email', newTenant.email)
        .maybeSingle()

      let tenantId = existingTenant?.id || crypto.randomUUID()

      if (existingTenant) {
        // Update existing tenant to link to this realtor + property
        await supabase
          .from('tenants')
          .update({
            realtor_id: realtorId,
            property_id: newTenant.property_id,
            phone: newTenant.phone,
          })
          .eq('id', tenantId)
      } else {
        // Insert new tenant
        await supabase.from('tenants').insert([
          {
            id: tenantId,
            full_name: newTenant.full_name,
            email: newTenant.email,
            phone: newTenant.phone,
            property_id: newTenant.property_id,
            realtor_id: realtorId,
          },
        ])
      }

      // Also update the realtor table with tenant_id (optional)
      await supabase.from('realtors').update({ tenant_id: tenantId }).eq('id', realtorId)

      toast.success('Tenant added successfully!')
      setNewTenant({ full_name: '', email: '', phone: '', property_id: '' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to add tenant')
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="mt-8 bg-[#0d0d0e] p-4 rounded-md border border-gray-300 text-white">
      <h2 className="text-2xl font-semibold mb-4 text-[#302cfc]">Your Tenants</h2>

      {/* Search */}
      <Input
        placeholder="Search tenants by name or email..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 bg-[#0d0d0e] text-white"
      />

      <div className="overflow-x-auto rounded-md border border-gray-300 hidden md:block">
        <Table className="min-w-full text-white">
          <TableHeader>
            <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Phone</TableHead>
              <TableHead className="text-white">Property</TableHead>
              <TableHead className="text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add Tenant Row */}
            <TableRow className=' hover:bg-black focus:bg-black active:bg-black'>
              <TableCell>
                <Input
                  placeholder="Full Name"
                  value={newTenant.full_name}
                  onChange={(e) => setNewTenant({ ...newTenant, full_name: e.target.value })}
                  className="bg-gray-800 text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Email"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  className="bg-[#0d0d0e] text-white"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Phone"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                  className="bg-[#0d0d0e] text-white"
                />
              </TableCell>
              <TableCell>
                <select
                  value={newTenant.property_id}
                  onChange={(e) => setNewTenant({ ...newTenant, property_id: e.target.value })}
                  className="w-full bg-[#0d0d0e] text-white p-2 rounded border border-gray-300"
                >
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button size="sm" onClick={addTenant} disabled={adding}>
                  <Plus size={16} />
                </Button>
              </TableCell>
            </TableRow>

            {/* Existing tenants */}
            {filteredTenants.length === 0 && !loading && (
              <TableRow className=' hover:bg-black focus:bg-black active:bg-black'>
                <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                  No tenants found
                </TableCell>
              </TableRow>
            )}

            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.full_name}</TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>{tenant.phone || '-'}</TableCell>
                <TableCell>
                  {
                    properties.find((p) => p.id === tenant.property_id)?.address || '—'
                  }
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => deleteTenant(tenant.id)}>
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

             
             {/* 📱 Mobile View */}
<div className="md:hidden flex flex-col gap-4">
  {/* Toggle Add Tenant Form */}
  <button
    onClick={() => setAdding((prev) => !prev)}
    className="flex items-center justify-center gap-2 bg-[#302cfc] text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 transition"
  >
    {adding ? <X size={18} /> : <Plus size={18} />}
    {adding ? 'Cancel' : 'Add Tenant'}
  </button>

  {/* Add Tenant Form (collapsible) */}
  {adding && (
    <div className="bg-[#0d0d0e] p-4 rounded-md border border-gray-300 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-3 text-[#302cfc]">Add New Tenant</h3>
      <div className="space-y-3">
        <Input
          placeholder="Full Name"
          value={newTenant.full_name}
          onChange={(e) => setNewTenant({ ...newTenant, full_name: e.target.value })}
          className="bg-[#0d0d0e] text-white"
        />
        <Input
          placeholder="Email"
          value={newTenant.email}
          onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
          className="bg-[#0d0d0e] text-white"
        />
        <Input
          placeholder="Phone"
          value={newTenant.phone}
          onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
          className="bg-[#0d0d0e] text-white"
        />
        <select
          value={newTenant.property_id}
          onChange={(e) => setNewTenant({ ...newTenant, property_id: e.target.value })}
          className="w-full bg-[#0d0d0e] text-white p-2 rounded border border-gray-600"
        >
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>

        <Button
          onClick={addTenant}
          className="w-full bg-[#302cfc] hover:bg-blue-700 text-white"
        >
          <Plus size={16} className="mr-2" /> Add Tenant
        </Button>
      </div>
    </div>
  )}

  {/* No Tenants */}
  {filteredTenants.length === 0 && !loading && (
    <p className="text-center text-gray-400 mt-4">No tenants found</p>
  )}

  {/* Tenant Cards */}
  {filteredTenants.map((tenant) => (
    <div
      key={tenant.id}
      className="bg-[#0d0d0e] p-4 rounded-md border border-gray-300 shadow-md"
    >
      {editingId === tenant.id ? (
        <>
          {/* Edit Mode */}
          <h3 className="text-lg font-semibold text-[#302cfc] mb-3">
            Edit Tenant
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              value={editData.full_name ?? ''}
              onChange={(e) =>
                setEditData({ ...editData, full_name: e.target.value })
              }
              className="bg-[#0d0d0e] text-white"
            />
            <Input
              placeholder="Email"
              value={editData.email ?? ''}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              className="bg-[#0d0d0e] text-white"
            />
            <Input
              placeholder="Phone"
              value={editData.phone ?? ''}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
              className="bg-[#0d0d0e] text-white"
            />
            <select
              value={editData.property_id ?? ''}
              onChange={(e) =>
                setEditData({ ...editData, property_id: e.target.value })
              }
              className="w-full bg-[#0d0d0e] text-white p-2 rounded border border-gray-300"
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={cancelEdit}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveEdit}
                className="bg-[#302cfc] hover:bg-blue-700 text-white"
              >
                <Check size={14} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* View Mode */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-[#302cfc]">
                {tenant.full_name}
              </h3>
              <p className="text-gray-300 text-sm">{tenant.email}</p>
              <p className="text-gray-400 text-sm">{tenant.phone || 'No phone provided'}</p>
              <p className="text-gray-400 text-sm mt-1">
                <span className="font-medium">Property:</span>{' '}
                {properties.find((p) => p.id === tenant.property_id)?.address || '—'}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startEdit(tenant)}
                className="border border-blue-500 text-blue-400 hover:bg-blue-800"
              >
                <Edit size={16} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteTenant(tenant.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  ))}
</div>

      
      {loading && <p className="text-gray-400 mt-2">Loading tenants...</p>}
    </section>
  )
}