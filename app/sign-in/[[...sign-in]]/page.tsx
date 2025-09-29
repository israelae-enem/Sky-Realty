'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SignInPage() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!isSignedIn || !user) return

    const redirectUser = async () => {
      setChecking(true)

      try {
        // Refresh user metadata
        await user.reload()
        const userId = user.id

        // Check if user exists in Realtors table
        const { data: realtor } = await supabase
          .from('realtors')
          .select('id')
          .eq('id', userId)
          .single()

        if (realtor) {
          router.replace(`/realtor/${userId}/dashboard`)
          return
        }

        // Check if user exists in Tenants table
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('id', userId)
          .single()

        if (tenant) {
          router.replace(`/tenant/${userId}/dashboard`)
          return
        }

        // If user is not in either table, optionally create tenant by default
        // await supabase.from('tenants').insert({ id: userId }) // optional
      } catch (err) {
        console.error('Error during redirect:', err)
      } finally {
        setChecking(false)
      }
    }

    redirectUser()
  }, [isSignedIn, user, router])

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-300 text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="mt-4">Checking account status...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300">
      <div className="p-6 rounded-lg shadow-lg">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#302cfc] hover:bg-blue-700 text-white',
            },
          }}
        />
      </div>
    </div>
  )
}