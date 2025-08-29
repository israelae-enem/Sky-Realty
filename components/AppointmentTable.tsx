'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'

interface Appointment {
  id: string
  tenant_name: string
  date: string // stored as ISO string in Supabase
  status: 'Scheduled' | 'Completed' | 'Canceled'
  realtor_id: string
}

interface AppointmentTableProps {
  realtorId: string | null
}

const AppointmentTable = ({ realtorId }: AppointmentTableProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [addingAppointment, setAddingAppointment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState<Appointment['status']>('Scheduled')

  // Fetch appointments
  useEffect(() => {
    if (!realtorId) return

    let mounted = true

    const fetchAppointments = async () => {
      setLoadingAppointments(true)
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('date', { ascending: true })

      if (error) {
        setError('Failed to fetch appointments: ' + error.message)
      } else if (mounted) {
        setAppointments(data as Appointment[])
      }
      setLoadingAppointments(false)
    }

    fetchAppointments()

    // Realtime subscription
    const channel = supabase
      .channel(`appointments-realtor-${realtorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `realtor_id=eq.${realtorId}` },
        () => {
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  // Add new appointment
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantName || !date || !time || !realtorId) {
      setError('Please fill in all fields')
      return
    }

    setAddingAppointment(true)
    setError(null)

    try {
      const dateTime = new Date(`${date}T${time}`)

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            realtor_id: realtorId,
            tenant_name: tenantName,
            date: dateTime.toISOString(),
            status,
          },
        ])
        .select()
        .single()

      if (error) throw error

      if (data) {
        // Add immediately to UI
        setAppointments((prev) => [...prev, data])
      }

      // Reset form
      setTenantName('')
      setDate('')
      setTime('')
      setStatus('Scheduled')
    } catch (err: any) {
      setError('Failed to add appointment: ' + err.message)
    } finally {
      setAddingAppointment(false)
    }
  }

  return (
    <section className="mt-10 bg-black p-6 rounded-md shadow-md text-white">
      <h2 className="text-2xl mb-4 text-[#302cfc] font-semibold">
        Maintenance Appointments
      </h2>

      {/* Add Appointment Form */}
      <form onSubmit={handleAddAppointment} className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Tenant Name"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          className="px-3 py-2 rounded bg-black text-white border border-gray-300 flex-grow"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded bg-black text-white border border-gray-300"
          required
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-2 rounded bg-black text-white border border-gray-300"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Appointment['status'])}
          className="px-3 py-2 rounded bg-black text-white border border-gray-300"
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
        <button
          type="submit"
          disabled={addingAppointment}
          className="bg-[#302cfc] hover:bg-[#241fd9] px-4 py-2 rounded disabled:opacity-50"
        >
          {addingAppointment ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Appointments Table */}
      {loadingAppointments && !appointments.length ? (
        <p>Loading appointments...</p>
      ) : (
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-black">
              <th className="border border-gray-300 px-4 py-2">Tenant</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Time</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(({ id, tenant_name, date, status }) => {
              const d = new Date(date)
              return (
                <tr key={id} className="hover:bg-gray-800 transition">
                  <td className="border border-gray-300 px-4 py-2">{tenant_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{format(d, 'yyyy-MM-dd')}</td>
                  <td className="border border-gray-300 px-4 py-2">{format(d, 'HH:mm')}</td>
                  <td className="border border-gray-300 px-4 py-2">{status}</td>
                </tr>
              )
            })}
            {!appointments.length && !loadingAppointments && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default AppointmentTable