'use client'

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
} from 'chart.js'
import { useUser } from '@clerk/nextjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RentAnalyticsChart() {
  const { user } = useUser()
  const realtorId = user?.id || null
  const analytics = useRentAnalytics(realtorId)

  const data = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [
      {
        label: 'Rent Status',
        data: [
          analytics.total_collected,
          analytics.total_outstanding,
          analytics.total_late,
        ],
        backgroundColor: ['#30fc8f', '#fcdc30', '#fc3030'],
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Rent Status Breakdown', color: '#ffffff' },
    },
    scales: {
      x: { ticks: { color: '#ffffff' }, grid: { color: '#444' } },
      y: { ticks: { color: '#ffffff' }, grid: { color: '#444' } },
    },
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-6">
      <Bar data={data} options={options} />
    </div>
  )
}