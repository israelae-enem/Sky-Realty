'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import { Lock, Mail, Phone, User } from 'lucide-react';

interface FormState {
  full_name: string;
  email: string;
  password: string;
  phone: string; // E.164
  property_id: string;
  realtor_id: string;
}

const TenantForm = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    property_id: '',
    realtor_id: '',
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [realtors, setRealtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value: string) => {
    if (!value) return setForm({ ...form, phone: '' });
    const phoneE164 = '+' + value.replace(/\D/g, '');
    setForm({ ...form, phone: phoneE164 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.full_name || !form.email || !form.password || !form.phone || !form.property_id || !form.realtor_id) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Sign up the tenant in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user?.id) throw new Error('Failed to get tenant ID after sign up');

      const tenantId = signUpData.user.id;

      // 2️⃣ Insert tenant profile in 'tenants' table
      const { error: insertError } = await supabase.from('tenants').insert([
        {
          id: tenantId,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          property_id: form.property_id,
          realtor_id: form.realtor_id,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // 3️⃣ Automatically sign in the tenant
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      toast.success('✅ Tenant account created!');
      router.push(`/tenant/${tenantId}/dashboard`);
    } catch (err: any) {
      console.error('Tenant creation error:', err);
      toast.error(err?.message || 'Failed to create tenant account.');
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

   const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };

  return (

    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto mt-10 mb-10 bg-white p-8 rounded-xl shadow-lg"
      initial="hidden"
      animate="visible"
    >
      {/* Full Name */}
      <motion.div className="relative" custom={0} variants={fadeUpVariant}>
        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
          className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Email */}
      <motion.div className="relative" custom={1} variants={fadeUpVariant}>
        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Password */}
      <motion.div className="relative" custom={2} variants={fadeUpVariant}>
        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Phone */}
      <motion.div className="relative" custom={3} variants={fadeUpVariant}>
        <Phone className="absolute left-3 top-8 h-5 w-5 text-gray-400 " />
        <PhoneInput
          country={'us'}
          value={form.phone.replace('+','')}
          onChange={handlePhoneChange}
          enableAreaCodes
          countryCodeEditable={true}
          preferredCountries={['us','gb','ca','au','in']}
          inputClass="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          containerClass="w-full"
        />
      </motion.div>
   



      {/* Property select */}
      <select
        value={form.property_id}
        onChange={(e) => setForm({ ...form, property_id: e.target.value })}
        className="w-full p-2 rounded border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Property</option>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title || p.address}
          </option>
        ))}
      </select>

      {/* Realtor select */}
      <select
        value={form.realtor_id}
        onChange={(e) => setForm({ ...form, realtor_id: e.target.value })}
        className="w-full p-2 rounded border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Realtor</option>
        {realtors.map((r) => (
          <option key={r.id} value={r.id}>
            {r.full_name}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#302cfc] hover:bg-[#241fd9] rounded text-white font-semibold"
      >
        {loading ? 'Creating Tenant...' : 'Complete Onboarding'}
      </button>
    </motion.form>
  );
};

export default TenantForm;