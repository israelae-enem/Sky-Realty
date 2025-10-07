import MaintenanceForm from '@/components/MaintenanceForm'
import Image from 'next/image'
import React from 'react'

const Realtor = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">

      

      {/* Image Section */}
      <div className="w-full md:w-1/2 relative h-64 md:h-auto flex">
        <Image
          src="/assets/images/maintenance-request.jpg"
          alt="agent"
          fill
          className="object-cover w-full h-full"
        />
      </div>

        {/* Form Section */}
      <div className="w-full md:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <MaintenanceForm />
        </div>
      </div>

    </div>
  )
}

export default Realtor