"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // ❌ Wrong email or password OR user doesn't exist
    if (error) {
      toast.error("No account found. Please sign up to continue.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      toast.error("No account found. Please sign up to continue.");
      setLoading(false);
      return;
    }

    const uid = data.user.id;

    // Check role tables
    const { data: realtor } = await supabase
      .from("realtors")
      .select("id")
      .eq("id", uid)
      .maybeSingle();

    if (realtor) {
      router.push(`/realtor/${uid}/dashboard`);
      return;
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", uid)
      .maybeSingle();

    if (tenant) {
      router.push(`/tenant/${uid}/dashboard`);
      return;
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("id", uid)
      .maybeSingle();

    if (company) {
      router.push(`/company/${uid}/dashboard`);
      return;
    }

    // No role
    toast.error("Account found but no role assigned.");
    setLoading(false);
  };

  const handleRoleSelect = (role: string) => {
    if (role === "realtor") router.push("/realtor");
    if (role === "tenant") router.push("/tenant");
    if (role === "company") router.push("/company");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
        <form onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <label className="block mb-2">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>

          <label className="block mb-4">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#59fcf7] text-[#1836b2] py-2 rounded font-semibold hover:bg-gray-200 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Sign up dropdown */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowSignupDropdown((p) => !p)}
            className="text-blue-600 font-medium hover:underline"
          >
            Don’t have an account? Sign up
          </button>

          {showSignupDropdown && (
            <div className="mt-3 bg-gray-100 border rounded p-3 space-y-2">
              <p className="text-sm text-gray-600 mb-2">Choose your role:</p>

              <button
                onClick={() => handleRoleSelect("realtor")}
                className="block w-full text-left p-2 hover:bg-gray-200 rounded"
              >
                Realtor
              </button>

              <button
                onClick={() => handleRoleSelect("tenant")}
                className="block w-full text-left p-2 hover:bg-gray-200 rounded"
              >
                Tenant
              </button>

              <button
                onClick={() => handleRoleSelect("company")}
                className="block w-full text-left p-2 hover:bg-gray-200 rounded"
              >
                Company
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;