'use client'

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"

type Reminder = {
  id: string
  tenant_name: string
  property_address: string
  due_date: string
  status: "Pending" | "Paid" | "Overdue"
  tenant_id: string
  property_id: string
  reminder_sent: boolean
}

export default function RentReminders() {
  const { user } = useUser()
  const realtorId = user?.id ?? null

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const fetchReminders = useCallback(async () => {
    if (!realtorId) return
    setLoading(true)
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("rent_payment")
        .select("*")
        .order("payment_date", { ascending: true })
      if (paymentsError) throw paymentsError
      const payments = paymentsData || []

      const { data: tenantsData } = await supabase
        .from("tenants")
        .select("id, full_name, realtor_id")
        .in("id", payments.map(p => p.tenant_id))
      const tenants = tenantsData || []

      const realtorPayments = payments.filter(p => {
        const tenant = tenants.find(t => t.id === p.tenant_id)
        return tenant?.realtor_id === realtorId
      })

      const { data: propertiesData } = await supabase
        .from("properties")
        .select("id, address")
        .in("id", realtorPayments.map(p => p.property_id))
      const properties = propertiesData || []

      const enriched: Reminder[] = realtorPayments.map(p => {
        const tenant = tenants.find(t => t.id === p.tenant_id) || { full_name: "Unknown Tenant" }
        const property = properties.find(pr => pr.id === p.property_id) || { address: "Unknown Property" }
        return {
          id: p.id,
          tenant_id: p.tenant_id,
          tenant_name: tenant.full_name,
          property_id: p.property_id,
          property_address: property.address,
          due_date: p.payment_date,
          status: p.status,
          reminder_sent: p.reminder_sent || false
        }
      })

      setReminders(enriched)
      triggerNotifications(enriched)

    } catch (err) {
      console.error("Failed to fetch rent reminders:", err)
      toast.error("Failed to fetch rent reminders")
    } finally {
      setLoading(false)
    }
  }, [realtorId])

  const triggerNotifications = async (reminders: Reminder[]) => {
    const today = new Date()
    for (const r of reminders) {
      const due = new Date(r.due_date)
      const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (r.status !== "Paid") {
        if (diffDays === 0) toast.warning(`Rent due today for ${r.tenant_name} (${r.property_address})`)
        else if (diffDays < 0) toast.error(`Overdue rent for ${r.tenant_name} (${r.property_address})`)
        else if (diffDays <= 3) toast(`Upcoming rent in ${diffDays} day(s) for ${r.tenant_name}`)
      }

      if (diffDays > 0 && diffDays <= 3 && !r.reminder_sent && r.status !== "Paid") {
        try {
          await supabase.from("notification").insert([{
            tenant_id: r.tenant_id,
            realtor_id: realtorId,
            rent_payment_id: r.id,
            message: `Hi ${r.tenant_name}, your rent for ${r.property_address} is due on ${due.toDateString()}.`,
            sent_at: new Date().toISOString(),
          }])
          await supabase.from("rent_payment").update({ reminder_sent: true }).eq("id", r.id)
        } catch (err) {
          console.error("Failed to send tenant notification:", err)
        }
      }
    }
  }

  const markAsPaid = async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("rent_payment")
        .update({ status: "Paid", updated_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
      setReminders(prev => prev.map(r => (r.id === id ? { ...r, status: "Paid" } : r)))
      toast.success("Marked as Paid ✅")
    } catch (err) {
      console.error(err)
      toast.error("Failed to mark as paid")
    } finally {
      setLoading(false)
    }
  }

  const getRowColor = (status: string, due_date: string) => {
    const today = new Date()
    const due = new Date(due_date)
    if (status === "Paid") return "bg-green-100"
    if (status === "Pending" && due < today) return "bg-red-100"
    if (status === "Pending" && due >= today) return "bg-yellow-100"
    return "bg-gray-100"
  }

  useEffect(() => {
    if (!realtorId) return
    fetchReminders()
    const channel = supabase
      .channel(`rent_reminders_${realtorId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rent_payment" },
        () => fetchReminders()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReminders, realtorId])

  return (
    <div className="bg-gray-100 rounded-lg p-6 grid grid-cols-1 lg:grid-cols-[3fr-1fr] gap-8">
      {/* Table view */}
      <div className="overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Upcoming Rent Reminders</h2>
        <table className="min-w-full table-auto border border-gray-300 rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300">Tenant</th>
              <th className="px-4 py-2 border border-gray-300">Property</th>
              <th className="px-4 py-2 border border-gray-300">Due Date</th>
              <th className="px-4 py-2 border border-gray-300">Status</th>
              <th className="px-4 py-2 border border-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length ? reminders.map((r, idx) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${getRowColor(r.status, r.due_date)} hover:bg-gray-200`}
              >
                <td className="border px-4 py-2">{r.tenant_name}</td>
                <td className="border px-4 py-2">{r.property_address}</td>
                <td className="border px-4 py-2">{new Date(r.due_date).toLocaleDateString()}</td>
                <td className="border px-4 py-2 capitalize">{r.status}</td>
                <td className="border px-4 py-2 text-center">
                  {r.status === "Paid" && <span className="text-green-600 text-xl">✅</span>}
                  {r.status === "Pending" && new Date(r.due_date) >= new Date() && <span className="text-yellow-600 text-xl">⚠</span>}
                  {r.status === "Pending" && new Date(r.due_date) < new Date() && <span className="text-red-600 text-xl">❌</span>}
                  {r.status !== "Paid" && new Date(r.due_date) >= new Date() && (
                    <button
                      onClick={() => markAsPaid(r.id)}
                      disabled={loading}
                      className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-all duration-200"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </motion.tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No upcoming reminders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Calendar view */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Calendar View</h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{
            paid: reminders.filter(r => r.status === "Paid").map(r => new Date(r.due_date)),
            pending: reminders.filter(r => r.status === "Pending" && new Date(r.due_date) >= new Date()).map(r => new Date(r.due_date)),
            overdue: reminders.filter(r => r.status === "Pending" && new Date(r.due_date) < new Date()).map(r => new Date(r.due_date)),
          }}
          modifiersStyles={{
            paid: { backgroundColor: "#34D399", color: "white", borderRadius: "50%" },
            pending: { backgroundColor: "#FBBF24", color: "black", borderRadius: "50%" },
            overdue: { backgroundColor: "#F87171", color: "white", borderRadius: "50%" },
          }}
          className="rounded-md border border-gray-300 bg-white text-gray-800"
        />
      </motion.div>
    </div>
  )
}