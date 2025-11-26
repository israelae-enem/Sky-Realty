"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RealtorDetailClient from './RealtorDetailClient';

interface Property {
  id: string;
  title: string;
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  image_urls: string[] | string;
  realtor_id?: string | null;
  company_id?: string | null;
}

interface PropertyDetailClientProps {
  propertyId: string;
}

// ✅ Parse images whether string or array
const parseImages = (urls: any): string[] => {
  try {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;

    const parsed = JSON.parse(urls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) throw error;

        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) return <p>Loading property...</p>;
  if (!property) return <p>Property not found</p>;

  const images = parseImages(property.image_urls);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      
      {/* FIXED IMAGES */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${property.title} image ${idx + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow"
            />
          ))}
        </div>
      )}


      <div>
     <h1 className="text-3xl font-bold text-[#302cfc] mb-2">{property.title}</h1>

      <p className="text-gray-600 mb-2">{property.address}</p>
      <p className="text-gray-700 mb-4">{property.description}</p>
      <p className="text-gray-700 mb-2">Bedrooms: {property.bedrooms}</p>
      <p className="text-gray-700 mb-2">Bathrooms: {property.bathrooms}</p>
      <p className="text-gray-700 mb-4">Size: {property.size} sq ft</p>
      </div>

      {/* Agent / Company Info */}
      <RealtorDetailClient
        realtorId={property.realtor_id}
        companyId={property.company_id}
      />
    </div>
  );
}