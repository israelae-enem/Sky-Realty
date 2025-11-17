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
  realtorId?: string
  companyId?: string
  mode?: 'create' | 'edit'
  defaultValues?: FormValues
  onSuccess?: () => void
}

interface FormValues {
  id?: string
  full_name: string
  phone: string
  email: string
  address: string
  country: string
  property_id: string
  status: 'Active' | 'Inactive'
}

export default function TenantForm({ realtorId, companyId, mode = 'create', defaultValues, onSuccess }: TenantFormProps) {
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])

  const ownerColumn = realtorId ? 'realtor_id' : 'company_id'
  const ownerId = realtorId || companyId || ''

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: defaultValues || {
      full_name: '',
      phone: '',
      email: '',
      address: '',
      country: '',
      property_id: '',
      status: 'Active',
    },
  })

  /* ---------------------------------------
     Fetch properties for owner
  ---------------------------------------- */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (!ownerId) return
        const { data, error } = await supabase
          .from('properties')
          .select('id, title')
          .eq(ownerColumn, ownerId)
        if (error) throw error
        setProperties(data ?? [])
      } catch (err: any) {
        console.error(err)
        toast.error('Failed to load properties')
      }
    }
    fetchProperties()
  }, [ownerId, ownerColumn])

  /* ---------------------------------------
     Fill form if editing
  ---------------------------------------- */
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof FormValues, value)
      })
    }
  }, [defaultValues, setValue])

  /* ---------------------------------------
     Submit handler
  ---------------------------------------- */
  const onSubmit = async (values: FormValues) => {
    if (!values.property_id) {
      toast.error('Please select a property')
      return
    }

    if (!ownerId) {
      toast.error('Missing realtor or company ID')
      return
    }

    setLoading(true)
    try {
      if (mode === 'edit' && defaultValues?.id) {
        const { error } = await supabase
          .from('tenants')
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq('id', defaultValues.id)
        if (error) throw error
        toast.success('Tenant updated!')
      } else {
        const { data, error } = await supabase
          .from('tenants')
          .insert([
            {
              id: crypto.randomUUID(),
              [ownerColumn]: ownerId,
              ...values,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single()
        if (error) throw error
        toast.success('Tenant added!')
      }

      reset()
      onSuccess && onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save tenant')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------------------------------
     UI
  ---------------------------------------- */
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">{mode === 'edit' ? 'Edit Tenant' : 'Add Tenant'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{mode === 'edit' ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        <DialogDescription>
          Fill out the form to {mode === 'edit' ? 'update' : 'create'} a tenant.
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
          <Select onValueChange={(v) => setValue('property_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-gray-700">Status</label>
          <Select onValueChange={(v) => setValue('status', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Tenant' : 'Add Tenant')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}