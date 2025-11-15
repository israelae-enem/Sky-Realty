'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@radix-ui/react-dialog'

interface RentPaymentFormProps {
  realtorId: string
  onSuccess?: () => void
}

interface FormValues {
  tenant_id: string
  property_id: string
  amount: number
  payment_date: string
  method: 'Cash' | 'Bank Transfer' | 'Card'
}

export default function RentPaymentForm({ realtorId, onSuccess }: RentPaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<{ id: string; full_name: string }[]>([])
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      tenant_id: '',
      property_id: '',
      amount: 0,
      payment_date: '',
      method: 'Cash',
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

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rent_payment')
        .insert([
          {
            id: crypto.randomUUID(),
            ...values,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Rent payment added!')
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">Add Rent Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        
          <DialogTitle>New Rent Payment</DialogTitle>
          <DialogDescription>Fill out the form to record a rent payment.</DialogDescription>
      

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

          <label className="text-gray-700">Amount</label>
          <Input type="number" step="0.01" {...register('amount')} placeholder="1000" />

          <label className="text-gray-700">Payment Date</label>
          <Input type="date" {...register('payment_date')} />

          <label className="text-gray-700">Payment Method</label>
          <Select {...register('method')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? 'Saving...' : 'Add Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}