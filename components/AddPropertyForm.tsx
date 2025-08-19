'use client';

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddPropertyForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    address: "",
    price: "",
    description: "",
    status: "Vacant",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to add a property.");

      await addDoc(collection(db, "properties"), {
        ...form,
        price: parseFloat(form.price),
        realtorId: user.uid,
        createdAt: serverTimestamp(),
      }); 

      alert("Property added successfully!");
      router.push("/realtordashboard");

    } catch (error: any) {
      setErrorMsg(error.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      <input
        type="text"
        name="title"
        placeholder="Property Title"
        value={form.title}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded-md"
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded-md"
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded-md"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md"
      ></textarea>
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md"
      >
        <option value="Vacant">Vacant</option>
        <option value="Occupied">Occupied</option>
        <option value="Pending">Pending</option>
      </select>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Adding..." : "Add Property"}
      </button>
    </form>
  );
}