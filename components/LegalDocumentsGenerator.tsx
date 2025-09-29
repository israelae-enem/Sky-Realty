'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import jsPDF from 'jspdf'

interface LegalDocumentGeneratorProps {
  realtorId: string
  tenantId: string
  propertyId: string
}

export const LegalDocumentGenerator = ({ realtorId, tenantId, propertyId }: LegalDocumentGeneratorProps) => {
  const [type, setType] = useState('lease')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentDocs, setRecentDocs] = useState<any[]>([])

  // ✅ Fetch recent documents
  const fetchRecentDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      setRecentDocs(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRecentDocs()
  }, [realtorId])

  // ✅ Generate auto-filled template
  const generateTemplate = async () => {
    setLoading(true)
    try {
      const { data: tenant } = await supabase
        .from('tenant')
        .select('full_name')
        .eq('id', tenantId)
        .single()
      const { data: property } = await supabase
        .from('property')
        .select('address, rent_amount, lease_start, lease_end')
        .eq('id', propertyId)
        .single()

      const templateText = `
${type.toUpperCase()} Agreement

Tenant: ${tenant?.full_name || '[Tenant Name]'}
Property: ${property?.address || '[Property Address]'}
Rent: $${property?.rent_amount || '[Amount]'}
Lease Start: ${property?.lease_start || '[Start Date]'}
Lease End: ${property?.lease_end || '[End Date]'}

Terms and conditions apply...
`
      setContent(templateText)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate template')
    }
    setLoading(false)
  }

  // ✅ Save document to Supabase
  const saveDocument = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .insert([{ realtor_id: realtorId, tenant_id: tenantId, property_id: propertyId, type, content }])
        .select()
        .single()
      if (error) throw error
      toast.success('Document saved!')
      fetchRecentDocs()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save document')
    }
    setLoading(false)
  }

  // ✅ Download PDF
  const downloadPDF = () => {
    if (!content) return toast.error('Nothing to download')
    const doc = new jsPDF()
    doc.setFontSize(12)
    doc.text(content, 10, 10)
    doc.save(`${type}_${tenantId}.pdf`)
  }

  return (
    <div className="bg-gray-800 p-4 rounded-md text-white space-y-4 max-w-lg">
      {/* Template selection */}
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 rounded bg-gray-700">
        <option value="lease">Lease</option>
        <option value="notice">Notice</option>
        <option value="contract">Contract</option>
      </select>

      {/* Generate Template */}
      <button
        onClick={generateTemplate}
        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
      >
        Generate Template
      </button>

      {/* Editable content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-60 p-2 rounded bg-gray-700"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={saveDocument}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
        >
          {loading ? 'Saving...' : 'Save Document'}
        </button>

        <button
          onClick={downloadPDF}
          className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* Recent Documents */}
      <div className="mt-4">
        <h3 className="text-white font-semibold mb-2">Recent Documents</h3>
        <ul className="space-y-2">
          {recentDocs.map((doc) => (
            <li key={doc.id} className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded">
              <span>{doc.type.toUpperCase()} - {new Date(doc.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    View
                  </a>
                )}
                <button
                  onClick={() => setContent(doc.content)}
                  className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
          {recentDocs.length === 0 && <li className="text-gray-400">No documents yet.</li>}
        </ul>
      </div>
    </div>
  )
}

export default LegalDocumentGenerator