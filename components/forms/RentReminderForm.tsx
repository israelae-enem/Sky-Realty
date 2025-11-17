'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@radix-ui/react-dialog'

interface RentReminderFormProps {
  realtorId: string
  defaultValues?: {
    id: string
    tenant_id: string
    property_id: string
    payment_status: 'Paid' | 'Pending' | 'Overdue'
  }
  onSuccess?: () => void
}

interface FormValues {
  tenant_id: string
  property_id: string
  payment_status: 'Paid' | 'Pending' | 'Overdue'
}

export default function RentReminderForm({ realtorId, defaultValues, onSuccess }: RentReminderFormProps) {
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<{ id: string; full_name: string }[]>([])
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: defaultValues || {
      tenant_id: '',
      property_id: '',
      payment_status: 'Pending',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantRes, propRes] = await Promise.all([
          supabase.from('tenants').select('id, full_name').eq('realtor_id', realtorId),
          supabase.from('properties').select('id, title').eq('realtor_id', realtorId),
        ])
        setTenants(tenantRes.data ?? [])
        setProperties(propRes.data ?? [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load tenants or properties')
      }
    }

    fetchData()
  }, [realtorId])

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof FormValues, value)
      })
    }
  }, [defaultValues, setValue])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      if (defaultValues?.id) {
        // Edit
        const { error } = await supabase
          .from('rent_reminder')
          .update(values)
          .eq('id', defaultValues.id)
        if (error) throw error
        toast.success('Rent reminder updated!')
      } else {
        // Create
        const { error } = await supabase
          .from('rent_reminder')
          .insert([{ id: crypto.randomUUID(), ...values, realtor_id: realtorId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        if (error) throw error
        toast.success('Rent reminder sent!')
      }

      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save reminder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">{defaultValues ? 'Edit Rent Reminder' : 'Send Rent Reminder'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{defaultValues ? 'Edit Rent Reminder' : 'New Rent Reminder'}</DialogTitle>
        <DialogDescription>
          Select tenant and property to {defaultValues ? 'update' : 'send'} a rent reminder.
        </DialogDescription>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-gray-700">Tenant</label>
          <Select {...register('tenant_id')}>
            <SelectTrigger>
              <SelectValue placeholder="Select Tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-700">Property</label>
          <Select {...register('property_id')}>
            <SelectTrigger>
              <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-700">Payment Status</label>
          <Select {...register('payment_status')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? 'Saving...' : defaultValues ? 'Update Reminder' : 'Send Reminder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}