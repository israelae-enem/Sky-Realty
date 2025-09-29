'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUser, } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
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

export type PlanKey = 'free'| 'basic' | 'pro' | 'premium'
const PLAN_LIMITS: Record<PlanKey, number | null> = { free: 1, basic: 10, pro: 20, premium: null }

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
  plan: PlanKey| null
  propertyLimit: number
  realtorId: string
}

export default function PropertyTable({ plan, propertyLimit}: PropertyTableProps) {
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

    // Enforce plan limit
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



  // ----------------- edit/save -----------------
  const startEdit = (p: PropertyRow) => {
    setEditingId(p.id)
    setEditData({
      ...p,
      lease_start: dateToInput(p.lease_start),
      lease_end: dateToInput(p.lease_end),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

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

  // ----------------- delete -----------------
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

  // ----------------- upload after add (existing) -----------------
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
    } finally {
      setUploadingId(null)
    }
  }

  const handleDrop = (e: React.DragEvent, propId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFileForExisting(propId, file)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  // ----------------- render -----------------
  return (
    <section className="mt-6 bg-black p-4 rounded-md border border-gray-300 text-white">
      <h2 className="text-2xl mb-4 text-[#302cfc] font-semibold">Your Properties</h2>

      {/* search + plan */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input
          placeholder="Search title, address, or status..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-black text-white md:w-1/3"
        />
        <div className="text-sm text-gray-400">
          Your Plan: {propertyLimit === Infinity ? 'premium (unlimited)' : plan?.charAt(0).toUpperCase() + (plan ?? '').slice(1)} {propertyLimit === Infinity ? '(unlimited)' : `(Limit: ${propertyLimit})`}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-gray-300 bg-black">
        <Table className="min-w-full text-white">
          <TableHeader>
            <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
              <th className="text-left p-3 text-white">Title</th>
              <th className="text-left p-3 text-white">Address</th>
              <th className="text-left p-3 text-white">Status</th>
              <th className="text-left p-3 text-white">Lease Start</th>
              <th className="text-left p-3 text-white">Lease End</th>
              <th className="text-left p-3 text-white">Lease File</th>
              <th className="text-center p-3 text-white">Actions</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Add row */}
            <TableRow className='hover:bg-black focus:bg-black active:bg-black'>

              <TableCell className="p-2">
                <Input
                  placeholder="Title"
                  value={newProperty.title ?? ''}
                  onChange={(e) => setNewProperty((s) => ({ ...(s || {}), title: e.target.value }))}
                  className="bg-black text-white focus:ring focus:ring-[#302cfc]"
                />
              </TableCell>

              <TableCell className="p-2">
                <Input
                  placeholder="Address"
                  value={newProperty.address ?? ''}
                  onChange={(e) => setNewProperty((s) => ({ ...(s || {}), address: e.target.value }))}
                  className="bg-black text-white focus:ring focus:ring-[#302cfc]"
                />
              </TableCell>

              <TableCell className="p-2">
                <Select value={(newProperty.status as string) ?? 'Vacant'} onValueChange={(val) => setNewProperty((s) => ({ ...(s || {}), status: val as PropertyStatus }))}>
                  <SelectTrigger className="w-[140px] bg-black border">
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
                  value={newProperty.lease_start ?? ''}
                  onChange={(e) => setNewProperty((s) => ({ ...(s || {}), lease_start: e.target.value }))}
                  className="bg-black text-white focus:ring focus:ring-[#302cfc]"
                />
              </TableCell>

              <TableCell className="p-2">
                <Input
                  type="date"
                  value={newProperty.lease_end ?? ''}
                  onChange={(e) => setNewProperty((s) => ({ ...(s || {}), lease_end: e.target.value }))}
                  className="bg-black text-white focus:ring focus:ring-[#302cfc]"
                />
              </TableCell>

              <TableCell className="p-2 text-center">Upload after Add</TableCell>

              <TableCell className="p-2 text-center">
                <Button size="sm" onClick={addProperty} disabled={adding || (propertyLimit !== null && properties.length >= (propertyLimit ?? 0))}>
                  {adding ? 'Adding…' : 'Add'}
                </Button>
              </TableCell>
            </TableRow>

            {/* Rows */}
            {paginated.length === 0 && !loading ? (
              <TableRow className='hover:bg-black focus:bg-black active:bg-black'>

                <TableCell colSpan={7} className="text-center py-6">No properties found</TableCell>
              </TableRow>
            ) : null}

            {paginated.map((p) => (
              <TableRow key={p.id} className='hover:bg-black focus:bg-black active:bg-black'>

                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input value={String(editData.title ?? '')} onChange={(e) => setEditData((s) => ({ ...(s || {}), title: e.target.value }))} className="bg-black text-white focus:ring focus:ring-[#302cfc]" />
                  ) : (
                    p.title
                  )}
                </TableCell>

                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input value={String(editData.address ?? '')} onChange={(e) => setEditData((s) => ({ ...(s || {}), address: e.target.value }))} className="bg-black text-white focus:ring focus:ring-[#302cfc]" />
                  ) : (
                    p.address
                  )}
                </TableCell>

                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Select value={String(editData.status ?? p.status)} onValueChange={(val) => setEditData((s) => ({ ...(s || {}), status: val as PropertyStatus }))}>
                      <SelectTrigger className="w-[140px] bg-black border">
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
                    <Input type="date" value={String(editData.lease_start ?? dateToInput(p.lease_start))} onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_start: e.target.value }))} className="bg-black text-white focus:ring focus:ring-[#302cfc]" />
                  ) : (
                    p.lease_start ?? '-'
                  )}
                </TableCell>

                <TableCell className="p-2">
                  {editingId === p.id ? (
                    <Input type="date" value={String(editData.lease_end ?? dateToInput(p.lease_end))} onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_end: e.target.value }))} className="bg-black text-white focus:ring focus:ring-[#302cfc]" />
                  ) : (
                    p.lease_end ?? '-'
                  )}
                </TableCell>

                <TableCell className="p-2">
                  <div className="flex items-center gap-3">
                    {p.lease_file ? (
                      <a href={p.lease_file} target="_blank" rel="noreferrer" className="text-blue-400 underline break-all">View</a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}

                    <label className="cursor-pointer text-sm text-blue-400 flex items-center gap-1" title="Upload lease file">
                      <Upload size={14} />
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFileForExisting(p.id, e.target.files[0])} />
                    </label>
                  </div>

                  <div onDrop={(e) => handleDrop(e as React.DragEvent, p.id)} onDragOver={handleDragOver} className="mt-2 p-2 rounded border border-gray-700 text-xs text-gray-400">
                    Drag & drop file here
                    {uploadingId === p.id && <span className="ml-2 text-sm text-gray-300">Uploading…</span>}
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
        <div className="bg-black border border-gray-300 p-3 rounded">
          <Input placeholder="Title" value={newProperty.title ?? ''} onChange={(e) => setNewProperty((s) => ({ ...(s || {}), title: e.target.value }))} className="mb-2 bg-black text-white" />
          <Input placeholder="Address" value={newProperty.address ?? ''} onChange={(e) => setNewProperty((s) => ({ ...(s || {}), address: e.target.value }))} className="mb-2 bg-black text-white" />
          <Select value={(newProperty.status as string) ?? 'Vacant'} onValueChange={(val) => setNewProperty((s) => ({ ...(s || {}), status: val as PropertyStatus }))}>
            <SelectTrigger className="w-full bg-black border border-gray-600 mb-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Vacant">Vacant</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 mb-2">
            <Input type="date" value={newProperty.lease_start ?? ''} onChange={(e) => setNewProperty((s) => ({ ...(s || {}), lease_start: e.target.value }))} className="bg-black text-white" />
            <Input type="date" value={newProperty.lease_end ?? ''} onChange={(e) => setNewProperty((s) => ({ ...(s || {}), lease_end: e.target.value }))} className="bg-black text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Upload after add</span>
            <Button size="sm" onClick={addProperty} disabled={adding || (propertyLimit !== null && properties.length >= (propertyLimit ?? 0))}>{adding ? 'Adding…' : 'Add'}</Button>
          </div>
        </div>

        {/* Existing cards */}
        {paginated.length === 0 && !loading ? <div className="text-center text-white py-6">No properties found</div> : null}

        {paginated.map((p) => (
          <div key={p.id} className="bg-black border border-gray-300 p-3 rounded">
            {editingId === p.id ? (
              <>
                <Input className="mb-2 bg-black text-white" value={String(editData.title ?? '')} onChange={(e) => setEditData((s) => ({ ...(s || {}), title: e.target.value }))} />
                <Input className="mb-2 bg-black text-white" value={String(editData.address ?? '')} onChange={(e) => setEditData((s) => ({ ...(s || {}), address: e.target.value }))} />
                <Select value={String(editData.status ?? 'Vacant')} onValueChange={(val) => setEditData((s) => ({ ...(s || {}), status: val as PropertyStatus }))}>
                  <SelectTrigger className="w-full bg-black border mb-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" className="mb-2 bg-black text-white" value={String(editData.lease_start ?? dateToInput(p.lease_start))} onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_start: e.target.value }))} />
                <Input type="date" className="mb-2 bg-black text-white" value={String(editData.lease_end ?? dateToInput(p.lease_end))} onChange={(e) => setEditData((s) => ({ ...(s || {}), lease_end: e.target.value }))} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit}><Check size={14} /></Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}><X size={14} /></Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-400">{p.address}</div>
                    <div className="text-sm text-gray-400">Lease: {p.lease_start ?? '-'} → {p.lease_end ?? '-'}</div>
                  </div>
                  <div className="text-sm text-white">{p.status}</div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => startEdit(p)}><Edit size={14} /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteProperty(p.id)}><Trash size={14} /></Button>

                  {p.lease_file ? (
                    <a href={p.lease_file} target="_blank" rel="noreferrer" className="ml-auto text-blue-400 underline">View</a>
                  ) : (
                    <label className="ml-auto cursor-pointer text-sm text-blue-400 underline flex items-center gap-1">
                      <Upload size={14} />
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFileForExisting(p.id, e.target.files[0])} />
                      Upload
                    </label>
                  )}
                </div>

                <div onDrop={(e) => handleDrop(e as React.DragEvent, p.id)} onDragOver={handleDragOver} className="mt-2 p-2 rounded border border-gray-700 text-xs text-gray-400">
                  Drag & drop file here
                  {uploadingId === p.id && <span className="ml-2 text-sm text-gray-300">Uploading…</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* pagination */}
      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
        <div className="text-white">
          Rows per page:
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="ml-2 bg-black border border-gray-600 text-white p-1 rounded">
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 text-white">
          <Button size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Prev</Button>
          <div>Page {page} of {totalPages}</div>
          <Button size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</Button>
        </div>
      </div>
    </section>
  )

}

