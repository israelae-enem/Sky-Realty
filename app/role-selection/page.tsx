'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

const roleOptions = [
  { label: 'Realtor', href: '/realtor' },
  { label: 'Tenant', href: '/tenant' },
]

export default function RoleSelection() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isSignedIn, router])

  const handleRoleSelect = async (role: 'Realtor' | 'Tenant', href: string) => {
    if (!user) return

    try {
      if (role === 'Realtor') {
        await supabase.from('realtors').insert([{ id: user.id }])
      } else {
        await supabase.from('tenants').insert([{ id: user.id }])
      }

      router.replace(href)
    } catch (err: any) {
      console.error('Role selection failed', err)
      alert('Failed to select role: ' + err.message)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Select Your Role
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 bg-black text-white rounded shadow-lg">
          <div className="flex flex-col gap-2">
            {roleOptions.map(({ label, href }) => (
              <button
                key={href}
                className="w-full text-left px-2 py-1 rounded hover:bg-indigo-700"
                onClick={() => handleRoleSelect(label as 'Realtor' | 'Tenant', href)}
              >
                {label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}