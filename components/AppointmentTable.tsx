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
  const [showCalendar, setShowCalendar] = useState(false)

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
    <section className=" p-6 rounded-md text-gray-800 bg-gray-100 border border-gray-500">
      <h2 className="text-2xl font-semibold font-tech mb-4 text-[#302cfc]">Maintenance Appointments</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-300 p-4 rounded-md text-center border border-gray-500">
          <p className="text-gray-800 text-sm">Scheduled</p>
          <p className="text-yellow-600 text-xl font-semibold">{stats.scheduled}</p>
        </div>
        <div className="bg-gray-300 p-4 rounded-md text-center border border-gray-500">
          <p className="text-gray-800 text-sm">Completed</p>
          <p className="text-green-600 text-xl font-semibold">{stats.completed}</p>
        </div>
        <div className="bg-gray-300 p-4 rounded-md text-center border border-gray-500">
          <p className="text-gray-800 text-sm">Canceled</p>
          <p className="text-red-600 text-xl font-semibold">{stats.canceled}</p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search tenant..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 text-gray-800 bg-gray-300"
      />

      <div className="overflow-x-auto hidden md:block rounded-md border">
        <Table className="min-w-full hover:black">
          <TableHeader>
            <TableRow >
              <TableHead className='text-white'>Tenant</TableHead>
              <TableHead className='text-white'>Date</TableHead>
              <TableHead className='text-white'>Time</TableHead>
              <TableHead className='text-white'>Status</TableHead>
              <TableHead className='text-white'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add row */}
            <TableRow >
              <TableCell>
               <select
               value={newTenantId}
                onChange={(e) => setNewTenantId(e.target.value)}
               className="w-full text-gray-800 bg-gray-300 p-2 rounded border border-gray-500"
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
  {/** Full Calendar Popup Integration */}
  <div className="relative">
    <Button
      variant="outline"
      onClick={() => setShowCalendar(true)}
      className="w-full text-left text-gray-800 bg-gray-300 border border-gray-500"
    >
      {newDate ? format(newDate, 'yyyy-MM-dd') : 'Select Date'}
    </Button>

    {showCalendar && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg border border-gray-400 w-[90%] sm:w-[450px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-[#302cfc]">
              Select Appointment Date
            </h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-gray-600 hover:text-red-600"
            >
              ✕
            </button>
          </div>

          <Calendar
            mode="single"
            selected={newDate}
            onSelect={(date) => {
              setNewDate(date)
              setShowCalendar(false)
            }}
            className="rounded-md border border-gray-400 bg-gray-100"
          />
        </div>
      </div>
    )}
  </div>
</TableCell>

<TableCell>
  <Input
    type="time"
    value={newTime}
    onChange={(e) => setNewTime(e.target.value)}
    className="text-gray-800 bg-gray-300"
  />
</TableCell>
              <TableCell>
                <Select value={newStatus} onValueChange={val => setNewStatus(val as Appointment['status'])}>
                  <SelectTrigger className="text-gray-800 bg-gray-300 w-32 border border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d0e] text-white">
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
                <TableRow key={appt.id} >
                  <TableCell>
                    {isEditing ? (
                      <Input value={editTenantId} onChange={e => setEditTenantId(e.target.value)} list="tenant-list" className="text-gray-800 bg-gray-300"/>
                    ) : (
                      appt.tenant_name
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full text-left text-gray-800 bg-gray-300">
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
                      <Input type="time" value={editTime || format(dateObj, 'HH:mm')} onChange={e => setEditTime(e.target.value)} className="text-gray-800 bg-gray-300"/>
                    ) : (
                      format(dateObj, 'HH:mm')
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select value={editStatus} onValueChange={val => setEditStatus(val as Appointment['status'])}>
                        <SelectTrigger className="text-gray-800 bg-gray-300 w-32 border border-gray-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0d0e] text-white">
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
              <TableRow >
                <TableCell colSpan={5} className="text-center text-gray-800 py-4">
                  No appointments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
<div className="md:hidden flex flex-col gap-4">
  {/* Add new appointment form */}
  <details className="bg-gray-300 rounded-md border border-gray-500 p-4 space-y-3">
    <summary className="cursor-pointer text-[#302cfc] font-semibold mb-2">
      ➕ Add Appointment
    </summary>

    <div className="flex flex-col space-y-3">
      {/* Tenant */}
      <div className="flex flex-col">
        <label className="text-gray-400 text-sm mb-1">Tenant</label>
        <select
          value={newTenantId}
          onChange={(e) => setNewTenantId(e.target.value)}
          className="text-gray-800 bg-gray-300 p-2 rounded border border-gray-500"
        >
          <option value="">Select tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="flex flex-col">
        <label className="text-gray-800 text-sm mb-1">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="text-left text-gray-800 bg-gray-300 border border-gray-500 w-full"
            >
              {newDate ? format(newDate, 'yyyy-MM-dd') : 'Select Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-[90vw] sm:w-auto max-w-[100vw] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0"
            align="center"
            sideOffset={8}
          >
            <Calendar mode="single" selected={newDate} onSelect={setNewDate} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time */}
      <div className="flex flex-col">
        <label className="text-gray-400 text-sm mb-1">Time</label>
        <Input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="text-gray-800 bg-gray-300 border border-gray-500"
        />
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label className="text-gray-800 text-sm mb-1">Status</label>
        <Select
          value={newStatus}
          onValueChange={(val) => setNewStatus(val as Appointment['status'])}
        >
          <SelectTrigger className="btext-gray-800 bg-gray-300 order border-gray-500">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0d0e] text-white">
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleAddAppointment}
        disabled={adding}
        className="bg-[#302cfc] hover:bg-[#241fd9] w-full"
      >
        {adding ? 'Adding...' : 'Add Appointment'}
      </Button>
    </div>
  </details>

  {/* Existing appointments */}
  {filteredAppointments.map((appt) => {
    const dateObj = new Date(appt.appointment_date)
    const isEditing = editingId === appt.id

    return (
      <details
        key={appt.id}
        className="bg-gray-300 rounded-md border border-gray-500 p-4"
      >
        <summary className="cursor-pointer text-white font-medium flex justify-between items-center">
          <span>{appt.tenant_name}</span>
          <span className="text-sm text-gray-800">{format(dateObj, 'yyyy-MM-dd')}</span>
        </summary>

        <div className="mt-3 space-y-3">
          {/* Tenant */}
          <div className="flex flex-col">
            <label className="text-gray-800 text-sm mb-1">Tenant</label>
            {isEditing ? (
              <Input
                value={editTenantId}
                onChange={(e) => setEditTenantId(e.target.value)}
                className="text-gray-800 bg-gray-300 border border-gray-500"
              />
            ) : (
              <p>{appt.tenant_name}</p>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-gray-800 text-sm mb-1">Date</label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-left text-gray-800 bg-gray-300 border border-gray-500"
                  >
                    {editDate ? format(editDate, 'yyyy-MM-dd') : format(dateObj, 'yyyy-MM-dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[90vw] sm:w-auto max-w-[100vw] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0"
                  align="center"
                  sideOffset={8}
                >
                  <Calendar
                    mode="single"
                    selected={editDate ?? dateObj}
                    onSelect={setEditDate}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <p>{format(dateObj, 'yyyy-MM-dd')}</p>
            )}
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="text-gray-800 text-sm mb-1">Time</label>
            {isEditing ? (
              <Input
                type="time"
                value={editTime || format(dateObj, 'HH:mm')}
                onChange={(e) => setEditTime(e.target.value)}
                className="text-gray-800 bg-gray-300 border border-gray-500"
              />
            ) : (
              <p>{format(dateObj, 'HH:mm')}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-gray-800 text-sm mb-1">Status</label>
            {isEditing ? (
              <Select
                value={editStatus}
                onValueChange={(val) => setEditStatus(val as Appointment['status'])}
              >
                <SelectTrigger className="text-gray-800 bg-gray-300 border border-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d0e] text-white">
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p>{appt.status}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {isEditing ? (
              <>
                <Button
                  onClick={() => handleSaveEdit(appt.id)}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingId(null)}
                  className="bg-red-600 hover:bg-red-700 flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setEditingId(appt.id)
                    setEditTenantId(appt.tenant_id)
                    setEditDate(new Date(appt.appointment_date))
                    setEditTime(format(new Date(appt.appointment_date), 'HH:mm'))
                    setEditStatus(appt.status)
                  }}
                  className="bg-[#302cfc] hover:bg-[#241fd9] flex-1"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(appt.id)}
                  className="bg-red-600 hover:bg-red-700 flex-1"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </details>
    )
  })}

  {filteredAppointments.length === 0 && !loading && (
    <p className="text-gray-800 text-center py-4">No appointments found</p>
  )}
</div>

     



      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && <p className="text-gray-400 mt-2">Loading appointments...</p>}
    </section>
  )
}