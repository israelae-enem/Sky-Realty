// components/CommunicationSection.jsx
"use client"
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function CommunicationSection() {
  const features = [
    {
      title: 'Manage Maintenance Requests Easily',
      description:
        'Track and handle all maintenance requests in one place, reducing confusion and saving time.',
      link: '/maintenance',
    },
    {
      title: 'Send Reminders and Updates Automatically',
      description:
        'Keep tenants informed with automated reminders and updates, ensuring smooth communication.',
      link: '/'
    },
    {
      title: 'Store Every Record Securely',
      description:
        'All tenant communication and maintenance records are securely stored and easy to access whenever needed.',
        link:'/'
      
    },
  ];

  return (
     
          <section className="py-20 px-10 md:px-20 bg-gray-50">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-blue-700 mb-6"
                initial={{ opacity: 0, y: -50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Keep All Your Conversations in One Place
              </motion.h2>
              <motion.p
                className="text-lg text-gray-700 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Simplify communication with your landlord and track maintenance requests easily.
              </motion.p>
            </div>
    
            <div className="flex flex-col md:flex-row items-center gap-10">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/assets/images/communication.jpg"
                  height={1000}
                  width={1000}
                  alt="Tenant communication"
                  className="w-full h-full object-cover md:h-[500px] sm:h-[350px] rounded-lg"
                  priority
                />
              </motion.div>
    
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-blue-700 text-2xl font-semibold mb-3">Manage Maintenance Requests Easily</h3>
                  <p className="text-gray-400 mb-4">
                    Submit and track requests without confusion. <Link href="/maintenance" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-blue-700 text-2xl font-semibold mb-3">Send and Receive Updates</h3>
                  <p className="text-gray-400 mb-4">
                    Get notified about your requests and updates automatically. <Link href="/reminders" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-blue-700 text-2xl font-semibold mb-3">Store Every Record Securely</h3>
                  <p className="text-gray-400 mb-4">
                    All communication and records are safely stored. <Link href="/records" target="_blank" className="text-blue-700 hover:underline">Learn More &rarr;</Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
  );
}