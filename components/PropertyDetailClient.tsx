"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RealtorDetailClient from "./RealtorDetailClient";
import LeadForm from "./forms/LeadForm";

interface Property {
  id: string;
  title: string;
  address?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  image_urls: string[] | string;

  // NEW FIELDS
  type?: string;
  listing_category?: string;
  neighborhood?: string;
  community_id?: string | null;
  subcommunity?: string | null;
  country?: string;
  status?: string;
  price?: number;
  price_frequency?: string;
  amenities?: string[];
  is_furnished?: boolean;
  video_360_url?: string;
  payment_plan?: {
    has_plan: boolean;
    plan_name?: string;
    installments?: number | null;
    down_payment?: number | null;
    notes?: string | null;
  } | null;
  completion_date?: string | null;
  distance_to_metro_km?: number | null;
  latitude?: number | null;
  longitude?: number | null;

  realtor_id?: string | null;
  company_id?: string | null;
}

interface PropertyDetailClientProps {
  propertyId: string;
}

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
  const [communityName, setCommunityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();

        if (error) throw error;

        setProperty(data);

        // If the property has a community, load it
        if (data?.community_id) {
          const { data: com } = await supabase
            .from("communities")
            .select("name")
            .eq("id", data.community_id)
            .single();

          setCommunityName(com?.name || null);
        }
      } catch (err) {
        console.error("Failed to fetch property:", err);
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
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">

      {/* IMAGES GRID */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`image-${idx}`}
              className="w-full h-64 object-cover rounded-lg shadow"
            />
          ))}
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-[#302cfc] mb-2">
          {property.title}
        </h1>
        <p className="text-gray-600 mb-1">{property.address}</p>

        {property.neighborhood && (
          <p className="text-gray-700">
            <strong>Neighborhood:</strong> {property.neighborhood}
          </p>
        )}

        {(communityName || property.subcommunity) && (
          <p className="text-gray-700">
            <strong>Community:</strong>{" "}
            {communityName || "—"} {property.subcommunity ? `• ${property.subcommunity}` : ""}
          </p>
        )}
      </div>

      {/* QUICK SPECS */}
      <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <p><strong>Type:</strong> {property.type}</p>
        <p><strong>Category:</strong> {property.listing_category}</p>
        <p><strong>Status:</strong> {property.status}</p>
        <p><strong>Price:</strong> AED {property.price?.toLocaleString()}</p>
        <p><strong>Frequency:</strong> {property.price_frequency}</p>
        <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
        <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
        <p><strong>Size:</strong> {property.size} sq ft</p>
        {property.distance_to_metro_km && (
          <p>
            <strong>Metro:</strong> {property.distance_to_metro_km} km
          </p>
        )}
      </div>

      {/* AMENITIES */}
      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a) => (
              <span
                key={a}
                className="px-3 py-1 bg-[#302cfc] text-white rounded-full text-sm"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FURNISHED */}
      <div>
        <strong>Furnished:</strong>{' '}
        {property.is_furnished ? "Yes" : "No"}
      </div>

      {/* PAYMENT PLAN */}
      {property.payment_plan?.has_plan && (
        <div className="bg-[#f1f4ff] p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Payment Plan</h2>
          <p><strong>Plan:</strong> {property.payment_plan.plan_name}</p>
          <p><strong>Installments:</strong> {property.payment_plan.installments}</p>
          <p><strong>Down Payment:</strong> AED {property.payment_plan.down_payment}</p>
          <p><strong>Notes:</strong> {property.payment_plan.notes}</p>
        </div>
      )}

      {/* COMPLETION DATE */}
      {property.completion_date && (
        <p>
          <strong>Completion:</strong> {property.completion_date}
        </p>
      )}

      {/* DESCRIPTION */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700 leading-relaxed">{property.description}</p>
      </div>

      {/* 360 VIDEO */}
      {property.video_360_url && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Virtual Tour</h2>
          <iframe
            src={property.video_360_url}
            className="w-full h-80 rounded-lg"
            allowFullScreen
          />
        </div>
      )}

      {/* Agent / Company Info */}
      <RealtorDetailClient
        realtorId={property.realtor_id}
        companyId={property.company_id}
      />

      <LeadForm
      realtorId={property.realtor_id}
      companyId={property.company_id}
       />
    </div>
  );
}