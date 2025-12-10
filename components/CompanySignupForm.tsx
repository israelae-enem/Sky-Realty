'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import { Mail, Phone, MapPin, Lock, Briefcase } from 'lucide-react';

interface FormState {
  email: string;
  password: string;
  company_name: string;
  phone_number: string;
  address: string;
  country: string;
}

export default function CompanySignUpForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    company_name: '',
    phone_number: '',
    address: '',
    country: '',
  });

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePic(file);
  };

  const handlePhoneChange = (value: string) => {
    if (!value) return setForm({ ...form, phone_number: '' });
    const phoneE164 = '+' + value.replace(/\D/g, '');
    setForm({ ...form, phone_number: phoneE164 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!form.email || !form.password || !form.company_name || !form.phone_number || !form.address || !form.country) {
        setErrorMsg('Please fill in all fields.');
        setLoading(false);
        return;
      }

      // 1️⃣ Create company account in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user?.id) throw new Error('Failed to get user ID after signup');

      const companyId = signUpData.user.id;

      // 2️⃣ Upload profile picture if exists
      let profileUrl: string | null = null;
      if (profilePic) {
        const filePath = `company-profile/${companyId}-${profilePic.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, profilePic, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        profileUrl = data.publicUrl;
      }

      // 3️⃣ Insert company record
      const { error: insertError } = await supabase.from('companies').insert([
        {
          id: companyId,
          company_name: form.company_name,
          email: form.email,
          phone_number: form.phone_number,
          address: form.address,
          country: form.country,
          profile_pic: profileUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // 4️⃣ Automatically sign in the company
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      toast.success('✅ Company account created!');
      router.push(`/company/${companyId}/dashboard`);
    } catch (err: any) {
      console.error('Company signup error:', err);
      setErrorMsg(err?.message || 'Failed to create company account');
      toast.error(err?.message || 'Failed to create company account');
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

  const formElements = [
     {
      name: 'email',
      type: 'text',
      placeholder: 'Email',
      icon: <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />,
    },
     {
      name: 'password',
      type: 'text',
      placeholder: 'Password',
      icon: <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />,
    },
    {
      name: 'company_name',
      type: 'text',
      placeholder: 'Company Name',
      icon: <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />,
    },
    {
      name: 'address',
      type: 'text',
      placeholder: 'Address',
      icon: <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />,
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

      <motion.div className="relative" custom={formElements.length} variants={fadeUpVariant}>
        <Phone className="absolute left-3 top-8 h-5 w-5 text-gray-400 z-10" />
        <PhoneInput
          country={'us'}
          value={form.phone_number.replace('+', '')}
          onChange={handlePhoneChange}
          enableAreaCodes
          countryCodeEditable={true}
          preferredCountries={['us', 'gb', 'ca', 'au', 'in']}
          inputClass="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          containerClass="w-full"
        />
      </motion.div>

      <motion.div className="relative" custom={formElements.length + 1} variants={fadeUpVariant}>
        <label className="cursor-pointer text-blue-600 hover:underline">
          Upload Logo
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </motion.div>

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
        custom={formElements.length + 2}
        variants={fadeUpVariant}
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          'Complete Company Onboarding'
        )}
      </motion.button>
    </motion.form>
  );
}