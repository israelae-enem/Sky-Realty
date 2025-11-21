'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Property {
  id: string;
  title: string;
  address: string;
  description: string;
  image_urls: string[];
  realtor_id?: string | null;
  company_id?: string | null;
}

interface Agent {
  full_name: string;
  email: string;
  phone: string;
  profile_pic?: string | null;
}

interface PropertyDetailClientProps {
  propertyId: string;
}

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyAndAgent = async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch property
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (propertyError) throw propertyError;
        if (!propertyData) {
          setProperty(null);
          return;
        }
        setProperty(propertyData);

        // 2️⃣ Fetch agent info
        let agentData = null;

        if (propertyData.realtor_id) {
          const { data, error } = await supabase
            .from('realtors')
            .select('full_name, email, phone, profile_pic')
            .eq('id', propertyData.realtor_id)
            .single();

          if (!error) agentData = data;
        } else if (propertyData.company_id) {
          const { data, error } = await supabase
            .from('companies')
            .select('full_name, email, phone, profile_pic')
            .eq('id', propertyData.company_id)
            .single();

          if (!error) agentData = data;
        }

        setAgent(agentData);
      } catch (err) {
        console.error('Failed to fetch property or agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndAgent();
  }, [propertyId]);

  if (loading) return <p>Loading...</p>;
  if (!property) return <p>Property not found</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#302cfc] mb-4">{property.title}</h1>
      <p className="text-gray-600 mb-2">{property.address}</p>
      <p className="text-gray-700 mb-6">{property.description}</p>

      {/* Images */}
      {/* Images */}
{Array.isArray(property.image_urls) && property.image_urls.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    {property.image_urls.map((img, idx) => {
      // Get public URL
      const { data } = supabase.storage.from('property-images').getPublicUrl(img);
      return (
        <img
          key={idx}
          src={data?.publicUrl || ''}
          alt={`${property.title} image ${idx + 1}`}
          className="w-full h-64 object-cover rounded-lg shadow"
        />
      );
    })}
  </div>
)}

      {/* Agent Info */}
      {agent && (
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-xl font-semibold mb-2">Contact Agent</h2>
          <div className="flex items-center gap-4">
            {agent.profile_pic ? (
              <img
                src={agent.profile_pic}
                alt={agent.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                N/A
              </div>
            )}
            <div>
              <p className="font-semibold">{agent.full_name}</p>
              <p className="text-gray-700">Email: {agent.email}</p>
              <p className="text-gray-700">Phone: {agent.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}