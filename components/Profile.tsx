'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  UserCircle,
  Trash2,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface ZiinaPlan {
  plan: string;
  propertyLimit: number | null;
  status: string;
}

const PLAN_OPTIONS = [
  { id: "free", name: "Free", propertyLimit: 1 },
  { id: "basic", name: "Basic", propertyLimit: 10 },
  { id: "pro", name: "Pro", propertyLimit: 20 },
  { id: "premium", name: "Premium", propertyLimit: null },
];

export default function ProfileSidebar() {
  const [user, setUser] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRealtor, setIsRealtor] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  const [currentPlan, setCurrentPlan] = useState<ZiinaPlan>({
    plan: "free",
    propertyLimit: 1,
    status: "none",
  });

  const isSubscriber = isRealtor || isCompany;

  // --------------------------
  // GET SUPABASE USER + NAME + PROFILE PIC
  // --------------------------
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 1️⃣ Realtor
      const { data: realtor } = await supabase
        .from("realtors")
        .select("profile_pic, full_name")
        .eq("id", user.id)
        .single();
      if (realtor) {
        setIsRealtor(true);
        setProfilePic(realtor.profile_pic || null);
        setDisplayName(realtor.full_name || "User");
        return;
      }

      // 2️⃣ Company
      const { data: company } = await supabase
        .from("companies")
        .select("profile_pic, name")
        .eq("id", user.id)
        .single();
      if (company) {
        setIsCompany(true);
        setProfilePic(company.profile_pic || null);
        setDisplayName(company.name || "User"); // ⚡ Use name column here
        return;
      }

      // 3️⃣ Tenant
      const { data: tenant } = await supabase
        .from("tenants")
        .select("profile_pic, full_name")
        .eq("id", user.id)
        .single();
      if (tenant) {
        setProfilePic(tenant.profile_pic || null);
        setDisplayName(tenant.full_name || "User");
        return;
      }
    };

    fetchUser();
  }, []);

  // --------------------------
  // FETCH PLAN (REALTOR/COMPANY ONLY)
  // --------------------------
  useEffect(() => {
    if (!user || !isSubscriber) return;

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`);
        const data = await res.json();

        setCurrentPlan({
          plan: data.plan ?? "free",
          propertyLimit: data.propertyLimit ?? 1,
          status: data.status ?? "none",
        });
      } catch (err) {
        console.error("Failed to load plan", err);
      }
    };

    fetchPlan();
  }, [user, isSubscriber]);

  // --------------------------
  // UPLOAD PROFILE PIC
  // --------------------------
  const uploadProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setLoading(true);

      const safeFileName = file.name.replace(/\s+/g, "-");
      const filePath = `profile-pic/${user.id}-${safeFileName}`;

      const { error } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      const table = isRealtor
        ? "realtors"
        : isCompany
        ? "companies"
        : "tenants";

      await supabase.from(table).update({ profile_pic: publicUrl }).eq("id", user.id);

      setProfilePic(publicUrl);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // DELETE PROFILE PIC
  // --------------------------
  const deleteProfilePic = async () => {
    try {
      if (!user || !profilePic) return;

      const fileName = profilePic.split("/").pop();
      if (fileName)
        await supabase.storage
          .from("documents")
          .remove([`profile-pic/${fileName}`]);

      const table = isRealtor
        ? "realtors"
        : isCompany
        ? "companies"
        : "tenants";

      await supabase.from(table).update({ profile_pic: null }).eq("id", user.id);

      setProfilePic(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // --------------------------
  // DELETE ACCOUNT
  // --------------------------
  const deleteAccount = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete your account?")) return;

    await supabase.from("realtors").delete().eq("id", user.id);
    await supabase.from("tenants").delete().eq("id", user.id);
    await supabase.from("companies").delete().eq("id", user.id);

    await supabase.auth.signOut();
  };

  // --------------------------
  // SIGN OUT
  // --------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  return (
    <div className="bg-gray-100 text-[#1836b2] w-full p-4 rounded-md">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full hover:bg-gray-200 p-3 rounded-md"
      >
        <div className="flex items-center gap-3">
          {profilePic ? (
            <img
              src={profilePic}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-12 h-12 text-[#1836b2]" />
          )}
          <span className="font-semibold text-lg">{displayName}</span>
        </div>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mt-4 space-y-4"
          >
            {/* Plan (only for Realtors/Companies) */}
            {isSubscriber && (
              <div className="text-sm">
                <p className="font-semibold">Plan:</p>
                <p className="capitalize">{currentPlan.plan}</p>

                <Select
                  onValueChange={(value) =>
                    fetch("/api/ziina", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id, plan: value }),
                    })
                  }
                  defaultValue={currentPlan.plan}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_OPTIONS.map((plan) => (
                      <SelectItem
                        key={plan.id}
                        value={plan.id}
                        disabled={plan.id === currentPlan.plan}
                      >
                        {plan.name} –{" "}
                        {plan.propertyLimit ?? "Unlimited"} Properties
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Upload Photo */}
            <div>
              <label className="font-semibold cursor-pointer hover:underline">
                {loading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadProfilePic}
                  disabled={loading}
                />
              </label>

              {profilePic && (
                <button
                  onClick={deleteProfilePic}
                  className="flex items-center gap-1 text-red-500 hover:underline mt-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete Photo
                </button>
              )}
            </div>

            {/* Delete Account */}
            <Button
              variant="destructive"
              onClick={deleteAccount}
              className="w-full bg-red-500 text-white"
            >
              Delete Account
            </Button>

            {/* Log Out */}
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}