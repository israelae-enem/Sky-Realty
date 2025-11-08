'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash, Edit, Check, X, Upload } from 'lucide-react'

export type PlanKey = 'free' | 'basic' | 'pro' | 'premium'
const PLAN_LIMITS: Record<PlanKey, number | null> = { free: 0, basic: 10, pro: 20, premium: null }

export type PropertyStatus = 'Vacant' | 'Occupied' | 'Pending'

export interface PropertyRow {
  id: string
  title: string
  address: string
  status: PropertyStatus
  lease_start: string | null
  lease_end: string | null
  lease_file: string | null
  realtor_id: string
  created_at?: string
}

export interface PropertyTableProps {
  plan: PlanKey | null
  propertyLimit: number
  realtorId: string
}

export default function PropertyTable({ plan, propertyLimit }: PropertyTableProps) {
  const { user } = useUser()
  const realtorId = user?.id ?? null
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [loading, setLoading] = useState(false)
  const [newProperty, setNewProperty] = useState<Partial<PropertyRow>>({
    title: '',
    address: '',
    status: 'Vacant',
    lease_start: '',
    lease_end: '',
    lease_file: null,
  })
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PropertyRow>>({})
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const searchRef = useRef<number | null>(null)

  const dateToInput = (d?: string | null) => (d ? String(d).slice(0, 10) : '')
  const inputToSaveDate = (v: string | undefined | null) => (v && v !== '' ? v : null)

  // ---------------- Fetch Properties ----------------
  useEffect(() => {
    if (!realtorId) return
    let mounted = true
    setLoading(true)

    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('realtor_id', realtorId)
          .order('created_at', { ascending: false })
        if (!error && mounted && data) setProperties(data as PropertyRow[])
      } catch (err) {
        console.error('fetchProperties error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProperties()

    const channel = supabase
      .channel(`properties-realtor-${realtorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties', filter: `realtor_id=eq.${realtorId}` },
        () => {
          supabase
            .from('properties')
            .select('*')
            .eq('realtor_id', realtorId)
            .order('created_at', { ascending: false })
            .then(({ data }) => data && setProperties(data as PropertyRow[]))
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  // ---------------- Search + Pagination ----------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return properties
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q)
    )
  }, [properties, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const handleSearch = (val: string) => {
    setSearch(val)
    window.clearTimeout(searchRef.current as number)
    searchRef.current = window.setTimeout(() => setPage(1), 200)
  }

  // ---------------- Add Property ----------------
  const addProperty = async () => {
    if (!realtorId) return alert('You must be signed in.')
    if (propertyLimit !== null && propertyLimit >= 0 && properties.length >= propertyLimit) {
      return alert(`Property limit reached for your plan (${plan}). Upgrade to add more.`)
    }
    if (!newProperty.title || !newProperty.address) return alert('Title and address required.')

    setAdding(true)
    const newId = crypto.randomUUID()
    const payload: Partial<PropertyRow> = {
      id: newId,
      title: String(newProperty.title),
      address: String(newProperty.address),
      status: (newProperty.status as PropertyStatus) || 'Vacant',
      lease_start: inputToSaveDate(String(newProperty.lease_start ?? '')),
      lease_end: inputToSaveDate(String(newProperty.lease_end ?? '')),
      lease_file: newProperty.lease_file ?? null,
      realtor_id: realtorId,
      created_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from('properties').insert([payload]).select().single()
      if (error) throw error
      const inserted = (data as PropertyRow) || (payload as PropertyRow)
      setProperties((prev) => [inserted, ...prev])
      setNewProperty({ title: '', address: '', status: 'Vacant', lease_start: '', lease_end: '', lease_file: null })
      setPage(1)
    } catch (err: any) {
      console.error('addProperty error', err)
      alert('Failed to add property: ' + (err?.message || err))
    } finally {
      setAdding(false)
    }
  }

  // ---------------- Edit / Delete / Upload ----------------
  const startEdit = (p: PropertyRow) => { setEditingId(p.id); setEditData({ ...p, lease_start: dateToInput(p.lease_start), lease_end: dateToInput(p.lease_end) }) }
  const cancelEdit = () => { setEditingId(null); setEditData({}) }
  const saveEdit = async () => {
    if (!editingId) return
    const payload: Partial<PropertyRow> = {
      title: String(editData.title ?? ''),
      address: String(editData.address ?? ''),
      status: (editData.status as PropertyStatus) || 'Vacant',
      lease_start: inputToSaveDate(String(editData.lease_start ?? '')),
      lease_end: inputToSaveDate(String(editData.lease_end ?? '')),
    }
    try {
      const { error } = await supabase.from('properties').update(payload).eq('id', editingId)
      if (error) throw error
      setProperties((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...payload } as PropertyRow : p)))
      cancelEdit()
    } catch (err: any) {
      console.error('saveEdit error', err)
      alert('Failed to save: ' + (err?.message || err))
    }
  }
  const deleteProperty = async (id: string) => {
    if (!confirm('Delete this property?')) return
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      console.error('delete error', err)
      alert('Failed to delete: ' + (err?.message || err))
    }
  }
  const uploadFileForExisting = async (propId: string, file: File) => {
    setUploadingId(propId)
    try {
      const fileName = `${propId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      const publicUrl = (urlData as any)?.publicUrl ?? null
      const { error: updateError } = await supabase.from('properties').update({ lease_file: publicUrl }).eq('id', propId)
      if (updateError) throw updateError
      setProperties((prev) => prev.map((p) => (p.id === propId ? { ...p, lease_file: publicUrl } : p)))
    } catch (err: any) {
      console.error('upload error', err)
      alert('Upload failed: ' + (err?.message || err))
    } finally { setUploadingId(null) }
  }
  const handleDrop = (e: React.DragEvent, propId: string) => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files?.[0]; if (file) uploadFileForExisting(propId, file) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }

  // ----------------- Render -----------------
  return (
    <section className="mt-6 bg-white p-4 rounded-md border border-gray-200 text-gray-900">
      <h2 className="text-2xl mb-4 text-blue-700 font-accent font-semibold">Your Properties</h2>

      {/* Search + Plan */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input
          placeholder="Search title, address, or status..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="md:w-1/3 bg-gray-50 text-gray-900 border-gray-300"
        />
        <div className="text-sm text-gray-500">
          Your Plan: {propertyLimit === Infinity ? 'Premium (unlimited)' : plan?.charAt(0).toUpperCase() + (plan ?? '').slice(1)} {propertyLimit === Infinity ? '(unlimited)' : `(Limit: ${propertyLimit})`}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-gray-200">
        <Table className="min-w-full text-gray-900">
          <TableHeader>
            <TableRow>
              <TableCell className="p-3 font-medium">Title</TableCell>
              <TableCell className="p-3 font-medium">Address</TableCell>
              <TableCell className="p-3 font-medium">Status</TableCell>
              <TableCell className="p-3 font-medium">Lease Start</TableCell>
              <TableCell className="p-3 font-medium">Lease End</TableCell>
              <TableCell className="p-3 font-medium">Lease File</TableCell>
              <TableCell className="p-3 font-medium text-center">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Add row */}
            <TableRow>
              <TableCell className="p-2">
                <Input
                  placeholder="Title/Type of Property"
                  value={newProperty.title ?? ''}
                  onChange={(e) => setNewProperty((s) => ({ ...(s || {}), title: e.target.value }))}
                  className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  placeholder="Address"
                  value={newProperty.address ?? ''}
                  onChange={(e) => setNewProperty((s) => ({ ...(s || {}), address: e.target.value }))}
                                    className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                />
              </TableCell>
              <TableCell className="p-2">
                <Select
                  value={(newProperty.status as string) ?? 'Vacant'}
                  onValueChange={(val) =>
                    setNewProperty((s) => ({ ...(s || {}), status: val as PropertyStatus }))
                  }
                >
                  <SelectTrigger className="w-[140px] border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="date"
                  placeholder='lease start'
                  value={newProperty.lease_start ?? ''}
                  onChange={(e) =>
                    setNewProperty((s) => ({ ...(s || {}), lease_start: e.target.value }))
                  }
                  className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="date"
                  placeholder='lease end'
                  value={newProperty.lease_end ?? ''}
                  onChange={(e) =>
                    setNewProperty((s) => ({ ...(s || {}), lease_end: e.target.value }))
                  }
                  className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                />
              </TableCell>
              <TableCell className="p-2 text-center text-gray-500">Upload after Add</TableCell>
              <TableCell className="p-2 text-center">
                <Button
                  size="sm"
                  onClick={addProperty}
                  disabled={adding || (propertyLimit !== null && properties.length >= (propertyLimit ?? 0))}
                >
                  {adding ? 'Adding…' : 'Add'}
                </Button>
              </TableCell>
            </TableRow>

            {/* Existing property rows */}
            {paginated.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No properties found
                </TableCell>
              </TableRow>
            ) : null}

            {paginated.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input
                      value={String(editData.title ?? '')}
                      onChange={(e) => setEditData((s) => ({ ...(s || {}), title: e.target.value }))}
                      className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                    />
                  ) : (
                    p.title
                  )}
                </TableCell>
                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input
                      value={String(editData.address ?? '')}
                      onChange={(e) => setEditData((s) => ({ ...(s || {}), address: e.target.value }))}
                      className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                    />
                  ) : (
                    p.address
                  )}
                </TableCell>
                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Select
                      value={String(editData.status ?? p.status)}
                      onValueChange={(val) =>
                        setEditData((s) => ({ ...(s || {}), status: val as PropertyStatus }))
                      }
                    >
                      <SelectTrigger className="w-[140px] border border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vacant">Vacant</SelectItem>
                        <SelectItem value="Occupied">Occupied</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    p.status
                  )}
                </TableCell>
                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input
                      type="date"
                      value={String(editData.lease_start ?? dateToInput(p.lease_start))}
                      onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_start: e.target.value }))}
                      className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                    />
                  ) : (
                    p.lease_start ?? '-'
                  )}
                </TableCell>
                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input
                      type="date"
                      value={String(editData.lease_end ?? dateToInput(p.lease_end))}
                      onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_end: e.target.value }))}
                      className="bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500"
                    />
                  ) : (
                    p.lease_end ?? '-'
                  )}
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex flex-col gap-1">
                    {p.lease_file ? (
                      <a href={p.lease_file} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                        View
                      </a>
                    ) : (
                      <label className="cursor-pointer text-sm text-blue-600 flex items-center gap-1">
                        <Upload size={14} />
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && uploadFileForExisting(p.id, e.target.files[0])}
                        />
                        Upload
                      </label>
                    )}
                    <div
                      onDrop={(e) => handleDrop(e as React.DragEvent, p.id)}
                      onDragOver={handleDragOver}
                      className="mt-1 p-2 rounded border border-gray-300 text-xs text-gray-500"
                    >
                      Drag & drop file here
                      {uploadingId === p.id && <span className="ml-2 text-sm text-gray-500">Uploading…</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="p-2 text-center">
                  {editingId === p.id ? (
                    <div className="flex justify-center gap-2">
                      <Button size="sm" onClick={saveEdit}><Check size={16} /></Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}><X size={16} /></Button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <Button size="sm" onClick={() => startEdit(p)}><Edit size={16} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProperty(p.id)}><Trash size={16} /></Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Add card */}
        <div className="border border-gray-200 p-4 rounded bg-gray-50">
          <Input
            placeholder="Title"
            value={newProperty.title ?? ''}
            onChange={(e) => setNewProperty((s) => ({ ...(s || {}), title: e.target.value }))}
            className="mb-2 bg-white text-gray-900 border-gray-300"
          />
          <Input
            placeholder="Address"
            value={newProperty.address ?? ''}
            onChange={(e) => setNewProperty((s) => ({ ...(s || {}), address: e.target.value }))}
            className="mb-2 bg-white text-gray-900 border-gray-300"
          />
          <Select
            value={(newProperty.status as string) ?? 'Vacant'}
            onValueChange={(val) => setNewProperty((s) => ({ ...(s || {}), status: val as PropertyStatus }))}
          >
            <SelectTrigger className="w-full border border-gray-300 mb-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Vacant">Vacant</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 mb-2">
            <Input
              type="date"
              placeholder='lease start'
              value={newProperty.lease_start ?? ''}
              onChange={(e) => setNewProperty((s) => ({ ...(s || {}), lease_start: e.target.value }))}
              className="bg-white text-gray-900 border-gray-300"
            />
            <Input
              type="date"
              placeholder='lease end'
              value={newProperty.lease_end ?? ''}
              onChange={(e) => setNewProperty((s) => ({ ...(s || {}), lease_end: e.target.value }))}
              className="bg-white text-gray-900 border-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Upload after add</span>
            <Button
              size="sm"
              onClick={addProperty}
              disabled={adding || (propertyLimit !== null && properties.length >= (propertyLimit ?? 0))}
            >
              {adding ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </div>

        {/* Existing property cards */}
        {paginated.length === 0 && !loading ? (
          <div className="text-center text-gray-500 py-6">No properties found</div>
        ) : null}

        {paginated.map((p) => (
          <div key={p.id} className="border border-gray-200 p-4 rounded bg-white flex flex-col gap-2">
            {editingId === p.id ? (
              <>
                <Input
                  value={String(editData.title ?? '')}
                  onChange={(e) => setEditData((s) => ({ ...(s || {}), title: e.target.value }))}
                  className="mb-2 bg-gray-50 text-gray-900 border-gray-300"
                />
                <Input
                  value={String(editData.address ?? '')}
                  onChange={(e) => setEditData((s) => ({ ...(s || {}), address: e.target.value }))}
                  className="mb-2 bg-gray-50 text-gray-900 border-gray-300"
                />
                <Select
                  value={String(editData.status ?? 'Vacant')}
                  onValueChange={(val) => setEditData((s) => ({ ...(s || {}), status: val as PropertyStatus }))}
                >
                  <SelectTrigger className="w-full border border-gray-300 mb-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="date"
                    value={String(editData.lease_start ?? dateToInput(p.lease_start))}
                    onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_start: e.target.value }))}
                    className="bg-gray-50 text-gray-900 border-gray-300"
                  />
                  <Input
                    type="date"
                    value={String(editData.lease_end ?? dateToInput(p.lease_end))}
                    onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_end: e.target.value }))}
                    className="bg-gray-50 text-gray-900 border-gray-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit}><Check size={14} /></Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}><X size={14} /></Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.address}</div>
                    <div className="text-sm text-gray-500">Lease: {p.lease_start ?? '-'} → {p.lease_end ?? '-'}</div>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{p.status}</div>
                </div>

                <div className="flex gap-2 mt-2 items-center">
                  <Button size="sm" onClick={() => startEdit(p)}><Edit size={14} /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteProperty(p.id)}><Trash size={14} /></Button>

                  {p.lease_file ? (
                    <a href={p.lease_file} target="_blank" rel="noreferrer" className="ml-auto text-blue-600 underline">View</a>
                  ) : (
                    <label className="ml-auto cursor-pointer text-sm text-blue-600 flex items-center gap-1">
                      <Upload size={14} />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadFileForExisting(p.id, e.target.files[0])}
                      />
                      Upload
                    </label>
                  )}
                </div>

                <div
                  onDrop={(e) => handleDrop(e as React.DragEvent, p.id)}
                  onDragOver={handleDragOver}
                  className="mt-2 p-2 rounded border border-gray-300 text-xs text-gray-500"
                >
                  Drag & drop file here
                  {uploadingId === p.id && <span className="ml-2 text-sm text-gray-500">Uploading…</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
        <div className="text-gray-700">
          Rows per page:
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="ml-2 border border-gray-300 text-gray-700 p-1 rounded"
          >
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <Button size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Prev</Button>
          <div>Page {page} of {totalPages}</div>
          <Button size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</Button>
        </div>
      </div>
    </section>
  )
}