import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
     <div className="min-h-screen flex items-center justify-center bg-blue-300">
          <div className="p-6 rounded-lg shadow-lg">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#302cfc] hover:bg-blue-700 text-white',
                },
              }}
            />
          </div>
        </div>
  )
  
}

export default page