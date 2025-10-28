'use client'

import useRentAnalytics from '@/app/hooks/useAnalytics'
import { useUser } from '@clerk/nextjs'

export default function RentAnalyticsCard() {
  const { user } = useUser() // Clerk user
  const realtorId = user?.id || null
  const analytics = useRentAnalytics(realtorId)

  return (
    <div className="bg-gray-950 border border-gray-300 rounded-lg p-4 text-white">
      <h2 className="text-xl font-semibold mb-3 text-[#302cfc]">Rent Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#222224] p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Paid</p>
          <p className="text-green-400 text-lg font-bold">${analytics.total_collected}</p>
        </div>
        <div className="bg-[#222224] p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-yellow-400 text-lg font-bold">${analytics.total_outstanding}</p>
        </div>
        <div className="bg-[#222224] p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Overdue</p>
          <p className="text-red-400 text-lg font-bold">${analytics.total_late}</p>
        </div>
      </div>
    </div>
  )
}