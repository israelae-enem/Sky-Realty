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
  realtorId: string
  onSuccess?: () => void
}

interface FormValues {
  tenant_id: string
  appointment_date: Date
  appointment_time: string
  status: 'Scheduled' | 'Completed' | 'Canceled'
}

interface Tenant {
  id: string
  full_name: string
}

export default function AppointmentForm({ realtorId, onSuccess }: AppointmentFormProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      tenant_id: '',
      appointment_date: new Date(),
      appointment_time: '',
      status: 'Scheduled',
    },
  })

  useEffect(() => {
    if (!realtorId) return
    const fetchTenants = async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, full_name')
        .eq('realtor_id', realtorId)
      if (error) {
        console.error('❌ Fetch tenants error:', error)
      } else {
        setTenants(data || [])
      }
    }
    fetchTenants()
  }, [realtorId])

  const onSubmit = async (values: FormValues) => {
    if (!values.tenant_id || !values.appointment_date || !values.appointment_time) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const dateTime = new Date(
        `${format(values.appointment_date, 'yyyy-MM-dd')}T${values.appointment_time}`
      ).toISOString()

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            id: crypto.randomUUID(),
            tenant_id: values.tenant_id,
            tenant_name: tenants.find(t => t.id === values.tenant_id)?.full_name || '',
            appointment_date: dateTime,
            status: values.status,
            realtor_id: realtorId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Appointment added!')

      // Reset form
      reset()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to add appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#302cfc] hover:bg-[#241fd9]">New Appointment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Fill out the form to add a new maintenance appointment.
          </DialogDescription>
        

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Tenant */}
          <label className="text-gray-700">Tenant</label>
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
          <label className="text-gray-700">Date</label>
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
          <label className="text-gray-700">Time</label>
          <Input type="time" {...register('appointment_time')} />

          {/* Status */}
          <label className="text-gray-700">Status</label>
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
            {loading ? 'Adding...' : 'Add Appointment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}