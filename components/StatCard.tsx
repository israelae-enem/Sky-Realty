// components/dashboard/StatCard.tsx
'use client'
import { ReactNode, useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

type StatsCardProps = {
  icon: ReactNode
  title: string
  value: number | string
}

const StatsCard = ({ icon, title, value }: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState<number>(0)
  const isNumber = typeof value === 'number'

  useEffect(() => {
    if (!isNumber) return
    let start = 0
    const end = value as number
    const duration = 1.2 // seconds
    const stepTime = Math.abs(Math.floor((duration * 1000) / end))
    const timer = setInterval(() => {
      start += 1
      if (start >= end) {
        start = end
        clearInterval(timer)
      }
      setDisplayValue(start)
    }, stepTime)
    return () => clearInterval(timer)
  }, [value, isNumber])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-gray-100 rounded-lg border border-gray-300 p-6 shadow hover:shadow-lg flex items-center space-x-6 transition-all duration-300"
    >
      <div className="p-3 bg-[#302cfc] rounded-full text-white flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="text-sm text-gray-700">{title}</h4>
        <p className="text-2xl font-bold text-gray-900">
          {isNumber ? displayValue : value}
        </p>
      </div>
    </motion.div>
  )
}

export default StatsCard