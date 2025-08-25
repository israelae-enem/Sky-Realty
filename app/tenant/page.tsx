import TenantForm from '@/components/TenantForm';
import Image from 'next/image'
import React from 'react'

const Tenant = () => {
  return (
    <div className='flex flex-1 min-h-screen bg-cta text-white justify-between items-center'>

      <TenantForm />

      <Image
      src="/assets/images/agent.jpg"
      height={1000}
      width={1000}
      alt='agent'
      className='max-w-[50%]'
      />

    </div>
  );
}

export default Tenant