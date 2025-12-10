'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useRentAnalytics from '@/app/hooks/useAnalytics'
import { supabase } from '@/lib/supabaseClient'

export default function RentAnalyticsCard() {
  const [user, setUser] = useState<any>(null)

  // Get current signed-in user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    getUser()
  }, [])

  const realtorId = user?.id || null
  const analytics = useRentAnalytics(realtorId)

  // Count-up states
  const [paid, setPaid] = useState(0)
  const [pending, setPending] = useState(0)
  const [overdue, setOverdue] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 30

    const paidStep = analytics.total_collected / steps
    const pendingStep = analytics.total_outstanding / steps
    const overdueStep = analytics.total_late / steps

    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      setPaid(Math.round(paidStep * currentStep))
      setPending(Math.round(pendingStep * currentStep))
      setOverdue(Math.round(overdueStep * currentStep))

      if (currentStep >= steps) clearInterval(interval)
    }, duration / steps)

    return () => clearInterval(interval)
  }, [
    analytics.total_collected,
    analytics.total_outstanding,
    analytics.total_late,
  ])

  const stats = [
    { label: 'Paid', value: paid, color: 'text-green-600' },
    { label: 'Pending', value: pending, color: 'text-yellow-600' },
    { label: 'Overdue', value: overdue, color: 'text-red-600' },
  ]

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gray-200 border border-gray-300 rounded-lg p-5 text-gray-800 shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4 text-[#302cfc]">Rent Summary</h2>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 + idx * 0.1,
              type: 'spring',
              stiffness: 120,
            }}
            className="bg-gray-300 p-4 rounded text-center cursor-pointer shadow-sm"
          >
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color}`}>${stat.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}