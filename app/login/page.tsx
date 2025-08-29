import LoginForm from '@/components/LoginForm';
import Image from 'next/image'
import React from 'react'

const Login = () => {
  return (
    <div className='flex flex-1 bg-cta text-white justify-between items-center'>

      <LoginForm />

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

export default Login