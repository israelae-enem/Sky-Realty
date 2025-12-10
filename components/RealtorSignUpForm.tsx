'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import { User, Mail, Phone, Lock } from 'lucide-react';

interface FormState {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  company_name: string;
  address: string;
  country: string;
  
}

export default function RealtorSignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    company_name: '',
    address: '',
    country: '',
    
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value: string, countryData: any) => {
    const phoneE164 = '+' + value.replace(/\D/g, '');
    setForm({
      ...form,
      phone_number: phoneE164,
      country: countryData.countryCode.toUpperCase(),
      
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Create Supabase Auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error('Failed to get user ID after sign up');

      // 2️⃣ Insert into realtors table
      const { error: insertError } = await supabase.from('realtors').insert([
        {
          id: userId,
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number,
          company_name: form.company_name,
          address: form.address,
          country: form.country,
          
          subscription_status: 'inactive',
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast.success('✅ Account created! Check your email to confirm.');
      router.push(`/realtor/${userId}/dashboard`); 
    } catch (err: any) {
      console.error('Sign up error:', err);
      toast.error(err?.message || 'Failed to sign up');
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
          value={form.phone_number.replace('+','')}
          onChange={handlePhoneChange}
          enableAreaCodes
          countryCodeEditable={true}
          preferredCountries={['us','gb','ca','au','in']}
          inputClass="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          containerClass="w-full"
        />
      </motion.div>

      {/* Company Name */}
      <motion.div className="relative" custom={4} variants={fadeUpVariant}>
        <input
          type="text"
          name="company_name"
          placeholder="Company Name"
          value={form.company_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Address */}
      <motion.div className="relative" custom={5} variants={fadeUpVariant}>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
        custom={6}
        variants={fadeUpVariant}
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          'Create Account'
        )}
      </motion.button>
    </motion.form>
  );
}