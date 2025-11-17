'use client'

import { useState, useEffect } from 'react'
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

interface LegalDocumentFormProps {
  defaultValues?: LegalDocument
  onSuccess?: () => void
  realtorId?: string
  companyId?: string
}

export default function LegalDocumentForm({ defaultValues, onSuccess, realtorId, companyId }: LegalDocumentFormProps) {
  const [type, setType] = useState(defaultValues?.type || 'lease')
  const [tenantId, setTenantId] = useState(defaultValues?.tenant_id || '')
  const [propertyId, setPropertyId] = useState(defaultValues?.property_id || '')
  const [content, setContent] = useState(defaultValues?.content || '')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [documents, setDocuments] = useState<LegalDocument[]>([])

  const ownerColumn = realtorId ? 'realtor_id' : 'company_id'
  const ownerId = realtorId || companyId || ''

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!ownerId) return

        const [propsRes, tenantsRes, docsRes] = await Promise.all([
          supabase.from('properties').select('id, address').eq(ownerColumn, ownerId),
          supabase.from('tenants').select('id, full_name').eq(ownerColumn, ownerId),
          supabase
            .from('legal_documents')
            .select('*, tenants(full_name), properties(address)')
            .order('created_at', { ascending: false }),
        ])

        setProperties(propsRes.data || [])
        setTenants(tenantsRes.data || [])
        setDocuments(docsRes.data || [])
      } catch (err) {
        console.error('❌ Fetch failed:', err)
        toast.error('Failed to load data')
      }
    }

    fetchData()
  }, [ownerId, ownerColumn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ownerId) {
      toast.error('Missing realtor or company ID')
      return
    }

    setLoading(true)
    try {
      let fileUrl: string | null = defaultValues?.file_url || null

      if (file) {
        const filePath = `legal/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(filePath)
        fileUrl = publicUrl.publicUrl
      }

      if (defaultValues?.id) {
        // Edit
        const { data, error } = await supabase
          .from('legal_documents')
          .update({ type, tenant_id: tenantId, property_id: propertyId, content, file_url: fileUrl, updated_at: new Date().toISOString() })
          .eq('id', defaultValues.id)
          .select('*, tenants(full_name), properties(address)')
          .single()
        if (error) throw error
        toast.success('Legal document updated!')
        setDocuments(prev => prev.map(doc => doc.id === data.id ? data : doc))
      } else {
        // Create
        const { data, error } = await supabase
          .from('legal_documents')
          .insert({
            id: crypto.randomUUID(),
            [ownerColumn]: ownerId,
            type,
            tenant_id: tenantId,
            property_id: propertyId,
            content,
            file_url: fileUrl,
            created_at: new Date().toISOString()
          })
          .select('*, tenants(full_name), properties(address)')
          .single()
        if (error) throw error
        toast.success('Legal document created!')
        setDocuments(prev => [data, ...prev])
      }

      // Reset form
      setType('lease')
      setTenantId('')
      setPropertyId('')
      setContent('')
      setFile(null)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-md border border-gray-400 text-gray-800 space-y-4 mt-5 mb-6">
        <h2 className="text-xl font-semibold">{defaultValues ? 'Edit Legal Document' : 'New Legal Document'}</h2>

        <div>
          <label className="block text-sm mb-1">Document Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-500 text-white px-3 py-2 rounded">
            <option value="lease">Lease</option>
            <option value="notice">Notice</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tenant</label>
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full bg-gray-300 text-gray-800 px-3 py-2 rounded">
            <option value="">Select tenant</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Property</label>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full bg-gray-100 text-gray-800 px-3 py-2 rounded">
            <option value="">Select property</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Content (optional)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write content here..."
            className="w-full bg-gray-100 text-gray-800 px-3 py-2 rounded h-28"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Upload File (any type)</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-700" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-50">
          {loading ? 'Saving...' : defaultValues ? 'Update Document' : 'Save Document'}
        </button>
      </form>

      {/* Table */}
      <div className="bg-gray-100 p-6 rounded-lg text-gray-800">
        <h2 className="text-xl font-semibold mb-4">Legal Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-700">No documents yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-500 text-left">
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Tenant</th>
                <th className="py-2 px-3">Property</th>
                <th className="py-2 px-3">File</th>
                <th className="py-2 px-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} className="border-b border-gray-500 hover:bg-gray-500/50">
                  <td className="py-2 px-3 capitalize">{doc.type}</td>
                  <td className="py-2 px-3">{doc.tenants?.full_name || '—'}</td>
                  <td className="py-2 px-3">{doc.properties?.address || '—'}</td>
                  <td className="py-2 px-3">
                    {doc.file_url ? (
                      <a href={doc.file_url} target="_blank" className="text-blue-400 hover:underline">View / Download</a>
                    ) : (
                      <span className="text-gray-800">No file</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-800 text-sm">{new Date(doc.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}