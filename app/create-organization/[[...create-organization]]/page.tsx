'use client'

import { CreateOrganization, useUser } from '@clerk/nextjs'

export default function CreateOrganizationPage() {
  const { user } = useUser()

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      {user ? (
        <CreateOrganization
          afterCreateOrganizationUrl={`/realtor/${user.id}dashboard?tab=team`}
          skipInvitationScreen
          hideSlug
        />
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </div>
  )
}