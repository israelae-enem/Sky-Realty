'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function RealtorSignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    company_name: '',
    address: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1️⃣ Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (signUpError) throw signUpError;

      // 2️⃣ Ensure session exists by signing in immediately
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) throw signInError;

      const user = sessionData.user;
      if (!user) throw new Error('Failed to get user session');

      // 3️⃣ Insert realtor profile into table
      const { error: profileError } = await supabase.from('realtors').insert([
        {
          user_id: user.id,
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number,
          company_name: form.company_name,
          address: form.address,
          country: form.country,
          created_at: new Date().toISOString(),
        },
      ]);
      if (profileError) throw profileError;

      toast.success('✅ Realtor account created!');
      router.push('/subscription');
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to sign up');
      toast.error(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10 mb-10">
      <div className="relative">
        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          className="pl-10 w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
          required
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="pl-10 w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
          required
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          className="pl-10 w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
          required
        />
      </div>

      <input
        type="text"
        name="company_name"
        placeholder="Company Name"
        value={form.company_name}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
        required
      />
      <input
        type="text"
        name="country"
        placeholder="Country"
        value={form.country}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md bg-black text-white focus:outline-none"
        required
      />

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          'Sign Up as Realtor'
        )}
      </button>
    </form>
  );
}