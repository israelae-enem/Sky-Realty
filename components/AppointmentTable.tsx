'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format } from 'date-fns'

interface Appointment {
  id: string
  tenantName: string
  date: Timestamp
  status: string
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
  const [status, setStatus] = useState('Scheduled')

  useEffect(() => {
    if (!realtorId) return

    setLoadingAppointments(true)

    const q = query(
      collection(db, 'appointments'),
      where('realtorId', '==', realtorId),
      orderBy('date', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const apps: Appointment[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          apps.push({
            id: doc.id,
            tenantName: data.tenantName,
            date: data.date,
            status: data.status,
          })
        })
        setAppointments(apps)
        setLoadingAppointments(false)
      },
      (err) => {
        setError('Failed to fetch appointments: ' + err.message)
        setLoadingAppointments(false)
      }
    )

    return () => unsubscribe()
  }, [realtorId])

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantName || !date || !time) {
      setError('Please fill in all fields')
      return
    }

    setAddingAppointment(true)
    setError(null)

    try {
      const dateTime = new Date(`${date}T${time}`)
      await addDoc(collection(db, 'appointments'), {
        realtorId,
        tenantName,
        date: Timestamp.fromDate(dateTime),
        status,
      })

      setTenantName('')
      setDate('')
      setTime('')
      setStatus('Scheduled')
    } catch (err: any) {
      setError('Failed to add appointment: ' + err.message)
    }

    setAddingAppointment(false)
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
          placeholder='12:00'
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-2 rounded bg-white text-black border border-gray-300"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
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

      {/* Error */}
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
            {appointments.map(({ id, tenantName, date, status }) => (
              <tr key={id} className="hover:bg-gray-800 transition">
                <td className="border border-gray-300 px-4 py-2">{tenantName}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {format(date.toDate(), 'yyyy-MM-dd')}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {format(date.toDate(), 'HH:mm')}
                </td>
                <td className="border border-gray-300 px-4 py-2">{status}</td>
              </tr>
            ))}
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