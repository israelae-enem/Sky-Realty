'use client';

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RealtorSignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    company_name: "",
    address: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      // 1️⃣ Create the auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // 2️⃣ Create a Firestore user profile with role = realtor
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number,
        company_name: form.company_name,
        address: form.address,
        country: form.country,
        role: "realtor",
        created_at: serverTimestamp(),
      }); 

      setMessage("✅ Signed up successfully!");
      console.log("✅ Realtor account created & profile saved!");

      // 3️⃣ Redirect to realtor dashboard
      setTimeout(() => {
        router.push("/subscription");
      }, 1000);

    } catch (error: any) {
      console.error("❌ Signup error:", error);
      setErrorMsg(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10 mb-10">
      {/* Full Name */}
      <div className="relative">
        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none"
          required
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none"
          required
        />
      </div>

      {/* Phone Number */}
      <div className="relative">
        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none"
          required
        />
      </div>

      <input
        type="text"
        name="company_name"
        placeholder="Company Name"
        value={form.company_name}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md focus:outline-none"
        required
      />

      <input
        type="text"
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md focus:outline-none"
        required
      />

      <input
        type="text"
        name="country"
        placeholder="Country"
        value={form.country}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md focus:outline-none"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md focus:outline-none"
        required
      />

      {/* Error & Success Messages */}
      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
      {message && <p className="text-green-600 text-sm">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#302cfc] text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center"
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          "Sign Up as Realtor"
        )}
      </button>
    </form>
  );
}