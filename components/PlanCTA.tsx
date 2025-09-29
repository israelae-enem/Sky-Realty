import Link from 'next/link'
import React from 'react'

const PlanCTA = () => {
  return (
    <section className='bg-cta section text-white justify-items-center rounded-md border m-5'>
      <div className='cta-badge m-5 mb-5 font-bold'> Choose From 3 of Our Amazing Plans!.</div>
        <h1 className='text-2xl items-center justify-center font-bold text-white m-5 '>
           GET STARTED </h1>
        

        <p>Add Up to 5 Properties with our <strong className='text-blue-400'>BASIC PLAN</strong>.</p>
        <p>Manage 10 Properties with our <strong className='text-blue-400'>PRO PLAN</strong>.</p>
        <p>Manage unlimited properties with our <strong className='text-blue-400'>PREMIUM PLAN</strong>.</p>
        <p className='font-bold'>SKY-REALTY the SMART WAY!</p>
        <button className='btn-primary mt-5 mb-5 hover:bg-blue-900'>
          <Link href="/subscription">
          <p>Choose A Plan</p>
          </Link>

        </button>

    </section>
  )
}

export default PlanCTA