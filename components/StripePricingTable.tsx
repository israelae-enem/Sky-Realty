'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function StripePricingTable() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Stripe script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/pricing-table.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Create Stripe pricing table only after script loads
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return

    const table = document.createElement('stripe-pricing-table')
    table.setAttribute('pricing-table-id', 'prctbl_1RnhoLDBqN04mfAqJLp4npuu')
    table.setAttribute(
      'publishable-key',
      'pk_live_51RUdOXDBqN04mfAqMkcb3lFgHT5fzBoqtgBrw6fi4HaDvD1Pvma3MQv37rBhqoqhmTX3hBIocBXZSxiC7DWnoTWd00V3IpW7bA'
    )
    containerRef.current.appendChild(table)

    const handleSuccess = () => router.push('/realtordashboard')
    const handleCancel = () => router.push('/home')

    window.addEventListener('stripe-pricing-table-success', handleSuccess)
    window.addEventListener('stripe-pricing-table-cancel', handleCancel)

    return () => {
      window.removeEventListener('stripe-pricing-table-success', handleSuccess)
      window.removeEventListener('stripe-pricing-table-cancel', handleCancel)
      if (containerRef.current) containerRef.current.removeChild(table)
    }
  }, [scriptLoaded, router])

  return <div ref={containerRef} />
}