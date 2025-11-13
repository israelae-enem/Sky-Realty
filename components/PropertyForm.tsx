"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function PropertyForm() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    type: "",
    price: "",
    description: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login as a Realtor first!");
      return;
    }

    setLoading(true);

    try {
      // Upload images to Supabase Storage
      const uploadedUrls: string[] = [];

      for (const file of images) {
        const filePath = `properties/${user.id}/${Date.now()}_${file.name}`;
        const { error, data } = await supabase.storage
          .from("property-images")
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Insert into Supabase
      const { error: insertError } = await supabase.from("properties").insert([
        {
          ...formData,
          price: formData.price ? Number(formData.price) : null,
          realtor_id: user.id,
          image_url: uploadedUrls,
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({ title: "", address: "", type: "", price: "", description: "" });
      setImages([]);
    } catch (err: any) {
      console.error("Upload failed:", err.message);
      alert("Something went wrong while uploading property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10">
      <h2 className="text-3xl font-bold text-[#1836b2] mb-6 text-center">
        Add New Property
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-md"
            placeholder="e.g., Modern Apartment"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-md"
            placeholder="e.g., 123 Palm Street, Dubai"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Type</label>
            <input
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              placeholder="e.g., Apartment"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Price (USD)</label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              placeholder="e.g., 1500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder="Write something about this property..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Upload Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        </div>

        {/* Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images.map((img, i) => (
              <Image
                key={i}
                src={URL.createObjectURL(img)}
                alt="preview"
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#1836b2] text-white font-semibold py-3 px-6 rounded-full w-full hover:bg-blue-700 transition"
        >
          {loading ? "Uploading..." : "Submit Property"}
        </button>

        {success && (
          <p className="text-green-600 text-center font-semibold mt-4">
            ✅ Property added successfully!
          </p>
        )}
      </form>
    </section>
  );
}