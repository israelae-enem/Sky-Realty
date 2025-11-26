'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Interface for Realtor
interface Realtor {
  id: string;
  company_name: string;
  phone_number: string;
  email: string;
  address: string;
  profile_pic?: string | null;
}

// Interface for Company
interface Company {
  id: string;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  profile_pic?: string | null;
}

interface RealtorDetailClientProps {
  realtorId?: string | null;
  companyId?: string | null;
}

export default function RealtorDetailClient({ realtorId, companyId }: RealtorDetailClientProps) {
  const [realtor, setRealtor] = useState<Realtor | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (realtorId) {
          const { data, error } = await supabase
            .from('realtors')
            .select('id, company_name, phone_number, email, address, profile_pic')
            .eq('id', realtorId)
            .single();
          if (error) throw error;
          setRealtor(data);
        } else if (companyId) {
          const { data, error } = await supabase
            .from('companies')
            .select('id, name, contact_email, phone, address, profile_pic')
            .eq('id', companyId)
            .single();
          if (error) throw error;
          setCompany(data);
        }
      } catch (err) {
        console.error('Failed to fetch realtor/company:', err);
        setRealtor(null);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [realtorId, companyId]);

  if (loading) return <p>Loading contact info...</p>;
  if (!realtor && !company) return <p>No contact info available</p>;

  return (
    <div className="border-t border-gray-200 pt-4 mt-6">
      <h2 className="text-xl font-semibold mb-2">Contact Info</h2>

      {realtor && (
        <div className="flex items-center gap-4">
          {realtor.profile_pic ? (
            <img
              src={realtor.profile_pic}
              alt={realtor.company_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              N/A
            </div>
          )}
          <div>
            <p className="font-semibold">{realtor.company_name}</p>
            <p className="text-gray-700">Phone: {realtor.phone_number}</p>
            <p className="text-gray-700">Address: {realtor.address}</p>
            <p className="text-gray-700"> Email: {realtor.email}</p>

          </div>
        </div>
      )}

      {company && (
        <div className="flex items-center gap-4">
          {company.profile_pic ? (
            <img
              src={company.profile_pic}
              alt={company.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              N/A
            </div>
          )}
          <div>
            <p className="font-semibold">{company.name}</p>
            <p className="text-gray-700">Email: {company.contact_email}</p>
            <p className="text-gray-700">Phone: {company.phone}</p>
            <p className="text-gray-700">Address: {company.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}