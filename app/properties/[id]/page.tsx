"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Property {
  id: string;
  title: string;
  address: string;
  description: string;
  image_urls: string[];
}

interface Props {
  params: { id: string };
}

export default function PropertyDetail({ params }: Props) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", params.id)
          .single();
        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (!property) return <p>Property not found</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#302cfc] mb-4">{property.title}</h1>
      <p className="text-gray-600 mb-4">{property.address}</p>
      <p className="text-gray-700 mb-6">{property.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {property.image_urls?.map((img, idx) => {
          const { data: imageData } = supabase.storage
            .from("property-images")
            .getPublicUrl(img);
          return (
            <img
              key={idx}
              src={imageData.publicUrl}
              alt={`${property.title} image ${idx + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow"
            />
          );
        })}
      </div>
    </div>
  );
}