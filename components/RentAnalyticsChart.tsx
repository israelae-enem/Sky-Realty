'use client'

import { motion } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import useRentAnalytics from '@/app/hooks/useAnalytics'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RentAnalyticsChart() {
  const [user, setUser] = useState<any>(null)

  // Fetch Supabase user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    getUser()
  }, [])

  const realtorId = user?.id || null
  const analytics = useRentAnalytics(realtorId)
  const [chartData, setChartData] = useState<number[]>([0, 0, 0])

  // Animate chart data load
  useEffect(() => {
    const timeout = setTimeout(() => {
      setChartData([
        analytics.total_collected,
        analytics.total_outstanding,
        analytics.total_late,
      ])
    }, 300)
    return () => clearTimeout(timeout)
  }, [analytics])

  if (!user) return null

  const data = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [
      {
        label: 'Rent Status',
        data: chartData,
        backgroundColor: ['#2ECC71', '#F1C40F', '#E74C3C'],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        hoverBackgroundColor: ['#27AE60', '#D4AC0D', '#C0392B'],
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        labels: {
          color: '#1e293b',
          font: { size: 14, weight: 500 },
        },
      },
      title: {
        display: true,
        text: 'Rent Status Breakdown',
        color: '#111827',
        font: { size: 18, weight: 'bold' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#374151', font: { weight: 500 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { color: '#374151' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-white border border-gray-200 p-6 rounded-lg shadow-md mb-6 transition-all duration-300 hover:shadow-lg"
    >
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-800 mb-4 text-center"
      >
        Monthly Rent Analytics
      </motion.h2>

      <motion.div
        key={chartData.join('-')}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Bar data={data} options={options} />
      </motion.div>
    </motion.div>
  )
}