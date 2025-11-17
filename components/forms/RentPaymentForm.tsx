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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@radix-ui/react-dialog'

interface RentPaymentFormProps {
  realtorId?: string        // OPTIONAL
  companyId?: string        // OPTIONAL
  defaultValues?: {
    id: string
    tenant_id: string
    property_id: string
    amount: number
    payment_date: string
    method: 'Cash' | 'Bank Transfer' | 'Card'
  }
  onSuccess?: () => void
}

interface FormValues {
  tenant_id: string
  property_id: string
  amount: number
  payment_date: string
  method: 'Cash' | 'Bank Transfer' | 'Card'
}

export default function RentPaymentForm({
  realtorId,
  companyId,
  defaultValues,
  onSuccess,
}: RentPaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<{ id: string; full_name: string }[]>([])
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])

  const ownerColumn = realtorId ? 'realtor_id' : 'company_id'
  const ownerId = realtorId || companyId || ''

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: defaultValues || {
      tenant_id: '',
      property_id: '',
      amount: 0,
      payment_date: '',
      method: 'Cash',
    },
  })

  /* ---------------------------------------
     Load tenants + properties
  ---------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!ownerId) return

        const [tenantRes, propRes] = await Promise.all([
          supabase
            .from('tenants')
            .select('id, full_name')
            .eq(ownerColumn, ownerId),

          supabase
            .from('properties')
            .select('id, title')
            .eq(ownerColumn, ownerId),
        ])

        setTenants(tenantRes.data ?? [])
        setProperties(propRes.data ?? [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load tenants or properties')
      }
    }

    fetchData()
  }, [ownerId, ownerColumn])

  /* ---------------------------------------
     If editing, fill the form
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
    setLoading(true)
    try {
      if (!ownerId) {
        toast.error('Missing company or realtor ID')
        return
      }

      if (defaultValues?.id) {
        // ✏ Edit existing
        const { error } = await supabase
          .from('rent_payment')
          .update(values)
          .eq('id', defaultValues.id)

        if (error) throw error
        toast.success('Rent payment updated!')
      } else {
        // ➕ New payment
        const { error } = await supabase
          .from('rent_payment')
          .insert([
            {
              id: crypto.randomUUID(),
              ...values,
              [ownerColumn]: ownerId, // 👈 automatically chooses company_id or realtor_id
              created_at: new Date().toISOString(),
            },
          ])

        if (error) throw error
        toast.success('Rent payment added!')
      }

      reset()
      onSuccess && onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save payment')
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
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">
          {defaultValues ? 'Edit Rent Payment' : 'Add Rent Payment'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogTitle>
          {defaultValues ? 'Edit Rent Payment' : 'New Rent Payment'}
        </DialogTitle>
        <DialogDescription>
          Fill out the form to {defaultValues ? 'update' : 'record'} a rent payment.
        </DialogDescription>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Tenant */}
          <label className="text-gray-700">Tenant</label>
          <Select onValueChange={(v) => setValue('tenant_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Property */}
          <label className="text-gray-700">Property</label>
          <Select onValueChange={(v) => setValue('property_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Amount */}
          <label className="text-gray-700">Amount</label>
          <Input type="number" step="0.01" {...register('amount')} />

          {/* Date */}
          <label className="text-gray-700">Payment Date</label>
          <Input type="date" {...register('payment_date')} />

          {/* Method */}
          <label className="text-gray-700">Payment Method</label>
          <Select onValueChange={(v) => setValue('method', v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? 'Saving...' : defaultValues ? 'Update Payment' : 'Add Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}