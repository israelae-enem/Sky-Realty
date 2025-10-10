import Link from 'next/link'
import React from 'react'

const PropertyCTA = () => {
  return (
    <section className="bg-black text-white rounded-md border p-8 m-5 flex flex-col items-center text-center space-y-6 transition-transform duration-300 hover:scale-[1.02]">
      
      <div className="cta-badge font-bold text-lg px-4 py-2 bg-yellow-500 rounded-md shadow-md hover:bg-yellow-700 transition-colors duration-300">
        Start Your Smart Realty Journey With Sky!
      </div>

      <h1 className="text-3xl font-extrabold">
        Add Your First Property
      </h1>

      <div className="space-y-2 text-base max-w-xl">
        <p>Enjoy our amazing in-app features.</p>
        <p>Manage your properties with ease.</p>
        <p>Welcome to the future.</p>
        <p className="font-bold mt-2">SKY-REALTYAE THE SMART WAY!</p>
      </div>

      <Link href="/subscription" className="mt-4">
        <button className="btn-primary px-6 py-3 hover:bg-blue-900 rounded-md font-semibold text-lg shadow-lg transform transition-transform duration-200 hover:scale-105">
          Add a New Property
        </button>
      </Link>
    </section>
  )
}

export default PropertyCTA