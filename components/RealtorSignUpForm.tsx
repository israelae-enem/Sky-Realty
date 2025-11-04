'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';
import { User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function RealtorSignUpForm() {
  const router = useRouter();
  const { user } = useUser(); // Clerk user
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    company_name: '',
    address: '',
    country: '',
  });
  const [loading, setLoading] = useState(true); // start in loading state until we check
  const [errorMsg, setErrorMsg] = useState('');

  // 🚀 Auto-skip onboarding if realtor already exists
  useEffect(() => {
    const checkRealtor = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from('realtors')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existing) {
        toast.success('Welcome back! Redirecting to your dashboard...');
        router.push(`/realtor/${user.id}/dashboard`);
      } else {
        setLoading(false); // show form
      }
    };

    checkRealtor();
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to complete onboarding.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('realtors').insert([
        {
          id: user.id,
          full_name: form.full_name,
          email: user.primaryEmailAddress?.emailAddress || '',
          phone_number: form.phone_number,
          company_name: form.company_name,
          address: form.address,
          country: form.country,
          subscription_plan: null,
          subscription_status: 'inactive',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('✅ Realtor profile created!');
      router.push('/subscription');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setErrorMsg(err?.message || 'Failed to complete onboarding');
      toast.error(err?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-8 text-center text-white">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10 mb-10">
      {/* Full Name */}
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

      {/* Email (readonly) */}
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="email"
          value={user?.primaryEmailAddress?.emailAddress || ''}
          disabled
          className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-700 text-gray-300 cursor-not-allowed"
        />
      </div>

      {/* Phone */}
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

      {/* Company, Address, Country */}
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

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          'Complete Realtor Onboarding'
        )}
      </button>
    </form>
  );
}