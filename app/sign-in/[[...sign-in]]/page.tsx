'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function SignInPage() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!isSignedIn || !user) return

    const redirectUser = async () => {
      setChecking(true)

      try {
        await user.reload()
        const userId = user.id

        const { data: realtor } = await supabase
          .from('realtors')
          .select('id')
          .eq('id', userId)
          .single()

        if (realtor) {
          router.replace(`/realtor/${userId}/dashboard`)
          return
        }

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .or(`owner_id.eq.${userId},members.cs.{${userId}}`)
          .single()

        if (company) {
          router.replace(`/company/${company.id}/dashboard`)
          return
        }

        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('id', userId)
          .single()

        if (tenant) {
          router.replace(`/tenant/${userId}/dashboard`)
          return
        }
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/images/pic1.jpg" // <-- your background image
        alt="Sign in background"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* SignIn Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-white"
      >
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-[#302cfc] hover:bg-blue-700 text-white rounded-lg',
            },
          }}
        />
      </motion.div>
    </div>
  )
}