"use client"
import MaintenanceForm from '@/components/MaintenanceForm';
import Image from 'next/image'
import React, { useEffect, useState } from 'react';

const Maintenance = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setImageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">

      {/* Image Section */}
      <div
        className="w-full md:w-1/2 relative h-64 md:h-auto transition-opacity duration-1000 ease-in-out"
        style={{ opacity: imageLoaded ? 1 : 0 }}
      >
        <Image
          src="/assets/images/maintenance-request.jpg"
          alt="Maintenance"
          fill
          className="object-cover w-full h-full"
        />
      </div>


       {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <MaintenanceForm  />
        </div>
      </div>

    </div>
  );
}

export default Maintenance;