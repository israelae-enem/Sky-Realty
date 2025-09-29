'use client'

import { useEffect, useState, useMemo } from 'react'
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
  tenant_name: string
  appointment_date: string
  status: 'Scheduled' | 'Completed' | 'Canceled'
  realtor_id: string
}

interface AppointmentTableProps {
  realtorId: string | null
}

const AppointmentTable = ({ realtorId }: AppointmentTableProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline add form state
  const [newTenant, setNewTenant] = useState('')
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newTime, setNewTime] = useState('')
  const [newStatus, setNewStatus] = useState<Appointment['status']>('Scheduled')
  const [adding, setAdding] = useState(false)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | Appointment['status']>('All')
  const [sortKey, setSortKey] = useState<'tenant_name' | 'appointment_date'>('appointment_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Editable state per appointment
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTenant, setEditTenant] = useState('')
  const [editDate, setEditDate] = useState<Date | undefined>()
  const [editTime, setEditTime] = useState('')
  const [editStatus, setEditStatus] = useState<Appointment['status']>('Scheduled')

  // Fetch initial appointments
  useEffect(() => {
    if (!realtorId) return
    setLoading(true)
    supabase
      .from('appointments')
      .select('*')
      .eq('realtor_id', realtorId)
      .order('appointment_date', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setAppointments(data as Appointment[])
        setLoading(false)
      })
  }, [realtorId])

  // Realtime subscription
  useEffect(() => {
    if (!realtorId) return

    const channel = supabase
      .channel(`appointments-realtor-${realtorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `realtor_id=eq.${realtorId}`,
        },
        (payload: any) => {
          const newAppt: Appointment = payload.new
          setAppointments((prev) => {
            const idx = prev.findIndex((a) => a.id === newAppt.id)
            if (payload.eventType === 'DELETE') {
              return prev.filter((a) => a.id !== newAppt.id)
            } else if (idx > -1) {
              const updated = [...prev]
              updated[idx] = newAppt
              return updated
            } else {
              return [...prev, newAppt]
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  const handleAddAppointment = async () => {
    if (!newTenant || !newDate || !newTime || !realtorId) {
      toast.error('Please fill all fields')
      return
    }

    setAdding(true)
    const dateTime = new Date(
      `${format(newDate, 'yyyy-MM-dd')}T${newTime}`
    )

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            realtor_id: realtorId,
            tenant_name: newTenant,
            appointment_date: dateTime.toISOString(),
            status: newStatus,
          },
        ])
        .select()
        .single()

      if (error) throw error

      if (data) setAppointments((prev) => [...prev, data])

      // Reset form
      setNewTenant('')
      setNewDate(undefined)
      setNewTime('')
      setNewStatus('Scheduled')
      toast.success('Appointment added!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add appointment')
    } finally {
      setAdding(false)
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTenant || !editDate || !editTime) {
      toast.error('Please fill all fields')
      return
    }

    const dateTime = new Date(`${format(editDate, 'yyyy-MM-dd')}T${editTime}`)

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          tenant_name: editTenant,
          appointment_date: dateTime.toISOString(),
          status: editStatus,
        })
        .eq('id', id)

      if (error) throw error

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, tenant_name: editTenant, appointment_date: dateTime.toISOString(), status: editStatus }
            : a
        )
      )

      setEditingId(null)
      toast.success('Appointment updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update appointment')
    }
  }

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    if (searchTerm) {
      filtered = filtered.filter((a) =>
        a.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((a) => a.status === statusFilter)
    }

    filtered.sort((a, b) => {
      if (sortKey === 'tenant_name') {
        return sortOrder === 'asc'
          ? a.tenant_name.localeCompare(b.tenant_name)
          : b.tenant_name.localeCompare(a.tenant_name)
      } else {
        return sortOrder === 'asc'
          ? new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
          : new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      }
    })

    return filtered
  }, [appointments, searchTerm, statusFilter, sortKey, sortOrder])

  return (
    <section className="mt-15 bg-black p-6 rounded-md border border-gray-300 shadow-md text-white">
      <h2 className="text-2xl mb-4 text-[#302cfc] font-semibold">Maintenance Appointments</h2>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input
          placeholder="Search Tenant"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black text-white border border-gray-300"
        />
        <Select
          value={statusFilter}
          onValueChange={(val: 'All' | Appointment['status']) => setStatusFilter(val)}
        >
          <SelectTrigger className="w-36 bg-black border border-gray-300 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortKey}
          onValueChange={(val: 'tenant_name' | 'appointment_date') =>
            setSortKey(val)
          }
        >
          <SelectTrigger className="w-36 bg-black border border-gray-300 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="appointment_date">Sort by Date</SelectItem>
            <SelectItem value="tenant_name">Sort by Tenant</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}
        >
          <SelectTrigger className="w-36 bg-black border border-gray-300 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
             
              <TableHead className='text-white'>Tenant</TableHead>
              <TableHead className='text-white'>Date</TableHead>
              <TableHead className='text-white'>Time</TableHead>
              <TableHead className='text-white'>Status</TableHead>
              <TableHead className='text-white'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Inline Add Row */}
            <TableRow className="bg-black rounded-md border border-gray-300             hover:bg-black focus:bg-black active:bg-black">
            
              <TableCell>
                <Input
                  placeholder="Tenant Name"
                  value={newTenant}
                  onChange={(e) => setNewTenant(e.target.value)}
                  className="bg-black text-white"
                />
              </TableCell>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left text-white bg-black">
                      {newDate ? format(newDate, 'yyyy-MM-dd') : 'Select Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                    />
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-black text-white"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={newStatus}
                  onValueChange={(val) =>
                    setNewStatus(val as Appointment['status'])
                  }
                >
                  <SelectTrigger className="w-32 bg-black text-white border rounded-md border-gray-300">
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
                <Button
                  onClick={handleAddAppointment}
                  disabled={adding}
                  className="bg-[#302cfc] hover:bg-[#241fd9]"
                >
                  {adding ? 'Adding...' : 'Add'}
                </Button>
              </TableCell>
            </TableRow>

            {/* Editable Appointments */}
            {filteredAppointments.length ? (
              filteredAppointments.map((appt) => {
                const dateObj = new Date(appt.appointment_date)
                const isEditing = editingId === appt.id

                return (
                  <TableRow key={appt.id} className="hover:bg-black transition">
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editTenant}
                          onChange={(e) => setEditTenant(e.target.value)}
                          className="bg-black text-white"
                        />
                      ) : (
                        appt.tenant_name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left text-white">
                              {editDate ? format(editDate, 'yyyy-MM-dd') : format(dateObj, 'yyyy-MM-dd')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editDate ?? dateObj}
                              onSelect={setEditDate}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        format(dateObj, 'yyyy-MM-dd')
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editTime || format(dateObj, 'HH:mm')}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="bg-black text-white"
                        />
                      ) : (
                        format(dateObj, 'HH:mm')
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editStatus}
                          onValueChange={(val: Appointment['status']) =>
                            setEditStatus(val)
                          }
                        >
                          <SelectTrigger className="w-32 bg-black text-white border border-gray-300">
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
                        <Button
                          onClick={() => {
                            setEditingId(appt.id)
                            setEditTenant(appt.tenant_name)
                            setEditDate(new Date(appt.appointment_date))
                            setEditTime(format(new Date(appt.appointment_date), 'HH:mm'))
                            setEditStatus(appt.status)
                          }}
                          className="bg-[#302cfc] hover:bg-[#241fd9]"
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className='hover:bg-black focus:bg-black active:bg-black'>
              
                <TableCell colSpan={5} className="text-center text-gray-400 py-4">
                  No appointments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </section>
  )
}

export default AppointmentTable