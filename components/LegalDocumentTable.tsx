'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

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

export default function LegalDocumentsTable() {
  const { user } = useUser()
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*, tenants(full_name), properties(address, realtor_id)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching documents:', error)
      } else {
        const filtered = (data || []).filter(
          (doc) => doc.properties?.realtor_id === user.id
        )
        setDocuments(filtered)
      }
      setLoading(false)
    }

    fetchDocuments()

    const channel = supabase
      .channel('legal_documents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'legal_documents' },
        () => fetchDocuments()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg text-gray-800">
        <h2 className="text-xl font-semibold mb-4">Legal Documents</h2>
        <p className="text-gray-400">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg text-gray-800">
      {/* Header with button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Legal Documents</h2>
        <Link
          href="/legal-doc"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-all duration-200"
        >
          📄 Document Templates
        </Link>
      </div>

      {documents.length === 0 ? (
        <p className="text-gray-400">No legal documents found.</p>
      ) : (
        <table className="w-full border-collapse flex flex-col">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Tenant</th>
              <th className="py-2 px-3">Property</th>
              <th className="py-2 px-3">File</th>
              <th className="py-2 px-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-300 hover:bg-gray/50"
              >
                <td className="py-2 px-3 capitalize">{doc.type}</td>
                <td className="py-2 px-3">{doc.tenants?.full_name || '—'}</td>
                <td className="py-2 px-3">{doc.properties?.address || '—'}</td>
                <td className="py-2 px-3">
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      View / Download
                    </a>
                  ) : (
                    <span className="text-gray-800">No file</span>
                  )}
                </td>
                <td className="py-2 px-3 text-gray-800 text-sm">
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}