"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"

type Reminder = {
  id: string
  tenant_name: string
  property_address: string
  due_date: string
  status: "pending" | "paid" | "late"
}

export default function RentReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from("rent_payment")
      .select(`
        id,
        due_date,
        status,
        tenant:tenant_id (fullName),
        property:lease_id (address)
      `)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Supabase fetch error:", error)
      toast.error("Failed to fetch rent reminders")
      return
    }

    if (!data || !Array.isArray(data)) {
      toast.error("No rent data found")
      return
    }

    const enriched: Reminder[] = data.map((r: any) => ({
      id: r.id,
      tenant_name: r.tenant?.fullName || "Unknown Tenant",
      property_address: r.property?.address || "Unknown Property",
      due_date: r.due_date,
      status: r.status,
    }))

    setReminders(enriched)
    triggerNotifications(enriched)
  }

  const triggerNotifications = (reminders: Reminder[]) => {
    const todayStr = new Date().toDateString()

    reminders.forEach((r) => {
      const dueStr = new Date(r.due_date).toDateString()

      if (r.status !== "paid") {
        if (dueStr === todayStr) {
          toast.warning(
            `Rent due today for ${r.tenant_name} (${r.property_address})`
          )
        } else if (new Date(r.due_date) < new Date()) {
          toast.error(
            `Overdue rent for ${r.tenant_name} (${r.property_address})`
          )
        }
      }
    })
  }

  const markAsPaid = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("rent_payment")
        .update({ status: "paid" })
        .eq("id", id)

      if (error) throw error

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "paid" } : r))
      )

      toast.success("Marked as Paid ✅")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReminders()

    const channel = supabase
      .channel("rent_reminders_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rent_payment" },
        () => fetchReminders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getRowColor = (status: string, due_date: string) => {
    const today = new Date()
    const due = new Date(due_date)

    if (status === "paid") return "bg-green-900"
    if (status === "pending" && due < today) return "bg-red-900"
    if (status === "pending" && due >= today) return "bg-yellow-900"
    return "bg-gray-800"
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Table view */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Upcoming Rent Reminders</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Tenant</th>
              <th className="px-4 py-2">Property</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length > 0 ? (
              reminders.map((r) => (
                <tr
                  key={r.id}
                  className={`${getRowColor(r.status, r.due_date)} hover:bg-gray-700`}
                >
                  <td className="border px-4 py-2">{r.tenant_name}</td>
                  <td className="border px-4 py-2">{r.property_address}</td>
                  <td className="border px-4 py-2">
                    {new Date(r.due_date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2 capitalize">{r.status}</td>
                  <td className="border px-4 py-2">
                    {r.status !== "paid" && (
                      <button
                        onClick={() => markAsPaid(r.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  No upcoming reminders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Calendar view */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Calendar View</h2>
       
       <Calendar
       mode="single"
       selected={selectedDate}
       onSelect={setSelectedDate}
       modifiers={{
       paid: reminders.filter(r => r.status === "paid").map(r => new Date(r.due_date)),
       pending: reminders.filter(r => r.status === "pending" && new Date(r.due_date) >= new Date()).map(r => new Date(r.due_date)),
       overdue: reminders.filter(r => r.status === "pending" && new Date(r.due_date) < new Date()).map(r => new Date(r.due_date)),
      }}
      modifiersStyles={{
      paid: { backgroundColor: "green", color: "white", borderRadius: "50%" },
      pending: { backgroundColor: "yellow", color: "black", borderRadius: "50%" },
      overdue: { backgroundColor: "red", color: "white", borderRadius: "50%" },
      }}
     className="rounded-md border border-gray-600 bg-gray-900 text-white"
     />

        {/* Show reminders for selected day */}
        <div className="mt-4">
          <h3 className="text-md font-medium">
            {selectedDate
              ? `Reminders for ${selectedDate.toDateString()}`
              : "Select a date"}
          </h3>
          <ul className="mt-2 space-y-2">
            {reminders.filter(
              (r) =>
                new Date(r.due_date).toDateString() ===
                selectedDate?.toDateString()
            ).length > 0 ? (
              reminders
                .filter(
                  (r) =>
                    new Date(r.due_date).toDateString() ===
                    selectedDate?.toDateString()
                )
                .map((r) => (
                  <li
                    key={r.id}
                    className="bg-gray-700 px-3 py-2 rounded flex justify-between items-center"
                  >
                    <span>
                      {r.tenant_name} – {r.property_address}
                    </span>
                    <span className="capitalize">{r.status}</span>
                  </li>
                ))
            ) : (
              <li className="text-gray-400">No reminders</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}