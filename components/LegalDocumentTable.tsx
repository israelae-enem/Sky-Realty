'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface Tenant {
  full_name: string | null
}

interface Property {
  address: string | null
}

export interface LegalDocument {
  id: string
  type: string
  content: string
  file_url: string | null
  created_at: string
  tenant?: Tenant
  property?: Property
}

export default function LegalDocumentsTable({ realtorId }: { realtorId: string }) {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDocs = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('legal_documents')
      .select(
        `
        id, type, content, file_url, created_at,
        tenant:tenants(full_name),
        property:properties(address)
      `
      )
      .eq('realtor_id', realtorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast.error('Failed to load documents')
      setDocuments([])
    } else {
      // ✅ explicitly type the array
      setDocuments((data as unknown as LegalDocument[]) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (realtorId) fetchDocs()
  }, [realtorId])

  const deleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    setLoading(true)
    const { error } = await supabase.from('legal_documents').delete().eq('id', id)
    if (error) {
      console.error(error)
      toast.error('Failed to delete document')
    } else {
      toast.success('Document deleted')
      fetchDocs()
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Legal Documents</h2>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Tenant</th>
            <th className="px-4 py-2">Property</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-t border-gray-600 hover:bg-gray-700">
              <td className="px-4 py-2 capitalize">{doc.type}</td>
              <td className="px-4 py-2">{doc.tenant?.full_name || '—'}</td>
              <td className="px-4 py-2">{doc.property?.address || '—'}</td>
              <td className="px-4 py-2">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 flex gap-2">
                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-gray-400">No file</span>
                )}
                <button
                  onClick={() => deleteDoc(doc.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {documents.length === 0 && !loading && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-400">
                No legal documents found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {loading && <p className="mt-2 text-gray-400">Loading...</p>}
    </div>
  )
}