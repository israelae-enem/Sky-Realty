'use client'

  import { useEffect, useState, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface Appointment {
  id: string
  tenant_id: string
  tenant_name: string
  appointment_date: string
  status: 'Scheduled' | 'Completed' | 'Canceled'
  realtor_id: string
  maintenance_request_id?: string
  created_at: string
  updated_at: string
}

interface Tenant {
  id: string
  full_name: string
}

interface AppointmentTableProps {
  realtorId: string | null
}

export default function AppointmentTable({ realtorId }: AppointmentTableProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newTenantId, setNewTenantId] = useState('')
  const [newDate, setNewDate] = useState<Date | undefined>()
  const [newTime, setNewTime] = useState('')
  const [newStatus, setNewStatus] = useState<Appointment['status']>('Scheduled')

  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTenantId, setEditTenantId] = useState('')
  const [editDate, setEditDate] = useState<Date | undefined>()
  const [editTime, setEditTime] = useState('')
  const [editStatus, setEditStatus] = useState<Appointment['status']>('Scheduled')

  // -----------------------------
  // Fetch tenants and appointments
  // -----------------------------
  useEffect(() => {
    if (!realtorId) return
    setLoading(true)

    const fetchData = async () => {
      try {
        const [tenantsRes, appointmentsRes] = await Promise.all([
          supabase
            .from('tenants')
            .select('id, full_name')
            .eq('realtor_id', realtorId),
          supabase
            .from('appointments')
            .select('*')
            .eq('realtor_id', realtorId)
            .order('appointment_date', { ascending: true }),
        ])

        if (tenantsRes.error) throw tenantsRes.error
        if (appointmentsRes.error) throw appointmentsRes.error

        setTenants(tenantsRes.data ?? [])
        setAppointments(appointmentsRes.data ?? [])
      } catch (err: any) {
        console.error('❌ FetchData Error:', err)
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Realtime subscription
    const channel = supabase
      .channel(`appointments-realtor-${realtorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `realtor_id=eq.${realtorId}` },
        (payload: any) => {
          const newAppt: Appointment = payload.new
          setAppointments((prev) => {
            const idx = prev.findIndex(a => a.id === newAppt.id)
            if (payload.eventType === 'DELETE') return prev.filter(a => a.id !== newAppt.id)
            if (idx > -1) {
              const updated = [...prev]
              updated[idx] = newAppt
              return updated
            }
            return [...prev, newAppt]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  // -----------------------------
  // Stats calculation
  // -----------------------------
  const stats = useMemo(() => {
    const scheduled = appointments.filter(a => a.status === 'Scheduled').length
    const completed = appointments.filter(a => a.status === 'Completed').length
    const canceled = appointments.filter(a => a.status === 'Canceled').length
    return { scheduled, completed, canceled }
  }, [appointments])

  // -----------------------------
  // Add appointment
  // -----------------------------
     const handleAddAppointment = async () => {
  if (!newTenantId || !newDate || !newTime || !realtorId) {
    toast.error('Please fill all fields');
    return;
  }

  setAdding(true);

  try {
    // combine date and time into ISO string
    const dateTime = new Date(`${format(newDate, 'yyyy-MM-dd')}T${newTime}`).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        id: crypto.randomUUID(), // required because id is text NOT NULL
        tenant_id: newTenantId,
        tenant_name: tenants.find(t => t.id === newTenantId)?.full_name || '',
        appointment_date: dateTime,
        status: newStatus,
        realtor_id: realtorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setAppointments(prev => [...prev, data]);
      toast.success('Appointment added!');
    }


    // ---------------- Notify tenant ----------------
      const { error: notifError } = await supabase
        .from('notification')
        .insert([{
          tenant_id: newTenantId, // tenant gets notified
          type: 'appointment',
          title: 'New Maintenance Appointment',
          message: `You have a new maintenance appointment scheduled on ${format(new Date(dateTime), 'PPpp')}`,
          read: false,
          created_at: new Date().toISOString(),
        }]);

      if (notifError) console.error('Tenant notification error:', notifError);

    // reset form
    setNewTenantId('');
    setNewDate(undefined);
    setNewTime('');
    setNewStatus('Scheduled');
  } catch (err: any) {
    console.error('❌ Add appointment error:', err);
    toast.error(err.message || 'Failed to add appointment');
  } finally {
    setAdding(false);
  }
};

  // -----------------------------
  // Edit appointment
  // -----------------------------
  const handleSaveEdit = async (id: string) => {
    if (!editTenantId || !editDate || !editTime) {
      toast.error('Please fill all fields')
      return
    }

    const dateTime = new Date(`${format(editDate, 'yyyy-MM-dd')}T${editTime}`).toISOString()

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          tenant_id: editTenantId,
          tenant_name: tenants.find(t => t.id === editTenantId)?.full_name || '',
          appointment_date: dateTime,
          status: editStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setAppointments(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, tenant_id: editTenantId, tenant_name: tenants.find(t => t.id === editTenantId)?.full_name || '', appointment_date: dateTime, status: editStatus }
            : a
        )
      )
      setEditingId(null)
      toast.success('Appointment updated!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update appointment')
    }
  }

  // -----------------------------
  // Delete appointment
  // -----------------------------
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else setAppointments(prev => prev.filter(a => a.id !== id))
}


  // -----------------------------
  // Filtered appointments by search
  // -----------------------------
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => a.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [appointments, searchTerm])

  return (
    <section className="bg-gray-950 p-6 rounded-md text-white border border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-[#302cfc]">Maintenance Appointments</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-md text-center border border-gray-700">
          <p className="text-gray-400 text-sm">Scheduled</p>
          <p className="text-yellow-400 text-xl font-semibold">{stats.scheduled}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md text-center border border-gray-700">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-green-400 text-xl font-semibold">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md text-center border border-gray-700">
          <p className="text-gray-400 text-sm">Canceled</p>
          <p className="text-red-400 text-xl font-semibold">{stats.canceled}</p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search tenant..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 bg-gray-800 text-white"
      />

      <div className="overflow-x-auto">
        <Table className="min-w-full hover:bg-gray-800">
          <TableHeader>
            <TableRow className=' hover:bg-gray-800 focus:bg-gray-800 active:bg-gray-800'>
              <TableHead className='text-white'>Tenant</TableHead>
              <TableHead className='text-white'>Date</TableHead>
              <TableHead className='text-white'>Time</TableHead>
              <TableHead className='text-white'>Status</TableHead>
              <TableHead className='text-white'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add row */}
            <TableRow className=' hover:bg-gray-800 focus:bg-gray-800 active:bg-gray-800'>
              <TableCell>
               <select
               value={newTenantId}
                onChange={(e) => setNewTenantId(e.target.value)}
               className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
                >
               <option value="">Select tenant</option>
               {tenants.map((t) => (
               <option key={t.id} value={t.id}>
               {t.full_name}
                </option>
                ))}
               </select>
            </TableCell>
             
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left text-white bg-gray-800">
                      {newDate ? format(newDate, 'yyyy-MM-dd') : 'Select Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar mode="single" selected={newDate} onSelect={setNewDate} />
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="bg-gray-800 text-white"/>
              </TableCell>
              <TableCell>
                <Select value={newStatus} onValueChange={val => setNewStatus(val as Appointment['status'])}>
                  <SelectTrigger className="bg-gray-800 text-white w-32 border border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button onClick={handleAddAppointment} disabled={adding} className="bg-[#302cfc] hover:bg-[#241fd9]">
                  {adding ? 'Adding...' : 'Add'}
                </Button>
              </TableCell>
            </TableRow>

            {/* Existing appointments */}
            {filteredAppointments.map(appt => {
              const isEditing = editingId === appt.id
              const dateObj = new Date(appt.appointment_date)
              return (
                <TableRow key={appt.id} className=' hover:bg-gray-800 focus:bg-gray-800 active:bg-gray-800'>
                  <TableCell>
                    {isEditing ? (
                      <Input value={editTenantId} onChange={e => setEditTenantId(e.target.value)} list="tenant-list" className="bg-gray-800 text-white"/>
                    ) : (
                      appt.tenant_name
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full text-left text-white bg-gray-800">
                            {editDate ? format(editDate, 'yyyy-MM-dd') : format(dateObj, 'yyyy-MM-dd')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Calendar mode="single" selected={editDate ?? dateObj} onSelect={setEditDate} />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      format(dateObj, 'yyyy-MM-dd')
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input type="time" value={editTime || format(dateObj, 'HH:mm')} onChange={e => setEditTime(e.target.value)} className="bg-gray-800 text-white"/>
                    ) : (
                      format(dateObj, 'HH:mm')
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select value={editStatus} onValueChange={val => setEditStatus(val as Appointment['status'])}>
                        <SelectTrigger className="bg-gray-800 text-white w-32 border border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white">
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      appt.status
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(appt.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingId(appt.id)
                            setEditTenantId(appt.tenant_id)
                            setEditDate(new Date(appt.appointment_date))
                            setEditTime(format(new Date(appt.appointment_date), 'HH:mm'))
                            setEditStatus(appt.status)
                          }}
                          className="bg-[#302cfc] hover:bg-[#241fd9]"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(appt.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredAppointments.length === 0 && !loading && (
              <TableRow className=' hover:bg-gray-800 focus:bg-gray-800 active:bg-gray-800'>
                <TableCell colSpan={5} className="text-center text-gray-400 py-4">
                  No appointments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && <p className="text-gray-400 mt-2">Loading appointments...</p>}
    </section>
  )
}