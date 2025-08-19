import Link from 'next/link'
import React from 'react'


const PropertyCTA = () => {
  return (
    <section className='bg-cta section text-white justify-items-center rounded-md border m-5'>
      <div className='cta-badge m-5 text-bold'> Start Your Smart Realty Journey With Sky!.</div>
        <h1 className='text-2xl font-bold text-white m-5 '>Add and Personalize Your Property</h1>
        <p>Enjoy our amazing in-app features.</p>
        <p>Manage your properties with ease.</p>
        <p>Welcome to the future.</p>
        <p className='font-bold'>SKY-REALTY the SMART WAY!</p>
        <button className='btn-primary m-5'>
          <Link href="/subscription">
          <p>Add a New Property</p>
          </Link>
        </button>

    </section>
  )
}

export default PropertyCTA