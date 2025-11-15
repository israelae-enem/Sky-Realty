'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@radix-ui/react-dialog'

interface TenantFormProps {
  realtorId: string
  onSuccess?: () => void
}

interface FormValues {
  full_name: string
  phone: string
  email: string
  address: string
  country: string
  property_id: string
  status: 'Active' | 'Inactive'
}

export default function TenantForm({ realtorId, onSuccess }: TenantFormProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      address: '',
      country: '',
      property_id: '',
      status: 'Active',
    },
  })

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title')
          .eq('realtor_id', realtorId)

        if (error) throw error
        setProperties(data ?? [])
      } catch (err: any) {
        console.error(err)
        toast.error('Failed to load properties')
      }
    }

    fetchProperties()
  }, [realtorId])

  const onSubmit = async (values: FormValues) => {
    if (!values.property_id) {
      toast.error('Please select a property')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([
          {
            id: crypto.randomUUID(),
            realtor_id: realtorId,
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Tenant added!')
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">Add Tenant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new tenant.
          </DialogDescription>
        

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-gray-700">Full Name</label>
          <Input {...register('full_name')} placeholder="John Doe" />

          <label className="text-gray-700">Phone</label>
          <Input {...register('phone')} placeholder="+1 234 567 890" />

          <label className="text-gray-700">Email</label>
          <Input type="email" {...register('email')} placeholder="email@example.com" />

          <label className="text-gray-700">Address</label>
          <Textarea {...register('address')} placeholder="Tenant Address" />

          <label className="text-gray-700">Country</label>
          <Input {...register('country')} placeholder="Country" />

          <label className="text-gray-700">Property</label>
          <Select {...register('property_id')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-700">Status</label>
          <Select {...register('status')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? 'Adding...' : 'Add Tenant'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}