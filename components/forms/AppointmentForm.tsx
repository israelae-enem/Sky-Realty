'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@radix-ui/react-dialog"

interface AppointmentFormProps {
  realtorId?: string
  companyId?: string
  mode?: 'create' | 'edit'
  defaultValues?: FormValues
  onSuccess?: () => void
  type?: 'meeting' | 'maintenance' | 'viewing'
}

interface FormValues {
  id?: string
  tenant_id: string
  appointment_date: Date
  appointment_time: string
  status: 'Scheduled' | 'Completed' | 'Canceled'
  type: 'Meeting' | 'Maintenance' | 'Viewing'
}

interface Tenant {
  id: string
  full_name: string
}

export default function AppointmentForm({ realtorId, companyId, mode = 'create', defaultValues, onSuccess }: AppointmentFormProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const ownerColumn = realtorId ? 'realtor_id' : 'company_id'
  const ownerId = realtorId || companyId || ''

  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: defaultValues || {
      tenant_id: '',
      appointment_date: new Date(),
      appointment_time: '',
      status: 'Scheduled',
      type: 'Maintenance',
    },
  })

  // Fetch tenants for realtor or company
  useEffect(() => {
    if (!ownerId) return
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, full_name')
          .eq(ownerColumn, ownerId)
        if (error) throw error
        setTenants(data || [])
      } catch (err) {
        console.error('❌ Fetch tenants error:', err)
        toast.error('Failed to fetch tenants')
      }
    }
    fetchTenants()
  }, [ownerId, ownerColumn])

  const onSubmit = async (values: FormValues) => {
    if (!values.tenant_id || !values.appointment_date || !values.appointment_time || !values.type) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const dateTime = new Date(
        `${format(values.appointment_date, 'yyyy-MM-dd')}T${values.appointment_time}`
      ).toISOString()

      const tenantName = tenants.find(t => t.id === values.tenant_id)?.full_name || ''

      if (mode === 'edit' && defaultValues?.id) {
        const { error } = await supabase
          .from('appointments')
          .update({
            tenant_id: values.tenant_id,
            tenant_name: '',
            appointment_date: dateTime,
            status: values.status,
            type: values.type,
            updated_at: new Date().toISOString(),
          })
          .eq('id', defaultValues.id)
        if (error) throw error
        toast.success('Appointment updated!')
      } else {
        const payload: any = {
          id: crypto.randomUUID(),
          tenant_id: values.tenant_id,
          tenant_name: '',
          appointment_date: dateTime,
          status: values.status,
          type: values.type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        payload[ownerColumn] = ownerId

        const { error } = await supabase.from('appointments').insert([payload])
        if (error) throw error
        toast.success('Appointment added!')
      }

      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">{mode === 'edit' ? 'Edit Appointment' : 'New Appointment'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{mode === 'edit' ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
        <DialogDescription>
          Fill out the form to {mode === 'edit' ? 'update' : 'add'} an appointment.
        </DialogDescription>

        <form className="grid gap-4 bg-gray-300 rounded-md border border-gray-400 mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Tenant */}
          <label className="text-gray-800">Tenant</label>
          <Select {...register('tenant_id')}>
            <SelectTrigger>
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date */}
          <label className="text-gray-800">Date</label>
          <Controller
            control={control}
            name="appointment_date"
            render={({ field }) => (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">
                    {field.value ? format(field.value, 'yyyy-MM-dd') : 'Select Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
            )}
          />

          {/* Time */}
          <label className="text-gray-800">Time</label>
          <Input type="time" {...register('appointment_time')} />

          {/* Type */}
          <label className="text-gray-800">Type</label>
          <Select {...register('type')}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Viewing">Viewing</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <label className="text-gray-800">Status</label>
          <Select {...register('status')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-[#302cfc] hover:bg-[#241fd9] mt-4">
            {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Appointment' : 'Add Appointment')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}