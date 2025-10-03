import Link from 'next/link'
import React from 'react'

const PlanCTA = () => {
  return (
    <section className="bg-black text-white rounded-md border p-8 m-5 flex flex-col items-center text-center space-y-6 transition-transform duration-300 hover:scale-[1.02]">
      
      <div className="cta-badge font-bold text-lg px-4 py-2 bg-yellow-500 rounded-md shadow-md hover:bg-yellow-700 transition-colors duration-300">
        Choose From 3 of Our Amazing Plans!
      </div>

      <h1 className="text-3xl font-extrabold hover:text-blue-400 transition-colors duration-300">
        GET STARTED
      </h1>

      <div className="space-y-3 text-base max-w-xl">
        <p className="hover:text-blue-300 transition-colors duration-300">
          Add up to <strong className="text-blue-400">10 Properties</strong> with our BASIC PLAN.
        </p>
        <p className="hover:text-blue-300 transition-colors duration-300">
          Manage <strong className="text-blue-400">20 Properties</strong> with our PRO PLAN.
        </p>
        <p className="hover:text-blue-300 transition-colors duration-300">
          Manage <strong className="text-blue-400">unlimited properties</strong> with our PREMIUM PLAN.
        </p>
        <p className="font-bold mt-2 hover:text-blue-300 transition-colors duration-300">
          SKY-REALTY — the SMART WAY!
        </p>
      </div>

      <Link href="/subscription" className="mt-4">
        <button className="btn-primary px-6 py-3 hover:bg-blue-900 rounded-md font-semibold text-lg shadow-lg transform transition-transform duration-200 hover:scale-105">
          Choose A Plan
        </button>
      </Link>
    </section>
  )
}

export default PlanCTA