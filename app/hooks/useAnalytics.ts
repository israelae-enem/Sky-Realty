'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface RentAnalytics {
  total_collected: number
  total_outstanding: number
  total_late: number
}

export default function useRentAnalytics(realtorId?: string | null) {
  const [analytics, setAnalytics] = useState<RentAnalytics>({
    total_collected: 0,
    total_outstanding: 0,
    total_late: 0,
  })

  useEffect(() => {
    if (!realtorId) return

    const fetchAnalytics = async () => {
      const { data, error } = await supabase
        .from('rent_payment')
        .select('amount, status')
        .in(
          'property_id',
          (
            await supabase
              .from('properties')
              .select('id')
              .eq('realtor_id', realtorId)
          ).data?.map((p) => p.id) || []
        )

      if (error) {
        console.error('Error fetching rent analytics:', error)
        return
      }

      const paid = data?.filter((p) => p.status === 'Paid') ?? []
      const pending = data?.filter((p) => p.status === 'Pending') ?? []
      const overdue = data?.filter((p) => p.status === 'Overdue') ?? []

      setAnalytics({
        total_collected: paid.reduce((sum, p) => sum + (p.amount || 0), 0),
        total_outstanding: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
        total_late: overdue.reduce((sum, p) => sum + (p.amount || 0), 0),
      })
    }

    fetchAnalytics()

    // Realtime updates
    const channel = supabase
      .channel(`rent-analytics-${realtorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rent_payment' },
        () => fetchAnalytics()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtorId])

  return analytics
}