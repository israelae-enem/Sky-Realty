'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';

const TenantForm = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(false);
  const [full_name, setFullName] = useState('');
  const [phone, setPhone] = useState(''); // will store E.164 with +
  const [properties, setProperties] = useState<any[]>([]);
  const [realtors, setRealtors] = useState<any[]>([]);
  const [searchProperty, setSearchProperty] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [searchRealtor, setSearchRealtor] = useState('');
  const [selectedRealtor, setSelectedRealtor] = useState<any>(null);
  const [error, setError] = useState('');

  // Fetch properties & realtors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: propertyData } = await supabase
          .from('properties')
          .select('id, address, title');

        const { data: realtorData } = await supabase
          .from('realtors')
          .select('id, full_name');

        setProperties(propertyData || []);
        setRealtors(realtorData || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch properties or realtors.');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoaded || !user) {
      toast.error('You must be logged in to create a tenant account.');
      return;
    }

    if (!full_name || !phone || !selectedProperty || !selectedRealtor) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .upsert(
          [{
            id: user.id, // Clerk ID as text
            full_name,
            phone,
            email: user.primaryEmailAddress?.emailAddress || '',
            property_id: selectedProperty.id,
            realtor_id: selectedRealtor.id,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }],
        );

      if (error) throw error;

      toast.success('✅ Tenant account created successfully!');
      router.push(`/tenant/${user.id}/dashboard`);
    } catch (err: any) {
      console.error('Tenant creation error:', err);
      toast.error(err.message || 'Failed to create tenant account.');
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg"
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-2xl font-bold mb-4 text-gray-800"
        custom={0}
        variants={fadeUpVariant}
      >
        Tenant Registration
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Input */}
        <motion.input
          type="text"
          placeholder="Full Name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          custom={1}
          variants={fadeUpVariant}
        />

        {/* Phone Number Input using react-phone-input-2 */}
        <motion.div custom={2} variants={fadeUpVariant}>
          <PhoneInput
            country={'us'} // lowercase ISO code
            value={phone.replace('+','')} // remove + for the component
            onChange={(value, countryData) => {
              if (!value) return setPhone('');
              const phoneE164 = '+' + value.replace(/\D/g, '');
              setPhone(phoneE164);
            }}
            enableAreaCodes
            countryCodeEditable={false}
            preferredCountries={['us','gb','ca','au','in']}
            inputClass="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            containerClass="w-full"
          />
        </motion.div>

        {/* Email readonly */}
        <motion.input
          type="email"
          value={user?.primaryEmailAddress?.emailAddress || ''}
          disabled
          className="w-full p-2 rounded border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
          custom={3}
          variants={fadeUpVariant}
        />

        {/* Property selection */}
        <motion.div custom={4} variants={fadeUpVariant}>
          {!selectedProperty ? (
            <>
              <input
                type="text"
                placeholder="Search Property by Address or Title"
                value={searchProperty}
                onChange={(e) => {
                  setSearchProperty(e.target.value);
                  setSelectedProperty(null);
                }}
                className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchProperty && (
                <div className="bg-gray-100 border border-gray-300 mt-1 rounded max-h-40 overflow-y-auto">
                  {properties
                    .filter(
                      (p) =>
                        p.address?.toLowerCase().includes(searchProperty.toLowerCase()) ||
                        p.title?.toLowerCase().includes(searchProperty.toLowerCase())
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => setSelectedProperty(p)}
                      >
                        {p.title || p.address}
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-2 bg-green-100 rounded">
              Selected Property: {selectedProperty.title || selectedProperty.address}{' '}
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="ml-2 text-red-500 hover:underline"
              >
                Change
              </button>
            </div>
          )}
        </motion.div>

        {/* Realtor selection */}
        <motion.div custom={5} variants={fadeUpVariant}>
          {!selectedRealtor ? (
            <>
              <input
                type="text"
                placeholder="Search Realtor by Name"
                value={searchRealtor}
                onChange={(e) => {
                  setSearchRealtor(e.target.value);
                  setSelectedRealtor(null);
                }}
                className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchRealtor && (
                <div className="bg-gray-100 border border-gray-300 mt-1 rounded max-h-40 overflow-y-auto">
                  {realtors
                    .filter((r) => r.full_name.toLowerCase().includes(searchRealtor.toLowerCase()))
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => setSelectedRealtor(r)}
                      >
                        {r.full_name}
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-2 bg-green-100 rounded">
              Selected Realtor: {selectedRealtor.full_name}{' '}
              <button
                type="button"
                onClick={() => setSelectedRealtor(null)}
                className="ml-2 text-red-500 hover:underline"
              >
                Change
              </button>
            </div>
          )}
        </motion.div>

        {error && <p className="text-red-500">{error}</p>}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded text-white font-semibold"
          custom={6}
          variants={fadeUpVariant}
        >
          {loading ? 'Creating Tenant...' : 'Complete Onboarding'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TenantForm;