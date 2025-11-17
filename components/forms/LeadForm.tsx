// components/LeadForm.tsx
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export interface LeadFormProps {
  realtorId?: string | null
  companyId?: string | null
  onSuccess?: () => void
}

type FormValues = {
  name: string
  email: string
  phone: string
  message?: string
}

export default function LeadForm({ realtorId = null, companyId = null, onSuccess }: LeadFormProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values: FormValues) => {
    if (!values.name || !values.email || !values.phone) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        status: 'New',
        realtor_id: realtorId || null,
        company_id: companyId || null
      }
      // optional message column could be added; if you want it, extend DB above
      if (values.message) payload.message = values.message

      const { error } = await supabase
        .from('leads')
        .insert([{ ...payload }])

      if (error) throw error

      toast.success('Thanks! We received your request — someone will contact you soon.')
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Lead submit error', err)
      toast.error(err?.message || 'Failed to submit lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 bg-white p-4 rounded-md shadow-sm w-full max-w-md">
      <label className="text-sm font-medium text-gray-700">Full name</label>
      <input {...register('name')} placeholder="Jane Doe" required className="border p-2 rounded" />

      <label className="text-sm font-medium text-gray-700">Email</label>
      <input {...register('email')} type="email" placeholder="jane@example.com" required className="border p-2 rounded" />

      <label className="text-sm font-medium text-gray-700">Phone</label>
      <input {...register('phone')} placeholder="+1 555 1234" required className="border p-2 rounded" />

      <label className="text-sm font-medium text-gray-700">Message (optional)</label>
      <textarea {...register('message')} placeholder="Interested in this listing..." className="border p-2 rounded" />

      <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] text-white">
        {loading ? 'Sending...' : 'Contact Agent'}
      </Button>
    </form>
  )
}