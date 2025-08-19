'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default function StripePricingTable() {
  const router = useRouter()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/pricing-table.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])
  
  useEffect(() => {
    const handleSuccess = () => {
      // Redirect to realtor dashboard
      router.push('/realtordashboard')
    }

    window.addEventListener('stripe-pricing-table-success', handleSuccess)

    return () => {
      window.removeEventListener('stripe-pricing-table-success', handleSuccess)
    }
  }, [router])



  return React.createElement('stripe-pricing-table', {
    'pricing-table-id': 'prctbl_1RnhoLDBqN04mfAqJLp4npuu',
    'publishable-key': 'pk_live_51RUdOXDBqN04mfAqMkcb3lFgHT5fzBoqtgBrw6fi4HaDvD1Pvma3MQv37rBhqoqhmTX3hBIocBXZSxiC7DWnoTWd00V3IpW7bA',
  })
}