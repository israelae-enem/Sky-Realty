"use client"; // <-- Force client-side rendering

import TenantForm from '@/components/TenantForm';
import Image from 'next/image';
import React, { Suspense } from 'react';

const Tenant = () => {
  return (
    <div className="flex flex-1 min-h-screen bg-cta text-white justify-between items-center">

      {/* Wrap the form in Suspense in case it loads async data */}
      <Suspense fallback={<div>Loading form...</div>}>
        <TenantForm />
      </Suspense>

      <Image
        src="/assets/images/agent.jpg"
        height={1000}
        width={1000}
        alt="agent"
        className="max-w-[50%]"
      />

    </div>
  );
}

export default Tenant;