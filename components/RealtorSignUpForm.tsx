'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';
import { User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function RealtorSignUpForm() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    company_name: '',
    address: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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
        setLoading(false);
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
      router.push(`/realtor/${user.id}/dashboard`);
;
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setErrorMsg(err?.message || 'Failed to complete onboarding');
      toast.error(err?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-8 text-center text-gray-700">Loading...</p>;

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const formElements = [
    {
      name: 'full_name',
      type: 'text',
      placeholder: 'Full Name',
      icon: <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />,
    },
    {
      name: 'phone_number',
      type: 'tel',
      placeholder: 'Phone Number',
      icon: <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />,
    },
    {
      name: 'company_name',
      type: 'text',
      placeholder: 'Company Name',
    },
    {
      name: 'address',
      type: 'text',
      placeholder: 'Address',
    },
    {
      name: 'country',
      type: 'text',
      placeholder: 'Country',
    },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto text-gray-800 mt-10 mb-10 bg-white p-8 rounded-xl shadow-lg"
      initial="hidden"
      animate="visible"
    >
      {/* Full Name + inputs */}
      {formElements.map((field, idx) => (
        <motion.div
          key={field.name}
          className="relative"
          custom={idx}
          variants={fadeUpVariant}
        >
          {field.icon && field.icon}
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={(form as any)[field.name]}
            onChange={handleChange}
            className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </motion.div>
      ))}

      {/* Email readonly */}
      <motion.div
        className="relative"
        custom={formElements.length}
        variants={fadeUpVariant}
      >
        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="email"
          value={user?.primaryEmailAddress?.emailAddress || ''}
          disabled
          className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </motion.div>

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
        custom={formElements.length + 1}
        variants={fadeUpVariant}
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          'Complete Realtor Onboarding'
        )}
      </motion.button>
    </motion.form>
  );
}