'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RoleCheckPage() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isSignedIn) {
      // Not signed in → redirect to Clerk sign-in
      router.replace('/sign-in')
      return
    }

    const checkRole = async () => {
      if (!user) return

      // Check Realtors table
      const { data: realtor } = await supabase
        .from('realtors')
        .select('id')
        .eq('id', user.id)
        .single()

      if (realtor) {
        router.replace('/realtordashboard')
        return
      }

      // Check Tenants table
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', user.id)
        .single()

      if (tenant) {
        router.replace('/tenantdashboard')
        return
      }

      // If user has no role yet → redirect to role-selection
      router.replace('/role-selection')
    }

    checkRole()
  }, [user, isSignedIn, router])

  return <div className="p-4 text-center text-white">Checking your role...</div>
}