"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { UserCircle, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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

export default function ProfileDropdown() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ZiinaPlan>({
    plan: "free",
    propertyLimit: 1,
    status: "none",
  });

  // Load profile picture
  useEffect(() => {
    if (!isLoaded || !user) return;

    const loadProfilePic = async () => {
      const { data: realtor } = await supabase
        .from("realtors")
        .select("profile_pic")
        .eq("id", user.id)
        .single();

      if (realtor?.profile_pic) {
        setProfilePic(realtor.profile_pic);
        return;
      }

      const { data: tenant } = await supabase
        .from("tenants")
        .select("profile_pic")
        .eq("id", user.id)
        .single();

      if (tenant?.profile_pic) setProfilePic(tenant.profile_pic);
    };

    loadProfilePic();
  }, [isLoaded, user]);

  // Fetch current plan
  useEffect(() => {
    if (!user) return;

    const fetchZiinaPlan = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch Ziina plan");
        const data = await res.json();
        setCurrentPlan({
          plan: data.plan ?? "free",
          propertyLimit: data.propertyLimit ?? 1,
          status: data.status ?? "none",
        });
      } catch (err) {
        console.error("Failed to load Ziina plan:", err);
      }
    };

    fetchZiinaPlan();
  }, [user]);

  // Upload profile pic
  const uploadProfilePic = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setLoading(true);

      const filePath = `profile-pics/${user.id}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      await supabase.from("realtors").update({ profile_pic: publicUrl }).eq("id", user.id);
      await supabase.from("tenants").update({ profile_pic: publicUrl }).eq("id", user.id);

      setProfilePic(publicUrl);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  // Delete profile pic
  const deleteProfilePic = async () => {
    try {
      if (!user || !profilePic) return;

      const fileName = profilePic.split("/").pop();
      if (fileName) {
        await supabase.storage.from("documents").remove([`profile-pics/${fileName}`]);
      }

      await supabase.from("realtors").update({ profile_pic: null }).eq("id", user.id);
      await supabase.from("tenants").update({ profile_pic: null }).eq("id", user.id);

      setProfilePic(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete profile picture.");
    }
  };

  // Change plan
  const handleChangePlan = async (planId: string) => {
    if (!user) return;

    try {
      const res = await fetch("/api/ziina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan: planId }),
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to create Ziina payment intent:", err);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm("Are you sure? This will permanently delete your account.")) return;

    try {
      await supabase.from("realtors").delete().eq("id", user.id);
      await supabase.from("tenants").delete().eq("id", user.id);
      await signOut();
    } catch (err) {
      console.error("Delete account failed", err);
      alert("Failed to delete account.");
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-gray-700 text-white rounded-md max-w-sm mx-auto shadow-md">
      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="w-14 h-14 sm:w-16 sm:h-16 text-gray-100" />
        )}
        <div className="flex flex-col gap-1 sm:gap-2 text-center sm:text-left w-full">
          <label className="cursor-pointer text-sm sm:text-base text-blue-400 hover:underline">
            {loading ? "Uploading..." : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={uploadProfilePic}
              className="hidden"
              disabled={loading}
            />
          </label>
          {profilePic && (
            <button
              onClick={deleteProfilePic}
              className="flex items-center justify-center sm:justify-start gap-1 text-red-400 text-sm hover:underline"
            >
              <Trash2 className="w-4 h-4" /> Delete Photo
            </button>
          )}
        </div>
      </div>

      {/* Manage Account Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full">Manage Account</Button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-xs p-4 space-y-3 sm:space-y-4 overflow-auto">
          <div>
            <p className="font-semibold text-blue-400 text-sm sm:text-base">Email:</p>
            <p className="text-xs sm:text-sm truncate">{user.emailAddresses[0]?.emailAddress}</p>
          </div>

          <div>
            <p className="font-semibold text-blue-400 text-sm sm:text-base">Current Plan:</p>
            <p className="text-xs sm:text-sm capitalize">{currentPlan.plan}</p>
          </div>

          <div>
            <p className="font-semibold text-blue-400 text-sm sm:text-base">Property Limit:</p>
            <p className="text-xs sm:text-sm">
              {currentPlan.propertyLimit === null ? "Unlimited" : currentPlan.propertyLimit}
            </p>
          </div>

          <div>
            <p className="font-semibold text-blue-400 text-sm sm:text-base">Change Plan:</p>
            <Select onValueChange={handleChangePlan} defaultValue={currentPlan.plan}>
              <SelectTrigger>
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((plan) => (
                  <SelectItem
                    key={plan.id}
                    value={plan.id}
                    disabled={plan.id === currentPlan.plan}
                  >
                    {plan.name} – {plan.propertyLimit === null ? "Unlimited" : plan.propertyLimit                    } Properties
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="w-full mt-2 text-sm sm:text-base"
          >
            Delete Account
          </Button>

          <Button
            variant="outline"
            onClick={() => signOut()}
            className="w-full text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}