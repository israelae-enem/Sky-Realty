import LegalDocumentForm from '@/components/LegalDocumentForm'
import LegalDocumentsTable from '@/components/LegalDocumentTable'
export default function LegalDocsPage() {
  return (
    <div className="space-y-6">
      <LegalDocumentForm />
      <LegalDocumentsTable realtorId='user.id' />
    </div>
  )
}