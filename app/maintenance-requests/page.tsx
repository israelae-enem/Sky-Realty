"use client"
import MaintenanceForm from '@/components/MaintenanceForm';
import Image from 'next/image'


const Maintenance= () => {
  
  return (
    <div className='min-h-screen flex flex-1 bg-cta text-white justify-between items-center'>

      <MaintenanceForm closeModal={() => {}} />

      <Image
      src="/assets/images/maintenance-request.jpg"
      height={1000}
      width={1000}
      alt='agent'
      className='max-w-[50%] ml-5'
      />

    </div>
  );
}

export default Maintenance