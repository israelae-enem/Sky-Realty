'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';

export default function CompanySignUpForm() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({
    company_name: '',
    phone_number: '',
    address: '',
    country: '',
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if company already exists
  useEffect(() => {
    const checkCompany = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existing) {
        toast.success('Welcome back! Redirecting to your dashboard...');
        router.push(`/company/${user.id}/dashboard`);
      } else {
        setLoading(false);
      }
    };

    checkCompany();
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePic(file);
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
      // Upload profile picture if exists
      let profileUrl: string | null = null;
      if (profilePic) {
        const filePath = `company-profile/${user.id}-${profilePic.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, profilePic, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        profileUrl = data.publicUrl;
      }

      // Insert company record
      const { error } = await supabase.from('companies').insert([
        {
          id: user.id,
          company_name: form.company_name,
          email: user.primaryEmailAddress?.emailAddress || '',
          phone_number: form.phone_number,
          address: form.address,
          country: form.country,
          profile_pic: profileUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('✅ Company profile created!');
      router.push(`/company/${user.id}/dashboard`);
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
      {/* Company Name, Address, Country */}
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

      {/* Phone Number Input using react-phone-input-2 */}
      <motion.div
        className="relative"
        custom={formElements.length}
        variants={fadeUpVariant}
      >
        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
        <PhoneInput
          country={'us'} // default country ISO code lowercase
          value={form.phone_number.replace('+', '')} // remove + for component
          onChange={(value, countryData) => {
            if (!value) return setForm({ ...form, phone_number: '' });
            const phoneE164 = '+' + value.replace(/\D/g, '');
            setForm({ ...form, phone_number: phoneE164 });
          }}
          enableAreaCodes
          countryCodeEditable={false}
          preferredCountries={['us', 'gb', 'ca', 'au', 'in']}
          inputClass="pl-10 w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          containerClass="w-full"
        />
      </motion.div>

      {/* Email readonly */}
      <motion.div
        className="relative"
        custom={formElements.length + 1}
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

      {/* Profile pic upload */}
      <motion.div
        className="relative"
        custom={formElements.length + 2}
        variants={fadeUpVariant}
      >
        <label className="cursor-pointer text-blue-600 hover:underline">
          Upload Profile Picture
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </motion.div>

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
        custom={formElements.length + 3}
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