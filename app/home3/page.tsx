'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { supabase } from '@/lib/supabaseClient'
import Footer from '@/components/Footer'

interface Property {
  id: string
  title: string
  address: string
  price: number
  image_url: string
  type: 'buy' | 'rent'
}

export default function PropertyPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filterType, setFilterType] = useState<'buy' | 'rent' | ''>('')

  const dummyProperties: Property[] = [
    {
      id: '1',
      title: 'Modern Villa',
      address: 'Palm Jumeirah, Dubai',
      price: 4500000,
      image_url: "/assets/images/burj3.jpg",
      type: 'buy',
    },
    {
      id: '2',
      title: 'Luxury Apartment',
      address: 'Downtown Dubai',
      price: 2500000,
      image_url: '/assets/images/pic.jpg',
      type: 'buy',
    },
    {
      id: '3',
      title: 'Cozy Townhouse',
      address: 'Jumeirah Village Circle',
      price: 1800000,
      image_url: '/assets/images/pic1.jpg',
      type: 'rent',
    },
    {
      id: '4',
      title: 'Office Space',
      address: 'Business Bay',
      price: 120000,
      image_url: '/assets/images/burj.jpg',
      type: 'rent',
    },
  ]

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data && data.length > 0) {
        const fetched: Property[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          address: p.address,
          price: p.price,
          image_url: p.image_url ?? '/assets/images/property1.jpg',
          type: p.type ?? 'buy',
        }))
        setProperties(fetched)
      } else {
        setProperties(dummyProperties)
      }
    } catch (err) {
      console.error('Supabase fetch error:', err)
      setProperties(dummyProperties)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const filteredProperties = filterType
    ? properties.filter((p) => p.type === filterType)
    : properties

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[450px] bg-gray-100 flex items-center justify-center">
        <img
          src="/assets/images/burj4.jpg"
          alt="Hero"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute text-center text-white">
          <h1 className="text-5xl font-bold mb-2">Find Your Dream Property in UAE</h1>
          <p className="text-xl text-gray-800">
            Explore Properties, Transactions, and Realtors all in one platform
          </p>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white rounded-full p-2 shadow-md">
          {['Properties', 'Transactions', 'Realtors'].map((item) => (
            <a
              key={item}
              href="/properties"
              className="px-4 py-2 font-medium text-gray-800 hover:text-blue-600 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center bg-gray-100 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Start Your Property Journey</h2>
        <p className="text-gray-700 mb-6 text-center max-w-2xl">
          Browse properties and find your perfect home today. Connect with verified agents across UAE.
        </p>
        <a
          href="/properties"
          className="bg-[#1836b2] text-white px-6 py-3 rounded-full hover:bg-[#0f28a0] transition"
        >
          Browse Properties
        </a>
      </section>

      {/* Swipeable Cards */}
      <section className="py-12 px-4 bg-white flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Why Choose Us</h2>
        <div className="flex overflow-x-auto gap-6 justify-center">
          <motion.div whileHover={{ y: -10 }} className="flex-none w-72 h-48 bg-[#1836b2] text-white rounded-lg p-6 shadow-lg flex flex-col justify-center items-center text-center cursor-pointer">
            <h3 className="text-xl font-bold mb-2">UAE Transactions</h3>
            <p>Transparent, safe, and fully documented property transactions across UAE.</p>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="flex-none w-72 h-48 bg-blue-500 text-white rounded-lg p-6 shadow-lg flex flex-col justify-center items-center text-center cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Sky Realty</h3>
            <p>Your trusted partner in real estate investments, ensuring top returns.</p>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="flex-none w-72 h-48 bg-[#1836b2] text-white rounded-lg p-6 shadow-lg flex flex-col justify-center items-center text-center cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Property Management</h3>
            <p>Manage your properties effortlessly with professional support and services.</p>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="flex-none w-72 h-48 bg-blue-500 text-white rounded-lg p-6 shadow-lg flex flex-col justify-center items-center text-center cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Roth</h3>
            <p>Comprehensive analytics and insights to maximize your property investments.</p>
          </motion.div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12 px-4 bg-gray-100 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Featured Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-center">
          {filteredProperties.map((p) => (
            <motion.div key={p.id} whileHover={{ scale: 1.05 }} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
              <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="text-gray-500">{p.address}</p>
                <p className="text-[#1836b2] font-semibold mt-2">${p.price.toLocaleString()}</p>
                <div className="mt-3 flex gap-2">
                  <a href={`/properties/${p.id}`} className="bg-[#1836b2] text-white px-4 py-2 rounded-full hover:bg-[#0f28a0] transition flex-1 text-center">
                    View Details
                  </a>
                  <a href="/properties" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition flex-1 text-center">
                    Contact Agent
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular in UAE Section */}
      <section className="py-12 px-4 bg-white flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Popular in UAE</h2>
        <div className="flex gap-6 mb-8 justify-center">
          {['Buy', 'Rent'].map((cat) => (
            <a
              key={cat}
              href="/properties"
              className={clsx(
                'px-8 py-4 rounded-md font-semibold text-white transition',
                filterType.toLowerCase() === cat.toLowerCase() ? 'bg-[#1836b2]' : 'bg-blue-500'
              )}
              onClick={() => setFilterType(cat.toLowerCase() as 'buy' | 'rent' | '')}
            >
              {cat}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {['Villas', 'Apartments', 'Townhouses', 'Offices'].map((cat) => (
            <a
              key={cat}
              href="/properties"
              className="w-52 h-52 bg-[#1836b2] text-white rounded-full flex items-center justify-center shadow-md font-medium hover:bg-blue-500 transition text-center text-lg"
            >
              {cat}
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section Again */}
      <section className="py-12 text-center bg-gray-100 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Start Your Property Journey</h2>
        <p className="text-gray-700 mb-6 text-center max-w-2xl">
          Browse properties and find your perfect home today. Connect with verified agents across UAE.
        </p>
        <a
          href="/properties"
          className="bg-[#1836b2] text-white px-6 py-3 rounded-full hover:bg-[#0f28a0] transition"
        >
          Browse Properties
        </a>
      </section>
      <Footer />
    </div>
  )
}