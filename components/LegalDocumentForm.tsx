'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface Tenant {
  id: string
  full_name: string
}

interface Property {
  id: string
  address: string
}

interface LegalDocument {
  id: string
  type: string
  tenant_id: string
  property_id: string
  file_url: string | null
  content: string | null
  created_at: string
  tenants?: { full_name: string }
  properties?: { address: string }
}

export default function LegalDocumentManager() {
  const { user } = useUser()
  const [type, setType] = useState('lease')
  const [tenantId, setTenantId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [documents, setDocuments] = useState<LegalDocument[]>([])

  // 🧩 Fetch properties, tenants, and existing documents
  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        const [{ data: props }, { data: tnts }, { data: docs }] = await Promise.all([
          supabase.from('properties').select('id, address').eq('realtor_id', user.id),
          supabase.from('tenants').select('id, full_name').eq('realtor_id', user.id),
          supabase
            .from('legal_documents')
            .select('*, tenants(full_name), properties(address)')
            .order('created_at', { ascending: false }),
        ])

        setProperties(props || [])
        setTenants(tnts || [])
        setDocuments(docs || [])
      } catch (err) {
        console.error('❌ Fetch failed:', err)
        toast.error('Failed to load data')
      }
    }

    fetchData()
  }, [user?.id])

  // 🧾 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl: string | null = null

      if (file) {
        const filePath = `legal/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(filePath)
        fileUrl = publicUrl.publicUrl
      }

      const { data, error: insertError } = await supabase
        .from('legal_documents')
        .insert({
          type,
          tenant_id: tenantId,
          property_id: propertyId,
          content,
          file_url: fileUrl,
          created_at: new Date().toISOString(),
        })
        .select('*, tenants(full_name), properties(address)')
        .single()

      if (insertError) throw insertError

      toast.success('Legal document created!')
      setDocuments((prev) => [data, ...prev]) // instantly add to table
      setType('lease')
      setTenantId('')
      setPropertyId('')
      setContent('')
      setFile(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create document')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 📝 Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d0d0e] p-6 rounded-lg text-white space-y-4 mb-6 ">
        <h2 className="text-xl font-semibold">New Legal Document</h2>

        <div>
          <label className="block text-sm mb-1">Document Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded">
            <option value="lease">Lease</option>
            <option value="notice">Notice</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tenant</label>
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded">
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Property</label>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded">
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.address}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Content (optional)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write content here..."
            className="w-full bg-gray-700 text-white px-3 py-2 rounded h-28"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Upload File (any type)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Document'}
        </button>
      </form>

      {/* 📜 Table */}
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2 className="text-xl font-semibold mb-4">Legal Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-400">No documents yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Tenant</th>
                <th className="py-2 px-3">Property</th>
                <th className="py-2 px-3">File</th>
                <th className="py-2 px-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-2 px-3 capitalize">{doc.type}</td>
                  <td className="py-2 px-3">{doc.tenants?.full_name || '—'}</td>
                  <td className="py-2 px-3">{doc.properties?.address || '—'}</td>
                  <td className="py-2 px-3">
                    {doc.file_url ? (
                      <a href={doc.file_url} target="_blank" className="text-blue-400 hover:underline">
                        View / Download
                      </a>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-400 text-sm">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}