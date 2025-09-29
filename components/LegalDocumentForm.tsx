'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function LegalDocumentForm() {
  const [type, setType] = useState('lease')
  const [tenantId, setTenantId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl: string | null = null

      // ✅ Upload file if provided
      if (file) {
        const filePath = `legal/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (error) throw error

        const { data: publicUrl } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        fileUrl = publicUrl.publicUrl
      }

      // ✅ Insert into DB
      const { error: insertError } = await supabase.from('legal_documents').insert({
        type,
        tenant_id: tenantId,
        property_id: propertyId,
        content,
        file_url: fileUrl,
      })

      if (insertError) throw insertError

      toast.success('Legal document created!')
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
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-4 rounded-lg text-white space-y-4 mb-6"
    >
      <h2 className="text-xl font-semibold">New Legal Document</h2>

      {/* Type */}
      <div>
        <label className="block text-sm mb-1">Document Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        >
          <option value="lease">Lease</option>
          <option value="notice">Notice</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      {/* Tenant */}
      <div>
        <label className="block text-sm mb-1">Tenant ID</label>
        <input
          type="text"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          placeholder="Enter tenant ID"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        />
      </div>

      {/* Property */}
      <div>
        <label className="block text-sm mb-1">Property ID</label>
        <input
          type="text"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          placeholder="Enter property ID"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm mb-1">Content (optional if uploading file)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write content here..."
          className="w-full bg-gray-700 text-white px-3 py-2 rounded h-28"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm mb-1">Upload File (PDF/DOCX)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-300"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Document'}
      </button>
    </form>
  )
}