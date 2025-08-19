// components/dashboard/StatCard.tsx
'use client'
import { ReactNode } from 'react'

type StatsCardProps = {
  icon: ReactNode
  title: string
  value: string | number
}

const StatsCard = ({ icon, title, value }: StatsCardProps) => {
  return (
    <div className="bg-black rounded-lg border border-gray-300 p-8 shadow flex items-center space-x-8">
      <div className="p-2 bg-[#302cfc] rounded-full text-white">{icon}</div>
      <div>
        <h4 className="text-sm text-gray-200">{title}</h4>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default StatsCard